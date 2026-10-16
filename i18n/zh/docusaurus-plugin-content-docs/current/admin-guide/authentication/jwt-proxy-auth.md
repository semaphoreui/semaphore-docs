---
title: JWT 代理身份认证
description: 通过 Pomerium 等认证反向代理添加的已签名 JWT 让用户登录，包括全部 auth.jwt 选项和退出登录的配置。
---

# JWT 代理身份认证

当 Semaphore 运行在认证反向代理（例如 Pomerium、Cloudflare Access 或 OAuth2 Proxy）之后时，代理可以通过一个已签名的 JWT 请求头传递用户身份。Semaphore 会依据 JWKS 端点校验该 JWT，并自动创建或查找用户。

这样就无需在代理和 Semaphore 之间重复配置 OIDC。

## 工作原理 {#how-it-works}

1. 反向代理对用户进行身份认证，并在配置好的 HTTP 请求头中添加一个已签名的 JWT。
2. Semaphore 在每个请求中检查该请求头。如果存在，则依据 JWKS 端点校验令牌。
3. 如果令牌有效，查找用户的方式与 LDAP 和 OIDC 相同：先按为令牌中 `sub` 声明存储的外部身份查找，再按 `external_auth_email_matching` 允许的方式按邮箱查找，否则创建一个新的外部用户。参见[用户记录是如何产生的](/admin-guide/authentication#how-a-user-record-comes-to-exist)。
4. 如果请求头存在但令牌无效，Semaphore 会立即返回 `401 Unauthorized` —— 不会再尝试已有的 bearer 令牌和会话认证。
5. 如果请求头不存在，则照常进行普通认证（bearer 令牌、会话 Cookie）。

通过 JWT 认证创建的用户会被标记为**外部**用户，其身份以提供方 ID `jwt` 和令牌中的 `sub` 声明存储。没有 `sub` 声明的令牌会被拒绝。本地（非外部）用户绝不会按邮箱匹配。

Semaphore 信任代理放入令牌中的邮箱地址。在 `external_auth_email_matching` 为默认值 `auto` 时，由早期版本（仅按邮箱匹配 JWT 用户）创建的用户会在下一次请求时与其 `sub` 关联。设为 `never` 时，这些用户不会被匹配，并且他们的请求会失败，因为新账户会重复使用他们的邮箱地址。请先让他们在 `auto` 下登录一次，再切换到 `never`。

## 安全注意事项 {#security-considerations}

只要请求在配置的请求头中携带有效令牌，Semaphore 就会让其登录。签名可以阻止
客户端伪造令牌，但无法阻止它重放已有的令牌，因此代理必须是唯一的访问入口：

- 确保不经过代理就无法访问 Semaphore。将其绑定到私有地址，或用防火墙保护其端口；
  参见[网络安全](/admin-guide/security/network)。
- 配置代理，从客户端传入的请求中删除 JWT 请求头，并且只在完成用户认证后才设置它。
- 将 `audience` 设置为代理为 Semaphore 使用的值。否则，代理为其他应用签发、
  并由相同密钥签名的令牌也会被接受。

## 配置 {#configuration}

启用 JWT 认证时，`header` 和 `jwks_url` 都是必填项。Semaphore 会在启动时进行校验。

### 配置文件 {#config-file}

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "header": "X-Pomerium-Jwt-Assertion",
      "jwks_url": "https://auth.example.com/.well-known/pomerium/jwks.json",
      "audience": "https://semaphore.example.com",
      "issuer": "https://auth.example.com"
    }
  }
}
```

### 环境变量 {#environment-variables}

```bash
SEMAPHORE_JWT_AUTH_ENABLED=true
SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion
SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json
SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com
SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com
```

### Docker 示例 {#docker-example}

```bash
docker run -d -p 3000:3000 --name semaphore \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -e SEMAPHORE_JWT_AUTH_ENABLED=true \
  -e SEMAPHORE_JWT_AUTH_HEADER=X-Pomerium-Jwt-Assertion \
  -e SEMAPHORE_JWT_AUTH_JWKS_URL=https://auth.example.com/.well-known/pomerium/jwks.json \
  -e SEMAPHORE_JWT_AUTH_AUDIENCE=https://semaphore.example.com \
  -e SEMAPHORE_JWT_AUTH_ISSUER=https://auth.example.com \
  semaphoreui/semaphore:latest
```

## 选项 {#options}

| 参数 | 环境变量 | 说明 |
| --- | --- | --- |
| `auth.jwt.enabled` | `SEMAPHORE_JWT_AUTH_ENABLED` | 启用 JWT 代理身份认证。 |
| `auth.jwt.header` | `SEMAPHORE_JWT_AUTH_HEADER` | 包含 JWT 的 HTTP 请求头。**必填。** |
| `auth.jwt.jwks_url` | `SEMAPHORE_JWT_AUTH_JWKS_URL` | 用于验证签名的 JWKS 端点 URL。**必填。** |
| `auth.jwt.audience` | `SEMAPHORE_JWT_AUTH_AUDIENCE` | 期望的 `aud` 声明。留空则不校验受众。 |
| `auth.jwt.issuer` | `SEMAPHORE_JWT_AUTH_ISSUER` | 期望的 `iss` 声明。留空则不校验签发者。 |
| `auth.jwt.email_claim` | `SEMAPHORE_JWT_AUTH_EMAIL_CLAIM` | 用于用户邮箱的 JWT 声明。默认值：`email`。 |
| `auth.jwt.name_claim` | `SEMAPHORE_JWT_AUTH_NAME_CLAIM` | 用于用户显示名称的 JWT 声明。默认值：`name`。 |
| `auth.jwt.username_claim` | `SEMAPHORE_JWT_AUTH_USERNAME_CLAIM` | 用于用户名的 JWT 声明。默认值：`email`。 |
| `auth.jwt.signout_url` | `SEMAPHORE_JWT_AUTH_SIGNOUT_URL` | 清除 Semaphore 会话后，退出登录链接跳转到的 URL。参见[退出登录](#logout)。 |

## 支持的算法 {#supported-algorithms}

Semaphore 接受使用 **ES256**、**ES384**、**ES512**、**RS256**、**RS384** 或 **RS512** 签名的令牌。每个令牌都必须带有 `exp` 声明；没有该声明的令牌会被拒绝。

## 退出登录 {#logout}

在 Semaphore 中点击退出登录会清除 Semaphore 的会话 Cookie，但反向代理的会话不受影响 —— 因此下一个请求会立即再次认证同一个用户。

要让用户完全退出登录，请将 `signout_url` 设置为代理的退出登录端点。清除 Semaphore 会话后，浏览器会被重定向到该地址。

```json
{
  "auth": {
    "jwt": {
      "enabled": true,
      "signout_url": "https://auth.example.com/.pomerium/sign_out"
    }
  }
}
```

常见代理的示例：

- **Pomerium**：`https://<your-domain>/.pomerium/sign_out`
- **OAuth2 Proxy**：`https://<your-domain>/oauth2/sign_out`
- **Cloudflare Access**：`https://<your-team>.cloudflareaccess.com/cdn-cgi/access/logout`

## JWKS 可用性 {#jwks-availability}

Semaphore 在启动时获取 JWKS。如果 JWKS 端点无法访问，服务器仍会启动。密钥集每小时在后台刷新一次；当令牌使用 Semaphore 从未见过的密钥 ID 签名时也会刷新，但最多每五分钟一次。在密钥可用之前，JWT 认证会返回错误。
