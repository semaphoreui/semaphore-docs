# Configuration PingFederate

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

Remplacez les espaces réservés par les valeurs de votre configuration PingFederate :

* `YOUR_CLIENT_ID` — l'ID client de l'application OIDC.
* `YOUR_CLIENT_SECRET` — le secret client de l'application OIDC.
* `YOUR_SEMAPHORE_HOST_AND_PORT` — l'hôte et le port externes de Semaphore UI.
* `YOUR_ENVIRONMENT_ID` — l'identifiant d'environnement issu de votre URL d'issuer.
