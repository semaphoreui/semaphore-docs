---
title: Kubernetes
description: Installez le serveur Semaphore sur Kubernetes avec le chart Helm officiel et exécutez un runner Semaphore dans le cluster en tant que Deployment.
---

# Kubernetes

## Serveur {#server}

Semaphore fournit un chart Helm pour l'installation sur Kubernetes.

Une documentation complète est disponible sur artifacthub.io : [Chart Helm Semaphore](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Runner {#runner}

Un [runner](/admin-guide/runners) s'exécute dans le cluster sous la forme d'un Deployment de l'image
`semaphoreui/runner`. C'est lui qui se connecte au serveur : il n'a donc besoin ni de Service ni
d'Ingress. Par défaut, il exécute les tâches dans son propre Pod ; pour démarrer un Pod distinct pour
chaque tâche, configurez l'[exécuteur Kubernetes](/admin-guide/executors/kubernetes) après ces étapes.

### Avant de commencer {#before-you-begin}

- Un token de runner : créez un runner dans l'interface avec **Enregistrer** coché et copiez le
  token, voir [Runners de projet](/user-guide/projects/runners#adding-a-runner) ou
  [Runners](/admin-guide/runners).
- `kubectl` avec les droits de créer un namespace, des Secrets et des Deployments.

### Étape 1. Créer le namespace {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Étape 2. Stocker le token du runner {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Étape 3. Déployer le runner {#step-3-deploy-the-runner}

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

Le runner apparaît comme **Online** sur la page Runners du serveur. Avec l'exécuteur local par
défaut, les tâches s'exécutent dans ce Pod : dimensionnez donc `resources` pour vos tâches les plus
lourdes ; avec l'exécuteur Kubernetes, le runner lui-même a besoin de beaucoup moins.

Pour ajouter d'autres runners, créez un token et un Deployment pour chacun : le serveur considère
chaque token de runner comme un seul processus de runner, gardez donc `replicas: 1`.

## Pages associées {#related-pages}

- [Runners](/admin-guide/runners) : enregistrement, fichier de configuration, sécurité.
- [Exécuteur Kubernetes](/admin-guide/executors/kubernetes) : un Pod par tâche.
