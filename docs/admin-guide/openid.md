# OpenID Connect

Semaphore supports authentication via OpenID Connect (OIDC).

Links:

* [GitHub config](/admin-guide/openid/github)
* [Google config](/admin-guide/openid/google)
* [GitLab config](/admin-guide/openid/gitlab)
* [Authelia config](/admin-guide/openid/authelia)
* [Authentik config](/admin-guide/openid/authentik)
* [Keycloak config](/admin-guide/openid/keycloak)
* [Okta config](/admin-guide/openid/okta)
* [Azure config](/admin-guide/openid/azure)
* [Zitadel config](/admin-guide/openid/zitadel)
* [Pocket-ID config](/admin-guide/openid/pocket-id)

Example of SSO provider configuration:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "color": "orange",
      "icon": "login",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect"
    }
  }
}
```

### Configure via environment variable

When running in containers it may be convenient to configure providers using a single environment variable:

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

This value must be a valid JSON string matching the `oidc_providers` structure above.

All SSO provider options:

| Parameter             | Description                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | Provider name which displayed on Login screen.                                                              |
| `icon`                | [MDI-icon](https://pictogrammers.com/library/mdi/) which displayed before of provider name on Login screen. |
| `color`               | Provider name which displayed on Login screen.                                                              |
| `client_id`           | Provider client ID.                                                                                         |
| `client_id_file`      | The path to the file where the provider's client ID is stored. Has less priorty then `client_id`.           |
| `client_secret`       | Provider client Secret.                                                                                     |
| `client_secret_file`  | The path to the file where the provider's client secret is stored. Has less priorty then `client_secret`.   |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | Username claim expression[\*](#claim-expression).                               |
| `email_claim`         | Email claim expression[\*](#claim-expression).                                  |
| `name_claim`          | Profile Name claim expression[\*](#claim-expression).                           |
| `order`               | Position of the provider button on the Sign in screen.                                                      |
| `allow_idp_initiated` | Enable [IdP-initiated login](#idp-initiated-login) for this provider. Default `false`.                       |
| `return_via_state`    | Pass the post-login return path via the OAuth `state` parameter instead of the redirect URL. Default `true`. |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*Claim expression

Example of claim expression:

```
email | {{ .username }}@your-domain.com
```

Semaphore is attempting to claim the email field first. If it is empty, the expression following it is executed.

<div class="warning">
  The expression <code>"username_claim": "|"</code> generates a random <code>username</code> for each user who logs in through the provider.
</div>

## IdP-initiated login

By default Semaphore only supports **SP-initiated** sign-in: the user opens Semaphore, clicks the provider button, and
is redirected to the identity provider (IdP).

With **IdP-initiated** login the journey can start at the identity provider instead — for example by clicking the
Semaphore tile in the Okta dashboard, Azure *My Apps*, or a Keycloak / Authentik application launcher.

Semaphore implements this using the standard **Third-Party Initiated Login** mechanism
([OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)). The IdP
redirects the browser to a dedicated **Initiate Login URI**, and Semaphore then starts a normal Authorization Code flow.
The actual authentication is still a full, secure code exchange — Semaphore never accepts an unsolicited token.

### Enabling it

Set `allow_idp_initiated` to `true` for the provider:

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect",
      "allow_idp_initiated": true
    }
  }
}
```

### Configuring the identity provider

In your IdP, set the application's **Initiate Login URI** to:

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

where `<provider-id>` is the key under `oidc_providers` (for example `mysso`).

The IdP must send the `iss` (issuer) parameter to this endpoint; Semaphore rejects requests whose `iss` does not match
the configured provider. The optional `login_hint` parameter is forwarded to the IdP, and an optional `target_link_uri`
sets the page to open after login (it must point back to Semaphore, otherwise it is ignored).

Provider-specific notes:

- **Okta** — set *Login initiated by* to *Either Okta or App* (or *App Only*) and fill in the *Initiate login URI*. Okta
  sends both `iss` and `target_link_uri`.
- **Keycloak / Authentik / Ping / OneLogin** — set the application's launch / home URL to the Initiate Login URI.
- **Azure AD / Entra** — *My Apps* uses an SP-initiated start URL and does not always send `iss`; point the start URL at
  `https://your-domain.com/api/auth/oidc/<provider-id>/login` instead.

### Security

- IdP-initiated login is **off by default** and must be enabled per provider.
- The `iss` parameter is validated against the configured issuer to prevent provider mix-up.
- `target_link_uri` is accepted only when it points back to Semaphore (no open redirects).
- The flow goes through the full Authorization Code exchange with CSRF `state` and a `nonce`, so a captured or replayed
  token cannot be used to sign in.

## Sign in screen

For each of the configured providers, an additional login button is added to the login page:

![Screenshot of the Semaphore login page, with two login buttons. One says "Sign In", the other says "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
