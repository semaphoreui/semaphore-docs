---
title: AI 에이전트
description: Claude Code 또는 Codex 에이전트 템플릿 생성, 프롬프트와 프롬프트 표현식, API 키, MCP 서버, CLI 인수, 작업 로그를 설명합니다.
---

# AI 에이전트

Semaphore UI를 사용하면 AI 코딩 에이전트인 [Claude Code](https://docs.claude.com/en/docs/claude-code/overview)와 [Codex](https://developers.openai.com/codex/cli)를 실행할 수 있습니다. 에이전트 템플릿은 리포지토리의 디렉터리에서 에이전트의 명령줄 도구를 시작하고 프롬프트를 전달합니다. 에이전트는 질문에 답해 줄 사람 없이 스스로 작업하며, 수행한 내용을 작업 로그에 기록합니다.

:::note

AI 에이전트 템플릿은 **Semaphore 2.21**부터 사용할 수 있습니다.

:::

에이전트 템플릿은 동료에게 말로 설명해서 맡길 만한 작업에 사용하십시오. 예를 들어 마지막 커밋을 검토하거나, 실패하는 테스트를 찾아 수정하거나, 의존성을 업데이트하고 풀 리퀘스트를 여는 작업입니다. 다른 템플릿과 마찬가지로 직접 시작할 수도 있고, [스케줄](/user-guide/schedules), [통합](/user-guide/integrations), [워크플로](/user-guide/workflows)로 시작할 수도 있습니다.

## 시작하기 전에 {#before-you-begin}

- **에이전트의 명령줄 도구가 설치되어 있어야 합니다.** 설치 위치는 작업을 실행하는 머신, 즉 Semaphore 서버 또는 [러너](/admin-guide/runners)입니다.

  | 애플리케이션 | ID | 명령 | 설치 |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore는 시작할 때 `PATH`에서 명령을 찾으면 해당 애플리케이션을 활성화합니다. 관리자가 [애플리케이션](/user-guide/apps#managing-applications) 페이지에서 애플리케이션을 활성화하고 실행 파일의 경로를 지정할 수도 있습니다.
- **모델 제공업체의 API 키**. [API 키](#api-key)를 참조하십시오.
- **에이전트가 작업할 리포지토리**. [리포지토리](/user-guide/repositories)에 추가되어 있어야 합니다.

## 템플릿 생성 {#create-a-template}

1. **작업 템플릿** 섹션으로 이동하여 **새 템플릿**을 클릭한 다음 **Claude Code Agent** 또는 **Codex Agent**를 클릭합니다.

![Claude Code Agent와 Codex Agent 항목이 있는 새 템플릿 메뉴](/assets/agent-template-new.webp)

2. 템플릿을 설정합니다.

![Claude Code Agent 템플릿 편집기](/assets/agent-template-editor.webp)

템플릿에서는 다음 매개변수를 지정할 수 있습니다:

| 필드 | 설명 |
|---|---|
| **리포지토리** | 에이전트가 작업하는 리포지토리입니다. 다른 템플릿과 마찬가지로 Semaphore가 작업 전에 리포지토리를 클론하거나 업데이트합니다. |
| **Subdirectory path** | 선택 사항. 에이전트가 시작되는 리포지토리 내 디렉터리입니다. 생략하면 에이전트는 리포지토리 루트에서 시작됩니다. |
| **MCP servers** | 선택 사항. 에이전트가 도구를 호출할 수 있는 서버가 등록된 MCP 인벤토리입니다. [MCP 서버](#mcp-servers)를 참조하십시오. |
| **변수 그룹** | 에이전트를 위한 변수와 시크릿입니다. API 키, [프롬프트 표현식](#prompt-expressions)에 쓰이는 값, 에이전트 프로세스의 환경 변수를 지정합니다. |
| **Prompt** | 에이전트가 수행할 지시문입니다. [프롬프트](#prompt)를 참조하십시오. |
| **CLI args** | 에이전트 명령에 추가되는 인수입니다. [CLI 인수](#cli-arguments)를 참조하십시오. |
| **설문 변수** | 작업을 시작할 때 묻는 질문입니다. 답변을 프롬프트에 넣을 수 있습니다. |
| **Prompt** 체크박스 | **Claude Code prompts** 또는 **Codex prompts** 아래에 있습니다. 작업을 시작하는 사용자가 프롬프트를 바꿀 수 있게 합니다. [작업의 프롬프트](#prompt-of-a-task)를 참조하십시오. |

3. **Save**를 클릭한 다음 **Run** 버튼으로 템플릿을 실행합니다.

## API 키 {#api-key}

에이전트는 환경 변수에서 API 키를 가져옵니다. 키를 템플릿의 [변수 그룹](/user-guide/environment)에 **시크릿 환경 변수**로 추가하십시오:

| 애플리케이션 | 변수 | 대신 사용할 수 있는 변수 |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

Semaphore를 실행하는 사용자의 로그인 정보는 사용되지 않습니다. 작업마다 에이전트 전용의 빈 설정 디렉터리가 주어지므로, 변수 그룹의 키가 유일한 인증 방법입니다.

변수가 하나도 설정되어 있지 않으면 작업 로그에 어떤 변수를 추가해야 하는지 표시되고, 이후 에이전트가 자체 오류와 함께 실패합니다:

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## 프롬프트 {#prompt}

프롬프트는 에이전트에 직접 입력할 내용입니다. 일반 텍스트이며 필요한 만큼 길게 작성할 수 있습니다. 프롬프트는 표준 입력으로 에이전트에 전달되므로 프로세스 목록에 나타나지 않습니다.

프롬프트는 필수입니다. 단, **Prompt** 체크박스로 작업이 자체 프롬프트를 지정할 수 있게 한 경우에는 생략할 수 있습니다.

### 프롬프트 표현식 {#prompt-expressions}

템플릿의 프롬프트에는 템플릿의 변수 그룹에 있는 값을 넣을 수 있습니다. GitHub Actions에서처럼 이중 중괄호로 표현식을 작성하면 Semaphore가 작업을 시작할 때 값으로 바꿉니다:

| 표현식 | 값 |
|---|---|
| `${{ vars.extra.NAME }}` | 변수 그룹의 추가 변수. |
| `${{ vars.env.NAME }}` | 변수 그룹의 환경 변수. |
| `${{ secrets.extra.NAME }}` | 변수 그룹의 시크릿 추가 변수. |
| `${{ secrets.env.NAME }}` | 변수 그룹의 시크릿 환경 변수. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

규칙은 다음과 같습니다:

- **설문 변수**는 추가 변수로 취급됩니다. 설문 변수 `version`의 답변은 `${{ vars.extra.version }}`이고, 시크릿 설문 변수는 `${{ secrets.extra.NAME }}`입니다. 환경 변수로 전달되는 설문 변수는 대신 `env` 아래에 있습니다. 답변하지 않은 설문 변수는 빈 문자열이 됩니다.
- **존재하지 않는 변수를 참조하면 작업이 실패합니다.** 에이전트가 시작되기 전에 해당 표현식을 알려 주는 메시지와 함께 실패합니다. Semaphore는 프롬프트에 구멍이 난 채로 에이전트를 실행하지 않습니다.
- **잘못 작성된 표현식은 템플릿을 저장할 때 거부됩니다.** 예를 들어 `${{ secrets.TOKEN }}`에는 `extra`도 `env`도 없습니다.
- **그 외의 표현식은 그대로 둡니다.** Semaphore가 처리하는 것은 `vars.…`와 `secrets.…`뿐이므로, 프롬프트에서 `${{ github.sha }}`가 들어간 워크플로를 작성하도록 에이전트에 요청할 수 있습니다. `vars` 또는 `secrets` 표현식을 텍스트 그대로 유지하려면 앞에 달러 기호를 하나 더 붙이십시오: `$${{ secrets.env.NAME }}`.
- **값은 있는 그대로 들어갑니다.** 문자열은 작성된 그대로, 목록이나 객체는 JSON으로 들어갑니다. 들어간 값 안의 표현식은 다시 처리되지 않습니다.
- **프롬프트에 넣은 시크릿은 작업 로그에서 마스킹됩니다.** 에이전트가 그 값을 어디에서 반복하든 마찬가지입니다.

:::warning

프롬프트에 포함된 시크릿은 프롬프트의 나머지 부분과 함께 모델 제공업체로 전송되며, 에이전트는 프롬프트가 허용하는 어떤 방식으로든 이를 사용할 수 있습니다. 시크릿은 가급적 에이전트의 도구에 전달하십시오. 변수 그룹의 시크릿 환경 변수로 전달하거나 [MCP 서버](#mcp-servers)의 토큰으로 전달하는 방법이 있습니다.

:::

### 작업의 프롬프트 {#prompt-of-a-task}

**Prompt** 체크박스를 활성화하면 작업 양식에 템플릿의 프롬프트가 표시되고, 해당 실행에 한해 이를 변경할 수 있습니다. 스케줄, 통합, 워크플로 단계도 같은 방식으로 자체 프롬프트를 가질 수 있습니다. API를 사용하는 경우 작업 매개변수에 넣어 전송하십시오:

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

작업이 지정한 프롬프트는 작성된 그대로 사용됩니다. **프롬프트 표현식은 템플릿에 저장된 프롬프트에서만 치환됩니다.** 이렇게 하면 작업 실행 권한만 있는 사용자로부터 프로젝트의 변수와 시크릿이 보호됩니다. 템플릿이 허용하지 않으면 프롬프트를 지정한 작업은 거부됩니다.

## MCP 서버 {#mcp-servers}

에이전트는 원격 [MCP](https://modelcontextprotocol.io) 서버의 도구를 호출할 수 있습니다. 이슈 트래커, 문서 검색, 자체 서비스 등이 그 예입니다. 서버는 **MCP Inventory** 유형의 인벤토리에 보관되며, 하나의 인벤토리를 Claude Code 템플릿과 Codex 템플릿 모두에서 사용할 수 있습니다.

1. **인벤토리** 섹션으로 이동하여 **새 인벤토리**를 클릭한 다음 **MCP Inventory**를 클릭합니다.
2. 서버를 추가하고 **Save**를 클릭합니다.
3. 템플릿의 **MCP servers** 필드에서 해당 인벤토리를 선택합니다.

![서버 세 개가 등록된 MCP 인벤토리 양식](/assets/agent-mcp-inventory.webp)

| 필드 | 설명 |
|---|---|
| 스위치 | 꺼 둔 서버는 목록에 남아 있지만 에이전트에 전달되지 않습니다. |
| **Name** | 에이전트가 서버를 식별하는 이름입니다. 영문자, 숫자, `-`, `_`를 최대 64자까지 사용할 수 있습니다. 작업 로그에서 도구 이름 앞에 표시됩니다. |
| **URL** | HTTP 또는 SSE로 MCP를 지원하는 서버의 `http` 또는 `https` 주소입니다. URL에 사용자 이름이나 비밀번호를 넣을 수 없습니다. |
| **Token** | 선택 사항. 에이전트가 `Authorization` 헤더에 bearer 토큰으로 넣어 전송합니다. |

저장된 토큰은 암호화되어 보관되며 다시 표시되지 않습니다. 교체하려면 새 토큰을 입력하고, 삭제하려면 X 버튼을 사용하십시오. 토큰은 에이전트 프로세스의 환경 변수로 전달되며, 에이전트의 설정 파일, 명령줄, 작업 로그에는 기록되지 않습니다.

호출을 확인해 줄 사람이 없으므로 선택한 서버의 도구는 미리 승인됩니다. 에이전트는 정확히 이 서버들만 받습니다. Semaphore를 실행하는 사용자에게 설정된 MCP 서버는 사용되지 않습니다.

## CLI 인수 {#cli-arguments}

**CLI args**는 Semaphore가 자체적으로 설정하는 인수 뒤에 에이전트 명령에 추가됩니다. 각 토큰을 별도의 인수로 입력하십시오:

```json
["--model", "claude-sonnet-5-5"]
```

CLI 인수는 에이전트의 명령줄이 제공하는 기능, 즉 모델, 각종 한도, 권한을 지정하는 데 사용하십시오. 에이전트는 무인으로 실행되므로 확인을 요청하는 도구는 대신 거부됩니다. 에이전트가 확인 없이 사용할 수 있는 도구는 인수로 설정합니다. 사용 중인 버전의 옵션은 [Claude Code CLI 레퍼런스](https://docs.claude.com/en/docs/claude-code/cli-reference)와 [Codex CLI 레퍼런스](https://developers.openai.com/codex/cli/reference)를 참조하십시오.

**Prompts** 아래의 **CLI args**를 활성화하면 작업이 자체 인수를 추가할 수 있습니다.

변수 그룹의 변수와 시크릿은 에이전트의 명령줄에 추가되지 않습니다. 명령줄은 프로세스 목록에서 볼 수 있기 때문입니다. 환경 변수와 시크릿 환경 변수는 에이전트의 프로세스에 전달됩니다.

## 에이전트 실행 방식 {#how-the-agent-runs}

Semaphore는 리포지토리 디렉터리 또는 그 안의 **Subdirectory path**에서 에이전트를 시작하고, 프롬프트를 표준 입력으로 전달합니다:

| 애플리케이션 | 명령 |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **작업마다 에이전트 전용 설정 디렉터리가 있습니다**(`CLAUDE_CONFIG_DIR`, `CODEX_HOME`). 작업을 위해 생성되고 작업이 끝나면 삭제됩니다. Semaphore를 실행하는 사용자의 설정, 로그인 정보, MCP 서버는 에이전트에 전달되지 않으며, 변수 그룹의 변수로 이 디렉터리를 다른 곳으로 바꿀 수도 없습니다.
- **작업 간에는 아무것도 유지되지 않습니다.** 실행할 때마다 에이전트의 새 세션이 시작됩니다. 실행 후에도 남아야 하는 것은 커밋, 풀 리퀘스트, 파일의 형태로 리포지토리에 남기십시오.
- **에이전트는 리포지토리의 지침 파일을 읽습니다.** `CLAUDE.md`나 `AGENTS.md`처럼 명령줄 도구가 작업 디렉터리에서 스스로 읽는 파일입니다.
- **Docker 및 Kubernetes 러너에서는** 에이전트가 컨테이너 안에서 실행되므로 [실행기 이미지](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)에 `claude` 또는 `codex` 명령이 포함되어 있어야 합니다.

## 작업 로그 {#task-log}

작업 로그는 에이전트의 작업을 진행되는 대로 보여 줍니다:

![Claude Code 작업의 로그: 모델, 도구 호출, 하위 에이전트, 요약](/assets/agent-task-log.webp)

- 에이전트의 **텍스트**. 한 줄씩 표시됩니다. Codex는 메시지가 완성되면 출력합니다.
- **도구 호출**. 호출마다 한 행으로 표시되며 상태, MCP 서버와 도구, 인수가 나타납니다. 행을 클릭하면 인수와 결과를 볼 수 있습니다. 실패한 호출은 처음부터 펼쳐져 있습니다.
- **하위 에이전트**. 하위 에이전트의 행에는 그 이름이 표시됩니다.
- Claude Code 실행의 **첫 번째 행**에는 모델과 MCP 서버가 표시되며, 연결되지 않은 서버는 빨간색으로 표시됩니다.
- 마지막의 **요약**. 턴 수, 소요 시간, 토큰, 비용이 에이전트가 보고하는 범위 내에서 표시됩니다.

**Raw log**는 같은 로그를 일반 텍스트로 보여 줍니다.

## 보안 {#security}

- **에이전트는 명령을 실행합니다.** 명령줄 도구가 부여하는 권한 범위 안에서 에이전트는 리포지토리 디렉터리를 읽고 변경하며, 작업을 실행하는 사용자 권한으로 프로그램을 실행하고, MCP 서버의 도구를 호출할 수 있습니다. 에이전트 템플릿에는 다른 사람이 작성한 스크립트에 줄 만큼의 접근 권한만 부여하십시오. 즉, 작업에 필요한 최소한의 권한을 가진 리포지토리와 토큰을 사용하고, 서버와 분리해 두고 싶은 작업에는 별도의 [러너](/admin-guide/runners)를 사용하십시오.
- **프롬프트와 에이전트가 읽는 내용은 모델 제공업체로 전송됩니다.** 리포지토리의 파일, 명령의 출력, 도구의 결과가 여기에 포함됩니다.
- **리포지토리가 에이전트에 지시를 내릴 수 있습니다.** 에이전트가 읽는 파일, 이슈, 도구 결과에 들어 있는 텍스트가 에이전트의 동작을 바꿀 수 있습니다. 강력한 토큰을 가진 에이전트를 직접 통제하지 않는 콘텐츠에 사용하지 마십시오.
- **토큰과 시크릿은 작업 로그에서 마스킹됩니다.** MCP 서버의 토큰과 프롬프트에 넣은 시크릿은 `********`로 대체됩니다.
- **변수와 시크릿을 사용할 수 있는 것은 템플릿에 저장된 프롬프트뿐입니다.** [작업의 프롬프트](#prompt-of-a-task)를 참조하십시오.
