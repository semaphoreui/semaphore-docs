# PingFederate-Konfiguration

```json title="config.json"
{
  "oidc_providers": {
    "pingfederate": {
      "icon": "key",
      "display_name": "Sign in with PingFederate",
      "client_id": "YOUR_CLIENT_ID",
      "client_secret": "YOUR_CLIENT_SECRET",
      "redirect_url": "https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/pingfederate/redirect",
      "endpoint": {
        "issuer": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as",
        "auth": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/authorize",
        "token": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/token",
        "userinfo": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/userinfo",
        "jwks": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/jwks"
      },
      "scopes": ["openid", "email", "profile"]
    }
  }
}
```

Ersetzen Sie die Platzhalter durch Werte aus Ihrer PingFederate-Konfiguration:

* `YOUR_CLIENT_ID` — die Client-ID der OIDC-Anwendung.
* `YOUR_CLIENT_SECRET` — das Client-Secret der OIDC-Anwendung.
* `YOUR_SEMAPHORE_HOST_AND_PORT` — der externe Host und Port von Semaphore UI.
* `YOUR_ENVIRONMENT_ID` — die Umgebungskennung aus Ihrer Issuer-URL.
