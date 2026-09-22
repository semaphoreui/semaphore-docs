# 環境変数

環境変数を使うと、利用可能な任意の設定オプションを上書きできます。

対話型の環境変数ジェネレーター (Docker 用) を使用できます:
* [サーバー](https://semaphoreui.com/install/docker/2_12/)用
* [ランナー](https://semaphoreui.com/install/docker/2_12/runner)用。

---

## アプリ (Ansible、Terraform など) 向けのアプリケーション環境 {#application-environment-for-apps-ansible-terraform-etc}

Semaphore は、アプリケーションプロセス (Ansible、Terraform/OpenTofu、Python、PowerShell など) に環境変数を渡すことができます。関連するオプションが 2 つあります:

- `env_vars` / `SEMAPHORE_ENV_VARS`: アプリプロセスに設定される静的なキーと値のペア。
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: サーバーが自身のプロセス環境から転送する変数名のリスト。

設定ファイルの例:

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

環境変数による同等の設定:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

注意:
- 転送は明示的です。`forwarded_env_vars` に列挙された変数のみがアプリプロセスに引き継がれます。
- シークレットは安全な方法 (例えば Docker/Kubernetes のシークレット) で提供し、その上で `forwarded_env_vars` を使って転送してください。
- 同じリストはリポジトリのクローンと更新を行う `git` プロセスにも使われます。`git` がホスト環境から必要とするものも、同じように転送する必要があります。

---

## 企業プロキシの背後での実行 {#running-behind-a-corporate-proxy}

Semaphore は自身の環境を、起動するプロセスにそのまま引き渡しません。`PATH` を除き、変数がタスクや `git` のクローンに届くのは、`forwarded_env_vars` に列挙されているか `env_vars` で設定されている場合だけです。

これが最も問題になるのはパッケージ (systemd) インストールです。ユニットファイルで設定したプロキシ変数は Semaphore サーバー自体には適用されますが、`git` には適用されません。

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

上記の設定だけの場合、リポジトリのクローンは次のように失敗します。

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` は `NO_PROXY` を認識できなかったため、内部ホスト宛てのリクエストを外部プロキシ経由で送信し、拒否されました。3 つの変数を明示的に転送すると解決します。

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

環境変数として指定する場合は次のとおりです。

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

注意:
- プロキシ変数と一緒に `NO_PROXY` も転送してください。これがないと、内部 Git サーバーへの通信もプロキシ経由になります。
- 多くのツールは小文字表記 (`http_proxy`、`https_proxy`、`no_proxy`) を読み取ります。Linux と macOS では変数名の大文字と小文字が区別されるため、環境が小文字で設定している場合は両方の表記を列挙してください。
- カスタム CA バンドルも同じ仕組みです。プロキシが TLS を終端する場合は、証明書の検証を無効にするのではなく、必要に応じて `GIT_SSL_CAINFO`、`SSL_CERT_FILE`、`REQUESTS_CA_BUNDLE` を転送してください。
- Docker インストールでは、プロキシ変数がコンテナ全体に設定されるため、通常はそのまま動作するように見えます。それでも明示的に転送しておくことを推奨します。同じ設定が両方の環境で同じように動作するためです。

---

## ランナーのエグゼキューター設定 {#runner-executor-configuration}

ランナーのデプロイでは、個別のキーの代わりに、エグゼキューターブロック全体を単一の JSON 環境変数として設定できます:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

これは、設定ファイルで `runner.executor.type` およびネストされた `runner.executor.docker.*` フィールドを設定するのと同等です。ランナーのエグゼキューター設定の全一覧は[設定オプション](/admin-guide/configuration)を参照してください。

---

## 変数グループでのシークレット環境変数 {#secret-environment-variables-in-variable-groups}

グローバルな環境変数に加えて、変数グループでプロジェクトごとのシークレットを定義できます。シークレットキーは UI とログでマスクされます。使用方法と、`TF_VAR_*` 変数による Terraform 連携については `User Guide → Variable Groups` を参照してください。
