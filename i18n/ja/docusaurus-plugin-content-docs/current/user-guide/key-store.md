---
title: Key Store
description: Semaphore Key Store における認証情報、SSH 鍵ペアの生成、ログインパスワード、トークンシークレット、および外部シークレットストレージの包括的ガイド。
---

# Key Store

**Key Store** は、Semaphore の一元化された認証情報リポジトリとして機能します。リモート Git リポジトリのクローン、ターゲットインフラホストへの接続、権限昇格（`sudo`/`become`）、および Ansible Vault シークレットの復号に必要な認証情報を管理します。

![Key Store](/assets/key-store-keys.webp)

Key Store は主に2つの画面で構成されています：
* **Keys タブ**: 現在のプロジェクトにプロビジョニングされているすべての認証情報を、名前、ストレージバックエンド、認証情報タイプ、および同期状態で一覧表示します。
* **Storages タブ (Pro)**: 外部シークレットバックエンド（HashiCorp Vault、OpenBao、AWS Secrets Manager、CyberArk など）を設定し、動的なシークレット解決と自動同期を実現します。

---

## 認証情報の種類 {#types}

Semaphore は保存される認証情報を以下の3つの基本的なタイプに分類します：

### 1. SSH 鍵 {#1-ssh}
SSH 鍵は、Linux/UNIX ノードへの接続および SSH 経由（`git@github.com:...`）での Git リポジトリのクローンに使用される非対称暗号認証を提供します。

SSH 鍵認証情報を設定する際、以下の項目を指定できます：
* **Key Name**: プロジェクトのインベントリやテンプレート全体で認証情報を識別するためのわかりやすいラベル。
* **Username (Optional)**: SSH 接続確立時に使用されるデフォルトのリモートユーザーアカウント（例: `ansible` または `ubuntu`）。
* **Passphrase (Optional)**: 暗号化された秘密鍵を復号するためのパスフレーズ。パスフレーズ入力欄には表示切り替えアイコン（`目`）があり、デフォルトではマスクされています。
* **Private Key**: 生の PEM/OpenSSH 秘密鍵テキスト。

#### 組み込み SSH キージェネレーター {#built-in-ssh-key-generator}

外部のマシンで `ssh-keygen` を手動で実行する代わりに、Semaphore にはモーダル内に直接**ワンクリック組み込み SSH 鍵ペアジェネレーター**が搭載されています：

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. **Type** ドロップダウンから **SSH Key** を選択します。
2. **Generate SSH Key** チェックボックスをオンにします。
3. 手動入力用の **Private Key** テキストエリアが自動的に無効化され、ロックされます。
4. **Create** をクリックします。Semaphore は暗号学的に安全な鍵ペア（ED25519/RSA）を自動生成し、秘密鍵をデータベース内で暗号化して保存した上で、専用のダイアログに公開鍵を表示します：

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

備え付けの **Copy to Clipboard** ボタンを使用して公開鍵をコピーし、Git プロバイダーのデプロイキーまたはターゲットノードの `~/.ssh/authorized_keys` ファイルに貼り付けてください。

#### 公開鍵の再取得（公開鍵ドロワー） {#extracting-public-keys-later}

ダイアログを閉じた後や後から公開鍵が必要になった場合でも、鍵ペアを再生成する必要はありません。ジェネレーターで作成された既存の鍵を編集する際、Semaphore は展開可能な **Public key** ドロワーを提供します：

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* **Show** / **Hide** をクリックして公開鍵テキストをプレビューします。
* クリップボードアイコンをクリックして公開鍵を瞬時にコピーします。

#### 主要な Git ホストへのデプロイキーの登録

SSH 認証を必要とする Git リポジトリの場合、生成された公開鍵を読み取り専用のデプロイキーとして追加します：
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. パスワードでログイン {#2-login-with-password}

**Login with password** 認証情報タイプは、従来のユーザー名/パスワード認証と独立したシークレット文字列の両方をサポートします：

* **ホストおよび sudo 認証**: ターゲットホストでのパスワードベースの SSH アクセスおよび `sudo` 権限昇格認証情報を提供します。
* **HTTPS Git 認証**: ユーザー名とパーソナルアクセストークン（PAT）を使用して、HTTPS 経由でリモートリポジトリに認証します。
* **Ansible Vault パスワード**: 実行時に暗号化された Ansible Vault ファイルおよび変数をロック解除します。

:::tip シークレット文字列とパーソナルアクセストークン (PAT)
純粋なシークレット文字列（API ベアラートークン、Ansible Vault パスフレーズ、または PAT など）を保存するには、**Login / Username フィールドを空のままにします**。Semaphore は関連するユーザー識別子を付加せず、独立したシークレット文字列として処理します。
:::

#### シークレットのマスキングと上書き保護 {#secret-masking-and-override-protection}

不正な開示や偶発的な変更から認証情報を保護するため：
* パスワードおよびパスフレーズ入力はインターフェース上でマスクされ、表示切り替えコントロールが付属しています。
* 既存の認証情報を編集する場合、機密シークレット入力はデフォルトで無効化されます。
* 既存のシークレットを更新または置き換えるには、フォームの下部にある **Override** チェックボックスを明示的にオンにする必要があります。このセーフティゲートにより、日常的な管理作業での意図しない上書きを防ぎます。

---

### 3. なし {#3-none}

**None** 認証情報は、明示的な認証なしのプレースホルダーとして機能します。SSH 鍵やパスワードを必要としないパブリックなオープンソース Git リポジトリ（GitHub や GitLab 上の公開リポジトリなど）やローカルの未認証プレイブック実行に使用されます。

---

## シークレットストレージ {#secret-storages}

Semaphore は分離されたシークレットストレージアーキテクチャをサポートしています。認証情報を作成または編集する際、シークレットの実体が配置される場所をストレージタブから選択できます：

| ストレージタブ | 提供エディション | 説明 |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | シークレットはエンベロープ暗号化で保護され、Semaphore データベースに直接保存されます。 |
| **Storage** | Pro | 外部シークレットエンジン（例: HashiCorp Vault、AWS Secrets Manager）を参照します。 |
| **Env** | Open Source & Pro | Semaphore サーバー上の環境変数から実行時に動的に解決されます。 |
| **File** | Open Source & Pro | サーバーの設定済みシークレットディレクトリにある保護されたファイルから読み取られます。 |

![シークレットストレージ](/assets/key-store-storages.webp)

### データベースストレージ (Local) {#database}

デフォルトでは、シークレットは対称 AES 暗号化を使用して暗号化された状態でアプリケーションデータベースに保存されます。マスターキーはサーバー設定によって構成されます：
* 設定キー: `access_key_encryption`
* 環境変数: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning マスター暗号化キーの生成
本番インスタンスを起動する前に、暗号学的に安全な 32 バイトの Base64 暗号化キーを生成してください：
```bash
head -c32 /dev/urandom | base64
```
このキーは安全にバックアップしてください。暗号化キーが失われた場合、既存のデータベースシークレットを回復することはできません。
:::

### 環境変数およびファイルソース（読み取り専用ストレージ） {#environment-variable-or-file}

**Env** または **File** ソースタブを選択すると、Semaphore はストレージを外部の読み取り専用ソースとして扱います。UI には通知が表示されます：

> **Read-only secret storage chosen.**

![読み取り専用シークレットストレージ](/assets/key-store-env-readonly-storage.webp)

* **Env ソース**: Semaphore サーバーのホストまたはコンテナでエクスポートされた環境変数の正確な名前を指定します（例: `SEMAPHORE_EXTERNAL_VAULT_TOKEN`）。
* **File ソース**: 設定されたシークレットパス（`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`、デフォルト `/tmp/semaphore`）に対する相対ファイルパスを指定します。

構造化されたキーの場合、ファイルおよび環境変数の内容は有効な JSON オブジェクトとしてフォーマットされている必要があります。スキーマの詳細は [環境変数およびファイルソース](/user-guide/key-store/env-and-file-sources) を参照してください。

### 外部エンタープライズシークレットエンジン (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro および Enterprise は、主要なエンタープライズシークレットマネージャーへのネイティブコネクタで Key Store を拡張します：

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: AppRole またはトークン認証で接続し、KV v1/v2 シークレットを読み書きします。
* **[OpenBao](/user-guide/key-store/openbao)**: HashiCorp Vault のオープンソース API 互換フォーク。
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />: AWS IAM ロールまたは静的認証情報と統合します。
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: 一元化された特権アクセス管理と統合します。
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />: CyberArk PVWA REST API を使用してシークレットを読み書きします。

---

## リモートストレージからのシークレット同期 {#syncing-secrets-from-remote-storages}

認証情報を1つずつ手動で登録する代わりに、Semaphore は外部のシークレットコンテナからの自動同期をサポートしています。

シークレットが同期を介して管理されている場合：
* Key Store テーブルでアクティブな **synchronized** バッジが表示されます。
* 外部 Vault を信頼できる唯一の情報源として保持するため、UI でのシークレットの手動編集は無効化されます。
* 外部シークレットエンジンでの更新やローテーションは、設定された同期同期間隔に基づいて Semaphore に自動反映されます。

包括的な設定手順については、[シークレットの同期](/user-guide/key-store/secret-sync) を参照してください。
