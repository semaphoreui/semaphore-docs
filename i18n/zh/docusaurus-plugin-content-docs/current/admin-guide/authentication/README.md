---
title: 身份认证
description: 用户登录 Semaphore 的三种方式 - 本地账户、LDAP 和 OpenID Connect - 它们如何组合，以及身份如何关联。
---

# 身份认证

Semaphore 提供三种确认用户身份的方式。它们相互独立，可以同时全部启用，因此登录界面上
可能同时出现密码表单、目录登录，以及每个身份提供方各一个按钮。

| 方式 | 由谁校验密码 | 适用场景 |
|---|---|---|
| [本地账户](/admin-guide/authentication/local) | Semaphore，依据自身数据库校验 | 你没有目录服务，或者需要一个应急管理员账户。 |
| [LDAP 与 Active Directory](/admin-guide/authentication/ldap) | 你的目录服务器 | 用户已存在于 LDAP 或 AD 中，并且你希望只维护一套凭据。 |
| [OpenID Connect](/admin-guide/authentication/openid) | 你的身份提供方 | 你使用单点登录：Keycloak、Okta、Entra ID、Google、GitHub 等。 |

身份认证只回答用户*是谁*。用户被允许做什么则由服务器角色和他在每个项目中的角色单独决定 ——
参见[团队](/user-guide/team)。

## 用户记录是如何产生的 {#how-a-user-record-comes-to-exist}

无论使用哪种方式，每位登录的用户在 Semaphore 数据库中都有一行记录。本地账户由管理员创建，
或通过 `semaphore user add` 创建。LDAP 或 OIDC 账户在首次成功登录时创建，同时 Semaphore 会
在其旁边保存一个**外部身份**：提供方 ID 加上该提供方返回的用户 ID。

后续登录正是依据这个外部身份进行匹配的，这意味着在目录中重命名某个人不会产生第二个账户。
真正需要留意的是尚无外部身份的既有用户的*首次*登录。此时的行为由
`external_auth_email_matching` 选项决定：

| 取值 | 行为 |
|---|---|
| `auto`（默认值） | 按邮箱关联，但仅限尚无身份的外部用户。这会一次性接管 2.20 之前创建的账户，除此之外不做任何事。 |
| `always` | 对任何外部用户都按邮箱关联。当同一个人通过多个提供方登录时使用。 |
| `never` | 绝不按邮箱关联；身份严格按提供方 ID 匹配。 |

在任何模式下，本地密码账户都不会按邮箱匹配。否则，允许用户自行选择邮箱地址的 OIDC 提供方
就可能被用来接管管理员账户。

:::warning
提供方 ID，即 `oidc_providers` 或 `ldap_providers` 中的键，是每条已存储身份的组成部分。
重命名它会让引用它的身份变成孤立记录，相关用户在下次登录时会得到全新的空账户。请一次性
确定好它。
:::

## 组合使用多种方式 {#combining-methods}

一个贴近实际的配置是：为用户启用单点登录，同时保留一个本地管理员账户，以备身份提供方
无法访问的那一天：

1. 配置提供方，并确认真实用户能够通过它登录。
2. 为该用户分配所需的角色。
3. 保留一个本地管理员账户，使用强密码并启用
   [TOTP](/admin-guide/authentication/local#two-factor-authentication)。
4. 设置 `password_login_disable`，阻止其他所有人使用密码登录。

请按此顺序操作。在第 1 步之前设置 `password_login_disable` 会完全按照其字面含义生效，
把你锁在自己的服务器之外。

## 本节内容 {#in-this-section}

| 页面 | 涵盖内容 |
|---|---|
| [本地账户](/admin-guide/authentication/local) | 密码、TOTP、邮件一次性验证码、会话有效期，以及关闭密码登录。 |
| [LDAP 与 Active Directory](/admin-guide/authentication/ldap) | 绑定到目录、搜索过滤器、属性映射和 TLS。 |
| [OpenID Connect](/admin-guide/authentication/openid) | 提供方配置、声明表达式、IdP 发起的登录，以及十二个完整的提供方示例。 |

## 从哪里开始 {#where-to-start}

全新安装在初始化设置时就已创建了本地管理员账户，因此请先阅读
[本地账户](/admin-guide/authentication/local)来保护它，然后再为其他所有人添加
[OpenID Connect](/admin-guide/authentication/openid) 或
[LDAP](/admin-guide/authentication/ldap)。
