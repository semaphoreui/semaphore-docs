# Gitea 配置

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

在你的 `gitea` 实例中，打开 `https://your-gitea.tld/user/settings/applications` 并创建一个新的 `oauth2` 应用。
重定向 URI 使用 `https://your-semaphore.tld/api/auth/oidc/github/redirect`。

认证可以正常工作，但"Name"和"Username"无法被正确接收。在 Semaphore 中，用户名会是一个唯一 ID，名称会被设置为"Anonymous"，用户可以自行修改。邮箱能够被正确映射。
