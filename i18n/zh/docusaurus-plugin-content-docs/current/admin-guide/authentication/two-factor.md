---
title: 双因素认证
description: Semaphore 中 TOTP 双因素认证的工作原理，以及如何为服务器开启它、为账户设置它、使用验证码登录和进行恢复。
---

# 双因素认证

双因素认证（2FA）在第一步登录之后再要求一项证明：用户手机上认证器应用生成的六位验证码。
这样一来，仅凭被盗的密码就无法登录。

Semaphore 使用 TOTP 实现第二因素 —— 基于时间的一次性密码，也是 Google Authenticator、
Microsoft Authenticator、Aegis、1Password、Bitwarden 等应用所遵循的标准。所有版本均可使用。

## 工作原理 {#how-it-works}

登录是否要求验证码由两个开关决定：

- **服务器**必须允许 TOTP —— 即 `mfa.totp.enabled` 选项。它默认关闭。
- **账户**必须已设置 TOTP。每位用户为自己的账户开启它；不会强制所有人使用。

两者都开启时，登录分两步进行：

1. 用户照常登录 —— 使用密码、通过 LDAP，或者通过 OpenID Connect 提供方。第二因素对这三种
   方式都适用。
2. Semaphore 创建会话，但将其标记为未验证，并要求输入验证码。在验证码被接受之前，该会话上的
   每个 API 调用都会被拒绝，返回 `401` 和 `{"error":"TOTP_REQUIRED"}`。
3. 用户输入应用显示的验证码。Semaphore 将其与为该账户存储的密钥进行比对；验证码正确，会话
   即通过验证，用户完成登录。

验证码每 30 秒变化一次，应用根据设置账户时一次性收到的密钥计算出验证码。Semaphore 与手机
之间从不通信，因此手机无需联网 —— 只需要时钟大致准确。

## 为服务器开启 {#turn-it-on-for-the-server}

在配置文件中添加 `mfa.totp` 部分并重启 Semaphore：

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

同样的设置也可以通过环境变量提供：

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| 选项 | 环境变量 | 作用 |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | 允许用户设置 TOTP，并让登录要求输入验证码。不启用它，任何人都看不到该设置。 |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | 在用户设置 TOTP 时为其提供一个一次性的[恢复码](#recovery-code)，并允许在手机丢失时用它登录。 |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | 认证器应用在账户旁边显示的签发者名称。默认为 `Semaphore`。请参见下方的警告。 |

:::warning ⚠️ Web 界面不使用 `app_name`（2026-11-27）
通过 Web 界面设置的账户在认证器应用中始终标记为 `Semaphore:<email>`，无论
`mfa.totp.app_name` 如何设置。只有
[`semaphore users totp enable`](#manage-the-second-factor-from-the-command-line) 会使用
配置的名称。如果你运行多个 Semaphore，用户可以通过电子邮件地址区分这些条目，或者在应用中
重命名条目。
:::

所有选项也都列在[配置参考](/reference/configuration)中。

## 为你的账户设置 TOTP {#set-up-totp-for-your-account}

请先在手机上安装认证器应用。然后：

1. 打开一个项目，点击侧边栏底部你的名字，然后选择 **Edit Account**。
2. 打开 **Security** 标签页。
3. 在 **Two-factor authentication** 下，开启 **Time-based one-time password**。
   Semaphore 会立即生成密钥并以二维码形式显示。
4. 在认证器应用中添加账户并扫描二维码。应用开始为 `Semaphore` 显示六位验证码。
5. 如果二维码下方显示了 **Recovery code**，请用旁边的按钮复制它，并保存在安全的地方 ——
   密码管理器或纸上。它只在此时显示。
6. 关闭对话框。

<div style={{maxWidth: 450}}>

![Edit User 对话框的 Security 标签页，已开启双因素认证：上方是待扫描的二维码，下方是恢复码](/assets/two-factor-enrol.webp)

</div>

开关立即生效；无需点击 **Save**，也无需输入测试验证码。退出登录之前，请确认应用已显示
Semaphore 的验证码 —— 下次登录时会要求输入它。

之后你可以再次打开 **Security** 标签页，在第二台设备上扫描二维码。恢复码不会再次显示。

## 使用验证码登录 {#sign-in-with-a-code}

完成密码、LDAP 或单点登录步骤后，Semaphore 会显示 **Two-step verification**：

![Two-step verification 界面，要求输入认证器应用中的六位验证码](/assets/two-factor-verify.webp)

输入应用当前显示的六位数字。输入第六位后表单会自动提交。错误或过期的验证码会显示错误信息，
并停留在同一界面；请等待下一个验证码后重试。

**Return to login** 会放弃本次登录并重新开始。

## 使用恢复码 {#recovery-code}

当手机丢失或被重置时，用户可以凭恢复码自行重新登录：

1. 照常使用密码登录。
2. 在 **Two-step verification** 界面，点击 **Use recovery code**。
3. 输入恢复码并点击 **Send**。

Semaphore 会让你登录，并**从你的账户中移除 TOTP**。恢复码也随之失效。请立即按照
[上文](#set-up-totp-for-your-account)的说明重新设置 TOTP，以获得新的密钥和新的恢复码。

只有当服务器开启了 `mfa.totp.allow_recovery` 时，才会出现 **Use recovery code**。恢复码
长 16 个字符，仅以 bcrypt 哈希形式存储，因此之后任何人 —— 包括管理员 —— 都无法读出用户的
恢复码。

## 移除第二因素 {#remove-the-second-factor}

**你自己的账户。** 在 **Edit Account** 的 **Security** 标签页中关闭
**Time-based one-time password**。TOTP 会立即被移除，下次登录只要求第一步。同时请从认证器
应用中删除 Semaphore 条目；它已不再对应任何内容。

**其他人的账户。** 丢失手机且没有恢复码的用户无法自行移除 TOTP。管理员，或全局角色允许
管理用户的用户，可以打开 **Users**，编辑该用户，并在 **Security** 标签页中关闭开关。该用户
随后只用密码登录，并重新设置 TOTP。

### 通过命令行管理第二因素 {#manage-the-second-factor-from-the-command-line}

在服务器上，无需 Web 界面也能完成同样的操作 —— 当唯一的管理员丢失手机时尤其有用：

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane` 为用户设置 TOTP，并在终端中打印
`otpauth://` URL、二维码和恢复码；`show` 打印现有设置的 URL 和二维码。这两个命令都会打印
密钥本身，因此只能在没有其他人能看到终端的地方运行，并把二维码直接交给其所有者。完整语法
请参见 [`semaphore users`](/reference/cli/users#totp-management)。

## 为服务器关闭 {#turn-it-off-for-the-server}

将 `mfa.totp.enabled` 设为 `false`，或删除该部分，然后重启。此后登录不再要求验证码，
**Two-factor authentication** 设置也会从 **Security** 中消失。

任何人的设置都不会被删除。重新开启该选项后，每个曾设置 TOTP 的账户都会再次要求输入验证码，
且使用相同的密钥 —— 无需重新扫描。

## 注意事项 {#things-to-know}

- **API 令牌会跳过第二因素。** 带有 `Authorization: Bearer` 令牌的请求从不要求验证码。
  令牌只能在完全登录的会话中创建，但在设置 TOTP 之前已存在的令牌仍然有效。开启 TOTP 后，
  请在 **API Tokens** 页面检查这些令牌。
- **Semaphore 不限制验证码的尝试次数。** 六位数字的取值空间很小，因此请在你的
  [反向代理](/admin-guide/reverse-proxy)中对 `POST /api/auth/verify` 和
  `POST /api/auth/recovery` 进行限流。
- **密钥按原样存储在数据库中。** 任何能读取 `user__totp` 表或数据库备份的人，都能为每个
  账户生成有效的验证码。请像保护配置文件一样保护备份。
- **无法强制要求 TOTP。** Semaphore 没有强制用户设置 TOTP 的选项。如果你的策略要求所有人
  都使用第二因素，请在身份提供方中实施该策略，并让用户通过
  [OpenID Connect](/admin-guide/authentication/openid) 登录。

第二因素的设置、移除和使用会以 `iam.mfa` 和 `auth.mfa` 事件记录在
[审计日志](/admin-guide/audit-log)中；事件列表参见[审计事件](/reference/audit-events)。

## 后续内容 {#whats-next}

- [本地账户](/admin-guide/authentication/local) —— 密码、会话有效期，以及关闭密码登录。
- [安全](/admin-guide/security) —— 哈希参数、加密和安全加固。
- [`semaphore users`](/reference/cli/users#totp-management) —— TOTP 相关命令。
