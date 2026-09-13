# サーベイ変数

サーベイ変数は、タスク実行時にユーザーの入力を収集するためにタスクテンプレートに追加できるカスタム入力フィールドです。playbook やスクリプトに値をハードコードする代わりに、実行時にユーザーに値の入力を求めるカスタム変数を定義できます。

この機能は次のような用途に役立ちます。
- 同じテンプレートを異なるパラメーター（例: 設定値）で実行する
- API 呼び出し経由で動的な入力を受け付ける
- スケジュールされたタスクにカスタムパラメーターを渡す
- webhook から抽出したデータを使ってインテグレーションからタスクをトリガーする

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## サーベイ変数とプロンプトの違い {#survey-variables-vs-prompts}

サーベイ変数とプロンプトの違いを理解しておくことが重要です。

| 機能 | サーベイ変数 | プロンプト |
|---------|-----------------|---------|
| **定義** | 自分で作成するカスタムフィールド | 事前定義されたテンプレート固有のオプション |
| **例** | 環境名、バージョン番号、API エンドポイント | Ansible: `--limit`、`--tags`<br/>Terraform: ワークスペース |
| **設定方法** | テンプレート設定で名前とタイプを指定して追加 | テンプレートのチェックボックスで有効化 |
| **渡し方** | Ansible: `--extra-vars`<br/>Terraform: `-var` | 組み込みの CLI フラグ |

**サーベイ変数**は自分で定義する柔軟なカスタムフィールドであり、**プロンプト**は各テンプレートタイプに固有の組み込みオプション（Ansible の `--limit` や `--tags` フラグなど）です。

## テンプレートにサーベイ変数を追加する {#adding-survey-variables-to-a-template}

サーベイ変数はテンプレート設定で構成します。

1. **タスクテンプレート**に移動し、テンプレートを選択します
2. テンプレート設定の**サーベイ変数**セクションに移動します
3. **サーベイ変数を追加**をクリックします
4. 変数を設定します:
   - **名前**: 変数名（コード内で使用します）
   - **タイトル**: フォームに表示されるラベル
   - **タイプ**: フィールドのタイプを選択します
   - **変数の渡し方**: 追加変数（デフォルト）または環境変数
   - **デフォルト値**: タスクフォームを開いたときにあらかじめ入力される任意の値
   - **必須**: フィールドの入力を必須にするかどうか
5. テンプレートを保存します

ユーザーがこのテンプレートからタスクを実行すると、定義したカスタムサーベイ変数を含むフォームが表示されます。

## 変数のタイプ {#variable-types}

サーベイ変数は 6 つのタイプをサポートしています。

### 文字列 {#string}

文字列値用のテキスト入力フィールドです。

**ユースケース**: 環境名、ブランチ名、ホスト名、ファイルパス

**例**: `environment` という名前の変数で、ユーザーに "production"、"staging"、"development" のいずれかの入力を求める

### 整数 {#integer}

整数値用の数値入力フィールドです。

**ユースケース**: ポート番号、リトライ回数、タイムアウト、リソース制限

**例**: `timeout_seconds` という名前の変数で、ユーザーに "300" や "600" の入力を求める

### テキスト {#text}

長い文字列値用の複数行テキストエリアです。

**ユースケース**: commit メッセージ、JSON スニペット、自由形式のメモ、複数行の設定

**例**: `changelog` という名前の変数で、ユーザーがデプロイ前にリリースノートを貼り付ける

### 列挙（単一選択） {#enum-single-select}

事前定義されたリストからユーザーが 1 つだけ選択するドロップダウンメニューです。

**ユースケース**: 環境の種類、デプロイ戦略、真偽値のような選択

**例**: `deployment_type` という名前の変数で、選択肢は "rolling"、"blue-green"、"canary"

列挙型の変数を作成する際は、変数エディターで各選択肢に表示ラベルと値を追加します。

### セレクト（複数選択） {#select-multi-select}

事前定義されたリストからユーザーが 1 つ以上を選択できるドロップダウンです。選択した値は、単一の文字列ではなく JSON 配列（例: `["staging","production"]`）として渡されます。

**ユースケース**: 対象リージョン、機能フラグ、複数のホストグループ、タグリスト

**例**: `target_regions` という名前の変数で、選択肢は `us-east-1`、`eu-west-1`、`ap-southeast-1`

**制約**:
- デフォルト値は選択肢リストから選ぶ必要があり、複数選択を含めることができます
- Bash、PowerShell、Python テンプレートでは、引数または環境変数の値から JSON 配列をパースします（以下の例を参照）

### シークレット {#secret}

値が隠されるパスワード入力フィールドです。

**ユースケース**: API キー、パスワード、token、機密性の高い設定

**例**: `api_token` という名前の変数で、入力した値はセキュリティのためドットで表示される

## デフォルト値 {#default-values}

ほとんどの変数タイプで、任意のデフォルト値を設定できます。ユーザーがタスク実行ダイアログを開くと、フィールドにこれらのデフォルト値があらかじめ入力されます。

- **文字列、整数、テキスト、シークレット**: 単一のデフォルト値
- **列挙**: リストから 1 つの選択肢
- **セレクト**: リストから 1 つ以上の選択肢

デフォルト値は、同じテンプレートを予測可能なパラメーターで繰り返し実行するスケジュールやインテグレーションで役立ちます。ユーザーはタスク開始前に値を変更することもできます。

## 変数の渡し方（ターゲット） {#pass-variable-as-target}

各サーベイ変数は、次の 2 つの方法のいずれかで渡すことができます。

| 設定 | 動作 |
|---------|----------|
| **追加変数**（デフォルト） | アプリ固有の方法で渡されます: Ansible では `--extra-vars`、Terraform では `-var`、シェル系アプリでは `name=value` 形式の CLI 引数 |
| **環境変数** | サーベイ変数名と同じ名前のプロセス環境変数として設定されます |

スクリプトやツールが CLI フラグではなく環境から値を読み取る場合は、**環境変数**を使用してください。`TF_VAR_` の規約に従う必要がある Terraform 変数の場合は、サーベイ変数に `TF_VAR_instance_type` という名前を付け、ターゲットを環境変数に設定します。

環境変数ターゲットの変数は、extra-vars、`-var`、CLI 引数には**重複して**渡されません。各値は必ず 1 回だけ渡されます。

## サーベイ変数がタスクに渡される仕組み {#how-survey-variables-are-passed-to-tasks}

サーベイ変数は、テンプレートタイプと**変数の渡し方**の設定に応じて異なる方法で渡されます。

**複数選択（`select` タイプ）の値**は、すべての渡し方（extra-vars の JSON、`-var`、CLI 引数、環境変数）で JSON エンコードされた配列になります。選択肢 `1` と `2` を選択すると、スペース区切りの文字列ではなく `["1","2"]` になります。

### Ansible テンプレート {#ansible-templates}

サーベイ変数は `--extra-vars` フラグを使って Ansible の追加変数として渡されます。

**例**: `app_version` という名前のサーベイ変数を定義した場合:

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

タスク実行時にユーザーがサーベイフォームに "2.5.0" と入力すると、Ansible は次のように受け取ります。

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Terraform/OpenTofu テンプレート {#terraformopentofu-templates}

サーベイ変数は `-var` フラグを使って Terraform の変数として渡されます。

**例**: `instance_count` という名前のサーベイ変数を定義した場合:

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

タスク実行時にユーザーがサーベイフォームに "3" と入力すると、Terraform は次のように受け取ります。

```bash
terraform apply -var="instance_count=3"
```

### Shell/Bash テンプレート {#shellbash-templates}

サーベイ変数は Bash スクリプトにコマンドライン引数として渡されます。

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

スクリプト内で次のコードを使うと、引数を配列にパースできます。

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

**複数選択**の変数の場合、値は JSON 配列の文字列です。`jq` でパースしてください（実行イメージで `jq` が利用可能であることを確認してください）。

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### PowerShell テンプレート {#powershell-templates}

サーベイ変数は実行中の PowerShell スクリプトにコマンドライン引数として渡されます。

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


引数をパースするには、実行するスクリプト内で次のコードを使用します。

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

**複数選択**の変数の場合、引数の値から JSON 配列をパースします。

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Python テンプレート {#python-templates}

サーベイ変数は実行中の Python スクリプトにコマンドライン引数として渡されます。

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

引数をパースするには、実行するスクリプト内で次のコードを使用します。

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

**複数選択**の変数の場合、JSON 配列をパースします。

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## サーベイ変数の使用 {#using-survey-variables}

### 手動でのタスク実行 {#manual-task-execution}

サーベイ変数を持つテンプレートからタスクを実行する場合:

1. テンプレートの**実行**をクリックします
2. 定義したすべてのサーベイ変数を含むフォームが表示されます
3. 各フィールドに値を入力します
4. **タスクを実行**をクリックします

入力した値が playbook またはスクリプトに渡され、タスクが実行されます。
<!-- 
### API calls {#api-calls}

To pass survey variable values via API:

**Example API request:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

Survey variable values are passed in the `environment` object of the request payload.

**Important**: The task runs unattended when triggered via API—no interactive prompt appears. -->

### スケジュールされたタスク {#scheduled-tasks}

スケジュールにサーベイ変数の値を含めることで、同じテンプレートを異なるパラメーターで異なるスケジュールで実行できます。

**セットアップ:**

1. テンプレートにサーベイ変数を追加します
2. そのテンプレートのスケジュールを作成します
3. スケジュール設定でサーベイ変数の値を定義します
4. スケジュールされた各実行で、事前定義された値が使用されます

**ユースケースの例**: 異なる保持ポリシーでバックアップ playbook を実行する:
- `retention_days=7` を指定した日次スケジュール
- `retention_days=30` を指定した週次スケジュール
- `retention_days=365` を指定した月次スケジュール

詳細については[スケジュール](../schedules)のドキュメントを参照してください。

### インテグレーションと webhook {#integrations-and-webhooks}

インテグレーションは受信した webhook から値を抽出し、サーベイ変数にマッピングできます。

**セットアップ:**

1. テンプレートにサーベイ変数を追加します
2. このテンプレートをトリガーするインテグレーションを作成します
3. webhook ペイロードからデータを取り出す値抽出器を設定します
4. 抽出した値をサーベイ変数にマッピングします

**例**: GitHub のリリース作成時にデプロイをトリガーする:
- webhook ペイロードからリリースタグを抽出する
- `release_version` という名前のサーベイ変数にマッピングする
- デプロイ用 playbook がバージョン番号を受け取る

詳細については[インテグレーション](../integrations)のドキュメントを参照してください。

## ベストプラクティス {#best-practices}

### わかりやすい名前を使う {#use-descriptive-names}

サーベイ変数には、その目的がわかる明確で説明的な名前を選んでください。
- ✅ 良い例: `target_environment`、`app_version`、`backup_retention_days`
- ❌ 悪い例: `env`、`ver`、`days`

### 役立つタイトルを付ける {#provide-helpful-titles}

タイトルはフォームに表示されるため、ユーザーにとってわかりやすいものにしてください。
- 変数名: `db_host`
- タイトル: "Database hostname or IP address"

### 既知の選択肢には列挙またはセレクトを使う {#use-enum-or-select-for-known-options}

ユーザーが限られた選択肢から選ぶべき場合は、文字列ではなく列挙またはセレクトを使用してください。
- ✅ 1 つだけ選択する場合は**列挙**: production、staging、または development
- ✅ 複数の選択が有効な場合は**セレクト**: 複数のリージョンや機能フラグ
- ❌ 「production または staging を入力してください」という注記付きの文字列フィールド

### 環境変数ターゲットは意図的に使う {#use-environment-variable-target-deliberately}

playbook、スクリプト、またはツールが明示的にプロセス環境から値を読み取る場合を除き、デフォルトの追加変数による受け渡しを優先してください。環境変数ターゲットの変数には、下流のツールが期待するとおりの名前（例: `TF_VAR_region`）を付けてください。

### 必須フィールドを適切に指定する {#mark-required-fields-appropriately}

本当に必要な場合にのみフィールドを必須にしてください。任意のフィールドについては、playbook 側で適切なデフォルト値を用意することを検討してください。

### コード内で検証する {#validate-in-your-code}

サーベイ変数の値が常に有効であるとは限りません。playbook やスクリプトに検証ロジックを追加してください。

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### 機密データにはシークレットを使う {#use-secrets-for-sensitive-data}

API キー、パスワード、token などの機密性の高い値には、必ずシークレットタイプを使用してください。これにより、UI やログで値が隠されます。

### 変数グループと組み合わせる {#combine-with-variable-groups}

サーベイ変数は[変数グループ](../environment)と相性よく機能します。
- タスク間で共有される静的な設定には**変数グループ**を使用する
- タスク実行ごとに変わる値には**サーベイ変数**を使用する

**例**:
- 変数グループ: データベース接続情報、API エンドポイント
- サーベイ変数: デプロイ環境、バージョン番号、機能フラグ

## 一般的なユースケース {#common-use-cases}

### 環境ごとのデプロイ {#environment-specific-deployments}

次のサーベイ変数を作成します。
- `environment`: 選択肢 "production, staging, development" の列挙
- `app_version`: デプロイするバージョンの文字列
- `enable_debug`: 選択肢 "true, false" の列挙

### データベース操作 {#database-operations}

次のサーベイ変数を作成します。
- `db_name`: データベース名の文字列
- `backup_retention_days`: 保持ポリシーの整数
- `maintenance_window`: 時間帯の文字列

### インフラのプロビジョニング {#infrastructure-provisioning}

次のサーベイ変数を作成します。
- `instance_count`: インスタンス数の整数
- `instance_type`: 選択肢 "t2.micro, t2.small, t2.medium" の列挙
- `region`: AWS リージョンの列挙

### CI/CD pipeline {#cicd-pipelines}

次のサーベイ変数を作成します。
- `git_branch`: ビルドするブランチの文字列
- `build_type`: 選択肢 "debug, release" の列挙
- `run_tests`: 選択肢 "true, false" の列挙

## 変数グループとの違い {#differences-from-variable-groups}

| 機能 | サーベイ変数 | 変数グループ |
|---------|-----------------|-----------------|
| **目的** | タスクごとの実行時入力 | 再利用可能な静的設定 |
| **定義のタイミング** | タスク実行時 | プロジェクトで事前に設定 |
| **ユースケース** | 実行ごとに変わる値 | タスク間で共有される設定 |
| **形式** | 個別の型付きフィールド | ネストしたオブジェクトを含む JSON 形式 |
| **スコープ** | 単一のタスク実行 | 複数のテンプレート/inventory |
| **セキュリティ** | シークレットタイプで機密値を隠す | 機密データ用のシークレットタブ |

実行時の柔軟性が必要な場合はサーベイ変数を、複数のタスク実行にわたって一貫した設定を使いたい場合は変数グループを使用してください。
