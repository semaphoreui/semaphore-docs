# Gitea config

Prerequisites:

- An OAuth2 application for Semaphore created in your Gitea instance (client ID and secret).
- Admin access to the Semaphore server's `config.json` file.

```json title="config.json"
"oidc_providers": {
    "github": {
        "icon": "github",
        "display_name": "Sign in with gitea instance",
        "client_id": "123-456-789",
        "client_secret": "**********",
        "redirect_url": "https://your-semaphore.tld/api/auth/oidc/github/redirect",
        "endpoint": {
            "auth": "https://your-gitea.tld/login/oauth/authorize",
            "token": "https://your-gitea.tld/login/oauth/access_token",
            "userinfo": "https://your-gitea.tld/api/v1/user"
        },
        "scopes": ["read:user", "user:email"],
        "username_claim": "login",
        "email_claim": "email",
        "name_claim": "full_name",
        "order": 1
    }
}
```

In your Gitea instance, go to `https://your-gitea.tld/user/settings/applications` and create a new OAuth2 application.
As redirect URI use `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

Authentication works fine, but "Name" and "Username" are not received correctly. The username will be a unique ID in Semaphore and the name will be set to "Anonymous", which can be changed by the user. The email is mapped correctly.
