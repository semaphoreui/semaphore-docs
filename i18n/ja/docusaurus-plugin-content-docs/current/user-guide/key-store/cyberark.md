---
title: CyberArk シークレットストレージ
description: PVWA REST API を介して CyberArk Privileged Access Manager に Key Store シークレットを読み書きする Enterprise オプション。
sidebar_custom_props:
  edition: pro
---

# CyberArk シークレットストレージ <Enterprise />

Semaphore UI Enterprise は、データベースの代わりに **CyberArk Privileged Access Manager**（PAM Self-Hosted または Privilege Cloud）を Key Store シークレットの外部ストレージとして使用できます。Semaphore は Password Vault Web Access (PVWA) REST API と通信し、各 Semaphore キーは **Safe** 内の CyberArk **アカウント**にマッピングされます。

## 設定オプション {#configuration-options}

**Key Store → Storages** で **CyberArk** ストレージを作成する際は、以下を設定します：

| 項目 | 説明 |
|------|------|
| **サーバー URL** | PVWA のベースアドレス（例: `https://pvwa.example.com`）。末尾の `/PasswordVault` も受け入れられます。必須。 |
| **TLS 証明書の検証をスキップ** | 証明書の検証を無効化します。テスト環境専用です。 |
| **認証方法** | Semaphore ユーザーの PVWA ログオン方法: `CyberArk`（デフォルト）、`LDAP`、`RADIUS`、または `Windows`。 |
| **ユーザー名** | Semaphore がログオンに使用する PVWA ユーザー。必須。 |
| **パスワード** | そのユーザーのパスワード。データベースに保存、環境変数から読み取り、またはファイルから読み込み可能。 |
| **デフォルト Safe** | キーが Safe プレフィックスなしでアカウントを参照する場合に使用される Safe、およびデフォルトの同期パス。 |
| **新規アカウントのプラットフォーム ID** | Semaphore が作成するアカウントに割り当てられるプラットフォーム（例: `UnixSSH`）。ストレージが読み取り専用でなく Semaphore からキーを作成する場合のみ必須。 |
| **新規アカウントのアドレス** | Semaphore が作成するアカウントのオプションのアドレスプロパティ。一部のプラットフォームで必須です。 |

ストレージは読み取り専用モードで動作させることができます。このモードでは、Semaphore はアカウントの読み取りと同期のみを行い、Vault 内での作成・更新・削除は一切行いません。

### 必要な PVWA 権限 {#required-pvwa-permissions}

使用する各 Safe に対して、Semaphore ユーザーに以下の権限を付与してください：

| 操作 | Safe 権限 |
|------|-----------|
| キーの読み取り、同期 | **アカウントの一覧表示**、**アカウントの取得** |
| Semaphore からのキー作成 | **アカウントの追加** |
| Semaphore からのキー更新 | **パスワード値の更新**、**アカウントプロパティの更新** |
| Semaphore からのキー削除 | **アカウントの削除** |

Semaphore は常に同時 PVWA セッション（`concurrentSession`）を要求するため、複数の Semaphore ノードや実行中のタスクと定期同期が同一ユーザーを共有してもログアウトされません。これには PVWA 11.3 以降が必要です。

:::warning
Semaphore が使用する Safe に対して「理由の要求」やチケットシステム連携を有効にしないでください。Semaphore は固定の理由を送信しますが、チケット番号を提供することはできません。
:::

## 使用方法 {#how-to-use}

1. プロジェクトで **Key Store → Storages** を開き、**CyberArk** ストレージを作成します。
2. キーの作成または編集時にそのストレージを選択し、アカウントを `Safe/AccountName` として入力します。アカウント名は PVWA に表示されるオブジェクト名です。ストレージにデフォルト Safe が設定されている場合は、`AccountName` だけで十分です。
3. 必要に応じて [同期パス](/user-guide/key-store/secret-sync) を設定し、Safe 全体をスケジュールに従って自動インポートします。

### キータイプのマッピング {#key-type-mapping}

| Semaphore キータイプ | CyberArk アカウント |
|----------------------|--------------------|
| **パスワードでログイン** | パスワードアカウント: `userName` がログイン名になり、アカウントシークレットがパスワードになります。 |
| **SSH** | キーアカウント（`secretType: key`）: `userName` がログイン名になり、アカウントシークレットが秘密鍵になります。パスフレーズ付き SSH キーは CyberArk に保存できません。 |
| **シークレット / 文字列** | ユーザー名のないパスワードアカウント。アカウントシークレットがそのまま使用されます。 |

Semaphore がアカウントを作成する際、Central Policy Manager (CPM) による自動管理は無効化され、Semaphore が書き込んだばかりのシークレットを CyberArk がローテーションしないようにします。CyberArk によるローテーションを希望する場合は、PVWA からアカウントを管理し Semaphore 側ではストレージを読み取り専用に設定してください。

## シークレットの同期 {#syncing-secrets}

同期パスは Safe の名前です。Semaphore は Safe の各アカウントを、アカウント名（任意のプレフィックス付き）を冠したキーとしてインポートします。キータイプはアカウントから自動検出されます: キーアカウントは SSH キーに、ユーザー名付きパスワードアカウントはパスワードログインキーに、ユーザー名なしパスワードアカウントはプレーンシークレットになります。[リモートストレージからのシークレット同期](/user-guide/key-store/secret-sync) を参照してください。
