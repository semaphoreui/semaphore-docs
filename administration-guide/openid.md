---
description: OpenID Connect (OIDC) provider configuration
---

# OpenID Connect (OIDC)

Semaphore supports authentication via OpenID Connect (OIDC).

Links:

* [GitHub config](/administration-guide/openid/github.md).
* [Google config](/administration-guide/openid/gogole.md).
* [GitLab config](/administration-guide/openid/gitlab.md).
* [GitHub config](/administration-guide/openid/github.md).
* [Tutorial for GitLab](https://semui.co/blog/openid-authentication/).

<!-- Tutorial for GitLab: [https://semui.co/blog/openid-authentication/](https://semui.co/blog/openid-authentication/). -->

| Parameter | Description |
|-----------|-------------|
| `display_name` | Provider name which displayed on Login screen. |
| `icon` | [MDI-icon](https://pictogrammers.com/library/mdi/) which displayed before of provider name on Login screen.|
| `color` | Provider name which displayed on Login screen. |
| `client_id` |  |
| `client_id_file` |  |
| `client_secret` |  |
| `client_secret_file` |  |
| `redirect_url` |  |
| `provider_url` |  |
| `scopes` |  |
| `username_claim` |  |
| `email_claim` |  |
| `name_claim` |  |
| `order` |  |
| `endpoint.issuer` |  |
| `endpoint.auth` |  |
| `endpoint.token` |  |
| `endpoint.userinfo` |  |
| `endpoint.jwks` |  |
| `endpoint.algorithms` |  |



For each of the configured providers, an additional login button is added to the login page:

![Screenshot of the Semaphore login page, with two login buttons. One says "Sign In", the other says "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)

