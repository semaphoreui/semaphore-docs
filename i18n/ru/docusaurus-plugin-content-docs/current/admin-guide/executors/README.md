---
title: Исполнители
description: Как раннер выполняет задачи с локальным исполнителем, исполнителем Docker или Kubernetes, что работает внутри контейнеров и чего контейнерные исполнители не поддерживают.
---

# Исполнители

Исполнитель определяет, **где раннер запускает процесс задачи**. Раннер по-прежнему
опрашивает сервер, получает задачу и отправляет журнал обратно; меняется только место,
где работает процесс Ansible, Terraform или shell.

| Исполнитель | `runner.executor.type` | Где выполняется задача | Редакция |
|---|---|---|---|
| Локальный | `local` (по умолчанию) | Дочерний процесс на хосте раннера, с его файлами, инструментами и `PATH`. | Community |
| Docker | `docker` | Новый контейнер в демоне Docker, удаляется после задачи. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Новый Pod в пространстве имён Kubernetes, удаляется после задачи. | <FeatureState feature="k8s-executor" /> |

Исполнитель — это настройка **раннера**, а не сервера или шаблона. Сам сервер Semaphore
всегда выполняет задачи локально; чтобы выполнять задачи в контейнерах, запустите
[раннер](/admin-guide/runners) и направьте на него шаблоны с помощью тега раннера.

## Выбор исполнителя {#choose-an-executor}

| Что нужно | Что использовать |
|---|---|
| Инструменты, установленные на одной машине, доступ к её файлам, выходные данные workflow | Локальный |
| Чистое окружение для каждой задачи, разные наборы инструментов для разных шаблонов, на одном или нескольких хостах | [Docker](./docker) |
| Распределение задач по кластеру, RBAC и Secrets Kubernetes, без сокета Docker | [Kubernetes](./kubernetes) |

## Настройка исполнителя {#set-the-executor}

Добавьте блок `executor` в секцию `runner` файла конфигурации раннера:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

Или задайте переменную окружения:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

У каждого параметра есть переменная окружения; полные списки приведены на страницах
[Docker](./docker#configuration-reference) и [Kubernetes](./kubernetes#configuration-reference).
После смены исполнителя перезапустите раннер.

:::info
Контейнерные исполнители входят в Pro-сборку раннера. Используйте образ
`semaphoreui/runner` или официальный бинарный файл `semaphore`. Образ
`semaphoreui/runner-community` собран без них и при запуске пишет в журнал
`docker executor is only available in the proprietary build`.
:::

## Как выполняется задача в контейнере {#how-a-container-task-runs}

Оба контейнерных исполнителя выполняют задачу одинаково:

1. **Подготовка.** Раннер создаёт общую рабочую область и кладёт секреты задачи
   (SSH-ключи, пароли vault, дополнительные переменные, статический инвентарь) туда,
   где контейнеры могут их прочитать.
2. **Клонирование.** Короткоживущий *вспомогательный* (helper) контейнер клонирует
   репозиторий в `/workspace/repo` (`git clone --depth 1` ветки задачи).
3. **Сборка.** Контейнер *build* запускается в `/workspace/repo` и запускает приложение:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` или бинарный файл пользовательского приложения. Его код выхода — результат задачи.
4. **Журнал.** Вывод обоих контейнеров передаётся в журнал задачи во время их работы.
5. **Очистка.** Контейнеры, тома, Secrets и ConfigMaps задачи удаляются независимо от того,
   завершилась задача успешно, с ошибкой или была остановлена.

| Шаг | Docker | Kubernetes |
|---|---|---|
| Рабочая область | Именованный том `semaphore-workspace-<task>-<random>` | Том `emptyDir` Pod'а |
| Секреты | Именованный том `semaphore-secrets-<task>-<random>`, смонтирован только для чтения | Один Secret или ConfigMap на каждый вид, смонтирован только для чтения |
| Клонирование | Контейнер `semaphore-job-<task>-<random>-clone` | Init-контейнер `git-clone` |
| Сборка | Контейнер `semaphore-job-<task>-<random>-build` | Контейнер `build` Pod'а `semaphore-job-<task>-<random>` |
| Кнопка остановки | `docker stop` с `cleanup_grace_seconds`, затем удаление | Удаление Pod'а с `cleanup_grace_seconds` |

Задача, остановленная из интерфейса, получает статус **Stopped**, как и с локальным исполнителем.

## Внутри контейнера build {#inside-the-build-container}

| Путь | Содержимое |
|---|---|
| `/workspace` | Рабочая область с правом записи; также `HOME` задачи. |
| `/workspace/repo` | Клонированный репозиторий; рабочий каталог. |
| `/secrets/ssh/<key id>/id_rsa` | Закрытый SSH-ключ репозитория или инвентаря. Загружается в `ssh-agent` до запуска приложения. |
| `/secrets/vault/<name>` | Пароль Ansible vault, передаётся как `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Дополнительные переменные из Variable Group и `semaphore_vars`, передаются как `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` или `inventory.yml` | Статический инвентарь, хранящийся в Semaphore. Файловые инвентари читаются из репозитория. |

Контейнер получает фиксированный набор переменных окружения, перечисленных в
[Переменные окружения задачи](/reference/task-environment#container-executors).
Собственные `env_vars`, `forwarded_env_vars`, `PATH` и пути `apps.*` раннера в контейнер
**не** передаются.

## Образы {#images}

В каждой задаче участвуют два образа:

| Образ | По умолчанию | Для чего | Требования |
|---|---|---|---|
| Образ build | `semaphoreui/job:latest` | Запуск приложения. | `sh`, бинарный файл приложения в `PATH`; для SSH-ключей `ssh-agent`, `ssh-add`, `setsid`. |
| Вспомогательный образ | `semaphoreui/helper:latest` | Клонирование репозитория (Docker также заполняет им том секретов). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` — это Debian с Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu и Terragrunt. Он работает от пользователя `nobody`, группа `0`.

Образ build задаётся для раннера (`image`) и может быть переопределён для шаблона
полем **Executor image**, см.
[Образ исполнителя](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
Вспомогательный образ задаётся только для раннера.

### Сборка собственного образа {#build-a-custom-image}

Расширьте `semaphoreui/job`, если задачам нужны дополнительные коллекции Ansible, пакеты
Python или инструменты. Контейнерные исполнители **не** устанавливают `requirements.yml` из
репозитория, поэтому встройте коллекции и роли в образ:

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

Если вы собираете образ с нуля, сохраните эти свойства `semaphoreui/job`:

- `/workspace` существует и доступен для записи пользователю, от которого работает контейнер.
- `/etc/passwd` доступен для записи группе (`chmod g=u /etc/passwd`). Тогда контейнер,
  запущенный со случайным UID (OpenShift), получает запись в passwd, которая нужна OpenSSH и Git.
- Особый entrypoint образу не нужен: исполнитель запускает свой скрипт через `sh -c`.

## Ограничения {#limitations}

По сравнению с локальным исполнителем контейнерные исполнители пока не поддерживают:

| Не поддерживается | Что делать вместо этого |
|---|---|
| Учётные данные инвентаря типа **Login with password** (пароль SSH или пароль become) | Используйте SSH-ключ. Задача с таким ключом завершается ошибкой `inventory login_password authentication is not supported`. |
| Задачи Terraform, ожидающие ручного подтверждения | Включите **Auto approve** в шаблоне или запускайте только plan. Иначе задача завершается ошибкой `terraform manual approval is not supported`. |
| Репозитории типа **Local** | Рабочая область остаётся пустой; используйте Git-репозиторий. |
| Установка `requirements.yml` (роли и коллекции Galaxy) | [Встройте их в образ](#build-a-custom-image). |
| Выходные данные workflow (`SEMAPHORE_OUTPUTS_FILE`) | Используйте локальный исполнитель для задач, чьи выходные данные читает workflow. |
| Учётные данные отдельных хостов из конфигурации хоста | Используйте локальный исполнитель. |
| История Git глубже последнего коммита | Клон неглубокий (`--depth 1`). |

Ключи хостов SSH не проверяются: при клонировании новый ключ хоста принимается, а Ansible
запускается с `ANSIBLE_HOST_KEY_CHECKING=False`.

## Связанные страницы {#related-pages}

- [Исполнитель Docker](./docker): настройка, конфигурация, безопасность, устранение неполадок.
- [Исполнитель Kubernetes](./kubernetes): RBAC, развёртывание раннера, конфигурация, устранение неполадок.
- [Раннеры](/admin-guide/runners): регистрация и запуск раннера.
- [Параметры конфигурации](/reference/configuration): все параметры `runner.executor.*`.
