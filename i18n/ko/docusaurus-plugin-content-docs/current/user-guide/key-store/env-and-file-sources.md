# 환경 변수와 파일에서 키 가져오기

시크릿을 데이터베이스에 저장하는 것 외에도, 키 저장소 항목은 작업 실행 시점에 Semaphore 서버의
**파일** 또는 Semaphore 서버 프로세스의 **환경 변수**에서 값을 읽어올 수 있습니다.
이 방식은 자격 증명이 이미 Semaphore 외부에서 프로비저닝되어 있는 경우에 유용합니다. 예를 들면:

* Docker 또는 Kubernetes 시크릿으로 Semaphore 컨테이너에 마운트된 SSH 키;
* 에이전트(HashiCorp Vault Agent, cert-manager 등)가 디스크에 기록하고 주기적으로 교체하는 token;
* 오케스트레이터가 컨테이너 환경에 주입한 비밀번호.

Semaphore는 값을 데이터베이스에 복사하지 않습니다. 작업에서 키가 필요할 때마다 서버가
파일이나 변수를 다시 읽으므로, 디스크의 자격 증명을 교체하면 다음 작업부터 바로 적용됩니다.

:::info
파일이나 변수는 러너가 아니라 **Semaphore 서버**가 읽습니다. 원격 러너를 사용하는 경우,
파일을 서버 호스트에 마운트하십시오. 서버가 시크릿을 확인한 뒤 러너에 전달합니다.
:::

## 소스 선택 {#choosing-the-source}

키를 생성하거나 편집할 때(**키 저장소 → 새 키**), 양식 상단에 소스 탭이 있습니다:

| 탭 | 값의 출처 | 입력할 내용 |
|-----|---------------------------|---------------|
| **Local** | Semaphore 데이터베이스(암호화됨) | 양식에 로그인, 비밀번호 또는 개인 키 |
| **Storage** <Pro /> | [HashiCorp Vault](/user-guide/key-store/hashicorp-vault)와 같은 외부 시크릿 스토리지 | 스토리지와 시크릿 경로 |
| **Env** | Semaphore 서버 프로세스의 환경 변수 | 변수 이름, 예: `PROD_SSH_KEY` |
| **File** | Semaphore 서버의 파일 | 파일의 **절대** 경로, 예: `/var/lib/semaphore/secrets/prod.json` |

**Env** 또는 **File**을 선택하면 로그인, 비밀번호, 개인 키 필드가 사라집니다. SSH 및 비밀번호 로그인 키의
로그인을 포함한 전체 자격 증명이 파일이나 변수 안에 있어야 합니다.

## 1. 디렉터리 허용 {#allow-the-directory}

보안을 위해 Semaphore는 **시크릿 디렉터리** 내부에 있는 키 파일만 읽습니다. 그 외의 경로는
작업이 시작될 때 거부됩니다:

```
Failed to install inventory: file path must be inside secrets path
```

기본 시크릿 디렉터리는 `/tmp/semaphore`입니다. `config.json`의 `dirs.secrets` 또는
`SEMAPHORE_SECRETS_PATH` 환경 변수를 사용하여 키 파일이 있는 디렉터리를 가리키도록 설정하십시오.
우선순위 규칙은 [시크릿 디렉터리](/admin-guide/configuration/config-file#secrets-directory)를 참조하십시오.

호스트 디렉터리를 마운트하고 허용하는 Docker Compose 예시:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

동일한 내용의 `config.json` 조각:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

**File** 탭에 입력하는 경로의 규칙:

* 절대 경로여야 합니다(`prod.json`이 아니라 `/var/lib/semaphore/secrets/prod.json`);
* `..` 세그먼트를 포함해서는 안 됩니다;
* 시크릿 디렉터리 내부의 위치로 해석되어야 합니다(하위 디렉터리는 허용됨);
* Semaphore가 실행되는 사용자가 파일을 읽을 수 있어야 합니다(공식 Docker 이미지에서는 `semaphore`, UID 1001).

환경 변수에는 이러한 제한이 없습니다. 서버는 자신의 환경에서 지정된 이름의 변수를 읽기만 합니다.

## 2. 값 형식 지정 {#format-the-value}

파일의 내용(또는 변수의 값)은 키 유형에 따라 다릅니다. 파일 끝의 줄바꿈 문자 하나는
무시되며, 그 외의 내용은 그대로 사용됩니다.

### SSH 키 {#ssh-key}

Semaphore는 원시 PEM 또는 OpenSSH 개인 키 파일이 아니라 **JSON 문서**를 기대합니다:

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — SSH 사용자 이름으로, Ansible에 `--user`로 전달됩니다. 비워 두면 인벤토리가 결정합니다(`ansible_user`). Git 저장소의 경우 로그인이 비어 있으면 기본값은 `git`입니다.
* `passphrase` — 개인 키의 암호문 또는 빈 문자열.
* `private_key` — 줄바꿈을 `\n`으로 인코딩한 개인 키.

기존 키로부터 래퍼를 생성하려면 `jq`를 사용하십시오. 이스케이프 처리를 알아서 해 줍니다:

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

그런 다음 **SSH** 유형의 키를 생성하고 **File** 탭을 열어 `/var/lib/semaphore/secrets/prod_ssh.json`
(컨테이너 **내부**에서 보이는 경로)을 입력합니다.

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
**File** 탭이 `~/.ssh/id_ed25519`와 같은 원시 개인 키를 가리키도록 하면 동작하지 않습니다.
파일이 JSON으로 파싱되므로 작업이 인벤토리를 로드하지 못하고 실패합니다.
:::

### 비밀번호 로그인 {#login-with-password}

마찬가지로 JSON 문서입니다:

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

키를 단순 token이나 비밀번호로(예: Ansible vault 비밀번호로) 사용하려면 `login`을 비워 두십시오.

## 환경 변수 예시 {#environment-variable-example}

**Env** 탭에도 동일한 JSON 형식이 적용됩니다. Docker Compose에서:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

**SSH** 키를 생성하고 **Env** 탭을 선택한 뒤 변수 이름으로 `PROD_SSH_KEY`를 입력합니다.

:::tip
환경 변수는 컨테이너 안의 모든 프로세스에서 볼 수 있으며, 오케스트레이터의 메타데이터와
로그에 남는 경우가 많습니다. 가능하면 마운트된 시크릿과 함께 **File** 탭을 사용하는 것이 좋습니다.
:::

## 문제 해결 {#troubleshooting}

| 오류 | 원인 | 해결 방법 |
|-------|-------|-----|
| `file path must be absolute` | 상대 경로를 입력함 | `/`로 시작하는 전체 경로를 입력하십시오 |
| `file path must not contain traversal segments` | 경로에 `..`이 포함됨 | 해석된 경로를 입력하십시오 |
| `file path must be inside secrets path` | 파일이 `dirs.secrets` 외부에 있음 | `SEMAPHORE_SECRETS_PATH`를 파일이 있는 디렉터리로 설정하거나 파일을 이동하십시오 |
| `no such file or directory` | 경로가 잘못되었거나 컨테이너에 마운트되지 않음 | 볼륨 마운트를 확인하고 컨테이너 내부 경로를 사용하십시오 |
| `permission denied` | Semaphore 프로세스가 파일을 읽을 수 없음 | 파일 소유자 또는 권한을 수정하십시오 |
| `invalid character '-' looking for beginning of value` | JSON 래퍼 대신 원시 개인 키를 제공함 | 위에 표시된 대로 키를 래핑하십시오 |
