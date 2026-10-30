---
title: クライアント
description: semaphore client を使ってターミナルやスクリプトから Semaphore サーバーを管理する方法 - ログインとコンテキスト、設定の優先順位、出力形式、終了コード、CI からのタスク実行。
---

# クライアント

`semaphore client` は、稼働中の Semaphore サーバーを REST API 経由で操作します。必要なのは
サーバーの URL と API トークンだけで、データベースへのアクセスもサーバーの設定ファイルも
不要です。そのため、ノート PC からでも、CI ジョブからでも、サーバーの `config.json` を
一度も見たことのないホストからでも動作します。

```bash
semaphore client --help
```

コマンドは `semaphore client <resource> <action> [id|name]` の形式に従います。
リソース名は単数形で、複数形がエイリアスになります
(`template list` と `templates list` は同じです)。すべてのリソースに `list`、
`get`、`create`、`update`、`delete` があり、タスクにはさらに `run`、`logs`、`wait`、`stop`
などがあります。すべてのコマンドとフラグを網羅した自動生成の一覧は
[コマンドリファレンス](/reference/cli/commands#semaphore-client)にあります。

| グループ | 用途 |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | ログイン、トークンの確認、トークンの表示、ログアウトを行います。 |
| [`context`](/reference/cli/commands#semaphore-client-context) | 1 つの設定ファイルに複数のサーバーを保持し、それらを切り替えます。 |
| [`project`](/reference/cli/commands#semaphore-client-project) | プロジェクトとそのメンバー、バックアップ、リストア。 |
| [`template`](/reference/cli/commands#semaphore-client-template) | タスクテンプレートと、タスクを開始する `template run`。 |
| [`task`](/reference/cli/commands#semaphore-client-task) | タスクのログ、待機、停止、承認、再実行。 |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | プロジェクトのその他のリソース。 |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | サーバー全体のリソース (管理者のみ)。 |
| [`info`](/reference/cli/commands#semaphore-client-info) | サーバーのバージョンと設定。 |

## 初回ログイン {#first-login}

対話形式では、クライアントがログイン名、パスワード、そして TOTP が有効な場合はコードを
尋ね、API トークンを作成して保存します。パスワードは一度だけ使われ、保存されることは
ありません。

```bash
semaphore client auth login --url https://semaphore.example.com
```

既存のトークンを使う場合 (シングルサインオンしか提供していないサーバーにログインする方法でも
あります。トークンはプロフィールの **Tokens** ページで作成してください):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

どちらの方法でも、サーバーのホスト名を名前にした*コンテキスト*が
`~/.semaphore/client.yml` に保存され、それが現在のコンテキストになります。使用中のものは
`semaphore client auth status` で確認できます。

## 設定 {#configuration}

各設定はフラグ、環境変数、または現在のコンテキストから取得でき、優先順位は
**フラグ > 環境変数 > コンテキスト > デフォルト** の順です。

| フラグ | 環境変数 | 意味 |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | サーバーの URL。例: `https://semaphore.example.com`。 |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | 現在のコンテキストの代わりに使うコンテキストの名前。 |
| — | `SEMAPHORE_CLIENT_TOKEN` | API トークン。`--token` フラグは意図的に用意していません。プロセスの引数は `ps` やシェルの履歴から見えてしまうためです。 |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | トークンを格納したファイル (末尾の改行は無視されます)。 |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | プロジェクト単位のコマンドで使うプロジェクトの ID または名前。 |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (デフォルト)、`json`、`yaml` のいずれか。 |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | 1 回の HTTP リクエストのタイムアウト。デフォルトは `30s`。 |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | サーバー証明書に署名した CA を含む PEM ファイル。 |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | TLS の検証を省略します。呼び出しのたびに警告が表示されます。`--ca-cert` の使用を推奨します。 |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | 入力を一切求めません。応答が必要なコマンドは代わりに失敗します。 |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | HTTP リクエストを stderr にトレースします。Authorization ヘッダーと Cookie ヘッダーはマスクされます。 |
| — | `SEMAPHORE_CLIENT_CONFIG` | 設定ファイルのパス。デフォルトは `~/.semaphore/client.yml`。 |

環境変数のトークンは、URL も環境変数またはフラグから指定された場合にのみ使われます。
これにより、誰かが同じジョブを `--context other` で実行したときに、CI のトークンが
別のサーバーに送信されるのを防ぎます。

### 設定ファイル {#the-configuration-file}

`~/.semaphore/client.yml` には名前付きのコンテキストが格納されます。`auth login` と `context set`
がこのファイルに書き込みますが、手動で編集することもできます。

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # または token_file
    project: 3                # デフォルトのプロジェクト (ID または名前)
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

クライアントはディレクトリをモード `0700`、ファイルを `0600` で作成します。グループまたは
その他のユーザーが書き込み可能なファイルは拒否され、`chmod 600` を実行するよう促す
ヒントが表示されます。その他のユーザーが読み取り可能なファイルの場合は警告が表示されます。

## 出力 {#output}

データは stdout に、メッセージ、警告、進行状況は stderr に出力されるため、スクリプトは
一方だけを取得できます。

| フラグ | 効果 |
|------|--------|
| `-o json` | 装飾のない有効な JSON。一覧は常に配列で、空の一覧は `[]` です。フィールド名は API のものと同じです。 |
| `-o yaml` | 同じデータを YAML で出力します。 |
| `--fields id,name,status` | 指定した列またはフィールドのみを出力します。ネストしたフィールドはドットで指定します: `--fields id,params.limit`。 |
| `-q`, `--quiet` | ID のみを 1 行に 1 つずつ出力します。`xargs` やループ向けです。 |
| `--no-headers` | ヘッダー行のない表を出力します。 |
| `--no-color` | 色を付けません。stdout が端末でない場合や `NO_COLOR` が設定されている場合も色は無効になります。 |

stdout が端末でない場合、表の列はタブで区切られ、切り詰められることはありません。

オブジェクトは数値の ID または名前で指定します。名前はプロジェクト内で大文字と小文字を
区別せずに検索されます。同じ名前のオブジェクトが複数ある場合、コマンドはコード 5 で終了し、
候補を stderr に一覧表示します。

## 終了コード {#exit-codes}

| コード | 意味 |
|------|---------|
| `0` | 成功。待機するコマンドの場合は、タスクが `success` で終了したことを示します。 |
| `1` | クライアントまたは API のエラー (ネットワーク障害、サーバーエラー、予期しない応答)。 |
| `2` | 使用方法のエラー。不明なフラグ、引数の不足、プロジェクトの未指定、または端末がない状態での確認要求 (`--yes` を指定してください)。 |
| `3` | 待機していたタスクがステータス `error` で終了しました。 |
| `4` | 認証に失敗しました (HTTP 401 または 403)。 |
| `5` | オブジェクトが見つからないか、名前が複数のオブジェクトに一致しました。 |
| `6` | 待機していたタスクがステータス `stopped` で終了しました。 |
| `124` | `--wait-timeout` が経過しました。タスクはサーバー上で実行を続けます。 |
| `130` | Ctrl+C で中断されました。クライアントは切断しますが、`--stop-on-interrupt` を指定していない限り、タスクは実行を続けます。 |

## スクリプトからのタスク実行 {#running-tasks-from-scripts}

CI ジョブはすべて環境変数で設定し、結果の判定は終了コードに任せます。

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# タスクを開始してログをストリーミングし、最終ステータスに応じて 0/3/6 で終了する
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# 今すぐ開始し、後で待機する
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` と `--extra-vars-file` はタスクの追加変数を設定します。
`--inventory`、`--branch`、`--limit`、`--tags`、`--check`、`--diff` は、テンプレートが
上書きを許可している項目を上書きします。

タスクは途中で止まり、承認を待つことがあります。適用前の Terraform のプランや、
最初に確認するアプリを使うテンプレートがそうです。端末では、クライアントが
`Apply task <id>? [yes/no]` と表示し、答えをサーバーに送ります。端末がない場合は
停止を stderr に伝えて待ち続けるため、CI ジョブでは別の場所から
`task confirm <id>` または `task reject <id>` を実行するか、テンプレートが
許可していれば `--auto-approve` を使うか、`--wait-timeout` で打ち切る必要があります。
ゲートで止まってはいけないパイプラインでは、`--auto-reject` を使うと、
タスクが尋ねた時点で拒否されます。拒否したタスクは `error` で終わるので、
終了コードは 3 です。

表に表示されない情報は、`-o json` と `jq` を組み合わせて取得します。

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## シークレットとトークン {#secrets-and-tokens}

- トークンは表示されることはありません。例外は `auth token` で、このコマンドはトークンを
  別のツールに渡すために存在し、stdout が端末の場合は警告を表示します。
- パスワードと鍵の内容はファイルまたは stdin からのみ読み込まれます:
  `key create --ssh-key-file`、`--password-file`、`--password-stdin`、
  `user create --password-stdin`。環境のシークレットは
  `environment create --secrets-file` で渡します。
- `environment get` と `key get` は、どの出力形式でもシークレットの名前だけを表示し、
  値は表示しません。
- `auth logout --revoke` は、ローカルだけでなくサーバー上のトークンも削除します。
- 破壊的なコマンドは、端末では確認を求め、端末がない場合は `--yes` が必要です。
  `project delete` には `--confirm` でプロジェクト名を指定する必要があります。
