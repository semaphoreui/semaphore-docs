# Configuração do Gitea

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

Na sua instância do `gitea`, acesse `https://your-gitea.tld/user/settings/applications` e crie uma nova aplicação `oauth2`.
Como URI de redirecionamento, use `https://your-semaphore.tld/api/auth/oidc/github/redirect`.

A autenticação funciona bem. Porém, "Name" e "Username" não são recebidos corretamente. O nome de usuário será um ID único no semaphore e o nome será definido como "Anonymous", que pode ser alterado pelo próprio usuário. O e-mail é mapeado corretamente.
