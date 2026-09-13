
# Okta 설정

```yaml title="config.json"
{
  "oidc_providers": {
    "okta": {
      "display_name": "Sign in with Okta",
      "provider_url": "https://trial-776xxxx.okta.com/oauth2/default",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```

## IdP 시작 로그인 {#idp-initiated-login}

사용자가 Okta 대시보드 타일에서 로그인을 시작할 수 있도록 하려면, 해당 제공자에 대해
[IdP 시작 로그인](/admin-guide/authentication/openid#idp-initiated-login)을 활성화합니다:

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

그런 다음 Okta Admin Console에서 애플리케이션의 **General** 설정을 열고 *Login* 섹션을 구성합니다:

1. **Login initiated by**를 *Either Okta or App*(또는 *App Only*)으로 설정합니다.
2. **Initiate login URI**를 다음과 같이 설정합니다:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (선택 사항) **Application visibility**에서 *Display application icon to users*를 활성화하여 Okta 대시보드에
   타일이 표시되도록 합니다.

Okta는 `iss`와 `target_link_uri` 매개변수를 보냅니다. Semaphore는 `provider_url`과 대조하여 `iss`를 검증하고
일반적인 Authorization Code 흐름을 시작합니다.


## 관련 GitHub 이슈 {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — OIDC Azure AD 설정/디버깅 도움 요청
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56에서 keycloak을 사용한 oidc 인증이 동작하지 않음
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — oidc_providers 테스트

[Okta 관련 이슈 모두 보기 →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## 관련 GitHub 토론 {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — GitHub OpenID 설정 시 이메일 외에는 파싱이 되지 않음
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML 지원?

[Okta 관련 토론 모두 보기 →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
