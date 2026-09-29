---
title: 監査ログを SIEM に送信する
description: TLS 付きの Syslog で監査イベントを SIEM に送信するよう Semaphore Pro を設定し、rsyslog または Vector で受信できるようにします。
---

# 監査ログを SIEM に送信する <FeatureState feature="audit-siem-export" />

Semaphore Pro は、[監査ログ](/admin-guide/audit-log)のすべてのイベントを、TLS 上の RFC 5424 形式の Syslog
メッセージとして SIEM に送信します。

## 始める前に {#before-you-begin}

- Semaphore Pro のライセンス。
- [有効化された監査ログ](/admin-guide/audit-log#enable)。
- TLS を受け付ける Syslog レシーバー。例えば rsyslog や Vector です。[レシーバーの例](#receivers)を
  参照してください。
- レシーバーの証明書に署名した CA の証明書 (PEM 形式)。システムの信頼ストアにない場合に必要です。

## 手順 {#steps}

監査ログを SIEM に送信するには、次の手順に従います。

1. `config.json` に `audit.syslog` セクションを追加します。

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
         "address": "siem.example.com:6514",
         "ca_file": "/etc/semaphore/siem-ca.pem",
         "server_name": "siem.example.com",
         "timeout": "10s"
       }
     }
   }
   ```

   または環境変数を使います。

   ```bash
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` と `address` は必須です。`ca_file` はシステムの信頼ストアに CA を追加します。`server_name` は
   レシーバーの証明書で確認する名前を上書きします。`timeout` は接続と書き込みの時間を制限し、既定値は 10 秒です。
2. Semaphore を再起動します。CA ファイルが読めない場合や、`id` または `address` がない場合は、エラーで起動が
   止まります。
3. 誤ったパスワードでサインインします。SIEM は結果が `failure` の `auth.login` イベントを受信します。

## イベントの配信方法 {#delivery}

- Semaphore はログ内の位置を `id` ごとに保持します。再起動後はそこから再開し、レシーバーに到達できない間に
  記録されたイベントは、レシーバーが復帰したときに送信されます。新しい `id` は現在のイベントから始まり、
  それより前のイベントは送信しません。
- 配信はベストエフォートです。気付かないうちに切れた接続に書き込まれたイベントは失われることがあります。
- ネットワークエラーやフェイルオーバーの後など、イベントが 2 回届くことがあります。`event_id` で重複を取り除き、
  `seq` でイベントを並べ替えてください。
- [高可用性](/admin-guide/ha)では、一度に送信するのは 1 つのノードです。そのノードが停止すると、別のノードが
  引き継ぎます。

## レシーバーの例 {#receivers}

Semaphore はオクテットカウント方式のフレーミング (RFC 5425) で RFC 5424 メッセージを送信します。メッセージ本文は
イベントの JSON です。Syslog の `HOSTNAME` はノード ID、HA なしの場合はインスタンス ID で、`MSGID` は
`event_code` です。

### rsyslog {#rsyslog}

TLS でイベントを受信し、1 行に 1 つの JSON イベントを書き込みます。

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

### Vector {#vector}

TLS でイベントを受信し、イベントの JSON を解析します。

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

## 次のステップ {#whats-next}

- [監査ログ](/admin-guide/audit-log) — イベントスキーマと記録される内容。
- [監査イベント](/reference/audit-events) — 各イベントの結果、理由、メタデータ。
- [設定](/reference/configuration) — すべての `audit.*` オプション。
