---
title: Kubernetes
description: Instale el servidor de Semaphore en Kubernetes con el chart oficial de Helm y ejecute un runner de Semaphore en el clúster como Deployment.
---

# Kubernetes

## Servidor {#server}

Semaphore proporciona un chart de Helm para su instalación en Kubernetes.

Encontrará documentación detallada en artifacthub.io: [Semaphore Helm Chart](https://artifacthub.io/packages/helm/semaphoreui/semaphore).

## Runner {#runner}

Un [runner](/admin-guide/runners) se ejecuta en el clúster como Deployment de la imagen
`semaphoreui/runner`. Es él quien se conecta al servidor, por lo que no necesita Service ni Ingress.
De forma predeterminada ejecuta las tareas dentro de su propio Pod; para iniciar un Pod independiente
por cada tarea, configure el [ejecutor Kubernetes](/admin-guide/executors/kubernetes) después de estos pasos.

### Antes de empezar {#before-you-begin}

- Un token de runner: cree un runner en la interfaz con **Registrar** marcado y copie el
  token; consulte [Runners del proyecto](/user-guide/projects/runners#adding-a-runner) o
  [Runners](/admin-guide/runners).
- `kubectl` con permisos para crear un namespace, Secrets y Deployments.

### Paso 1. Crear el namespace {#step-1-create-the-namespace}

```bash
kubectl create namespace semaphore
```

### Paso 2. Guardar el token del runner {#step-2-store-the-runner-token}

```bash
kubectl -n semaphore create secret generic semaphore-runner \
  --from-literal=token='<runner token>'
```

### Paso 3. Desplegar el runner {#step-3-deploy-the-runner}

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

El runner aparece como **Online** en la página Runners del servidor. Con el ejecutor local
predeterminado, las tareas se ejecutan en este Pod, así que dimensione `resources` para sus tareas
más pesadas; con el ejecutor Kubernetes, el runner en sí necesita mucho menos.

Para añadir más runners, cree un token y un Deployment para cada uno: el servidor trata cada token
de runner como un único proceso de runner, así que mantenga `replicas: 1`.

## Páginas relacionadas {#related-pages}

- [Runners](/admin-guide/runners): registro, archivo de configuración, seguridad.
- [Ejecutor Kubernetes](/admin-guide/executors/kubernetes): un Pod por tarea.
