---
description: OpenID Connect (OIDC) provider configuration
---

# OpenID

Semaphore supports authentication via OpenID Connect (OIDC).

Links:

* [GitHub config](openid/github.md).
* [Google config](administration-guide/openid/gogole.md).
* [GitLab config](administration-guide/openid/gitlab.md).
* [Authelia config](administration-guide/openid/authelia.md).
* [Authentik config](administration-guide/openid/authentik.md).
* [Keycloak config](administration-guide/openid/keycloak.md).
* [Okta config](administration-guide/openid/okta.md).
* [Tutorial for GitLab](https://semui.co/blog/openid-authentication/).

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
| `username_claim`      | Username claim expression[\*](administration-guide/openid/#claim-expression).                               |
| `email_claim`         | Email claim expression[\*](administration-guide/openid/#claim-expression).                                  |
| `name_claim`          | Profile Name claim expression[\*](administration-guide/openid/#claim-expression).                           |
| `order`               | Position of the provider button on the Sign in screen.                                                      |
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

{% hint style="info" %}
The expression `"username_claim": "|"` generates a random `username` for each user who logs in through the provider.
{% endhint %}

## Sign in screen

For each of the configured providers, an additional login button is added to the login page:

![Screenshot of the Semaphore login page, with two login buttons. One says "Sign In", the other says "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
