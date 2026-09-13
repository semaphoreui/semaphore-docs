
# Ansible

Semaphore UI を使用すると、Ansible の playbook を実行できます。そのためには、**Ansible Playbook** テンプレートを作成する必要があります。

1. **タスクテンプレート** セクションに移動し、**新しいテンプレート**、続いて **Ansible Playbook** をクリックします。

![](/assets/ansible_1.png)

2. テンプレートを設定します。

テンプレートでは、次のパラメーターを指定できます。

* リポジトリ
* playbook ファイルのパス
* 作業ディレクトリ（任意）
* インベントリ
* 変数グループ
* Vault
* 追加の CLI 引数（tags、skip-tags、limit、詳細度）
* 環境変数

![](/assets/ansible_2.png)

## 作業ディレクトリ {#working-directory}

**作業ディレクトリ** を使用すると、テンプレートのリポジトリのサブディレクトリから Ansible コマンドを実行できます。リポジトリルートからの相対パスを入力してください。たとえば `ansible.cfg` が `<repository>/automation` に保存されている場合は、`automation` と入力します。絶対パスやリポジトリ外のパスは拒否されます。省略した場合、Semaphore はリポジトリルートを使用します。

作業ディレクトリは、プロセスのカレントディレクトリに依存する Ansible の動作に影響します。Ansible の[設定ファイルの検索順序][ansible-config-search]には、カレントディレクトリの `ansible.cfg` が含まれます。また、作業ディレクトリは追加の CLI 引数に含まれる相対パスの解決にも影響します。例としては [`--extra-vars @vars.yml`][ansible-extra-vars-file] や [`--private-key key.pem`][ansible-private-key] があります。playbook とファイルインベントリのパスは、引き続きそれぞれのリポジトリルートからの相対パスとして扱われます。

作業ディレクトリを変更しても、それだけではそのディレクトリの `roles/` や `collections/` サブディレクトリが Ansible の検索パスに追加されるわけではありません。[playbook を基準としたロールの検出][ansible-role-search]や [playbook に隣接するコレクション][ansible-playbook-collections]は、引き続き playbook の場所を基準とします。ただし、選択された `ansible.cfg` が `roles_path` や `collections_path` を設定している場合は、作業ディレクトリがこれらの検出に間接的に影響することがあります。

[ansible-config-search]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html#the-configuration-file
[ansible-extra-vars-file]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#vars-from-a-json-or-yaml-file
[ansible-private-key]: https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-private-key
[ansible-role-search]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#storing-and-finding-roles
[ansible-playbook-collections]: https://docs.ansible.com/ansible/latest/collections_guide/collections_installing.html#installing-collections-adjacent-to-playbooks

## テンプレートの種類 {#template-types}

ansible-playbook テンプレートは、次のいずれかの種類になります。

* [タスク](#task)
* [ビルド](#build)
* [デプロイ](#deploy)

### タスク {#task}

指定したパラメーターで、指定した playbook を実行するだけのものです。

*limit* 機能を使って API 呼び出しからテンプレートを起動する場合は、必ず *Ansible プロンプト: Limit* オプションを有効にしてください。有効にしないと、API 呼び出しで指定した limit は無視されます。API でトリガーされたタスクの場合、これによって対話的なプロンプトが表示されることはなく、タスクは無人で実行されます。

### ビルド {#build}

この種類のテンプレートは、[アーティファクト](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\))を作成するために使用します。アーティファクトの開始バージョンは、テンプレートのパラメーターで指定できます。実行ごとにアーティファクトのバージョンが増加します。

![](/assets/template_new_build_ipad1.png)

Semaphore はアーティファクトを標準でサポートしているわけではなく、タスクのバージョニングのみを提供します。アーティファクトの作成は自分で実装する必要があります。その方法については [CI/CD](../../admin-guide/cicd) の記事を参照してください。

### デプロイ {#deploy}

この種類のテンプレートは、アーティファクトを対象のサーバーへデプロイするために使用します。各 `deploy` テンプレートは、1 つの `build` テンプレートに関連付けられます。


これにより、特定のバージョンのアーティファクトをサーバーへデプロイできます。

## テンプレートのオプション {#template-options}

### スケジュール {#schedule}

テンプレートの設定で cron スケジュールを指定すると、タスクのスケジュール実行を設定できます。cron 式の形式については[ドキュメント](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format)を参照してください。


#### リポジトリに新しいコミットが追加されたときにタスクを実行する {#run-a-task-when-a-new-commit-is-added-to-the-repository}

cron を使用して、リポジトリの新しいコミットを定期的に確認し、コミットが追加されたときにタスクをトリガーできます。

たとえば、アプリのソースコードが git リポジトリにある場合、それを **リポジトリ** に追加し、新しいコミットに対してビルドタスクをトリガーできます。


### tags、skip-tags、limit {#tags-skip-tags-and-limit}

テンプレートは、次の Ansible CLI オプションに対応しています。

- `--tags`
- `--skip-tags`
- `--limit`

これらはテンプレートで設定でき、タスクの作成時に上書きできます。これらの値を API 経由で渡す予定がある場合は、対応するプロンプトが有効になっていることを確認してください。

### Galaxy の requirements {#galaxy-requirements}

playbook を実行する前に、Semaphore は playbook のディレクトリ、リポジトリルート、およびそれらの `roles/` と `collections/` サブディレクトリにある `requirements.yml` ファイルから、`ansible-galaxy install --force` を使ってロールとコレクションをインストールします。

実行ごとに再インストールしないように、Semaphore は各 requirements ファイルのチェックサムを保存し、ファイルが変更されたときにのみインストールを再実行します。この動作は、**Ansible プロンプト** の下にある折りたたみ可能な **Galaxy インストールオプション** セクションの 2 つのテンプレートオプションで制御します。

- **Galaxy のインストールをスキップ** — `ansible-galaxy` をまったく実行しません。requirements がランナーのイメージにあらかじめインストールされている場合に使用します。
- **Galaxy のインストールを強制** — 保存されたチェックサムを無視して、常に `ansible-galaxy install --force` を実行します。requirements ファイルが変化する対象（たとえばタグではなくブランチ）を指している場合で、実行ごとに最新バージョンを取得したいときに使用します。

**Galaxy のインストールをスキップ** は、セクション下部の **プロンプト** にある同名のチェックボックスを有効にすると、タスクの実行フォームに表示できます。プロンプトが有効な場合、実行時に選択した値がテンプレートの既定値を上書きします。

#### Galaxy の追加引数 {#galaxy-extra-args}

**ロールのインストール引数** と **コレクションのインストール引数**（**Ansible プロンプト** の下にある折りたたみ可能な **Galaxy インストールオプション** セクション内。既定では折りたたまれており、横のカウンターにはカスタマイズされている Galaxy 設定の数が表示されます）は、それぞれ `ansible-galaxy role install` と `ansible-galaxy collection install` にフラグを追加します。この 2 つのサブコマンドは受け付けるフラグが異なるため、別々に設定します。たとえば `--pre` はコレクションに対してのみ有効です。

各エントリは 1 つの argv トークンです。値はインライン（`--timeout=60`）でも、次のエントリとして（`--timeout`、`60`）でも指定できます。受け付けられるフラグは次のものだけです。

| 対象 | フラグ |
|-------|-------|
| 両方 | `-c`/`--ignore-certs`、`-f`/`--force`、`--force-with-deps`、`-i`/`--ignore-errors`、`-n`/`--no-deps`、`-s`/`--server <url>`、`--timeout <seconds>`、`-v`…`-vvvv`/`--verbose` |
| ロールのみ | `-g`/`--keep-scm-meta` |
| コレクションのみ | `--pre`、`-U`/`--upgrade`、`--offline`、`--no-cache`、`--clear-response-cache`、`--disable-gpg-verify`、`--keyring <path>`、`--signature <url>`、`--required-valid-signature-count <n>`、`--ignore-signature-status-code(s) <code>` |

それ以外の引数は、テンプレートの保存時に拒否されます。特に `--token`/`--api-key` は、コマンドライン引数がプロセス一覧から見えてしまうため許可されていません。Galaxy の認証情報は、代わりに変数グループ内の環境変数（たとえば `ANSIBLE_GALAXY_SERVER_<NAME>_TOKEN`）で設定してください。requirements ファイル（`-r`）は Semaphore が設定します。また、インストール先のパス（`-p`、`--roles-path`、`--collections-path`）は、テンプレートがリポジトリの外に書き込めないように意図的に受け付けていません。代わりに `ansible.cfg` で `roles_path`/`collections_path` を設定するか、`ANSIBLE_ROLES_PATH`/`ANSIBLE_COLLECTIONS_PATH` を使用してください。

### 並列度 (`--forks` / `-f`) {#parallelism---forks---f}

Ansible が並列に接続するホスト数は、テンプレートの **追加の CLI 引数** に `--forks` または
`-f` を渡して制御します。引数は有効な JSON である必要があります。
個別のトークンの配列を使用してください。

```json
["--forks", "10"]
```

短縮形も使用できます。

```json
["-f", "10"]
```

テンプレートで **タスクでの引数の上書きを許可** が有効になっている場合、タスクは
実行時に独自の forks の値を指定できます。Ansible はテンプレートとタスクの
両方の引数を受け取り、コマンドラインの最後にある `--forks` / `-f` が有効になります。

引数が有効な JSON でない場合、タスクは実行開始前に、内容を説明する
バリデーションエラーとともに失敗します。

### 認証 {#authentication}

playbook 内のホストに対する認証は、インベントリのキーストアにあるユーザー参照を使用して行われます。SSH に使用するユーザーは、キーストア要素の任意指定のユーザーによって決まります。

### 複数の vault パスワード {#multiple-vault-passwords}

キーストアから複数の Vault パスワードをテンプレートに関連付けられます。実行時に、Ansible は指定されたパスワードを使って復号を試みます。

### 詳細度レベル {#verbosity-level}

トラブルシューティングに役立てるため、テンプレートやタスクのフォームからタスクごとに Ansible の詳細度（たとえば `-v`、`-vvv`）を調整できます。
