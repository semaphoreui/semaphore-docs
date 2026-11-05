---
title: Kubernetes 익스큐터
description: 러너의 모든 작업을 각자의 Kubernetes Pod에서 실행합니다. 서비스 계정과 RBAC 매니페스트, 러너 설정, 구성 참조, 문제 해결을 포함합니다.
sidebar_custom_props:
  edition: enterprise
---

# Kubernetes 익스큐터 <FeatureState feature="k8s-executor" />

Kubernetes 익스큐터를 사용하면 러너가 네임스페이스에 작업마다 Pod 하나를 만들고, 그 로그를
Semaphore로 스트리밍하며, 작업이 끝나면 Pod를 삭제합니다. 러너는 클러스터 안(권장)에서
실행하거나 kubeconfig를 사용해 클러스터 밖에서 실행할 수 있습니다.

컨테이너 작업의 실행 과정, 컨테이너 내부 구성, 지원되지 않는 기능은
[익스큐터](./#how-a-container-task-runs)에서 설명합니다. 이 페이지에서는 Kubernetes
설정을 다룹니다.

## 시작하기 전에 {#before-you-begin}

- Enterprise 라이선스가 있는 Semaphore 서버.
- 클러스터에 배포된 러너. [Kubernetes에 러너 설치하기](/admin-guide/installation/k8s#runner)를 참조하십시오.
  아래 단계에서는 그 네임스페이스 `semaphore`와 Deployment `semaphore-runner`를 사용합니다. 클러스터 밖의
  러너는 [클러스터 밖의 러너](#runner-outside-the-cluster)를 참조하십시오.
- 해당 네임스페이스에 서비스 계정과 RBAC 객체를 만들 권한이 있는 `kubectl`.
- 클러스터가 `semaphoreui/job`과 `semaphoreui/helper`(또는 직접 만든 이미지)를 pull할 수 있어야 합니다.

## 러너가 만드는 객체 {#what-the-runner-creates}

ID가 `42`인 작업에 대해 러너는 자신의 네임스페이스에 다음을 만듭니다:

| 객체 | 이름 | 내용 |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | init 컨테이너 `git-clone`(헬퍼 이미지)과 컨테이너 `build`(빌드 이미지), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | SSH 키마다 하나이며, `/secrets/ssh/<key id>/`에 마운트됩니다. |
| Secret | `<pod>-vault` | Ansible vault 비밀번호. |
| Secret | `<pod>-extra-vars` | 추가 변수가 담긴 `values.json`. |
| Secret | `<pod>-env` | 유형이 *환경 변수*인 변수 그룹 비밀과 `SEMAPHORE_JWT`로, `envFrom`으로 주입됩니다. |
| ConfigMap | `<pod>-inventory` | 정적 인벤토리. |

작업에 필요한 객체만 만들어집니다. 모든 객체에는 `semaphoreui.com/runner=semaphore` 레이블이
붙고, Pod에는 `semaphoreui.com/task-id=42`도 붙습니다. 러너는 작업이 끝나면 실패나 **Stop** 후에도
이 객체를 모두 삭제합니다.

## 설정 {#set-up}

### 1단계. 서비스 계정 만들기 {#step-1-create-the-service-accounts}

러너에는 작업 Pod를 만들기 위한 서비스 계정 하나가 필요합니다. 작업 Pod에는 권한도 API
토큰도 없는 두 번째 계정을 지정하므로, playbook이 러너의 권한을 사용할 수 없습니다.

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

### 2단계. 러너에 권한 부여하기 {#step-2-grant-the-runner-its-permissions}

다음은 익스큐터가 수행하는 API 호출의 전체 목록입니다:

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

`ClusterRole`이 아닌 `Role`이므로 러너는 자신의 네임스페이스만 다룰 수 있습니다.

### 3단계. 러너를 Kubernetes 익스큐터로 전환하기 {#step-3-switch-the-runner-to-the-kubernetes-executor}

작업 Pod는 `securityContext`를 설정하지 않으므로, Pod Security 수준 `restricted`를 강제하는
네임스페이스는 이를 거부합니다. `baseline`을 허용하십시오:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

러너 Pod에 서비스 계정과 익스큐터 설정을 지정합니다. 러너 Deployment의
`spec.template.spec`에 다음을 추가합니다:

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

`kubeconfig`를 설정하지 않으면 러너는 `semaphore-runner`의 클러스터 내 자격 증명을 사용합니다.
작업이 더 이상 러너 Pod에서 실행되지 않으므로 `resources`를 줄일 수 있습니다(예: CPU `100m`,
메모리 `256Mi`).

### 4단계. 작업 실행하기 {#step-4-run-a-task}

템플릿을 러너로 라우팅하고 작업을 시작합니다. Pod가 나타났다가 사라지는 것을 확인하십시오:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

작업 로그에는 다음이 표시됩니다:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## 예시 {#examples}

### 클러스터 밖의 러너 {#runner-outside-the-cluster}

러너는 VM이나 Docker에서 실행되며 kubeconfig로 API 서버에 접근합니다. kubeconfig에는
[2단계의 Role](#step-2-grant-the-runner-its-permissions)만 부여하고 그 이상은 부여하지 마십시오:

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

kubeconfig의 현재 컨텍스트가 사용됩니다.

### 비공개 레지스트리의 이미지 {#images-from-a-private-registry}

네임스페이스에 pull secret을 만들고 `pull_secrets`에 지정합니다. 여러 이름은 쉼표로
구분합니다:

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

이 secret은 모든 작업 Pod에 연결되며, 빌드 이미지, 헬퍼 이미지, 템플릿의
**익스큐터 이미지**에 똑같이 사용됩니다.

### 작업 Pod의 CPU와 메모리 {#cpu-and-memory-of-task-pods}

익스큐터는 작업 Pod에 requests나 limits를 설정하지 않습니다. `LimitRange`로 네임스페이스의
기본값을 설정하십시오. 이는 `git-clone`과 `build` 컨테이너에 적용됩니다:

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

네임스페이스의 모든 병렬 작업이 사용할 수 있는 양을 제한하려면 `ResourceQuota`를 추가하십시오.

### 작업 Pod의 네트워크 제한 {#restrict-the-network-of-task-pods}

작업 Pod에는 `semaphoreui.com/runner=semaphore` 레이블이 있으므로 `NetworkPolicy`로 선택할 수
있습니다. 다음 정책은 DNS, Git 서버, 관리 대상 호스트로의 SSH만 허용합니다:

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

## 구성 참조 {#configuration-reference}

모든 옵션은 러너 설정의 `runner.executor.k8s` 아래에 있습니다.

| 옵션 | 환경 변수 | 기본값 | 설명 |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | 클러스터 내 | kubeconfig 파일 경로. 비어 있으면 러너 Pod의 서비스 계정을 사용합니다. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | 작업 Pod, Secret, ConfigMap의 네임스페이스. 미리 존재해야 합니다. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | `build` 컨테이너의 이미지. 템플릿의 **익스큐터 이미지**가 이를 재정의합니다. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | `git-clone` init 컨테이너의 이미지. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | 작업 Pod의 서비스 계정. 권한이 없는 계정을 사용하십시오. [1단계](#step-1-create-the-service-accounts)를 참조하십시오. |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | 작업 Pod용 쉼표로 구분된 `imagePullSecrets`. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | 러너가 Pod 상태를 읽는 주기. 값이 낮을수록 로그 스트리밍이 빨리 시작되지만 API 호출이 늘어납니다. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | 작업이 끝나거나 중지된 후 Pod 삭제의 유예 기간. |

이미지 pull 정책은 Kubernetes 기본값을 따릅니다: `:latest`에는 `Always`, 그 외에는
`IfNotPresent`.

## 보안 {#security}

- **러너에는 최소 권한을.** [Role](#step-2-grant-the-runner-its-permissions)은 네임스페이스
  범위이며 익스큐터가 호출하는 것만 나열합니다. `cluster-admin`을 바인딩하지 마십시오.
- **작업에는 API 접근을 주지 마십시오.** 기본값 `service_account: default`에서는 작업 Pod가
  네임스페이스 default 계정의 토큰을 받습니다. `automountServiceAccountToken: false`가 설정된
  전용 계정을 사용하십시오.
- **Semaphore 전용 네임스페이스.** 러너는 아무것도 읽을 수 없지만 그곳에서 Pod와 Secret을
  만들고 삭제할 수 있습니다. 네임스페이스를 다른 워크로드와 공유하지 마십시오.
- **비밀 정보**는 작업마다 별도의 Kubernetes Secret으로 만들어져 읽기 전용으로 마운트되고
  (환경 변수 비밀은 `envFrom`을 사용하므로 값이 Pod spec에 포함되지 않음) Pod와 함께 삭제됩니다.
  네임스페이스의 Secret을 읽을 수 있는 사람은 작업이 실행되는 동안 이를 읽을 수 있습니다.
  Secret의 [저장 데이터 암호화](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)를
  활성화하십시오.
- **네트워크.** [NetworkPolicy](#restrict-the-network-of-task-pods)로 작업의 접근 범위를 제한하십시오.

## 중지 및 정리 {#stop-and-clean-up}

UI의 **Stop**은 로그 스트리밍을 끝내고 `cleanup_grace_seconds`로 Pod를 삭제한 다음,
해당 Secret과 ConfigMap을 삭제합니다.

작업 중에 러너가 강제 종료되면 작업의 객체는 네임스페이스에 남으며, 러너는 다음 시작 시
이를 회수하지 않습니다. 실행 중인 작업이 없을 때 제거하십시오:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## 문제 해결 {#troubleshooting}

| 증상 | 원인 및 해결 방법 |
|---|---|
| 러너 로그: `k8s executor is only available in the proprietary build` | 러너가 Community 빌드입니다. `semaphoreui/runner` 또는 공식 바이너리를 사용하십시오. |
| 러너 로그: `failed to initialise executor provider`와 `unable to load in-cluster configuration` | 러너가 클러스터 밖에 있는데 `kubeconfig`가 비어 있거나, kubeconfig 경로가 잘못되었습니다. |
| 작업: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | RBAC가 없거나 다른 네임스페이스에 바인딩되었습니다. `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`로 확인하십시오. |
| 작업: `create pod ...: namespaces "semaphore" not found` | 네임스페이스를 만드십시오. 러너는 만들지 않습니다. |
| 작업: `create pod ...: violates PodSecurity "restricted"` | 네임스페이스에 `pod-security.kubernetes.io/enforce: baseline` 레이블을 지정하십시오. |
| 작업이 출력 없이 **Running** 상태로 유지됨 | Pod가 `Pending`에 멈춰 있습니다: 맞는 노드가 없거나, 이미지를 pull할 수 없거나(`ImagePullBackOff`), 쿼터가 막고 있습니다. 러너는 Pod가 끝날 때까지 기다립니다. `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>`로 확인하고 작업을 중지하십시오. |
| 작업: `pod ... finished with status Failed` | 복제 또는 앱이 실패했습니다. 위의 로그에 `git-clone`과 `build`의 출력이 있습니다. |
| `interpreter python3 not found in image` | 빌드 이미지에 앱 바이너리가 없습니다. 다른 이미지나 템플릿의 **익스큐터 이미지**를 지정하십시오. |
| `No user exists for uid ...`(OpenShift) | 이미지의 `/etc/passwd`가 그룹 쓰기 가능하지 않습니다. [사용자 정의 이미지 빌드](./#build-a-custom-image)를 참조하십시오. |

## 관련 페이지 {#related-pages}

- [익스큐터](/admin-guide/executors): 컨테이너 작업의 실행 과정, 이미지, 제한 사항.
- [Docker 익스큐터](./docker): Docker 호스트에서 동작하는 같은 모델.
- [Kubernetes 설치](/admin-guide/installation/k8s): 서버와 러너 Deployment.
- [익스큐터 이미지](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): 템플릿 하나에 다른 이미지 사용.
