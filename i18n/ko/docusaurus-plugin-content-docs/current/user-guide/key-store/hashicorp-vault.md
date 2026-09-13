---
title: "HashiCorp Vault 시크릿 스토리지"
---

# HashiCorp Vault 시크릿 스토리지 <Pro />

Semaphore UI는 HashiCorp Vault를 시크릿 스토리지로 지원합니다.

![](/assets/vault1.webp)

다음 옵션을 제공할 수 있습니다:
- **HashiCorp Vault URL** — Vault 서버의 주소.
- **Mount** — 시크릿 엔진의 마운트 경로.
- **Token** — 인증 token. token은 다음 방식으로 제공할 수 있습니다:
    - 데이터베이스에 저장.
    - 환경 변수를 통해 제공.
    - 파일을 통해 제공(Vault Agent에 유용).
      :::warning
      token을 **파일**에서 가져오는 경우, 해당 파일은 Semaphore가 사용하는 시크릿 디렉터리 **내부**에 있어야 합니다. 이 디렉터리는 `dirs.secrets` 또는 `SEMAPHORE_SECRETS_PATH` 환경 변수를 사용하여 구성합니다. 이전 구성을 위해 레거시 최상위 `secrets_path` 옵션도 여전히 허용됩니다. 아무것도 설정되지 않은 경우 기본값은 `/tmp/semaphore`입니다. 우선순위에 대한 자세한 내용은 [시크릿 디렉터리](/admin-guide/configuration/config-file#secrets-directory)를 참조하십시오.

      `config.json` 예시 조각:

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

이 스토리지는 읽기 전용 모드로 작동할 수 있습니다.

## 사용 방법 {#how-to-use}

1. Semaphore 설정에서 HashiCorp Vault 연결(URL, 마운트 경로, token)을 구성합니다.
2. 키 저장소에서 키를 생성하거나 편집할 때 스토리지 유형으로 **HashiCorp Vault**를 선택합니다.
3. 자격 증명을 저장할 Vault 내의 시크릿 경로를 제공합니다.

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

Vault token을 직접 저장하는 대신 [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent)를 사용하여 token 획득 및 갱신을 자동으로 처리할 수 있습니다.

Vault Agent는 Semaphore와 함께 사이드카 프로세스로 실행되며 유효한 token을 디스크의 파일에 기록합니다. 그러면 Semaphore가 해당 파일에서 token을 읽습니다.

설정 방법:

1. 적절한 [auto-auth 방식](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth)(예: AppRole, Kubernetes, AWS IAM)으로 Vault Agent를 구성하고 실행합니다.
2. `sink` 블록을 사용하여 Vault Agent가 token을 파일에 기록하도록 설정합니다. 예:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. Semaphore에서 HashiCorp Vault 연결을 구성할 때 token 소스로 **파일**을 선택하고 token 파일의 경로(예: `/etc/vault/token`)를 제공합니다.

이 방식은 장기 정적 token을 피하고 Vault Agent가 인증과 token 갱신을 자동으로 처리하도록 합니다.


## 변수 그룹 {#variable-groups}

HashiCorp Vault는 [변수 그룹](/user-guide/environment)의 스토리지로도 사용할 수 있습니다. 변수 그룹을 편집할 때 스토리지 유형으로 **HashiCorp Vault**를 선택하고 시크릿을 저장할 폴더의 경로를 지정합니다.

![](/assets/vault3.webp)
