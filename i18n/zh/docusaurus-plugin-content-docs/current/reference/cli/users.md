# 用户

`semaphore users` 命令用于添加、修改、删除和查看用户，并管理用户的
API 令牌和 TOTP（双因素认证）验证。

```bash
semaphore users --help
```

> `user` 是 `users` 的别名。

| 命令 | 用途 |
|---------|---------|
| [`users add`](#add-a-user) | 创建用户。 |
| [`users change-by-login`](#change-a-user) | 更新按登录名查找到的用户。 |
| [`users change-by-email`](#change-a-user) | 更新按邮箱查找到的用户。 |
| [`users get`](#show-a-user) | 打印单个用户的详细信息。 |
| [`users list`](#list-users) | 打印所有用户的登录名。 |
| [`users delete`](#delete-a-user) | 删除用户。 |
| [`users token create`](#create-a-token) | 为用户创建 API 令牌。 |
| [`users token list`](#list-tokens) | 列出用户的 API 令牌。 |
| [`users totp enable`](#totp-management) | 为用户启用 TOTP。 |
| [`users totp show`](#totp-management) | 显示用户的 TOTP 详细信息。 |
| [`users totp disable`](#totp-management) | 为用户禁用 TOTP。 |

## 添加用户 {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| 选项 | 说明 |
|------|-------------|
| `--login` | 用户登录名。**必填。** |
| `--name` | 用户的显示名称。**必填。** |
| `--email` | 用户的邮箱。**必填。** |
| `--password` | 用户的密码。普通用户必填；外部用户不允许指定。 |
| `--admin` | 将新用户标记为管理员。 |
| `--external` | 将新用户标记为外部用户（LDAP 或 OIDC）。外部用户不能指定 `--password`。 |

成功后，命令会打印 `User <login> <email> added!`。

## 修改用户 {#change-a-user}

可以按登录名或按邮箱查找要修改的用户。

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| 选项 | 说明 |
|------|-------------|
| `--login` | 对于 `change-by-login`，是要查找的用户的登录名（**必填**）。对于 `change-by-email`，是用户的新登录名。 |
| `--email` | 对于 `change-by-email`，是要查找的用户的邮箱（**必填**）。对于 `change-by-login`，是用户的新邮箱。 |
| `--name` | 用户的新名称。 |
| `--password` | 用户的新密码。 |
| `--admin` | 授予管理员权限。 |

只有你提供的选项才会被应用；省略的字段保持不变。
`--admin` 只能授予管理员权限，不能撤销；如需撤销，请使用
Web 界面。

## 查看用户 {#show-a-user}

按登录名或邮箱查找并打印单个用户的详细信息。

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

`--login` 和 `--email` 至少需要指定一个。输出包括用户的 ID、创建时间、
登录名、名称、邮箱和管理员状态。如果没有匹配的用户，命令会打印一条
消息并以非零状态退出。

## 列出用户 {#list-users}

打印所有用户的登录名，每行一个。

```bash
semaphore user list
```

## 删除用户 {#delete-a-user}

按登录名或邮箱查找并删除用户。

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

`--login` 和 `--email` 至少需要指定一个。

## API 令牌管理 {#api-token-management}

通过 CLI 管理用户的 API 令牌：

```bash
semaphore user token --help
```

### 创建令牌 {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| 选项 | 说明 |
|------|-------------|
| `--login` | 令牌所有者的登录名。**必填。** |
| `--name` | 令牌名称。 |
| `--ttl` | 令牌的有效期，采用 Go 时长格式（例如 `1h`、`30m`、`24h`）。省略时令牌永不过期。 |

命令只在单独一行打印新令牌，不输出其他内容，因此可以安全地在
脚本中捕获：

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

如果 `--ttl` 的值无效或登录名不存在，命令会报告错误并以非零状态
退出。

### 列出令牌 {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` 为必填项。每行列出令牌名称、状态（`active` 或
`expired`）以及 RFC 3339 格式的过期时间（无过期时间则为 `never`），
各字段以制表符分隔。令牌值永远不会被打印。

## TOTP 管理 {#totp-management}

通过 CLI 管理基于时间的一次性密码（双因素认证）验证：

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

所有 TOTP 子命令都需要 `--login`。

- `enable` 会打印一个一次性恢复码、`otpauth://` URL 以及一个可扫描的
  二维码。请将恢复码保存在安全的地方。如果该用户已启用 TOTP，命令
  会失败。
- `show` 会再次打印 `otpauth://` URL 和二维码；如果用户未设置 TOTP，
  则打印 `TOTP disabled`。
- `disable` 会移除用户的 TOTP 验证。如果 TOTP 未启用，命令会失败。

身份验证器应用中显示的签发者取自 `mfa.totp.app_name`
配置选项（`SEMAPHORE_TOTP_ISSUER`），默认为 `Semaphore`。
