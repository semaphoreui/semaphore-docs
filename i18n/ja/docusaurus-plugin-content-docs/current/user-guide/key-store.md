# キーストア

Semaphore のキーストアは、リモートリポジトリへのアクセス、リモートホストへのアクセス、sudo 認証情報、Ansible vault のパスワードを保存するために使用します。

![キーストア](/assets/key-store-keys.webp)

**キー** タブには、プロジェクトの認証情報がその種類とともに一覧表示されます。**ストレージ** タブ (Pro) には、プロジェクトに設定された外部のシークレットストレージが一覧表示されます。[シークレットストレージ](#secret-storages)を参照してください。

## 種類 {#types}

### 1. SSH {#1-ssh}
SSH キーは、リモートサーバーおよびリモートリポジトリへのアクセスに使用します。

キーをすばやく生成してホストに配置する方法については、[こちらの簡単なガイド](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)を参照してください。

SSH 認証を使用する Git リポジトリの場合、クローン元の Git リポジトリに、秘密鍵に対応する公開鍵を登録しておく必要があります。

代表的な Git リポジトリのドキュメントへのリンクは次のとおりです。
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. パスワードによるログイン {#2-login-with-password}
パスワードによるログインは、ユーザー名とパスワード／アクセストークンの組み合わせで、次の用途に使用できます。
* リモートホストへの認証（SSH キーを使用するより安全性は低くなります）
* リモートホストでの sudo 認証情報
* HTTPS 経由でのリモート Git リポジトリへの認証（SSH の方が安全です）
* Ansible vault のロック解除

:::tip
    この種類のシークレットは、パーソナルアクセストークン (PAT) やシークレット文字列として使用できます。ログインのフィールドを空のままにしてください。
:::

### 3. なし {#3-none}
これは、GitLab のオープンソースリポジトリのように、認証が不要なリポジトリ用のプレースホルダーとして使用します。


## シークレットストレージ {#secret-storages}

Semaphore UI は、シークレットのさまざまなストレージに対応しています。シークレットの作成時または編集時に、シークレットごとにストレージを選択できます。

外部ストレージは、キーストアの **ストレージ** タブ (Pro) で作成します。各ストレージには名前と種類があり、キーはそのストレージと、ストレージ内のシークレットのパスを参照します。

![シークレットストレージ](/assets/key-store-storages.webp)

### データベース {#database}

シークレットは、既定ではデータベースに暗号化された形式で保存されます。暗号化キーは設定オプション
`access_key_encryption` または `SEMAPHORE_ACCESS_KEY_ENCRYPTION` で設定します（`head -c32 /dev/urandom | base64` で生成する必要があります）。

### 環境変数またはファイル {#environment-variable-or-file}

キーは、Semaphore サーバーの環境変数、またはサーバー上のファイル（たとえばコンテナーにマウントされた SSH キー）から値を読み取ることができます。
キーのフォームの **Env** タブと **File** タブで、このモードを選択します。

ファイルは、設定されたシークレットのディレクトリ（`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`、既定は `/tmp/semaphore`）の中に置く必要があり、
SSH とパスワードによるログインのキーは、小さな JSON ドキュメントで包む必要があります。

[詳細はこちら...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

シークレットは、データベースの代わりに外部の HashiCorp Vault インスタンスに保存できます。

[詳細はこちら...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

シークレットは、外部の [OpenBao](https://openbao.org) インスタンス（HashiCorp Vault の API 互換のオープンソースフォーク）に保存できます。

[詳細はこちら...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

![Static Badge](https://img.shields.io/badge/enterprise-yellow)

シークレットは AWS Secrets Manager に保存できます。認証には IAM ロール／インスタンスプロファイル、または静的なアクセスキーを使用します。

[詳細はこちら...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

シークレットは、データベースの代わりに外部の Devolutions Server インスタンスに保存できます。

[詳細はこちら...](/user-guide/key-store/devolutions-server)

## リモートストレージからのシークレットの同期 {#syncing-secrets-from-remote-storages}

Semaphore は、外部のシークレットマネージャー（HashiCorp Vault、OpenBao、AWS Secrets Manager、Azure Key Vault、Devolutions Server）からシークレットを自動的にインポートし、同期を維持できます。同期パスを使って、どのシークレットをインポートし、どのような名前を付けるかを選択できます。

[詳細はこちら...](/user-guide/key-store/secret-sync)
