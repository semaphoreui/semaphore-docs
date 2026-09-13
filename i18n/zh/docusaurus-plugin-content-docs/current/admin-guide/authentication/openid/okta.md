
# Okta 配置

```yaml title="config.json"
{
  "oidc_providers": {
    "okta": {
      "display_name": "Sign in with Okta",
      "provider_url": "https://trial-776xxxx.okta.com/oauth2/default",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/okta/redirect/"
    }
  }
}
```

## IdP 发起的登录 {#idp-initiated-login}

若要让用户从 Okta 控制面板的图块开始登录，请为该提供方启用
[IdP 发起的登录](/admin-guide/authentication/openid#idp-initiated-login)：

```json title="config.json"
{
  "oidc_providers": {
    "okta": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

然后，在 Okta Admin Console 中打开应用的 **General** 设置，并配置 *Login* 部分：

1. 将 **Login initiated by** 设置为 *Either Okta or App*（或 *App Only*）。
2. 将 **Initiate login URI** 设置为：

   ```
   https://semaphore.example.com/api/auth/oidc/okta/initiate
   ```

3. （可选）在 **Application visibility** 下启用 *Display application icon to users*，这样图块就会显示在
   Okta 控制面板上。

Okta 会发送 `iss` 和 `target_link_uri` 参数；Semaphore 会根据你的 `provider_url` 校验 `iss`，然后开始
一次正常的授权码流程。


## 相关 GitHub Issue {#related-github-issues}

* [#1434](https://github.com/semaphoreui/semaphore/issues/1434) — 关于 OIDC Azure AD 配置/调试的求助
* [#1864](https://github.com/semaphoreui/semaphore/issues/1864) — v2.9.56 导致 keycloak 的 oidc 认证失效
* [#1329](https://github.com/semaphoreui/semaphore/issues/1329) — 测试 oidc_providers

[浏览所有与 Okta 相关的 Issue →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20okta)

## 相关 GitHub 讨论 {#related-github-discussions}

* [#2822](https://github.com/semaphoreui/semaphore/discussions/2822) — 配置 GitHub OpenID 时，除 Email 之外无法解析其他字段
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; 是否支持 SAML？

[浏览所有与 Okta 相关的讨论 →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=okta)
