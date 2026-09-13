---
title: GitHub config
description: A working oidc_providers block for GitHub OAuth, with its endpoints, scopes and username and email claim expressions.
---


# GitHub config

```json title="config.json"
{
    "oidc_providers": {
        "github": {
            "icon": "github",
            "display_name": "Sign in with GitHub",
            "client_id": "***",
            "client_secret": "***",
            "redirect_url": "https://your-domain.com/api/auth/oidc/github/redirect",
            "endpoint": {
                "auth": "https://github.com/login/oauth/authorize",
                "token": "https://github.com/login/oauth/access_token",
                "userinfo": "https://api.github.com/user"
            },
            "scopes": ["read:user", "user:email"],
            "username_claim": "|",
            "email_claim": "email | {{ .id }}@github.your-domain.com",
            "name_claim": "name",
            "order": 1
        }
    }
}
```