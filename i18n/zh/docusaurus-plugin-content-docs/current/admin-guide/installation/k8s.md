---
title: Kubernetes
description: 使用官方 Helm chart 在 Kubernetes 上安装 Semaphore 服务器，并以 Deployment 的形式在集群中运行 Semaphore 运行器。
---

# Kubernetes

## 服务器 {#server}

Semaphore 提供了用于在 Kubernetes 上安装的 Helm chart。

详细文档见 artifacthub.io：[Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore)。

## 运行器 {#runner}

[运行器](/admin-guide/runners)以 `semaphoreui/runner` 镜像的 Deployment 形式在集群中运行。
它主动连接服务器，因此不需要 Service 或 Ingress。默认情况下，它在自己的 Pod 中运行任务；
如需为每个任务启动单独的 Pod，请在完成这些步骤后设置 [Kubernetes 执行器](/admin-guide/executors/kubernetes)。

### 开始之前 {#before-you-begin}

- 运行器令牌：在 UI 中勾选 **Register** 创建运行器并复制令牌，参见
  [项目运行器](/user-guide/projects/runners#adding-a-runner)或
  [运行器](/admin-guide/runners)。
- 有权创建命名空间、Secret 和 Deployment 的 `kubectl`。

### 步骤 1. 创建命名空间 {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### 步骤 2. 存储运行器令牌 {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### 步骤 3. 部署运行器 {#step-3-deploy-the-runner}

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

运行器会在服务器的运行器页面上显示为 **Online**。使用默认的本地执行器时，任务在此 Pod 中运行，
因此请按最重的任务设置 `resources`；使用 Kubernetes 执行器时，运行器本身需要的资源要少得多。

要添加更多运行器，请为每个运行器分别创建令牌和 Deployment：服务器将每个运行器令牌视为一个运行器进程，
因此请保持 `replicas: 1`。

## 相关页面 {#related-pages}

- [运行器](/admin-guide/runners)：注册、配置文件、安全。
- [Kubernetes 执行器](/admin-guide/executors/kubernetes)：每个任务一个 Pod。
