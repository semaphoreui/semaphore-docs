---
title: 本地账户
description: 依据 Semaphore 数据库进行的密码登录 - 密码如何存储、账户管理、会话有效期，以及关闭密码登录。
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

本地账户可以在密码之后要求第二因素：认证器应用生成的六位 TOTP 验证码。该功能默认关闭，
通过 `mfa.totp.enabled` 为服务器开启，再由每位用户为自己的账户设置。它的工作原理、如何开启、
如何使用验证码登录，以及手机丢失后如何恢复，请参见[双因素认证](/admin-guide/authentication/two-factor)。

## 会话有效期 {#session-lifetime}

会话受两个相互独立的限制约束；先达到哪一个，就由哪一个让用户退出登录。

**闲置超时**从最后一次请求开始计算。每个经过认证的请求，包括浏览器中打开的标签页在后台
发起的轮询，都会重置它。默认值为 168 小时（七天）：

```json
{
  "auth": {
    "session_inactivity_hours": 8
  }
}
```

**绝对有效期**从登录时刻开始计算，而不是从最后一次请求开始计算，因此正在活跃使用的会话
同样会结束：

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

默认值 `0` 表示没有绝对有效期限制。当共享工作站或合规要求人员按固定周期重新认证时，请设置
该选项。停留在轮询 API 的页面上的浏览器会让会话一直保持活跃，因此只有绝对有效期才能可靠地
结束这类会话。

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
- [双因素认证](/admin-guide/authentication/two-factor) —— 在密码之后要求输入 TOTP 验证码。
- [安全](/admin-guide/security) —— 哈希参数、加密和安全加固。
