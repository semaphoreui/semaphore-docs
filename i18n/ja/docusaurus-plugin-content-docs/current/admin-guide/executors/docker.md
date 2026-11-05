---
title: Docker エグゼキューター
description: ランナーのすべてのタスクを、ローカルまたはリモートのデーモン上の新しい Docker コンテナーで実行します。設定例、セキュリティ上の注意、トラブルシューティングを含みます。
sidebar_custom_props:
  edition: pro
---

# Docker エグゼキューター <FeatureState feature="docker-executor" />

Docker エグゼキューターを使うと、ランナーは各タスクを新しいコンテナーで起動し、タスクの
終了時にそのコンテナーを削除します。ランナーは API を通じて Docker デーモンと通信します。
デーモンは同じホスト上でも、TLS 経由のリモートでもかまいません。

コンテナータスクの実行の流れ、コンテナー内にあるもの、対応していない機能は
[エグゼキューター](./#how-a-container-task-runs)で説明しています。このページでは Docker のセットアップを扱います。

## 始める前に {#before-you-begin}

- Pro または Enterprise ライセンスを持つ Semaphore サーバー。
- サーバーに登録されたランナー。[ランナー](/admin-guide/runners)を参照してください。
  `semaphoreui/runner` イメージまたは公式の `semaphore` バイナリを使用します。
- ランナーから到達できる Docker Engine と、それを使う権限。`docker` グループへの所属、
  マウントされたソケットへのアクセス、または TLS クライアント証明書のいずれかです。
- デーモンが `semaphoreui/job` と `semaphoreui/helper`（または独自のイメージ）を pull できること。

## クイックスタート {#quick-start}

ランナーの設定にエグゼキューターを追加し、ランナーを再起動します。

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

他のオプションを指定しない場合、ランナーはローカルソケット（`DOCKER_HOST` が設定されていればそれ、
なければ `unix:///var/run/docker.sock`）、ビルドイメージ `semaphoreui/job:latest`、
ネットワーク `bridge` を使用します。

このランナーに割り当てられたタスクを実行します。タスクログは次のように始まります。

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

タスクの実行中は、そのコンテナーを確認できます。

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## 例 {#examples}

### Docker ホスト上のランナーバイナリ {#runner-binary-on-a-docker-host}

ランナーは Docker と同じホスト上で systemd サービスとして動作します。ランナーのユーザーに
ソケットへのアクセス権を与えます。

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### ホストのソケットを使うコンテナー内のランナー {#runner-in-a-container-with-the-host-socket}

ランナーのコンテナーは、マウントされたソケットを通じてホストのデーモンを操作します。タスクの
コンテナーはランナーの中にネストされるのではなく、ランナーと並んで動作します。ランナーの
イメージは UID `1001` で動作するため、ソケットを所有するグループに追加します。

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

`semaphore-runner-data` ボリュームには登録時に発行されたランナートークンが保存されるため、
再起動後にランナーが再登録されることはありません。

Docker Compose では次のようになります。

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

シークレットはランナーのファイルシステムを経由せず、デーモン上の名前付きボリュームを通じて
タスクに渡されます。そのため、ランナーとホストの間で他のパスを共有する必要はありません。

### TLS 経由のリモート Docker デーモン {#remote-docker-daemon-over-tls}

ランナーとデーモンが別のマシンにある場合です。デーモンのポートを相互 TLS で保護し
（[Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/) を参照）、
クライアント用のファイルをランナーに置きます。

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

`cert_path` を設定すると、ランナーはデーモンの証明書を `ca.pem` で検証し、`cert.pem` と
`key.pem` で認証します。ファイル名は固定です。

:::warning
`cert_path` がない場合、`tcp://` 接続は平文の HTTP になり、そのポートに到達できる人は誰でも
デーモンを操作できます。`tls_verify` だけでは TLS は有効になりません（⚠️ 2026-11-05：このオプションは
読み込まれますが適用されません）。リモートのデーモンには必ず `cert_path` を設定してください。
:::

### 内部サービス用のネットワーク {#a-network-for-internal-services}

既定では、タスクのコンテナーは `bridge` に参加します。タスクからコンテナー名でサービスに
到達できるようにしたり、タスクを専用のネットワークに隔離したりするには、ネットワークを作成して設定します。

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` には、Docker が理解できる任意のネットワークモードを指定できます。ネットワーク名、
`bridge`、`host`、`none` です。クローン用のコンテナーも同じネットワークに参加するため、
`none` ではリポジトリをクローンできません。

### プライベートレジストリのイメージ {#images-from-a-private-registry}

エグゼキューターはレジストリの認証情報なしでイメージを pull します。プライベートイメージを使う場合は、
デーモンのホストでログインしてイメージを pull し、再度 pull しないプルポリシーを使います。

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

`if-not-present` では `latest` ではなくバージョンタグを使用してください。デーモン上にすでに
あるタグは更新されません。`never` を指定すると、イメージがない場合は pull を試みずにタスクが失敗します。

### ブロック全体を 1 つの変数で指定する {#the-whole-block-as-one-variable}

環境変数だけで設定するデプロイでは、エグゼキューターのブロックを JSON として渡します。

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## 設定リファレンス {#configuration-reference}

すべてのオプションは、ランナーの設定の `runner.executor.docker` にあります。

| オプション | 環境変数 | 既定値 | 説明 |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`、次にプラットフォームのソケット | デーモンのアドレス：`unix:///path`、`tcp://host:port`、`npipe:////./pipe/name`。 |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | 相互 TLS 用の `ca.pem`、`cert.pem`、`key.pem` があるディレクトリ。設定すると TLS が有効になります。 |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | まだ適用されません。`cert_path` を使用してください。 |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | ビルドイメージ。テンプレートの **エグゼキューターのイメージ** で上書きされます。 |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | クローン用コンテナーとシークレットボリュームへの書き込みに使うイメージ。 |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | クローン用コンテナーとビルドコンテナーのネットワーク。 |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`、`if-not-present`、`never`。不明な値は `if-not-present` として扱われます。 |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | 制限なし | コンテナーごとの CPU 数。`docker run --cpus` と同じです。小数も指定できます：`0.5`。 |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | 制限なし | コンテナーごとのメモリー：バイト数、または `k`、`m`、`g` 付き（`512m`、`2g`）。解析できない値は制限なしになります。 |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | コンテナーを `--privileged` で実行します。 |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | **Stop** の後、`docker stop` がコンテナーを強制終了するまで待つ秒数。 |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | 使用されません。エグゼキューターはポーリングせずにコンテナーの終了を待ちます。 |

制限、ネットワーク、`privileged` は、クローン用コンテナーとビルドコンテナーの両方に適用されます。

## 停止とクリーンアップ {#stop-and-clean-up}

UI の **Stop** は実行中のコンテナーに `docker stop` を送り、最大 `cleanup_grace_seconds` 待ってから、
コンテナーと両方のボリュームを削除します。

タスクの実行中にランナーのプロセスが強制終了された場合、そのコンテナーとボリュームはデーモン上に残ります。
ランナーは次回の起動時にそれらを回収しません。エグゼキューターが作成するものにはすべて
`com.semaphoreui.runner=semaphore` ラベルが付き、`com.semaphoreui.task-id` にタスク ID が入ります。
このデーモンでタスクが実行されていないときに、残ったものを削除してください。

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## トラブルシューティング {#troubleshooting}

| メッセージ | 原因と対処 |
|---|---|
| `docker executor is only available in the proprietary build`（ランナーのログ） | ランナーが Community ビルドです。`semaphoreui/runner` または公式のバイナリを使用してください。 |
| `docker executor: daemon not reachable` | `host` が誤っている、デーモンが停止している、またはランナーのユーザーがソケットを開けません（`permission denied`）。ランナーのユーザーで `docker -H <host> info` を実行して確認し、ユーザーをソケットのグループに追加してください。 |
| `pull image ...: ... unauthorized` または `not found` | イメージがプライベートか、名前が誤っています。先にデーモンのホストで pull してください。[プライベートレジストリ](#images-from-a-private-registry)を参照してください。 |
| `git clone exited with status 128` | リポジトリの URL、ブランチ、SSH キーが誤っているか、ネットワークが Git ホストへの通信を遮断しています。この行の上にあるクローンの出力に Git のエラーが表示されます。 |
| `interpreter python3 not found in image; set a runner image that provides it` | ビルドイメージにアプリのバイナリがありません。ランナーまたはテンプレートの **エグゼキューターのイメージ** で、それを含むイメージを設定してください。 |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | イメージに OpenSSH クライアントがなく、Ansible がインベントリーのキーを使えません。`openssh-client` をインストールしてください。 |
| `/workspace` 配下での `Permission denied` | カスタムイメージが `/workspace` に書き込めないユーザーで動作しています。[カスタムイメージのビルド](./#build-a-custom-image)を参照してください。 |
| `build container exited with status N` | アプリが終了コード `N` で失敗しました。理由は上のログにあります。 |
| `inventory login_password authentication is not supported` | [制限事項](./#limitations)を参照してください。 |

## 関連ページ {#related-pages}

- [エグゼキューター](/admin-guide/executors)：コンテナータスクの実行の流れ、イメージ、制限事項。
- [Kubernetes エグゼキューター](./kubernetes)：同じ仕組みをクラスターで。
- [ランナー](/admin-guide/runners)：ランナーの登録と起動。
- [エグゼキューターのイメージ](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)：特定のテンプレートで別のイメージを使う。
