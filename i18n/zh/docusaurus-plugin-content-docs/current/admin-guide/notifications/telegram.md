# Telegram

### 前提条件 {#pre-requisites}

要配置 Semaphore UI 通过 Telegram 发送告警，需要先在 Telegram 侧完成几个步骤。您需要创建自己的机器人来接收 Webhook，并且需要知道要发送消息的聊天 ID。

#### 机器人设置 {#bot-setup}

设置自己的机器人最简单的方法是使用 @BotFather。

1. 在您的 Telegram 客户端中，向 @BotFather 发送 `/start`。
1. 按照提示创建一个新机器人，并记下最后一步给出的授权令牌（Authorization Token）。注意：此令牌是机密信息，请妥善保管。
1. 向您的新机器人发送 `/start` 以启动机器人，使其能够接收消息。

#### 聊天 ID {#chat-id}

1. 在您的 Telegram 客户端中，向 @RawDataBot 发送任意消息。
1.  复制 `chat` 映射中 `id` 键的值。

#### 测试 {#testing}

您可以使用 cURL 按如下方式验证上述设置：

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### 配置 {#configuration}

使用前面步骤获得的聊天 ID 和令牌，您现在可以按如下方式配置 Semaphore UI 发送 Telegram 告警：

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

`config.json` 示例：

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### 按项目设置聊天 ID {#per-project-chat-ids}

每个项目（Project）都可以使用独立的聊天 ID。这样您可以按项目分开接收通知，而不是全部发送到同一个聊天。此设置会覆盖上文的全局聊天 ID。
