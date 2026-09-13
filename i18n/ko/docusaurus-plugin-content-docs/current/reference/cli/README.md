# CLI

`semaphore` 바이너리는 서버이자 완전한 관리 도구입니다. 인수 없이
실행하거나(`semaphore help`) 다음 명령을 실행하면 모든 명령을 확인할 수 있습니다.

```bash
semaphore help
```

모든 명령과 플래그를 빠짐없이 담은 생성된 목록은
[명령 레퍼런스](/reference/cli/commands)를 참고하세요. 대부분의 관리 작업에는 전용 명령 그룹이 있습니다.

| 명령 그룹 | 용도 |
|---------------|---------|
| [`semaphore users`](/reference/cli/users) | 사용자 추가, 변경, 삭제, 조회 및 API token과 TOTP(2FA) 관리. |
| [`semaphore projects`](/reference/cli/projects) | 프로젝트 내보내기 및 가져오기(백업). |
| [`semaphore vaults`](/reference/cli/vaults) | 저장된 비밀 정보 재암호화 및 암호화 키 사용 현황 확인. |
| [`semaphore runner`](/reference/cli/runners) | runner 모드로 실행하고 runner를 등록/등록 해제. |
| [`semaphore migrate`](/reference/cli/migrations) | 데이터베이스 마이그레이션 적용 또는 롤백. |

일부 명령 그룹에는 짧은 별칭이 있습니다: `users`/`user`, `projects`/`project`,
`vaults`/`vault`, `server`/`service`.

:::info
데이터베이스를 사용하는 모든 명령(`users`, `projects`, `vaults`, `migrate`,
`server`)은 실행 전에 보류 중인 스키마 마이그레이션을 적용합니다. 기존
데이터베이스에 대해 더 새로운 Semaphore 버전의 CLI를 실행하기 전에 데이터베이스를
백업하십시오.
:::

## 전역 옵션 {#global-options}

다음 플래그는 모든 명령에서 사용할 수 있습니다.

| 옵션 | 설명 |
|--------|-------------|
| `--config <path>` | 구성 파일 경로. |
| `--no-config` | 구성 파일을 읽지 않고 환경 변수만 사용합니다. |
| `--log-level <level>` | 로그 상세 수준: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` 또는 `PANIC`. 지정하지 않으면 `SEMAPHORE_LOG_LEVEL` 환경 변수를 사용합니다. |
| `--debug-filter <spec>` | `DEBUG` 출력을 특정 네임스페이스로 제한합니다. 예: `'runner,task_*'` 또는 `'*,-db'`. 로그 수준이 `DEBUG`일 때만 적용됩니다. 지정하지 않으면 `SEMAPHORE_DEBUG_FILTER`를 사용합니다. |

### 구성 파일을 찾는 방법 {#how-the-configuration-file-is-found}

`--config`를 생략하면 Semaphore는 다음 순서로 파일을 찾고 처음 존재하는
파일을 사용합니다.

1. `SEMAPHORE_CONFIG_PATH` 환경 변수에 지정된 경로.
2. 현재 디렉터리의 `config.json`, `config.yaml` 또는 `config.yml`.
3. `/usr/local/etc/semaphore/config.json`(또는 `.yaml` / `.yml`).
4. `/etc/semaphore/config.json`(또는 `.yaml` / `.yml`).

환경 변수는 파일 위에 적용되므로 파일의 값을 재정의합니다. `--no-config`를
사용하면 환경 변수와 기본값만 사용됩니다. 전체 옵션 목록은
[구성](/admin-guide/configuration)을 참고하십시오.

## 버전 {#version}

현재 버전을 출력합니다.

```bash
semaphore version
```

## 대화형 설정 {#interactive-setup}

최초 구성 시 사용합니다. 비밀 값을 생성하고, 대화형 질문을 진행하고,
구성 파일을 작성하고, 데이터베이스 마이그레이션을 실행하고, 첫 번째 관리자
사용자를 생성합니다.

```bash
semaphore setup
```

`--config <path>`를 전달하여 구성 파일이 작성될 위치를 선택할 수 있습니다.
전달하지 않으면 setup이 출력 디렉터리(기본값: 현재 디렉터리)를 묻고
그곳에 `config.json`을 작성합니다.

입력한 사용자 이름이나 이메일이 이미 존재하면 setup은 새 사용자를 생성하는
대신 기존 사용자를 유지합니다.

완료되면 서버를 시작하는 명령을 출력합니다. 예:

```bash
./semaphore server --config /path/to/config.json
```

## 서버 모드 {#server-mode}

Semaphore 서버(웹 UI 및 API)를 시작합니다. `service`는 `server`의 별칭입니다.

```bash
semaphore server --config /path/to/config.json
```

서버는 시작 시 보류 중인 데이터베이스 마이그레이션을 적용하고 사용 중인
데이터베이스, 임시 경로, 인터페이스, 포트를 출력합니다.

## Runner 모드 {#runner-mode}

Semaphore를 작업 runner로 실행합니다. 전체 하위 명령(`setup`, `register`,
`start`, `unregister`)은 [Runner](/reference/cli/runners)를 참고하십시오.

```bash
semaphore runner start --config /path/to/runner-config.json
```

## 데이터베이스 마이그레이션 {#database-migration}

데이터베이스 스키마를 최신 상태로 만듭니다. 특정 버전으로 적용하거나
롤백하는 방법은 [데이터베이스 마이그레이션](/reference/cli/migrations)을
참고하십시오.

```bash
semaphore migrate --config /path/to/config.json
```
