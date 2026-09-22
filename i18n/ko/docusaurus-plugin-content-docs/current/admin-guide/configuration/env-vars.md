# 환경 변수

환경 변수를 사용하면 사용 가능한 모든 설정 옵션을 재정의할 수 있습니다.

대화형 환경 변수 생성기(Docker용)를 사용할 수 있습니다.
* [서버](https://semaphoreui.com/install/docker/2_12/)용
* [runner](https://semaphoreui.com/install/docker/2_12/runner)용.

---

## 앱(Ansible, Terraform 등)을 위한 애플리케이션 환경 {#application-environment-for-apps-ansible-terraform-etc}

Semaphore는 애플리케이션 프로세스(Ansible, Terraform/OpenTofu, Python, PowerShell 등)에 환경 변수를 전달할 수 있습니다. 관련 옵션은 두 가지입니다.

- `env_vars` / `SEMAPHORE_ENV_VARS`: 앱 프로세스에 설정되는 정적 키-값 쌍입니다.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: 서버가 자신의 프로세스 환경에서 전달할 변수 이름 목록입니다.

설정 파일 예제:

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

환경 변수로 동일하게 설정하는 예제:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

참고:
- 전달은 명시적으로 이루어집니다. `forwarded_env_vars`에 나열된 변수만 앱 프로세스에 상속됩니다.
- 시크릿은 안전한 방법(예: Docker/Kubernetes 시크릿)으로 제공한 뒤 `forwarded_env_vars`를 사용하여 전달해야 합니다.
- 같은 목록이 저장소를 클론하고 업데이트하는 `git` 프로세스에도 적용됩니다. 따라서 `git`이 호스트 환경에서 필요로 하는 값도 함께 전달해야 합니다.

---

## 회사 프록시 뒤에서 실행하기 {#running-behind-a-corporate-proxy}

Semaphore는 자신의 환경을 자신이 시작하는 프로세스에 그대로 넘기지 않습니다. `PATH`를 제외하면, 변수는 `forwarded_env_vars`에 나열되어 있거나 `env_vars`에 설정된 경우에만 작업이나 `git` 클론에 전달됩니다.

이 점은 패키지(systemd) 설치에서 특히 중요합니다. 유닛 파일에 설정한 프록시 변수는 Semaphore 서버 자체에는 적용되지만 `git`에는 적용되지 않습니다.

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

위 설정만 있는 경우 저장소 클론은 다음과 같이 실패합니다.

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git`은 `NO_PROXY`를 보지 못했기 때문에 내부 호스트로 가는 요청을 외부 프록시로 보냈고, 프록시가 이를 거부했습니다. 세 변수를 명시적으로 전달하면 해결됩니다.

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

또는 환경 변수로 지정할 수도 있습니다.

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

참고:
- 프록시 변수와 함께 `NO_PROXY`도 전달하세요. 이 변수가 없으면 내부 Git 서버로 가는 트래픽도 프록시를 거칩니다.
- 많은 도구가 소문자 표기(`http_proxy`, `https_proxy`, `no_proxy`)를 읽습니다. Linux와 macOS에서는 변수 이름의 대소문자를 구분하므로, 환경이 소문자로 설정한다면 두 표기를 모두 나열하세요.
- 사용자 지정 CA 번들도 같은 방식으로 동작합니다. 프록시가 TLS를 종료한다면 인증서 검증을 끄는 대신 필요에 따라 `GIT_SSL_CAINFO`, `SSL_CERT_FILE`, `REQUESTS_CA_BUNDLE`을 전달하세요.
- Docker 설치에서는 프록시 변수가 컨테이너 전체에 설정되므로 보통 그냥 동작하는 것처럼 보입니다. 그래도 같은 설정이 양쪽에서 동일하게 동작하도록 명시적으로 전달하는 편이 좋습니다.

---

## Runner 실행기 설정 {#runner-executor-configuration}

runner 배포에서는 개별 키 대신 전체 실행기 블록을 하나의 JSON 환경 변수로 설정할 수 있습니다.

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

이는 설정 파일에서 `runner.executor.type`과 중첩된 `runner.executor.docker.*` 필드를 설정하는 것과 동일합니다. 모든 runner 실행기 설정은 [설정 옵션](/admin-guide/configuration)을 참조하십시오.

---

## 변수 그룹의 시크릿 환경 변수 {#secret-environment-variables-in-variable-groups}

전역 환경 변수 외에도 변수 그룹에서 프로젝트별 시크릿을 정의할 수 있습니다. 시크릿 키는 UI와 로그에서 마스킹됩니다. 사용법과 `TF_VAR_*` 변수를 이용한 Terraform 통합에 대해서는 `User Guide → Variable Groups`를 참조하십시오.
