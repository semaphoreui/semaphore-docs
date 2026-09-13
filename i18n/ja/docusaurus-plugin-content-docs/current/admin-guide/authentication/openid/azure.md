# Azure の設定

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

## IdP 起点のログイン {#idp-initiated-login}

Microsoft Entra ID(Azure AD)は、OpenID Connect の [Third-Party Initiated Login](/admin-guide/authentication/openid#idp-initiated-login) の仕組みではなく、
SP 起点の開始 URL を使って **My Apps** からアプリケーションを起動します。また、`iss` パラメータを確実に送信するとは限りません。
Entra の場合は、タイルの向き先を `/initiate` ではなく Semaphore の **`/login`** エンドポイントにしてください。そのため、
`allow_idp_initiated` を設定する必要は**ありません**。

Azure ポータルで、**アプリの登録 → ブランド化とプロパティ**を開き、**ホームページ URL** を次のように設定します。

```
https://YOUR_SEMAPHORE_HOST_AND_PORT/api/auth/oidc/azure/login
```

ユーザーが My Apps で Semaphore のタイルをクリックすると、Entra はこの URL に移動し、通常の SP 起点の
認可コードフローが開始されます。
