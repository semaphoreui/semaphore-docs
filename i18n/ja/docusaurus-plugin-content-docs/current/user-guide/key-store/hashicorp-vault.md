---
title: "HashiCorp Vault シークレットストレージ"
---

# HashiCorp Vault シークレットストレージ <Pro />

Semaphore UI は、シークレットのストレージとして HashiCorp Vault をサポートしています。

![](/assets/vault1.webp)

次のオプションを指定できます。
- **HashiCorp Vault URL** — Vault サーバーのアドレス。
- **マウント** — シークレットエンジンのマウントパス。
- **トークン** — 認証トークン。トークンは次の方法で指定できます:
    - データベースに保存する。
    - 環境変数で指定する。
    - ファイルで指定する (Vault Agent を使用する場合に便利)。
      :::warning
      トークンを**ファイル**から取得する場合、そのファイルは Semaphore が使用するシークレットディレクトリの**内部**に配置する必要があります。このディレクトリは `dirs.secrets` または環境変数 `SEMAPHORE_SECRETS_PATH` で設定します。従来のトップレベルの `secrets_path` オプションも、古い設定との互換性のために引き続き使用できます。いずれも設定されていない場合、デフォルトは `/tmp/semaphore` です。優先順位の詳細については、[シークレットディレクトリ](/admin-guide/configuration/config-file#secrets-directory)を参照してください。

      `config.json` の設定例:

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

このストレージは読み取り専用モードで動作させることができます。

## 使い方 {#how-to-use}

1. Semaphore の設定で HashiCorp Vault への接続 (URL、マウントパス、トークン) を設定します。
2. キーストアでキーを作成または編集する際に、ストレージの種類として **HashiCorp Vault** を選択します。
3. 認証情報を保存する Vault 内のシークレットパスを指定します。

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

Vault トークンを直接保存する代わりに、[HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) を使用してトークンの取得と更新を自動的に処理できます。

Vault Agent は Semaphore と並行してサイドカープロセスとして動作し、有効なトークンをディスク上のファイルに書き込みます。Semaphore はそのファイルからトークンを読み取ります。

設定手順は次のとおりです。

1. 適切な[自動認証 (auto-auth) メソッド](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) (AppRole、Kubernetes、AWS IAM など) を使用して Vault Agent を設定し、実行します。
2. `sink` ブロックを使用して、Vault Agent がトークンをファイルに書き込むように設定します。例:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. Semaphore で HashiCorp Vault 接続を設定する際に、トークンソースとして**ファイル**を選択し、トークンファイルのパス (例: `/etc/vault/token`) を指定します。

この方法により、長期間有効な静的トークンを避け、認証とトークンの更新を Vault Agent に自動的に任せることができます。


## 変数グループ {#variable-groups}

HashiCorp Vault は[変数グループ](/user-guide/environment)のストレージとしても使用できます。変数グループを編集する際に、ストレージの種類として **HashiCorp Vault** を選択し、シークレットを保存するフォルダーのパスを指定します。

![](/assets/vault3.webp)
