# Configuration Gitea

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

Dans votre instance `gitea`, rendez-vous sur `https://your-gitea.tld/user/settings/applications` et créez une nouvelle application `oauth2`.
Utilisez `https://your-semaphore.tld/api/auth/oidc/github/redirect` comme URI de redirection.

L'authentification fonctionne correctement. En revanche, « Name » et « Username » ne sont pas reçus correctement. Le nom d'utilisateur sera un ID unique dans Semaphore et le nom sera défini à « Anonymous », que l'utilisateur peut modifier lui-même. L'e-mail est correctement mappé.
