# Настройка Gitea

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

В вашем экземпляре `gitea` перейдите по адресу `https://your-gitea.tld/user/settings/applications` и создайте новое приложение `oauth2`.
В качестве redirect URI укажите `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

Аутентификация работает корректно. Однако «Name» и «Username» передаются неправильно. Имя пользователя в Semaphore будет уникальным ID, а имя будет установлено в «Anonymous» — пользователь может изменить его самостоятельно. Email сопоставляется корректно.
