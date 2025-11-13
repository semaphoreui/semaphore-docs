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


## Related GitHub Issues

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — How to disable certificate validation for Keycloak server  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Option to disable TLS verification  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Log out from Keycloak session when logging out from Semaphore  

[Explore all Keycloak-related issues →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Related GitHub Discussions

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Username differs from `preferred_username` in OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML support?

[Explore all Keycloak-related discussions →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)