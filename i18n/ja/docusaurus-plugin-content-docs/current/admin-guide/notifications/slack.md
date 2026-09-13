# Slack

Slack 通知を使用すると、Semaphore のワークフローに関するリアルタイムの更新を Slack チャンネルで直接受け取れます。この連携により、チームは Semaphore のダッシュボードを常に確認しなくても、ビルドのステータス、デプロイの結果、その他の重要なイベントを把握できます。

Slack 通知を設定するには、Semaphore と目的の Slack チャンネルを接続する webhook URL を作成する必要があります。この webhook は、2 つのプラットフォーム間の安全な通信の橋渡しとして機能します。

## Slack webhook の作成 {#creating-slack-webhook}

### ステップ 1. Slack API の設定を開く {#step-1-open-slack-api-settings}

1. [https://api.slack.com/apps](https://api.slack.com/apps) にアクセスします。
2. **Create New App** をクリックし、**From Scratch** を選択します。
3. アプリに名前を付け(例: `Semaphore Bot`)、**Slack ワークスペース**を選択します。

---

### ステップ 2. Incoming Webhooks を有効にする {#step-2-enable-incoming-webhooks}

1. アプリの設定画面で、**Features → Incoming Webhooks** に移動します。
2. **Activate Incoming Webhooks** を **On** に切り替えます。

---

### ステップ 3. webhook URL を作成する {#step-3-create-a-webhook-url}

1. **Add New Webhook to Workspace** をクリックします。
2. メッセージの送信先となるチャンネルを選択します。
3. **Allow** をクリックします。
4. 次のような **Webhook URL** が表示されます。

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### ステップ 4. webhook をテストする {#step-4-test-your-webhook}

`curl` を使用してテストします。

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

すべて正しく設定されていれば、選択した Slack チャンネルにメッセージが表示されます。


## Semaphore の設定 {#semaphore-configuration}

Slack の webhook URL を取得したら、いくつかの方法で Semaphore が通知を送信するように設定できます。

Slack 通知は、設定ファイルまたは環境変数のいずれかで有効にできます。

### 方法 1: 設定ファイル {#method-1-configuration-file}

Semaphore の設定ファイルに次の設定を追加します。

- `slack_alert`: Slack 通知を有効にするには `true` を設定します
- `slack_url`: 前のステップで取得した webhook URL

`config.json` の例:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### 方法 2: 環境変数 {#method-2-environment-variables}

また、環境変数を使用して Slack 通知を設定することもできます。この方法は、コンテナ化されたデプロイや、機密情報を設定ファイルから分離しておきたい場合に特に便利です。

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
