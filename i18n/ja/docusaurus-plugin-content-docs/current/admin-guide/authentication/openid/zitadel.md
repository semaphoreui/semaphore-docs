
# Zitadel の設定

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

Zitadel のチュートリアル: [ZITADEL の OpenID Connect エンドポイント](https://zitadel.com/docs/apis/openidoauth/endpoints)。

## 既知の問題: {#known-issues}

* エラー `claim 'email' missing or has bad format` を回避するには、Zitadel コンソールで ID トークン内にユーザー情報を含めるよう設定してください。
