---
title: Kubernetes
description: Den Semaphore-Server mit dem offiziellen Helm-Chart auf Kubernetes installieren und einen Semaphore-Runner als Deployment im Cluster betreiben.
---

# Kubernetes

## Server {#server}

Semaphore stellt ein Helm-Chart für die Installation auf Kubernetes bereit.

Eine ausführliche Dokumentation finden Sie auf artifacthub.io: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Runner {#runner}

Ein [Runner](/admin-guide/runners) läuft im Cluster als Deployment des Images
`semaphoreui/runner`. Er verbindet sich selbst mit dem Server und benötigt daher weder Service noch
Ingress. Standardmäßig führt er Tasks in seinem eigenen Pod aus; um für jeden Task einen eigenen Pod
zu starten, richten Sie nach diesen Schritten den [Kubernetes-Executor](/admin-guide/executors/kubernetes) ein.

### Bevor Sie beginnen {#before-you-begin}

- Ein Runner-Token: Erstellen Sie in der UI einen Runner mit aktiviertem **Register** und
  kopieren Sie das Token, siehe [Projekt-Runner](/user-guide/projects/runners#adding-a-runner) oder
  [Runner](/admin-guide/runners).
- `kubectl` mit Rechten zum Erstellen eines Namespace, von Secrets und Deployments.

### Schritt 1. Namespace erstellen {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Schritt 2. Runner-Token speichern {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Schritt 3. Runner bereitstellen {#step-3-deploy-the-runner}

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

Der Runner erscheint auf der Runner-Seite des Servers als **Online**. Mit dem standardmäßigen
lokalen Executor laufen die Tasks in diesem Pod, bemessen Sie `resources` also für Ihre
anspruchsvollsten Tasks; mit dem Kubernetes-Executor braucht der Runner selbst deutlich weniger.

Um weitere Runner hinzuzufügen, erstellen Sie für jeden ein Token und ein Deployment: Der Server
behandelt jedes Runner-Token als einen Runner-Prozess, belassen Sie also `replicas: 1`.

## Verwandte Seiten {#related-pages}

- [Runner](/admin-guide/runners): Registrierung, Konfigurationsdatei, Sicherheit.
- [Kubernetes-Executor](/admin-guide/executors/kubernetes): ein Pod pro Task.
