
# Keycloak config

```yaml title="config.json"
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

## IdP-initiated login

To let users launch Semaphore from the Keycloak **Account Console** application launcher, enable
[IdP-initiated login](/admin-guide/openid#idp-initiated-login) for the provider:

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

Then, in the Keycloak Admin Console, open your client and set the **Home URL** (Keycloak ≥ 19; older versions call it
*Base URL*) to:

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

When a user clicks the application in the launcher, Keycloak redirects to this URL with the `iss` parameter. Semaphore
validates `iss` against your `provider_url` (the realm issuer) and starts a normal Authorization Code flow.


## Related GitHub Issues

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — How to disable certificate validation for Keycloak server  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Option to disable TLS verification  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Log out from Keycloak session when logging out from Semaphore  

[Explore all Keycloak-related issues →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Related GitHub Discussions

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Username differs from `preferred_username` in OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML support?

[Explore all Keycloak-related discussions →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)