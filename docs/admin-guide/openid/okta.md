
# Okta config

Prerequisites:

- An OIDC application for Semaphore created in Okta (client ID and secret).
- Admin access to the Semaphore server's `config.json` file.

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "display_name": "Sign in with Okta",
      "provider_url": "https://trial-776xxxx.okta.com/oauth2/default",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```

## IdP-initiated login

To let users start sign-in from the Okta dashboard tile, enable
[IdP-initiated login](/admin-guide/openid#idp-initiated-login) for the provider:

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

Then, in the Okta Admin Console, open your application's **General** settings and configure the *Login* section:

1. Set **Login initiated by** to *Either Okta or App* (or *App Only*).
2. Set **Initiate login URI** to:

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. (Optional) Under **Application visibility**, enable *Display application icon to users* so the tile appears on the
   Okta dashboard.

Okta sends the `iss` and `target_link_uri` parameters; Semaphore validates `iss` against your `provider_url` and starts
a normal Authorization Code flow.


## Related GitHub Issues

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — Help with OIDC Azure AD configuration/debugging
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 breaks oidc auth with keycloak
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — testing oidc_providers

[Explore all Okta-related issues →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## Related GitHub Discussions

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — When setting up GitHub OpenID, parsing is not possible except for Email
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; SAML support?

[Explore all Okta-related discussions →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
