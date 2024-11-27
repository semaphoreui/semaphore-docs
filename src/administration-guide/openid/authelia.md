# Authelia config

Authelia `config.yaml`:
```yaml
identity_providers:
  oidc:
    - id: semaphore
      description: Semaphore
      secret: 'your_secret'
      public: false
      authorization_policy: two_factor
      redirect_uris:
        - https://your-domain.com/api/auth/oidc/authelia/redirect
      scopes:
        - openid
        - profile
        - email
      userinfo_signing_algorithm: none
```

Semaphore `config.json`:
```json
"oidc_providers":  {
    "authelia": {
        "display_name": "Authelia",
        "provider_url": "https://your-domain.com",
        "client_id": "semaphore",
        "client_secret": "your_secret",
        "redirect_url": "https://your-domain.com/api/auth/oidc/authelia/redirect"
    }
},
```