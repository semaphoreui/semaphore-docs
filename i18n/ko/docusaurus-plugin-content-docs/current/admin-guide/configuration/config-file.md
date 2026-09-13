
# 설정 파일

## 설정 파일 생성 {#creating-configuration-file}

Semaphore는 핵심 설정에 `config.json` 파일을 사용합니다. 이 파일은 내장 도구를 사용하거나 웹 기반 구성 도구를 통해 대화형으로 생성할 수 있습니다.

### CLI로 생성 {#generate-via-cli}

다음 명령을 사용하여 설정 파일을 대화형으로 생성합니다.

* Semaphore 서버의 경우:
  ```
  semaphore setup
  ```
* Semaphore runner의 경우:
  ```
  semaphore runner setup
  ```
  
  :::tip
    runner 설정에 대한 자세한 내용은 <a href="./../runners">Runners</a> 섹션을 참조하십시오.
  :::

### 웹사이트에서 생성 {#generate-on-the-website}

또는 웹 기반 대화형 구성 도구를 사용할 수 있습니다.
* [서버 구성 도구](https://semaphoreui.com/install/binary/2_13/config)
* [Runner 구성 도구](https://semaphoreui.com/install/binary/2_13/runner)

## 설정 파일 예제 {#configuration-file-example}

Semaphore는 다음 내용을 가진 `config.json` 설정 파일을 사용합니다.

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## 설정 파일 사용 {#configuration-file-usage}

* Semaphore 서버의 경우:

```bash
semaphore server --config ./config.json
```

* Semaphore runner의 경우:

```bash
semaphore runner start --config ./config.json
```

## 시크릿 디렉터리 {#secrets-directory}

Semaphore는 시크릿 파일(예: [파일 기반 키 저장소 항목](/user-guide/key-store/env-and-file-sources) 또는 디스크에서 읽어오는 HashiCorp Vault 및 OpenBao 토큰)을 설정 가능한 디렉터리에서만 읽습니다.

| 옵션 | 환경 변수 | 설명 |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | 시크릿 파일 디렉터리입니다. 기본값: `/tmp/semaphore`. |
| `secrets_path` (레거시) | `SEMAPHORE_SECRETS_PATH` | 하위 호환성을 위해 유지되는 최상위 설정입니다. `dirs.secrets`가 설정되지 않았거나 기본 경로 그대로인 경우에만 사용됩니다. |

**우선순위**: 기본값이 아닌 `dirs.secrets`가 레거시 `secrets_path`보다 우선합니다. `SEMAPHORE_SECRETS_PATH`를 설정하면 Semaphore는 두 필드 모두에 이를 적용합니다.

현재 레이아웃을 사용하는 예제:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

레거시 설치에서는 여전히 다음을 사용할 수 있습니다.

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

키 저장소 양식의 **파일** 탭에서 선택한 키 파일과 외부 시크릿 저장소에서 참조하는 토큰 파일은 이 디렉터리 안에 있어야 합니다. 디렉터리 밖의 경로는 `file path must be inside secrets path` 오류와 함께 거부됩니다. [환경 변수 및 파일에서 가져오는 키](/user-guide/key-store/env-and-file-sources)를 참조하십시오.

## Git 작업 {#git-operations}

Semaphore는 매 실행 전에 작업 리포지토리를 클론하고 업데이트합니다. 이 동작은 두 가지 옵션으로 제어합니다.

| 옵션 | 환경 변수 | 설명 |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Git 클라이언트 구현: `cmd_git`(기본값, 시스템 `git` 바이너리 사용) 또는 `go_git`(순수 Go 클라이언트). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | 작업이 실패하기 전까지 클론 및 pull 작업을 시도하는 횟수입니다. 기본값: `4`. `1`로 설정하면 재시도 없이 한 번만 시도합니다. |

클론 또는 pull이 실패하고 재시도 횟수가 남아 있으면 Semaphore는 지수 백오프(1초부터 시작하여 시도마다 두 배로 증가, 최대 60초)로 대기한 뒤 `Git pull failed (...), retrying in 2s`와 같은 메시지를 로그에 기록합니다. 재시도는 네트워크 작업에만 적용됩니다. 체크아웃 실패나 인증 오류는 모든 시도를 소진한 후에도 여전히 작업을 실패시킵니다.

git 서버를 간헐적으로 사용할 수 없는 경우 `git_attempts`를 늘리십시오. 실패가 즉각적이고 지속적인 경우(잘못된 자격 증명, 존재하지 않는 리포지토리)에는 근본 원인을 해결하십시오. 재시도는 도움이 되지 않습니다.

