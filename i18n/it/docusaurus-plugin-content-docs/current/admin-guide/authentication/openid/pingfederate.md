# Configurazione PingFederate

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

Sostituire i segnaposto con i valori della propria configurazione PingFederate:

* `YOUR_CLIENT_ID` — il client ID dell'applicazione OIDC.
* `YOUR_CLIENT_SECRET` — il client secret dell'applicazione OIDC.
* `YOUR_SEMAPHORE_HOST_AND_PORT` — host e porta esterni di Semaphore UI.
* `YOUR_ENVIRONMENT_ID` — l'identificatore dell'ambiente ricavato dall'URL dell'issuer.
