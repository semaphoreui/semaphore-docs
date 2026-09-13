---
title: "高可用性"
---

# 高可用性 <Enterprise />

:::info
高可用性は **Semaphore Enterprise** エディションで利用できます。
:::

Semaphore UI は、ロードバランサーの背後で複数のインスタンスを同時に稼働させるアクティブ-アクティブ構成の高可用性 (HA) デプロイメントをサポートしています。各インスタンスは、UI リクエスト、API 呼び出し、スケジュールされたジョブ、タスク実行のすべてを処理できます。1 つのインスタンスに障害が発生しても、残りのノードが中断なく動作を継続します。

## アーキテクチャ {#architecture}

一般的なアクティブ-アクティブ構成のデプロイメントは、次のコンポーネントで構成されます。

**ロードバランサー** — ユーザーはロードバランサー (NGINX、HAProxy、クラウドのロードバランサーなど) を経由して接続します。ロードバランサーは、HTTP および WebSocket トラフィックを利用可能な Semaphore ノードに分散します。

**Semaphore ノード** — 各ノードは Semaphore UI の同一のインスタンスを実行します。どのノードでもユーザーリクエストの受信、自動化ジョブの開始、スケジュールされたタスクの処理、リアルタイム更新の送信が可能です。すべてのノードは対等であり、プライマリノードやスタンバイノードは存在しません。

**共有データベース** — すべてのインスタンスは共有の PostgreSQL または MySQL データベースに接続します。データベースは、プロジェクト、テンプレート、インベントリ、スケジュール、タスク履歴、ユーザーアカウント、RBAC 設定に関する唯一の信頼できる情報源 (single source of truth) として機能します。

:::warning
SQLite と BoltDB は HA デプロイメントではサポートされていません。PostgreSQL または MySQL を使用してください。
:::

**Redis** — Redis は、複数のノードを 1 つのシステムとして動作させるための調整レイヤーを提供します。Redis には次の 3 つの役割があります。

* **分散ロック** により、特定のジョブを同時に実行するインスタンスが 1 つだけになることを保証し、タスクの重複実行を防ぎます。
* **共有タスクキューの状態** により、タスクキューが維持され、ジョブは必ず 1 つのワーカーだけに取得されます。すべてのノードが同じキューを参照し、実行を調整します。
* **Pub/Sub メッセージング** により、ノードはタスクの更新、クラスター通知、キャッシュの無効化、UI 状態の変更などのイベントをブロードキャストできます。これにより、すべてのノードがリアルタイムで同期されます。

## 前提条件 {#prerequisites}

HA を設定する前に、次のものが必要です。

* **Semaphore Enterprise** のサブスクリプションキー。
* すべてのノードからアクセスできる共有の **PostgreSQL** または **MySQL** データベース。
* すべてのノードからアクセスできる **Redis** インスタンス (または Redis クラスター)。
* HTTP および WebSocket トラフィックをサポートする **ロードバランサー**。
* Semaphore インスタンスを実行する 2 台以上のサーバー。

すべての Semaphore ノードは、同じデータベース、同じ Redis インスタンス、同じ設定を使用する必要があります (ノードごとに一意でなければならない `ha.node_id` を除く)。

## 設定 {#configuration}

各ノードの `config.json` に `ha` ブロックを追加して HA を有効にします。

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

各ノードには一意の `ha.node_id` が必要です。それ以外の設定はすべてのノードで同一にしてください。

### 環境変数 {#environment-variables}

環境変数を使用して HA を設定することもできます。

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### 設定リファレンス {#configuration-reference}

| 設定ファイルのオプション | 環境変数 | 説明 |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | 高可用性モードを有効にします。 |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | このノードの一意の識別子。 |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Redis サーバーのアドレス (例: `localhost:6379`)。 |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Redis データベース番号。 |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Redis サーバーのパスワード。 |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Redis サーバーのユーザー名。 |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Redis 接続で TLS を有効にします。 |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Redis の TLS 証明書検証をスキップします。 |

利用可能なオプションの完全な一覧については、[設定](/admin-guide/configuration)を参照してください。

## ロードバランサー {#load-balancer}

トラフィックを分散するために、Semaphore ノードの前段にロードバランサーを配置します。UI のリアルタイム更新のため、ロードバランサーは **WebSocket 接続** をサポートしている必要があります。

### NGINX の例 {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

NGINX の設定の詳細については、[リバースプロキシ](/admin-guide/reverse-proxy/nginx)を参照してください。

## ジョブ実行の仕組み {#how-job-execution-works}

マルチノード構成では、タスクの実行は次のような調整されたフローに従います。

1. **ユーザーがタスクを起動します。** ユーザーが UI または API からジョブを開始します。リクエストはどの Semaphore ノードにも届く可能性があります。
2. **タスクのメタデータが保存されます。** リクエストを受け取ったノードがタスクのメタデータをデータベースに書き込み、Redis 経由で処理を通知します。
3. **ノードがタスクを取得します。** 利用可能なノードのいずれかが Redis からタスクを取得し、分散ロックを獲得して、データベース上で実行中としてマークします。
4. **タスクが実行されます。** そのノードがタスクをローカルで実行するか、[リモートランナー](/admin-guide/runners)に委譲します。進捗とログはデータベースに書き戻されます。
5. **結果がブロードキャストされます。** タスクの更新は Redis Pub/Sub を通じて伝播され、すべてのノードと接続中の UI クライアントが同期された状態を保ちます。

## ランナーによるスケーリング {#scaling-with-runners}

HA により、タスク実行の水平スケーリングも可能になります。ジョブを Semaphore ノード自身だけで実行するのではなく、複数の[ランナー](/admin-guide/runners)に実行を委譲できます。これにより、次のことが可能になります。

* インフラストラクチャ全体にワークロードを分散する。
* Web/API レイヤーとは独立して自動化処理能力をスケールする。
* 実行環境を分離して影響範囲を限定する。
* 多数のノードでタスクを並列実行する。

セットアップ手順については、[ランナー](/admin-guide/runners)を参照してください。

## メリット {#benefits}

* **信頼性の向上** — 1 つのインスタンスに障害が発生しても、他のインスタンスがトラフィックの処理とジョブの実行を継続します。
* **ダウンタイムなしのメンテナンス** — システムを停止することなく、ノードを個別に更新・再起動できます。
* **水平スケーラビリティ** — ロードバランサーの背後に Semaphore ノードを追加して処理能力を増やせます。
* **プライマリノードへの依存なし** — すべてのノードが対等であるため、複雑なフェイルオーバー機構が不要です。
* **一貫したクラスター状態** — 共有データベースと Redis による調整により、すべてのインスタンスが同期された状態を保ちます。

## FAQ {#faq}

### アクティブ-アクティブ構成の高可用性とは何ですか? {#what-is-active-active-high-availability}

アクティブ-アクティブ構成の HA とは、複数のアプリケーションインスタンスが同時に稼働し、そのすべてがリクエストを処理する構成です。プライマリノードは存在せず、どのインスタンスでもトラフィックの処理とジョブの実行が可能です。

### Semaphore は HA モードでなぜ Redis を使用するのですか? {#why-does-semaphore-use-redis-in-ha-mode}

Redis はインスタンス間の調整レイヤーとして機能します。分散ロック、共有タスクキューの状態、Pub/Sub メッセージングを提供し、複数のノードが同じジョブを同時に実行しないことを保証します。

### HA デプロイメントにはどのデータベースを使用すべきですか? {#what-database-should-i-use-for-ha-deployments}

Semaphore は共有データベースとして PostgreSQL と MySQL をサポートしています。SQLite と BoltDB は複数プロセスからの同時アクセスをサポートしていないため、HA モードでは使用できません。

### Semaphore ノードの 1 つに障害が発生するとどうなりますか? {#what-happens-if-one-semaphore-node-fails}

ロードバランサーがトラフィックを残りのノードにルーティングします。実行中のジョブは他のインスタンスで継続され、新しいジョブは利用可能な任意のノードによって取得されます。

### 水平スケーリングは可能ですか? {#can-i-scale-horizontally}

はい。ロードバランサーの背後に Semaphore ノードを追加して Web/API の処理能力を増やし、[ランナー](/admin-guide/runners)を追加してタスク実行の処理能力を増やすことができます。
