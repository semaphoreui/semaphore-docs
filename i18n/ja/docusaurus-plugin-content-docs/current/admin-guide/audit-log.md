---
title: 監査ログ
description: 監査ログを有効にして Semaphore で誰が何をしたかを確認し、Semaphore Pro から監査イベントを SIEM に送信します。
---

# 監査ログ

監査ログは、Semaphore での重要な操作を記録します。誰がサインインしたか、誰がユーザーやロールを変更したか、誰が API トークンを作成したかなどです。各イベントには、誰が、いつ、どのアドレスから操作し、成功したかどうかが含まれます。インストールで何が起きたかを調べたり、イベントを SIEM に送って他のログと一緒に保管したりできます。

監査ログはすべてのエディションで利用できます。SIEM へのイベント送信には Semaphore Pro が必要です。

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
- サーバーの起動

今後のリリースでイベントは追加されます。一覧は [監査イベント](/reference/audit-events) を参照してください。

パスワード、トークン、シークレットの値、タスクの出力が監査イベントに含まれることはありません。API トークンは値ではなくフィンガープリントで示されます。サインインに失敗した場合は入力されたログイン名が残るため、メールアドレスが含まれることがあります。

終了したタスクには完了イベントがあります。開始前に失敗した場合も同様です。`metadata.result` は Semaphore がタスクに付けたステータスを示し、`metadata.end_reason` は Semaphore がタスクを終了させた理由を示します。長時間実行された場合は `timeout`、ランナーが応答しなくなった場合は `runner_lost` です。タスクの引数、変数、ランナーのタグ、トークンは記録されません。

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

イベントは Semaphore のデータベースに保存されるため、通常のデータベースバックアップに含まれます。Semaphore は監査イベントを UI に表示せず、古いイベントを削除もしないため、データベースのサイズに注意してください。

監査ログがユーザーの操作を妨げることはありません。イベントを保存できなかった場合、Semaphore はサーバーログにエラーを書き込み、操作は通常どおり続行されます。

## SIEM にエクスポートする <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro は、rsyslog や Vector などの Syslog レシーバーに TLS で監査イベントを送信できます。レシーバーはイベントを保存したり、SIEM に転送したりできます。

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

### イベントの配信方法 {#delivery}

- レシーバーが停止している間、イベントはデータベースで待機し、復旧すると送信されます。ユーザーは何も気付きません。
- ネットワークエラー、再起動、HA のフェイルオーバーの後は、一部のイベントが二重に届くことがあります。`event_id` で重複を取り除き、`seq` で順序を並べてください。
- エラーなしで接続が切れた場合、その時点で送信したイベントが失われることがあります。
- [HA 構成](/admin-guide/ha) では、一度に 1 つのノードがイベントを送信します。Redis が利用できない間は送信が一時停止しますが、イベントの記録は続きます。

各イベントは、イベントの JSON を本文とする RFC 5424 の Syslog メッセージとして送信されます。`HOSTNAME` は HA ノード ID（単一ノードではインスタンス ID）、`MSGID` はイベントコードです。

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

### エクスポートのトラブルシューティング {#troubleshoot-export}

- **Semaphore が起動しない。** `audit.syslog.id` と `audit.syslog.address` の両方が設定されていること、CA ファイルに PEM 証明書が含まれていることを確認してください。
- **TLS 接続に失敗する。** レシーバーの証明書が `server_name` と一致し、Semaphore が信頼する CA によって署名されていることを確認してください。
- **イベントが届かない。** Semaphore のサーバーログとレシーバーのログを確認してください。失敗した後、Semaphore は少し待ってから再試行します。
- **一部のイベントが二重に届く。** 再試行やフェイルオーバーの後に起こることがあります。`event_id` で重複を取り除いてください。

## 記録されない操作 {#not-recorded}

コマンドラインツール `semaphore` はデータベースを直接操作するため、`user add` や `user token` などのコマンドは記録されません。

UI の一部の操作はまだ記録されません。ライセンスの削除、アプリの設定、HA のタスク状態のクリア、Terraform インベントリのエイリアス、Terraform ステートの削除、ワークフローの実行、プロジェクトへの招待です。テンプレートの説明、ビュー、プロジェクトキャッシュのクリア、スケジュールされたシークレットストレージの同期も記録されません。今後のリリースで予定されているイベントは [監査イベント](/reference/audit-events) を参照してください。

## 次のステップ {#whats-next}

- [監査イベント](/reference/audit-events) — イベントの形式と、記録されるすべてのイベント。
- [構成オプション](/reference/configuration#audit-log) — すべての `audit.*` オプションと環境変数。
- [ログ](/admin-guide/logs) — サーバー、アクティビティ、タスクのログ。
