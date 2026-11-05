# Microsoft Teams

Microsoft Teams 通知会将 Semaphore 的任务结果直接发送到 Teams 频道。每条消息都是一张卡片，包含模板名称、任务状态、启动任务的用户，以及一个在 Semaphore 中打开该任务的按钮。

要设置 Teams 通知，您需要一个将 Semaphore 连接到频道的 Webhook URL。在 Teams 中，此 URL 通过 **Workflows** 应用创建。该应用基于 Microsoft Power Automate，与 Semaphore 中的工作流（Workflow）无关。

:::warning
Microsoft 已于 2026 年 5 月停用 Teams 中的 Office 365 连接器，包括旧的 **Incoming Webhook** 连接器。位于 `webhook.office.com` 上的 Webhook URL 已无法再投递消息。请按照下文所述，使用 Workflows 应用创建新的 URL。
:::

## 创建 Teams Webhook {#creating-teams-webhook}

### 第 1 步：打开频道的 Workflows {#step-1-open-workflows-for-the-channel}

1. 在 Microsoft Teams 中，进入要接收通知的团队和频道。
2. 点击频道名称旁边的 **More options (…)** 。
3. 选择 **Workflows**。

---

### 第 2 步：从模板创建工作流 {#step-2-create-a-workflow-from-the-template}

1. 搜索模板 **Send webhook alerts to a channel** 并选中它。
2. 检查工作流参数：消息要发布到的 **Team** 和 **Channel**。
3. 点击 **Save**。

Semaphore 发送请求时不带身份验证标头，因此请使用此模板，而不要使用它的 *from specific people* 或 *from people in an org* 变体。

---

### 第 3 步：复制 Webhook URL {#step-3-copy-the-webhook-url}

1. 工作流创建完成后，Teams 会显示其 Webhook 链接。复制该链接。
2. 该 URL 很长，形如：

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

`sig` 参数是该 Webhook 唯一的保护措施：任何拥有此 URL 的人都可以向频道发布消息。请将整个 URL 视为机密信息。

---

### 第 4 步：测试您的 Webhook {#step-4-test-your-webhook}

使用 `curl` 进行测试：

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

该请求体与 Semaphore 发送的消息结构相同：一条附带一张 Adaptive Card 的消息。如果一切设置正确，响应为 `202 Accepted`，几秒钟内卡片就会出现在所选的 Teams 频道中。


## Semaphore 配置 {#semaphore-configuration}

获得 Teams Webhook URL 后，您可以使用配置文件或环境变量来启用 Teams 通知。重启 Semaphore 以使更改生效。

### 方法 1：配置文件 {#method-1-configuration-file}

将以下设置添加到您的 Semaphore 配置文件中：

- `microsoft_teams_alert`：设置为 `true` 以启用 Teams 通知
- `microsoft_teams_url`：上一步中获得的 Webhook URL

`config.json` 示例：

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### 方法 2：环境变量 {#method-2-environment-variables}

或者，您也可以使用环境变量。这种方法特别适用于容器化部署，或者当您不希望将 Webhook URL 写入配置文件时。

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
URL 中包含 `&` 和 `%` 字符。在 Shell 中设置该变量时，请用单引号将其括起来。在 systemd 单元中，由于 `%` 表示说明符的开头，请将其放入 `EnvironmentFile`，而不是写在 `Environment=` 行中。
:::

## 为项目启用通知 {#enabling-notifications-for-a-project}

上述设置会为整个服务器启用该渠道，所有消息都会发送到 Webhook 所属的那一个频道。只有当项目使用服务器渠道时才会收到这些消息，并且任务模板可以屏蔽成功或失败消息。请参阅[投递如何工作](/admin-guide/notifications#how-delivery-works)，其中还介绍了如何在不运行任务的情况下发送测试消息。

当任务成功、失败或等待确认时，都会通知 Teams。

要将某个项目的通知发送到其他 Teams 频道，请创建一个类型为 Microsoft Teams、使用独立 Webhook URL 的[项目告警](/user-guide/alerts#project-alerts)。

## 消息内容 {#message-content}

| 卡片元素 | 值 |
|---|---|
| 标题 | `Ansible Task Template Execution by:` 以及启动任务的用户名；如果任务不是由用户启动的，则为 `—`。 |
| **Task** | 任务模板的名称。 |
| **Status** | 带图标的任务状态，例如 `✅ SUCCESS`、`❌ ERROR` 或 `⚠️ WAITING_CONFIRMATION`。 |
| **Task ID** | 任务编号。 |
| **Task URL** 按钮 | 在 Semaphore 中打开该任务。链接基于 `web_host` 生成，因此请将此选项设置为用户访问 Semaphore 所用的地址。 |

## 故障排除 {#troubleshooting}

请求由 Semaphore 服务器发送，而不是由 Runner 发送，结果会写入任务日志。Semaphore 对每条消息只发送一次，不会重试。

| 任务日志 | 检查内容 |
|---|---|
| 没有关于 Microsoft Teams 的日志行 | 未尝试发送消息。请检查 `microsoft_teams_alert` 是否为 `true`、项目是否使用服务器渠道，以及模板是否屏蔽了该通知。 |
| `Can't send microsoft teams alert! Error: …` | 服务器无法连接到 Webhook 主机。请允许服务器向 URL 中的主机发起出站 HTTPS 连接。如果位于代理之后，请为 Semaphore 服务器设置 `HTTPS_PROXY`，参见[在企业代理后运行](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy)。 |
| `Can't send microsoft teams alert! Response code: …` | Webhook 拒绝了请求。请检查 URL 是否完整复制（包括 `sig` 参数），以及工作流是否已开启且未被删除。Microsoft 限制每个 Webhook 每秒最多 4 个请求。 |
| `Sent successfully microsoft teams alert`，但频道中没有卡片 | 工作流接受了请求，但随后执行失败。请在 **Workflows** 应用中打开该工作流并查看其运行历史记录。工作流归创建它的用户所有，当该用户离开组织或失去频道访问权限时，工作流将停止工作，因此请为工作流添加共同所有者。 |
