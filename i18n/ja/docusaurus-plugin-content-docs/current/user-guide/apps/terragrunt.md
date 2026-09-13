# Terragrunt

[Terragrunt](https://terragrunt.gruntwork.io/) は Terraform と OpenTofu のラッパーで、構成を DRY に保ち、モジュール間の依存関係を管理します。Semaphore は [Terraform/OpenTofu](./terraform) と同じ方法で実行しますが、ここで説明するいくつかの違いがあります。

## 前提条件 {#prerequisites}

1. Semaphore サーバー、またはタスクを実行する[ランナー](/admin-guide/runners)に、`terragrunt` のバイナリと `terraform` または `tofu` のバイナリをインストールします。
2. **Terragrunt Code** アプリケーションを有効にします。既定では無効になっています。アカウントメニューから **アプリケーション** を開いてスイッチをオンにしてください。[アプリケーション](/user-guide/apps)を参照してください。

## Terragrunt テンプレートの作成 {#creating-a-terragrunt-template}

1. **タスクテンプレート** に移動し、**新しいテンプレート** をクリックします。
2. アプリとして **Terragrunt Code** を選択します。
3. **リポジトリ** と、`terragrunt.hcl` があるサブディレクトリを設定します。
4. インベントリのフィールドで **ワークスペース** を選択または作成します。Terragrunt テンプレートは `terragrunt-workspace` の種類のインベントリを使用します。[ワークスペース](./terraform/workspaces)を参照してください。
5. **作成** をクリックし、続いて **実行** をクリックします。

![Terragrunt テンプレート](/assets/templates-list.webp)

## タスクの実行 {#running-tasks}

新しいタスクのダイアログには、Terraform と同じオプション（**Plan**、**Destroy**、**Auto Approve**、**Upgrade**、**Reconfigure**）が表示されます。

Semaphore は `terragrunt run -- <terraform arguments>` を呼び出し、テンプレートの CLI 引数で `--tf-path` をすでに設定していない限り、`--tf-path` で Terraform または OpenTofu のバイナリを渡します。ワークスペースの選択は `terragrunt run -- workspace select -or-create=true <name>` で行われます。

選択した **変数グループ** の変数は環境変数として渡されるため、入力変数には `TF_VAR_` プレフィックスを使用してください。追加変数とサーベイ変数は `-var name=value` の引数として渡されます。

## 注意事項 {#notes}

- `terragrunt` は、すべてのコマンドの前に自動的に `init` を実行します。
- HTTP の state バックエンドと **ワークスペース** タブの state 一覧は、Terraform と同様に動作します。[HTTP バックエンド](./terraform/states)を参照してください。
- 複数のモジュールに対して `run-all` を使用するには、テンプレートの **CLI 引数** に引数を追加してください。
