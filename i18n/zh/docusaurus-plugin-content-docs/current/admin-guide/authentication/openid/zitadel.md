
# Zitadel 配置

```json title="config.json"
{
  "oidc_providers": {
    "zitadel":
    {
      "provider_url": "https://your-domain.zitadel.cloud",
      "display_name": "ZITADEL",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com:3000/api/auth/oidc/zitadel/redirect",
      "email_claim": "email"
    },
  }
}
```

Zitadel 上的教程：[ZITADEL 中的 OpenID Connect 端点](https://zitadel.com/docs/apis/openidoauth/endpoints)。

## 已知问题： {#known-issues}

* 为避免出现 `claim 'email' missing or has bad format` 错误，请在 Zitadel 控制台中将用户信息（user Info）添加到 ID Token 中。
