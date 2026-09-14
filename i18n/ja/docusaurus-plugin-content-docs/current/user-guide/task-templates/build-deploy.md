# ビルド・デプロイテンプレート

単純な **タスク** テンプレートのほかに、Semaphore には簡単なパイプラインを構成する 2 つのテンプレートの種類があります。**ビルド** はバージョン付きのアーティファクトを作成し、**デプロイ** は選択したバージョンをサーバーへ配布します。どちらの種類もテンプレートのフォームで選択し、タスクの開始時にユーザーに表示される内容が変わります。

## ビルドテンプレート {#build-templates}

ビルドテンプレートは、tarball、コンテナーイメージ、パッケージなどのアーティファクトを生成します。各ビルドタスクには、テンプレートの **開始バージョン**（たとえば `1.0.0`）から自動的に増加するバージョンが割り当てられます。バージョンは、テンプレート一覧とタスク履歴の **バージョン** 列に表示されます。

<div class="DialogScreenshot">
  ![ビルドテンプレートの新しいタスクのダイアログ](/assets/task-new-build.webp)
</div>

playbook では `semaphore_vars.task_details.target_version` を使ってこのバージョンを参照し、アーティファクトの名前に利用できます。

## デプロイテンプレート {#deploy-templates}

デプロイテンプレートは、**ビルドテンプレート** フィールドでビルドテンプレートに関連付けられます。ユーザーが **デプロイ** をクリックすると、新しいタスクのダイアログでデプロイする **ビルドバージョン** を尋ねられます。直近の成功したビルドがあらかじめ選択されています。

<div class="DialogScreenshot">
![デプロイテンプレートの新しいタスクのダイアログ](/assets/task-new-deploy.webp)
</div>

デプロイテンプレートで **自動実行** を有効にすると、ビルドが成功するたびに自動的にデプロイが開始されます。デプロイするバージョンは、playbook 内で `semaphore_vars.task_details.incoming_version` として利用できます。

## `semaphore_vars` 変数 {#the-semaphore_vars-variable}

Semaphore は、実行する各 Ansible playbook に `semaphore_vars` 変数を渡します。これを使って、実行されたタスクの種類、ビルドまたはデプロイするバージョン、タスクを実行したユーザー、タスクのメッセージを知ることができます。

`build` タスクの例:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

`deploy` タスクの例:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

**Bash**、**PowerShell**、**Python** のテンプレートでは、Semaphore は同じ `task_details` の値を環境変数として提供します。

| `task_details` のフィールド | 環境変数 | 備考 |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` または `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | タスクを開始したユーザー |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | タスクのメッセージ |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | `build` タスクで設定されます |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | `deploy` タスクで設定されます |

Bash の例:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

PowerShell の例:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Python の例:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## パイプラインの例 {#example-pipeline}

`build` の Ansible ロール:

1. GitHub からアプリのソースコードを取得します。
2. ソースコードをコンパイルします。
3. バイナリを `app-{{ semaphore_vars.task_details.target_version }}.tar.gz` にパッケージングします。
4. tarball を S3 バケットにアップロードします。

`deploy` の Ansible ロール:

1. S3 バケットから `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` を対象サーバーへダウンロードします。
2. それを配置先のディレクトリに展開します。
3. 設定ファイルを作成または更新します。
4. アプリのサービスを再起動します。

3 つ以上のステップをつなげたり、承認を追加したり、失敗時に分岐したりするには、[ワークフロー](../workflows)を使用してください。
