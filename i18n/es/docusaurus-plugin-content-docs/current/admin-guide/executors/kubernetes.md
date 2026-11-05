---
title: Ejecutor Kubernetes
description: Ejecute cada tarea de un runner en su propio Pod de Kubernetes, con manifiestos de cuentas de servicio y RBAC, ajustes del runner, referencia de configuración y solución de problemas.
sidebar_custom_props:
  edition: enterprise
---

# Ejecutor Kubernetes <FeatureState feature="k8s-executor" />

Con el ejecutor Kubernetes, un runner crea un Pod por tarea en un namespace, transmite su
log a Semaphore y elimina el Pod cuando la tarea termina. El runner puede ejecutarse
dentro del clúster (recomendado) o fuera de él con un kubeconfig.

Cómo se ejecuta una tarea en contenedor, qué hay dentro del contenedor y qué no se admite
se describe en [Ejecutores](./#how-a-container-task-runs). Esta página cubre la
configuración de Kubernetes.

## Antes de empezar {#before-you-begin}

- Un servidor de Semaphore con licencia Enterprise.
- Un runner desplegado en el clúster; consulte [Instalar un runner en Kubernetes](/admin-guide/installation/k8s#runner).
  Los pasos siguientes usan su namespace `semaphore` y el Deployment `semaphore-runner`. Para un
  runner fuera del clúster, consulte [Runner fuera del clúster](#runner-outside-the-cluster).
- `kubectl` con permisos para crear cuentas de servicio y objetos RBAC en ese namespace.
- El clúster puede descargar `semaphoreui/job` y `semaphoreui/helper` (o sus propias imágenes).

## Qué crea el runner {#what-the-runner-creates}

Para una tarea con ID `42`, el runner crea en su namespace:

| Objeto | Nombre | Contenido |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Contenedor init `git-clone` (imagen auxiliar) y contenedor `build` (imagen build), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | Uno por clave SSH, montado en `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Contraseñas de Ansible Vault. |
| Secret | `<pod>-extra-vars` | `values.json` con las variables extra. |
| Secret | `<pod>-env` | Secretos del Variable Group de tipo *Variable de entorno* y `SEMAPHORE_JWT`, inyectados con `envFrom`. |
| ConfigMap | `<pod>-inventory` | Un inventario estático. |

Solo se crean los objetos que la tarea necesita. Todos llevan la etiqueta
`semaphoreui.com/runner=semaphore`; el Pod también tiene `semaphoreui.com/task-id=42`. El
runner los elimina todos cuando la tarea termina, también tras un fallo o **Stop**.

## Configuración {#set-up}

### Paso 1. Crear las cuentas de servicio {#step-1-create-the-service-accounts}

El runner necesita una cuenta de servicio para crear los Pods de las tareas. Los Pods de
las tareas reciben una segunda, sin permisos ni token de API, para que un playbook no
pueda usar los derechos del runner.

```yaml title="semaphore-serviceaccounts.yaml"
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-runner
  namespace: semaphore
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: semaphore-job
  namespace: semaphore
automountServiceAccountToken: false
```

### Paso 2. Conceder permisos al runner {#step-2-grant-the-runner-its-permissions}

Esta es la lista completa de llamadas a la API que hace el ejecutor:

```yaml title="semaphore-rbac.yaml"
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: semaphore-runner
  namespace: semaphore
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["create", "get", "delete"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["create", "delete"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: semaphore-runner
  namespace: semaphore
subjects:
  - kind: ServiceAccount
    name: semaphore-runner
    namespace: semaphore
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: semaphore-runner
```

Un `Role`, no un `ClusterRole`: el runner solo puede tocar su propio namespace.

### Paso 3. Cambiar el runner al ejecutor Kubernetes {#step-3-switch-the-runner-to-the-kubernetes-executor}

Los Pods de las tareas no definen un `securityContext`, por lo que un namespace que aplica el nivel
de Pod Security `restricted` los rechaza. Permita `baseline`:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Asigne al Pod del runner su cuenta de servicio y los ajustes del ejecutor. En el Deployment del
runner, añada a `spec.template.spec`:

```yaml title="semaphore-runner.yaml (fragment)"
    spec:
      serviceAccountName: semaphore-runner
      containers:
        - name: runner
          env:
            # ...SEMAPHORE_WEB_ROOT and SEMAPHORE_RUNNER_TOKEN as before
            - name: SEMAPHORE_RUNNER_EXECUTOR_TYPE
              value: k8s
            - name: SEMAPHORE_RUNNER_K8S_NAMESPACE
              value: semaphore
            - name: SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT
              value: semaphore-job
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: semaphoreui/job:latest
```

```bash
kubectl apply -f semaphore-serviceaccounts.yaml -f semaphore-rbac.yaml -f semaphore-runner.yaml
kubectl -n semaphore rollout status deploy/semaphore-runner
```

Sin `kubeconfig` definido, el runner usa las credenciales dentro del clúster de
`semaphore-runner`. Las tareas ya no se ejecutan en el Pod del runner, así que puede reducir sus
`resources` (por ejemplo, `100m` de CPU y `256Mi` de memoria).

### Paso 4. Ejecutar una tarea {#step-4-run-a-task}

Dirija una plantilla al runner e inicie una tarea. Observe cómo su Pod aparece y desaparece:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

El log de la tarea muestra:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Ejemplos {#examples}

### Runner fuera del clúster {#runner-outside-the-cluster}

El runner se ejecuta en una VM o en Docker y accede al servidor de API con un kubeconfig.
Dé al kubeconfig el [Role del paso 2](#step-2-grant-the-runner-its-permissions) y nada más:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "k8s",
      "k8s": {
        "kubeconfig": "/etc/semaphore/kubeconfig",
        "namespace": "semaphore",
        "service_account": "semaphore-job"
      }
    }
  }
}
```

Se usa el contexto actual del kubeconfig.

### Imágenes de un registro privado {#images-from-a-private-registry}

Cree un secret de descarga en el namespace e inclúyalo en `pull_secrets`; varios nombres
se separan con comas:

```bash
kubectl -n semaphore create secret docker-registry registry-example \
  --docker-server=registry.example.com \
  --docker-username=<user> --docker-password=<password>
```

```yaml
            - name: SEMAPHORE_RUNNER_K8S_IMAGE
              value: registry.example.com/semaphore/job-aws:1.0
            - name: SEMAPHORE_RUNNER_K8S_PULL_SECRETS
              value: registry-example
```

Los secrets se adjuntan a cada Pod de tarea, por igual para la imagen build, la imagen
auxiliar y la **Imagen del ejecutor** de una plantilla.

### CPU y memoria de los Pods de tareas {#cpu-and-memory-of-task-pods}

El ejecutor no define requests ni limits en los Pods de tareas. Defina valores
predeterminados para el namespace con un `LimitRange`; se aplica a los contenedores
`git-clone` y `build`:

```yaml title="semaphore-limits.yaml"
apiVersion: v1
kind: LimitRange
metadata:
  name: semaphore-task-defaults
  namespace: semaphore
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: 250m
        memory: 256Mi
      default:
        cpu: "2"
        memory: 2Gi
```

Añada un `ResourceQuota` para limitar cuánto pueden usar todas las tareas paralelas del namespace.

### Restringir la red de los Pods de tareas {#restrict-the-network-of-task-pods}

Los Pods de tareas llevan la etiqueta `semaphoreui.com/runner=semaphore`, así que una
`NetworkPolicy` puede seleccionarlos. Esta solo permite DNS, el servidor Git y SSH hacia
los hosts gestionados:

```yaml title="semaphore-netpol.yaml"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: semaphore-tasks
  namespace: semaphore
spec:
  podSelector:
    matchLabels:
      semaphoreui.com/runner: semaphore
  policyTypes: ["Ingress", "Egress"]
  egress:
    - ports:
        - { protocol: UDP, port: 53 }
        - { protocol: TCP, port: 53 }
    - to:
        - ipBlock: { cidr: 10.20.0.0/16 }   # Git server and managed hosts
      ports:
        - { protocol: TCP, port: 22 }
        - { protocol: TCP, port: 443 }
```

## Referencia de configuración {#configuration-reference}

Todas las opciones están en `runner.executor.k8s` en la configuración del runner.

| Opción | Variable de entorno | Predeterminado | Descripción |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | in-cluster | Ruta a un archivo kubeconfig. Vacío: la cuenta de servicio del Pod del runner. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Namespace de los Pods, Secrets y ConfigMaps de las tareas. Debe existir. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Imagen del contenedor `build`. La **Imagen del ejecutor** de una plantilla la sobrescribe. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Imagen del contenedor init `git-clone`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Cuenta de servicio de los Pods de tareas. Use una sin permisos; consulte el [paso 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | `imagePullSecrets` separados por comas para los Pods de tareas. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | Cada cuánto lee el runner el estado del Pod. Valores menores inician antes la transmisión del log y cuestan más llamadas a la API. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Periodo de gracia de la eliminación del Pod cuando la tarea termina o se detiene. |

La política de descarga de imágenes sigue el valor predeterminado de Kubernetes: `Always`
para `:latest` y, en otro caso, `IfNotPresent`.

## Seguridad {#security}

- **Mínimo privilegio para el runner.** El [Role](#step-2-grant-the-runner-its-permissions)
  está limitado al namespace y solo enumera lo que llama el ejecutor. No vincule `cluster-admin`.
- **Sin acceso a la API para las tareas.** Con el valor predeterminado
  `service_account: default`, el Pod de la tarea obtiene el token de la cuenta default
  del namespace. Use una cuenta dedicada con `automountServiceAccountToken: false`.
- **Un namespace solo para Semaphore.** El runner no puede leer nada, pero sí crear y
  eliminar Pods y Secrets allí; no comparta el namespace con otras cargas de trabajo.
- **Los secretos** son Secrets de Kubernetes separados por tarea, montados en solo lectura
  (los secretos de entorno mediante `envFrom`, así que sus valores no aparecen en la
  especificación del Pod) y eliminados con el Pod. Quien pueda leer Secrets en el
  namespace puede leerlos mientras la tarea se ejecuta; active el
  [cifrado en reposo](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  para los Secrets.
- **Red.** Limite lo que alcanzan las tareas con una [NetworkPolicy](#restrict-the-network-of-task-pods).

## Detener y limpiar {#stop-and-clean-up}

**Stop** en la interfaz termina la transmisión del log y elimina el Pod con
`cleanup_grace_seconds` y, después, sus Secrets y ConfigMaps.

Si el runner se mata durante una tarea, los objetos de la tarea quedan en el namespace;
el runner no los recoge en el siguiente inicio. Elimínelos cuando no haya ninguna tarea
en ejecución:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Solución de problemas {#troubleshooting}

| Síntoma | Causa y solución |
|---|---|
| Log del runner: `k8s executor is only available in the proprietary build` | El runner es una compilación Community. Use `semaphoreui/runner` o el binario oficial. |
| Log del runner: `failed to initialise executor provider` con `unable to load in-cluster configuration` | El runner está fuera de un clúster y `kubeconfig` está vacío, o la ruta del kubeconfig es incorrecta. |
| Tarea: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | Falta RBAC o está vinculado en otro namespace. Compruébelo con `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Tarea: `create pod ...: namespaces "semaphore" not found` | Cree el namespace; el runner no lo hace. |
| Tarea: `create pod ...: violates PodSecurity "restricted"` | Etiquete el namespace con `pod-security.kubernetes.io/enforce: baseline`. |
| La tarea se queda en **Running** sin salida | El Pod está atascado en `Pending`: ningún nodo encaja, la imagen no se puede descargar (`ImagePullBackOff`) o una cuota lo bloquea. El runner espera hasta que el Pod termine. Revise `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` y detenga la tarea. |
| Tarea: `pod ... finished with status Failed` | Falló el clonado o la aplicación. El log anterior muestra la salida de `git-clone` y `build`. |
| `interpreter python3 not found in image` | A la imagen build le falta el binario de la aplicación; defina otra imagen o la **Imagen del ejecutor** de la plantilla. |
| `No user exists for uid ...` (OpenShift) | El `/etc/passwd` de la imagen no tiene permiso de escritura para el grupo. Consulte [Crear una imagen personalizada](./#build-a-custom-image). |

## Páginas relacionadas {#related-pages}

- [Ejecutores](/admin-guide/executors): cómo se ejecutan las tareas en contenedor, imágenes, limitaciones.
- [Ejecutor Docker](./docker): el mismo modelo en un host Docker.
- [Instalación en Kubernetes](/admin-guide/installation/k8s): el servidor y el Deployment del runner.
- [Imagen del ejecutor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): otra imagen para una sola plantilla.
