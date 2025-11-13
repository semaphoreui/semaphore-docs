<div class="breadcrumbs">
    <a href="/administration-guide/openid">OpenID</a>
    → Azure config
</div>

# Azure config

`config.json`:
```json
{
  "oidc_providers": {
        "azure": {
            "color": "blue",
            "display_name": "Sign in with Azure (Entra ID)",
            "provider_url": "https://login.microsoftonline.com/<Tennant ID>/v2.0",
            "client_id": "<ID>",
            "client_secret": "<secret>",
            "redirect_url": "https://semaphore.test.com/api/auth/oidc/azure/redirect"
        }
  }
}
```