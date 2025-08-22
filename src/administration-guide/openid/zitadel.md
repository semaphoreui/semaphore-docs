<div class="breadcrumbs">
    <a href="/administration-guide/openid">OpenID</a>
    → Zitadel config
</div>

# Zitadel config

`config.json`:
```json
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

Tutorial on Zitadel: [OpenID Connect Endpoints in ZITADEL](https://zitadel.com/docs/apis/openidoauth/endpoints).
