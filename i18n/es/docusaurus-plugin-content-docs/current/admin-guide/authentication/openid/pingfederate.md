# Configuración de PingFederate

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

Sustituya los marcadores de posición por los valores de su configuración de PingFederate:

* `YOUR_CLIENT_ID` — el ID de cliente de la aplicación OIDC.
* `YOUR_CLIENT_SECRET` — el secreto de cliente de la aplicación OIDC.
* `YOUR_SEMAPHORE_HOST_AND_PORT` — el host y puerto externos de Semaphore UI.
* `YOUR_ENVIRONMENT_ID` — el identificador del entorno de su URL de issuer.
