---
title: 監査ログ
description: セキュリティ監査ログを有効にし、記録される内容を理解して、Semaphore Pro から TLS 経由の Syslog で監査イベントを SIEM に送信します。
---

# 監査ログ

監査ログには、セキュリティに関係するアクティビティが記録されます。誰が操作したか、何を行ったか、どのオブジェクトが
影響を受けたか、どこからリクエストが送信されたか、操作が成功したかを確認できます。運用担当者は変更の調査に使用し、
セキュリティチームは文書化されたイベント形式を検知ルールやコンプライアンスの証拠に使用します。

監査イベントの取得とローカル保存は Semaphore Community で利用できます。Semaphore Pro では、取得したイベントを
セキュリティ情報イベント管理 (SIEM) システムに送信することもできます。

## 他のログとの違い {#log-types}

| ログ | 用途 |
| --- | --- |
| サーバーログ | Semaphore の起動、設定、実行時のエラーを診断します。 |
| アクティビティログ | プロジェクトのアクティビティをプロジェクトユーザー向けのフィードとして表示します。 |
| タスクログと履歴 | タスクの実行、ステータス、出力を確認します。 |
| 監査ログ | インストール全体の認証操作と管理操作を調査します。 |

監査ログは[アクティビティログ](/admin-guide/logs#activity-log)とは独立しています。一方を有効化またはエクスポートしても、
もう一方が有効化またはエクスポートされることはありません。

## 記録される内容 {#recorded-events}

現在のリリースでは、サポート対象の認証イベントと ID 管理イベントが記録されます。これには次のものが含まれます。

- 成功および失敗したサインイン、サインアウト、TOTP チェック
- 拒否された API トークン、拒否された権限、ブロックされたクロスサイトリクエスト
- ユーザー、パスワード、TOTP 登録、外部 ID、API トークンへの変更
- プロジェクトメンバーシップ、ロール、テンプレート権限への変更
- システム設定と Pro ライセンスのアクティベーションへの変更
- サーバーとともに開始される監査イベントの取得

ログインの成功は、TOTP を含む必要な認証手順をすべてユーザーが完了した後に記録されます。利用可能なすべてのイベントと、
今後のリリースで予定されているイベントについては、[監査イベント](/reference/audit-events)を参照してください。

## イベントから除外される機密データ {#sensitive-data}

監査イベントでは、認証情報や秘密のペイロードをコピーせずに操作を識別します。パスワード、パスコード、TOTP のシークレットと
QR コード、リカバリーコード、セッション Cookie、生のトークン、OAuth コードとクレーム、秘密鍵、パスフレーズ、シークレット値、
環境変数とサーベイの値、Webhook の本文、タスク出力、リポジトリ URL は除外されます。

API トークンは値ではなくフィンガープリントで識別されます。サインインに失敗した場合、入力されたログイン識別子が 64 バイトに
切り詰められて記録されます。ユーザーがメールアドレスでサインインする場合、この識別子にはメールアドレスが含まれることがあります。

## 監査ログを有効にする {#enable}

インストールに使用する固定の名前を決め、`config.json` で `audit.enabled` と `audit.instance_id` を設定します。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

インスタンス ID には、空白を含まない 1〜255 文字の印字可能な ASCII 文字を使用する必要があります。これはすべてのイベントに
表示され、SIEM が複数の Semaphore インストールを識別するために使用されます。

または、環境変数を使用します。

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

変更を適用するには Semaphore を再起動します。再起動後に取得が開始され、それ以前のアクティビティは監査ログに追加されません。
最初のイベントは、アクションが `start` の `audit.lifecycle` です。

すべてのオプションと環境変数については、
[設定オプション](/reference/configuration#audit-log)を参照してください。

## プロキシ配下のクライアントアドレスを記録する {#trusted-proxies}

デフォルトでは、HTTP 監査イベントには Semaphore に直接接続したアドレスが記録されます。そのアドレスがリバースプロキシの場合は、
プロキシのネットワークだけを `audit.trusted_proxy_cidrs` に追加します。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

または、次のように設定します。

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore が `X-Forwarded-For` と `X-Real-IP` を信頼するのは、これらのネットワークから送信された場合だけです。
クライアントネットワークは追加しないでください。信頼されたネットワーク内のクライアントは、自身のイベントに記録される送信元アドレスを
選択できてしまいます。複数のプロキシが `X-Forwarded-For` にアドレスを追加する場合、Semaphore は信頼されたプロキシではない
最も右側のアドレスを記録します。

## 保存と制限事項 {#storage}

Semaphore は監査イベントをデータベースに保存します。このリリースには、監査ログビューアー、監査 API、自動的な保持期間の管理、
削除機能はありません。データベースの増加量を監視し、監査データをデータベースのバックアップポリシーに含めてください。

監査の記録によって、記録対象の操作がブロックされることはありません。イベントの保存に失敗した場合、Semaphore はサーバーログに
エラーを書き込み、元の操作を続行します。ローカルの記録は Semaphore の他のデータと同じデータベースアクセス制御で保護されますが、
変更不能ではなく、改ざん検知機能もありません。

サーバーが起動するたびに `audit.lifecycle/start` が記録されます。停止イベントはありません。シャットダウン、クラッシュ、または
監査ログの無効化は、その後の開始イベントまでイベントが存在しない期間として現れます。

## SIEM にエクスポートする <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro は、正常に取得されたイベントを rsyslog や Vector などの既存の TLS Syslog レシーバーに送信できます。
レシーバーはイベントを保存するか、SIEM に転送できます。

開始する前に、次のものを用意します。

- レシーバーのホスト名とポート
- `security-syslog` などの固定の送信先 ID
- レシーバー証明書に署名した CA の証明書 (Semaphore ホストですでに信頼されていない CA の場合)

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

または、環境変数を使用します。

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` と `address` は必須です。レシーバーのアドレスや証明書を変更するときも同じ ID を維持すると、Semaphore は保存された位置から
再開します。新しい ID は、その送信先が初期化された後に記録されたイベントから開始します。その時点ですでに保存されていたイベントは
送信されません。

`ca_file` はシステムの信頼ストアに証明書を追加します。`server_name` はレシーバー証明書で検証するホスト名を上書きします。
Semaphore は TLS 1.2 以降を必要とし、常にサーバー証明書を検証します。この接続では、検証の無効化やクライアント証明書の使用は
サポートされていません。

Semaphore を再起動します。送信先の設定が無効な場合や CA ファイルを読み取れない場合、Semaphore は起動しません。

### 配信を確認する {#verify-siem-delivery}

再起動後、レシーバーで新しいイベントを見つけ、次の内容を確認します。

- `event_code` が `audit.lifecycle` である
- `action` が `start` である
- `outcome` が `success` である
- `instance_id` が設定したインストール名と一致する
- `metadata.destinations` に送信先 ID が含まれる

### 配信の動作 {#delivery}

- レシーバーを利用できない場合、Semaphore は取得したイベントをローカルに保持し、レシーバーが復旧したときに再試行します。
  ユーザーリクエストは通常どおり続行されます。
- Syslog の配信はベストエフォートです。Semaphore に通知されずに切断された接続に書き込まれたイベントは失われる可能性があります。
- ネットワークエラー、再起動、HA フェイルオーバーによって重複して配信されることがあります。`event_id` で重複を排除し、`seq` で
  イベントを並べ替えてください。
- [HA インストール](/admin-guide/ha)では、通常、一度に 1 つのノードが送信先へ送信します。Redis を利用できない場合、共有データベースへの
  取得は続行されますが、エクスポートは一時停止します。

Semaphore は TLS とオクテットカウント方式のフレーミングを使用して RFC 5424 メッセージを送信します。メッセージ本文には監査イベントの
JSON が含まれます。`HOSTNAME` は HA ノード ID、単一ノードではインスタンス ID です。`MSGID` は `event_code` です。

### rsyslog レシーバーの例 {#rsyslog}

次の rsyslog 設定フラグメントは TLS 接続を受け入れ、1 行につき 1 つのイベント JSON オブジェクトを書き込みます。

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

### Vector レシーバーの例 {#vector}

次の Vector 設定は TLS 接続を受け入れ、イベント JSON を解析してファイルに書き込みます。

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

- Semaphore が起動しない場合は、`audit.syslog.id` と `audit.syslog.address` の両方が設定されていること、および CA ファイルに
  読み取り可能な PEM 証明書が含まれていることを確認します。
- TLS が失敗する場合は、レシーバー証明書が `server_name` に対して有効であり、システムまたは設定済みの CA まで証明書チェーンを
  検証できることを確認します。
- イベントがまだ到着していない場合は、Semaphore のサーバーログとレシーバーの取り込みログを確認します。エクスポートは失敗後に
  遅延を挟んで再試行します。
- イベントが 2 回表示される場合は、`event_id` で重複を排除します。一部の再試行やフェイルオーバーの後には重複が発生します。

## 監査対象外の操作 {#not-recorded}

`semaphore` コマンドはデータベースを直接変更するため、`user add` や `user token` などのサーバー側の CLI 操作は記録されません。
サーバーとデータベースへのアクセスは個別に制御する必要があります。

このリリースでは、ライセンスの削除、アプリの実行時設定、HA のタスク状態のクリア、Terraform インベントリのエイリアス、
ワークフローの実行、プロジェクトへの招待についても監査イベントがありません。
[イベントカタログ](/reference/audit-events)には、今後のリリースで予定されているイベントが示されています。

## 次のステップ {#whats-next}

- [監査イベント](/reference/audit-events) — イベントのフィールド、利用可能なイベントと予定されているイベント、コンプライアンスの対応範囲。
- [設定オプション](/reference/configuration#audit-log) — すべての `audit.*` オプションと環境変数。
- [ログ](/admin-guide/logs) — サーバーログ、アクティビティログ、タスクログ。
