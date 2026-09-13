# Gitea-Konfiguration

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

Gehen Sie in Ihrer `gitea`-Instanz zu `https://your-gitea.tld/user/settings/applications` und erstellen Sie eine neue `oauth2`-Anwendung.
Verwenden Sie als Redirect-URI `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

Die Authentifizierung funktioniert einwandfrei. „Name“ und „Username“ werden jedoch nicht korrekt übernommen. Der Benutzername ist in Semaphore eine eindeutige ID, und der Name wird auf „Anonymous“ gesetzt, was der Benutzer selbst ändern kann. Die E-Mail-Adresse wird korrekt zugeordnet.
