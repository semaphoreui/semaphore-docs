---
title: Pocket-ID 配置
description: 使用 Pocket-ID 登录 Semaphore 的 config.json 示例，包括 scope 以及用户名和姓名 claim。
---

# Pocket-ID 配置

```json title="config.json"
"oidc_providers": {
    "pocketid": {
        "display_name": "Sign in with PocketID",
        "provider_url": "https://<your-pocket-id-url>",
        "client_id": "<client-id-from-pocket-id>",
        "client_secret": "<client-secret-from-pocket-id>",
        "redirect_url": "https://<your-semaphore-ui-url>/api/auth/oidc/pocketid/redirect/",
        "scopes": [
            "openid",
            "profile",
            "email"
        ],
        "username_claim": "email",
        "name_claim": "given_name"
    }
}
```

Pocket-ID 网站的 Client Examples 中也提供了相关信息：[Pocket-ID Client Examples - Semaphore UI](https://pocket-id.org/docs/client-examples/semaphore-ui/)。
