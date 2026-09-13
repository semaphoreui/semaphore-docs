# Telegram

### 前提条件 {#pre-requisites}

Semaphore UI が Telegram 経由でアラートを送信するように設定するには、事前に Telegram 側でいくつかの手順が必要です。webhook を受け取る独自のボットを作成し、メッセージの送信先となるチャットの ID を確認しておく必要があります。

#### ボットのセットアップ {#bot-setup}

独自のボットを作成する最も簡単な方法は、@BotFather を使用することです。

1. Telegram クライアントで、@BotFather に `/start` を送信します。
1. 案内に従って新しいボットを作成し、最後のステップで表示される認証トークンを控えておきます。注意: このトークンは秘密情報であり、そのように扱う必要があります。
1. 作成した新しいボットに `/start` を送信してボットを起動し、メッセージを受信できるようにします。

#### チャット ID {#chat-id}

1. Telegram クライアントで、@RawDataBot に任意のメッセージを送信します。
1.  `chat` マップ内の `id` キーの値をコピーします。

#### テスト {#testing}

上記の設定は、次のように cURL を使用して検証できます。

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### 設定 {#configuration}

前のステップで取得したチャット ID とトークンを使用して、次のように Semaphore UI が Telegram アラートを送信するように設定できます。

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

`config.json` の例:

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### プロジェクトごとのチャット ID {#per-project-chat-ids}

各プロジェクトで固有のチャット ID を使用できます。これにより、すべての通知を同じチャットに送るのではなく、プロジェクトごとに通知を分けられます。この設定は、上記のグローバルなチャット ID を上書きします。
