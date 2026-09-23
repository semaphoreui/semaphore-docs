# 통합

통합을 사용하면 Semaphore와 GitHub, GitLab과 같은 외부 서비스 간의 상호 작용을 구성할 수 있습니다.

![통합 목록](/assets/integrations-list.webp)

프로젝트 웹훅 URL은 목록 위에 표시됩니다. 각 통합에는 이름과 실행할 템플릿이 있습니다. 통합을 클릭하면 매처와 값 추출기를 설정할 수 있습니다.

![통합 상세 정보](/assets/integration-detail.webp)

통합을 사용하면 특별한 엔드포인트(별칭)를 호출해 특정 템플릿을 트리거할 수 있으며, 이에 대해 다음 인증 방식 중 하나를 설정할 수 있습니다:
* GitHub 웹훅
* 토큰
* HMAC (SHA-256)
* HMAC (SHA-512)
* 인증 없음

별칭은 다음 형식의 URL을 나타냅니다: `/api/integrations/<random_string>`. `GET`과 `POST` 요청을 지원합니다.

## HMAC 인증 {#hmac-authentication}

HMAC 인증 방식(`hmac` / SHA-256 및 `hmac-sha512` / SHA-512)은 웹훅 본문이 공유 비밀로 서명되었는지 확인합니다.

다음을 설정합니다.

1. **Auth header** — 서명이 포함되는 요청 헤더(예: `X-Signature` 또는 `X-Hub-Signature-256`).
2. **Auth secret** — 키 저장소의 로그인/비밀번호 자격 증명. Semaphore는 **비밀번호** 값을 HMAC 비밀로 사용합니다.

발신자는 원본 요청 본문의 HMAC 다이제스트를 **접두사 없는 16진수 값**으로 이 헤더에 넣어야 합니다(`sha256=` / `sha512=` 접두사 제외). Semaphore는 설정된 비밀을 사용해 본문에서 계산한 `HMAC-SHA256` 또는 `HMAC-SHA512` 값과 비교합니다.

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

매처를 사용하면 들어오는 요청의 매개변수를 정의할 수 있습니다. 이 매개변수가 일치하면 템플릿이 호출됩니다.

## 값 추출기 {#value-extractors}

추출기를 사용하면 요청 헤더나 본문(JSON 필드 또는 문자열)에서 데이터를 가져와 작업에 전달할 수 있습니다. 추출된 각 값에는 **변수 유형**이 있습니다:

* **Environment**: 값이 작업의 환경 변수에 추가되며, 변수 그룹에 있는 같은 이름의 변수를 재정의합니다.
* **Task parameter**: 값이 작업 매개변수가 됩니다. 예를 들어 설문 변수나 프롬프트가 됩니다.

## 작업 매개변수 {#task-parameters}

통합은 매개변수와 함께 작업을 트리거할 수 있습니다. 값 추출기를 사용해 작업 매개변수용 JSON 페이로드를 구성하고, 템플릿이 프롬프트 값을 받을 수 있도록 설정하십시오.

## 별칭과 매처에 대한 참고 사항 {#notes-on-aliases-and-matchers}

프로젝트 별칭(통합 목록 위의 URL)은 프로젝트의 모든 통합이 공유합니다. Semaphore는 모든 통합의 매처를 확인하고 매처가 일치하는 템플릿을 실행합니다. 통합은 자체 별칭을 가질 수도 있으며, 이 별칭으로 들어오는 요청은 매처를 평가하지 않고 해당 통합을 실행합니다. 필요에 따라 토큰/HMAC 인증을 우선 사용하고 추출기를 통해 매개변수를 전달하십시오.
