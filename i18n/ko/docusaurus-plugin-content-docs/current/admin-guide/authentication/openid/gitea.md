# Gitea 설정

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

`gitea` 인스턴스에서 `https://your-gitea.tld/user/settings/applications`로 이동하여 새 `oauth2` 애플리케이션을 만듭니다.
redirect URI로는 `https://your-semaphore.tld/api/auth/oidc/github/redirect`를 사용합니다.

인증은 정상적으로 동작합니다. 그러나 "Name"과 "Username"은 올바르게 수신되지 않습니다. Semaphore에서 사용자 이름은 고유 ID가 되고, 이름은 "Anonymous"로 설정되며 사용자가 직접 변경할 수 있습니다. 이메일은 올바르게 매핑됩니다.
