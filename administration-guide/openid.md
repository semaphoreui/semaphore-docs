---
description: OpenID provider configuration
---

# OpenID

Semaphore supports authentication via OpenID.

Tutorial for GitLab: [https://www.ansible-semaphore.com/blog/openid-authentication/](https://www.ansible-semaphore.com/blog/openid-authentication/).

Multiple OIDC providers can be configured in config.json:
```yaml
{
  # ...
  "oidc_providers": {
    "mysso": {  # The ID of the provider, is used as a URL path component in the redirect URL
      "display_name": "Sign in with MySSO",  # Text on the additional login button
      "provider_url": "https://keycloak.example.org/realms/mysso",  # Root URL of the OIDC provider, expects /.well-known/openid-configuration below this URL
      "client_id": "556e8e0a-bba8-49e8-af80-eae6db863b23",
      "client_secret": "ad497288-34bf-4452-bff6-2c218992f906",
      # "redirect_url": "${web_host}/api/auth/oidc/${provider}/redirect",  # default value, the OIDC provider redirects back here
      # "scopes": ["openid", "profile", "email"],  # default value, OIDC scopes
      # "username_claim": "preferred_username",  # default value, id_token claim to use as the username
      # "name_claim": "preferred_username",  # default value, id_token claim to use as the display name
      # "email_claim": "email"  # default value, id_token claim to use as the email address
      # If the OIDC provider does not offer a /.well-known/openid-configuration, the endpoints can be
      # configured manually.  In this case, the "provider_url" must be omitted.
      # "endpoint": {
      #   "issuer": "https://keycloak.example.org/realms/mysso",
      #   "auth": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/auth",
      #   "token": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/token",
      #   "userinfo": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/userinfo",
      #   "jwks": "https://keycloak.example.org/realms/mysso/protocol/openid-connect/certs",
      #   "algorithms": ["HS256", ...]
      # }
    }
  }
}
```

## GitLab, GitHub and Google config exmaple

### Semaphore config.json:
```json
{
  "oidc_providers": {
    "gitlab": {

      "color": "orange",
      "icon": "gitlab",

      "display_name": "Sign in with GitLab",
      "provider_url": "https://gitlab.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore-public-host.com/api/auth/oidc/gitlab/redirect"
    },
    "github": {
      "icon": "github",
      "display_name": "Sign in with GitHub",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore-public-host.com/api/auth/oidc/github/redirect",
      "endpoint": {
        "auth": "https://github.com/login/oauth/authorize",
        "token": "https://github.com/login/oauth/access_token",
        "userinfo": "https://api.github.com/user"
      },
      "scopes": ["read:user", "user:email"]
    },
    "google": {
      "color": "blue",
      "icon": "google",
      "display_name": "Sign in with Google",
      "provider_url": "https://accounts.google.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore-public-host.com/api/auth/oidc/google/redirect",
      "username_claim": "email",
      "name_claim": "name"
    }
  }
}
```

### Authelia config.yaml:
```yaml
identity_providers:
  oidc:
    - id: semaphore
      description: Semaphore
      secret: 'your_secret'
      public: false
      authorization_policy: two_factor
      redirect_uris:
        - https://semaphore.example.com/api/auth/oidc/authelia/redirect
      scopes:
        - openid
        - profile
        - email
      userinfo_signing_algorithm: none
```

### Semaphore config.json:
```json
"oidc_providers":  {
    "authelia": {
        "display_name": "Authelia",
        "provider_url": "https://authelia.example.com",
        "client_id": "semaphore",
        "client_secret": "your_secret",
        "redirect_url": "https://semaphore.example.com/api/auth/oidc/authelia/redirect"
    }
},
```

For each of the configured providers, an additional login button is added to the login page:

![Screenshot of the Semaphore login page, with two login buttons. One says "Sign In", the other says "Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)

