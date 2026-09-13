# Configurazione Azure

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

## Accesso avviato dall'IdP {#idp-initiated-login}

Microsoft Entra ID (Azure AD) avvia le applicazioni da **My Apps** utilizzando un URL di avvio SP-initiated anziché il
meccanismo [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login) di OpenID Connect, e non invia in modo
affidabile il parametro `iss`. Per Entra, puntare il riquadro all'endpoint **`/login`** di Semaphore invece di `/initiate`: in questo modo
**non** è necessario impostare `allow_idp_initiated`.

Nel portale Azure, aprire **App registration → Branding & properties** e impostare **Home page URL** a:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

Quando un utente fa clic sul riquadro di Semaphore in My Apps, Entra apre questo URL, che avvia un normale flusso
Authorization Code SP-initiated.
