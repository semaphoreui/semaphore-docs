# Azure config

Prerequisites:

- An app registration for Semaphore in Microsoft Entra ID (client ID and secret).
- Admin access to the Semaphore server's `config.json` file.

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

## IdP-initiated login

Microsoft Entra ID (Azure AD) launches applications from **My Apps** using an SP-initiated start URL rather than the
OpenID Connect [Third-Party Initiated Login](/admin-guide/openid#idp-initiated-login) mechanism, and it does not reliably
send the `iss` parameter. For Entra, point the tile at Semaphore's **`/login`** endpoint instead of `/initiate` — so you
do **not** need to set `allow_idp_initiated`.

In the Azure portal, open your **App registration → Branding & properties** and set the **Home page URL** to:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

When a user clicks the Semaphore tile in My Apps, Entra navigates to this URL, which begins a normal SP-initiated
Authorization Code flow.
