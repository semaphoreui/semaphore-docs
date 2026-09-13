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
