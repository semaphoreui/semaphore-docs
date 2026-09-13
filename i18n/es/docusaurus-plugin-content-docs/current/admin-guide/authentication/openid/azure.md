# Configuración de Azure

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

## Inicio de sesión iniciado por el IdP {#idp-initiated-login}

Microsoft Entra ID (Azure AD) lanza las aplicaciones desde **My Apps** mediante una URL de inicio iniciada por el SP en lugar del
mecanismo [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login) de OpenID Connect, y no envía de forma fiable
el parámetro `iss`. Para Entra, apunte el mosaico al endpoint **`/login`** de Semaphore en lugar de `/initiate`; de este modo
**no** es necesario establecer `allow_idp_initiated`.

En el portal de Azure, abra su **App registration → Branding & properties** y establezca la **Home page URL** en:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

Cuando un usuario hace clic en el mosaico de Semaphore en My Apps, Entra navega a esta URL, que inicia un flujo Authorization Code
normal iniciado por el SP.
