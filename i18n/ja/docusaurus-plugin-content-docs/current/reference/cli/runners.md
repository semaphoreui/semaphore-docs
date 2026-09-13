# ランナー

`semaphore runner` コマンドは、Semaphore を**ランナーモード**で実行し、サーバーへの
ランナーの登録を管理します。ランナーは、Semaphore サーバーとは別のマシン上でタスクを
実行します。

```bash
semaphore runner --help
```

:::tip
ランナーの仕組みとサーバー側の設定方法については、
[ランナー](/admin-guide/runners)ガイドを参照してください。
:::

サブコマンドなしで `semaphore runner` を実行すると、ヘルプが表示されるだけです。
次のサブコマンドがあります:

| コマンド | 用途 |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | ランナーの設定ファイルを対話的に作成します (トークンが指定された場合は登録も行います)。 |
| [`runner register`](#registering-a-runner-runner-register) | 登録トークンを使ってサーバーにランナーを登録します。 |
| [`runner start`](#starting-a-runner-runner-start) | ランナーモードで実行し、タスクの受け付けを開始します。 |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | サーバーからランナーの登録を削除します。 |

すべてのサブコマンドは、ランナーの設定ファイルを指定するグローバルフラグ `--config <path>`
(および環境変数のみで実行するための `--no-config`) を受け付けます。

## 対話型セットアップ (`runner setup`) {#interactive-setup-runner-setup}

対話型のセットアップを順に進め、ランナーの設定ファイルを書き出します。登録トークンが
利用可能な場合 (プロンプトで入力するか、`SEMAPHORE_RUNNER_REGISTRATION_TOKEN` で設定)、
すぐにサーバーにランナーを登録します。

```bash
semaphore runner setup --config /path/to/config.runner.json
```

設定ファイルの書き出し先を選択するには `--config <path>` を渡します。指定しない場合、
セットアップは出力ディレクトリ (デフォルト: カレントディレクトリ) を尋ね、そこに
`config.runner.json` を書き出します。

完了すると、ランナーを起動するためのコマンドが表示されます。例:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

セットアップを再実行する代わりに、生成された設定ファイルを後から手動で編集することも
できます。

### ランナーの設定オプション {#runner-configuration-options}

設定ファイルの `runner` ブロック内のフィールド:

| フィールド | 環境変数 | 説明 |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | ランナーの認証トークン (登録時に発行されます)。 |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | 登録トークン。環境変数のみで指定でき、ファイルには書き込まれません。 |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | 登録トークンを含むファイルのパス。 |
| `name` | `SEMAPHORE_RUNNER_NAME` | サーバー上に表示されるランナー名。 |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | プロジェクトのランナー振り分けに使用するタグの JSON 配列。 |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | このランナーにタスクがキューイングされたときにサーバーが呼び出す URL。 |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | ランナーがタスクを受け付けるかどうか。 |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | プロジェクトレベルのランナーのプロジェクト ID。グローバルランナーの場合は省略します。 |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | ポーリング間隔 (秒)。デフォルト: 1。 |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | 同時実行タスクの最大数。デフォルト: 9999。 |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | 1 つのジョブを処理した後に終了します。Webhook によってオンデマンドで起動されるランナーに便利です。 |

セットアップの詳細は[ランナー](/admin-guide/runners)を、オプションの全一覧は
[設定](/admin-guide/configuration)を参照してください。

## ランナーの登録 (`runner register`) {#registering-a-runner-runner-register}

サーバーにランナーを登録し、発行されたランナートークンを設定ファイルに保存します
(既存のトークンは上書きされます)。サーバー側で `runner_registration_token` が設定されている
必要があり、ここではその同じトークンを渡します。

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| フラグ | 説明 |
|------|-------------|
| `--registration-token-file <path>` | 登録トークンをファイルから読み取ります。 |
| `--stdin-registration-token` | 登録トークンを標準入力から読み取ります。 |
| `--name <name>` | 登録に使用するランナー名。 |
| `--tags <tags>` | ランナーのタグ。カンマ区切り、またはフラグを繰り返して指定します (例: `--tags a,b` や `--tags a --tags b`)。 |
| `--webhook <url>` | ランナーの Webhook URL。 |
| `--enabled` | サーバー上でランナーを有効または無効にします。デフォルトは `true` です。無効な状態のランナーとして登録するには `--enabled=false` を渡します。 |
| `--project-id <id>` | 指定したプロジェクトのプロジェクトレベルランナーとして登録します。省略した場合 (または `0` の場合)、ランナーはグローバルランナーとして登録されます。 |

実際に渡したフラグのみが適用されます。`--name`、`--webhook`、`--tags`、`--enabled` は、
コマンドラインで指定した場合にのみ、設定ファイルおよび環境変数の対応する値を上書きします。

### 登録トークンの取得元 {#where-the-registration-token-comes-from}

登録時、Semaphore は次の順序で、最初に利用可能なソースから登録トークンを解決します:

1. `--registration-token-file` フラグ。
2. 設定ファイルの `registration_token_file` 設定 (または
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`)。
3. `--stdin-registration-token` が渡された場合の標準入力。
4. 環境変数 `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`。

トークンファイルが存在するものの空である場合はエラーになります。どのソースからもトークンが
得られない場合、トークンなしで登録が試行され、サーバーによって拒否されます。

## ランナーの起動 (`runner start`) {#starting-a-runner-runner-start}

ランナーを起動し、サーバーに接続してタスクの受け付けを開始します。登録済みのランナーを
オンラインに保つために実行するコマンドです。

```bash
semaphore runner start --config /path/to/config.runner.json
```

| フラグ | 説明 |
|------|-------------|
| `--auto-register` | ランナーがまだ登録されていない場合 (つまり設定にランナートークンがない場合)、起動前に登録します。 |
| `--register` | `--auto-register` のエイリアス。 |

`--auto-register` を指定した場合、設定に `token` がなければ、Semaphore は
`registration_token_file` (または `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) または
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN` から登録トークンを読み取り、成功するまで 5 秒ごとに
登録を再試行し、設定を再読み込みしてから起動します。これは、コンテナなどで初回起動時に
自身を登録するランナーに便利です。

`runner start` は `--registration-token-file` や `--stdin-registration-token` を受け付けません。
これらのフラグは `runner register` 専用です。

## ランナーの登録解除 (`runner unregister`) {#unregistering-a-runner-runner-unregister}

設定ファイルのランナートークンを使って、サーバーからランナーの登録を削除します。

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
