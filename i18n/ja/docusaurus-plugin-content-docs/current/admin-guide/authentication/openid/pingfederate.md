# PingFederate の設定

```json title="config.json"
{
  "oidc_providers": {
    "pingfederate": {
      "icon": "key",
      "display_name": "Sign in with PingFederate",
      "client_id": "YOUR_CLIENT_ID",
      "client_secret": "YOUR_CLIENT_SECRET",
      "redirect_url": "https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/pingfederate/redirect",
      "endpoint": {
        "issuer": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as",
        "auth": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/authorize",
        "token": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/token",
        "userinfo": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/userinfo",
        "jwks": "https://auth.pingone.eu/YOUR_ENVIRONMENT_ID/as/jwks"
      },
      "scopes": ["openid", "email", "profile"]
    }
  }
}
```

プレースホルダーを PingFederate の設定の値に置き換えてください。

* `YOUR_CLIENT_ID` — OIDC アプリケーションのクライアント ID。
* `YOUR_CLIENT_SECRET` — OIDC アプリケーションのクライアントシークレット。
* `YOUR_SEMAPHORE_HOST_AND_PORT` — 外部からアクセスする Semaphore UI のホストとポート。
* `YOUR_ENVIRONMENT_ID` — issuer URL に含まれる環境の識別子。
