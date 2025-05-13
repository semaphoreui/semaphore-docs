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

## GitHub issues
* Question: Disable Certificate Validation for Keycloak Server [#2308](https://github.com/semaphoreui/semaphore/issues/2308)
* Question: TLS Verification Disable [#2314](https://github.com/semaphoreui/semaphore/issues/2314)
* Logout from Keycloak session when logging out from Semaphore [#1496](https://github.com/semaphoreui/semaphore/issues/1496)

[Explore all issues >](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## GitHub discussions

* Username is different from the "preferred_username" of OpenID [#1745](https://github.com/semaphoreui/semaphore/discussions/1745)

[Explore all issues >](https://github.com/semaphoreui/semaphore/discussions?discussions_q=is%3Aopen+keycloak)