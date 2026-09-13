# 您的账户

您的个人设置位于侧边栏底部的账户菜单中。点击您的名字即可打开。

![账户菜单](/assets/user-menu.webp)

| 项目 | 说明 |
|---|---|
| 版本 | 服务器上运行的 Semaphore UI 版本。 |
| **API 令牌（API Tokens）** | 用于 [REST API](/reference/api) 的个人令牌。 |
| **编辑账户（Edit Account）** | 您的姓名、用户名、邮箱、告警偏好和密码。 |
| **退出登录（Sign Out）** | 结束会话。 |

菜单旁边是**深色模式**开关和**语言**切换器。这两项设置都保存在您的浏览器中。

## 编辑账户 {#edit-account}

![编辑账户对话框](/assets/account-edit.webp)

**设置**（Settings）标签页包含：

| 字段 | 说明 |
|---|---|
| **姓名（Name）** | 在任务历史和活动中显示的名称。 |
| **用户名（Username）** | 登录名。 |
| **邮箱（Email）** | 用于邮件告警和密码找回的地址。 |
| **发送告警（Send alerts）** | 接收有关任务的邮件告警。仅当已配置[邮件通道](/admin-guide/notifications/email)且项目允许告警时才会发送。 |

复选框旁的徽章显示您的全局标记：在 Pro 实例上显示 **Pro 用户**（Pro user），管理员显示**管理员**（Admin），由 LDAP 或 OpenID Connect 管理的账户显示**外部**（External）。外部用户无法在此处修改用户名或密码。

**安全**（Security）标签页可用于修改密码。如果管理员启用了基于时间的一次性密码（TOTP），第二因素也在同一标签页中配置。

![安全标签页](/assets/account-security.webp)

## API 令牌 {#api-tokens}

在账户菜单中选择 **API 令牌**（API Tokens）。该页面列出您的令牌及其创建日期、过期日期和状态。**API 参考**（API Reference）链接会打开实例内置的 Swagger UI。

![API 令牌](/assets/api-tokens.webp)

点击**新建令牌**（New Token），为令牌命名并选择过期时间。令牌值仅在创建后显示一次，请立即复制。

![新建令牌对话框](/assets/api-token-new.webp)

在 `Authorization: Bearer` 请求头中使用该令牌，参见 [API](/reference/api)。要撤销令牌，请从列表中删除它。
