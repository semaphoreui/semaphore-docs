---
title: Docker 익스큐터
description: 러너의 모든 작업을 로컬 또는 원격 데몬의 새 Docker 컨테이너에서 실행합니다. 구성 예시, 보안 참고 사항, 문제 해결을 포함합니다.
sidebar_custom_props:
  edition: pro
---

# Docker 익스큐터 <FeatureState feature="docker-executor" />

Docker 익스큐터를 사용하면 러너가 각 작업을 새 컨테이너에서 시작하고 작업이 끝나면
컨테이너를 제거합니다. 러너는 API를 통해 Docker 데몬과 통신하며, 데몬은 같은 호스트에
있을 수도 있고 TLS를 통한 원격 데몬일 수도 있습니다.

컨테이너 작업의 실행 과정, 컨테이너 내부 구성, 지원되지 않는 기능은
[익스큐터](./#how-a-container-task-runs)에서 설명합니다. 이 페이지에서는 Docker 설정을 다룹니다.

## 시작하기 전에 {#before-you-begin}

- Pro 또는 Enterprise 라이선스가 있는 Semaphore 서버.
- 서버에 등록된 러너. [러너](/admin-guide/runners)를 참조하십시오.
  `semaphoreui/runner` 이미지 또는 공식 `semaphore` 바이너리를 사용하십시오.
- 러너에서 접근할 수 있는 Docker Engine과 이를 사용할 권한: `docker` 그룹 멤버십,
  마운트된 소켓에 대한 접근 또는 TLS 클라이언트 인증서.
- 데몬이 `semaphoreui/job`과 `semaphoreui/helper`(또는 직접 만든 이미지)를 pull할 수 있어야 합니다.

## 빠른 시작 {#quick-start}

러너 설정에 익스큐터를 추가하고 러너를 다시 시작합니다:

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

다른 옵션이 없으면 러너는 로컬 소켓(`DOCKER_HOST`가 설정되어 있으면 그것,
아니면 `unix:///var/run/docker.sock`), 빌드 이미지 `semaphoreui/job:latest`,
`bridge` 네트워크를 사용합니다.

이 러너로 라우팅되는 작업을 실행합니다. 작업 로그는 다음과 같이 시작됩니다:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

작업이 실행되는 동안 해당 컨테이너를 확인할 수 있습니다:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## 예시 {#examples}

### Docker 호스트의 러너 바이너리 {#runner-binary-on-a-docker-host}

러너는 Docker와 같은 호스트에서 systemd 서비스로 실행됩니다. 러너 사용자에게 소켓
접근 권한을 부여합니다:

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### 호스트 소켓을 사용하는 컨테이너 안의 러너 {#runner-in-a-container-with-the-host-socket}

러너 컨테이너는 마운트된 소켓을 통해 호스트 데몬을 제어합니다. 작업 컨테이너는 러너
안에 중첩되지 않고 러너와 나란히 실행됩니다. 러너 이미지는 UID `1001`로 실행되므로
소켓을 소유한 그룹에 추가하십시오:

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

`semaphore-runner-data` 볼륨은 등록 시 발급된 러너 토큰을 보관하므로, 재시작 후에도
러너가 다시 등록하지 않습니다.

Docker Compose로는 다음과 같습니다:

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

비밀 정보는 러너의 파일 시스템이 아니라 데몬의 이름 있는 볼륨을 통해 작업에 전달되므로,
러너와 호스트 사이에 다른 경로를 공유할 필요가 없습니다.

### TLS를 통한 원격 Docker 데몬 {#remote-docker-daemon-over-tls}

러너와 데몬이 서로 다른 머신에 있는 경우입니다. 데몬 포트를 상호 TLS로 보호하고
([Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/) 참조)
클라이언트 파일을 러너에 둡니다:

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

`cert_path`가 설정되면 러너는 데몬 인증서를 `ca.pem`으로 검증하고 `cert.pem`과
`key.pem`으로 인증합니다. 파일 이름은 고정되어 있습니다.

:::warning
`cert_path`가 없으면 `tcp://` 연결은 평문 HTTP이며, 해당 포트에 접근할 수 있는 누구나
데몬을 제어할 수 있습니다. `tls_verify`만으로는 TLS가 활성화되지 않습니다(⚠️ 2026-11-05: 이 옵션은
읽히지만 적용되지 않습니다). 원격 데몬에는 항상 `cert_path`를 설정하십시오.
:::

### 내부 서비스용 네트워크 {#a-network-for-internal-services}

기본적으로 작업 컨테이너는 `bridge`에 연결됩니다. 작업이 컨테이너 이름으로 서비스에
접근하게 하거나 작업을 별도 네트워크로 격리하려면, 네트워크를 만들고 지정하십시오:

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network`에는 Docker가 인식하는 모든 네트워크 모드를 지정할 수 있습니다: 네트워크 이름,
`bridge`, `host` 또는 `none`. 복제 컨테이너도 같은 네트워크에 연결되므로 `none`을 사용하면
리포지토리를 복제할 수 없습니다.

### 비공개 레지스트리의 이미지 {#images-from-a-private-registry}

익스큐터는 레지스트리 자격 증명 없이 이미지를 pull합니다. 비공개 이미지는 데몬 호스트에서
로그인하여 pull해 두고, 다시 pull하지 않는 pull 정책을 유지하십시오:

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

`if-not-present`와 함께라면 `latest` 대신 버전 태그를 사용하십시오. 데몬에 이미 있는 태그는
갱신되지 않습니다. `never`를 사용하면 이미지가 없을 때 pull을 시도하지 않고 작업이 실패합니다.

### 블록 전체를 하나의 변수로 {#the-whole-block-as-one-variable}

환경 변수로만 구성하는 배포에서는 익스큐터 블록을 JSON으로 전달합니다:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## 구성 참조 {#configuration-reference}

모든 옵션은 러너 설정의 `runner.executor.docker` 아래에 있습니다.

| 옵션 | 환경 변수 | 기본값 | 설명 |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, 그다음 플랫폼 소켓 | 데몬 주소: `unix:///path`, `tcp://host:port` 또는 `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | 상호 TLS용 `ca.pem`, `cert.pem`, `key.pem`이 있는 디렉터리. 설정하면 TLS가 켜집니다. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | 아직 적용되지 않습니다. `cert_path`를 사용하십시오. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | 빌드 이미지. 템플릿의 **익스큐터 이미지**가 이를 재정의합니다. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | 복제 컨테이너 및 비밀 정보 볼륨 채우기에 사용하는 이미지. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | 복제 컨테이너와 빌드 컨테이너의 네트워크. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` 또는 `never`. 알 수 없는 값은 `if-not-present`로 처리됩니다. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | 제한 없음 | 컨테이너당 CPU 수로, `docker run --cpus`와 같습니다. 소수도 가능합니다: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | 제한 없음 | 컨테이너당 메모리: 바이트 단위 또는 `k`, `m`, `g` 접미사(`512m`, `2g`). 해석할 수 없는 값은 제한 없음을 의미합니다. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | 컨테이너를 `--privileged`로 실행합니다. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | **Stop** 후 `docker stop`이 컨테이너를 강제 종료하기 전에 기다리는 초. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | 사용되지 않습니다. 익스큐터는 폴링하지 않고 컨테이너가 종료될 때까지 기다립니다. |

제한, 네트워크, `privileged`는 복제 컨테이너와 빌드 컨테이너에 동일하게 적용됩니다.

## 중지 및 정리 {#stop-and-clean-up}

UI의 **Stop**은 실행 중인 컨테이너에 `docker stop`을 보내고 최대 `cleanup_grace_seconds`
동안 기다린 후, 컨테이너와 두 볼륨을 제거합니다.

작업 중에 러너 프로세스가 강제 종료되면 해당 컨테이너와 볼륨은 데몬에 남으며, 러너는
다음 시작 시 이를 회수하지 않습니다. 익스큐터가 만드는 모든 것에는
`com.semaphoreui.runner=semaphore` 레이블이 붙고, `com.semaphoreui.task-id`에는 작업 ID가
들어 있습니다. 이 데몬에서 실행 중인 작업이 없을 때 남은 것을 제거하십시오:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## 문제 해결 {#troubleshooting}

| 메시지 | 원인 및 해결 방법 |
|---|---|
| `docker executor is only available in the proprietary build`(러너 로그) | 러너가 Community 빌드입니다. `semaphoreui/runner` 또는 공식 바이너리를 사용하십시오. |
| `docker executor: daemon not reachable` | `host`가 잘못되었거나, 데몬이 중지되었거나, 러너 사용자가 소켓을 열 수 없습니다(`permission denied`). 러너 사용자로 `docker -H <host> info`를 실행해 확인하고, 사용자를 소켓 그룹에 추가하십시오. |
| `pull image ...: ... unauthorized` 또는 `not found` | 이미지가 비공개이거나 이름이 잘못되었습니다. 먼저 데몬 호스트에서 pull하십시오. [비공개 레지스트리](#images-from-a-private-registry)를 참조하십시오. |
| `git clone exited with status 128` | 리포지토리 URL, 브랜치 또는 SSH 키가 잘못되었거나 네트워크가 Git 호스트를 차단합니다. 이 줄 위의 복제 출력에 Git 오류가 표시됩니다. |
| `interpreter python3 not found in image; set a runner image that provides it` | 빌드 이미지에 앱 바이너리가 없습니다. 러너 또는 템플릿의 **익스큐터 이미지**에서 해당 바이너리가 있는 이미지를 지정하십시오. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | 이미지에 OpenSSH 클라이언트가 없어 Ansible이 인벤토리 키를 사용할 수 없습니다. `openssh-client`를 설치하십시오. |
| `/workspace` 아래의 `Permission denied` | 사용자 정의 이미지가 `/workspace`에 쓸 수 없는 사용자로 실행됩니다. [사용자 정의 이미지 빌드](./#build-a-custom-image)를 참조하십시오. |
| `build container exited with status N` | 앱이 종료 코드 `N`으로 실패했습니다. 원인은 위의 로그에 있습니다. |
| `inventory login_password authentication is not supported` | [제한 사항](./#limitations)을 참조하십시오. |

## 관련 페이지 {#related-pages}

- [익스큐터](/admin-guide/executors): 컨테이너 작업의 실행 과정, 이미지, 제한 사항.
- [Kubernetes 익스큐터](./kubernetes): 클러스터에서 동작하는 같은 모델.
- [러너](/admin-guide/runners): 러너 등록 및 시작.
- [익스큐터 이미지](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): 템플릿 하나에 다른 이미지 사용.
