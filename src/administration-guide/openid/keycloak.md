<div class="breadcrumbs">
    <a href="/administration-guide/openid">OpenID</a>
    → Keycloak config
</div>

# Keycloak config

`config.json`:

```yaml
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "https://keycloak.example.com/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/keycloak/redirect"
    }
  }
}
```
