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
