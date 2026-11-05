---
title: Kubernetes
description: 公式 Helm チャートで Semaphore サーバーを Kubernetes にインストールし、Semaphore ランナーをクラスター内で Deployment として実行します。
---

# Kubernetes

## サーバー {#server}

Semaphore は、Kubernetes へのインストール用に Helm チャートを提供しています。

詳細なドキュメントは artifacthub.io にあります: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore)。

## ランナー {#runner}

[ランナー](/admin-guide/runners)は、`semaphoreui/runner` イメージの Deployment としてクラスター内で
動作します。ランナーからサーバーに接続するため、Service も Ingress も不要です。デフォルトでは
タスクをランナー自身の Pod 内で実行します。タスクごとに別の Pod を起動するには、これらの手順の後に
[Kubernetes エグゼキューター](/admin-guide/executors/kubernetes)を設定してください。

### 始める前に {#before-you-begin}

- ランナートークン。UI で **Register** をオンにしてランナーを作成し、トークンをコピーします。
  [プロジェクトのランナー](/user-guide/projects/runners#adding-a-runner)または
  [ランナー](/admin-guide/runners)を参照してください。
- 名前空間、Secret、Deployment を作成する権限を持つ `kubectl`。

### ステップ 1. 名前空間を作成する {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### ステップ 2. ランナートークンを保存する {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### ステップ 3. ランナーをデプロイする {#step-3-deploy-the-runner}

```yaml title="semaphore-runner.yaml"
apiVersion: apps/v1
kind: Deployment
metadata:
  name: semaphore-runner
  namespace: semaphore
spec:
  replicas: 1   # one runner token = one runner process
  selector:
    matchLabels:
      app: semaphore-runner
  template:
    metadata:
      labels:
        app: semaphore-runner
    spec:
      containers:
        - name: runner
          image: semaphoreui/runner:latest
          env:
            - name: SEMAPHORE_WEB_ROOT
              value: https://semaphore.example.com
            - name: SEMAPHORE_RUNNER_TOKEN
              valueFrom:
                secretKeyRef:
                  name: semaphore-runner
                  key: token
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              memory: 2Gi
```

```bash
kubectl apply -f semaphore-runner.yaml
kubectl -n semaphore logs deploy/semaphore-runner
```

ランナーはサーバーの「ランナー」ページに **Online** として表示されます。デフォルトのローカル
エグゼキューターではタスクがこの Pod で実行されるため、最も重いタスクに合わせて `resources` を
設定してください。Kubernetes エグゼキューターを使う場合、ランナー自体に必要なリソースはずっと少なくなります。

ランナーを追加するには、ランナーごとにトークンと Deployment を作成します。サーバーは 1 つの
ランナートークンを 1 つのランナープロセスとして扱うため、`replicas: 1` のままにしてください。

## 関連ページ {#related-pages}

- [ランナー](/admin-guide/runners)：登録、設定ファイル、セキュリティ。
- [Kubernetes エグゼキューター](/admin-guide/executors/kubernetes)：タスクごとに 1 つの Pod。
