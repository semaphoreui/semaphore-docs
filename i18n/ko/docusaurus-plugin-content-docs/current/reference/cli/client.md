---
title: 클라이언트
description: semaphore client로 터미널과 스크립트에서 Semaphore 서버를 관리하는 방법 - 로그인과 컨텍스트, 설정 우선순위, 출력 형식, 종료 코드, CI에서 작업 실행.
---

# 클라이언트

`semaphore client`는 실행 중인 Semaphore 서버를 REST API를 통해 제어합니다. 서버 URL과
API token만 있으면 되며 데이터베이스 접근이나 서버 설정 파일은 필요하지 않습니다. 따라서
노트북, CI 작업, 또는 서버의 `config.json`을 한 번도 본 적 없는 호스트에서도 동작합니다.

```bash
semaphore client --help
```

명령은 `semaphore client <resource> <action> [id|name]` 형식을 따릅니다.
리소스 이름은 단수형이며 복수형이 별칭입니다
(`template list`와 `templates list`는 같습니다). 모든 리소스에는 `list`,
`get`, `create`, `update`, `delete`가 있고, 작업(task)에는 `run`, `logs`, `wait`, `stop`
등이 추가됩니다. 모든 명령과 플래그를 빠짐없이 담은 자동 생성 목록은
[명령 참조](/reference/cli/commands#semaphore-client)에 있습니다.

| 그룹 | 용도 |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | 로그인, token 확인, token 출력, 로그아웃을 수행합니다. |
| [`context`](/reference/cli/commands#semaphore-client-context) | 하나의 설정 파일에 여러 서버를 저장하고 서로 전환합니다. |
| [`project`](/reference/cli/commands#semaphore-client-project) | 프로젝트와 그 구성원, 백업 및 복원. |
| [`template`](/reference/cli/commands#semaphore-client-template) | 작업 템플릿, 그리고 작업을 시작하는 `template run`. |
| [`task`](/reference/cli/commands#semaphore-client-task) | 작업의 로그, 대기, 중지, 승인, 재실행. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | 프로젝트의 나머지 리소스. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | 서버 전체 리소스(관리자 전용). |
| [`info`](/reference/cli/commands#semaphore-client-info) | 서버 버전과 설정. |

## 첫 로그인 {#first-login}

대화형 방식에서는 클라이언트가 로그인, 비밀번호, 그리고 TOTP가 활성화된 경우 코드를
묻고, API token을 생성하여 저장합니다. 비밀번호는 한 번만 사용되며 저장되지 않습니다.

```bash
semaphore client auth login --url https://semaphore.example.com
```

기존 token을 사용하는 경우(Single Sign-On만 제공하는 서버에 로그인하는 방법이기도 합니다.
token은 프로필의 **Tokens** 페이지에서 생성하십시오):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

두 방식 모두 서버 호스트 이름을 딴 *컨텍스트*를 `~/.semaphore/client.yml`에 저장하고
이를 현재 컨텍스트로 지정합니다. 사용 중인 컨텍스트는 `semaphore client auth status`로
확인할 수 있습니다.

## 설정 {#configuration}

모든 설정은 플래그, 환경 변수 또는 현재 컨텍스트에서 가져올 수 있으며, 우선순위는
**플래그 > 환경 변수 > 컨텍스트 > 기본값** 순입니다.

| 플래그 | 환경 변수 | 의미 |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | 서버 URL. 예: `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | 현재 컨텍스트 대신 사용할 컨텍스트의 이름. |
| — | `SEMAPHORE_CLIENT_TOKEN` | API token. `--token` 플래그는 의도적으로 제공하지 않습니다. 프로세스 인수는 `ps`와 셸 기록에서 보이기 때문입니다. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | token이 담긴 파일(끝의 줄바꿈은 무시됩니다). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | 프로젝트 범위 명령에 사용할 프로젝트 ID 또는 이름. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table`(기본값), `json` 또는 `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | HTTP 요청 하나의 타임아웃. 기본값은 `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | 서버 인증서에 서명한 CA가 담긴 PEM 파일. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | TLS 검증을 건너뜁니다. 호출할 때마다 경고가 출력되므로 `--ca-cert`를 사용하는 것이 좋습니다. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | 입력을 요청하지 않습니다. 응답이 필요한 명령은 대신 실패합니다. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | HTTP 요청을 stderr에 추적합니다. Authorization 헤더와 쿠키 헤더는 마스킹됩니다. |
| — | `SEMAPHORE_CLIENT_CONFIG` | 설정 파일 경로. 기본값은 `~/.semaphore/client.yml`. |

환경 변수의 token은 URL도 환경 변수나 플래그에서 지정된 경우에만 사용됩니다.
이렇게 하면 누군가 같은 작업을 `--context other`로 실행할 때 CI token이 다른 서버로
전송되는 것을 막을 수 있습니다.

### 설정 파일 {#the-configuration-file}

`~/.semaphore/client.yml`에는 이름이 지정된 컨텍스트가 저장됩니다. `auth login`과 `context set`이
이 파일을 기록하며, 직접 편집할 수도 있습니다.

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # 또는 token_file
    project: 3                # 기본 프로젝트, ID 또는 이름
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

클라이언트는 디렉터리를 모드 `0700`으로, 파일을 `0600`으로 생성합니다. 그룹이나 다른
사용자가 쓸 수 있는 파일은 거부되며 `chmod 600`을 실행하라는 안내가 표시됩니다. 다른
사용자가 읽을 수 있는 파일에는 경고가 표시됩니다.

## 출력 {#output}

데이터는 stdout으로, 메시지, 경고, 진행 상황은 stderr로 출력되므로 스크립트는 둘 중
하나만 캡처할 수 있습니다.

| 플래그 | 효과 |
|------|--------|
| `-o json` | 장식 없는 유효한 JSON. 목록은 항상 배열이며, 빈 목록은 `[]`입니다. 필드 이름은 API의 필드 이름과 같습니다. |
| `-o yaml` | 같은 데이터를 YAML로 출력합니다. |
| `--fields id,name,status` | 지정한 열 또는 필드만 출력합니다. 중첩 필드는 점으로 구분합니다: `--fields id,params.limit`. |
| `-q`, `--quiet` | ID만 한 줄에 하나씩 출력합니다. `xargs`와 반복문에 사용합니다. |
| `--no-headers` | 헤더 줄 없이 표를 출력합니다. |
| `--no-color` | 색상을 사용하지 않습니다. stdout이 터미널이 아니거나 `NO_COLOR`가 설정된 경우에도 색상이 꺼집니다. |

stdout이 터미널이 아니면 표의 열은 탭으로 구분되며 잘리지 않습니다.

객체는 숫자 ID 또는 이름으로 지정합니다. 이름은 프로젝트 안에서 대소문자를 구분하지 않고
검색됩니다. 같은 이름을 가진 객체가 여러 개이면 명령은 코드 5로 종료하고 후보를 stderr에
나열합니다.

## 종료 코드 {#exit-codes}

| 코드 | 의미 |
|------|---------|
| `0` | 성공. 대기하는 명령의 경우 작업이 `success`로 끝났음을 뜻합니다. |
| `1` | 클라이언트 또는 API 오류 — 네트워크 장애, 서버 오류, 예상치 못한 응답. |
| `2` | 사용법 오류: 알 수 없는 플래그, 누락된 인수, 프로젝트 미지정, 또는 터미널 없이 확인이 필요한 경우(`--yes`를 지정하십시오). |
| `3` | 대기 중이던 작업이 `error` 상태로 끝났습니다. |
| `4` | 인증에 실패했습니다(HTTP 401 또는 403). |
| `5` | 객체를 찾을 수 없거나, 이름이 여러 객체와 일치합니다. |
| `6` | 대기 중이던 작업이 `stopped` 상태로 끝났습니다. |
| `124` | `--wait-timeout`이 경과했습니다. 작업은 서버에서 계속 실행됩니다. |
| `130` | Ctrl+C로 중단되었습니다. 클라이언트는 연결을 끊으며, `--stop-on-interrupt`를 지정하지 않았다면 작업은 계속 실행됩니다. |

## 스크립트에서 작업 실행 {#running-tasks-from-scripts}

CI 작업은 모두 환경 변수로 설정하고, 결과 판정은 종료 코드에 맡기십시오.

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# 작업을 시작하고 로그를 스트리밍한 뒤, 최종 상태에 따라 0/3/6으로 종료
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# 지금 시작하고 나중에 대기
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v`와 `--extra-vars-file`은 작업의 추가 변수를 채웁니다.
`--inventory`, `--branch`, `--limit`, `--tags`, `--check`, `--diff`는 템플릿이
재정의를 허용하는 항목을 재정의합니다.

작업은 도중에 멈춰 승인을 기다릴 수 있습니다. 적용 전의 Terraform 플랜이나,
먼저 묻는 앱을 쓰는 템플릿이 그렇습니다. 터미널에서는 클라이언트가
`Apply task <id>? [yes/no]`를 출력하고 답을 서버로 보냅니다. 터미널이 없으면
멈춤을 stderr에 알리고 계속 기다리므로, CI 작업에서는 다른 곳에서
`task confirm <id>` 또는 `task reject <id>`를 실행하거나, 템플릿이 허용하면
`--auto-approve`를 쓰거나, `--wait-timeout`으로 중단해야 합니다. 게이트 앞에서
멈추면 안 되는 파이프라인이라면 `--auto-reject`가 그런 작업을 묻는 즉시
거부합니다. 거부된 작업은 `error`로 끝나므로 종료 코드는 3입니다.

표에 나타나지 않는 정보는 `-o json`과 `jq`를 함께 사용해 얻으십시오.

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## 시크릿과 token {#secrets-and-tokens}

- token은 출력되지 않습니다. 예외는 `auth token`으로, 이 명령은 token을 다른 도구에
  전달하기 위해 존재하며 stdout이 터미널이면 경고를 표시합니다.
- 비밀번호와 키 자료는 파일이나 stdin에서만 읽습니다:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. 환경의 시크릿은
  `environment create --secrets-file`로 전달합니다.
- `environment get`과 `key get`은 모든 출력 형식에서 시크릿의 이름만 보여 주며
  값은 보여 주지 않습니다.
- `auth logout --revoke`는 로컬뿐 아니라 서버에서도 token을 삭제합니다.
- 파괴적인 명령은 터미널에서 확인을 요청하며, 터미널이 없으면 `--yes`가 필요합니다.
  `project delete`에는 `--confirm`으로 프로젝트 이름을 지정해야 합니다.
