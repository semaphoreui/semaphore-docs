
# Configuração do Zitadel

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

Tutorial do Zitadel: [OpenID Connect Endpoints in ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).

## Problemas conhecidos: {#known-issues}

* para evitar o erro `claim 'email' missing or has bad format`, adicione as informações do usuário (user Info) dentro do ID Token no console do Zitadel.
