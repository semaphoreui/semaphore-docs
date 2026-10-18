
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

## 그룹에 따른 프로젝트 역할 <Enterprise /> {#project-roles-from-groups}

[그룹 매핑](/admin-guide/authentication/openid#project-roles-from-groups)을 사용하려면 사용자의 그룹을 ID 토큰에 넣는 mapper를 추가합니다.

1. Keycloak Admin Console에서 클라이언트를 열고 **Client scopes**로 이동해 `<client-id>-dedicated` scope를 엽니다.
2. **By configuration**으로 mapper를 추가하고 **Group Membership**을 선택합니다.
3. **Token Claim Name**을 `groups`로 설정하고 **Add to ID token**을 켭니다.
4. **Full group path**로 그룹을 보내는 방식을 정합니다. 켜져 있으면 Keycloak은 각 그룹의 경로(예: `/devops`, `/platform/sre`)를 보내므로 그룹 매핑에도 이 경로를 써야 합니다. 꺼져 있으면 Keycloak은 그룹 이름(예: `sre`)만 보냅니다.

그런 다음 공급자에 `groups_claim`을 설정합니다.

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "groups_claim": "groups"
    }
  }
}
```

`scopes`에 `groups`를 추가하지 마세요. Keycloak은 알 수 없는 scope를 거부하며, 이 mapper에는 추가 scope가 필요하지 않습니다.

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
