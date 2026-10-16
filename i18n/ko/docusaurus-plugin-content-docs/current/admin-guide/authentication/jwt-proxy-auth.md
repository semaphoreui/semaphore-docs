---
title: JWT 프록시 인증
description: Pomerium 같은 인증 리버스 프록시가 추가한 서명된 JWT로 사용자를 로그인시키는 방법을 모든 auth.jwt 옵션 및 로그아웃 설정과 함께 설명합니다.
---

# JWT 프록시 인증

Semaphore가 인증 리버스 프록시(예: Pomerium, Cloudflare Access, OAuth2 Proxy) 뒤에서 실행되는 경우, 프록시는 서명된 JWT 헤더로 사용자 ID를 전달할 수 있습니다. Semaphore는 JWKS 엔드포인트를 기준으로 JWT를 검증하고 사용자를 자동으로 조회하거나 생성합니다.

이렇게 하면 프록시와 Semaphore 양쪽에 OIDC 구성을 중복해서 둘 필요가 없습니다.

## 동작 방식 {#how-it-works}

1. 리버스 프록시가 사용자를 인증하고 구성된 HTTP 헤더에 서명된 JWT를 추가합니다.
2. Semaphore는 모든 요청에서 이 헤더를 확인합니다. 헤더가 있으면 JWKS 엔드포인트를 기준으로 토큰을 검증합니다.
3. 토큰이 유효하면 LDAP 및 OIDC와 같은 방식으로 사용자를 찾습니다. 먼저 토큰의 `sub` 클레임에 대해 저장된 외부 ID로 찾고, 다음으로 `external_auth_email_matching`이 허용하는 범위에서 이메일로 찾으며, 그래도 없으면 새 외부 사용자를 만듭니다. [사용자 레코드가 생성되는 방식](/admin-guide/authentication#how-a-user-record-comes-to-exist)을 참조하세요.
4. 헤더는 있지만 토큰이 유효하지 않으면 Semaphore는 즉시 `401 Unauthorized`를 반환합니다. 기존 베어러 토큰 인증과 세션 인증은 시도하지 않습니다.
5. 헤더가 없으면 일반 인증(베어러 토큰, 세션 쿠키)이 평소대로 진행됩니다.

JWT 인증으로 생성된 사용자는 **외부** 사용자로 표시되며, 해당 ID는 공급자 ID `jwt`와 토큰의 `sub` 클레임으로 저장됩니다. `sub` 클레임이 없는 토큰은 거부됩니다. 로컬(외부가 아닌) 사용자는 절대 이메일로 매칭되지 않습니다.

프록시가 토큰에 넣는 이메일 주소는 신뢰됩니다. `external_auth_email_matching`이 기본값인 `auto`이면, 이전 버전(JWT 사용자를 이메일로만 매칭했음)에서 생성된 사용자는 다음 요청 때 자신의 `sub`에 연결됩니다. `never`이면 이러한 사용자는 매칭되지 않고, 새 계정이 그 이메일 주소를 다시 사용하게 되므로 요청이 실패합니다. `never`로 전환하기 전에 `auto` 상태에서 한 번 로그인하게 하세요.

## 보안 고려 사항 {#security-considerations}

Semaphore는 구성된 헤더에 유효한 토큰을 담은 요청이라면 누구든 로그인시킵니다.
서명은 클라이언트가 토큰을 위조하는 것은 막지만, 이미 가지고 있는 토큰을 재전송하는 것은
막지 못합니다. 따라서 프록시가 유일한 진입점이어야 합니다.

- 프록시를 거치지 않고는 Semaphore에 접근할 수 없도록 하세요. 사설 주소에 바인딩하거나
  포트를 방화벽으로 막으세요. [네트워크 보안](/admin-guide/security/network)을 참조하세요.
- 프록시가 클라이언트에서 들어오는 요청의 JWT 헤더를 제거하고, 사용자를 인증한 후에만
  헤더를 설정하도록 구성하세요.
- `audience`를 프록시가 Semaphore에 사용하는 값으로 설정하세요. 설정하지 않으면 같은 키로
  서명되어 프록시가 다른 애플리케이션용으로 발급한 토큰도 받아들여집니다.

## 구성 {#configuration}

JWT 인증을 활성화하면 `header`와 `jwks_url`이 모두 필요합니다. Semaphore는 시작할 때 이를 검증합니다.

### 구성 파일 {#config-file}

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "header": "X-Pomerium-Jwt-Assertion",
      "jwks_url": "https://auth.example.com/.well-known/pomerium/jwks.json",
      "audience": "https://semaphore.example.com",
      "issuer": "https://auth.example.com"
    }
  }
}
```

### 환경 변수 {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Docker 예시 {#docker-example}

```bash
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_JWT_AUTH_ENABLED=true \
  -e SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion \
  -e SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json \
  -e SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com \
  -e SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com \
  semaphoreui/semaphore:latest
```

## 옵션 {#options}

| 매개변수 | 환경 변수 | 설명 |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | JWT 프록시 인증을 활성화합니다. |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | JWT가 담긴 HTTP 헤더. **필수.** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | 서명 검증에 사용할 JWKS 엔드포인트의 URL. **필수.** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | 기대하는 `aud` 클레임. 비어 있으면 audience를 검증하지 않습니다. |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | 기대하는 `iss` 클레임. 비어 있으면 issuer를 검증하지 않습니다. |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | 사용자 이메일에 해당하는 JWT 클레임. 기본값: `email`. |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | 사용자 표시 이름에 해당하는 JWT 클레임. 기본값: `name`. |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | 사용자 이름에 해당하는 JWT 클레임. 기본값: `email`. |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | Semaphore 세션을 지운 후 로그아웃 링크가 리디렉션할 URL. [로그아웃](#logout)을 참조하세요. |

## 지원되는 알고리즘 {#supported-algorithms}

Semaphore는 **ES256**, **ES384**, **ES512**, **RS256**, **RS384**, **RS512**로 서명된 토큰을 받아들입니다. 모든 토큰에는 `exp` 클레임이 있어야 하며, 없는 토큰은 거부됩니다.

## 로그아웃 {#logout}

Semaphore에서 로그아웃을 클릭하면 Semaphore 세션 쿠키는 지워지지만 리버스 프록시의 세션은 영향을 받지 않습니다. 따라서 다음 요청에서 같은 사용자가 즉시 다시 인증됩니다.

사용자를 완전히 로그아웃시키려면 `signout_url`을 프록시의 로그아웃 엔드포인트로 설정하세요. Semaphore 세션을 지운 후 브라우저가 그곳으로 리디렉션됩니다.

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "signout_url": "https://auth.example.com/.pomerium/sign_out"
    }
  }
}
```

주요 프록시별 예시:

- **Pomerium**: `https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**: `https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**: `https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## JWKS 가용성 {#jwks-availability}

Semaphore는 시작할 때 JWKS를 가져옵니다. JWKS 엔드포인트에 연결할 수 없더라도 서버는 시작됩니다. 키 세트는 백그라운드에서 1시간마다 갱신되며, Semaphore가 본 적 없는 키 ID로 서명된 토큰이 들어온 경우에도 최대 5분에 한 번 갱신됩니다. 키를 사용할 수 있을 때까지 JWT 인증은 오류를 반환합니다.
