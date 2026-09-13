---
title: "OpenBao シークレットストレージ"
---

# OpenBao シークレットストレージ <Pro />

Semaphore UI は、シークレットのストレージとして [OpenBao](https://openbao.org) をサポートしています。

OpenBao は HashiCorp Vault のオープンソースフォークであり、API 互換性があるため、このストレージは [HashiCorp Vault ストレージ](/user-guide/key-store/hashicorp-vault)とまったく同じように動作します。

次のオプションを指定できます。
- **サーバー URL** — OpenBao サーバーのアドレス。
- **マウント** — KV v2 シークレットエンジンのマウントパス (デフォルトは `secret`)。
- **名前空間** — OpenBao の名前空間 (v2.3 以降)。省略可能。
- **トークン** — 認証トークン。トークンは次の方法で指定できます:
    - データベースに保存する。
    - 環境変数で指定する。
    - ファイルで指定する。
      :::warning
      トークンを**ファイル**から取得する場合、そのファイルは Semaphore が使用するシークレットディレクトリの**内部**に配置する必要があります。このディレクトリは `dirs.secrets` または環境変数 `SEMAPHORE_SECRETS_PATH` で設定します。従来のトップレベルの `secrets_path` オプションも、古い設定との互換性のために引き続き使用できます。いずれも設定されていない場合、デフォルトは `/tmp/semaphore` です。優先順位の詳細については、[シークレットディレクトリ](/admin-guide/configuration/config-file#secrets-directory)を参照してください。
      :::

このストレージは読み取り専用モードで動作させることができます。

## 使い方 {#how-to-use}

1. プロジェクトで**キーストア** → **ストレージ**を開き、新しい **OpenBao** ストレージを作成します (URL、マウントパス、トークン)。
2. キーストアでキーを作成または編集する際に、ストレージの種類として OpenBao ストレージを選択します。
3. 認証情報を保存する OpenBao 内のシークレットパスを指定します。

## シークレットの同期 {#syncing-secrets}

OpenBao に保存されたシークレットは、他の外部ストレージと同様に、キーストアに自動的にインポートして同期を維持できます。[リモートストレージからのシークレットの同期](/user-guide/key-store/secret-sync)を参照してください。

## 変数グループ {#variable-groups}

OpenBao は[変数グループ](/user-guide/environment)のストレージとしても使用できます。変数グループを編集する際に、ストレージの種類として OpenBao ストレージを選択し、シークレットを保存するフォルダーのパスを指定します。
