# Runner

Runner를 사용하면 Semaphore UI와 별도의 서버에서 작업을 실행할 수 있습니다.

Semaphore runner는 GitLab 또는 GitHub Actions runner와 같은 원리로 동작합니다:

- 별도의 서버에서 Semaphore 서버 주소와 인증 token을 지정하여 runner를 실행합니다.
- Runner는 Semaphore에 연결하고 작업을 받을 준비가 되었음을 알립니다.
- 새 작업이 생기면 Semaphore가 필요한 모든 정보를 runner에 전달하고, runner는 저장소를 복제한 뒤 Ansible, Terraform, PowerShell 등을 실행합니다.
- Runner는 작업 실행 결과를 Semaphore로 다시 보냅니다.

최종 사용자 입장에서는 runner 사용 여부와 관계없이 Semaphore를 사용하는 방식이 동일합니다.

Runner가 정의되어 있지 않으면 Semaphore UI 서버 자체가 runner 역할을 합니다. 모든 작업은 Semaphore UI 서버의 컨텍스트 안에서 실행되며 파일 시스템에 접근할 수 있습니다.

Runner를 사용하면 다음과 같은 이점이 있습니다:
- 작업을 더 안전하게 실행할 수 있습니다. 예를 들어 runner를 폐쇄된 서브넷이나 격리된 docker 컨테이너 안에 둘 수 있습니다.
- 워크로드를 여러 서버에 분산할 수 있습니다. 여러 runner를 시작하면 작업이 그 사이에 무작위로 분배됩니다.

## 설정 {#set-up}

### 서버 설정 {#set-up-a-server}

Runner와 함께 동작하도록 서버를 설정하려면 Semaphore 서버 설정에 다음 옵션을 추가해야 합니다:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

또는 환경 변수를 사용합니다:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Runner 설정 {#setup-a-runner}

Runner를 설정하려면 다음 명령을 사용합니다:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

이 명령은 `/path/to/your/config/file.json`에 설정 파일을 만듭니다.

그러나 이 명령을 사용하기 전에 runner가 서버에 등록되는 방식을 이해해야 합니다.

### 서버에 runner 등록하기 {#registering-the-runner-on-the-server}

Semaphore 서버에 runner를 등록하는 방법은 두 가지입니다:
1) 웹 인터페이스 또는 API를 통해 추가합니다.
2) 명령줄에서 `semaphore runner register` 명령을 사용합니다.

#### 웹 UI를 통해 runner 추가하기 {#adding-the-runner-via-the-web-ui}

![Runner 이미지](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### CLI로 등록하기 {#registering-via-cli}

이 방법으로 runner를 등록하려면 Semaphore 서버의 설정 파일에 `runner_registration_token` 옵션을 추가해야 합니다. 이 옵션에는 임의의 문자열을 설정합니다. 보안 문제를 피하기 위해 충분히 복잡한 문자열을 선택하십시오.

`semaphore runner setup` 명령이 Runner token이 있는지 물으면 No라고 답합니다. 그런 다음 다음 명령으로 runner를 등록합니다:

`semaphore runner register --config /path/to/your/config/file.json`

또는

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### 설정 파일 {#configuration-file}

`semaphore runner setup` 명령을 실행하면 다음과 같은 설정 파일이 생성됩니다:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

`semaphore runner setup`을 다시 실행하지 않고도 이 파일을 직접 편집할 수 있습니다.

Runner를 다시 등록하려면 `semaphore runner register` 명령을 사용합니다. 이 명령은 설정에 지정된 파일의 token을 덮어씁니다.

## Runner 실행하기 {#running-the-runner}

이제 다음 명령으로 runner를 시작할 수 있습니다:

```
semaphore runner start --config /path/to/your/config/file.json
```

Runner가 작업을 실행할 준비가 되었습니다.

### Docker에서 runner 실행하기 {#running-the-runner-in-docker}

`semaphoreui/runner` 이미지는 runner를 자동으로 시작합니다. 서버 URL과 등록 token을 환경 변수로 전달합니다:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Playbook에 추가 Python 패키지가 필요하다면 `requirements.txt`를 `/etc/semaphore/requirements.txt`에 마운트합니다. 컨테이너는 runner가 서버에 연결하기 전에 시작할 때마다 `pip3`로 이를 설치합니다:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

패키지가 설치되는 위치와 실패 처리 방식에 대한 자세한 내용은 [추가 Python 의존성 설치](/admin-guide/installation/docker#installing-additional-python-dependencies)를 참고하십시오.

### 폴링 간격(`check_interval_seconds`) {#poll-interval-check_interval_seconds}

각 runner는 새 작업을 확인하고 작업 진행 상황을 보고하기 위해 일정한 간격으로 Semaphore 서버를
폴링합니다. Runner 설정 파일에서 이를 구성합니다:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

또는 환경 변수를 사용합니다:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| 값 | 효과 |
|-------|--------|
| **1** (기본값) | 작업이 약 1초 이내에 시작됩니다. 지연 시간이 짧아야 하는 실행에 가장 적합합니다. |
| **더 큰 값** (예: 5–30) | 하나의 서버에 많은 runner를 운영할 때 HTTP 트래픽을 줄입니다. 작업 시작이 약간 늦어질 수 있습니다. |

Semaphore UI의 Runner 페이지에서 설정 스니펫(설정 파일, Docker, 환경 변수 예시)을 생성할 때
**고급 옵션**에서 이 값을 지정할 수 있습니다.

잘못된 값이나 0을 지정하면 기본값인 1초로 대체됩니다.

### Runner 태그(Pro) {#runner-tags-pro}

프로젝트 runner에 하나 이상의 태그를 지정할 수 있습니다. 템플릿에서 태그를 요구하면 작업이 해당 태그와 일치하는 runner에서만 실행됩니다. 프로젝트 UI에서 runner를 추가할 때 태그를 설정하고, 템플릿 설정에서 필요한 태그를 지정합니다.

## Runner 등록 해제 {#runner-deregistration}

웹 인터페이스를 사용하여 runner를 제거할 수 있습니다.

![Runner 이미지](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

또는 CLI로 runner 등록을 해제합니다:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## 보안 {#security}

Runner는 등록 시 발급된 불투명한 bearer token(`X-Runner-Token`)으로
서버에 인증합니다. 이 token은 다른 자격 증명과 마찬가지로 보호하십시오. 접근이 제한된
설정 파일이나 secret 관리자에 보관하는 것이 좋습니다.

:::warning
서버와 runner 사이의 통신에는 HTTPS를 사용하십시오. 특히 두 시스템이
같은 사설 네트워크에 있지 않은 경우 더욱 중요합니다. 자체 서명 인증서나 내부 CA
인증서를 사용하는 경우 runner에서 `runner.connection.server_ca_cert_file`을 설정하십시오.
프로덕션 환경에서는 `runner.connection.skip_tls_verify`를 사용하지 마십시오.
:::
