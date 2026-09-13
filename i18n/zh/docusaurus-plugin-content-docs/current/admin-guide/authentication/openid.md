# OpenID Connect

Semaphore 支持通过 OpenID Connect（OIDC）进行身份认证。

相关链接：

* [GitHub 配置](/admin-guide/authentication/openid/github)
* [Google 配置](/admin-guide/authentication/openid/google)
* [GitLab 配置](/admin-guide/authentication/openid/gitlab)
* [Authelia 配置](/admin-guide/authentication/openid/authelia)
* [Authentik 配置](/admin-guide/authentication/openid/authentik)
* [Keycloak 配置](/admin-guide/authentication/openid/keycloak)
* [Okta 配置](/admin-guide/authentication/openid/okta)
* [PingFederate 配置](/admin-guide/authentication/openid/pingfederate)
* [Azure 配置](/admin-guide/authentication/openid/azure)
* [Zitadel 配置](/admin-guide/authentication/openid/zitadel)
* [Pocket-ID 配置](/admin-guide/authentication/openid/pocket-id)

SSO 提供方配置示例：

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "color": "orange",
      "icon": "login",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect"
    }
  }
}
```

### 通过环境变量配置 {#configure-via-environment-variable}

在容器中运行时，使用单个环境变量来配置提供方可能更加方便：

```bash
SEMAPHORE_OIDC_PROVIDERS='{
  "github": {
    "client_id": "***",
    "client_secret": "***"
  }
}'
```

该值必须是有效的 JSON 字符串，且结构与上面的 `oidc_providers` 一致。

SSO 提供方的全部选项：

| 参数                  | 说明                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------- |
| `display_name`        | 在登录页面上显示的提供方名称。                                                                              |
| `icon`                | 在登录页面上显示在提供方名称前面的 [MDI 图标](https://pictogrammers.com/library/mdi/)。                     |
| `color`               | 在登录页面上显示的提供方名称。                                                                              |
| `client_id`           | 提供方的客户端 ID。                                                                                         |
| `client_id_file`      | 存放提供方客户端 ID 的文件路径。优先级低于 `client_id`。                                                   |
| `client_secret`       | 提供方的客户端密钥。                                                                                        |
| `client_secret_file`  | 存放提供方客户端密钥的文件路径。优先级低于 `client_secret`。                                               |
| `redirect_url`        |                                                                                                             |
| `provider_url`        |                                                                                                             |
| `scopes`              |                                                                                                             |
| `username_claim`      | 用户名声明表达式[\*](#claim-expression)。                                       |
| `email_claim`         | 邮箱声明表达式[\*](#claim-expression)。                                         |
| `name_claim`          | 个人资料名称声明表达式[\*](#claim-expression)。                                 |
| `order`               | 提供方按钮在登录页面上的位置。                                                                              |
| `allow_idp_initiated` | 为该提供方启用 [IdP 发起的登录](#idp-initiated-login)。默认为 `false`。                                    |
| `return_via_state`    | 通过 OAuth 的 `state` 参数（而不是重定向 URL）传递登录后的返回路径。默认为 `true`。                        |
| `endpoint.issuer`     |                                                                                                             |
| `endpoint.auth`       |                                                                                                             |
| `endpoint.token`      |                                                                                                             |
| `endpoint.userinfo`   |                                                                                                             |
| `endpoint.jwks`       |                                                                                                             |
| `endpoint.algorithms` |                                                                                                             |

### \*声明表达式 {#claim-expression}

声明表达式示例：

```
email | {{ .username }}@your-domain.com
```

Semaphore 会首先尝试读取 email 字段。如果该字段为空，则执行其后的表达式。

<div class="warning">
  表达式 <code>"username_claim": "|"</code> 会为每个通过该提供方登录的用户生成一个随机的 <code>username</code>。
</div>

## IdP 发起的登录 {#idp-initiated-login}

默认情况下，Semaphore 仅支持 **SP 发起**的登录：用户打开 Semaphore，点击提供方按钮，
然后被重定向到身份提供方（IdP）。

使用 **IdP 发起**的登录时，流程可以改为从身份提供方开始——例如点击 Okta 控制面板、Azure *My Apps*
或 Keycloak / Authentik 应用启动器中的 Semaphore 图块。

Semaphore 通过标准的 **Third-Party Initiated Login** 机制
（[OpenID Connect Core 1.0 §4](https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin)）实现这一功能。IdP
将浏览器重定向到专用的 **Initiate Login URI**，随后 Semaphore 启动一次正常的授权码流程。
实际的认证仍然是完整且安全的授权码交换——Semaphore 绝不会接受未经请求的令牌。

### 启用方法 {#enabling-it}

将该提供方的 `allow_idp_initiated` 设置为 `true`：

```json
{
  "oidc_providers": {
    "mysso": {
      "display_name": "Sign in with MySSO",
      "provider_url": "https://mysso-provider.com",
      "client_id": "***",
      "client_secret": "***",
      "redirect_url": "https://your-domain.com/api/auth/oidc/mysso/redirect",
      "allow_idp_initiated": true
    }
  }
}
```

### 配置身份提供方 {#configuring-the-identity-provider}

在 IdP 中，将应用的 **Initiate Login URI** 设置为：

```
https://your-domain.com/api/auth/oidc/<provider-id>/initiate
```

其中 `<provider-id>` 是 `oidc_providers` 下的键（例如 `mysso`）。

IdP 必须向该端点发送 `iss`（issuer）参数；如果 `iss` 与配置的提供方不匹配，Semaphore 会拒绝该请求。
可选的 `login_hint` 参数会被转发给 IdP；可选的 `target_link_uri` 用于设置登录后要打开的页面
（它必须指回 Semaphore，否则会被忽略）。

各提供方的说明：

- **Okta**——将 *Login initiated by* 设置为 *Either Okta or App*（或 *App Only*），并填写 *Initiate login URI*。Okta
  会同时发送 `iss` 和 `target_link_uri`。
- **Keycloak / Authentik / Ping / OneLogin**——将应用的启动 / 主页 URL 设置为 Initiate Login URI。
- **Azure AD / Entra**——*My Apps* 使用 SP 发起的起始 URL，并且不一定会发送 `iss`；请将起始 URL 改为指向
  `https://your-domain.com/api/auth/oidc/<provider-id>/login`。

### 安全性 {#security}

- IdP 发起的登录**默认关闭**，必须按提供方逐个启用。
- `iss` 参数会与配置的 issuer 进行校验，以防止提供方混淆。
- 只有当 `target_link_uri` 指回 Semaphore 时才会被接受（不存在开放重定向）。
- 整个流程会经过完整的授权码交换，并带有 CSRF `state` 和 `nonce`，因此被截获或重放的
  令牌无法用于登录。

## 登录页面 {#sign-in-screen}

对于每个已配置的提供方，登录页面上都会增加一个额外的登录按钮：

![Semaphore 登录页面截图，包含两个登录按钮。一个是"Sign In"，另一个是"Sign in with MySSO"](https://user-images.githubusercontent.com/5564491/232345599-13f744a0-0530-4422-8b55-6a563a4ef5d9.png)
