
# Configuration Zitadel

```json title="config.json"
{
  "oidc_providers": {
    "zitadel":
    {
      "provider_url": "https://your-domain.zitadel.cloud",
      "display_name": "ZITADEL",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com:3000/api/auth/oidc/zitadel/redirect",
      "email_claim": "email"
    },
  }
}
```

Tutoriel Zitadel : [Points de terminaison OpenID Connect dans ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).

## Problèmes connus : {#known-issues}

* pour éviter l'erreur `claim 'email' missing or has bad format`, ajoutez les informations utilisateur (User Info) dans l'ID Token depuis la console Zitadel.
