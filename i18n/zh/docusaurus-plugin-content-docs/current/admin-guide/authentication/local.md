---
title: 本地账户
description: 依据 Semaphore 数据库进行的密码登录 - 密码如何存储、TOTP 双因素认证、会话有效期，以及关闭密码登录。
---

# 本地账户

本地账户把密码保存在 Semaphore 数据库中。每个安装环境都以一个本地账户起步，它由
`semaphore setup` 或 `SEMAPHORE_ADMIN_*` 变量创建；在任何身份提供方存在之前，你都靠
这个账户访问服务器。

即使单点登录已经可用，也请至少保留一个本地管理员账户。当身份提供方无法访问时，它是你
重新进入系统的唯一途径。

## 密码如何存储 {#how-passwords-are-stored}

密码使用 **Argon2id** 并按 OWASP 最低强度参数进行哈希，这些参数以
[PHC 字符串格式](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md)
与每个哈希一起记录。2.20 之前的版本使用 bcrypt；这些哈希仍然可用，并会在其所有者下次成功
登录时逐个替换为 Argon2id 哈希。不再登录的账户会一直保留 bcrypt 哈希，因此请重置这些账户
的密码以完成升级。

完整的参数表见[安全](/admin-guide/security#password-hashing)。

Semaphore 不强制任何密码策略 —— 没有最小长度、没有复杂度要求、没有有效期。如果你需要密码
策略，请使用目录服务或身份提供方，这类策略本就应该由它们负责。

## 管理账户 {#manage-accounts}

管理员在 Web 界面中管理用户，命令行中也提供了相同的操作，可用于编写脚本，以及在所有人都
无法登录时进行恢复：

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

所有参数请参见 [`semaphore users`](/reference/cli/users)，用户登录后角色允许他做什么请参见
[团队](/user-guide/team)。

:::warning
在命令行中输入的密码会留在你的 shell 历史记录和该机器的进程列表中。请仅在创建第一个管理员
账户和进行恢复时使用这种方式，之后通过 Web 界面修改密码。
:::

## 双因素认证 {#two-factor-authentication}

Semaphore 支持 TOTP：即 Google Authenticator、Aegis、1Password 等应用生成的六位验证码。
该功能默认关闭，并且只对启用了它的账户生效 —— 不会强制所有人使用。

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| 选项 | 作用 |
|---|---|
| `mfa.totp.enabled` | 允许用户为自己的账户添加 TOTP。不启用它，任何人都无法绑定。 |
| `mfa.totp.allow_recovery` | 在绑定时签发一个恢复码，这样手机丢失不等于账户丢失。输入恢复码会**解除 TOTP 绑定**并让用户登录；之后用户可以重新绑定。该恢复码以 bcrypt 哈希形式存储。 |
| `mfa.totp.app_name` | 认证器应用显示的签发者标签。当你运行多个 Semaphore 时请设置它。 |

用户在自己的账户页面完成绑定。管理员可以为丢失设备的用户查看或移除第二因素：

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

再次关闭 `mfa.totp.enabled` 不会删除任何人的绑定；它只是不再要求输入第二因素。重新开启后，
原有的绑定会再次生效。

## 会话有效期 {#session-lifetime}

会话在**七天无活动**后过期。该闲置超时是内置的，不可配置。

绝对有效期则可以配置，并且从登录时刻开始计算，而不是从最后一次请求开始计算，因此正在活跃
使用的会话同样会结束：

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

默认值 `0` 表示没有绝对有效期限制。当共享工作站或合规要求人员按固定周期重新认证时，请设置
该选项。

## 关闭密码登录 {#turn-password-sign-in-off}

在身份提供方配置完成，并且你已验证真实用户能够通过它登录之后，`password_login_disable`
会彻底拒绝密码登录方式：

```json
{
  "password_login_disable": true
}
```

LDAP 和 OpenID Connect 不受影响。现有本地账户保留其角色和历史记录，只是再也无法完成认证。

:::danger
该选项立即生效，并作用于每一个本地账户，包括你自己的账户。设置它之前，请先确认单点登录
确实可用 —— 用它实际登录一次，而不是只查看日志。一旦出错，恢复的办法是在服务器上编辑配置
文件并重启。
:::

## 后续内容 {#whats-next}

- [LDAP 与 Active Directory](/admin-guide/authentication/ldap) —— 依据目录服务进行认证。
- [OpenID Connect](/admin-guide/authentication/openid) —— 使用身份提供方实现单点登录。
- [安全](/admin-guide/security) —— 哈希参数、加密和安全加固。
