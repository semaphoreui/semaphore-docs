# Configurazione Gitea

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

Nella propria istanza `gitea`, andare su `https://your-gitea.tld/user/settings/applications` e creare una nuova applicazione `oauth2`.
Come redirect URI utilizzare `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

L'autenticazione funziona correttamente. Tuttavia "Name" e "Username" non vengono ricevuti correttamente. Il nome utente sarà un ID univoco in Semaphore e il nome verrà impostato ad "Anonymous", modificabile dall'utente stesso. L'email viene mappata correttamente.
