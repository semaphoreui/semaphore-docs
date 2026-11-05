---
title: Kubernetes エグゼキューター
description: ランナーのすべてのタスクを専用の Kubernetes Pod で実行します。サービスアカウントと RBAC のマニフェスト、ランナーの設定、設定リファレンス、トラブルシューティングを含みます。
sidebar_custom_props:
  edition: enterprise
---

# Kubernetes エグゼキューター <FeatureState feature="k8s-executor" />

Kubernetes エグゼキューターを使うと、ランナーは名前空間内にタスクごとに 1 つの Pod を作成し、
そのログを Semaphore にストリーミングし、タスクの終了時に Pod を削除します。ランナーはクラスター内
（推奨）でも、kubeconfig を使ってクラスター外でも実行できます。

コンテナータスクの実行の流れ、コンテナー内にあるもの、対応していない機能は
[エグゼキューター](./#how-a-container-task-runs)で説明しています。このページでは Kubernetes の
セットアップを扱います。

## 始める前に {#before-you-begin}

- Enterprise ライセンスを持つ Semaphore サーバー。
- クラスターにデプロイされたランナー。[Kubernetes にランナーをインストールする](/admin-guide/installation/k8s#runner)を参照してください。
  以下の手順では、その名前空間 `semaphore` と Deployment `semaphore-runner` を使用します。クラスター外の
  ランナーについては、[クラスター外のランナー](#runner-outside-the-cluster)を参照してください。
- その名前空間にサービスアカウントと RBAC オブジェクトを作成する権限を持つ `kubectl`。
- クラスターが `semaphoreui/job` と `semaphoreui/helper`（または独自のイメージ）を pull できること。

## ランナーが作成するもの {#what-the-runner-creates}

ID が `42` のタスクに対して、ランナーは自身の名前空間に次のものを作成します。

| オブジェクト | 名前 | 内容 |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | init コンテナー `git-clone`（ヘルパーイメージ）とコンテナー `build`（ビルドイメージ）、`restartPolicy: Never`。 |
| Secret | `<pod>-ssh-<key id>` | SSH キーごとに 1 つ。`/secrets/ssh/<key id>/` にマウントされます。 |
| Secret | `<pod>-vault` | Ansible Vault のパスワード。 |
| Secret | `<pod>-extra-vars` | 追加変数を含む `values.json`。 |
| Secret | `<pod>-env` | 種類が*環境変数*の変数グループのシークレットと `SEMAPHORE_JWT`。`envFrom` で注入されます。 |
| ConfigMap | `<pod>-inventory` | 静的インベントリー。 |

タスクに必要なオブジェクトだけが作成されます。すべてに `semaphoreui.com/runner=semaphore` ラベルが付き、
Pod には `semaphoreui.com/task-id=42` も付きます。ランナーはタスクの終了時に、失敗や **Stop** の後も含めて、
それらをすべて削除します。

## セットアップ {#set-up}

### ステップ 1. サービスアカウントを作成する {#step-1-create-the-service-accounts}

ランナーには、タスクの Pod を作成するためのサービスアカウントが 1 つ必要です。タスクの Pod には、
権限も API トークンも持たない 2 つ目のアカウントを割り当てるため、Playbook がランナーの権限を使うことはできません。

```yaml title="semaphore-serviceaccounts.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-runner
  namespace: semaphore
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-job
  namespace: semaphore
automountServiceAccountToken: false
```

### ステップ 2. ランナーに権限を付与する {#step-2-grant-the-runner-its-permissions}

これが、エグゼキューターが行う API 呼び出しの完全な一覧です。

```yaml title="semaphore-rbac.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: semaphore-runner
  namespace: semaphore
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["create", "get", "delete"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["create", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: semaphore-runner
  namespace: semaphore
subjects:
  - kind: ServiceAccount
    name: semaphore-runner
    namespace: semaphore
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: semaphore-runner
```

`ClusterRole` ではなく `Role` です。ランナーは自身の名前空間だけを操作できます。

### ステップ 3. ランナーを Kubernetes エグゼキューターに切り替える {#step-3-switch-the-runner-to-the-kubernetes-executor}

タスクの Pod は `securityContext` を設定しないため、Pod Security レベル `restricted` を強制する
名前空間では拒否されます。`baseline` を許可してください。

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

ランナーの Pod にサービスアカウントとエグゼキューターの設定を与えます。ランナーの Deployment で、
`spec.template.spec` に次を追加します。

```yaml title="semaphore-runner.yaml (fragment)"
    spec:
      serviceAccountName: semaphore-runner
      containers:
        - name: runner
          env:
            # ...SEMAPHORE_WEB_ROOT and SEMAPHORE_RUNNER_TOKEN as before
            - name: SEMAPHORE_RUNNER_EXECUTOR_TYPE
              value: k8s
            - name: SEMAPHORE_RUNNER_K8S_NAMESPACE
              value: semaphore
            - name: SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT
              value: semaphore-job
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: semaphoreui/job:latest
```

```bash
kubectl apply -f semaphore-serviceaccounts.yaml -f semaphore-rbac.yaml -f semaphore-runner.yaml
kubectl -n semaphore rollout status deploy/semaphore-runner
```

`kubeconfig` を設定しない場合、ランナーは `semaphore-runner` のクラスター内認証情報を使用します。
タスクはもうランナーの Pod では実行されないため、その `resources` を減らせます（たとえば CPU `100m`、
メモリー `256Mi`）。

### ステップ 4. タスクを実行する {#step-4-run-a-task}

テンプレートをランナーに割り当て、タスクを開始します。Pod が現れて消える様子を確認できます。

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

タスクログには次のように表示されます。

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## 例 {#examples}

### クラスター外のランナー {#runner-outside-the-cluster}

ランナーは VM 上または Docker 内で動作し、kubeconfig を使って API サーバーに接続します。
kubeconfig には [ステップ 2 の Role](#step-2-grant-the-runner-its-permissions) だけを与え、
それ以上の権限は与えないでください。

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "k8s",
      "k8s": {
        "kubeconfig": "/etc/semaphore/kubeconfig",
        "namespace": "semaphore",
        "service_account": "semaphore-job"
      }
    }
  }
}
```

kubeconfig の現在のコンテキストが使用されます。

### プライベートレジストリのイメージ {#images-from-a-private-registry}

名前空間にプルシークレットを作成し、`pull_secrets` に指定します。複数の名前はカンマで区切ります。

```bash
kubectl -n semaphore create secret docker-registry registry-example \
  --docker-server=registry.example.com \
  --docker-username=<user> --docker-password=<password>
```

```yaml
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: registry.example.com/semaphore/job-aws:1.0
            - name: SEMAPHORE_RUNNER_K8S_PULL_SECRETS
              value: registry-example
```

シークレットはすべてのタスクの Pod に付与され、ビルドイメージ、ヘルパーイメージ、テンプレートの
**エグゼキューターのイメージ** のいずれにも使われます。

### タスクの Pod の CPU とメモリー {#cpu-and-memory-of-task-pods}

エグゼキューターはタスクの Pod に requests や limits を設定しません。名前空間の既定値を
`LimitRange` で設定します。これは `git-clone` コンテナーと `build` コンテナーに適用されます。

```yaml title="semaphore-limits.yaml"
apiVersion: v1
kind: LimitRange
metadata:
  name: semaphore-task-defaults
  namespace: semaphore
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 250m
        memory: 256Mi
      default:
        cpu: "2"
        memory: 2Gi
```

名前空間内で並行して動くすべてのタスクが使える量に上限を設けるには、`ResourceQuota` を追加します。

### タスクの Pod のネットワークを制限する {#restrict-the-network-of-task-pods}

タスクの Pod には `semaphoreui.com/runner=semaphore` ラベルが付いているため、`NetworkPolicy` で
選択できます。次のポリシーは、DNS、Git サーバー、管理対象ホストへの SSH だけを許可します。

```yaml title="semaphore-netpol.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: semaphore-tasks
  namespace: semaphore
spec:
  podSelector:
    matchLabels:
      semaphoreui.com/runner: semaphore
  policyTypes: ["Ingress", "Egress"]
  egress:
    - ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
    - to:
        - ipBlock: { cidr: 10.20.0.0/16 }   # Git server and managed hosts
      ports:
        - { protocol: TCP, port: 22 }
        - { protocol: TCP, port: 443 }
```

## 設定リファレンス {#configuration-reference}

すべてのオプションは、ランナーの設定の `runner.executor.k8s` にあります。

| オプション | 環境変数 | 既定値 | 説明 |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | クラスター内 | kubeconfig ファイルのパス。空の場合はランナーの Pod のサービスアカウントを使用します。 |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | タスクの Pod、Secret、ConfigMap の名前空間。存在している必要があります。 |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | `build` コンテナーのイメージ。テンプレートの **エグゼキューターのイメージ** で上書きされます。 |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | init コンテナー `git-clone` のイメージ。 |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | タスクの Pod のサービスアカウント。権限を持たないものを使用してください。[ステップ 1](#step-1-create-the-service-accounts) を参照してください。 |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | タスクの Pod 用のカンマ区切りの `imagePullSecrets`。 |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | ランナーが Pod のステータスを読み取る間隔。値を小さくするとログのストリーミングが早く始まりますが、API 呼び出しが増えます。 |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | タスクの終了または停止後の Pod 削除の猶予期間。 |

イメージのプルポリシーは Kubernetes の既定に従います。`:latest` では `Always`、それ以外では
`IfNotPresent` です。

## セキュリティ {#security}

- **ランナーには最小権限を。** [Role](#step-2-grant-the-runner-its-permissions) は名前空間に限定され、
  エグゼキューターが呼び出すものだけを列挙しています。`cluster-admin` をバインドしないでください。
- **タスクには API アクセスを与えない。** 既定の `service_account: default` では、タスクの Pod は
  名前空間の default アカウントのトークンを受け取ります。`automountServiceAccountToken: false` を
  設定した専用のアカウントを使用してください。
- **Semaphore 専用の名前空間。** ランナーは何も読み取れませんが、その名前空間で Pod と Secret を
  作成・削除できます。名前空間を他のワークロードと共有しないでください。
- **シークレット**はタスクごとに別々の Kubernetes Secret となり、読み取り専用でマウントされ
  （環境変数のシークレットは `envFrom` 経由なので、値は Pod の spec に含まれません）、Pod とともに削除されます。
  名前空間の Secret を読める人は、タスクの実行中にそれらを読み取れます。Secret の
  [保存時の暗号化](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)を有効にしてください。
- **ネットワーク。** [NetworkPolicy](#restrict-the-network-of-task-pods) でタスクの到達先を制限してください。

## 停止とクリーンアップ {#stop-and-clean-up}

UI の **Stop** はログのストリーミングを終了し、`cleanup_grace_seconds` を指定して Pod を削除した後、
その Secret と ConfigMap を削除します。

タスクの実行中にランナーが強制終了された場合、タスクのオブジェクトは名前空間に残ります。ランナーは
次回の起動時にそれらを回収しません。タスクが実行されていないときに削除してください。

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## トラブルシューティング {#troubleshooting}

| 症状 | 原因と対処 |
|---|---|
| ランナーのログ：`k8s executor is only available in the proprietary build` | ランナーが Community ビルドです。`semaphoreui/runner` または公式のバイナリを使用してください。 |
| ランナーのログ：`failed to initialise executor provider` と `unable to load in-cluster configuration` | ランナーがクラスター外にあり `kubeconfig` が空であるか、kubeconfig のパスが誤っています。 |
| タスク：`create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | RBAC がないか、別の名前空間にバインドされています。`kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner` で確認してください。 |
| タスク：`create pod ...: namespaces "semaphore" not found` | 名前空間を作成してください。ランナーは作成しません。 |
| タスク：`create pod ...: violates PodSecurity "restricted"` | 名前空間に `pod-security.kubernetes.io/enforce: baseline` ラベルを付けてください。 |
| タスクが出力なしで **Running** のまま | Pod が `Pending` で止まっています。条件に合うノードがない、イメージを pull できない（`ImagePullBackOff`）、またはクォータが妨げています。ランナーは Pod が終了するまで待ちます。`kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` で確認し、タスクを停止してください。 |
| タスク：`pod ... finished with status Failed` | クローンまたはアプリが失敗しました。上のログに `git-clone` と `build` の出力があります。 |
| `interpreter python3 not found in image` | ビルドイメージにアプリのバイナリがありません。別のイメージ、またはテンプレートの **エグゼキューターのイメージ** を設定してください。 |
| `No user exists for uid ...`（OpenShift） | イメージの `/etc/passwd` がグループ書き込み可能ではありません。[カスタムイメージのビルド](./#build-a-custom-image)を参照してください。 |

## 関連ページ {#related-pages}

- [エグゼキューター](/admin-guide/executors)：コンテナータスクの実行の流れ、イメージ、制限事項。
- [Docker エグゼキューター](./docker)：同じ仕組みを Docker ホストで。
- [Kubernetes へのインストール](/admin-guide/installation/k8s)：サーバーとランナーの Deployment。
- [エグゼキューターのイメージ](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners)：特定のテンプレートで別のイメージを使う。
