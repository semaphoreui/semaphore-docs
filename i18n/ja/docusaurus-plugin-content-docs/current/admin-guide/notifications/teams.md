# Microsoft Teams

Microsoft Teams 通知を使用すると、Semaphore のタスク結果を Teams チャンネルに直接届けられます。各メッセージはカード形式で、テンプレート名、タスクのステータス、タスクを開始したユーザー、そして Semaphore でタスクを開くボタンが含まれます。

Teams 通知を設定するには、Semaphore とチャンネルを接続する webhook URL が必要です。Teams では、この URL を **Workflows** アプリで作成します。このアプリは Microsoft Power Automate を基盤としており、Semaphore のワークフローとは関係ありません。

:::warning
Microsoft は 2026 年 5 月に、旧来の **Incoming Webhook** コネクタを含む Teams の Office 365 コネクタを廃止しました。`webhook.office.com` 上の webhook URL ではメッセージが配信されなくなっています。以下の手順に従い、Workflows アプリで新しい URL を作成してください。
:::

## Teams webhook の作成 {#creating-teams-webhook}

### ステップ 1. チャンネルの Workflows を開く {#step-1-open-workflows-for-the-channel}

1. Microsoft Teams で、通知を受け取るチームとチャンネルに移動します。
2. チャンネル名の横にある **More options (…)** をクリックします。
3. **Workflows** を選択します。

---

### ステップ 2. テンプレートからワークフローを作成する {#step-2-create-a-workflow-from-the-template}

1. テンプレート **Send webhook alerts to a channel** を検索して選択します。
2. ワークフローのパラメーターとして、メッセージの投稿先となる **Team** と **Channel** を確認します。
3. **Save** をクリックします。

Semaphore は認証ヘッダーなしでリクエストを送信するため、このテンプレートを使用してください。*from specific people* や *from people in an org* のバリエーションは使用しないでください。

---

### ステップ 3. webhook URL をコピーする {#step-3-copy-the-webhook-url}

1. ワークフローが作成されると、Teams にその webhook リンクが表示されます。これをコピーします。
2. URL は長く、次のような形式です。

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

webhook を保護しているのは `sig` パラメーターだけです。URL を知っている人は誰でもチャンネルに投稿できます。URL 全体を機密情報として扱ってください。

---

### ステップ 4. webhook をテストする {#step-4-test-your-webhook}

`curl` を使用してテストします。

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

このリクエスト本文は、Semaphore が送信するメッセージと同じ構造で、Adaptive Card を 1 つ添付したメッセージです。すべて正しく設定されていれば、レスポンスは `202 Accepted` となり、数秒以内に選択した Teams チャンネルにカードが表示されます。


## Semaphore の設定 {#semaphore-configuration}

Teams の webhook URL を取得したら、設定ファイルまたは環境変数のいずれかで Teams 通知を有効にできます。変更を反映するには Semaphore を再起動してください。

### 方法 1: 設定ファイル {#method-1-configuration-file}

Semaphore の設定ファイルに次の設定を追加します。

- `microsoft_teams_alert`: Teams 通知を有効にするには `true` を設定します
- `microsoft_teams_url`: 前のステップで取得した webhook URL

`config.json` の例:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### 方法 2: 環境変数 {#method-2-environment-variables}

また、環境変数を使用することもできます。この方法は、コンテナ化されたデプロイや、webhook URL を設定ファイルに含めたくない場合に特に便利です。

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
URL には `&` と `%` の文字が含まれます。シェルで変数を設定する場合は、URL をシングルクォートで囲んでください。systemd ユニットでは `%` が指定子の開始を意味するため、`Environment=` 行ではなく `EnvironmentFile` に記述してください。
:::

## プロジェクトでの通知の有効化 {#enabling-notifications-for-a-project}

上記の設定はサーバー全体でこのチャンネルを有効にするもので、すべてのメッセージは webhook が属する 1 つのチャンネルに送られます。プロジェクトがメッセージを受け取るのは、そのプロジェクトがサーバーのチャンネルを使用している場合だけです。また、タスクテンプレートで成功または失敗のメッセージを抑制できます。詳しくは [配信の仕組み](/admin-guide/notifications#how-delivery-works) を参照してください。タスクを実行せずにテストメッセージを送信する方法も説明しています。

Teams には、タスクが成功したとき、失敗したとき、確認待ちになったときに通知されます。

特定のプロジェクトの通知を別の Teams チャンネルに送信するには、独自の webhook URL を指定した Microsoft Teams タイプの [プロジェクトアラート](/user-guide/alerts#project-alerts) を作成します。

## メッセージの内容 {#message-content}

| カードの要素 | 値 |
|---|---|
| ヘッダー | `Ansible Task Template Execution by:` とタスクを開始したユーザーの名前。ユーザーが開始したタスクでない場合は `—`。 |
| **Task** | タスクテンプレートの名前。 |
| **Status** | アイコン付きのタスクステータス。例: `✅ SUCCESS`、`❌ ERROR`、`⚠️ WAITING_CONFIRMATION`。 |
| **Task ID** | タスクの番号。 |
| **Task URL** ボタン | Semaphore でタスクを開きます。リンクは `web_host` から生成されるため、このオプションにはユーザーが Semaphore にアクセスするアドレスを設定してください。 |

## トラブルシューティング {#troubleshooting}

リクエストはランナーではなく Semaphore サーバーから送信され、結果はタスクログに書き込まれます。Semaphore は各メッセージを 1 回だけ送信し、再試行は行いません。

| タスクログ | 確認事項 |
|---|---|
| Microsoft Teams に関する行がない | メッセージの送信は試行されていません。`microsoft_teams_alert` が `true` であること、プロジェクトがサーバーのチャンネルを使用していること、テンプレートが通知を抑制していないことを確認してください。 |
| `Can't send microsoft teams alert! Error: …` | サーバーが webhook のホストに到達できませんでした。サーバーから URL のホストへの送信 HTTPS 通信を許可してください。プロキシ環境では Semaphore サーバーに `HTTPS_PROXY` を設定します。[企業プロキシの背後での実行](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy) を参照してください。 |
| `Can't send microsoft teams alert! Response code: …` | webhook がリクエストを拒否しました。`sig` パラメーターを含めて URL 全体がコピーされていること、ワークフローがオンになっていて削除されていないことを確認してください。Microsoft は 1 つの webhook へのリクエストを 1 秒あたり 4 件に制限しています。 |
| `Sent successfully microsoft teams alert` だが、チャンネルにカードがない | ワークフローはリクエストを受け付けましたが、その後の処理で失敗しました。**Workflows** アプリでワークフローを開き、実行履歴を確認してください。ワークフローは作成したユーザーに属しており、そのユーザーが組織を離れたりチャンネルへのアクセス権を失ったりすると動作しなくなります。ワークフローに共同所有者を追加しておいてください。 |
