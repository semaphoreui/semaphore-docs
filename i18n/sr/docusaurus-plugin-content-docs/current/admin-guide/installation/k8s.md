---
title: Kubernetes
description: Instalirajte Semaphore server na Kubernetes pomoću zvaničnog Helm chart-a i pokrenite Semaphore runner u klasteru kao Deployment.
---

# Kubernetes

## Server {#server}

Semaphore obezbeđuje Helm chart za instalaciju na Kubernetes.

Detaljna dokumentacija se nalazi na artifacthub.io: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Runner {#runner}

[Runner](/admin-guide/runners) radi u klasteru kao Deployment image-a
`semaphoreui/runner`. On se sam povezuje sa serverom, pa mu nisu potrebni ni Service ni Ingress.
Podrazumevano izvršava zadatke u sopstvenom Podu; da biste za svaki zadatak pokretali poseban Pod,
posle ovih koraka podesite [Kubernetes executor](/admin-guide/executors/kubernetes).

### Pre nego što počnete {#before-you-begin}

- Token runnera: kreirajte runner u korisničkom interfejsu sa označenim **Register** i kopirajte
  token, pogledajte [Runneri projekta](/user-guide/projects/runners#adding-a-runner) ili
  [Runneri](/admin-guide/runners).
- `kubectl` sa pravima da kreira namespace, Secret-e i Deployment-e.

### Korak 1. Kreirajte namespace {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Korak 2. Sačuvajte token runnera {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Korak 3. Rasporedite runner {#step-3-deploy-the-runner}

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

Runner se pojavljuje kao **Online** na stranici Runners na serveru. Sa podrazumevanim lokalnim
executorom zadaci se izvršavaju u ovom Podu, pa `resources` podesite prema najzahtevnijim zadacima;
sa Kubernetes executorom samom runneru je potrebno mnogo manje.

Da biste dodali još runnera, kreirajte token i Deployment za svaki od njih: server svaki token
runnera vodi kao jedan proces runnera, pa zadržite `replicas: 1`.

## Povezane stranice {#related-pages}

- [Runneri](/admin-guide/runners): registracija, konfiguracioni fajl, bezbednost.
- [Kubernetes executor](/admin-guide/executors/kubernetes): jedan Pod po zadatku.
