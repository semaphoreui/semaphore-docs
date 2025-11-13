<div class="breadcrumbs">
    <a href="/administration-guide/openid">OpenID</a>
    → Gitea config
</div>

# Gitea config

`config.json`:
```json
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

In your `gitea` instance, go to `https://your-gitea.tld/user/settings/applications` and create a new `oauth2` application.
As redirect URI use `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

Authentication works fine. But "Name" and "Username" does not recieved correctly. The username will be a unique ID in semaphore and the name will be set to "Anonymous", which is changeable by the user itself. The emails is mapped correctly.
