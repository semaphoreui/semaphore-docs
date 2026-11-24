# 통합

통합은 외부 서비스가 Semaphore URL을 호출할 때 작업 템플릿을 시작합니다. 호출하는 쪽은 GitHub, GitLab, Bitbucket, 모니터링 시스템, 또는 HTTP 요청을 보낼 수 있는 모든 프로그램일 수 있습니다. 요청은 실행을 촉발하는 것에서 끝나지 않습니다. 브랜치 이름, 커밋, 릴리스 태그 같은 요청의 일부를 변수로 작업에 전달할 수도 있습니다.

![통합 목록](/assets/integrations-list.webp)

모든 통합은 네 가지 부분으로 이루어집니다.

| 부분 | 답하는 질문 |
|---|---|
| **별칭** | 발신자가 호출하는 URL은 무엇인가 |
| **인증 방식** | 이 요청이 무언가를 시작해도 되는가 |
| **매처** | 통합이 기다리던 요청이 *이* 요청인가 |
| **값 추출기** | 요청의 어떤 필드가 무엇으로서 작업에 도달하는가 |

통합을 만들려면 프로젝트 메뉴에서 **Integrations**를 열고 **New Integration**을 클릭한 뒤, 이름을 지정하고 실행할 작업 템플릿과 인증 방식을 선택합니다. 그다음 목록에서 통합을 클릭하면 별칭, 매처, 값 추출기를 설정할 수 있습니다.

![통합 상세](/assets/integration-detail.webp)

## 호출이 처리되는 과정 {#how-a-call-is-handled}

1. 발신자가 `/api/integrations/<alias>`를 `GET` 또는 `POST`로 호출합니다.
2. Semaphore는 별칭으로부터 시작할 수 있는 통합들을 찾습니다. 이 엔드포인트는 공개되어 있으며, 그것을 지키는 것은 별칭과 인증 방식뿐입니다.
3. 해당 통합들은 각자의 **인증 방식**으로 요청을 검사합니다. 검사를 통과하지 못한 요청은 아무것도 시작하지 않습니다.
4. 호출이 **프로젝트 별칭**으로 들어왔다면 통합의 **매처**가 평가됩니다. 전부 일치해야 하며, 그렇지 않으면 그 통합은 건너뜁니다.
5. **값 추출기**가 실행되어 요청의 일부를 변수와 작업 매개변수로 바꿉니다.
6. 작업이 생성되어 대기열에 들어갑니다. 사람이 템플릿을 직접 시작한 것과 완전히 같습니다.

처리된 호출은 무언가가 시작되었는지와 무관하게 본문이 빈 `204 No Content`를 받습니다. 무엇이 시작되었는지는 응답 헤더로 알려줍니다.

| 응답 헤더 | 값 |
|---|---|
| `X-Semaphore-Task-ID` | 생성된 작업 |
| `X-Semaphore-Template-ID` | 그 작업이 실행하는 템플릿 |
| `X-Semaphore-Project-ID` | 작업이 속한 프로젝트 |
| `X-Semaphore-Integration-ID` | 그것을 시작한 통합 |
| `X-Semaphore-Inventory-ID` | 작업의 인벤토리(있는 경우) |

알려진 별칭으로 들어온 모든 호출은 [호출 기록](#call-history)에도 기록됩니다. 웹훅이 기대대로 동작하지 않을 때 살펴볼 곳입니다.

## 별칭 {#aliases}

별칭은 웹훅 URL의 무작위하고 추측할 수 없는 부분, 즉 `/api/integrations/<random_string>`입니다. `GET`과 `POST`를 받습니다. 두 종류가 있고, 하나의 통합은 한 번에 그중 하나만 사용합니다.

**프로젝트 별칭**은 통합 목록 위의 **Add Alias**로 만들며, **Use project alias** 스위치가 켜진 프로젝트의 모든 통합이 함께 사용합니다. 들어온 요청은 그 모두에게 제시되고, 각 통합이 자신의 매처로 실행 여부를 결정합니다. GitHub나 GitLab에는 이 별칭을 한 번 알려주고, 이후 이벤트는 매처로 나누는 것이 보통입니다.

**통합 별칭**은 통합 자신의 페이지에 있는 **Add Alias**로 만들며, 그 통합에만 속합니다. 호출하면 통합이 즉시 시작되고 **매처는 전혀 평가되지 않습니다**. 발신자가 한 가지 용도에만 쓰일 때, 또는 본문이 매처로 검사할 수 없는 형식일 때 사용하세요.

:::warning
어떤 종류의 별칭이 동작하는지는 통합 페이지의 **Use project alias** 스위치가 결정합니다. 켜져 있는 동안에는 통합이 프로젝트 별칭에 응답하고 자신의 별칭은 무시됩니다. 꺼져 있는 동안에는 프로젝트 별칭이 그 통합에 도달하지 않으며 매처도 전혀 사용되지 않습니다.
:::

프로젝트는 두 종류의 별칭을 여러 개 가질 수 있습니다. 옆의 휴지통 아이콘으로 삭제하면 즉시 동작을 멈추지만, 이미 받은 호출은 기록에 남습니다.

## 인증 {#authentication}

웹훅 엔드포인트는 로그인 뒤에 있지 않으므로, 낯선 사람이 작업을 시작하지 못하게 막는 것은 인증 방식입니다. 통합 양식에서 선택하며, **Auth secret**은 [키 저장소](/user-guide/key-store)의 키입니다.

| 인증 방식 | Semaphore가 검사하는 것 | Auth secret |
|---|---|---|
| **None** | 아무것도 검사하지 않습니다. URL을 알게 된 사람은 누구나 템플릿을 시작할 수 있습니다 | — |
| **GitHub Webhooks** | `X-Hub-Signature-256`이 `sha256=`와 본문의 HMAC-SHA256을 합한 값과 같은지 | 문자열 키, 또는 로그인/비밀번호 키의 비밀번호 |
| **Bitbucket Webhooks** | `X-Hub-Signature`를 같은 방식으로 | 문자열 키, 또는 로그인/비밀번호 키의 비밀번호 |
| **Token** | **Auth header**에 지정한 헤더가 비밀값과 같은지 | 문자열 키, 또는 로그인/비밀번호 키의 비밀번호 |
| **HMAC** | **Auth header**에 지정한 헤더가 본문의 HMAC-SHA256을 담고 있는지 | 문자열 키, 또는 로그인/비밀번호 키의 비밀번호 |
| **HMAC (SHA-512)** | 같은 내용을 HMAC-SHA512로 | 문자열 키, 또는 로그인/비밀번호 키의 비밀번호 |
| **BasicAuth** | `Authorization` 헤더가 로그인*과* 비밀번호를 담고 있는지 | 로그인/비밀번호 키만 |

**문자열** 키는 그 값을 공유 비밀값으로 쓰고, 로그인/비밀번호 키는 비밀번호를 씁니다. 로그인까지 비교하는 것은 BasicAuth뿐입니다. 해당 방식이 쓸 수 없는 종류의 키가 지정되어 있으면, 불일치를 조용히 넘기지 않고 요청을 거부합니다.

### HMAC 인증 {#hmac-authentication}

HMAC 인증 방식(`hmac` / SHA-256과 `hmac-sha512` / SHA-512)은 웹훅 본문이 공유 비밀값으로 서명되었는지 검증합니다.

설정할 항목:

1. **Auth header** — 서명을 담는 요청 헤더(예: `X-Signature` 또는 `X-Hub-Signature-256`).
2. **Auth secret** — 키 저장소의 **문자열** 키(그 값이 비밀값) 또는 로그인/비밀번호 자격 증명(그 **비밀번호**가 비밀값).

발신자는 요청 원본 본문의 HMAC 다이제스트를 **순수 16진수**로 그 헤더에 넣어야 합니다(`sha256=` / `sha512=` 접두사 없이. GitHub과 Bitbucket 방식은 반대로 그 접두사를 기대하고, HMAC 방식은 기대하지 않습니다). Semaphore는 설정된 비밀값으로 계산한 본문의 `HMAC-SHA256` 또는 `HMAC-SHA512`와 비교합니다.

OpenSSL을 사용한 SHA-512 예시:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## 매처 {#matchers}

매처는 들어온 요청에 대한 하나의 조건입니다. *이 헤더가 그 값과 같다*, *이 JSON 필드가 그 문자열을 포함한다* 같은 형태입니다. 하나의 프로젝트 별칭이 여러 통합을 처리할 수 있는 것은 매처 덕분입니다. GitHub은 모든 이벤트를 같은 URL로 보내고, 어떤 통합이 어떤 이벤트에 반응할지는 매처가 결정합니다.

매처는 통합을 실행할지만 결정합니다. 작업을 바꾸는 일은 결코 없습니다. 그것은 추출기의 몫입니다.

매처는 **프로젝트 별칭으로 들어온 호출에 대해서만** 평가됩니다(**Use project alias** 스위치가 켜진 경우). 통합 자신의 별칭으로 들어온 호출은 매처를 보지 않고 그 통합을 시작합니다.

### 매처의 항목 {#matcher-fields}

| 항목 | 의미 |
|---|---|
| **Name** | 목록에 표시되는 이름. 자유 입력이며 비교에는 쓰이지 않습니다 |
| **Match on** | **Body** 또는 **Header** — 값을 어디에서 가져오는지 |
| **Body Data Format** | **JSON** 또는 **String**. **Body**일 때만 표시됩니다 |
| **Key** | 헤더 이름, 또는 JSON 본문 안 필드로 가는 경로 |
| **Comparison Method** | `==`, `!=`, **Contains** |
| **Value** | 요청의 값과 비교되는 텍스트 |

**Match on: Header** — **Key**는 헤더 이름이며 대소문자를 구분하지 않으므로 `X-GitHub-Event`와 `x-github-event`는 같은 헤더입니다. 요청에 없는 헤더는 없는 값처럼 취급됩니다(아래 참조). 같은 헤더가 여러 번 나오면 첫 번째 값만 비교합니다.

**Match on: Body, JSON** — **Key**는 해석된 본문 안의 경로이며 다음 절에서 설명합니다. 올바른 JSON이 아닌 본문은 어떤 키에 대해서도 없는 값을 돌려줍니다.

**Match on: Body, String** — 원본 본문 전체가 값이 되고 **Key**는 무시됩니다. 필수 항목이라 양식은 그래도 키를 요구하므로 하이픈을 넣어 두세요. JSON이 아닌 본문을 비교할 수 있는 유일한 방법이며, **Contains**와 함께 사용합니다.

**Key**와 **Value**는 모두 필수이므로 매처로 빈 값을 검사할 수는 없습니다. 어떤 필드가 없는 상황에 반응하려면, 그 필드가 결코 갖지 않는 값과 `!=`로 비교하세요.

### JSON 키 {#json-keys}

키는 JSON 문서를 따라가는 경로입니다. 단계는 점으로 구분하고, 배열 원소는 0부터 세는 색인을 대괄호로 지정합니다. 이름은 대소문자를 구분합니다.

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| 키 | 가리키는 값 |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | 배열 전체 |
| `repository.url` | 아무것도 아닙니다 — 그런 필드는 없습니다 |

값 추출기의 **Key** 항목도 같은 문법을 사용합니다.

### 매처가 값을 비교하는 방법 {#how-a-matcher-compares-values}

요청에서 가져온 값은 텍스트로 바뀐 뒤 **Value**와 텍스트로 비교됩니다. 그래서 **Value** 항목에는 따옴표, 대괄호, 이스케이프가 전혀 필요하지 않습니다.

- **문자열**은 그대로 비교되고 대소문자도 구분합니다. `Push`는 `push`와 일치하지 않습니다.
- **숫자**는 소수부가 없으면 소수부 없이 비교됩니다. 본문의 `42`는 값 `42`와 일치하고 `42.0`과는 일치하지 않습니다. 소수가 있는 숫자는 쓰인 그대로 비교되므로 `1.5`는 `1.5`와 일치합니다.
- **참/거짓 값**은 `true`와 `false`에 일치합니다.
- **없는 값**(헤더가 없음, 존재하지 않는 JSON 경로, `null`, 올바른 JSON이 아닌 본문)은 문자 그대로의 텍스트 `<nil>`로 비교됩니다. 여기에서 기억해 둘 결론이 나옵니다. 없는 필드는 `==`로 결코 일치할 수 없고, `!=`로는 항상 일치합니다.
- **객체와 배열**은 읽을 수 있는 텍스트 형태가 없으므로 비교하지 마세요. 대신 그 안의 스칼라 필드를 키로 가리키세요.
- **Contains**는 대소문자를 구분하는 단순 부분 문자열 검사이며, 와일드카드도 정규식도 없습니다.

### 여러 개의 매처 {#several-matchers}

통합은 매처를 몇 개든 가질 수 있고, 매처는 **AND**로 묶입니다. 즉 모두 일치할 때만 통합이 실행됩니다. 하나의 통합 안에서 *또는*을 표현할 방법은 없으므로, 다른 조건에는 같은 템플릿에 대한 두 번째 통합을 만드세요.

:::warning
프로젝트 별칭을 쓰면서 **매처가 하나도 없는** 통합은 결코 시작되지 않습니다. 일치할 대상이 아무것도 없기 때문입니다. 매처를 적어도 하나 추가하거나, **Use project alias**를 끄고 통합 자신의 별칭을 호출하세요.
:::

### 매처 예시 {#matcher-examples}

| 목적 | Match on | 형식 | Key | 메서드 | Value |
|---|---|---|---|---|---|
| GitHub push만 | Header | — | `X-GitHub-Event` | `==` | `push` |
| `main`으로의 push만 | Body | JSON | `ref` | `==` | `refs/heads/main` |
| `main`을 제외한 모든 브랜치 | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| 태그만 | Body | JSON | `ref` | Contains | `refs/tags/` |
| 병합된 GitLab 머지 리퀘스트만 | Body | JSON | `object_attributes.state` | `==` | `merged` |
| 봇의 커밋 무시 | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| 공개된 GitHub 릴리스만 | Body | JSON | `action` | `==` | `published` |
| 디스크를 언급한 일반 텍스트 경보 | Body | String | `-` | Contains | `disk` |

첫 두 줄을 함께 쓰는 것이 배포용 통합의 일반적인 설정입니다. 이벤트 종류는 헤더에서, 브랜치는 본문에서 가져오며 둘 다 일치해야 합니다.

## 값 추출기 {#value-extractors}

값 추출기는 들어온 요청의 한 조각을 곧 시작될 작업으로 복사합니다. 웹훅이 촉발하는 자동화에 브랜치, 커밋 해시, 작성자, 릴리스 버전을 전달하는 방법입니다.

추출기는 호출이 어떤 종류의 별칭으로 들어왔든 항상 실행되며, 인증과 매처를 통과한 다음에 동작합니다.

### 추출기의 항목 {#extractor-fields}

| 항목 | 의미 |
|---|---|
| **Name** | 목록에 표시되는 이름. 자유 입력 |
| **Source of the Value** | **Body** 또는 **Header** |
| **Data Type of Body** | **JSON** 또는 **String**. **Body**일 때만 표시됩니다 |
| **Key** | 헤더 이름, 또는 [JSON 키](#json-keys) — 매처와 같은 문법입니다 |
| **Variable Usage** | **Variables** 또는 **Task Params** — 값을 어디로 전달할지 |
| **Variable** | 작업 안에서 값이 가질 이름 |

**Body**와 **String** 조합에서는 매처와 똑같이 원본 본문 전체가 값이 되고 **Key**는 무시됩니다.

### 변수가 받는 것 {#what-the-variable-receives}

매처와 달리 추출기는 아무것도 텍스트로 바꾸지 않습니다. JSON 값은 자신의 타입을 유지하므로 숫자는 숫자로, 객체는 객체로 남습니다.

| 요청에 있는 것 | 변수가 받는 것 |
|---|---|
| 헤더 | 그 텍스트. 헤더가 없으면 빈 문자열 |
| JSON 문자열, 숫자, 참/거짓 값 | 타입까지 그대로인 같은 값 |
| JSON 객체나 배열 | 구조가 유지된 객체 또는 배열 전체 |
| JSON `null`, 존재하지 않는 경로, 올바른 JSON이 아닌 본문 | 아무것도 받지 않습니다. 변수는 **전혀 설정되지 않고**, 템플릿이 정의한 값이 그대로 남습니다 |
| **String**으로서의 본문 | 원본 본문 전체의 텍스트 |

"빈 값"과 "설정되지 않음"의 차이는 중요합니다. 헤더가 없으면 작업에 빈 문자열이 전달되지만, JSON 필드가 없으면 템플릿 자신의 값이 그대로 유지됩니다.

### Variable Usage: Variables {#variable-usage-variables}

값은 작업의 변수에 합쳐집니다. 새 작업 대화상자의 **Variables** 항목이 채우는 것과 같은 집합입니다. Semaphore는 이를 추가 변수로 도구에 전달하며(Ansible은 `--extra-vars`, Terraform은 `-var`), 템플릿의 [변수 그룹](/user-guide/environment)에 있는 같은 이름의 키를 덮어씁니다.

변수 이름을 템플릿의 [설문 변수](/user-guide/task-templates/survey-vars)와 똑같이 지으면, 사람이 입력하는 대신 웹훅이 그 설문 변수를 채웁니다.

### Variable Usage: Task Params {#variable-usage-task-params}

작업 매개변수는 플레이북용 변수가 아니라 템플릿에 내장된 [프롬프트](/user-guide/task-templates/prompts)입니다. 추출한 값은 그대로 전달되므로, JSON 타입이 기대하는 타입과 같아야 합니다. `"true"`가 아니라 `true`입니다.

| 변수 | 적용 대상 | 기대하는 값 |
|---|---|---|
| `git_branch` | 모든 앱 | 체크아웃할 브랜치. 앞의 `refs/heads/`는 제거되므로 GitHub의 `ref`를 그대로 쓸 수 있습니다 |
| `limit`, `tags`, `skip_tags` | Ansible | 문자열의 목록 |
| `debug`, `dry_run`, `diff` | Ansible | `true` 또는 `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` 또는 `false` |

값이 효력을 가지려면 템플릿이 재정의를 허용해야 합니다. `git_branch`에는 **Allow override branch in task**가, `limit`, `tags`, `skip_tags`에는 해당 프롬프트가 필요합니다. 허용되지 않으면 값은 버려지고 작업은 템플릿 자신의 설정으로 실행됩니다.

### 추출기 예시: GitHub push {#extractor-example-github-push}

GitHub의 push 웹훅은 다음과 같이 시작하는 본문을 보냅니다.

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

네 개의 추출기가 이것을 충분히 설명된 작업으로 바꿉니다.

| Name | Source | 형식 | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

그러면 작업은 `main`을 체크아웃하고(`refs/heads/` 접두사는 알아서 제거됩니다) 플레이북이 쓸 수 있는 변수 `COMMIT`, `AUTHOR`, `EVENT`와 함께 실행됩니다. 실제 호출이 무엇을 전달했는지 보려면 History 탭에서 그 호출을 열어 본문과 자신의 키를 견주어 보세요.

## 미리 지정하는 작업 매개변수 {#task-parameters}

통합 양식에서 템플릿을 고르면 그 템플릿 자신의 실행 옵션이 나타납니다. 메시지, 설문 변수, 인벤토리, 템플릿이 재정의를 허용하는 경우의 Git 브랜치, 그리고 앱의 프롬프트입니다. 여기서 지정한 값은 이 통합이 시작하는 모든 작업의 기본값이 되므로, 인벤토리나 고정된 메시지처럼 결코 바뀌지 않는 값은 추출기가 아니라 이곳에 두세요.

추출기는 이 기본값 위에 적용됩니다. 추출기가 만든 변수나 작업 매개변수는 같은 이름의 기본값을 대체하고, 추출기가 아무것도 찾지 못하면 기본값이 그대로 남습니다.

## 워크플로 통합 <FeatureState feature="workflows" /> {#workflow-integrations}

통합은 하나의 템플릿 대신 [워크플로](/user-guide/workflows)를 시작할 수도 있습니다. 통합 양식에서 **Runs**를 **Workflow**로 바꾸고 워크플로를 고르세요.

추출기는 한 가지만 다르고 똑같이 동작합니다. **Variable Usage**는 무시되며, 추출된 모든 값이 **Variable**의 이름으로 워크플로 설문의 답변으로 전달됩니다. 워크플로는 그 답변을 검증한 뒤 각 노드의 바인딩을 통해 전달하므로, 어떤 노드에도 바인딩되지 않은 값은 작업까지 도달하지 않습니다. 성공한 호출은 작업 헤더에 더해 `X-Semaphore-Workflow-ID`와 `X-Semaphore-Workflow-Run-ID`를 알려줍니다.

## 호출 기록 {#call-history}

통합 페이지의 **History** 탭에는 프로젝트가 어느 별칭으로든 받은 모든 호출이 최신순으로 나열됩니다. 통합 단위가 아니라 프로젝트 단위로 보관되므로, 별칭과 통합과 시작된 작업이 사라져도 기록은 남습니다.

| 열 | 표시 내용 |
|---|---|
| **Time** | 호출이 도착한 시각 |
| **Integration** | 호출을 처리한 통합과 그 아래의 별칭 — 별칭을 클릭하면 목록을 그 별칭으로 걸러 봅니다 |
| **Source IP** | 호출이 들어온 주소 |
| **Method** | `GET` 또는 `POST` |
| **Status** | 통합이 그 호출을 어떻게 처리했는지, 그리고 그 이유 |
| **Task** | 시작된 작업 또는 워크플로 실행 |
| **Duration** | 통합이 호출을 처리하는 데 걸린 시간 |

가능한 상태는 네 가지입니다.

| 상태 | 의미 |
|---|---|
| `ok` | 작업 또는 워크플로 실행이 시작되었습니다 |
| `unauthorized` | 요청이 통합의 인증 방식을 통과하지 못했습니다 |
| `skipped` | 매처가 일치하지 않았거나, 그 별칭이 어떤 통합도 시작하지 않았습니다 |
| `error` | 시작을 시도했지만 실패했습니다 — 템플릿이 없거나, 설문이 값을 거부했습니다 |

행을 클릭하면 받은 그대로의 요청 본문(앞의 64 KiB까지. 더 길었다면 저장된 크기와 원래 크기가 함께 표시됩니다)을 포함한 호출이 열립니다. 요청 **헤더는 절대 저장되지 않습니다**. 발신자가 인증에 사용한 서명이나 토큰을 담고 있기 때문입니다. 인증을 통과하지 못한 호출의 본문도 보관하지 않습니다. URL을 아는 사람이면 누구나 보낼 수 있기 때문입니다.

표 위의 컨트롤로 통합과 별칭으로 목록을 걸러내고, 아래의 화살표로 페이지를 넘기세요. 기록에는 보관 기한이 없으며, 프로젝트가 삭제될 때까지 계속 늘어납니다.

## 문제 해결 {#troubleshooting}

| 증상 | 확인할 것 |
|---|---|
| History에 행이 전혀 나타나지 않음 | URL의 별칭이 잘못되었거나 삭제되었습니다. **Use project alias**가 켜져 있는데 통합 자신의 별칭을 호출한 경우에도 어디에도 기록되지 않습니다 |
| `unauthorized` | 인증 헤더의 이름, 키 저장소의 키, 그리고 발신자가 방식이 기대하는 `sha256=` 접두사와 함께 서명을 보내는지 확인하세요. GitHub과 Bitbucket은 **Auth header**와 무관하게 자신의 헤더를 사용합니다 |
| `skipped`, 이유가 *No integration matched the alias* | 별칭은 존재하지만 프로젝트의 어떤 통합도 **Use project alias**를 켜지 않았습니다 |
| `skipped`, 이유가 *No matcher matched the request* | 호출을 열어 본문을 자신의 매처와 견주어 보세요. 없는 필드는 `==`로 결코 일치하지 않고, 키는 대소문자를 구분하며, **Contains**에는 와일드카드가 없다는 점을 기억하세요. 매처가 하나도 없는 통합도 같은 이유로 건너뜁니다 |
| 작업은 실행되는데 변수가 비었거나 없음 | JSON 키가 페이로드와 맞지 않거나(호출을 열어 본문을 확인), 값이 `null`이었거나, **Variable**의 이름이 채우려는 설문 변수와 다릅니다 |
| 브랜치가 재정의되지 않음 | 템플릿에 **Allow override branch in task**가 필요하고, 추출기는 `git_branch` 작업 매개변수에 써야 합니다 |
| 한 번의 호출로 여러 작업이 시작됨 | 여러 통합이 프로젝트 별칭을 쓰고 그 매처가 모두 일치합니다. 매처를 더 좁히거나, 통합마다 자신의 별칭을 주세요 |
