---
title: "许可证激活"
---

# 许可证激活 <Pro />

Semaphore Pro 和 Enterprise 功能通过许可证密钥启用。您可以在 Web UI 中激活许可证，也可以在服务器配置中提供密钥以用于自动化部署。

## 开始之前 {#before-you-start}

- 激活 Pro 或 Enterprise 无需重新安装 Semaphore UI，也无需切换到其他构建版本。您当前的 Semaphore UI 版本即可通过许可证密钥激活。如果您想使用最新的 Pro 或 Enterprise 功能，请更新到最新版本。
- 使用管理员账户登录。
- 准备好您的许可证密钥。您可以在购买邮件或 [Semaphore UI 门户](https://portal.semaphoreui.com/auth/login)中找到它。

## 在 Web UI 中激活 {#activate-from-the-web-ui}

1. 以管理员身份登录 Semaphore UI。

![Semaphore UI 登录界面](/assets/subscription-login-screen.png)

2. 在左下角的用户区域打开管理员菜单。

![左下角的管理员菜单入口](/assets/subscription-admin-menu-trigger.png)

3. 选择 **升级到 PRO 或 EE**（Upgrade to PRO or EE）。

![包含“升级到 PRO 或 EE”项的管理员菜单](/assets/subscription-upgrade-menu-item.png)

4. 将您的许可证密钥粘贴到激活对话框中，然后点击 **激活新密钥**（ACTIVATE NEW KEY）。

![Semaphore Pro 激活对话框](/assets/subscription-activation-dialog.png)

激活成功后，Semaphore UI 会在 **订阅与账单**（Subscription & Billing）对话框中显示您当前的许可证详情。

![激活成功后的“订阅与账单”对话框](/assets/subscription-activation-success.png)

## 通过配置激活 {#activate-from-configuration}

对于 Docker、Kubernetes、systemd 或其他自动化部署，请在服务器配置中提供许可证密钥，而不是在 UI 中输入。相关配置选项的名称使用 `subscription.*`。

在 `config.json` 中：

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

或者使用环境变量：

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

您也可以将密钥存储在文件中：

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

或者：

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

当许可证密钥由配置管理时，Semaphore UI 会禁用 **订阅与账单** 对话框中的编辑和激活控件。这同时适用于 `subscription.key` 和 `subscription.key_file`，因为服务器在启动时会将密钥文件读入运行时许可证密钥。

## 许可证校验的工作方式 {#how-license-validation-works}

Semaphore UI 会向 Semaphore UI 门户校验许可证。地址由 `subscription.server_url` 指定，默认为 `https://portal.semaphoreui.com/billing`。

### Semaphore UI 会连接到哪里 {#what-semaphore-ui-connects-to}

| 时机 | 请求 |
| --- | --- |
| 激活密钥 | `POST {server_url}/subscriptions/{key}/activate` |
| 校验并刷新许可证 | `POST {server_url}/subscriptions/{key}/validate` |

两者都是普通的 JSON 请求，单个请求在 20 秒后放弃。激活请求发送许可证密钥，校验请求发送服务器当时持有的许可证令牌。除此之外没有任何内容离开本地安装：用户账户、项目名称、清单、主机名以及任务输出都不包含在这些请求中。

两者的响应都是一个 **许可证令牌**，即门户使用 RSA 密钥签名的 JWT。Semaphore UI 使用内置于服务器二进制文件中的对应公钥校验签名，因此令牌无法伪造或篡改。其 claim 中记录了许可证允许的内容：套餐、订阅状态、公司名称、到期日期，以及 Pro 用户数、节点数和 UI 数。服务器将密钥和令牌保存在数据库的 `subscription_key` 与 `subscription_token` 选项中。

### 校验在何时执行 {#when-the-check-runs}

| 触发条件 | 发生的操作 |
| --- | --- |
| 服务器启动 | 许可证令牌刷新一次。 |
| 每天 01:00（服务器时间） | 许可证令牌被刷新。 |
| 在 Web 界面或通过 `subscription.key` 激活密钥 | 密钥被激活，并返回第一个令牌。 |
| 在 **订阅与账单** 对话框中执行 **重新加载** | 按需刷新许可证令牌。 |

在这些调用之间，Semaphore UI 不会联系门户。所有许可证检查——Pro 功能是否启用，以及许可证是否还能容纳一个 Pro 用户、一个 runner 或一个 Terraform/OpenTofu HTTP 后端状态——都在本地读取已保存的令牌。

### 无法访问门户时 {#when-the-portal-cannot-be-reached}

刷新失败会以 `subscription` 上下文写入服务器日志，并且不会改动已保存的令牌，因此网络中断或门户不可用不会关闭 Pro 功能。在令牌自身的到期日期到来之前，安装会继续工作：过期的令牌仍可加载，但其状态变为 `expired`，Pro 功能随之停止。

### 在线密钥与离线密钥 {#online-and-offline-keys}

- **在线密钥** 是形如 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` 的 UUID。激活时会调用门户，每日刷新使其保持有效。不是 UUID 的值在发出任何请求之前就会被拒绝。
- **离线密钥** 本身就是一个许可证令牌，是为无法访问互联网的安装环境签发的一长串签名字符串。Semaphore UI 在本地校验它，从不为它调用门户，因此每日刷新不会发出任何请求。若要续订离线许可证，请将密钥替换为新签发的密钥。

### 高可用 {#high-availability}

每个服务器节点都在自己启动时以及按自己的每日计划刷新许可证，并把结果写入共享数据库，因此集群中的所有节点读取到相同的许可证令牌。无需额外配置。

## 通过代理访问许可证服务器 {#reach-the-license-server-through-a-proxy}

:::info 自 v2.20 起
代理自 **Semaphore 2.20** 起可用。
:::

激活密钥、刷新许可证令牌以及每日令牌刷新都会访问 `subscription.server_url` 上的 Semaphore UI 门户。如果服务器所在网络无法直接访问互联网，请让这些请求通过 HTTP 代理：

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

或使用环境变量：

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

说明：

- 支持 `http`、`https`、`socks5` 和 `socks5h` 协议。代理地址无效时，服务器会在启动时停止。
- `username` 和 `password` 为可选项，并会覆盖 `url` 中给出的凭据。单独配置可使密码不出现在 Semaphore UI 记录的代理地址中。
- 代理仅作用于发往许可证服务器的请求，不影响任务、Git 克隆和其他出站连接。
- 未设置 `subscription.proxy` 时，许可证服务器仍按原来的方式通过服务器进程的代理变量（`HTTP_PROXY`、`HTTPS_PROXY`、`NO_PROXY`）访问。
- 完全离网的部署需要离线许可证密钥而不是代理——此时服务器从不访问门户。

## 管理或替换许可证密钥 {#manage-or-replace-a-license-key}

若要续订、替换或查看您的许可证，请打开管理员菜单并选择 **订阅与账单**。

![包含“订阅与账单”项的管理员菜单](/assets/subscription-billing-menu-item.png)

对于在 Web UI 中管理的许可证密钥，可在 **订阅与账单** 对话框中打开操作菜单来重新加载、上传或重置密钥。

![带有密钥操作的“订阅与账单”对话框](/assets/subscription-key-actions-menu.png)

如果密钥是在服务器上配置的：

1. 替换 `subscription.key` 的值，或更新 `subscription.key_file` 所引用文件的内容。
2. 重启 Semaphore UI，使服务器重新加载许可证密钥。
3. 确认 Semaphore UI 中已提供预期的 Pro 或 Enterprise 选项。
