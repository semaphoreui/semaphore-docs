# プロンプト

プロンプトは、各テンプレートタイプに固有の事前定義されたフラグやオプションで、有効にすると実行時のカスタマイズが可能になります。自分で作成するカスタムフィールドである[サーベイ変数](/user-guide/task-templates/survey-vars)とは異なり、プロンプトは Ansible、Terraform などのツールの特定の CLI フラグに対応する組み込みオプションです。

この機能により、次のことが可能になります。
- 実行時にテンプレートのデフォルトを上書きする
- 特定のホストやリソースを対象にする
- CLI フラグで実行動作を制御する
- API 呼び出しやスケジュール経由で実行時オプションを渡す

## プロンプトとサーベイ変数の違い {#prompts-vs-survey-variables}

| 機能 | プロンプト | サーベイ変数 |
|---------|---------|-----------------|
| **定義** | 事前定義されたテンプレート固有のオプション | 自分で作成するカスタムフィールド |
| **例** | Ansible: `--limit`、`--tags`<br/>Terraform: ワークスペース、`-destroy` | 環境名、バージョン番号、カスタムパラメーター |
| **設定方法** | テンプレートのチェックボックスで有効化 | テンプレート設定で名前とタイプを指定して追加 |
| **渡し方** | 組み込みの CLI フラグ | Ansible: `--extra-vars`<br/>Terraform: `-var` |

**プロンプト**は特定のツール向けに Semaphore に組み込まれた標準化されたオプションであり、**サーベイ変数**は自分で定義する柔軟なカスタムフィールドです。

## Ansible のプロンプト {#ansible-prompts}

Ansible playbook テンプレートでは、次の CLI オプションに対応するプロンプトを有効にできます。

### Limit {#limit}

`--limit` プロンプトを有効にすると、playbook 実行時に対象とするホストを指定できます。

**CLI での同等の操作**: `ansible-playbook playbook.yml --limit webservers`

**ユースケース**:
- inventory 内の一部のホストで playbook を実行する
- デプロイ対象として特定のサーバーを指定する
- 展開前に 1 台のホストで変更をテストする

**例**:
- inventory に 50 台の Web サーバーが含まれている
- Limit プロンプトを有効にする
- タスク実行時に `web-01.example.com` を指定すると、そのサーバーだけが対象になる
- または `webservers:&production` を指定すると、本番の Web サーバーだけが対象になる

### Tags {#tags}

`--tags` プロンプトを有効にすると、特定のタグが付いたタスクのみを実行できます。

**CLI での同等の操作**: `ansible-playbook playbook.yml --tags deploy,restart`

**ユースケース**:
- playbook の特定の部分だけを実行する
- 設定タスクを除いてデプロイ手順だけを実行する
- playbook 全体を実行せずにサービスをすばやく再起動する

**例**:
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Tags プロンプトを有効にして `deploy,restart` と入力すると、インストール手順をスキップできます。

### Skip Tags {#skip-tags}

`--skip-tags` プロンプトを有効にすると、特定のタグが付いたタスクをスキップできます。

**CLI での同等の操作**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**ユースケース**:
- 本番環境で任意のタスクをスキップする
- デバッグ用やテスト用のタスクを除外する
- 不要な場合に時間のかかるタスクを省略する

**例**: 上記の playbook で Skip Tags を有効にして `install` と入力すると、パッケージのインストールをスキップし、デプロイと再起動のタスクだけを実行します。

### Ansible のプロンプトを有効にする {#enabling-ansible-prompts}

Ansible のプロンプトを有効にするには:

1. **タスクテンプレート**に移動し、Ansible テンプレートを選択します
2. テンプレート設定の **Ansible プロンプト**セクションを探します
3. 必要なプロンプトのチェックボックスを有効にします:
   - ☐ **Limit** - `--limit` フラグを有効にする
   - ☐ **Tags** - `--tags` フラグを有効にする
   - ☐ **Skip Tags** - `--skip-tags` フラグを有効にする
4. テンプレートを保存します

![](/assets/ansible_2.png)

有効にすると、これらのフィールドがタスク実行フォーム、API リクエスト、スケジュール設定に表示されます。

## Terraform/OpenTofu のプロンプト {#terraformopentofu-prompts}

Terraform および OpenTofu テンプレートでは、Semaphore はいくつかの組み込みプロンプトを提供します。

### ワークスペースの選択 {#workspace-selection}

タスク実行に使用する Terraform ワークスペースを選択します。

**CLI での同等の操作**: `terraform workspace select staging`

**ユースケース**:
- 複数の環境（dev、staging、production）を管理する
- 設定ごとに state ファイルを分離する
- インフラの変更を隔離してテストする

**セットアップ**:
1. テンプレートの**ワークスペース**タブでワークスペースを作成します
2. ワークスペースセレクターがタスクフォームに自動的に表示されます
3. ユーザーはタスク実行時に対象のワークスペースを選択します

詳細なセットアップについては [Terraform ワークスペース](/user-guide/apps/terraform/workspaces)を参照してください。

### Destroy フラグ {#destroy-flag}

`-destroy` フラグを有効にすると、インフラを破棄できます。

**CLI での同等の操作**: `terraform apply -destroy`

**ユースケース**:
- 一時的なテスト環境をクリーンアップする
- インフラを廃止する
- 特定のリソースを削除する

**重要**: これは破壊的な操作です。慎重に使用し、ワークフローで確認を必須にすることを検討してください。

### Migrate State フラグ {#migrate-state-flag}

バックエンド設定を変更する際は、`-migrate-state` フラグを有効にします。

**CLI での同等の操作**: `terraform init -migrate-state`

**ユースケース**:
- state を別のバックエンドに移動する
- ストレージの場所間で移行する
- バックエンド設定を更新する

### Terraform のプロンプトを有効にする {#enabling-terraform-prompts}

Terraform のプロンプトはテンプレート設定で利用できます。

1. **タスクテンプレート**に移動し、Terraform テンプレートを選択します
2. テンプレート設定で利用可能なプロンプトを設定します:
   - ワークスペースの選択（ワークスペースが設定されている場合は自動的に有効）
   - Destroy フラグのオプション
   - Migrate state のオプション
3. テンプレートを保存します

Terraform タスクの実行時に、タスクフォームにこれらのオプションが表示されます。

## Bash、PowerShell、Python のプロンプト {#bash-powershell-and-python-prompts}

Bash、PowerShell、Python テンプレートでは、ほとんどのカスタマイズが[サーベイ変数](/user-guide/task-templates/survey-vars)で行われるため、プロンプトは最小限です。

利用可能なプロンプトは次のとおりです。

- CLI 引数
- ブランチ

これらのテンプレートタイプでは、スクリプトにパラメーターを渡す手段として、カスタムのサーベイ変数の方が効果的です。

## プロンプトの使用 {#using-prompts}

### 手動でのタスク実行 {#manual-task-execution}

プロンプトが有効なテンプレートからタスクを実行する場合:

1. テンプレートの**実行**をクリックします
2. 有効なプロンプトフィールドを含むフォームが表示されます
3. 使用するプロンプトの値を入力します（任意のフィールドは空のままで構いません）
4. **タスクを実行**をクリックします

指定したプロンプトの値が CLI フラグとして渡され、タスクが実行されます。

### API 呼び出し {#api-calls}

API 経由でプロンプトの値を渡すには、リクエストペイロードに含めます。

**Ansible の例:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**重要**: 値が受け付けられるためには、テンプレートでプロンプトが有効になっている必要があります。プロンプトを有効にせずに API 経由で値を渡した場合、それらの値は無視されます。

### スケジュールされたタスク {#scheduled-tasks}

スケジュールにプロンプトの値を含めることで、自動タスク実行をカスタマイズできます。

**例**: Ansible プロンプト付きのスケジュール
- `limit: "production"` と `tags: "deploy"` を指定した日次デプロイスケジュール
- `tags: "updates,cleanup"` を指定した週次メンテナンススケジュール

スケジュール設定でプロンプトの値を設定すると、スケジュールされた各実行で指定したオプションが使用されます。

### インテグレーションと webhook {#integrations-and-webhooks}

インテグレーションは webhook から値を抽出し、プロンプトにマッピングできます。

**例**: GitHub webhook によるデプロイのトリガー
- webhook からブランチ名を抽出する
- Limit プロンプトにマッピングして特定の環境を対象にする
- ブランチの環境に一致するサーバーだけにデプロイする

webhook の設定については[インテグレーション](../integrations)を参照してください。

## ベストプラクティス {#best-practices}

### 必要なプロンプトだけを有効にする {#enable-only-necessary-prompts}

有効にしたプロンプトごとに、タスクフォームにフィールドが追加されます。ユーザーが実際にカスタマイズする必要のあるプロンプトだけを有効にしてください。

✅ **良い例**: 特定のホストを対象にする必要がある運用チーム向けに Limit を有効にする
❌ **悪い例**: 「念のため」すべてのプロンプトを有効にする

### サーベイ変数と組み合わせる {#combine-with-survey-variables}

ツール固有の CLI オプションにはプロンプトを、カスタムパラメーターにはサーベイ変数を使用します。

**Ansible テンプレートの例:**
- **プロンプト**: Limit（どのホストか）、Tags（どのタスクか）
- **サーベイ変数**: `app_version`（どのバージョンか）、`enable_rollback`（カスタムロジック）

### API の使用方法を文書化する {#document-api-usage}

テンプレートが API 経由でトリガーされる場合は、利用可能なプロンプトと期待される形式を文書化してください。

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### 安全なテストのために Limit を使用する {#use-limit-for-safe-testing}

破壊的な可能性のある playbook は、必ず最初に Limit プロンプトを使ってテストしてください。

1. テンプレートで Limit プロンプトを有効にする
2. 1 回目の実行: `limit: "test-server-01"` を指定して 1 台のホストでテストする
3. 成功を確認する
4. 2 回目の実行: `limit: "production"` を指定してすべてのホストに展開する

### プロンプトの組み合わせを検証する {#validate-prompt-combinations}

プロンプトの組み合わせによっては意味をなさないものがあります。文書化または検証を追加してください。

- `--tags deploy` と `--skip-tags deploy` の併用は矛盾する
- ワークスペースと destroy フラグを同時に指定する場合は特に注意が必要

## 一般的なユースケース {#common-use-cases}

### Limit を使った段階的な展開 {#gradual-rollout-with-limit}

Ansible の Limit を使って本番環境に段階的にデプロイします。

1. 実行 1: `limit: "web-01.example.com"` - 1 台のサーバーにデプロイ
2. 問題がないか監視する
3. 実行 2: `limit: "webservers:&canary"` - カナリアサーバーにデプロイ
4. メトリクスを検証する
5. 実行 3: `limit: "webservers:&production"` - 全体に展開

### Tags を使った選択的な実行 {#selective-execution-with-tags}

Tags を使って playbook の特定の部分だけを実行します。

**朝**: `tags: "deploy"` - 新しいバージョンをデプロイ
**午後**: `tags: "config"` - 設定を更新
**夕方**: `tags: "restart"` - 新しい設定でサービスを再起動

### ワークスペースを使った環境管理 {#environment-management-with-workspaces}

環境管理には Terraform のワークスペース選択を使用します。

- **開発**: `dev` ワークスペースを選択 - 安価なリソース、高速なイテレーション
- **ステージング**: `staging` ワークスペースを選択 - テスト用の本番相当環境
- **本番**: `prod` ワークスペースを選択 - 本番インフラ全体

### Destroy を使ったクリーンアップ {#cleanup-with-destroy}

一時的なインフラには Terraform の destroy を使用します。

1. テスト環境を作成: ワークスペース `test-branch-123` で実行
2. 統合テストを実行
3. クリーンアップ: destroy フラグを有効にし、ワークスペース `test-branch-123` で実行

## トラブルシューティング {#troubleshooting}

### プロンプトの値が無視される {#prompt-values-ignored}

**問題**: プロンプトの値を渡しているのに反映されない

**解決策**: テンプレート設定で対応するプロンプトが有効になっているか確認してください。プロンプトは明示的に有効にする必要があります。

### Limit を指定できない {#cannot-specify-limit}

**問題**: タスクフォームに Limit フィールドが表示されない

**解決策**: 
1. テンプレートを編集します
2. 「Ansible プロンプト」セクションを探します
3. 「Limit」チェックボックスを有効にします
4. テンプレートを保存します

### プロンプトの値を含む API 呼び出しが失敗する {#api-calls-fail-with-prompt-values}

**問題**: プロンプトの値を含む API リクエストがエラーを返す

**解決策**: 
1. テンプレートでプロンプトが有効になっていることを確認します
2. リクエストボディの JSON 形式を確認します
3. フィールド名が完全に一致していることを確認します（`host_limit` ではなく `limit`）

### Tags でタスクが絞り込まれない {#tags-not-filtering-tasks}

**問題**: タグを指定してもすべてのタスクが実行される

**解決策**: 
1. playbook 内のタスクに適切なタグが定義されているか確認します
2. タグ名に誤字がないか確認します
3. タグがスペースなしのカンマ区切りになっていることを確認します: `deploy, restart` ではなく `deploy,restart`

## 関連ドキュメント {#related-documentation}

- [サーベイ変数](/user-guide/task-templates/survey-vars) - テンプレート用のカスタムフィールド
- [Ansible テンプレート](/user-guide/apps/ansible) - Ansible 固有の設定
- [Terraform テンプレート](/user-guide/apps/terraform) - Terraform 固有の設定
- [スケジュール](../schedules) - タスクの自動実行
- [インテグレーション](../integrations) - webhook でトリガーされるタスク
- [API ドキュメント](../../admin-guide/api) - API リファレンス
