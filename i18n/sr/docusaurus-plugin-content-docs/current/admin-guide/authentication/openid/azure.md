# Azure konfiguracija

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

## Prijava koju pokreće IdP {#idp-initiated-login}

Microsoft Entra ID (Azure AD) pokreće aplikacije iz **My Apps** pomoću početnog URL-a koji pokreće SP, a ne pomoću
OpenID Connect mehanizma [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login), i ne šalje pouzdano
parametar `iss`. Za Entra usmerite pločicu na Semaphore krajnju tačku **`/login`** umesto na `/initiate` — tako da
**ne** morate da postavljate `allow_idp_initiated`.

U Azure portalu otvorite **App registration → Branding & properties** i postavite **Home page URL** na:

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

Kada korisnik klikne na Semaphore pločicu u My Apps, Entra prelazi na ovaj URL, čime počinje uobičajeni Authorization Code
tok koji pokreće SP.
