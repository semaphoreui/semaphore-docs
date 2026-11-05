---
title: 执行器
description: 运行器如何通过本地、Docker 或 Kubernetes 执行器执行任务，容器内运行的内容，以及容器执行器不支持的功能。
---

# 执行器

执行器（Executor）决定**运行器在哪里启动任务进程**。运行器仍然轮询服务器、
接收任务并回传日志；改变的只是 Ansible、Terraform 或 shell 进程运行的位置。

| 执行器 | `runner.executor.type` | 任务运行位置 | 版本 |
|---|---|---|---|
| 本地 | `local`（默认） | 运行器主机上的子进程，使用运行器的文件、工具和 `PATH`。 | Community |
| Docker | `docker` | Docker 守护进程上的新容器，任务结束后删除。 | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Kubernetes 命名空间中的新 Pod，任务结束后删除。 | <FeatureState feature="k8s-executor" /> |

执行器是**运行器**的设置，而不是服务器或模板的设置。Semaphore 服务器本身始终在本地
运行任务；要在容器中运行任务，请启动一个[运行器](/admin-guide/runners)，并通过运行器
标签将模板路由到它。

## 选择执行器 {#choose-an-executor}

| 你的需求 | 使用 |
|---|---|
| 工具安装在一台机器上、需要访问其文件、工作流输出 | 本地 |
| 每个任务一个干净的环境、每个模板不同的工具链，部署在一台或几台主机上 | [Docker](./docker) |
| 任务在集群中调度、使用 Kubernetes RBAC 和 Secrets、无需 Docker socket | [Kubernetes](./kubernetes) |

## 设置执行器 {#set-the-executor}

在运行器配置文件的 `runner` 部分中添加 `executor` 块：

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

或者设置环境变量：

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

每个选项都有对应的环境变量；完整列表见
[Docker](./docker#configuration-reference) 和 [Kubernetes](./kubernetes#configuration-reference)
页面。更改执行器后请重启运行器。

:::info
容器执行器属于运行器的 Pro 构建。请使用 `semaphoreui/runner` 镜像或官方
`semaphore` 二进制文件。`semaphoreui/runner-community` 镜像不包含它们，并会在启动时
记录 `docker executor is only available in the proprietary build`。
:::

## 容器任务如何运行 {#how-a-container-task-runs}

两种容器执行器以相同的方式运行任务：

1. **准备。** 运行器创建共享工作区，并将任务的机密信息（SSH 密钥、vault 密码、
   额外变量、静态清单）放到容器可以读取的位置。
2. **克隆。** 一个短暂的*辅助*（helper）容器将仓库克隆到 `/workspace/repo`
   （对任务分支执行 `git clone --depth 1`）。
3. **构建。** *构建*（build）容器在 `/workspace/repo` 中启动并运行应用：
   `ansible-playbook`、`terraform`/`tofu`/`terragrunt`、`bash`、`python3`、
   `powershell`，或自定义应用的二进制文件。其退出码即为任务结果。
4. **日志。** 两个容器运行时，其输出会实时流式写入任务日志。
5. **清理。** 无论任务成功、失败还是被停止，任务的容器、卷、Secrets 和 ConfigMaps
   都会被删除。

| 步骤 | Docker | Kubernetes |
|---|---|---|
| 工作区 | 命名卷 `semaphore-workspace-<task>-<random>` | Pod 的 `emptyDir` 卷 |
| 机密信息 | 命名卷 `semaphore-secrets-<task>-<random>`，以只读方式挂载 | 每种类型一个 Secret 或 ConfigMap，以只读方式挂载 |
| 克隆 | 容器 `semaphore-job-<task>-<random>-clone` | 初始化容器 `git-clone` |
| 构建 | 容器 `semaphore-job-<task>-<random>-build` | Pod `semaphore-job-<task>-<random>` 的容器 `build` |
| 停止按钮 | 带 `cleanup_grace_seconds` 的 `docker stop`，然后删除 | 以 `cleanup_grace_seconds` 删除 Pod |

与本地执行器一样，从 UI 停止的任务以 **Stopped** 状态结束。

## 构建容器内部 {#inside-the-build-container}

| 路径 | 内容 |
|---|---|
| `/workspace` | 可写的工作区，同时也是任务的 `HOME`。 |
| `/workspace/repo` | 克隆的仓库，即工作目录。 |
| `/secrets/ssh/<key id>/id_rsa` | 仓库或清单的 SSH 私钥。在应用启动前加载到 `ssh-agent`。 |
| `/secrets/vault/<name>` | Ansible vault 密码，以 `--vault-id=<name>@<path>` 传入。 |
| `/secrets/extra-vars/values.json` | 变量组的额外变量以及 `semaphore_vars`，以 `--extra-vars @<path>` 传入。 |
| `/secrets/inventory/inventory.cfg` 或 `inventory.yml` | 存储在 Semaphore 中的静态清单。文件类型的清单从仓库中读取。 |

容器会获得一组固定的环境变量，列于
[任务环境变量](/reference/task-environment#container-executors)。运行器自身的
`env_vars`、`forwarded_env_vars`、`PATH` 和 `apps.*` 路径**不会**传入容器。

## 镜像 {#images}

每个任务都涉及两个镜像：

| 镜像 | 默认值 | 用途 | 需要 |
|---|---|---|---|
| 构建镜像 | `semaphoreui/job:latest` | 运行应用。 | `sh`、`PATH` 中的应用二进制文件；使用 SSH 密钥时需要 `ssh-agent`、`ssh-add`、`setsid`。 |
| 辅助镜像 | `semaphoreui/helper:latest` | 克隆仓库（Docker 还用它填充机密卷）。 | `sh`、`git`、`ssh-agent`、`ssh-add`。 |

`semaphoreui/job` 基于 Debian，包含 Ansible 9（ansible-core 2.16–2.17）、Python 3、
OpenSSH、Git、Terraform、OpenTofu 和 Terragrunt。它以用户 `nobody`、组 `0` 运行。

构建镜像按运行器设置（`image`），并可通过模板的 **Executor image** 字段覆盖，参见
[执行器镜像](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)。
辅助镜像只能按运行器设置。

### 构建自定义镜像 {#build-a-custom-image}

当任务需要额外的 Ansible 集合、Python 包或工具时，可以扩展 `semaphoreui/job`。
容器执行器**不会**安装仓库中的 `requirements.yml`，因此请将集合和角色打包进镜像：

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

如果从零构建镜像，请保留 `semaphoreui/job` 的以下特性：

- `/workspace` 存在，并且容器运行用户对其可写。
- `/etc/passwd` 对组可写（`chmod g=u /etc/passwd`）。这样以随机 UID 启动的容器
  （OpenShift）会获得 passwd 条目，这是 OpenSSH 和 Git 所必需的。
- 镜像不需要特殊的 entrypoint：执行器使用 `sh -c` 运行其脚本。

## 限制 {#limitations}

与本地执行器相比，容器执行器目前：

| 不支持 | 替代方案 |
|---|---|
| **Login with password** 类型的清单凭据（SSH 密码或 become 密码） | 使用 SSH 密钥。使用此类密钥的任务会失败并报 `inventory login_password authentication is not supported`。 |
| 等待手动确认的 Terraform 任务 | 在模板中启用 **Auto approve**，或只运行 plan 任务。否则任务会失败并报 `terraform manual approval is not supported`。 |
| **Local** 类型的仓库 | 工作区保持为空；请使用 Git 仓库。 |
| 安装 `requirements.yml`（Galaxy 角色和集合） | [将它们打包进镜像](#build-a-custom-image)。 |
| 工作流输出（`SEMAPHORE_OUTPUTS_FILE`） | 对于工作流需要读取其输出的任务，请使用本地执行器。 |
| 主机配置中的按主机凭据 | 使用本地执行器。 |
| 最后一次提交之前的 Git 历史 | 克隆是浅克隆（`--depth 1`）。 |

不检查 SSH 主机密钥：克隆时接受新的主机密钥，Ansible 以
`ANSIBLE_HOST_KEY_CHECKING=False` 运行。

## 相关页面 {#related-pages}

- [Docker 执行器](./docker)：设置、配置、安全、故障排除。
- [Kubernetes 执行器](./kubernetes)：RBAC、运行器部署、配置、故障排除。
- [运行器](/admin-guide/runners)：注册和启动运行器。
- [配置选项](/reference/configuration)：所有 `runner.executor.*` 选项。
