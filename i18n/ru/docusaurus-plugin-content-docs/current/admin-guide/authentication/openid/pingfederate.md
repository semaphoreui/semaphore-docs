# Настройка PingFederate

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

Замените заполнители значениями из вашей конфигурации PingFederate:

* `YOUR_CLIENT_ID` — client ID OIDC-приложения.
* `YOUR_CLIENT_SECRET` — client secret OIDC-приложения.
* `YOUR_SEMAPHORE_HOST_AND_PORT` — внешний хост и порт Semaphore UI.
* `YOUR_ENVIRONMENT_ID` — идентификатор окружения из вашего URL issuer.
