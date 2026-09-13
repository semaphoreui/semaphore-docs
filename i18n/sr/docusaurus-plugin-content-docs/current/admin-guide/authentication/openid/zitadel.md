
# Zitadel konfiguracija

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

Uputstvo na Zitadel-u: [OpenID Connect krajnje tačke u ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).

## Poznati problemi: {#known-issues}

* da biste izbegli grešku `claim 'email' missing or has bad format`, dodajte user Info unutar ID tokena u Zitadel konzoli.
