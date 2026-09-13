# Slack

Slack 通知可让您直接在 Slack 频道中实时接收 Semaphore 工作流（Workflow）的更新。此集成（Integration）帮助团队及时了解构建状态、部署结果和其他重要事件，而无需频繁查看 Semaphore 仪表盘。

要设置 Slack 通知，您需要创建一个 Webhook URL，将 Semaphore 连接到目标 Slack 频道。此 Webhook 充当两个平台之间安全的通信桥梁。

## 创建 Slack Webhook {#creating-slack-webhook}

### 第 1 步：打开 Slack API 设置 {#step-1-open-slack-api-settings}

1. 访问 [https://api.slack.com/apps](https://api.slack.com/apps)。
2. 点击 **Create New App** → 选择 **From Scratch**。
3. 为您的应用命名（例如 `Semaphore Bot`），并选择您的 **Slack 工作区**。

---

### 第 2 步：启用 Incoming Webhooks {#step-2-enable-incoming-webhooks}

1. 在应用设置中，进入 **Features → Incoming Webhooks**。
2. 将 **Activate Incoming Webhooks** 切换为 **On**。

---

### 第 3 步：创建 Webhook URL {#step-3-create-a-webhook-url}

1. 点击 **Add New Webhook to Workspace**。
2. 选择要接收消息的频道。
3. 点击 **Allow**。
4. 您将看到类似如下的 **Webhook URL**：

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### 第 4 步：测试您的 Webhook {#step-4-test-your-webhook}

使用 `curl` 进行测试：

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

如果一切设置正确，您将在所选的 Slack 频道中看到该消息。


## Semaphore 配置 {#semaphore-configuration}

获得 Slack Webhook URL 后，您可以通过多种方式配置 Semaphore 发送通知：

您可以使用配置文件或环境变量来启用 Slack 通知。

### 方法 1：配置文件 {#method-1-configuration-file}

将以下设置添加到您的 Semaphore 配置文件中：

- `slack_alert`：设置为 `true` 以启用 Slack 通知
- `slack_url`：上一步中获得的 Webhook URL

`config.json` 示例：

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### 方法 2：环境变量 {#method-2-environment-variables}

或者，您也可以使用环境变量来配置 Slack 通知。这种方法特别适用于容器化部署，或者当您希望将敏感信息与配置文件分开存放时。

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
