import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# リポジトリ

リポジトリは、playbook やロールなどの Ansible コンテンツを保存・管理する場所です。

![](/assets/repository.webp)

Semaphore は次の種類のリポジトリを認識します。
  * ローカルファイルシステム (`/path/to/the/repo`)
  * ローカル Git リポジトリ (`file://`)
  * HTTPS (`https://`) または SSH (`ssh://`) 経由でアクセスするリモート Git リポジトリ
  * `git://` プロトコルもサポートされていますが、セキュリティ上の理由から推奨されません。

すべてのタスクテンプレートは、実行のためにリポジトリを必要とします。

## 認証 {#authentication}
認証が必要なリモートリポジトリを使用する場合は、Semaphore の**キーストア**セクションでキーを設定する必要があります。

SSH を使用するリモートリポジトリの場合は、**キーストア**の SSH キーを使用する必要があります。

認証のないリモートリポジトリの場合は、種類が `None` のキーを作成できます。

リポジトリのキーは、そのリポジトリにのみ使用されます。サブモジュール、`requirements.yml` のロール、または独自の認証情報を持つ別の場所のリポジトリにアクセスするには、[ホスト設定](/user-guide/host-config) でマッピングを追加してください。

### デプロイキーの設定 {#deploy-keys}

エンタープライズ自動化環境では、個人のユーザーSSHキーやPersonal Access Token（PAT）の代わりに、単一のリポジトリにスコープされた専用の**デプロイキー**（またはAccess Key）を使用することが推奨されます。デプロイキーには以下の利点があります：
* **ライフサイクルの分離**: CI/CDおよび自動化パイプラインが個々の従業員アカウントや個人の認証情報に依存しません。
* **最小権限**: デプロイキーは読み取り専用に厳密に制限できるため、Semaphoreがソースリポジトリに意図しない変更をプッシュするのを防ぎます。
* **影響範囲の制限**: キーのローテーションが必要になった場合でも、対象のリポジトリのみに影響が限定されます。

:::tip Semaphore内でSSHキーを直接生成
コマンドラインでSSHキーを生成する必要はありません。Semaphore内で、**Key Store** &rarr; **新しいキー** &rarr; **SSH Key**を選択 &rarr; **Generate**をクリックします。Semaphoreが安全なキーペアを作成し、コピー可能な**公開鍵**ダイアログを表示します。詳細は[Key Store](/user-guide/key-store#built-in-ssh-key-generator)を参照してください。
:::

Semaphoreで生成された公開鍵をコピーし、Gitプロバイダーに追加します：

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. GitHub: **Settings** &rarr; **Deploy keys** &rarr; **Add deploy key**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Allow write access**: Unchecked.

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. GitLab: **Settings** &rarr; **Repository** &rarr; **Deploy keys**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Grant write permissions**: Unchecked.

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. Bitbucket: **Repository settings** &rarr; **Access keys**.
2. Label: `Semaphore UI Runner`.
3. Key: Public Key.
4. Permissions: `Read`.

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

## 新しいリポジトリの作成 {#creating-a-new-repository}
1. 追加しようとしているリポジトリ用のキーを、キーストアセクションで設定済みであることを確認します。

2. Semaphore のリポジトリセクションに移動し、右上隅にある**新しいリポジトリ**ボタンをクリックします。

3. リポジトリを設定します:
    * リポジトリに名前を付けます
    * URL を追加します。URL は次のいずれかで始まる必要があります:
        * `/path/to/the/repo` — ファイルシステム上のローカルフォルダー
        * `https://` — HTTPS 経由でアクセスするリモート Git リポジトリ
        * `ssh://` — SSH 経由でアクセスするリモート Git リポジトリ
        * `file://` — ローカル Git リポジトリ
        * `git://` — Git プロトコル経由でアクセスするリモート Git リポジトリ
    * リポジトリのブランチを設定します。不明な場合は、おそらく master または main です
    * リポジトリがすべてのテンプレートで共有するモノレポの場合は、**すべてのテンプレートで単一チェックアウト**にチェックを入れます。[モノレポ](#monorepo)を参照してください
    * このリポジトリを設定する前に用意しておいた**アクセスキー**を選択します。

4. すべて設定したら「保存」をクリックします。

## モノレポ: すべてのテンプレートで 1 つのチェックアウト {#monorepo}

:::info v2.20 以降
**すべてのテンプレートで単一チェックアウト** オプションは **Semaphore 2.20** 以降で利用できます。それより前のバージョンでは、リポジトリは常にテンプレートごとにクローンされます。
:::

デフォルトでは、Semaphore はテンプレートごとにリポジトリをクローンするため、各テンプレートは独自のコピーで動作します。多くのテンプレートが共有する大きなリポジトリでは、コピーがディスク容量を消費し、各タスクは自身のコピーのクローンまたはプルから開始されます。

**すべてのテンプレートで単一チェックアウト**にチェックを入れると、リポジトリは 1 回だけクローンされ、そのチェックアウトがプロジェクトのすべてのテンプレートで共有されます。このオプションは、クローンされることのないローカルフォルダー（`/path/to/the/repo`）では使用できません。

<div style={{maxWidth: 450}}>

![「すべてのテンプレートで単一チェックアウト」が有効なリポジトリフォーム](/assets/repository-monorepo.webp)

</div>

共有チェックアウトの仕組み:

* タスクの開始前に、Semaphore はチェックアウトのロックを取得し、リポジトリで設定されたブランチをフェッチおよびプルしてから、ロックを解放します。チェックアウトの更新中、他のテンプレートのタスクはロックを待ちますが、タスク自体は並行して実行されます。
* ブランチごとに独自のチェックアウトが作成されるため、ブランチが異なるリポジトリが作業ツリーを共有することはありません。
* チェックアウトは共有されますが、Ansible のホームディレクトリ（`requirements.yml` からインストールされるロールとコレクション）はテンプレートごとに分かれています。

すべてのテンプレートが同じブランチの同じチェックアウトで動作するため、モノレポのテンプレートは独自の**ブランチ**を持つことができず、タスクがブランチやコミットを選択できるようにする**ブランチ**プロンプトを有効にすることもできません。テンプレートフォームはどちらも無効にしてその理由を表示し、API はそのようなテンプレートを拒否します。playbook がチェックアウトに書き込まないようにしてください。作業ツリーが変更されると次のプルが失敗し、Semaphore はチェックアウトを削除して再度クローンします。

## サブディレクトリ内のプレイブック {#subdirectories}

エンタープライズリポジトリでは、すべてのプレイブックをルートに配置するのではなく、専用ディレクトリ、モノレポ、または複数環境レイアウトで自動化アセットを管理することが一般的です。

```text
my-automation-repo/
├── ansible.cfg
├── collections/
│   └── requirements.yml
├── roles/
│   └── common/
└── playbooks/
    ├── site.yml
    ├── provisioning/
    │   └── aws-vms.yml
    └── maintenance/
        └── patch-nodes.yml
```

[タスクテンプレート](/user-guide/task-templates)を作成する際、**プレイブックファイル名**は常に**リポジトリルートからの相対パス**で指定します：

* **相対パスを使用**: `playbooks/site.yml` や `playbooks/provisioning/aws-vms.yml` のように入力します。
* **先頭のスラッシュは不可**: `/playbooks/site.yml` のようには入力しないでください。先頭のスラッシュがあると、クローン先ではなくシステムルートから検索されてしまいます。
* **Unix形式のスラッシュ**: Windowsランナーノードで実行する場合でも、常に `/` を使用してください。
* **大文字と小文字を区別**: パスは大文字小文字を正確に一致させる必要があります（例: `playbooks/site.yml`）。

:::info 作業ディレクトリと要件
プレイブックがサブディレクトリ（例: `playbooks/site.yml`）から実行される場合、Semaphoreはロールやコレクションを解決する際に、プレイブックディレクトリ（`playbook_dir`）とリポジトリルート（`repo_path`）の両方を評価します。正確な検索順序については以下の[要件](#requirements)を参照してください。
:::

## 既存のリポジトリの編集 {#editing-an-existing-repository}
1. Semaphore のリポジトリセクションに移動します。

2. 変更したいリポジトリの横にある鉛筆アイコンをクリックすると、リポジトリの設定が表示されます。

## リポジトリの削除 {#deleting-a-repository}
削除しようとしているリポジトリが、どのタスクテンプレートでも使用されていないことを確認してください。
タスクテンプレートで使用されているリポジトリは削除できません:
1. Semaphore のリポジトリセクションに移動します。

2. 削除したいリポジトリのゴミ箱アイコンをクリックします。

3. 本当にこのリポジトリを削除してよければ、確認ポップアップで「はい」をクリックします。

### 依存関係保護と使用中ガード {#dependency-protection}

タスクテンプレートに現在割り当てられているリポジトリは削除できません。

削除を試行する前に、Semaphoreはアクティブなテンプレート参照を確認します：
1. リポジトリ一覧でゴミ箱アイコンをクリックすると、そのリポジトリがプロジェクトテンプレートから参照されているかチェックされます。
2. 依存関係が存在する場合、Semaphoreは該当リポジトリを参照しているタスクテンプレート一覧と各テンプレートへの直接リンクを含む警告ダイアログを表示します。
3. 使用中にAPI経由で直接削除しようとすると、HTTP `400 Bad Request` で拒否されます：

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

安全にリポジトリを削除する手順：
1. **テンプレート**に移動し、依存している各テンプレートを別のリポジトリに再割り当てするか、不要なテンプレートを削除します。
2. **リポジトリ**に戻り、該当リポジトリの横にあるゴミ箱アイコンをクリックします。
3. ポップアップダイアログで削除を確認します。

:::tip チェックアウトキャッシュの自動パージ
リポジトリが正常に削除されると、Semaphoreはホスト/ランナーのファイルシステムからリポジトリのローカルチェックアウト作業ディレクトリを自動的に削除し、ディスク容量を解放します。
:::

## Requirements {#requirements}
プロジェクトの初期化時に、Semaphore は次の場所と順序で requirements.yml を検索し、Ansible のロールとコレクションをインストールします。

### ロール {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### コレクション {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### 処理ロジック {#processing-logic}

* 各ファイルは独立して処理されます
* ファイルが存在する場合、その種類 (ロールまたはコレクション) に応じて処理されます
* いずれかのファイルの処理でエラーが発生した場合、インストール処理は停止し、エラーを返します
* ルートディレクトリにある同じ requirements.yml ファイル (**`playbook_dir`/requirements.yml** と **`repo_path`/requirements.yml**) は、ロール用とコレクション用に 2 回処理されます

Semaphore は、エラーが発生した場合を除き、以前の場所が見つかったか、正常に処理されたかにかかわらず、これらすべての場所の処理を試みます。
