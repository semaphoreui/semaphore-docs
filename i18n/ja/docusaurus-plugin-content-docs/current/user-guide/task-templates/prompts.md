# プロンプト

プロンプトは、テンプレートの種類ごとに用意されている定義済みのフラグやオプションで、有効にすると実行時にカスタマイズできるようになります。自分で作成するカスタム項目である[サーベイ変数](/user-guide/task-templates/survey-vars)とは異なり、プロンプトは Ansible、Terraform、その他のツールの特定の CLI フラグに対応する組み込みのオプションです。

この機能により、次のことができます。
- 実行時にテンプレートの既定値を上書きする
- 特定のホストやリソースを対象にする
- CLI フラグで実行の動作を制御する
- API 呼び出しやスケジュールから実行時のオプションを渡す

## プロンプトとサーベイ変数の違い {#prompts-vs-survey-variables}

| 機能 | プロンプト | サーベイ変数 |
|---------|---------|-----------------|
| **定義** | テンプレートの種類ごとに定義済みのオプション | 自分で作成するカスタム項目 |
| **例** | Ansible: `--limit`、`--tags`<br/>Terraform: ワークスペース、`-destroy` | 環境名、バージョン番号、任意のパラメーター |
| **設定方法** | テンプレートのチェックボックスで有効にする | テンプレートの設定で名前と種類を指定して追加する |
| **渡され方** | 組み込みの CLI フラグ | Ansible: `--extra-vars`<br/>Terraform: `-var` |

**プロンプト** は特定のツール向けに Semaphore に組み込まれた標準的なオプションであり、**サーベイ変数** は自分で定義する柔軟なカスタム項目です。

## Ansible のプロンプト {#ansible-prompts}

Ansible playbook のテンプレートでは、次の CLI オプションのプロンプトを有効にできます。

### Limit {#limit}

`--limit` のプロンプトを有効にすると、playbook を実行するときに対象とするホストを指定できます。

**CLI での同等の指定**: `ansible-playbook playbook.yml --limit webservers`

**ユースケース**:
- インベントリの一部のホストだけで playbook を実行する
- デプロイ対象のサーバーを限定する
- 全体に展開する前に 1 台のホストで変更をテストする

**例**:
- インベントリに 50 台の web サーバーが含まれている
- Limit のプロンプトを有効にする
- タスクの実行時に `web-01.example.com` を指定して、そのサーバーのみを対象にする
- あるいは `webservers:&production` を指定して、本番環境の web サーバーを対象にする

### Tags {#tags}

`--tags` のプロンプトを有効にすると、特定のタグが付いたタスクのみを実行できます。

**CLI での同等の指定**: `ansible-playbook playbook.yml --tags deploy,restart`

**ユースケース**:
- playbook の特定の部分のみを実行する
- 構成のタスクを実行せずにデプロイの手順だけを実行する
- playbook 全体を実行せずにサービスを素早く再起動する

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

Tags のプロンプトを有効にして `deploy,restart` を入力すると、インストールの手順をスキップできます。

### Skip Tags {#skip-tags}

`--skip-tags` のプロンプトを有効にすると、特定のタグが付いたタスクをスキップできます。

**CLI での同等の指定**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**ユースケース**:
- 本番環境では任意のタスクをスキップする
- デバッグ用やテスト用のタスクを除外する
- 不要なときに時間のかかるタスクを回避する

**例**: 上記の playbook で Skip Tags を有効にして `install` を入力すると、パッケージのインストールをスキップして、デプロイと再起動のタスクのみを実行できます。

### Skip Galaxy install {#skip-galaxy-install}

このプロンプトを有効にすると、タスクの実行時にロールとコレクションの `ansible-galaxy install` の手順をユーザーがスキップできるようになります。

**ユースケース**:
- 必要な依存関係がランナーのイメージに既にインストールされている
- `requirements.yml` に変更がない場合に、繰り返しの実行時間を短縮する

### Force Galaxy install {#force-galaxy-install}

このプロンプトを有効にすると、Semaphore が実行間で保持している requirements のチェックサムを無視して、すべての requirements ファイルに対して `ansible-galaxy install --force` を強制実行できるようになります。

**CLI での同等の指定**: `ansible-galaxy role install -r requirements.yml --force`

**ユースケース**:
- requirements ファイルが固定バージョンではなくブランチを参照していて、最新のコミットが必要な場合
- 前回のインストールでロールやコレクションが壊れた状態になっている場合
- 依存関係がクリーンな状態で playbook が動作することを確認したい場合

テンプレートレベルの既定値の動作については、[Galaxy の requirements](../apps/ansible.md#galaxy-requirements)を参照してください。

### Ansible のプロンプトを有効にする {#enabling-ansible-prompts}

Ansible のプロンプトを有効にする手順は次のとおりです。

1. **タスクテンプレート** を開き、対象の Ansible テンプレートを選択します
2. テンプレートの設定で **Ansible Prompts** のセクションを探します
3. 使用したいプロンプトのチェックボックスを有効にします。
   - ☐ **Limit** - `--limit` フラグを有効にします
   - ☐ **Tags** - `--tags` フラグを有効にします
   - ☐ **Skip Tags** - `--skip-tags` フラグを有効にします
   - ☐ **Debug** - 詳細度（`-v`）の選択を有効にします
   - ☐ **Skip Galaxy install** - `ansible-galaxy install` のスキップを許可します
   - ☐ **Force Galaxy install** - `ansible-galaxy install --force` の強制実行を許可します
4. テンプレートを保存します

![](/assets/ansible_2.png)

有効にすると、これらの項目はタスクの実行フォーム、API リクエスト、スケジュールの設定に表示されます。

## Terraform/OpenTofu のプロンプト {#terraformopentofu-prompts}

Terraform および OpenTofu のテンプレートでは、Semaphore がいくつかの組み込みのプロンプトを提供します。

### ワークスペースの選択 {#workspace-selection}

タスクの実行に使用する Terraform のワークスペースを選択します。

**CLI での同等の指定**: `terraform workspace select staging`

**ユースケース**:
- 複数の環境（dev、staging、production）を管理する
- 構成ごとに state ファイルを分離する
- インフラの変更を隔離してテストする

**セットアップ**:
1. テンプレートの **ワークスペース** タブでワークスペースを作成します
2. ワークスペースの選択項目がタスクのフォームに自動的に表示されます
3. ユーザーはタスクの実行時に対象のワークスペースを選択します

詳細なセットアップについては、[Terraform のワークスペース](/user-guide/apps/terraform/workspaces)を参照してください。

### Destroy フラグ {#destroy-flag}

`-destroy` フラグを有効にすると、インフラを破棄できます。

**CLI での同等の指定**: `terraform apply -destroy`

**ユースケース**:
- 一時的なテスト環境をクリーンアップする
- インフラを廃止する
- 特定のリソースを削除する

**重要**: これは破壊的な操作です。十分に注意して使用し、ワークフローで確認を必須にすることを検討してください。

### Migrate State フラグ {#migrate-state-flag}

バックエンドの構成を変更するときに `-migrate-state` フラグを有効にします。

**CLI での同等の指定**: `terraform init -migrate-state`

**ユースケース**:
- state を別のバックエンドに移動する
- ストレージの場所を移行する
- バックエンドの構成を更新する

### Terraform のプロンプトを有効にする {#enabling-terraform-prompts}

Terraform のプロンプトはテンプレートの設定で利用できます。

1. **タスクテンプレート** を開き、対象の Terraform テンプレートを選択します
2. テンプレートの設定で利用可能なプロンプトを構成します。
   - ワークスペースの選択（ワークスペースが構成されている場合は自動的に有効になります）
   - Destroy フラグのオプション
   - Migrate state のオプション
3. テンプレートを保存します

Terraform のタスクを実行すると、タスクのフォームにこれらのオプションが表示されます。

## Bash、PowerShell、Python のプロンプト {#bash-powershell-and-python-prompts}

Bash、PowerShell、Python のテンプレートでは、カスタマイズのほとんどが[サーベイ変数](/user-guide/task-templates/survey-vars)で処理されるため、プロンプトは最小限です。

利用できるプロンプトは次のとおりです。

- CLI 引数
- ブランチ

これらのテンプレートの種類では、スクリプトにパラメーターを渡すためにカスタムのサーベイ変数を使用する方が適しています。

## プロンプトの使用 {#using-prompts}

### 手動でのタスク実行 {#manual-task-execution}

プロンプトが有効なテンプレートからタスクを実行する場合は、次のようになります。

1. テンプレートの **実行** をクリックします
2. 有効なプロンプトの項目を含むフォームが表示されます
3. 使用したいプロンプトの値を入力します（任意の項目は空のままでもかまいません）
4. **タスクを実行** をクリックします

タスクは、指定したプロンプトの値を CLI フラグとして渡して実行されます。

### API 呼び出し {#api-calls}

API でプロンプトの値を渡すには、リクエストのペイロードに含めます。

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

**重要**: 値が受け付けられるには、対応するプロンプトがテンプレートで有効になっている必要があります。有効にしないまま API でプロンプトの値を渡した場合、その値は無視されます。

### スケジュールされたタスク {#scheduled-tasks}

スケジュールにプロンプトの値を含めて、自動実行されるタスクをカスタマイズできます。

**例**: Ansible のプロンプトを使用したスケジュール
- `limit: "production"` と `tags: "deploy"` を指定した日次のデプロイスケジュール
- `tags: "updates,cleanup"` を指定した週次のメンテナンススケジュール

スケジュールの設定でプロンプトの値を構成すると、スケジュールされた各実行で指定したオプションが使用されます。

### インテグレーションと Webhook {#integrations-and-webhooks}

インテグレーションは Webhook から値を抽出し、それをプロンプトにマッピングできます。

**例**: GitHub の Webhook でデプロイを開始する
- Webhook からブランチ名を抽出します
- Limit のプロンプトにマッピングして、特定の環境を対象にします
- そのブランチの環境に一致するサーバーにのみデプロイします

Webhook の設定については、[インテグレーション](../integrations)を参照してください。

## ベストプラクティス {#best-practices}

### 必要なプロンプトのみを有効にする {#enable-only-necessary-prompts}

プロンプトを有効にするたびに、タスクのフォームに項目が追加されます。実際にユーザーがカスタマイズする必要のあるプロンプトのみを有効にしてください。

✅ **良い例**: 特定のホストを対象にする必要がある運用チームのために Limit を有効にする
❌ **悪い例**: 「念のため」すべてのプロンプトを有効にする

### サーベイ変数と組み合わせる {#combine-with-survey-variables}

ツール固有の CLI オプションにはプロンプトを、任意のパラメーターにはサーベイ変数を使用してください。

**Ansible テンプレートの例:**
- **プロンプト**: Limit（対象のホスト）、Tags（対象のタスク）
- **サーベイ変数**: `app_version`（対象のバージョン）、`enable_rollback`（独自のロジック）

### API の使い方を文書化する {#document-api-usage}

テンプレートを API から実行する場合は、利用できるプロンプトとその想定される形式を文書化してください。

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

破壊的になりうる playbook は、必ず最初に Limit のプロンプトを使ってテストしてください。

1. テンプレートで Limit のプロンプトを有効にします
2. 1 回目の実行: `limit: "test-server-01"` を指定して 1 台のホストでテストします
3. 成功を確認します
4. 2 回目の実行: `limit: "production"` を指定してすべてのホストに展開します

### プロンプトの組み合わせを検証する {#validate-prompt-combinations}

組み合わせとして成立しないプロンプトもあります。ドキュメントや検証を追加してください。

- `--tags deploy` と `--skip-tags deploy` を同時に使うと競合します
- ワークスペースと destroy フラグの両方を指定する場合は、特に注意が必要です

## よくあるユースケース {#common-use-cases}

### Limit による段階的な展開 {#gradual-rollout-with-limit}

Ansible の Limit を使って本番環境に段階的にデプロイします。

1. 1 回目: `limit: "web-01.example.com"` - 1 台のサーバーにデプロイします
2. 問題がないか監視します
3. 2 回目: `limit: "webservers:&canary"` - カナリアのサーバーにデプロイします
4. メトリクスを検証します
5. 3 回目: `limit: "webservers:&production"` - 全体に展開します

### Tags による選択的な実行 {#selective-execution-with-tags}

Tags を使って playbook の特定の部分のみを実行します。

**午前**: `tags: "deploy"` - 新しいバージョンをデプロイします
**午後**: `tags: "config"` - 構成を更新します
**夕方**: `tags: "restart"` - 新しい構成でサービスを再起動します

### ワークスペースによる環境の管理 {#environment-management-with-workspaces}

環境の管理には Terraform のワークスペースの選択を使用します。

- **開発**: `dev` ワークスペースを選択します - 低コストのリソースで素早く反復できます
- **ステージング**: `staging` ワークスペースを選択します - テスト用に本番に近い環境です
- **本番**: `prod` ワークスペースを選択します - 本番のインフラ全体です

### Destroy によるクリーンアップ {#cleanup-with-destroy}

一時的なインフラには Terraform の destroy を使用します。

1. テスト環境を作成します: ワークスペース `test-branch-123` で実行します
2. 統合テストを実行します
3. クリーンアップします: destroy フラグを有効にして、ワークスペース `test-branch-123` で実行します

## トラブルシューティング {#troubleshooting}

### プロンプトの値が無視される {#prompt-values-ignored}

**問題**: プロンプトの値を渡しているのに反映されません

**解決策**: 対応するプロンプトがテンプレートの設定で有効になっているか確認してください。プロンプトは明示的に有効にする必要があります。

### limit を指定できない {#cannot-specify-limit}

**問題**: タスクのフォームに Limit の項目が表示されません

**解決策**: 
1. テンプレートを編集します
2. 「Ansible Prompts」のセクションを探します
3. 「Limit」のチェックボックスを有効にします
4. テンプレートを保存します

### プロンプトの値を指定した API 呼び出しが失敗する {#api-calls-fail-with-prompt-values}

**問題**: プロンプトの値を含む API リクエストがエラーを返します

**解決策**: 
1. テンプレートでプロンプトが有効になっていることを確認します
2. リクエストボディの JSON の形式を確認します
3. 項目名が完全に一致していることを確認します（`host_limit` ではなく `limit`）

### Tags でタスクが絞り込まれない {#tags-not-filtering-tasks}

**問題**: tags を指定しているのに、すべてのタスクが実行されます

**解決策**: 
1. playbook のタスクにタグが正しく定義されていることを確認します
2. タグ名のタイプミスを確認します
3. タグがスペースなしでカンマ区切りになっていることを確認します（`deploy, restart` ではなく `deploy,restart`）

## 関連ドキュメント {#related-documentation}

- [サーベイ変数](/user-guide/task-templates/survey-vars) - テンプレートのカスタム項目
- [Ansible のテンプレート](/user-guide/apps/ansible) - Ansible 固有の設定
- [Terraform のテンプレート](/user-guide/apps/terraform) - Terraform 固有の設定
- [スケジュール](../schedules) - タスクの自動実行
- [インテグレーション](../integrations) - Webhook で開始するタスク
- [API ドキュメント](../../reference/api) - API リファレンス
