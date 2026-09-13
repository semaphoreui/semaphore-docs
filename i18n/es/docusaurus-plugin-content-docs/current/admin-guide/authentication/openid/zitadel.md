
# Configuración de Zitadel

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

Tutorial en Zitadel: [Endpoints de OpenID Connect en ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).

## Problemas conocidos: {#known-issues}

* para evitar el error `claim 'email' missing or has bad format`, añada la información del usuario (user Info) dentro del ID Token en la consola de Zitadel.
