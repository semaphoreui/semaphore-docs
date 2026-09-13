# API

## API 참조 {#api-reference}

Semaphore UI는 두 가지 형식의 API 문서를 제공하므로 워크플로에 가장 적합한 것을 선택할 수 있습니다.

* [Swagger/OpenAPI](https://semaphoreui.com/api-docs) &mdash; 대화형 브라우저 기반 환경을 선호하는 경우에 적합합니다.
* [공식 Postman 컬렉션](https://www.postman.com/semaphoreui) &mdash; Postman에서 모든 엔드포인트를 탐색하고 테스트할 수 있습니다.
* **내장 Swagger API 문서** &mdash; Swagger UI 기반의 대화형 API 문서입니다. 사용 중인 인스턴스에서 직접 접근할 수 있습니다.

![](/assets/swagger-link.webp)

모든 옵션에는 사용 가능한 엔드포인트, 매개변수, 응답 예제에 대한 전체 문서가 포함되어 있습니다.

## API 시작하기 {#getting-started-with-the-api}

Semaphore API를 사용하려면 API 토큰을 생성해야 합니다.
이 토큰은 다음과 같이 요청 헤더에 포함해야 합니다.

```http
Authorization: Bearer YOUR_API_TOKEN
```

### API 토큰 생성 {#creating-an-api-token}

API 토큰을 생성하는 방법은 두 가지가 있습니다.
- 웹 인터페이스를 통해
- HTTP 요청을 사용하여

#### 웹 인터페이스를 통해 (2.14 이후) {#through-the-web-interface-since-214}

사이드바 하단의 계정 메뉴를 열고 **API 토큰**을 선택합니다. 이 페이지에는 사용자의 토큰이 나열되며, 페이지의 **API 참조** 링크를 클릭하면 인스턴스에 내장된 Swagger UI가 열립니다.

![API 토큰](/assets/api-tokens.webp)

**새 토큰**을 클릭하고 이름을 입력한 뒤 토큰 만료 시점을 선택하고, 생성 후 표시되는 값을 복사합니다. [내 계정](/user-guide/account#api-tokens)을 참조하십시오.

<div style={{maxWidth: 420}}>

![새 토큰 대화 상자](/assets/api-token-new.webp)

</div>

#### HTTP 요청을 사용하여 {#using-http-request}

직접 HTTP 요청을 보내 인증하고 세션 토큰을 생성할 수도 있습니다.

Semaphore에 로그인합니다(비밀번호는 이스케이프해야 합니다. 예: `slashy\pass` 대신 `slashy\\pass`).

```bash
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

새 토큰을 생성하고 해당 토큰을 가져옵니다.

```bash
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

이 명령은 다음과 유사한 결과를 반환합니다.

```json
{
    "id": "YOUR_ACCESS_TOKEN",
    "created": "2025-05-21T02:35:12Z",
    "expired": false,
    "user_id": 3
}
```
---

## 토큰을 사용하여 API 요청 보내기 {#using-token-to-make-api-requests}

API 토큰을 확보했다면 **Authorization** 헤더에 포함하여 요청을 인증합니다.

### 작업 실행 {#launch-a-task}

이 토큰을 사용하여 작업을 실행하거나 다른 작업을 수행합니다.

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

---

## API 토큰 만료 처리 {#expiring-an-api-token}

토큰이 더 이상 필요하지 않다면 계정을 안전하게 유지하기 위해 토큰을 만료시켜야 합니다.

API 토큰을 수동으로 폐기(만료)하려면 토큰 엔드포인트로 DELETE 요청을 보냅니다.

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
