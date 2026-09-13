# Настройка Azure

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

## Вход, инициированный IdP {#idp-initiated-login}

Microsoft Entra ID (Azure AD) запускает приложения из **My Apps** с помощью стартового URL, инициированного SP, а не через
механизм OpenID Connect [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login), и не всегда надёжно
передаёт параметр `iss`. Для Entra направьте плитку на эндпоинт Semaphore **`/login`** вместо `/initiate` — в этом случае
устанавливать `allow_idp_initiated` **не** нужно.

На портале Azure откройте **App registration → Branding & properties** и укажите в **Home page URL**:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

Когда пользователь нажимает на плитку Semaphore в My Apps, Entra переходит по этому URL, что запускает обычный поток
Authorization Code, инициированный SP.
