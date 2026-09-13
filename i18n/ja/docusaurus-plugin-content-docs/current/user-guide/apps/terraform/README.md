
# Terraform/OpenTofu

Semaphore UI を使用して Terraform コードを実行できます。そのためには、**Terraform コードテンプレート**を作成する必要があります。

1. **タスクテンプレート**セクションに移動し、**新しいテンプレート**ボタンをクリックします。
2. アプリの種類として **Terraform** を選択します。
3. テンプレートを設定し、**作成**ボタンをクリックします。
4. **実行**をクリックしてテンプレートを実行します。

## 変数の受け渡し {#passing-variables}

選択した**変数グループ**の変数は環境変数として注入されます。Terraform が入力変数として認識できるように、名前の先頭に `TF_VAR_` を付けてください。

| 変数グループのキー | Terraform の変数 |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

機密性の高い値には、変数グループの**シークレット**タブを使用してください。これらは保存時に暗号化されます。

## ワークスペース {#workspaces}

Semaphore は Terraform/OpenTofu のワークスペースをネイティブにサポートしています。ワークスペースの作成と切り替え、およびプライベートモジュール用の SSH キーの使用については、[ワークスペース](./workspaces)を参照してください。

## バックエンドの上書きと HTTP バックエンド (Pro) {#backend-override-and-http-backend-pro}

Terraform コードを変更することなく、テンプレートでバックエンドを上書きして組み込みの HTTP バックエンドを使用できます。詳細は [HTTP バックエンド (Pro)](./states) を参照してください。

## Destroy フラグとステートの移行 {#destroy-flag-and-state-migration}

タスク実行ダイアログには `-destroy` と `-migrate-state` のトグルがあります。インフラストラクチャを破棄する場合や Terraform のステートを移行する場合に使用してください。

## 注意事項 {#notes}

- Semaphore は各実行の前に自動的に `terraform init` を実行します。
- 組み込みの HTTP バックエンド (Pro) を使用しない限り、ステートは Terraform コードで設定されているバックエンド (local、S3、GCS など) によって管理されます。
