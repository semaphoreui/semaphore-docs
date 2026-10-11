---
title: 監査ログ
description: 監査ログを有効にして Semaphore で誰が何をしたかを確認し、Semaphore Pro から監査イベントを Syslog または HEC で SIEM に送信します。
---

# 監査ログ

監査ログは、Semaphore での重要な操作を記録します。誰がサインインしたか、誰がユーザーやロールを変更したか、誰が API トークンを作成したかなどです。各イベントには、誰が、いつ、どのアドレスから操作し、成功したかどうかが含まれます。インストールで何が起きたかを調べたり、イベントを SIEM に送って他のログと一緒に保管したりできます。

監査ログはすべてのエディションで利用できます。フィルタリング、ファイルへのエクスポート、SIEM へのイベント送信には Semaphore Pro が必要です。

## 記録される内容 {#recorded-events}

現在、Semaphore はサインイン、アカウント、プロジェクト、タスクの操作を記録します。

- サインイン、失敗したサインイン試行、サインアウト、二要素の確認
- 拒否された API トークン、拒否されたリクエスト、ブロックされたクロスサイトリクエスト
- ユーザー、パスワード、二要素認証、外部 ID、API トークンの変更
- プロジェクトメンバー、ロール、テンプレート権限の変更
- プロジェクト、インベントリ、リポジトリ、テンプレート、スケジュール、インテグレーション、ホスト設定、環境、認証情報、シークレットストレージの変更、およびプロジェクトバックアップのエクスポートと復元
- システム設定の変更と Pro ライセンスの有効化
- タスクの開始とそのトリガー(API、スケジュール、インテグレーション、自動実行、ワークフロー)、承認、停止、完了、削除されたタスク履歴
- ランナーの変更、登録(拒否された登録トークンを含む)、登録解除、無効なステータスのランナーレポート
- 監査ログのファイルへのエクスポート
- サーバーの起動

一覧は [監査イベント](/reference/audit-events) を参照してください。

パスワード、トークン、シークレットの値、タスクの出力が監査イベントに含まれることはありません。API トークンは値ではなくフィンガープリントで示されます。サインインに失敗した場合は入力されたログイン名が残るため、メールアドレスが含まれることがあります。

タスクの完了イベントでは、`metadata.result` は Semaphore がタスクに付けたステータスを示し、`metadata.end_reason` は Semaphore がタスクを終了させた理由を示します。長時間実行された場合は `timeout`、ランナーが応答しなくなった場合は `runner_lost` です。タスクの引数、変数、ランナーのタグ、トークンは記録されません。

HA クラスターのローリングアップグレード中に、アップグレード済みのノードで開始され、まだアップグレードされていないノードで終了したタスクには、完了イベントがありません。

リポジトリの URL、ホスト設定の URL、インテグレーションのエイリアスも記録されません。

Semaphore がオブジェクトを保存または削除したものの、同じリクエストの後続の処理が失敗することがあります。このとき UI や API はエラーを表示しますが、オブジェクトは作成または削除されています。このようなイベントは成功として記録され、`metadata.partial=true` が付き、`reason` に完了しなかった内容が示されます。

- `secret_failed`: 環境は保存または削除されたが、一部のシークレットが保存または削除されなかった
- `inventory_failed`: テンプレートは作成されたが、その Terraform ワークスペースのインベントリは作成されなかった
- `restore_failed`: プロジェクトはバックアップから復元されたが、一部のオブジェクトは復元されなかった
- `setup_failed`: プロジェクトは作成されたが、設定が完了しなかった（たとえば作成者がオーナーとして追加されなかった）

## 監査ログを有効にする {#enable}

監査ログは既定で無効です。有効にするには、`audit.enabled` を設定し、`audit.instance_id` にインストールの名前を指定します。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

環境変数を使う場合：

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

インスタンス ID は空白を含まない 1〜255 文字です。すべてのイベントに付加されるため、複数のインストールが同じ場所にイベントを送っても区別できます。

Semaphore を再起動します。記録は再起動後に始まり、それ以前の操作は追加されません。すべてのオプションは [構成オプション](/reference/configuration#audit-log) を参照してください。

## プロキシの背後でクライアントのアドレスを記録する {#trusted-proxies}

Semaphore がリバースプロキシの背後で動作している場合、イベントにはユーザーではなくプロキシのアドレスが記録されます。実際のクライアントのアドレスを記録するには、`audit.trusted_proxy_cidrs` にプロキシのネットワークを指定します。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

環境変数を使う場合：

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

これにより、Semaphore はこれらのネットワークから来たリクエストに限り、`X-Forwarded-For` または `X-Real-IP` からクライアントのアドレスを取得します。リクエストが複数のプロキシを経由する場合は、すべて指定してください。ユーザーが接続してくるネットワークは指定しないでください。そのネットワーク内の誰でも、これらのヘッダーに任意のアドレスを設定できてしまいます。

## 保存 {#storage}

イベントは Semaphore のデータベースに保存されるため、通常のデータベースバックアップに含まれます。デフォルトではすべてのイベントを保持します。古いイベントを削除するには、保持期間を日数で設定します。

```json
{
  "audit": {
    "retention_days": 365
  }
}
```

環境変数で設定することもできます: `SEMAPHORE_AUDIT_RETENTION_DAYS=365`。

Semaphore は古いイベントを 1 時間に 1 回削除し、削除したイベントの数を含む `audit.retention/delete` イベントを記録します。イベントを SIEM にエクスポートしている場合は、耐えたい SIEM の最長の停止時間より長い期間を選んでください。期間より古いイベントは、未送信であっても削除されます。

保持期間に基づく削除は、Semaphore の起動時にも実行されます。HA 構成では、すべてのノードで同じ `retention_days` を使用してください。

監査ログがユーザーの操作を妨げることはありません。イベントを保存できなかった場合、Semaphore はサーバーログにエラーを書き込み、操作は通常どおり続行されます。

## SIEM にエクスポートする <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro は、rsyslog や Vector などの Syslog レシーバーに TLS で監査イベントを送信できるほか、Splunk、Vector、Fluent Bit、OpenTelemetry Collector、Cribl など、Splunk HTTP Event Collector (HEC) プロトコルに対応する任意のレシーバーにも送信できます。Syslog と HEC の送信先をそれぞれ 1 つずつ、または両方を同時に設定できます。

必要なもの：

- レシーバーのホスト名とポート
- この送信先の名前（例：`security-syslog`）
- Semaphore ホストがまだ信頼していない場合は、レシーバーの CA 証明書

`config.json` に `audit.syslog` を追加します。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

環境変数を使う場合：

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` と `address` は必須です。Semaphore は各送信先にどのイベントを送信済みかを覚えているため、アドレスや証明書を変更するときも同じ `id` を使ってください。新しい `id` では新しいイベントから送信が始まります。

Semaphore は常にレシーバーの証明書を検証し、TLS 1.2 以降を使用します。`ca_file` は CA を信頼する証明書に追加し、`server_name` はアドレスと異なる場合に証明書で確認する名前を指定します。

Semaphore を再起動します。設定が無効な場合や CA ファイルを読み取れない場合、Semaphore は起動しません。

### イベントが届くことを確認する {#verify-siem-delivery}

Semaphore は起動のたびにイベントを記録します。再起動後、レシーバーでそのイベントを探してください。`event_code` が `audit.lifecycle`、`action` が `start` で、`metadata.destinations` に送信先の ID が含まれています。

### HEC でイベントを送信する {#hec}

HEC エンドポイントの URL、HEC トークン、この送信先の名前（例: `security-hec`）、そして Semaphore ホストがまだ信頼していない場合はレシーバーの CA 証明書が必要です。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "splunk_hec": {
      "id": "security-hec",
      "url": "https://splunk.example.com:8088/services/collector/event",
      "token": "<HEC token>",
      "index": "security",
      "ca_file": "/etc/semaphore/siem-ca.pem"
    }
  }
}
```

環境変数を使う場合:

```bash
SEMAPHORE_AUDIT_SPLUNK_HEC_ID=security-hec
SEMAPHORE_AUDIT_SPLUNK_HEC_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_SPLUNK_HEC_TOKEN='<HEC token>'
SEMAPHORE_AUDIT_SPLUNK_HEC_INDEX=security
SEMAPHORE_AUDIT_SPLUNK_HEC_CA_FILE=/etc/semaphore/siem-ca.pem
```

`id`、`url`、`token` は必須で、URL は `https://` で始まる必要があります。`id` は Syslog とは別の値にしてください。`source` と `sourcetype` の既定値は `semaphore` と `semaphore:audit` です。証明書は Syslog と同じ方法で検証され、標準の `HTTPS_PROXY` と `NO_PROXY` 環境変数が適用されます。

Semaphore は 1 回のリクエストで最大 100 件のイベントを送信します。各 HEC イベントの `event` フィールドには監査イベントの JSON が入り、`time` はイベントの時刻、`host` は HA ノード ID（単一ノードではインスタンス ID）です。

Semaphore を再起動し、[上記](#verify-siem-delivery)のとおりイベントが届くことを確認してください。

### イベントの配信方法 {#delivery}

- レシーバーが停止している間、イベントはデータベースで待機し、復旧すると送信されます。ユーザーは何も気付きません。
- ネットワークエラー、再起動、HA のフェイルオーバーの後は、一部のイベントが二重に届くことがあります。`event_id` で重複を取り除き、`seq` で順序を並べてください。
- Syslog では、エラーなしで接続が切れた場合、その時点で送信したイベントが失われることがあります。
- [HA 構成](/admin-guide/ha) では、一度に 1 つのノードが、各送信先にイベントを送信します。Redis が利用できない間は送信が一時停止しますが、イベントの記録は続きます。
- HEC では、レシーバーが 2xx ステータスで応答して初めて、イベントが送信済みとして扱われます。4xx を含むそれ以外の応答では再試行します。レシーバーが応答後にクラッシュした場合、まだ保存されていなかったイベントが失われることがあります。

Syslog では、各イベントは、イベントの JSON を本文とする RFC 5424 の Syslog メッセージとして送信されます。`HOSTNAME` は HA ノード ID（単一ノードではインスタンス ID）、`MSGID` はイベントコードです。

以下の例は最小限の構成で、イベントの受信方法を示すだけです。ポートに到達できるすべてのクライアントからの接続を受け付けます。本番環境では、Semaphore サーバーだけがイベントを送信できるようにレシーバーを保護してください。

### rsyslog の例 {#rsyslog}

この rsyslog の構成は TLS 接続を受け付け、1 行に 1 イベントを書き込みます。

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Vector の例 {#vector}

この Vector の構成は TLS 接続を受け付け、イベントの JSON を読み取ってファイルに書き込みます。

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Vector HEC の例 {#vector-hec}

```toml
[sources.semaphore_audit_hec]
type = "splunk_hec"
address = "0.0.0.0:8088"
valid_tokens = ["<HEC token>"]
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_hec"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Splunk の例 {#splunk}

Splunk で HEC トークンを作成し (**Settings → Data inputs → HTTP Event Collector**)、そのトークンに `security` インデックスを許可して、`url` を `https://<splunk>:8088/services/collector/event` に設定します。イベントを探すには、`index=security sourcetype="semaphore:audit"` を検索します。

このトークンでは **Enable indexer acknowledgement** をオフのままにしてください。Semaphore はこの機能を使いません。

### エクスポートを監視する {#monitor-export}

[メトリクス](/admin-guide/metrics)が有効な場合、Semaphore Pro は送信先ごとに次を報告します。

| メトリクス | 意味 |
| --- | --- |
| `semaphore_audit_export_oldest_pending_seconds` | まだ送信されていない最も古いイベントの経過時間。すべて送信済みの場合は 0 |
| `semaphore_audit_export_pending_events` | 送信待ちのイベント数 |
| `semaphore_audit_export_errors_total` | 送信の失敗回数 |

`semaphore_audit_export_errors_total` は送信したノードがカウントするため、ノードをまたいで合計してください。例: `sum by (destination) (increase(semaphore_audit_export_errors_total[15m]))`

各メトリクスには、送信先の `id` を値とする `destination` ラベルがあります。SIEM がイベントを受信しなくなったときにアラートを受け取るには、送信待ちの最も古いイベントの経過時間を監視します。

```yaml
- alert: SemaphoreAuditExportStalled
  expr: max by (destination) (semaphore_audit_export_oldest_pending_seconds) > 900
  for: 5m
```

### エクスポートのトラブルシューティング {#troubleshoot-export}

- **Semaphore が起動しない。** `audit.syslog.id` と `audit.syslog.address` の両方が設定されていること（HEC の場合は `audit.splunk_hec.id`、`url`、`token`）、CA ファイルに PEM 証明書が含まれていることを確認してください。
- **TLS 接続に失敗する。** レシーバーの証明書が `server_name` と一致し、Semaphore が信頼する CA によって署名されていることを確認してください。
- **イベントが届かない。** Semaphore のサーバーログとレシーバーのログを確認してください。失敗した後、Semaphore は少し待ってから再試行します。
- **一部のイベントが二重に届く。** 再試行やフェイルオーバーの後に起こることがあります。`event_id` で重複を取り除いてください。
- **HEC が 400、401 または 403 を返す。** トークン、そのトークンが書き込みを許可されているインデックス、およびそのトークンでインデクサー確認応答がオフになっていることを確認してください。トークンが Semaphore のログに表示されることはありません。

## 記録されない操作 {#not-recorded}

コマンドラインツール `semaphore` はデータベースを直接操作するため、`user add` や `user token` などのコマンドは記録されません。

UI の一部の操作は記録されません。ライセンスの削除、アプリの設定、HA のタスク状態のクリア、Terraform インベントリのエイリアス、Terraform ステートの削除、ワークフローの実行、プロジェクトへの招待です。テンプレートの説明、ビュー、プロジェクトキャッシュのクリア、スケジュールされたシークレットストレージの同期も記録されません。

## 次のステップ {#whats-next}

- [監査ログを表示する](/admin-guide/audit-log/view) — Web UI でイベントを確認、フィルター、エクスポートします。
- [監査イベント](/reference/audit-events) — イベントの形式と、記録されるすべてのイベント。
- [構成オプション](/reference/configuration#audit-log) — すべての `audit.*` オプションと環境変数。
- [ログ](/admin-guide/logs) — サーバー、アクティビティ、タスクのログ。
