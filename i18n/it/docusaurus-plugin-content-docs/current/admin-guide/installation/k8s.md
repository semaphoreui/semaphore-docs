---
title: Kubernetes
description: Installare il server Semaphore su Kubernetes con lo Helm chart ufficiale ed eseguire un runner Semaphore nel cluster come Deployment.
---

# Kubernetes

## Server {#server}

Semaphore fornisce un Helm chart per l'installazione su Kubernetes.

Una documentazione completa è disponibile su artifacthub.io: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Runner {#runner}

Un [runner](/admin-guide/runners) viene eseguito nel cluster come Deployment dell'immagine
`semaphoreui/runner`. È il runner a connettersi al server, quindi non servono né Service né Ingress.
Per impostazione predefinita esegue le attività nel proprio Pod; per avviare un Pod separato per ogni
attività, configurare l'[executor Kubernetes](/admin-guide/executors/kubernetes) dopo questi passi.

### Prima di iniziare {#before-you-begin}

- Un token del runner: creare un runner nell'interfaccia con **Register** selezionato e copiare il
  token, vedere [Runner di progetto](/user-guide/projects/runners#adding-a-runner) o
  [Runner](/admin-guide/runners).
- `kubectl` con i diritti per creare un namespace, Secret e Deployment.

### Passo 1. Creare il namespace {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Passo 2. Memorizzare il token del runner {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Passo 3. Distribuire il runner {#step-3-deploy-the-runner}

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

Il runner compare come **Online** nella pagina Runner del server. Con l'executor locale
predefinito le attività vengono eseguite in questo Pod, quindi dimensionare `resources` per le
attività più pesanti; con l'executor Kubernetes il runner in sé richiede molto meno.

Per aggiungere altri runner, creare un token e un Deployment per ciascuno: il server considera ogni
token del runner come un unico processo runner, quindi mantenere `replicas: 1`.

## Pagine correlate {#related-pages}

- [Runner](/admin-guide/runners): registrazione, file di configurazione, sicurezza.
- [Executor Kubernetes](/admin-guide/executors/kubernetes): un Pod per attività.
