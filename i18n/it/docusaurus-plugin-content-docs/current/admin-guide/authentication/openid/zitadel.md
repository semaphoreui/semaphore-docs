
# Configurazione Zitadel

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

Tutorial su Zitadel: [OpenID Connect Endpoints in ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).

## Problemi noti: {#known-issues}

* per evitare l'errore `claim 'email' missing or has bad format`, aggiungere le informazioni utente (user Info) all'interno dell'ID Token nella console di Zitadel.
