
# Keycloak 配置

```yaml title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "display_name": "Sign in with keycloak",
      "provider_url": "https://keycloak.example.com/realms/master",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://semaphore.example.com/api/auth/oidc/keycloak/redirect"
    }
  }
}
```

## IdP 发起的登录 {#idp-initiated-login}

若要让用户从 Keycloak **Account Console** 的应用启动器打开 Semaphore，请为该提供方启用
[IdP 发起的登录](/admin-guide/authentication/openid#idp-initiated-login)：

```json title="config.json"
{
  "oidc_providers": {
    "keycloak": {
      "...": "...",
      "allow_idp_initiated": true
    }
  }
}
```

然后，在 Keycloak Admin Console 中打开你的客户端，并将 **Home URL**（Keycloak ≥ 19；旧版本称为
*Base URL*）设置为：

```
https://semaphore.example.com/api/auth/oidc/keycloak/initiate
```

当用户在启动器中点击该应用时，Keycloak 会携带 `iss` 参数重定向到该 URL。Semaphore
会根据你的 `provider_url`（即 realm 的 issuer）校验 `iss`，然后开始一次正常的授权码流程。


## 相关 GitHub Issue {#related-github-issues}

* [#2308](https://github.com/semaphoreui/semaphore/issues/2308) — 如何为 Keycloak 服务器禁用证书校验  
* [#2314](https://github.com/semaphoreui/semaphore/issues/2314) — 提供禁用 TLS 校验的选项  
* [#1496](https://github.com/semaphoreui/semaphore/issues/1496) — 从 Semaphore 退出登录时同时退出 Keycloak 会话  

[浏览所有与 Keycloak 相关的 Issue →](https://github.com/semaphoreui/semaphore/issues?q=is%3Aissue%20keycloak)

## 相关 GitHub 讨论 {#related-github-discussions}

* [#1745](https://github.com/semaphoreui/semaphore/discussions/1745) — OpenID 中的用户名与 `preferred_username` 不一致
* [#1030](https://github.com/semaphoreui/semaphore/discussions/1030) &mdash; 是否支持 SAML？

[浏览所有与 Keycloak 相关的讨论 →](https://github.com/semaphoreui/semaphore/discussions?discussions_q=keycloak)
