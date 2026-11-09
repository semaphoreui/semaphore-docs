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
* すべてのノードからアクセスできる **Redis** サーバー、または **Redis Sentinel** 構成。Redis Cluster はサポートされていません。
* HTTP および WebSocket トラフィックをサポートする **ロードバランサー**。
* Semaphore インスタンスを実行する 2 台以上のサーバー。

すべての Semaphore ノードは、同じデータベース、同じ Redis バックエンド、同じ設定を使用する必要があります (ノードごとに一意でなければならない `ha.node_id` を除く)。

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

### Redis Sentinel {#redis-sentinel}

Redis サーバー自体の障害に耐えるには、単一のアドレスではなく [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) 構成をクラスターの接続先として指定します。`ha.engine` を `redis_sentinel` に設定し、Sentinel の構成を `ha.redis_sentinel` に記述します。

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

各ノードは現在のマスターを Sentinel に問い合わせ、再起動なしでフェイルオーバーに追従します。マスターが切り替わる間に実行中だったタスクはそのまま実行を継続し、新しいタスク、スケジュール、リアルタイム更新は昇格したレプリカ上で継続されます。

環境変数を使用した同じ構成 (Sentinel の一覧は JSON 配列です)。

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

注意事項:

* `ha.engine` によって、どちらのブロックが読み込まれるかが決まります。`redis` (デフォルト) では `ha.redis`、`redis_sentinel` では `ha.redis_sentinel` が読み込まれます。もう一方のブロックが存在していても無視され、起動時に警告がログに記録されます。
* `redis_sentinel` を使用する場合は、`master_name` と `addrs` 内の少なくとも 1 つのアドレスが必須です。これらがないとノードは起動しません。
* `user` と `pass` は Redis データノードに対する認証に使用されます。Sentinel 自体が認証を必要とする場合 (`sentinel.conf` の `requirepass`) は、`sentinel_user` と `sentinel_pass` も設定してください。
* `tls` と `tls_skip_verify` は、Sentinel と Redis データノードの両方の接続に適用されます。

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
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Redis バックエンド: `redis` (単一サーバー、デフォルト) または `redis_sentinel`。 |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Sentinel で設定された、監視対象マスターの名前。 |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Sentinel のアドレス (`host:port`)。環境変数では JSON 配列。 |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Sentinel ノード自体のユーザー名。 |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Sentinel ノード自体のパスワード。 |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | データノード上の Redis データベース番号。 |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Redis データノードのユーザー名。 |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Redis データノードのパスワード。 |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Sentinel と Redis の接続で TLS を有効にします。 |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Sentinel と Redis の接続の TLS 証明書検証をスキップします。 |

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

## HA の内部動作 {#under-the-hood}

Semaphore のノードが互いに直接通信することはありません。ノード間で合意が必要な情報はすべて Redis を経由します。どのノードが稼働しているか、どのタスクがどのノードに属するか、どのノードがスケジュールを起動するか、どの UI メッセージを中継するか、といった情報です。この状態の各要素は有効期限付きの少数の Redis キーとして保持されるため、クラッシュしたノードが何かを長く残し続けることはありません。永続的なデータ (タスク、テンプレート、ログ、ランナー) は常にデータベースに保存され、Redis は調整用の状態だけを保持します。

すべてのキーは固定のプレフィックス `ha:` と `tasks:` を使用します。これらは設定で変更できないため、1 台の Redis サーバーを共有する 2 つの Semaphore クラスターは、異なるデータベース番号 (`ha.redis.db`) を使用する必要があります。

### ノードレジストリ {#node-registry}

各ノードは起動時に自身を登録し、その後 10 秒ごとにレコードを更新します。レコードは 30 秒で期限切れになるため、更新を停止したノードは最長でも 30 秒後には停止したものと見なされます。正常なシャットダウン時には、ノードは自身のレコードを直ちに削除します。

| キー | 型 | 用途 |
| --- | --- | --- |
| `ha:node:<node_id>` | string、JSON | 1 つのノードのハートビート: `node_id`、`started_at`、`version`、`last_beat`。最後の更新から 30 秒後に期限切れになります。 |
| `ha:nodes` | set | 登録されているすべてのノードの ID。ハートビートキーが期限切れになったメンバーは、他のノードによって削除されます。 |

ノードレジストリは、クラスターダッシュボードに表示される内容であり、タスクの所有者がまだ稼働しているかを判断するためにオーファンクリーナー (後述) が参照する情報でもあります。

### タスクキューと実行中のタスク {#task-queue}

タスクキューは共有されているため、あるノードで開始されたタスクを、他の任意のノードがディスパッチ、監視、完了処理できます。Redis に保存されるのはタスク ID といくつかの一時的なフィールドだけで、タスク自体は必要とするノードがデータベースから読み込みます。

| キー | 型 | 用途 |
| --- | --- | --- |
| `tasks:queue` | list | ディスパッチ待ちのタスクの ID (順序付き)。 |
| `tasks:claim:<task_id>` | string | タスクを所有するノードの ID。キューからの削除と同時にアトミックに書き込まれるため、タスクは必ず 1 つのノードだけに取得されます。5 分後に期限切れになり、所有者が 1 分ごとに更新します。 |
| `tasks:running` | set | 現在実行中のタスクの ID。 |
| `tasks:active:<project_id>` | set | プロジェクト内でアクティブ (待機中または実行中) なタスクの ID。プロジェクトごとの同時実行数の制限に使用されます。 |
| `tasks:task_project` | hash | `task_id` → `project_id`。どのノードでもデータベースからタスクを読み込めるようにするためのものです。 |
| `tasks:aliases` | hash | エイリアスで参照されるタスクの `alias` → `task_id`。 |
| `tasks:runtime:<task_id>` | hash | ランナー ID や起動したユーザーなど、タスクの実行中に変化するフィールド。 |
| `tasks:finalize:<task_id>` | string | リモートランナーで実行されたタスクの最終結果を書き込むノードが取得するロック。5 分後に期限切れになります。 |

`tasks:task_project`、`tasks:aliases`、`tasks:runtime:*` のエントリはタスクの完了時に削除され、さらに安全策として 7 日後に期限切れになります。

ノードは 1 回のアトミックな操作でキューからタスクを取り出します。タスクがまだキューにあることを確認し、クレームを書き込み、キューからタスクを削除し、実行中セットに追加します。2 つのノードが同時に試みた場合、成功するのは 1 つだけです。

**オーファンクリーナー。** 各ノードは 1 分に 1 回、所有者が停止している実行中のタスク、つまりクレームが期限切れになっているか所有者のハートビートが消えているタスクを確認します。データベース上で既に完了となっているタスクは、Redis から単に削除されます。まだランナーに渡されていないタスクはキューに戻され、稼働中のノードがディスパッチします。既にランナー上で実行中のタスクはそのままにされます。ランナーは処理を続け、データベース上で完了と表示された時点でタスクがクリーンアップされます。

### ロック {#locks}

ロックは `SET NX` で作成される単一のキーです。キーの作成に成功したノードがロックを保持します。すべてのロックには有効期限があり、長時間保持されるロックは所有者によって更新されるため、クラッシュしたノードのロックは自動的に解放されます。

| キー | 有効期限 | 用途 |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 秒 | スケジュールごと、1 分ごとに 1 つのロック。これを作成したノードがスケジュールを起動し、他のノードはスキップします。 |
| `ha:wf:lock:<project_id>:<run_id>` | 30 秒、10 秒ごとに更新 | 特定のワークフロー実行を進行させるノードは同時に 1 つだけです。 |
| `ha:wf:start:<project_id>:<template_id>` | 10 秒 | 新しいワークフロー実行を作成する間の短いロック。2 つのノードが同じワークフローを二重に開始しないようにします。 |
| `ha:audit:export:<destination_id>` | 30 秒、10 秒ごとに更新 | 特定の送信先に監査イベントをエクスポートするノードは 1 つだけです。Redis が利用できない場合はどのノードもエクスポートしないため、イベントが二重に送信されることはありません。 |

スケジュールとワークフローのロックはフェイルオープンです。Redis に到達できない場合、ノードは処理をスキップせずに続行し、データベースの条件付き更新によって結果の正しさが保たれます。監査エクスポートのリースはフェイルクローズです。重複したエクスポートは取り消せないためです。

### Pub/Sub チャンネル {#pubsub-channels}

| チャンネル | 用途 |
| --- | --- |
| `ha:ws:broadcast` | UI 向けの WebSocket メッセージ。ノードは自身に接続しているブラウザーにメッセージを配信するとともに、ここに発行します。他のノードはそれを自身のブラウザーに中継します。 |
| `tasks:events` | タスクキューと実行中セットの変更、ランタイムフィールドの更新、強制停止リクエスト。ノードはこれらのイベントを使用して、メモリ上のキューの状態を最新に保ち、他のノードから停止を要求されたタスクを停止します。 |

メッセージには送信元ノードの ID が含まれているため、ノードは自身のメッセージを無視します。

### ランナーキャッシュのキー {#runner-cache-keys}

`ha:runner:*` キーは、次のセクションで説明する[ランナーキャッシュ](#runner-cache)に属します。

## ランナーキャッシュ {#runner-cache}

[ランナー](/admin-guide/runners)がサーバーに送信するすべてのリクエストにはトークンが含まれており、サーバーは他の処理を行う前に、そのトークンをランナーのレコードに変換する必要があります。ランナーは数秒ごとにポーリングを行い、ジョブの実行中は 1 秒ごとに進捗を報告するため、キャッシュがなければこれらのリクエストのすべてにデータベースクエリが必要になります。ランナーキャッシュは、その大部分にメモリから応答します。

単一ノードの場合、キャッシュは自身のメモリ上に保持されます。HA モードではそれでは不十分です。ノード A でランナーを編集した場合、ノード B が古いレコードを返し続けてはなりません。そのため HA モードではキャッシュは Redis に置かれ、すべてのノードで共有されます。どのノードを経由して行われた変更も、すべてのノードから即座に見えるようになります。

:::note
このキャッシュは、ランナーページの **キャッシュをクリア** 操作とは別のものです。その操作は、ランナー自身にそのマシン上の作業ディレクトリを削除するよう要求するものです。
:::

### キャッシュされる内容と期間 {#runner-cache-ttl}

キャッシュされる値は、タグとトークンを除いたランナーのレコードです。トークンが Redis に到達することはありません。キーはトークンの SHA-256 ハッシュから導出され、レコードが保存される前にトークンのフィールドは空にされます。

エントリの有効期間は最長 30 秒です。実際にはそれよりもはるかに早く破棄されます。Semaphore を通じて行われたすべての変更が、キャッシュを即座に無効化するためです。

* ランナーの作成、更新、削除、再登録、またはプロジェクトの削除は、すべてのノード上の **すべての** キャッシュ済みランナーを破棄します。
* ランナーのハートビートは **そのランナーの** エントリだけを破棄するため、他のエントリに影響を与えることなく、保存されている「最終確認」時刻が最新に保たれます。ハートビートは、`runners.offline_timeout_sec` の 3 分の 1 (上限 45 秒) の間隔につき最大 1 回書き込まれます。デフォルトのタイムアウトである 120 秒では、40 秒ごとになります。

30 秒の有効期限が意味を持つのは、Semaphore を介さずに行われた変更、たとえば `runner` テーブルを直接編集した場合やバックアップを復元した場合だけです。

### 古い書き込みの防止方法 {#runner-cache-generation}

キャッシュにヒットしなかった検索は、データベースからランナーを読み込んでから保存します。この 2 つのステップの間に、別のノードがランナーを変更する可能性があります。検索が変更前に読み取った内容を決してキャッシュしないように、キャッシュは無効化のたびに増加するカウンターを保持しています。検索はデータベースにアクセスする前に見たカウンターの値を記憶し、その間にカウンターが進んでいた場合、保存は拒否されます。各ステップは Redis 上で 1 つの Lua スクリプトとして実行されるため、カウンターとエントリは一緒に読み書きされます。

### Redis キー {#runner-cache-redis-keys}

| キー | 型 | 用途 |
| --- | --- | --- |
| `ha:runner:gen` | string、整数 | カウンター。キャッシュ全体の無効化でも単一ランナーの無効化でも、無効化のたびに 1 ずつ増加します。 |
| `ha:runner:inv` | string、整数 | 最後に全体の無効化が行われた時点のカウンター値。すべてのエントリキーの一部になっているため、全体の無効化によって既存のすべてのエントリが一度に到達不能になります。その後、それらは自然に期限切れになります。 |
| `ha:runner:token:<inv>:<sha256(token)>` | string、バイナリ | キャッシュされたランナーのレコード。30 秒後に期限切れになります。 |
| `ha:runner:forgot:<sha256(token)>` | string、整数 | このランナーの最後のハートビート時点のカウンター値。ハートビートより前に開始された検索は、ハートビート前のレコードを保存できません。30 秒後に期限切れになります。 |

クラスターダッシュボードは、`ha:runner:token:*` キーの数をランナーキャッシュのサイズとして表示します。

### Redis に問題が発生した場合の動作 {#runner-cache-failures}

キャッシュが原因でランナーのリクエストが失敗することはありません。すべてのキャッシュ操作は 500 ミリ秒に制限されています。Redis が遅いか到達できない場合、検索はミスとして扱われてデータベースにアクセスし、何も保存されません。注意すべき唯一のケースは、ランナーが変更された瞬間に Redis が停止していて無効化が失敗した場合です。このとき他のノードは、エントリが期限切れになるまで、最長で 30 秒後まで古いレコードを返す可能性があります。この失敗はエラーレベルでログに記録されます。

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

### Redis に障害が発生するとどうなりますか? {#what-happens-if-redis-fails}

単一の Redis サーバー (`ha.engine: redis`) を使用している場合、Redis が復旧するまでノードは相互に調整できません。[Redis Sentinel](#redis-sentinel) を使用している場合は、Sentinel がレプリカを昇格させ、すべての Semaphore ノードが再起動なしで、通常は数秒以内に自動的に切り替わります。

### Semaphore ノードの 1 つに障害が発生するとどうなりますか? {#what-happens-if-one-semaphore-node-fails}

ロードバランサーがトラフィックを残りのノードにルーティングします。実行中のジョブは他のインスタンスで継続され、新しいジョブは利用可能な任意のノードによって取得されます。

### 水平スケーリングは可能ですか? {#can-i-scale-horizontally}

はい。ロードバランサーの背後に Semaphore ノードを追加して Web/API の処理能力を増やし、[ランナー](/admin-guide/runners)を追加してタスク実行の処理能力を増やすことができます。
