
# 設定ファイル

## 設定ファイルの作成 {#creating-configuration-file}

Semaphore はコア設定に `config.json` ファイルを使用します。このファイルは、組み込みツールを使って対話的に、または Web ベースのコンフィギュレーターで生成できます。

### CLI で生成する {#generate-via-cli}

設定ファイルを対話的に生成するには、次のコマンドを使用します:

* Semaphore サーバーの場合:
  ```
  semaphore setup
  ```
* Semaphore ランナーの場合:
  ```
  semaphore runner setup
  ```
  
  :::tip
    ランナーの設定の詳細については、<a href="./../runners">ランナー</a>のセクションを参照してください。
  :::

### Web サイトで生成する {#generate-on-the-website}

あるいは、Web ベースの対話型コンフィギュレーターを使用することもできます:
* [サーバー用コンフィギュレーター](https://semaphoreui.com/install/binary/2_13/config)
* [ランナー用コンフィギュレーター](https://semaphoreui.com/install/binary/2_13/runner)

## 設定ファイルの例 {#configuration-file-example}

Semaphore は、次のような内容の `config.json` 設定ファイルを使用します:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## 設定ファイルの使用方法 {#configuration-file-usage}

* Semaphore サーバーの場合:

```bash
semaphore server --config ./config.json
```

* Semaphore ランナーの場合:

```bash
semaphore runner start --config ./config.json
```

## シークレットディレクトリ {#secrets-directory}

Semaphore は、シークレットファイル (例えば、[ファイルベースのキーストアエントリ](/user-guide/key-store/env-and-file-sources)や、ディスクから読み取る HashiCorp Vault や OpenBao のトークン) を、設定可能なディレクトリからのみ読み取ります。

| オプション | 環境変数 | 説明 |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | シークレットファイル用のディレクトリ。デフォルト: `/tmp/semaphore`。 |
| `secrets_path` (レガシー) | `SEMAPHORE_SECRETS_PATH` | 後方互換性のために残されているトップレベルの設定。`dirs.secrets` が未設定、またはデフォルトのパスのままの場合にのみ使用されます。 |

**優先順位**: デフォルト以外の `dirs.secrets` は、レガシーの `secrets_path` より優先されます。`SEMAPHORE_SECRETS_PATH` を設定すると、Semaphore は両方のフィールドにそれを適用します。

現在のレイアウトを使用した例:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

レガシーなインストールでは、次の形式がまだ使われている場合があります:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

キーストアのフォームの **File** タブで選択したキーファイル、および外部シークレットストレージから参照されるトークンファイルは、このディレクトリ内に置く必要があります。このディレクトリの外にあるパスは `file path must be inside secrets path` というエラーで拒否されます。[環境変数およびファイルからのキー](/user-guide/key-store/env-and-file-sources)を参照してください。

## Git 操作 {#git-operations}

Semaphore は、各実行の前にタスクのリポジトリをクローンおよび更新します。この動作は 2 つのオプションで制御します:

| オプション | 環境変数 | 説明 |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Git クライアントの実装: `cmd_git` (デフォルト、システムの `git` バイナリを使用) または `go_git` (純粋な Go 実装のクライアント)。 |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | タスクが失敗するまでにクローンおよびプル操作を試行する回数。デフォルト: `4`。`1` に設定すると、再試行なしで 1 回だけ試行します。 |

クローンまたはプルが失敗し、再試行回数が残っている場合、Semaphore は指数バックオフ (1 秒から開始し、試行ごとに倍増、上限 60 秒) で待機し、`Git pull failed (...), retrying in 2s` のようなメッセージをログに記録します。再試行はネットワーク操作にのみ適用されます。チェックアウトの失敗や認証エラーの場合も、すべての試行を使い切った時点でタスクは失敗します。

Git サーバーが断続的に利用できなくなる場合は、`git_attempts` を増やしてください。失敗が即時かつ継続的な場合 (認証情報の誤り、リポジトリの不存在など) は、根本的な問題を修正してください。再試行では解決しません。

