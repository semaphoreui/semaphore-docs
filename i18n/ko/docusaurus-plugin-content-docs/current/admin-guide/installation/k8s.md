---
title: Kubernetes
description: 공식 Helm 차트로 Semaphore 서버를 Kubernetes에 설치하고, Semaphore 러너를 클러스터에서 Deployment로 실행합니다.
---

# Kubernetes

## 서버 {#server}

Semaphore는 Kubernetes에 설치하기 위한 Helm 차트를 제공합니다.

자세한 문서는 artifacthub.io에서 확인할 수 있습니다: [Semaphore Helm 차트](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## 러너 {#runner}

[러너](/admin-guide/runners)는 클러스터에서 `semaphoreui/runner` 이미지의 Deployment로
실행됩니다. 러너가 서버에 직접 연결하므로 Service나 Ingress가 필요하지 않습니다. 기본적으로
작업을 자신의 Pod 안에서 실행합니다. 작업마다 별도의 Pod를 시작하려면 이 단계를 마친 뒤
[Kubernetes 익스큐터](/admin-guide/executors/kubernetes)를 설정하십시오.

### 시작하기 전에 {#before-you-begin}

- 러너 토큰: UI에서 **Register**를 선택한 상태로 러너를 만들고 토큰을 복사합니다.
  [프로젝트 러너](/user-guide/projects/runners#adding-a-runner) 또는
  [러너](/admin-guide/runners)를 참조하십시오.
- 네임스페이스, Secret, Deployment를 만들 권한이 있는 `kubectl`.

### 1단계. 네임스페이스 만들기 {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### 2단계. 러너 토큰 저장하기 {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### 3단계. 러너 배포하기 {#step-3-deploy-the-runner}

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

러너는 서버의 러너 페이지에 **Online**으로 표시됩니다. 기본 로컬 익스큐터에서는 작업이 이
Pod에서 실행되므로 가장 무거운 작업에 맞게 `resources`를 정하십시오. Kubernetes 익스큐터를
사용하면 러너 자체에 필요한 리소스는 훨씬 적습니다.

러너를 더 추가하려면 러너마다 토큰과 Deployment를 하나씩 만드십시오. 서버는 러너 토큰 하나를
러너 프로세스 하나로 취급하므로 `replicas: 1`을 유지하십시오.

## 관련 페이지 {#related-pages}

- [러너](/admin-guide/runners): 등록, 구성 파일, 보안.
- [Kubernetes 익스큐터](/admin-guide/executors/kubernetes): 작업마다 Pod 하나.
