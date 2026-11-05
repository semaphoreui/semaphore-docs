---
title: Kubernetes 执行器
description: 为运行器的每个任务在独立的 Kubernetes Pod 中运行，包含服务账号和 RBAC 清单、运行器设置、配置参考和故障排除。
sidebar_custom_props:
  edition: enterprise
---

# Kubernetes 执行器 <FeatureState feature="k8s-executor" />

使用 Kubernetes 执行器时，运行器在命名空间中为每个任务创建一个 Pod，将其日志流式
传输到 Semaphore，并在任务结束时删除该 Pod。运行器可以运行在集群内（推荐），也可以
运行在集群外并使用 kubeconfig。

容器任务如何运行、容器内有什么以及哪些功能不受支持，请参见
[执行器](./#how-a-container-task-runs)。本页介绍 Kubernetes 的设置。

## 开始之前 {#before-you-begin}

- 拥有 Enterprise 许可证的 Semaphore 服务器。
- 部署在集群中的运行器，参见[在 Kubernetes 上安装运行器](/admin-guide/installation/k8s#runner)。
  以下步骤使用其命名空间 `semaphore` 和 Deployment `semaphore-runner`。集群外的运行器参见
  [集群外的运行器](#runner-outside-the-cluster)。
- 有权在该命名空间中创建服务账号和 RBAC 对象的 `kubectl`。
- 集群可以拉取 `semaphoreui/job` 和 `semaphoreui/helper`（或你自己的镜像）。

## 运行器创建的对象 {#what-the-runner-creates}

对于 ID 为 `42` 的任务，运行器在其命名空间中创建：

| 对象 | 名称 | 内容 |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | 初始化容器 `git-clone`（辅助镜像）和容器 `build`（构建镜像），`restartPolicy: Never`。 |
| Secret | `<pod>-ssh-<key id>` | 每个 SSH 密钥一个，挂载在 `/secrets/ssh/<key id>/`。 |
| Secret | `<pod>-vault` | Ansible vault 密码。 |
| Secret | `<pod>-extra-vars` | 包含额外变量的 `values.json`。 |
| Secret | `<pod>-env` | 类型为 *Environment variable* 的变量组机密以及 `SEMAPHORE_JWT`，通过 `envFrom` 注入。 |
| ConfigMap | `<pod>-inventory` | 静态清单。 |

只创建任务需要的对象。它们都带有 `semaphoreui.com/runner=semaphore` 标签；Pod 还带有
`semaphoreui.com/task-id=42`。任务结束时运行器会将它们全部删除，失败或 **Stop** 之后
也是如此。

## 设置 {#set-up}

### 步骤 1. 创建服务账号 {#step-1-create-the-service-accounts}

运行器需要一个服务账号来创建任务 Pod。任务 Pod 使用第二个账号，它没有任何权限，也没有
API 令牌，因此 playbook 无法使用运行器的权限。

```yaml title="semaphore-serviceaccounts.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-runner
  namespace: semaphore
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-job
  namespace: semaphore
automountServiceAccountToken: false
```

### 步骤 2. 为运行器授予权限 {#step-2-grant-the-runner-its-permissions}

以下是执行器发出的全部 API 调用：

```yaml title="semaphore-rbac.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: semaphore-runner
  namespace: semaphore
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["create", "get", "delete"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["create", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: semaphore-runner
  namespace: semaphore
subjects:
  - kind: ServiceAccount
    name: semaphore-runner
    namespace: semaphore
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: semaphore-runner
```

使用 `Role` 而不是 `ClusterRole`：运行器只能操作自己的命名空间。

### 步骤 3. 将运行器切换到 Kubernetes 执行器 {#step-3-switch-the-runner-to-the-kubernetes-executor}

任务 Pod 不设置 `securityContext`，因此强制执行 `restricted` Pod Security 级别的命名空间会拒绝它们。
请允许 `baseline`：

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

为运行器 Pod 指定其服务账号和执行器设置。在运行器 Deployment 的 `spec.template.spec` 中添加：

```yaml title="semaphore-runner.yaml (fragment)"
    spec:
      serviceAccountName: semaphore-runner
      containers:
        - name: runner
          env:
            # ...SEMAPHORE_WEB_ROOT and SEMAPHORE_RUNNER_TOKEN as before
            - name: SEMAPHORE_RUNNER_EXECUTOR_TYPE
              value: k8s
            - name: SEMAPHORE_RUNNER_K8S_NAMESPACE
              value: semaphore
            - name: SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT
              value: semaphore-job
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: semaphoreui/job:latest
```

```bash
kubectl apply -f semaphore-serviceaccounts.yaml -f semaphore-rbac.yaml -f semaphore-runner.yaml
kubectl -n semaphore rollout status deploy/semaphore-runner
```

未设置 `kubeconfig` 时，运行器使用 `semaphore-runner` 的集群内凭据。任务不再在运行器 Pod 中运行，
因此可以降低其 `resources`（例如 CPU `100m`、内存 `256Mi`）。

### 步骤 4. 运行任务 {#step-4-run-a-task}

将模板路由到该运行器并启动任务。观察其 Pod 出现并消失：

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

任务日志显示：

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## 示例 {#examples}

### 集群外的运行器 {#runner-outside-the-cluster}

运行器运行在虚拟机或 Docker 中，通过 kubeconfig 访问 API 服务器。只为该 kubeconfig
授予[步骤 2 中的 Role](#step-2-grant-the-runner-its-permissions)，不要更多：

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "k8s",
      "k8s": {
        "kubeconfig": "/etc/semaphore/kubeconfig",
        "namespace": "semaphore",
        "service_account": "semaphore-job"
      }
    }
  }
}
```

使用 kubeconfig 的当前上下文。

### 来自私有镜像仓库的镜像 {#images-from-a-private-registry}

在命名空间中创建拉取密钥并在 `pull_secrets` 中列出；多个名称用逗号分隔：

```bash
kubectl -n semaphore create secret docker-registry registry-example \
  --docker-server=registry.example.com \
  --docker-username=<user> --docker-password=<password>
```

```yaml
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: registry.example.com/semaphore/job-aws:1.0
            - name: SEMAPHORE_RUNNER_K8S_PULL_SECRETS
              value: registry-example
```

这些密钥会附加到每个任务 Pod，同样适用于构建镜像、辅助镜像和模板的 **Executor image**。

### 任务 Pod 的 CPU 和内存 {#cpu-and-memory-of-task-pods}

执行器不会为任务 Pod 设置 requests 或 limits。请使用 `LimitRange` 为命名空间设置
默认值；它适用于 `git-clone` 和 `build` 容器：

```yaml title="semaphore-limits.yaml"
apiVersion: v1
kind: LimitRange
metadata:
  name: semaphore-task-defaults
  namespace: semaphore
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 250m
        memory: 256Mi
      default:
        cpu: "2"
        memory: 2Gi
```

添加 `ResourceQuota` 以限制该命名空间中所有并行任务可使用的总量。

### 限制任务 Pod 的网络 {#restrict-the-network-of-task-pods}

任务 Pod 带有 `semaphoreui.com/runner=semaphore` 标签，因此 `NetworkPolicy` 可以选中
它们。以下策略只允许 DNS、Git 服务器以及到受管主机的 SSH：

```yaml title="semaphore-netpol.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: semaphore-tasks
  namespace: semaphore
spec:
  podSelector:
    matchLabels:
      semaphoreui.com/runner: semaphore
  policyTypes: ["Ingress", "Egress"]
  egress:
    - ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
    - to:
        - ipBlock: { cidr: 10.20.0.0/16 }   # Git server and managed hosts
      ports:
        - { protocol: TCP, port: 22 }
        - { protocol: TCP, port: 443 }
```

## 配置参考 {#configuration-reference}

所有选项都位于运行器配置的 `runner.executor.k8s` 下。

| 选项 | 环境变量 | 默认值 | 说明 |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | 集群内 | kubeconfig 文件路径。为空：使用运行器 Pod 的服务账号。 |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | 任务 Pod、Secrets 和 ConfigMaps 所在的命名空间。必须已存在。 |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | `build` 容器的镜像。模板的 **Executor image** 会覆盖它。 |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | `git-clone` 初始化容器的镜像。 |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | 任务 Pod 的服务账号。请使用没有权限的账号，参见[步骤 1](#step-1-create-the-service-accounts)。 |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | 任务 Pod 的 `imagePullSecrets`，以逗号分隔。 |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | 运行器读取 Pod 状态的频率。值越小，日志流开始得越早，API 调用也越多。 |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | 任务结束或被停止后删除 Pod 的宽限期。 |

镜像拉取策略遵循 Kubernetes 默认值：`:latest` 使用 `Always`，否则使用 `IfNotPresent`。

## 安全 {#security}

- **运行器最小权限。** [Role](#step-2-grant-the-runner-its-permissions) 限定在命名空间内，
  只列出执行器调用的内容。不要绑定 `cluster-admin`。
- **任务无 API 访问权限。** 使用默认的 `service_account: default` 时，任务 Pod 会获得
  命名空间默认账号的令牌。请使用设置了 `automountServiceAccountToken: false` 的专用账号。
- **Semaphore 专用命名空间。** 运行器无法读取任何内容，但可以在其中创建和删除 Pod 和
  Secrets；不要与其他工作负载共享该命名空间。
- **机密信息**是每个任务独立的 Kubernetes Secrets，以只读方式挂载（环境变量机密通过
  `envFrom` 注入，因此其值不会出现在 Pod 规范中），并随 Pod 一起删除。任务运行期间，
  任何可以读取该命名空间 Secrets 的人都能读取它们；请为 Secrets 启用
  [静态加密](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)。
- **网络。** 使用 [NetworkPolicy](#restrict-the-network-of-task-pods) 限制任务可访问的范围。

## 停止与清理 {#stop-and-clean-up}

UI 中的 **Stop** 会结束日志流，以 `cleanup_grace_seconds` 删除 Pod，然后删除其
Secrets 和 ConfigMaps。

如果运行器在任务期间被终止，任务的对象会留在命名空间中；运行器下次启动时不会回收它们。
在没有任务运行时删除它们：

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## 故障排除 {#troubleshooting}

| 现象 | 原因与解决方法 |
|---|---|
| 运行器日志：`k8s executor is only available in the proprietary build` | 运行器是 Community 构建。请使用 `semaphoreui/runner` 或官方二进制文件。 |
| 运行器日志：`failed to initialise executor provider` 以及 `unable to load in-cluster configuration` | 运行器位于集群外且 `kubeconfig` 为空，或 kubeconfig 路径错误。 |
| 任务：`create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | 缺少 RBAC，或绑定在其他命名空间中。使用 `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner` 检查。 |
| 任务：`create pod ...: namespaces "semaphore" not found` | 请创建命名空间；运行器不会创建它。 |
| 任务：`create pod ...: violates PodSecurity "restricted"` | 为命名空间添加标签 `pod-security.kubernetes.io/enforce: baseline`。 |
| 任务一直处于 **Running** 且没有输出 | Pod 卡在 `Pending`：没有合适的节点、镜像无法拉取（`ImagePullBackOff`），或被配额阻止。运行器会一直等待 Pod 结束。使用 `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` 检查，然后停止该任务。 |
| 任务：`pod ... finished with status Failed` | 克隆或应用失败。上方日志显示 `git-clone` 和 `build` 的输出。 |
| `interpreter python3 not found in image` | 构建镜像缺少应用二进制文件；请设置其他镜像或模板的 **Executor image**。 |
| `No user exists for uid ...`（OpenShift） | 镜像的 `/etc/passwd` 对组不可写。参见[构建自定义镜像](./#build-a-custom-image)。 |

## 相关页面 {#related-pages}

- [执行器](/admin-guide/executors)：容器任务如何运行、镜像、限制。
- [Docker 执行器](./docker)：在 Docker 主机上使用相同的模型。
- [Kubernetes 安装](/admin-guide/installation/k8s)：服务器和运行器 Deployment。
- [执行器镜像](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)：为单个模板使用不同的镜像。
