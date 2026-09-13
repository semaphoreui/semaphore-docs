# Runner

`semaphore runner` 명령은 Semaphore를 **runner 모드**로 실행하고 서버에 대한
runner 등록을 관리합니다. runner는 Semaphore 서버와 별도의 머신에서 작업을
실행합니다.

```bash
semaphore runner --help
```

:::tip
runner의 동작 방식과 서버 측 구성 방법은 [Runner](/admin-guide/runners)
가이드를 참고하십시오.
:::

하위 명령 없이 `semaphore runner`를 실행하면 도움말만 출력됩니다. 다음
하위 명령이 있습니다.

| 명령 | 용도 |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | 대화형으로 runner 구성 파일을 생성합니다(token이 제공되면 등록도 수행). |
| [`runner register`](#registering-a-runner-runner-register) | 등록 token을 사용하여 서버에 runner를 등록합니다. |
| [`runner start`](#starting-a-runner-runner-start) | runner 모드로 실행하고 작업 수락을 시작합니다. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | 서버에서 runner 등록을 제거합니다. |

모든 하위 명령은 runner 구성 파일을 가리키는 전역 `--config <path>` 플래그(및
환경 변수만으로 실행하는 `--no-config`)를 받습니다.

## 대화형 설정 (`runner setup`) {#interactive-setup-runner-setup}

대화형 설정을 진행하고 runner 구성 파일을 작성하며, 등록 token을 사용할 수
있는 경우(프롬프트에서 입력했거나 `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`으로
설정한 경우) 즉시 서버에 runner를 등록합니다.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

`--config <path>`를 전달하여 구성 파일이 작성될 위치를 선택할 수 있습니다.
전달하지 않으면 setup이 출력 디렉터리(기본값: 현재 디렉터리)를 묻고
그곳에 `config.runner.json`을 작성합니다.

완료되면 runner를 실행하는 명령을 출력합니다. 예:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

이후에는 setup을 다시 실행하는 대신 생성된 구성 파일을 직접 편집할 수 있습니다.

### Runner 구성 옵션 {#runner-configuration-options}

구성 파일의 `runner` 블록에 있는 필드:

| 필드 | 환경 변수 | 설명 |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | runner 인증 token(등록 시 발급). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | 등록 token. 환경 변수로만 지정할 수 있으며 파일에는 절대 기록되지 않습니다. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | 등록 token이 들어 있는 파일의 경로. |
| `name` | `SEMAPHORE_RUNNER_NAME` | 서버에 표시되는 runner 이름. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | 프로젝트 runner 라우팅에 사용되는 태그의 JSON 배열. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | 이 runner에 작업이 대기열에 추가될 때 서버가 호출하는 URL. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | runner가 작업을 수락할지 여부. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | 프로젝트 수준 runner의 프로젝트 ID. 전역 runner의 경우 생략합니다. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | 폴링 간격(초). 기본값: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | 최대 동시 작업 수. 기본값: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | 작업 하나를 처리한 후 종료합니다. webhook으로 필요할 때 시작되는 runner에 유용합니다. |

설정에 대한 자세한 내용은 [Runner](/admin-guide/runners)를, 전체 옵션 목록은
[구성](/admin-guide/configuration)을 참고하십시오.

## Runner 등록 (`runner register`) {#registering-a-runner-runner-register}

서버에 runner를 등록하고 발급된 runner token을 구성 파일에 저장합니다(기존
token이 있으면 덮어씀). 서버에 `runner_registration_token`이 구성되어 있어야
하며, 여기에 그와 동일한 token을 전달합니다.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| 플래그 | 설명 |
|------|-------------|
| `--registration-token-file <path>` | 파일에서 등록 token을 읽습니다. |
| `--stdin-registration-token` | stdin에서 등록 token을 읽습니다. |
| `--name <name>` | 등록할 runner 이름. |
| `--tags <tags>` | runner 태그. 쉼표로 구분하거나 플래그를 반복합니다(예: `--tags a,b` 또는 `--tags a --tags b`). |
| `--webhook <url>` | runner webhook URL. |
| `--enabled` | 서버에서 runner를 활성화 또는 비활성화합니다. 기본값은 `true`이며, 비활성화된 runner로 등록하려면 `--enabled=false`를 전달합니다. |
| `--project-id <id>` | 지정한 프로젝트의 프로젝트 수준 runner로 등록합니다. 생략하거나 `0`이면 전역 runner로 등록됩니다. |

실제로 전달한 플래그만 적용됩니다. `--name`, `--webhook`, `--tags`, `--enabled`는
명령줄에서 지정한 경우에만 구성 파일과 환경 변수의 해당 값을 덮어씁니다.

### 등록 token의 출처 {#where-the-registration-token-comes-from}

등록 시 Semaphore는 다음 순서로 처음 사용 가능한 출처에서 등록 token을
가져옵니다.

1. `--registration-token-file` 플래그.
2. 구성 파일의 `registration_token_file` 설정(또는
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. `--stdin-registration-token`이 전달된 경우 표준 입력.
4. `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` 환경 변수.

token 파일이 존재하지만 비어 있으면 오류입니다. 어떤 출처에서도 token을
얻지 못하면 token 없이 등록을 시도하며 서버가 이를 거부합니다.

## Runner 시작 (`runner start`) {#starting-a-runner-runner-start}

runner를 시작하고 서버에 연결하여 작업 수락을 시작합니다. 등록된 runner를
온라인 상태로 유지하기 위해 실행하는 명령입니다.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| 플래그 | 설명 |
|------|-------------|
| `--auto-register` | runner가 아직 등록되지 않은 경우(즉, 구성에 runner token이 없는 경우) 시작하기 전에 등록합니다. |
| `--register` | `--auto-register`의 별칭. |

`--auto-register`를 사용하면 구성에 `token`이 없을 때 Semaphore가
`registration_token_file`(또는 `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`)
또는 `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`에서 등록 token을 읽은 다음,
성공할 때까지 5초마다 등록을 재시도하고, 구성을 다시 로드한 후 시작합니다.
예를 들어 컨테이너에서 최초 부팅 시 스스로 등록하는 runner에 편리합니다.

`runner start`는 `--registration-token-file`이나 `--stdin-registration-token`을
받지 않습니다. 이 플래그들은 `runner register`에서만 사용할 수 있습니다.

## Runner 등록 해제 (`runner unregister`) {#unregistering-a-runner-runner-unregister}

구성 파일의 runner token을 사용하여 서버에서 runner 등록을 제거합니다.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
