# はじめに

このページでは、新規インストールから最初のタスクの成功までを順を追って説明します。各ステップは詳細ページへのリンクになっています。

## ゼロから最初のタスクまで {#from-zero-to-first-task}

1. お好みの方法で **Semaphore をインストール**します: [インストール](/admin-guide/installation)。
2. セットアップ時に作成した管理者ユーザー、または Docker の場合は `SEMAPHORE_ADMIN_*` 変数で**ログイン**します。
3. **プロジェクトを作成します。** プロジェクトはチーム、インフラ、アプリケーションを互いに分離します: [プロジェクト](/user-guide/projects)。
4. **自動化に必要なものを接続します:**
   - playbook、モジュール、スクリプトを含むソースコード: [リポジトリ](/user-guide/repositories)。
   - SSH キー、トークン、パスワード: [キーストア](/user-guide/key-store)。
   - 対象ホストと接続設定: [インベントリ](/user-guide/inventory)。
   - 再利用可能な変数: [変数グループ](/user-guide/environment)。
5. **タスクテンプレートを作成して実行します。** お使いのツールのガイドを選択してください: [Ansible](/user-guide/apps/ansible)、[Terraform/OpenTofu](/user-guide/apps/terraform)、[Shell](/user-guide/apps/bash)、[PowerShell](/user-guide/apps/powershell)、または [Python](/user-guide/apps/python)。その後、実行して結果を確認します: [タスク](/user-guide/tasks)。
6. **自動化と運用化:**
   - スケジュールで実行する: [スケジュール](/user-guide/schedules)。
   - 誰が何をできるかを制御する: [チームとカスタムロール](/user-guide/team)。
   - 結果の通知を受け取る: [通知](/admin-guide/notifications)。

## 主要な概念 {#key-concepts}

これらの用語は UI のあらゆる場所に登場します。

| 用語 | 意味 |
|------|---------|
| **プロジェクト** | 分離の基本単位。各プロジェクトは独自のリポジトリ、キー、インベントリ、テンプレート、チームを持ちます。[プロジェクト](/user-guide/projects) |
| **リポジトリ** | playbook、モジュール、スクリプトが置かれている Git リポジトリまたはローカルパス。[リポジトリ](/user-guide/repositories) |
| **インベントリ** | Ansible スタイルの実行のためのホスト、グループ、接続設定。[インベントリ](/user-guide/inventory) |
| **変数グループ** | 再利用可能な変数と環境設定。Environment とも呼ばれます。[変数グループ](/user-guide/environment) |
| **キーストア** | SSH キー、トークン、パスワードなどの暗号化された認証情報。[キーストア](/user-guide/key-store) |
| **タスクテンプレート** | 実行の定義: アプリ、リポジトリ、インベントリ、変数、オプション。[タスクテンプレート](/user-guide/task-templates) |
| **タスク** | テンプレートの 1 回の実行。ログとステータスを持ちます。[タスク](/user-guide/tasks) |
| **ワークフロー** | 分岐、承認、遅延を含むテンプレートのグラフ。Pro 機能。[ワークフロー](/user-guide/workflows) |
| **Runner** | タスクが実行される場所: サーバー自体またはリモートの runner。[Runner](/admin-guide/runners) |

## 次のステップ {#next-steps}

- [リバースプロキシ](/admin-guide/reverse-proxy)を使って Semaphore を TLS の背後に配置する。
- ID プロバイダーを接続する: [LDAP](/admin-guide/authentication/ldap) または [OpenID Connect](/admin-guide/authentication/openid)。
- [API](/reference/api) と [CLI](/reference/cli) を使って、CI やスクリプトから Semaphore を操作する。
