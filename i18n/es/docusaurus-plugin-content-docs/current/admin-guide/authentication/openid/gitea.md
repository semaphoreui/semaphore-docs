# Configuración de Gitea

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

En su instancia de `gitea`, vaya a `https://your-gitea.tld/user/settings/applications` y cree una nueva aplicación `oauth2`.
Como URI de redirección use `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

La autenticación funciona correctamente. Sin embargo, "Name" y "Username" no se reciben correctamente. El nombre de usuario será un ID único en Semaphore y el nombre se establecerá como "Anonymous", que el propio usuario puede cambiar. El correo electrónico se asigna correctamente.
