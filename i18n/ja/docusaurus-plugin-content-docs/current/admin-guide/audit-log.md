---
title: 監査ログ
description: Semaphore がログイン、MFA、ユーザー、権限、API トークン、設定について記録するセキュリティ監査ログと、その有効化の方法。
---

# 監査ログ

監査ログはセキュリティの監査証跡です。誰が、どこから、どのオブジェクトに対して、何をし、どんな結果になったかを
記録します。セキュリティアナリストやコンプライアンス担当者が、通常は SIEM で読みます。各イベントには安定した
文書化済みのスキーマがあるため、アナリストは Semaphore の内部を知らなくても検知ルールを書けます。

監査ログは[アクティビティログ](/admin-guide/logs)とは別のものです。アクティビティログはプロジェクトのユーザー向けの
フィードです。監査ログは、システムが正しく使われているかを確認する人のための証跡です。

## 仕組み {#overview}

監査ログを有効にすると、Semaphore は Web UI または API から来るセキュリティに関わるすべての操作についてイベントを
記録します。ログインとログアウト、MFA の確認、ユーザー、プロジェクトメンバー、ロール、権限の変更、API トークン、
システム設定です。拒否されたリクエストも記録されます。ログインの失敗、不明または期限切れの API トークン、
拒否された権限、ブロックされたクロスサイトリクエストです。

イベントは Semaphore のデータベースに保存されます。Semaphore Pro はそれを SIEM に送信できます。
[SIEM へのエクスポート](#siem-export)を参照してください。

## イベントスキーマ {#event-schema}

すべてのイベントは同じフィールドを持つ JSON オブジェクトです。イベントの一覧と、その結果、理由、メタデータに
ついては[監査イベント](/reference/audit-events)を参照してください。

| フィールド | 説明 |
| --- | --- |
| `event_id` | イベントの一意な ID。SIEM で重複を取り除くのに使います。 |
| `seq` | イベントごとに増える、欠番のない連番。イベントの並べ替えに使います。 |
| `timestamp` | イベントの時刻 (UTC)。 |
| `schema_version` | このスキーマのバージョン。フィールドの名前変更、削除、型の変更のときだけ変わります。 |
| `category` | `auth`、`iam`、`resource`、`secret`、`task`、`runner`、`system`、`audit` のいずれか。 |
| `event_code` | イベントの対象。例: `iam.api_token`。 |
| `type` | 変更の種類: `creation`、`change`、`deletion`、`access`、`start`、`end`、`denied`、`info`。 |
| `action` | 行われた操作。例: `create`。 |
| `outcome` | `success` または `failure`。 |
| `reason` | 操作が失敗した理由。イベントごとに決まった一覧から選ばれます。成功時は空です。 |
| `actor` | 操作した主体: `type` (`user`、`anonymous`、`system`、`runner`、`integration`)、`id`、`name`。ユーザーの場合は `auth` (`session` または `api_token`) も、API トークンの場合は `token_fingerprint` も含みます。 |
| `source` | Web UI と API へのリクエストの場合: クライアントの `ip` と `user_agent`。 |
| `target` | 操作の対象オブジェクト: `type`、`id`、`name`。 |
| `scope` | プロジェクト内のイベントの `project_id`。 |
| `request_id` | HTTP リクエストの ID。Semaphore はレスポンスヘッダー `X-Request-ID` でも返します。 |
| `instance_id` | この Semaphore インストールの名前。`audit.instance_id` の値です。 |
| `node_id` | [高可用性](/admin-guide/ha)が有効なとき、イベントを記録したノード。 |
| `metadata` | イベントによって異なる追加情報。 |

`timestamp` はデータベースの時刻で、マイクロ秒単位です。SQLite ではミリ秒単位です。イベントは `seq` で
並べ替えてください。2 つのイベントの時刻が同じになることはあっても、`seq` が同じになることはありません。

MySQL では、`audit_event` テーブルの `created` 列は接続オプション `loc` のタイムゾーンを使います。既定値は UTC です。
各イベントの `timestamp` は常に UTC です。

サーバーを起動するたびに、アクション `start` の `audit.lifecycle` が記録されます。停止イベントはありません。
停止、クラッシュ、監査ログの無効化は、次の `start` の前の時間の空白として現れます。

## 決して記録されないもの {#never-recorded}

監査ログには、パスワード、ワンタイムコード、TOTP のシークレットと QR コード、リカバリーコード、セッション
Cookie、トークン、OAuth のコードとクレーム、秘密鍵、パスフレーズ、シークレットの値、環境変数とサーベイの値、
Webhook の本文、タスクの出力、メールアドレス、URL は決して含まれません。API トークンはフィンガープリント、
つまり SHA-256 ハッシュの先頭 16 桁の 16 進文字だけで識別されます。

ユーザー ID とユーザー名で操作した主体を識別します。ログインに失敗した場合は、入力されたログイン名を 64 バイトに
切り詰めて記録します。失敗したログインの調査に必要だからです。

## 監査ログを有効にする {#enable}

`audit.enabled` を設定し、`audit.instance_id` でインストールに名前を付けます。名前は空白を含まない 1〜255 文字の
印字可能な ASCII 文字で、すべてのイベントに含まれます。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

または環境変数を使います。

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

変更を反映するには Semaphore を再起動します。すべてのオプションについては[設定](/reference/configuration)を
参照してください。

## リバースプロキシ配下のクライアントアドレス {#trusted-proxies}

リバースプロキシの配下では、Semaphore の直接の接続相手はプロキシで、クライアントのアドレスは
`X-Forwarded-For` または `X-Real-IP` ヘッダーから得られます。Semaphore がこれらのヘッダーを読むのは、直接の
接続相手が `audit.trusted_proxy_cidrs` に含まれる場合だけです。それ以外の場合は接続相手のアドレスを記録するため、
クライアントは自分のアドレスを偽装できません。

`audit.trusted_proxy_cidrs` には自分のリバースプロキシだけを指定し、クライアントのネットワークは決して指定しないで
ください。信頼された範囲にいるクライアントは、`X-Forwarded-For` に任意のアドレスを入れられます。

記録されるのは、`X-Forwarded-For` の中で信頼されたプロキシではない最も右のアドレスです。
`X-Real-IP` は `X-Forwarded-For` がないときだけ、しかも値が 1 つのときだけ使われます。

## 保存 {#storage}

イベントは Semaphore のデータベースに保存され、削除されることはありません。このバージョンには保存期間の設定が
ありません。インストールでのログインと変更の数に合わせて、データベースのサイズを計画してください。

## コンプライアンスとの対応 {#compliance}

Semaphore はこれらの管理策に必要なイベントを記録します。Semaphore だけでインストールが準拠状態になるわけでは
ありません。

| 要件 | 対応するイベント | 状況 |
| --- | --- | --- |
| PCI DSS 10.2.1.1 機密データへのアクセス (相当: シークレット) | `iam.mfa/view_qr` | 利用可能 |
| PCI DSS 10.2.1.1 機密データへのアクセス (相当: シークレット) | `resource.project_backup/export` | 予定 |
| PCI DSS 10.2.1.2 管理者による操作 / ISO 27002 8.15 特権の使用 | `iam.*`, `system.*` | 利用可能 |
| PCI DSS 10.2.1.2 管理者による操作 / ISO 27002 8.15 特権の使用 | `resource.*`, `secret.*` | 予定 |
| PCI DSS 10.2.1.2 管理者による操作 / ISO 27002 8.15 特権の使用 | `runner.*`, `task.control`, `task.history` | 予定 |
| PCI DSS 10.2.1.3 監査ログへのアクセス | 該当なし: Semaphore は監査証跡へのアクセスを提供しません。 | — |
| PCI DSS 10.2.1.4 無効な論理アクセスの試み / ISO 拒否されたアクセスの試み | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | 利用可能 |
| PCI DSS 10.2.1.4 無効な論理アクセスの試み / ISO 拒否されたアクセスの試み | `runner.lifecycle/register` failure | 予定 |
| PCI DSS 10.2.1.5 識別および認証の資格情報の変更 | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | 利用可能 |
| PCI DSS 10.2.1.5 識別および認証の資格情報の変更 | `runner.credential` | 予定 |
| PCI DSS 10.2.1.6 監査ログの開始、停止、一時停止 / ISO セキュリティシステムの有効化 | `audit.lifecycle/start`。停止はその前の空白として現れます | 利用可能 |
| PCI DSS 10.2.1.7 システムレベルのオブジェクトの作成と削除 | `resource.*` create/delete | 予定 |
| PCI DSS 10.2.1.7 システムレベルのオブジェクトの作成と削除 | `runner.lifecycle` create/delete | 予定 |
| PCI DSS 10.2.2 必須フィールド | `actor`、`event_code` と `action`、`timestamp`、`outcome`、`source` または `node_id`、`target` または `scope` | 利用可能 |
| PCI DSS 10.3.3 中央ログサーバーへの迅速なバックアップ | Syslog+TLS による SIEM へのエクスポート | 利用可能 |
| PCI DSS 10.3.3 中央ログサーバーへの迅速なバックアップ | Splunk HEC による SIEM へのエクスポート | 予定 |

予定のイベントは、このバージョンでは記録されません。

## このバージョンで記録されないもの {#not-recorded}

- サーバー上で `semaphore` コマンドを使って行った操作 (`user add`、`user token` など)。これらはデータベースを直接
  変更し、実行できる人は監査テーブルも変更できます。
- ライセンスの削除、アプリの実行時設定、HA のタスク状態のクリア、Terraform インベントリのエイリアス、
  ワークフローの実行、プロジェクトへの招待。これらにはまだ監査イベントがありません。

## SIEM へのエクスポート <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro は TLS 付きの Syslog で監査ログを SIEM に送信します。SIEM ごとにログ内の位置を保持するため、
SIEM に到達できない間に記録されたイベントは、SIEM が復帰したときに送信されます。手順については
[監査ログを SIEM に送信する](/admin-guide/audit-log-siem)を参照してください。

## 次のステップ {#whats-next}

- [監査ログを SIEM に送信する](/admin-guide/audit-log-siem) — Syslog+TLS でイベントをエクスポートします。
- [監査イベント](/reference/audit-events) — 各イベントの結果、理由、メタデータ。
- [設定](/reference/configuration) — すべての `audit.*` オプション。
