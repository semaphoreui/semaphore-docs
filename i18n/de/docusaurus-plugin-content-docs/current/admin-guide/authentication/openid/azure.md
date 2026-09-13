# Azure-Konfiguration

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

## IdP-initiierte Anmeldung {#idp-initiated-login}

Microsoft Entra ID (Azure AD) startet Anwendungen aus **My Apps** über eine SP-initiierte Start-URL statt über den
OpenID-Connect-Mechanismus [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login) und sendet den
Parameter `iss` nicht zuverlässig. Richten Sie die Kachel für Entra daher auf den **`/login`**-Endpunkt von Semaphore statt auf `/initiate` – Sie müssen
`allow_idp_initiated` also **nicht** setzen.

Öffnen Sie im Azure-Portal Ihre **App registration → Branding & properties** und setzen Sie die **Home page URL** auf:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

Wenn ein Benutzer in My Apps auf die Semaphore-Kachel klickt, navigiert Entra zu dieser URL, wodurch ein normaler SP-initiierter
Authorization-Code-Flow beginnt.
