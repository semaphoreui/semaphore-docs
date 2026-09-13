
# Keycloak 설정

```yaml title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "https://keycloak.example.com/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/keycloak/redirect"
    }
  }
}
```

## IdP 시작 로그인 {#idp-initiated-login}

사용자가 Keycloak **Account Console** 애플리케이션 런처에서 Semaphore를 실행할 수 있도록 하려면, 해당 제공자에 대해
[IdP 시작 로그인](/admin-guide/authentication/openid#idp-initiated-login)을 활성화합니다:

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

그런 다음 Keycloak Admin Console에서 클라이언트를 열고 **Home URL**(Keycloak 19 이상, 이전 버전에서는
*Base URL*이라고 함)을 다음과 같이 설정합니다:

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

사용자가 런처에서 애플리케이션을 클릭하면 Keycloak은 `iss` 매개변수와 함께 이 URL로 리디렉션합니다. Semaphore는
`provider_url`(realm issuer)과 대조하여 `iss`를 검증하고 일반적인 Authorization Code 흐름을 시작합니다.


## 관련 GitHub 이슈 {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — Keycloak 서버의 인증서 검증을 비활성화하는 방법  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — TLS 검증을 비활성화하는 옵션  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Semaphore에서 로그아웃할 때 Keycloak 세션에서도 로그아웃  

[Keycloak 관련 이슈 모두 보기 →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## 관련 GitHub 토론 {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — OpenID에서 사용자 이름이 `preferred_username`과 다름
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML 지원?

[Keycloak 관련 토론 모두 보기 →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
