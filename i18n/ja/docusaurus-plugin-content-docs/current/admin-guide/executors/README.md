---
title: エグゼキューター
description: ランナーがローカル、Docker、Kubernetes の各エグゼキューターでタスクをどのように実行するか、コンテナー内で何が動くか、コンテナーエグゼキューターが対応していない機能について説明します。
---

# エグゼキューター

エグゼキューターは、**ランナーがタスクのプロセスをどこで起動するか**を決めます。ランナーは
引き続きサーバーをポーリングし、タスクを受け取り、ログを送り返します。変わるのは
Ansible、Terraform、シェルのプロセスが実行される場所だけです。

| エグゼキューター | `runner.executor.type` | タスクの実行場所 | エディション |
|---|---|---|---|
| ローカル | `local`（既定） | ランナーホスト上の子プロセス。ランナーのファイル、ツール、`PATH` を使用します。 | Community |
| Docker | `docker` | Docker デーモン上の新しいコンテナー。タスク終了後に削除されます。 | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Kubernetes の名前空間内の新しい Pod。タスク終了後に削除されます。 | <FeatureState feature="k8s-executor" /> |

エグゼキューターはサーバーやテンプレートではなく、**ランナー**の設定です。Semaphore
サーバー自身は常にタスクをローカルで実行します。タスクをコンテナーで実行するには、
[ランナー](/admin-guide/runners)を起動し、ランナータグでテンプレートをそのランナーに割り当てます。

## エグゼキューターの選択 {#choose-an-executor}

| 必要なもの | 使用するもの |
|---|---|
| 1 台のマシンにインストールされたツール、そのファイルへのアクセス、ワークフローの出力 | ローカル |
| タスクごとのクリーンな環境、テンプレートごとに異なるツールチェーン、1 台または数台のホスト | [Docker](./docker) |
| クラスター全体へのタスクのスケジューリング、Kubernetes の RBAC と Secret、Docker ソケット不要 | [Kubernetes](./kubernetes) |

## エグゼキューターの設定 {#set-the-executor}

ランナーの設定ファイルの `runner` セクションに `executor` ブロックを追加します。

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

または、環境変数を設定します。

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

すべてのオプションには環境変数があります。完全な一覧は
[Docker](./docker#configuration-reference) と [Kubernetes](./kubernetes#configuration-reference)
のページにあります。エグゼキューターを変更したら、ランナーを再起動してください。

:::info
コンテナーエグゼキューターはランナーの Pro ビルドに含まれています。`semaphoreui/runner`
イメージまたは公式の `semaphore` バイナリを使用してください。`semaphoreui/runner-community`
イメージはこれらを含まずにビルドされており、起動時に
`docker executor is only available in the proprietary build` をログに出力します。
:::

## コンテナータスクの実行の流れ {#how-a-container-task-runs}

どちらのコンテナーエグゼキューターも、同じ方法でタスクを実行します。

1. **準備。** ランナーは共有ワークスペースを作成し、タスクのシークレット
   （SSH キー、Vault のパスワード、追加変数、静的インベントリー）をコンテナーから
   読める場所に置きます。
2. **クローン。** 短時間だけ動く*ヘルパー*コンテナーが、リポジトリを
   `/workspace/repo` にクローンします（タスクのブランチを `git clone --depth 1`）。
3. **ビルド。** *ビルド*コンテナーが `/workspace/repo` で起動し、アプリを実行します。
   `ansible-playbook`、`terraform`/`tofu`/`terragrunt`、`bash`、`python3`、
   `powershell`、またはカスタムアプリのバイナリです。その終了コードがタスクの結果になります。
4. **ログ。** 両方のコンテナーの出力は、実行中にタスクログへストリーミングされます。
5. **クリーンアップ。** タスクのコンテナー、ボリューム、Secret、ConfigMap は、タスクが
   成功しても失敗しても停止されても削除されます。

| ステップ | Docker | Kubernetes |
|---|---|---|
| ワークスペース | 名前付きボリューム `semaphore-workspace-<task>-<random>` | Pod の `emptyDir` ボリューム |
| シークレット | 名前付きボリューム `semaphore-secrets-<task>-<random>`、読み取り専用でマウント | 種類ごとに 1 つの Secret または ConfigMap、読み取り専用でマウント |
| クローン | コンテナー `semaphore-job-<task>-<random>-clone` | init コンテナー `git-clone` |
| ビルド | コンテナー `semaphore-job-<task>-<random>-build` | Pod `semaphore-job-<task>-<random>` のコンテナー `build` |
| 停止ボタン | `cleanup_grace_seconds` を指定して `docker stop`、その後削除 | `cleanup_grace_seconds` を指定して Pod を削除 |

UI から停止したタスクは、ローカルエグゼキューターと同様に **Stopped** ステータスで終了します。

## ビルドコンテナーの内部 {#inside-the-build-container}

| パス | 内容 |
|---|---|
| `/workspace` | 書き込み可能なワークスペース。タスクの `HOME` でもあります。 |
| `/workspace/repo` | クローンされたリポジトリ。作業ディレクトリです。 |
| `/secrets/ssh/<key id>/id_rsa` | リポジトリまたはインベントリーの SSH 秘密鍵。アプリの起動前に `ssh-agent` に読み込まれます。 |
| `/secrets/vault/<name>` | Ansible Vault のパスワード。`--vault-id=<name>@<path>` として渡されます。 |
| `/secrets/extra-vars/values.json` | 変数グループの追加変数と `semaphore_vars`。`--extra-vars @<path>` として渡されます。 |
| `/secrets/inventory/inventory.cfg` または `inventory.yml` | Semaphore に保存された静的インベントリー。ファイルインベントリーはリポジトリから読み込まれます。 |

コンテナーには決まった環境変数のセットが渡されます。一覧は
[タスクの環境変数](/reference/task-environment#container-executors)にあります。
ランナー自身の `env_vars`、`forwarded_env_vars`、`PATH`、`apps.*` のパスはコンテナーに
**渡されません**。

## イメージ {#images}

すべてのタスクで 2 つのイメージが使われます。

| イメージ | 既定値 | 用途 | 必要なもの |
|---|---|---|---|
| ビルドイメージ | `semaphoreui/job:latest` | アプリの実行。 | `sh`、`PATH` 上のアプリのバイナリ。SSH キーを使う場合は `ssh-agent`、`ssh-add`、`setsid`。 |
| ヘルパーイメージ | `semaphoreui/helper:latest` | リポジトリのクローン（Docker ではシークレットボリュームへの書き込みにも使用）。 | `sh`、`git`、`ssh-agent`、`ssh-add`。 |

`semaphoreui/job` は Debian ベースで、Ansible 9（ansible-core 2.16–2.17）、Python 3、
OpenSSH、Git、Terraform、OpenTofu、Terragrunt を含みます。ユーザー `nobody`、グループ `0` で実行されます。

ビルドイメージはランナーごとに設定し（`image`）、テンプレートごとに
**エグゼキューターのイメージ** フィールドで上書きできます。
[エグゼキューターのイメージ](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)を参照してください。
ヘルパーイメージはランナーごとにのみ設定できます。

### カスタムイメージのビルド {#build-a-custom-image}

タスクに追加の Ansible コレクション、Python パッケージ、ツールが必要な場合は、
`semaphoreui/job` を拡張します。コンテナーエグゼキューターはリポジトリの `requirements.yml` を
インストール**しない**ため、コレクションやロールはイメージに組み込んでください。

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

イメージを一から作る場合は、`semaphoreui/job` の次の性質を保ってください。

- `/workspace` が存在し、コンテナーを実行するユーザーが書き込めること。
- `/etc/passwd` がグループ書き込み可能であること（`chmod g=u /etc/passwd`）。ランダムな UID で
  起動されたコンテナー（OpenShift）にも passwd のエントリーが作られ、OpenSSH と Git がそれを必要とします。
- 特別なエントリーポイントは不要です。エグゼキューターはスクリプトを `sh -c` で実行します。

## 制限事項 {#limitations}

ローカルエグゼキューターと比べて、コンテナーエグゼキューターは現在次の機能に対応していません。

| 非対応 | 代わりの方法 |
|---|---|
| 種類が **Login with password** のインベントリー認証情報（SSH パスワードまたは become パスワード） | SSH キーを使用します。このようなキーを使うタスクは `inventory login_password authentication is not supported` で失敗します。 |
| 手動承認を待つ Terraform タスク | テンプレートで **Auto approve** を有効にするか、plan のみのタスクを実行します。そうしないとタスクは `terraform manual approval is not supported` で失敗します。 |
| 種類が **Local** のリポジトリ | ワークスペースが空のままになります。Git リポジトリを使用してください。 |
| `requirements.yml` のインストール（Galaxy のロールとコレクション） | [イメージに組み込みます](#build-a-custom-image)。 |
| ワークフローの出力（`SEMAPHORE_OUTPUTS_FILE`） | ワークフローが出力を読むタスクには、ローカルエグゼキューターを使用します。 |
| ホスト設定によるホストごとの認証情報 | ローカルエグゼキューターを使用します。 |
| 最後のコミットより前の Git 履歴 | クローンはシャロー（`--depth 1`）です。 |

SSH のホストキーは検証されません。クローンは新しいホストキーを受け入れ、Ansible は
`ANSIBLE_HOST_KEY_CHECKING=False` で実行されます。

## 関連ページ {#related-pages}

- [Docker エグゼキューター](./docker)：セットアップ、設定、セキュリティ、トラブルシューティング。
- [Kubernetes エグゼキューター](./kubernetes)：RBAC、ランナーのデプロイ、設定、トラブルシューティング。
- [ランナー](/admin-guide/runners)：ランナーの登録と起動。
- [設定オプション](/reference/configuration)：すべての `runner.executor.*` オプション。
