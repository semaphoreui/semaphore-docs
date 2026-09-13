# PingFederate 配置

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

请将占位符替换为你的 PingFederate 配置中的值：

* `YOUR_CLIENT_ID`——OIDC 应用的客户端 ID。
* `YOUR_CLIENT_SECRET`——OIDC 应用的客户端密钥。
* `YOUR_SEMAPHORE_HOST_AND_PORT`——Semaphore UI 的外部主机名和端口。
* `YOUR_ENVIRONMENT_ID`——issuer URL 中的环境标识符。
