---
title: Kubernetes
description: Установка сервера Semaphore в Kubernetes с помощью официального Helm chart и запуск раннера Semaphore в кластере в виде Deployment.
---

# Kubernetes

## Сервер {#server}

Semaphore предоставляет Helm chart для установки в Kubernetes.

Подробная документация доступна на artifacthub.io: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Раннер {#runner}

[Раннер](/admin-guide/runners) работает в кластере как Deployment образа
`semaphoreui/runner`. Он сам подключается к серверу, поэтому ему не нужны ни Service, ни Ingress.
По умолчанию он выполняет задачи в собственном Pod'е; чтобы запускать отдельный Pod для каждой
задачи, после этих шагов настройте [исполнитель Kubernetes](/admin-guide/executors/kubernetes).

### Перед началом {#before-you-begin}

- Токен раннера: создайте раннер в интерфейсе с отмеченным **Register** и скопируйте
  токен, см. [Раннеры проекта](/user-guide/projects/runners#adding-a-runner) или
  [Раннеры](/admin-guide/runners).
- `kubectl` с правами на создание пространства имён, Secret'ов и Deployment'ов.

### Шаг 1. Создайте пространство имён {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Шаг 2. Сохраните токен раннера {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Шаг 3. Разверните раннер {#step-3-deploy-the-runner}

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

Раннер появляется со статусом **Online** на странице раннеров сервера. С локальным исполнителем
по умолчанию задачи выполняются в этом Pod'е, поэтому задайте `resources` под самые тяжёлые
задачи; с исполнителем Kubernetes самому раннеру нужно гораздо меньше.

Чтобы добавить ещё раннеры, создайте для каждого свой токен и Deployment: сервер считает каждый
токен раннера одним процессом раннера, поэтому оставьте `replicas: 1`.

## Связанные страницы {#related-pages}

- [Раннеры](/admin-guide/runners): регистрация, файл конфигурации, безопасность.
- [Исполнитель Kubernetes](/admin-guide/executors/kubernetes): отдельный Pod на каждую задачу.
