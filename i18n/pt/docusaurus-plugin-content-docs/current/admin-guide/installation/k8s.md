---
title: Kubernetes
description: Instale o servidor Semaphore no Kubernetes com o Helm chart oficial e execute um runner do Semaphore no cluster como um Deployment.
---

# Kubernetes

## Servidor {#server}

O Semaphore fornece um Helm chart para instalação no Kubernetes.

Uma documentação completa pode ser encontrada no artifacthub.io: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Runner {#runner}

Um [runner](/admin-guide/runners) roda no cluster como um Deployment da imagem
`semaphoreui/runner`. É ele que se conecta ao servidor, então não precisa de Service nem de Ingress.
Por padrão, ele executa as tarefas dentro do próprio Pod; para iniciar um Pod separado para cada
tarefa, configure o [executor Kubernetes](/admin-guide/executors/kubernetes) depois destas etapas.

### Antes de começar {#before-you-begin}

- Um token de runner: crie um runner na interface com **Register** marcado e copie o
  token, consulte [Runners do projeto](/user-guide/projects/runners#adding-a-runner) ou
  [Runners](/admin-guide/runners).
- `kubectl` com permissão para criar um namespace, Secrets e Deployments.

### Etapa 1. Criar o namespace {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Etapa 2. Armazenar o token do runner {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Etapa 3. Implantar o runner {#step-3-deploy-the-runner}

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

O runner aparece como **Online** na página Runners do servidor. Com o executor local padrão, as
tarefas rodam neste Pod, então dimensione `resources` para as suas tarefas mais pesadas; com o
executor Kubernetes, o próprio runner precisa de bem menos.

Para adicionar mais runners, crie um token e um Deployment para cada um: o servidor trata cada token
de runner como um único processo de runner, então mantenha `replicas: 1`.

## Páginas relacionadas {#related-pages}

- [Runners](/admin-guide/runners): registro, arquivo de configuração, segurança.
- [Executor Kubernetes](/admin-guide/executors/kubernetes): um Pod por tarefa.
