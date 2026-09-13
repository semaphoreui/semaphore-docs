# Azure 설정

```json title="config.json"
{
  "oidc_providers": {
    "azure": {
      "icon": "microsoft",
      "color": "blue",
      "display_name": "Sign in with EntraID",
      "client_id": "REDACTED",
      "client_secret": "REDACTED",
      "redirect_url": "https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/redirect",
      "endpoint": {
        "issuer": "https://login.microsoftonline.com/TENANT_ID/v2.0",
        "auth": "https://login.microsoftonline.com/TENANT_ID/oauth2/v2.0/authorize",
        "token": "https://login.microsoftonline.com/TENANT_ID/oauth2/v2.0/token",
        "userinfo": "https://graph.microsoft.com/oidc/userinfo",
        "jwks": "https://login.microsoftonline.com/TENANT_ID/discovery/v2.0/keys"
      },
      "scopes": ["openid", "email", "profile", "User.Read"]
    }
  }
}
```

## IdP 시작 로그인 {#idp-initiated-login}

Microsoft Entra ID(Azure AD)는 OpenID Connect의 [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login) 메커니즘이 아니라
SP 시작 URL을 사용하여 **My Apps**에서 애플리케이션을 실행하며, `iss` 매개변수를 항상 안정적으로 보내지는
않습니다. 따라서 Entra의 경우 타일을 `/initiate` 대신 Semaphore의 **`/login`** 엔드포인트로 지정하십시오. 이 경우
`allow_idp_initiated`를 설정할 필요가 **없습니다**.

Azure 포털에서 **App registration → Branding & properties**를 열고 **Home page URL**을 다음과 같이 설정합니다:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

사용자가 My Apps에서 Semaphore 타일을 클릭하면 Entra가 이 URL로 이동하며, 일반적인 SP 시작
Authorization Code 흐름이 시작됩니다.
