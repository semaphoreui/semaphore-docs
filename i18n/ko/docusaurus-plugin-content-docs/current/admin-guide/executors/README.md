---
title: 익스큐터
description: 러너가 로컬, Docker, Kubernetes 익스큐터로 작업을 실행하는 방식, 컨테이너 안에서 실행되는 것, 그리고 컨테이너 익스큐터가 지원하지 않는 기능을 설명합니다.
---

# 익스큐터

익스큐터는 **러너가 작업 프로세스를 어디에서 시작할지**를 결정합니다. 러너는 여전히
서버를 폴링하고, 작업을 받고, 로그를 다시 보냅니다. 바뀌는 것은 Ansible, Terraform,
셸 프로세스가 실행되는 위치뿐입니다.

| 익스큐터 | `runner.executor.type` | 작업 실행 위치 | 에디션 |
|---|---|---|---|
| 로컬 | `local`(기본값) | 러너 호스트의 자식 프로세스로, 러너의 파일, 도구, `PATH`를 사용합니다. | Community |
| Docker | `docker` | Docker 데몬의 새 컨테이너로, 작업이 끝나면 제거됩니다. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Kubernetes 네임스페이스의 새 Pod로, 작업이 끝나면 삭제됩니다. | <FeatureState feature="k8s-executor" /> |

익스큐터는 서버나 템플릿이 아니라 **러너**의 설정입니다. Semaphore 서버 자체는 항상
작업을 로컬에서 실행합니다. 작업을 컨테이너에서 실행하려면 [러너](/admin-guide/runners)를
시작하고 러너 태그로 템플릿을 해당 러너에 연결하십시오.

## 익스큐터 선택 {#choose-an-executor}

| 필요한 것 | 사용할 익스큐터 |
|---|---|
| 한 머신에 설치된 도구, 해당 머신의 파일 접근, 워크플로 출력 | 로컬 |
| 작업마다 깨끗한 환경, 템플릿마다 다른 도구 체인, 한 대 또는 몇 대의 호스트 | [Docker](./docker) |
| 클러스터 전체에 작업 스케줄링, Kubernetes RBAC와 Secret, Docker 소켓 불필요 | [Kubernetes](./kubernetes) |

## 익스큐터 설정 {#set-the-executor}

러너 설정 파일의 `runner` 섹션에 `executor` 블록을 추가합니다:

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

또는 환경 변수를 설정합니다:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

모든 옵션에는 환경 변수가 있으며, 전체 목록은
[Docker](./docker#configuration-reference) 및 [Kubernetes](./kubernetes#configuration-reference)
페이지에 있습니다. 익스큐터를 변경한 후에는 러너를 다시 시작하십시오.

:::info
컨테이너 익스큐터는 러너의 Pro 빌드에 포함되어 있습니다. `semaphoreui/runner`
이미지 또는 공식 `semaphore` 바이너리를 사용하십시오. `semaphoreui/runner-community`
이미지는 이 기능 없이 빌드되며, 시작할 때
`docker executor is only available in the proprietary build`를 로그에 기록합니다.
:::

## 컨테이너 작업의 실행 과정 {#how-a-container-task-runs}

두 컨테이너 익스큐터 모두 같은 방식으로 작업을 실행합니다:

1. **준비.** 러너가 공유 워크스페이스를 만들고 작업의 비밀 정보
   (SSH 키, vault 비밀번호, 추가 변수, 정적 인벤토리)를 컨테이너가 읽을 수 있는 곳에 둡니다.
2. **복제.** 잠깐 실행되는 *헬퍼* 컨테이너가 리포지토리를
   `/workspace/repo`로 복제합니다(작업 브랜치를 `git clone --depth 1`).
3. **빌드.** *빌드* 컨테이너가 `/workspace/repo`에서 시작하여 앱을 실행합니다:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` 또는 사용자 정의 앱의 바이너리입니다. 이 컨테이너의 종료 코드가 작업 결과가 됩니다.
4. **로그.** 두 컨테이너의 출력은 실행 중에 작업 로그로 스트리밍됩니다.
5. **정리.** 작업의 컨테이너, 볼륨, Secret, ConfigMap은 작업이 성공하든 실패하든
   중지되든 제거됩니다.

| 단계 | Docker | Kubernetes |
|---|---|---|
| 워크스페이스 | 이름 있는 볼륨 `semaphore-workspace-<task>-<random>` | Pod의 `emptyDir` 볼륨 |
| 비밀 정보 | 이름 있는 볼륨 `semaphore-secrets-<task>-<random>`, 읽기 전용 마운트 | 종류별 Secret 또는 ConfigMap 하나, 읽기 전용 마운트 |
| 복제 | 컨테이너 `semaphore-job-<task>-<random>-clone` | init 컨테이너 `git-clone` |
| 빌드 | 컨테이너 `semaphore-job-<task>-<random>-build` | Pod `semaphore-job-<task>-<random>`의 컨테이너 `build` |
| 중지 버튼 | `cleanup_grace_seconds`로 `docker stop` 후 제거 | `cleanup_grace_seconds`로 Pod 삭제 |

UI에서 중지한 작업은 로컬 익스큐터와 마찬가지로 **Stopped** 상태로 끝납니다.

## 빌드 컨테이너 내부 {#inside-the-build-container}

| 경로 | 내용 |
|---|---|
| `/workspace` | 쓰기 가능한 워크스페이스이며, 작업의 `HOME`이기도 합니다. |
| `/workspace/repo` | 복제된 리포지토리이며, 작업 디렉터리입니다. |
| `/secrets/ssh/<key id>/id_rsa` | 리포지토리 또는 인벤토리의 SSH 개인 키입니다. 앱이 시작되기 전에 `ssh-agent`에 로드됩니다. |
| `/secrets/vault/<name>` | Ansible vault 비밀번호로, `--vault-id=<name>@<path>`로 전달됩니다. |
| `/secrets/extra-vars/values.json` | 변수 그룹의 추가 변수와 `semaphore_vars`로, `--extra-vars @<path>`로 전달됩니다. |
| `/secrets/inventory/inventory.cfg` 또는 `inventory.yml` | Semaphore에 저장된 정적 인벤토리입니다. 파일 인벤토리는 리포지토리에서 읽습니다. |

컨테이너는 정해진 환경 변수 세트를 받으며, 목록은
[작업 환경 변수](/reference/task-environment#container-executors)에 있습니다.
러너 자체의 `env_vars`, `forwarded_env_vars`, `PATH`, `apps.*` 경로는 컨테이너에
**전달되지 않습니다**.

## 이미지 {#images}

모든 작업에는 두 개의 이미지가 사용됩니다:

| 이미지 | 기본값 | 용도 | 요구 사항 |
|---|---|---|---|
| 빌드 이미지 | `semaphoreui/job:latest` | 앱 실행. | `sh`, `PATH`에 있는 앱 바이너리. SSH 키를 사용하려면 `ssh-agent`, `ssh-add`, `setsid`. |
| 헬퍼 이미지 | `semaphoreui/helper:latest` | 리포지토리 복제(Docker는 비밀 정보 볼륨을 채울 때도 사용). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job`은 Debian 기반이며 Ansible 9(ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu, Terragrunt를 포함합니다. 사용자 `nobody`, 그룹 `0`으로 실행됩니다.

빌드 이미지는 러너별로 설정하며(`image`), 템플릿별로 **익스큐터 이미지** 필드로
재정의할 수 있습니다.
[익스큐터 이미지](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)를 참조하십시오.
헬퍼 이미지는 러너별로만 설정할 수 있습니다.

### 사용자 정의 이미지 빌드 {#build-a-custom-image}

작업에 추가 Ansible 컬렉션, Python 패키지 또는 도구가 필요하면 `semaphoreui/job`을
확장하십시오. 컨테이너 익스큐터는 리포지토리의 `requirements.yml`을 설치하지
**않으므로**, 컬렉션과 롤을 이미지에 포함해야 합니다:

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

이미지를 처음부터 빌드한다면 `semaphoreui/job`의 다음 특성을 유지하십시오:

- `/workspace`가 존재하고 컨테이너를 실행하는 사용자가 쓸 수 있어야 합니다.
- `/etc/passwd`가 그룹 쓰기 가능해야 합니다(`chmod g=u /etc/passwd`). 그러면 임의의 UID로
  시작된 컨테이너(OpenShift)에도 passwd 항목이 생기며, OpenSSH와 Git은 이를 필요로 합니다.
- 특별한 엔트리포인트는 필요하지 않습니다. 익스큐터는 스크립트를 `sh -c`로 실행합니다.

## 제한 사항 {#limitations}

로컬 익스큐터와 비교하여 컨테이너 익스큐터는 현재 다음을 지원하지 않습니다:

| 지원되지 않음 | 대안 |
|---|---|
| 유형이 **Login with password**인 인벤토리 자격 증명(SSH 비밀번호 또는 become 비밀번호) | SSH 키를 사용하십시오. 이런 키를 사용하는 작업은 `inventory login_password authentication is not supported`로 실패합니다. |
| 수동 승인을 기다리는 Terraform 작업 | 템플릿에서 **Auto approve**를 활성화하거나 plan 전용 작업을 실행하십시오. 그렇지 않으면 작업이 `terraform manual approval is not supported`로 실패합니다. |
| 유형이 **Local**인 리포지토리 | 워크스페이스가 비어 있게 됩니다. Git 리포지토리를 사용하십시오. |
| `requirements.yml` 설치(Galaxy 롤 및 컬렉션) | [이미지에 포함하십시오](#build-a-custom-image). |
| 워크플로 출력(`SEMAPHORE_OUTPUTS_FILE`) | 워크플로가 출력을 읽는 작업에는 로컬 익스큐터를 사용하십시오. |
| 호스트 설정의 호스트별 자격 증명 | 로컬 익스큐터를 사용하십시오. |
| 마지막 커밋 이전의 Git 기록 | 복제는 얕은 복제(`--depth 1`)입니다. |

SSH 호스트 키는 확인하지 않습니다. 복제 시 새 호스트 키를 수락하며, Ansible은
`ANSIBLE_HOST_KEY_CHECKING=False`로 실행됩니다.

## 관련 페이지 {#related-pages}

- [Docker 익스큐터](./docker): 설정, 구성, 보안, 문제 해결.
- [Kubernetes 익스큐터](./kubernetes): RBAC, 러너 배포, 구성, 문제 해결.
- [러너](/admin-guide/runners): 러너 등록 및 시작.
- [구성 옵션](/reference/configuration): 모든 `runner.executor.*` 옵션.
