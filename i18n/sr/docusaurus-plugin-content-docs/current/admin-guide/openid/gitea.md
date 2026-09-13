# Gitea konfiguracija

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

U svojoj `gitea` instanci idite na `https://your-gitea.tld/user/settings/applications` i kreirajte novu `oauth2` aplikaciju.
Kao redirect URI koristite `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

Autentifikacija radi ispravno. Međutim, „Name“ i „Username“ se ne preuzimaju ispravno. Korisničko ime će u Semaphore-u biti jedinstveni ID, a ime će biti postavljeno na „Anonymous“, što korisnik sam može da promeni. E-adrese se mapiraju ispravno.
