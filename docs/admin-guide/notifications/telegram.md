---
title: Telegram
description: Creating a Telegram bot, finding the chat ID, testing with curl, and the config keys including per-project chat IDs.
---

# Telegram

### Pre-requisites {#pre-requisites}

In order to configure Semaphore UI to send alerts via Telegram, a few steps are required beforehand on the Telegram side.  You'll need to create your own bot that will receive the webhook and you'll need to know the ID of the chat you want to send the message to.

#### Bot setup {#bot-setup}

The easiest way to set up your own bot is to use @BotFather.

1. In your Telegram client, message @BotFather with `/start`.
1. Follow the prompts to create a new bot and take note of the Authorization Token given in the last step.  Note: this token is secret and should be treated as such.
1. Message your new bot with `/start` to start the bot so it can receive messages.

#### Chat ID {#chat-id}

1. In your Telegram client, message @RawDataBot with any message.
1.  Copy the value for the `id` key in the `chat` map.

#### Testing {#testing}

You can use cURL to validate your settings above as follows:

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### Configuration {#configuration}

Using the Chat ID and Token from the previous steps, you can now configure Semaphore UI to send Telegram Alerts as follows:

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

`config.json` example:

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### Per-project Chat IDs {#per-project-chat-ids}

Each project can use a unique Chat ID.  This allows you to separate notifications by project rather than have them all go to the same chat. This overrides the global Chat ID from above.
