# Azure 配置

```json title="config.json"
{
  "oidc_providers": {
    "azure": {
      "icon": "microsoft",
      "color": "blue",
      "display_name": "Sign in with EntraID",
      "client_id": "REDACTED",
      "client_secret": "REDACTED",
      "redirect_url": "https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/redirect",
      "endpoint": {
        "issuer": "https://login.microsoftonline.com/TENANT_ID/v2.0",
        "auth": "https://login.microsoftonline.com/TENANT_ID/oauth2/v2.0/authorize",
        "token": "https://login.microsoftonline.com/TENANT_ID/oauth2/v2.0/token",
        "userinfo": "https://graph.microsoft.com/oidc/userinfo",
        "jwks": "https://login.microsoftonline.com/TENANT_ID/discovery/v2.0/keys"
      },
      "scopes": ["openid", "email", "profile", "User.Read"]
    }
  }
}
```

## IdP 发起的登录 {#idp-initiated-login}

Microsoft Entra ID（Azure AD）从 **My Apps** 启动应用时使用的是 SP 发起的起始 URL，而不是
OpenID Connect 的 [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login) 机制，并且它不一定会
发送 `iss` 参数。对于 Entra，请将图块指向 Semaphore 的 **`/login`** 端点而不是 `/initiate`——因此你
**不需要**设置 `allow_idp_initiated`。

在 Azure 门户中，打开你的 **App registration → Branding & properties**，并将 **Home page URL** 设置为：

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

当用户在 My Apps 中点击 Semaphore 图块时，Entra 会跳转到该 URL，从而开始一次正常的 SP 发起的
授权码流程。
