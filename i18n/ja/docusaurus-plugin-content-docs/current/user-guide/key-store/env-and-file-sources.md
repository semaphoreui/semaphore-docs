# 環境変数およびファイルからのキー

シークレットをデータベースに保存する代わりに、キーストアのエントリは、タスクの実行時に Semaphore サーバー上の
**ファイル**、または Semaphore サーバープロセスの**環境変数**から値を読み取ることができます。
これは、認証情報がすでに Semaphore の外部で用意されている場合に便利です。例:

* Docker または Kubernetes のシークレットとして Semaphore コンテナにマウントされた SSH キー
* エージェント (HashiCorp Vault Agent、cert-manager など) によってディスクに書き込まれ、定期的にローテーションされるトークン
* オーケストレーターによってコンテナ環境に注入されたパスワード

Semaphore はその値をデータベースにコピーしません。タスクがキーを必要とするたびに、サーバーはファイルまたは変数を
再度読み取るため、ディスク上で認証情報をローテーションすると、次のタスクから反映されます。

:::info
ファイルまたは変数を読み取るのは、ランナーではなく **Semaphore サーバー**です。リモートランナーを使用する場合は、
ファイルをサーバーホストにマウントしてください。サーバーがシークレットを解決し、ランナーに渡します。
:::

## ソースの選択 {#choosing-the-source}

キーを作成または編集する際 (**キーストア → 新しいキー**)、フォームの上部にソースを選択するタブがあります。

| タブ | 値の取得元 | 入力する内容 |
|-----|---------------------------|---------------|
| **Local** | Semaphore のデータベース (暗号化済み) | フォームに入力するログイン、パスワード、または秘密鍵 |
| **Storage** <Pro /> | [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) などの外部シークレットストレージ | ストレージとシークレットのパス |
| **Env** | Semaphore サーバープロセスの環境変数 | 変数名 (例: `PROD_SSH_KEY`) |
| **File** | Semaphore サーバー上のファイル | ファイルへの**絶対**パス (例: `/var/lib/semaphore/secrets/prod.json`) |

**Env** または **File** を選択すると、ログイン、パスワード、秘密鍵のフィールドは表示されなくなります。SSH キーおよび
「パスワードでログイン」キーのログインを含む認証情報全体を、ファイルまたは変数に含める必要があります。

## 1. ディレクトリの許可 {#allow-the-directory}

セキュリティ上の理由から、Semaphore は**シークレットディレクトリ**内にあるキーファイルのみを読み取ります。それ以外の
パスは、タスクの開始時に拒否されます。

```
Failed to install inventory: file path must be inside secrets path
```

デフォルトのシークレットディレクトリは `/tmp/semaphore` です。`config.json` の `dirs.secrets`、または環境変数
`SEMAPHORE_SECRETS_PATH` を使用して、キーファイルが置かれているディレクトリを指定してください。
優先順位のルールについては、[シークレットディレクトリ](/admin-guide/configuration/config-file#secrets-directory)を参照してください。

ホストのディレクトリをマウントして許可する Docker Compose の例:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

同等の `config.json` の設定例:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

**File** タブに入力するパスのルール:

* 絶対パスであること (`prod.json` ではなく `/var/lib/semaphore/secrets/prod.json`)
* `..` セグメントを含まないこと
* 解決後の場所がシークレットディレクトリ内であること (サブディレクトリは可)
* Semaphore の実行ユーザー (公式 Docker イメージでは `semaphore`、UID 1001) がファイルを読み取れること

環境変数にはこのような制限はありません。サーバーは、自身の環境から指定された名前の変数を読み取るだけです。

## 2. 値の形式 {#format-the-value}

ファイルの内容 (または変数の値) は、キーの種類によって異なります。ファイル末尾の改行 1 つは無視され、
それ以外はそのまま使用されます。

### SSH キー {#ssh-key}

Semaphore が期待するのは、生の PEM や OpenSSH 秘密鍵ファイルではなく、**JSON ドキュメント**です。

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — SSH のユーザー名。Ansible に `--user` として渡されます。空のままにすると、インベントリ (`ansible_user`) で決定されます。Git リポジトリの場合、ログインが空のときのデフォルトは `git` です。
* `passphrase` — 秘密鍵のパスフレーズ、または空文字列。
* `private_key` — 改行を `\n` としてエンコードした秘密鍵。

既存のキーからこのラッパーを生成するには、エスケープ処理を行ってくれる `jq` を使用します。

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

次に、種類が **SSH** のキーを作成し、**File** タブを開いて `/var/lib/semaphore/secrets/prod_ssh.json`
(コンテナの**内部**から見たパス) を入力します。

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
**File** タブで `~/.ssh/id_ed25519` のような生の秘密鍵を指定しても動作しません。
ファイルは JSON として解析されるため、タスクはインベントリの読み込みに失敗します。
:::

### パスワードでログイン {#login-with-password}

こちらも JSON ドキュメントです。

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

キーを単なるトークンやパスワード (例えば Ansible Vault のパスワード) として使用するには、`login` を空のままにします。

## 環境変数の例 {#environment-variable-example}

**Env** タブにも同じ JSON 形式が適用されます。Docker Compose の場合:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

**SSH** キーを作成し、**Env** タブを選択して、変数名として `PROD_SSH_KEY` を入力します。

:::tip
環境変数はコンテナ内のすべてのプロセスから参照でき、オーケストレーターのメタデータやログに残ることもよくあります。
可能な場合は、マウントしたシークレットと **File** タブの組み合わせを優先してください。
:::

## トラブルシューティング {#troubleshooting}

| エラー | 原因 | 対処 |
|-------|-------|-----|
| `file path must be absolute` | 相対パスが入力された | `/` で始まる完全なパスを入力する |
| `file path must not contain traversal segments` | パスに `..` が含まれている | 解決済みのパスを入力する |
| `file path must be inside secrets path` | ファイルが `dirs.secrets` の外にある | `SEMAPHORE_SECRETS_PATH` をファイルのあるディレクトリに設定するか、ファイルを移動する |
| `no such file or directory` | パスが間違っているか、コンテナにマウントされていない | ボリュームのマウントを確認し、コンテナ内のパスを使用する |
| `permission denied` | Semaphore プロセスがファイルを読み取れない | ファイルの所有者またはパーミッションを修正する |
| `invalid character '-' looking for beginning of value` | JSON ラッパーではなく生の秘密鍵が指定された | 上記のようにキーを JSON でラップする |
