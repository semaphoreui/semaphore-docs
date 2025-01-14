<div class="breadcrumbs">
    <a href="/administration-guide/openid">OpenID</a>
    → Authentik config
</div>

# Authentik config

`config.json`:

```yaml
{
  "oidc_providers": {
    "authentik": {
      "display_name": "Sign in with Authentik",
      "provider_url": "https://authentik.example.com/application/o/<slug>/",
      "client_id": "<client-id>",
      "client_secret": "<client-secret>",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/authentik/redirect/",
      "scopes": ["openid", "profile", "email"],
      "username_claim": "preferred_username",
      "name_claim": "preferred_username"
    }
  }
}
```

Discussion on GitHub: [#1663](https://github.com/semaphoreui/semaphore/discussions/1663).

See also description in [authentik docs](https://docs.goauthentik.io/integrations/services/semaphore/).
