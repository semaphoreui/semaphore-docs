---
title: Keycloak config
description: Example config.json for signing in to Semaphore with Keycloak, plus IdP-initiated login from the Account Console.
---

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

## Project roles from groups <Enterprise /> {#project-roles-from-groups}

To use [group mappings](/admin-guide/authentication/openid#project-roles-from-groups), add a mapper that puts the groups of the user into the ID token:

1. In the Keycloak Admin Console, open your client, go to **Client scopes** and open the `<client-id>-dedicated` scope.
2. Add a mapper **By configuration** and choose **Group Membership**.
3. Set **Token Claim Name** to `groups` and turn on **Add to ID token**.
4. Choose how to send the groups with **Full group path**. When it is on, Keycloak sends the path of each group, for example `/devops` or `/platform/sre`, and the group mapping must use this path. When it is off, Keycloak sends only the name of the group, for example `sre`.

Then set `groups_claim` for the provider:

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "groups_claim": "groups"
    }
  }
}
```

Do not add `groups` to `scopes`. Keycloak refuses a scope that it does not know, and the mapper needs no extra scope.

## IdP-initiated login {#idp-initiated-login}

To let users launch Semaphore from the Keycloak **Account Console** application launcher, enable
[IdP-initiated login](/admin-guide/authentication/openid#idp-initiated-login) for the provider:

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


## Related GitHub Issues {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — How to disable certificate validation for Keycloak server  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — Option to disable TLS verification  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — Log out from Keycloak session when logging out from Semaphore  

[Explore all Keycloak-related issues →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## Related GitHub Discussions {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — Username differs from `preferred_username` in OpenID
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML support?

[Explore all Keycloak-related discussions →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)