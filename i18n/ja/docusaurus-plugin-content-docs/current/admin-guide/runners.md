# ランナー

ランナーを使用すると、Semaphore UI とは別のサーバーでタスクを実行できます。

Semaphore のランナーは、GitLab や GitHub Actions のランナーと同じ原理で動作します。

- 別のサーバーで、Semaphore サーバーのアドレスと認証トークンを指定してランナーを起動します。
- ランナーは Semaphore に接続し、タスクを受け付ける準備ができたことを通知します。
- 新しいタスクが発生すると、Semaphore は必要な情報をすべてランナーに渡します。ランナーはリポジトリをクローンし、Ansible、Terraform、PowerShell などを実行します。
- ランナーはタスクの実行結果を Semaphore に送り返します。

エンドユーザーにとっては、ランナーの有無にかかわらず、Semaphore の使い方は同じです。

ランナーが定義されていない場合は、Semaphore UI サーバー自身がランナーとして動作します。すべてのタスクは Semaphore UI サーバーのコンテキスト内で実行され、ファイルシステムにアクセスできます。

ランナーを使用すると、次の利点があります。
- タスクをより安全に実行できます。たとえば、ランナーを閉じたサブネット内や隔離された Docker コンテナ内に配置できます。
- 複数のサーバーに負荷を分散できます。複数のランナーを起動すると、タスクはそれらの間でランダムに分配されます。

## セットアップ {#set-up}

### サーバーのセットアップ {#set-up-a-server}

ランナーを使用できるようにサーバーをセットアップするには、Semaphore サーバーの設定に次のオプションを追加します。

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

または、環境変数を使用します。

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### ランナーのセットアップ {#setup-a-runner}

ランナーをセットアップするには、次のコマンドを使用します。

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

このコマンドは `/path/to/your/config/file.json` に設定ファイルを作成します。

ただし、このコマンドを使用する前に、ランナーがサーバーにどのように登録されるかを理解しておく必要があります。

### サーバーへのランナーの登録 {#registering-the-runner-on-the-server}

Semaphore サーバーにランナーを登録する方法は 2 つあります。
1) Web インターフェースまたは API から追加する。
2) コマンドラインで `semaphore runner register` コマンドを使用する。

#### Web UI からランナーを追加する {#adding-the-runner-via-the-web-ui}

![ランナーの画像](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### CLI から登録する {#registering-via-cli}

この方法でランナーを登録するには、Semaphore サーバーの設定ファイルに `runner_registration_token` オプションを追加する必要があります。このオプションには任意の文字列を設定します。セキュリティ上の問題を避けるため、十分に複雑な文字列を選んでください。

`semaphore runner setup` コマンドでランナートークンを持っているかどうか尋ねられたら、No と答えます。その後、次のコマンドでランナーを登録します。

`semaphore runner register --config /path/to/your/config/file.json`

または

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### 設定ファイル {#configuration-file}

`semaphore runner setup` コマンドを実行すると、次のような設定ファイルが作成されます。

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

このファイルは、`semaphore runner setup` を再度実行しなくても手動で編集できます。

ランナーを再登録するには、`semaphore runner register` コマンドを使用します。これにより、設定で指定されたファイル内のトークンが上書きされます。

## ランナーの実行 {#running-the-runner}

次のコマンドでランナーを起動できます。

```
semaphore runner start --config /path/to/your/config/file.json
```

これでランナーはタスクを実行する準備ができました。

### Docker でランナーを実行する {#running-the-runner-in-docker}

`semaphoreui/runner` イメージはランナーを自動的に起動します。サーバーの URL と登録トークンは環境変数で渡します。

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

playbook で追加の Python パッケージが必要な場合は、`requirements.txt` を `/etc/semaphore/requirements.txt` にマウントします。コンテナは起動のたびに、ランナーがサーバーに接続する前に `pip3` でこれをインストールします。

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

パッケージのインストール先や失敗時の扱いの詳細については、[追加の Python 依存関係のインストール](/admin-guide/installation/docker#installing-additional-python-dependencies)を参照してください。

### ポーリング間隔(`check_interval_seconds`) {#poll-interval-check_interval_seconds}

各ランナーは、新しいジョブの取得とタスクの進捗報告のために、一定の間隔で Semaphore サーバーをポーリングします。
ランナーの設定ファイルで設定します。

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

または、環境変数を使用します。

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| 値 | 効果 |
|-------|--------|
| **1**(デフォルト) | ジョブは約 1 秒以内に取得されます。低レイテンシーの実行に最適です。 |
| **より大きい値**(例: 5〜30) | 1 台のサーバーに対して多数のランナーを運用する場合に HTTP トラフィックを削減します。ジョブの開始がやや遅れる場合があります。 |

Semaphore UI のランナーページでは、セットアップ用スニペット(設定ファイル、Docker、環境変数の例)を生成する際に、
この設定を**詳細オプション**として表示します。

無効な値または 0 を指定した場合は、デフォルトの 1 秒にフォールバックします。

### ランナータグ(Pro) {#runner-tags-pro}

プロジェクトのランナーに 1 つ以上のタグを割り当てられます。テンプレートでタグを必須にすると、タスクは一致するランナーでのみ実行されます。タグはプロジェクトの UI でランナーを追加する際に設定し、必須タグはテンプレートの設定で指定します。

## ランナーの登録解除 {#runner-deregistration}

Web インターフェースからランナーを削除できます。

![ランナーの画像](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

または、CLI からランナーの登録を解除します。

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## セキュリティ {#security}

ランナーは、登録時に発行される不透明なベアラートークン(`X-Runner-Token`)を使用してサーバーに認証します。
このトークンは他の認証情報と同様に保護してください。アクセスが制限された設定ファイルや
シークレットマネージャーに保存することを推奨します。

:::warning
サーバーとランナー間の通信には HTTPS を使用してください。特に、両者が同じプライベートネットワーク上にない場合は
必須です。自己署名証明書や内部 CA の証明書を使用する場合は、ランナー側で
`runner.connection.server_ca_cert_file` を設定してください。
本番環境では `runner.connection.skip_tls_verify` を使用しないでください。
:::
