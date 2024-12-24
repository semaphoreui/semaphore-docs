<div class="breadcrumbs">
    <a href="/administration-guide/openid">OpenID</a>
    → Okta config
</div>

# Okta config

`config.json`:

```yaml
{
  "oidc_providers": {
    "okta": {
      "display_name":"Sign in with Okta",
      "provider_url":"https://trial-776xxxx.okta.com/oauth2/default",
      "client_id":"***",
      "client_secret":"***",
      "redirect_url":"https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```