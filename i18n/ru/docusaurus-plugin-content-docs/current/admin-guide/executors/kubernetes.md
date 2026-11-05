---
title: Исполнитель Kubernetes
description: Выполнение каждой задачи раннера в отдельном Pod'е Kubernetes, с манифестами сервисных аккаунтов и RBAC, настройками раннера, справочником параметров и устранением неполадок.
sidebar_custom_props:
  edition: enterprise
---

# Исполнитель Kubernetes <FeatureState feature="k8s-executor" />

С исполнителем Kubernetes раннер создаёт по одному Pod'у на задачу в пространстве имён,
передаёт его журнал в Semaphore и удаляет Pod после завершения задачи. Раннер может
работать в кластере (рекомендуется) или вне его, с kubeconfig.

Как выполняется задача в контейнере, что находится внутри контейнера и что не
поддерживается, описано в разделе [Исполнители](./#how-a-container-task-runs). Эта страница
посвящена настройке Kubernetes.

## Перед началом {#before-you-begin}

- Сервер Semaphore с лицензией Enterprise.
- Раннер, развёрнутый в кластере, см. [Установка раннера в Kubernetes](/admin-guide/installation/k8s#runner).
  Шаги ниже используют его пространство имён `semaphore` и Deployment `semaphore-runner`. Для
  раннера вне кластера см. [Раннер вне кластера](#runner-outside-the-cluster).
- `kubectl` с правами на создание сервисных аккаунтов и объектов RBAC в этом пространстве имён.
- Кластер может загрузить `semaphoreui/job` и `semaphoreui/helper` (или ваши собственные образы).

## Что создаёт раннер {#what-the-runner-creates}

Для задачи с ID `42` раннер создаёт в своём пространстве имён:

| Объект | Имя | Содержимое |
|---|---|---|
| Pod | `semaphore-job-42-<random>` | Init-контейнер `git-clone` (вспомогательный образ) и контейнер `build` (образ build), `restartPolicy: Never`. |
| Secret | `<pod>-ssh-<key id>` | По одному на SSH-ключ, монтируется в `/secrets/ssh/<key id>/`. |
| Secret | `<pod>-vault` | Пароли Ansible vault. |
| Secret | `<pod>-extra-vars` | `values.json` с дополнительными переменными. |
| Secret | `<pod>-env` | Секреты Variable Group типа *Environment variable* и `SEMAPHORE_JWT`, подключаются через `envFrom`. |
| ConfigMap | `<pod>-inventory` | Статический инвентарь. |

Создаются только объекты, нужные задаче. Все они помечены меткой
`semaphoreui.com/runner=semaphore`; у Pod'а также есть `semaphoreui.com/task-id=42`.
Раннер удаляет их все после завершения задачи, в том числе после ошибки или **Stop**.

## Настройка {#set-up}

### Шаг 1. Создайте сервисные аккаунты {#step-1-create-the-service-accounts}

Раннеру нужен один сервисный аккаунт, чтобы создавать Pod'ы задач. Pod'ы задач получают
второй — без прав и без токена API, чтобы плейбук не мог воспользоваться правами раннера.

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

### Шаг 2. Выдайте раннеру права {#step-2-grant-the-runner-its-permissions}

Это полный список вызовов API, которые делает исполнитель:

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

Именно `Role`, а не `ClusterRole`: раннер может работать только со своим пространством имён.

### Шаг 3. Переключите раннер на исполнитель Kubernetes {#step-3-switch-the-runner-to-the-kubernetes-executor}

Pod'ы задач не задают `securityContext`, поэтому пространство имён, в котором действует
уровень Pod Security `restricted`, их отклоняет. Разрешите `baseline`:

```bash
kubectl label namespace semaphore pod-security.kubernetes.io/enforce=baseline --overwrite
```

Назначьте Pod'у раннера его сервисный аккаунт и настройки исполнителя. В Deployment раннера
добавьте в `spec.template.spec`:

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

Если `kubeconfig` не задан, раннер использует внутрикластерные учётные данные
`semaphore-runner`. Задачи больше не выполняются в Pod'е раннера, поэтому его `resources`
можно уменьшить (например, до `100m` CPU и `256Mi` памяти).

### Шаг 4. Запустите задачу {#step-4-run-a-task}

Направьте шаблон на раннер и запустите задачу. Наблюдайте, как её Pod появляется и исчезает:

```bash
kubectl -n semaphore get pods -l semaphoreui.com/runner=semaphore -w
```

Журнал задачи выглядит так:

```text
k8s: created pod semaphore/semaphore-job-42-a1b2c3 (1 ssh keys installed)
=== git-clone (init) ===
Cloning into '/workspace/repo'...
=== build (build) ===
semaphore: container executor: task 42, template 7
...
k8s: deleted pod semaphore/semaphore-job-42-a1b2c3
```

## Примеры {#examples}

### Раннер вне кластера {#runner-outside-the-cluster}

Раннер работает на ВМ или в Docker и обращается к API-серверу через kubeconfig.
Дайте kubeconfig [роль из шага 2](#step-2-grant-the-runner-its-permissions) и ничего
больше:

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

Используется текущий контекст kubeconfig.

### Образы из приватного реестра {#images-from-a-private-registry}

Создайте pull secret в пространстве имён и укажите его в `pull_secrets`; несколько имён
разделяются запятыми:

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

Секреты подключаются к каждому Pod'у задачи — одинаково для образа build,
вспомогательного образа и **Executor image** шаблона.

### CPU и память Pod'ов задач {#cpu-and-memory-of-task-pods}

Исполнитель не задаёт requests и limits для Pod'ов задач. Задайте значения по умолчанию
для пространства имён с помощью `LimitRange`; он применяется к контейнерам `git-clone` и
`build`:

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

Добавьте `ResourceQuota`, чтобы ограничить суммарное потребление всех параллельных задач
пространства имён.

### Ограничение сети Pod'ов задач {#restrict-the-network-of-task-pods}

Pod'ы задач помечены меткой `semaphoreui.com/runner=semaphore`, поэтому `NetworkPolicy`
может их выбрать. Эта политика разрешает только DNS, Git-сервер и SSH к управляемым хостам:

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

## Справочник параметров {#configuration-reference}

Все параметры находятся в `runner.executor.k8s` конфигурации раннера.

| Параметр | Переменная окружения | По умолчанию | Описание |
|---|---|---|---|
| `kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | in-cluster | Путь к файлу kubeconfig. Пусто: сервисный аккаунт Pod'а раннера. |
| `namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | `semaphore` | Пространство имён Pod'ов, Secrets и ConfigMaps задач. Должно существовать. |
| `image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | `semaphoreui/job:latest` | Образ контейнера `build`. Поле **Executor image** шаблона переопределяет его. |
| `helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | `semaphoreui/helper:latest` | Образ init-контейнера `git-clone`. |
| `service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | `default` | Сервисный аккаунт Pod'ов задач. Используйте аккаунт без прав, см. [шаг 1](#step-1-create-the-service-accounts). |
| `pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | — | `imagePullSecrets` для Pod'ов задач через запятую. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | `3` | Как часто раннер читает статус Pod'а. Меньшие значения раньше запускают передачу журнала, но дают больше вызовов API. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | `30` | Период ожидания при удалении Pod'а после завершения или остановки задачи. |

Политика загрузки образов соответствует умолчанию Kubernetes: `Always` для `:latest`,
иначе `IfNotPresent`.

## Безопасность {#security}

- **Минимальные права для раннера.** [Роль](#step-2-grant-the-runner-its-permissions)
  ограничена пространством имён и содержит только то, что вызывает исполнитель. Не
  привязывайте `cluster-admin`.
- **Никакого доступа к API для задач.** С `service_account: default` по умолчанию Pod
  задачи получает токен аккаунта default пространства имён. Используйте отдельный аккаунт
  с `automountServiceAccountToken: false`.
- **Пространство имён только для Semaphore.** Раннер ничего не может читать, но может
  создавать и удалять там Pod'ы и Secrets; не делите это пространство имён с другими
  нагрузками.
- **Секреты** — это отдельные Secrets Kubernetes для каждой задачи, смонтированные только
  для чтения (секреты окружения — через `envFrom`, поэтому их значений нет в спецификации
  Pod'а) и удаляемые вместе с Pod'ом. Тот, кто может читать Secrets в пространстве имён,
  может прочитать их, пока выполняется задача; включите
  [шифрование при хранении](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)
  для Secrets.
- **Сеть.** Ограничьте доступ задач с помощью [NetworkPolicy](#restrict-the-network-of-task-pods).

## Остановка и очистка {#stop-and-clean-up}

**Stop** в интерфейсе прекращает передачу журнала и удаляет Pod с
`cleanup_grace_seconds`, затем — его Secrets и ConfigMaps.

Если раннер убит во время задачи, объекты задачи остаются в пространстве имён; при
следующем запуске раннер их не собирает. Удалите их, когда не выполняется ни одна задача:

```bash
kubectl -n semaphore get pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
kubectl -n semaphore delete pods,secrets,configmaps -l semaphoreui.com/runner=semaphore
```

## Устранение неполадок {#troubleshooting}

| Симптом | Причина и решение |
|---|---|
| Журнал раннера: `k8s executor is only available in the proprietary build` | Раннер — сборка Community. Используйте `semaphoreui/runner` или официальный бинарный файл. |
| Журнал раннера: `failed to initialise executor provider` с `unable to load in-cluster configuration` | Раннер работает вне кластера, а `kubeconfig` пуст, или путь к kubeconfig неверен. |
| Задача: `create pod ...: pods is forbidden: User "system:serviceaccount:..." cannot create resource` | RBAC отсутствует или привязан в другом пространстве имён. Проверьте `kubectl auth can-i create pods -n semaphore --as=system:serviceaccount:semaphore:semaphore-runner`. |
| Задача: `create pod ...: namespaces "semaphore" not found` | Создайте пространство имён; раннер этого не делает. |
| Задача: `create pod ...: violates PodSecurity "restricted"` | Пометьте пространство имён `pod-security.kubernetes.io/enforce: baseline`. |
| Задача остаётся в статусе **Running** без вывода | Pod застрял в `Pending`: нет подходящего узла, образ не загружается (`ImagePullBackOff`) или его блокирует квота. Раннер ждёт завершения Pod'а. Проверьте `kubectl -n semaphore describe pod -l semaphoreui.com/task-id=<task id>` и остановите задачу. |
| Задача: `pod ... finished with status Failed` | Ошибка клонирования или приложения. В журнале выше — вывод `git-clone` и `build`. |
| `interpreter python3 not found in image` | В образе build нет бинарного файла приложения; укажите другой образ или **Executor image** шаблона. |
| `No user exists for uid ...` (OpenShift) | `/etc/passwd` образа недоступен для записи группе. См. [Сборка собственного образа](./#build-a-custom-image). |

## Связанные страницы {#related-pages}

- [Исполнители](/admin-guide/executors): как выполняются задачи в контейнерах, образы, ограничения.
- [Исполнитель Docker](./docker): та же модель на хосте Docker.
- [Установка в Kubernetes](/admin-guide/installation/k8s): сервер и Deployment раннера.
- [Образ исполнителя](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): другой образ для одного шаблона.
