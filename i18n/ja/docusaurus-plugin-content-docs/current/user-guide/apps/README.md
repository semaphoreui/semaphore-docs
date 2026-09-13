# アプリケーション

アプリケーションとは、タスクテンプレートが実行するツールのことです。Semaphore には 7 つの組み込みアプリケーションが付属しており、管理者はそれらの有効・無効を切り替えたり、独自のアプリケーションを登録したりできます。

| アプリケーション | ID | テンプレートが実行する内容 | ガイド |
|---|---|---|---|
| Ansible Playbook | `ansible` | 選択したインベントリを使用した `ansible-playbook` | [Ansible](./ansible) |
| Terraform Code | `terraform` | 選択したサブディレクトリとワークスペースでの `terraform` | [Terraform/OpenTofu](./terraform) |
| OpenTofu Code | `tofu` | `tofu`。オプションは Terraform と同じです | [Terraform/OpenTofu](./terraform) |
| Terragrunt Code | `terragrunt` | Terraform または OpenTofu をラップする `terragrunt` | [Terragrunt](./terragrunt) |
| Bash Script | `bash` | `/bin/bash` によるシェルスクリプト | [シェル](./bash) |
| PowerShell Script | `powershell` | `pwsh` による `.ps1` スクリプト | [PowerShell](./powershell) |
| Python Script | `python` | `python3` による `.py` スクリプト | [Python](./python) |

ツール自体は、タスクを実行するマシン（Semaphore サーバーまたは[ランナー](/admin-guide/runners)）にインストールされている必要があります。公式の Docker イメージには Ansible、Terraform、OpenTofu、Bash、Python が含まれています。

## アプリケーションの管理 {#managing-applications}

管理者は、サイドバー下部のアカウントメニューから **アプリケーション** を開きます。

![アプリケーションのページ](/assets/apps-list.webp)

各行のスイッチで、アプリケーションの有効・無効を切り替えます。無効にしたアプリケーションはテンプレートのフォームに表示されなくなりますが、既存のテンプレートは引き続き動作します。テンプレートの作成時には有効なアプリケーションのみが表示されるため、サーバーにインストールされていないツールは無効にしてください。

アプリケーションをクリックすると、タイトル、アイコン、実行ファイルのパス、優先度（テンプレートフォームでの並び順）を変更できます。

## カスタムアプリケーション {#custom-applications}

**新しいアプリ** では、任意のコマンドラインツールをアプリケーションとして登録できます。

| フィールド | 説明 |
|---|---|
| **ID** | API やテンプレートで使用される短い識別子です。例: `pulumi`。 |
| **アイコン** | 名前の横に表示されるアイコンです。 |
| **名前** | テンプレートフォームに表示されるタイトルです。 |
| **パス** | サーバーまたはランナー上の実行ファイルのパスです。 |
| **優先度** | アプリケーション一覧での位置です。 |
| **有効** | テンプレートでこのアプリケーションを選択できるようにするかどうかです。 |

カスタムアプリケーションのテンプレートは、リポジトリ内のスクリプトファイルを引数として実行ファイルを実行し、[Bash](./bash) テンプレートと同じ方法で変数グループを環境変数として受け取ります。

アプリケーションはサーバー設定であらかじめ定義することもできます。[設定](/admin-guide/configuration)の `apps` セクションを参照してください。
