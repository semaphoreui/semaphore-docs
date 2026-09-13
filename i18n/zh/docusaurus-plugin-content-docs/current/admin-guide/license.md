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

## 管理或替换许可证密钥 {#manage-or-replace-a-license-key}

若要续订、替换或查看您的许可证，请打开管理员菜单并选择 **订阅与账单**。

![包含“订阅与账单”项的管理员菜单](/assets/subscription-billing-menu-item.png)

对于在 Web UI 中管理的许可证密钥，可在 **订阅与账单** 对话框中打开操作菜单来重新加载、上传或重置密钥。

![带有密钥操作的“订阅与账单”对话框](/assets/subscription-key-actions-menu.png)

如果密钥是在服务器上配置的：

1. 替换 `subscription.key` 的值，或更新 `subscription.key_file` 所引用文件的内容。
2. 重启 Semaphore UI，使服务器重新加载许可证密钥。
3. 确认 Semaphore UI 中已提供预期的 Pro 或 Enterprise 选项。
