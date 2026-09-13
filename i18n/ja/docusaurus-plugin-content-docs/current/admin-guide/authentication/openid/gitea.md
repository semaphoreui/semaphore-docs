# Gitea の設定

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

`gitea` インスタンスで `https://your-gitea.tld/user/settings/applications` にアクセスし、新しい `oauth2` アプリケーションを作成します。
リダイレクト URI には `https://your-semaphore.tld/api/auth/oidc/github/redirect` を使用します。

認証は問題なく動作します。ただし、「Name」と「Username」は正しく受け取れません。ユーザー名は Semaphore 内で一意の ID になり、名前は「Anonymous」に設定されます(これはユーザー自身が変更できます)。メールアドレスは正しくマッピングされます。
