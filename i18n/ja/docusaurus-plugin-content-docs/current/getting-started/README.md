---
title: はじめに
description: Semaphore UI をインストールし、最初の Ansible タスクを実行して結果を確認し、スケジュールを設定します。
sidebar_label: はじめに
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# はじめに

Semaphore UI は、Ansible、Terraform/OpenTofu、Bash、PowerShell、Python による繰り返し可能な自動化を実行する Web インターフェースと API です。Git に保存された自動化コード、認証情報、変数、スケジュール、ワークフロー、実行環境をまとめ、実行ごとのステータスとログを保存します。

このガイドでは、最初の動作例に Ansible を使用します。自分のリポジトリの playbook を使うか、公開リポジトリ [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo) を使ってスクリーンショットの例を再現してください。

## 1. Semaphore をインストールする

Semaphore の実行環境に合うインストール方法を選びます。デフォルトではネイティブパッケージが選択されています。

<Tabs groupId="installation-method">
  <TabItem value="package" label="ネイティブパッケージ" default className="InstallationMethod">

`amd64` の Debian または Ubuntu の場合：

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

`amd64` の RHEL、Fedora、Rocky Linux、AlmaLinux、CentOS Stream の場合：

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

データベースと最初の管理者を設定し、生成された設定で Semaphore を起動します。

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

ローカルでの評価では SQLite を選び、データベースと playbook のパスをそのまま使うか設定し、公開 URL を入力して、指示に従って最初の管理者を作成します。

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

`compose.yaml` を作成します。

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

暗号化キーを生成し、強固な管理者パスワードとともに、`compose.yaml` と同じディレクトリの `.env` ファイルに保存します。

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

`.env` をバージョン管理から除外し、コンテナを起動します。

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="バイナリアーカイブ" className="InstallationMethod">

OS と CPU アーキテクチャに対応するアーカイブを [GitHub Releases](https://github.com/semaphoreui/semaphore/releases) からダウンロードします。Linux `amd64` の例：

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

ローカルでの評価では SQLite を選び、データベースと playbook のパスをそのまま使うか設定し、公開 URL を入力して、指示に従って最初の管理者を作成します。

macOS では `darwin` アーカイブ、Windows では `.zip` を選びます。このガイドの後半の Ansible 手順には、Ansible がインストールされた Linux、macOS、WSL、コンテナ、または Linux runner の実行環境が必要です。

  </TabItem>
  <TabItem value="helm" label="Helm による Kubernetes へのインストール" className="InstallationMethod">

公式 chart を追加し、インストール前にデフォルト値を確認します。

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

chart の `appVersion` は Semaphore のバージョンを示します。本番利用の前に、`values.yaml` で永続ストレージ、データベース、管理者の認証情報、アクセスキーの暗号化キー、ingress/TLS を設定してください。

  </TabItem>
</Tabs>

ガイドに沿って設定するには、公式の [Semaphore インストールページ](https://semaphoreui.com/install) でリリースを選び、設定を作成して、対応するダウンロードまたは実行コマンドを取得します。

<details>
<summary>インストール方法に迷った場合</summary>

| インストール方法 | 適した用途 | 詳細ガイド |
| --- | --- | --- |
| **ネイティブパッケージ** | 対応する Linux サーバー | [パッケージマネージャーによるインストール](/admin-guide/installation/package-manager) |
| **Docker Compose** | 分離した環境の迅速な構築、またはコンテナホスト | [Docker インストール](/admin-guide/installation/docker) |
| **バイナリアーカイブ** | macOS、Windows、FreeBSD、または適切なパッケージがない Linux | [バイナリのインストール](/admin-guide/installation/binary-file) |
| **Helm による Kubernetes へのインストール** | 既存の Kubernetes クラスター | [Kubernetes インストール](/admin-guide/installation/k8s) |

詳細ガイドでは、本番用データベース、サービス、シークレット、ストレージ、ingress、アップグレードを説明しています。

</details>

この Ansible 手順では、Semaphore サーバーまたは runner 上で `git --version` と `ansible-playbook --version` が動作する必要があります。どちらかが利用できない場合は、先に [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) と [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) をインストールしてください。

:::tip 本番環境へのインストール
Semaphore を本番で使用する前に、[設定](/admin-guide/configuration)、[セキュリティ](/admin-guide/security)、[Runners](/admin-guide/runners)、[高可用性](/admin-guide/ha)、[アップグレード](/admin-guide/upgrading)を確認してください。
:::

## 2. サインインする

1. ブラウザーで Semaphore を開きます。ローカルインストールでは通常 [http://localhost:3000](http://localhost:3000) を使用します。
2. `semaphore setup` または Docker の管理者変数で作成した管理者のログイン名とパスワードを入力します。
3. **Sign In** を選択します。

![Semaphore のサインイン画面](/assets/getting-started/sign-in.jpg)

初期設定には、プロジェクトとユーザーを作成できる管理者アカウントを使用します。一般ユーザーは、管理者がアカウントを作成してプロジェクトへのアクセスを許可した後、同じページからサインインします。[ユーザー管理](/user-guide/admin/users)を参照してください。

## 3. プロジェクトを作成する

空の Semaphore インスタンスにサインインすると、**New Project** ページが自動的に開きます。既存のプロジェクトがある場合は、プロジェクト選択メニューから **New Project...** を選びます。フォームに入力します。

| フィールド | 入力内容 |
| --- | --- |
| **Project Name** | `Production infrastructure` やアプリケーション名など、識別しやすいワークスペース名。 |
| **Max number of parallel tasks** | 任意。プロジェクト内の同時実行タスク数を制限します。空欄にするとサーバーの制限を使用します。 |
| **Telegram Chat ID** | 任意。プロジェクトに Telegram 通知を設定している場合に使用します。 |
| **Allow alerts for this project** | 任意。設定済みのプロジェクト通知を有効にします。 |
**Create** を選択します。

**Create Demo Project** は選択しないでください。この機能はサンプルリソースを追加しますが、このガイドでは空のプロジェクトから構築します。後で別のプロジェクトを作成するときは、同じオプションが New Project ダイアログの **Demo** スイッチとして表示されます。

![すべての入力項目を表示した空の New Project フォーム](/assets/getting-started/new-project-empty.jpg)

新しいプロジェクトには、**Task Templates**、**Workflows**、**Schedule**、**Inventory**、**Variable Groups**、**Key Store**、**Repositories** の各セクションがあります。プロジェクト設定、チームのアクセス、アクティビティ、履歴については[プロジェクト](/user-guide/projects)を参照してください。

<details>
<summary>この手順を動画で見る</summary>

![空の Semaphore インスタンスに最初のプロジェクトを作成](/assets/getting-started/create-first-project.gif)

</details>

## 4. 基本概念を理解する

新しいプロジェクトは空の Dashboard を表示します。サイドバーがプロジェクトの主なナビゲーションです。

![リソースやタスクを追加する前の空の Semaphore プロジェクト画面](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** は実行履歴、統計、アクティビティ、プロジェクト設定を表示します。
- **Task Templates**、**Workflows**、**Schedule** は何をいつ実行するかを定義します。
- **Repositories**、**Inventory**、**Variable Groups**、**Key Store** はコード、対象、変数、認証情報を提供します。
- **Integrations**、**Team**、**Runners** は外部システム、ユーザー、実行ホストを接続します。

次の図は、これらのリソースがどのように実行につながるかを示しています。

<div class="BlockSchema">
  ![Semaphore のリソースとトリガーがタスク実行につながる仕組み](/assets/getting-started/core-concepts.svg)
</div>

UI 操作、API リクエスト、スケジュールは、**Task Template** を直接起動するか、タスクテンプレートを使う **Workflow** を起動できます。Semaphore はタスク実行を作成し、UI に **Task** として表示して、Semaphore サーバーまたは条件を満たすリモート runner に送信します。Ansible の場合、その実行ホストが `ansible-playbook` を実行し、Inventory が Ansible の管理対象システムを列挙します。

| 概念 | 役割 |
| --- | --- |
| [**Project**](/user-guide/projects) | 自動化リソース、権限、実行履歴を含む分離されたワークスペース。 |
| [**Repository**](/user-guide/repositories) | タスクが使用する自動化ファイルを含む Git ブランチまたはタグを指定します。 |
| [**Key Store**](/user-guide/key-store) | 再利用可能な SSH キー、ログイン認証情報、トークン、Ansible Vault パスワードを Git やタスク入力とは別に保存します。 |
| [**Inventory**](/user-guide/inventory) | 管理するホストとグループ、使用する認証情報を Ansible に伝えます。 |
| [**Variable Group**](/user-guide/environment) | 1 つ以上のテンプレートで再利用する Ansible 変数、環境変数、シークレットを保存します。 |
| [**Task Template**](/user-guide/task-templates/) | 自動化の種類、ファイル、リポジトリ、インベントリ、変数、プロンプト、実行オプションなど、実行内容を保存します。 |
| [**Task (task run)**](/user-guide/tasks) | 固有の入力、ステータス、タイムスタンプ、ログ、詳細、結果を持つ 1 回の実行。 |
| **Workflow** | 成功、失敗、承認、メモの分岐を持つ複数ステップの経路にタスクテンプレートを接続します。 |
| [**Schedule**](/user-guide/schedules) | cron 式に従い、タスクテンプレートやワークフローを 1 回または繰り返し起動します。 |
| [**Runner**](/admin-guide/runners) | 別のネットワークやセキュリティ境界など、Semaphore のメインサーバー外でキュー内のタスクを実行します。 |

## 5. リポジトリを接続する

Repository は Semaphore と Git 内の自動化コードを接続します。Semaphore 自体は playbook を保存しません。自分のリポジトリを接続するか、以下の公開デモの値を使って例をそのまま再現してください。[インテグレーション](/user-guide/integrations)は、GitHub、GitLab、その他の webhook ソースから自動化を起動する別の機能です。

1. **Repositories** を開き、**New Repository** を選択します。
2. リポジトリ名、URL、ブランチ、認証情報を入力します。公開デモを使用する場合は、次の値を指定します。

   | フィールド | 値 |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | 公開リポジトリのため `None` |

3. **Create** を選択します。

![Semaphore の公開デモリポジトリを入力したリポジトリフォーム](/assets/getting-started/repository-settings.jpg)

リポジトリが一覧に表示されます。Semaphore は、Repository レコードを作成したときではなく、タスク開始時に実行ホスト上でクローンまたは更新します。スクリーンショットはこのガイドのデモ値を示しています。

![プロジェクトのリポジトリ一覧に表示された接続済み Demo リポジトリ](/assets/getting-started/connected-repository.jpg)

非公開リポジトリでは、`None` の代わりに適切な Key Store の認証情報を選択します。ローカルパス、HTTPS、SSH、ブランチ、認証情報、依存関係ファイルについては[リポジトリ](/user-guide/repositories)を参照してください。

## 6. 管理対象のリモートホスト用 SSH キーを追加する

この SSH 認証情報により、Ansible は Semaphore サーバーまたは runner から Inventory 内のリモートホストへ接続できます。`localhost` のデモでは SSH キーは不要です。手順 7 に進んでください。

デモは `localhost` と `ansible_connection=local` を使うため、SSH 接続を開きません。自分の playbook がリモートホストを管理する場合は、そのキーを追加します。

1. キーの公開部分を管理対象ホストの `~/.ssh/authorized_keys` に追加します。
2. **Key Store** を開き、**New Key** を選択します。
3. `Production hosts` などの識別しやすい名前を入力し、**Local** を選択したまま **SSH Key** を選びます。
4. `ubuntu` や `ec2-user` など、Ansible がホスト上で使用するアカウントを入力します。
5. `BEGIN` 行と `END` 行を含む秘密キー全体を貼り付け、必要に応じてパスフレーズを追加します。
6. **Create** を選択します。次の手順では **Inventory → User Credentials** でこのキーを選択します。

![管理対象ホストのアカウント用 New SSH Key フォーム](/assets/getting-started/add-managed-host-ssh-key.jpg)

スクリーンショットはプレースホルダーであり、有効なシークレットではありません。秘密キーをドキュメント、スクリーンショット、タスク引数、バージョン管理に公開しないでください。

Semaphore はシークレットをローカルに保存するほか、[HashiCorp Vault](/user-guide/key-store/hashicorp-vault) や [Devolutions Server](/user-guide/key-store/devolutions-server) などの外部シークレットストレージと連携できます。対応するすべての認証情報の種類と保存方法は[キーストア](/user-guide/key-store)を参照してください。

## 7. Ansible インベントリを作成する

Ansible タスクには必ずインベントリが必要です。最初のローカル実行では、`inventory.ini` などのファイルをリポジトリに追加します。

```ini
[local]
localhost ansible_connection=local
```

ここでの `localhost` は Semaphore サーバー、コンテナ、runner などの実行ホストを意味し、ブラウザーを開いているコンピューターとは限りません。`ansible_connection=local` は Ansible に SSH を使わないよう指示します。デモリポジトリでは、`site` というグループを含む同等のファイル `invs/prod/hosts` を使います。

自分のリポジトリに `inventory.ini` を作成した場合は、続行する前に Semaphore に接続したブランチへコミットしてプッシュしてください。

1. **Inventory** を開き、**New Inventory → Ansible Inventory** を選択します。
2. インベントリに合う値を入力します。例：

   | フィールド | 値 |
   | --- | --- |
   | **Name** | `Local`（デモでは `Prod`） |
   | **User Credentials** | `localhost` では `None`。リモートインベントリではホストの SSH 認証情報を使用 |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini`（デモでは `invs/prod/hosts`） |

3. **Runner tag**、**Sudo Credentials**、**Repository** を空欄にし、**Create** を選択します。

![デモリポジトリの値で設定した Ansible のファイル型インベントリ](/assets/getting-started/ansible-inventory-settings.jpg)

**Repository** を空欄にすると、Semaphore はタスクテンプレートで選択したリポジトリを基準にインベントリの相対パスを解決します。インベントリが別の場所にある場合のみ、ここでリポジトリを選択します。リモートホストでは手順 6 の SSH キーを **User Credentials** に使用してください。

静的、ファイル型、動的インベントリについては[インベントリ](/user-guide/inventory)を参照してください。

## 8. 変数グループを追加する（任意）

**Variable Group** は、1 つ以上のタスクテンプレートに関連付けられる再利用可能な値の集合です。Ansible 変数には **Extra variables**、プロセスにエクスポートする値には **Environment variables**、暗号化とマスキングが必要な機密値には **Secrets** を使います。環境固有の設定を playbook の外に置き、同じ値を各テンプレートへ繰り返し入力せずに済みます。

最初のタスクは変数グループなしでも動作します。例として、`ansible_python_interpreter=auto_silent` を設定するグループを作成します。Ansible は引き続き Python を自動検出しますが、検出に関する情報警告を表示しなくなります。

1. **Variable Groups** を開き、**New Group** を選択します。
2. **Group Name** に `Ansible defaults` などのわかりやすい名前を設定します。
3. **Variables → Extra variables** で **Table** を選択したまま、**+** を選びます。
4. 次を入力します。

   | 名前 | 型 | 値 |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. **Save** を選択します。

![テーブルエディターで設定した変数グループ](/assets/getting-started/variable-group-table.jpg)

優先順位とシークレット保存方法は[変数グループ](/user-guide/environment)を参照してください。

## 9. Ansible タスクテンプレートを作成する

### Git の playbook を確認する

接続したリポジトリに Ansible playbook がある場合はそれを使用します。なければ `get-started.yml` などの小さな例を追加します。

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

デモを使用する場合は、代わりにその [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml) を使います。デモインベントリの `site` グループを対象に、付属の `ping` ロールを実行します。

デモは Git サブモジュールからそのロールをダウンロードし、`semaphoreui.com` へ ICMP リクエストを 1 回送信します。そのため実行ホストには GitHub へのアクセスと外向き ICMP が必要です。ICMP がブロックされる場合は、ローカルの `get-started.yml` の例を使ってください。

![接続した GitHub リポジトリ内の ping.yml](/assets/getting-started/demo-playbook-github.jpg)

スクリーンショットは公開デモリポジトリの playbook を示しています。自動化コードを Git に保存すると変更をレビューでき、Semaphore は各実行に使った正確なコミットを記録できます。

自分のリポジトリに `get-started.yml` を作成した場合は、続行する前に Semaphore に接続したブランチへコミットしてプッシュしてください。

### テンプレートを設定する

1. **Task Templates** を開き、**New template → Applications** を選択します。
2. **Ansible Playbook** を有効にし、**Task Templates** に戻ります。
3. **New template → Ansible Playbook** を選択します。
4. **Task** タブを選択したままにします。**Build** と **Deploy** はバージョン管理付き CI/CD テンプレートの種類で、この独立した実行には不要です。
5. ファイルに合う値でテンプレートを設定します。例：

   | フィールド | 値 | 役割 |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | 再利用可能なテンプレートとタスク履歴を識別します。 |
   | **Repository** | 自分のリポジトリ（例では `Demo`） | playbook と関連ファイルを提供します。 |
   | **Path to playbook file** | `get-started.yml`（デモでは `ping.yml`） | リポジトリルートを基準に解決します。 |
   | **Inventory** | `Local`（デモでは `Prod`） | 最初の実行のローカル対象を提供します。 |
   | **Variable Groups** | 作成済みの場合は `Ansible defaults` | 再利用可能な任意の Ansible 設定を追加します。 |
   | **Runner tag** | 空欄 | サーバー設定に応じてローカル実行またはデフォルト runner を使用します。 |

6. 上記の小さな playbook または公開デモでは、**Ansible options** の **Skip Galaxy install** を有効にします。どちらもこのタスクに Galaxy の依存関係は不要です。自分のリポジトリが `requirements.yml` ファイルのロールやコレクションを必要とする場合は、無効のままにしてください。
7. **Create** を選択します。

![リポジトリ、インベントリ、変数グループを設定した Ansible タスクテンプレート](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>この手順を動画で見る</summary>

![Ansible を有効にして最初の Ansible タスクテンプレートを作成](/assets/getting-started/create-ansible-template.gif)

</details>

その他の便利なフィールド：

- **Vaults** は暗号化された Ansible コンテンツ用の Key Store パスワードを選択します。
- **Limit**、**Tags**、**Skip tags** は playbook の実行範囲を絞り込みます。
- **Prompts** により、UI ユーザー、スケジュール、API リクエストが、特定の実行で許可された値を上書きできます。
- **Runner tag** はタスクの実行場所を制御します。Ansible の対象を選択するものではありません。

すべてのフィールドと実行オプションは [Ansible テンプレート](/user-guide/apps/ansible)と[タスクテンプレート](/user-guide/task-templates/)を参照してください。

## 10. テンプレートを実行し、タスクを確認する

1. 作成したタスクテンプレートを開き、**Run** を選択します。
2. 任意で `First Semaphore run` などのメッセージを追加します。
3. **Dry Run** と **Diff** を無効のままにし、**Run** を選択します。

![追加オプションを設定していない Ansible playbook の New Task ダイアログ](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore はタスクをキューに追加し、リポジトリを準備して、インベントリと任意の変数グループを適用し、選択した playbook を実行します。ステータスは **Waiting**、**Running** を経て、**Success** または **Failed** で終了します。

### ログ

**Log** にはコマンドの実際の出力が記録されます。緑のステータス表示だけでなく、最後の `PLAY RECAP` を確認してください。

![ping の出力と PLAY RECAP を含む成功した Ansible タスクのログ](/assets/getting-started/ansible-task-log-variable-group.jpg)

正確なカウンター値は playbook によって異なります。最初の実行が成功すると、`localhost` の `unreachable=0` と `failed=0` はゼロになります。デモのログに `changed=1` と表示された場合は、シェル経由の ping ステップが実行され、変更を報告したことを意味します。エラーではありません。

### 詳細とサマリー

| タブ | 確認する内容 |
| --- | --- |
| **Log** | 実行フェーズのリアルタイム表示、モジュール出力、エラー、最後の `PLAY RECAP`。 |
| **Details** | テンプレートの種類、Git コミット、実行メッセージ、実行者、タイムスタンプ、所要時間。 |
| **Summary** | タスクサマリー機能が利用できる場合の、完了後のホスト別 Ansible 結果とエラー。 |

![テンプレート、コミット、時間情報を表示したタスク詳細](/assets/getting-started/ansible-task-details.jpg)

![OK と Not OK のホスト数を表示したタスクサマリー](/assets/getting-started/ansible-task-summary.jpg)

**Summary** が利用できない場合は **Log** で実行を確認してください。`PLAY RECAP` が引き続き Ansible の結果の基準になります。

<details>
<summary>実行と結果を動画で見る</summary>

![Ansible タスクを実行し、ログと詳細を確認](/assets/getting-started/run-and-inspect-task.gif)

</details>

### 過去の実行を探す

タスクウィンドウを閉じると、テンプレートの **Tasks** タブに戻ります。各実行には固有のタスク番号、ステータス、ユーザー、開始時刻、所要時間、保存されたログがあります。**Dashboard → History** にはプロジェクトの全テンプレートの実行が表示されます。詳しくは[タスク](/user-guide/tasks)と[プロジェクト履歴](/user-guide/projects/history)を参照してください。

![成功したタスク実行を表示した Ansible テンプレートの履歴](/assets/getting-started/ansible-template-history.jpg)

タスクが失敗した場合は、ログの最後の有用な行から次の確認事項を判断します。

- クローンエラーは、リポジトリ URL、ブランチ、Access Key、または実行ホストからのネットワークアクセスの問題を示します。
- `ansible-playbook: command not found` は、Semaphore サーバーまたは選択した runner に Ansible がないことを意味します。
- `UNREACHABLE` は、インベントリのアドレス、ホスト認証情報、SSH 接続性、ホストキー検証の問題を示します。
- Ansible ステップが失敗した場合、通常は `PLAY RECAP` の直前にタスク名、ホスト、モジュールのエラーが表示されます。

## 11. スケジュールに従ってタスクを実行する

UI からの実行が成功したら、自動実行を設定できます。たとえば cron 式 `0 3 * * *` は、Semaphore が表示するタイムゾーンで毎日 03:00 にタスクを起動します。

1. **Schedule** を開き、**New Schedule → Cron** を選択します。
2. `Nightly playbook` などのわかりやすい名前を入力します。
3. 実行するタスクテンプレートを選択します。
4. **Show cron format** を有効にしたまま、`0 3 * * *` などの cron 式を入力します。
5. **Enabled** を選択したまま、**Save** を選びます。

![例のタスクを毎日 03:00 に実行する cron スケジュール](/assets/getting-started/create-cron-schedule.jpg)

Semaphore は保存前に設定済みのタイムゾーンと次回実行時刻を表示します。スケジュール実行はテンプレートと同じリポジトリ、インベントリ、変数グループ、実行設定を使います。テンプレートがプロンプトを公開している場合、スケジュールで値を指定できます。cron 構文、タイムゾーン設定、単発実行、スケジュールのパラメーターについては[スケジュール](/user-guide/schedules)を参照してください。

保存後、スケジュールが **Enabled** であり、**Next run** が想定した時刻を示すことを確認します。スケジュールされたタスクは、テンプレートの **Tasks** タブと **Dashboard → History** に表示されます。

## 次に試すこと

最初の Ansible タスクが成功したら：

- リポジトリに認証が必要な場合は、[キーストア](/user-guide/key-store)に適切な非公開の認証情報を追加します。
- 複数のテンプレートに成功、失敗、承認、メモの順序付き経路が必要な場合は、**Workflow** を作成します。
- GitHub、GitLab などから認証付き webhook で起動するには、[インテグレーション](/user-guide/integrations)を使います。
- リソースの管理やテンプレートの起動をプログラムから行うには、[API](/reference/api) を使います。
- 別のネットワーク、OS、セキュリティ境界で実行する必要がある場合は、[リモート runner](/admin-guide/runners) を追加します。

本番環境では Semaphore を HTTPS 経由で公開し、データベースとアクセスキー暗号化用シークレットを一緒にバックアップし、認証を一元化してください。[セキュリティ](/admin-guide/security)、[ログ](/admin-guide/logs)、[アップグレード](/admin-guide/upgrading)も確認してください。
