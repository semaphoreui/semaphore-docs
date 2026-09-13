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
    * このリポジトリを設定する前に用意しておいた**アクセスキー**を選択します。

4. すべて設定したら「保存」をクリックします。

## 既存のリポジトリの編集 {#editing-an-existing-repository}
1. Semaphore のリポジトリセクションに移動します。

2. 変更したいリポジトリの横にある鉛筆アイコンをクリックすると、リポジトリの設定が表示されます。

## リポジトリの削除 {#deleting-a-repository}
削除しようとしているリポジトリが、どのタスクテンプレートでも使用されていないことを確認してください。
タスクテンプレートで使用されているリポジトリは削除できません:
1. Semaphore のリポジトリセクションに移動します。

2. 削除したいリポジトリのゴミ箱アイコンをクリックします。

3. 本当にこのリポジトリを削除してよければ、確認ポップアップで「はい」をクリックします。

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
