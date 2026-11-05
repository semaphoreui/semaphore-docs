---
title: Kubernetes
description: Install the Semaphore server on Kubernetes with the official Helm chart, and run a Semaphore runner in the cluster as a Deployment.
---

# Kubernetes

## Server {#server}

Semaphore provides a helm chart for installation on Kubernetes.

A thorough documentation can be found on artifacthub.io: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Runner {#runner}

A [runner](/admin-guide/runners) runs in the cluster as a Deployment of the
`semaphoreui/runner` image. It connects to the server, so it needs no Service or
Ingress. By default it runs tasks inside its own Pod; to start a separate Pod for every
task, set up the [Kubernetes executor](/admin-guide/executors/kubernetes) after these steps.

### Before you begin {#before-you-begin}

- A runner token: create a runner in the UI with **Register** checked and copy the
  token, see [Project runners](/user-guide/projects/runners#adding-a-runner) or
  [Runners](/admin-guide/runners).
- `kubectl` with rights to create a namespace, Secrets and Deployments.

### Step 1. Create the namespace {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Step 2. Store the runner token {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Step 3. Deploy the runner {#step-3-deploy-the-runner}

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

The runner appears as **Online** on the Runners page of the server. With the default
local executor the tasks run in this Pod, so size `resources` for your heaviest tasks;
with the Kubernetes executor the runner itself needs much less.

To add more runners, create a token and a Deployment for each of them: the server
tracks every runner token as one runner process, so keep `replicas: 1`.

## Related pages {#related-pages}

- [Runners](/admin-guide/runners): registration, configuration file, security.
- [Kubernetes executor](/admin-guide/executors/kubernetes): one Pod per task.
