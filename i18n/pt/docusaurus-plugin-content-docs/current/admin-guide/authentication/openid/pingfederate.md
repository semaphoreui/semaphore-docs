# Configuração do PingFederate

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

Substitua os espaços reservados pelos valores da sua configuração do PingFederate:

* `YOUR_CLIENT_ID` — o ID de cliente da aplicação OIDC.
* `YOUR_CLIENT_SECRET` — o segredo de cliente da aplicação OIDC.
* `YOUR_SEMAPHORE_HOST_AND_PORT` — o host e a porta externos do Semaphore UI.
* `YOUR_ENVIRONMENT_ID` — o identificador do ambiente da sua URL de issuer.
