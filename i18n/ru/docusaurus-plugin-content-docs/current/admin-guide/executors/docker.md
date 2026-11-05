---
title: Исполнитель Docker
description: Выполнение каждой задачи раннера в новом Docker-контейнере на локальном или удалённом демоне, с примерами конфигурации, замечаниями по безопасности и устранением неполадок.
sidebar_custom_props:
  edition: pro
---

# Исполнитель Docker <FeatureState feature="docker-executor" />

С исполнителем Docker раннер запускает каждую задачу в новом контейнере и удаляет его
после завершения задачи. Раннер обращается к демону Docker через его API: демон может
находиться на том же хосте или быть удалённым и доступным по TLS.

Как выполняется задача в контейнере, что находится внутри контейнера и что не
поддерживается, описано в разделе [Исполнители](./#how-a-container-task-runs). Эта страница
посвящена настройке Docker.

## Перед началом {#before-you-begin}

- Сервер Semaphore с лицензией Pro или Enterprise.
- Раннер, зарегистрированный на сервере, см. [Раннеры](/admin-guide/runners). Используйте
  образ `semaphoreui/runner` или официальный бинарный файл `semaphore`.
- Docker Engine, доступный с раннера, и права на его использование: членство в группе
  `docker`, доступ к смонтированному сокету или клиентские TLS-сертификаты.
- Демон может загрузить `semaphoreui/job` и `semaphoreui/helper` (или ваши собственные образы).

## Быстрый старт {#quick-start}

Добавьте исполнитель в конфигурацию раннера и перезапустите раннер:

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

Без других параметров раннер использует локальный сокет (`DOCKER_HOST`, если задан,
иначе `unix:///var/run/docker.sock`), образ build `semaphoreui/job:latest` и сеть
`bridge`.

Запустите любую задачу, направленную на этот раннер. Журнал задачи начинается так:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

Пока задача выполняется, её контейнеры можно увидеть так:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Примеры {#examples}

### Бинарный файл раннера на хосте Docker {#runner-binary-on-a-docker-host}

Раннер работает как служба systemd на том же хосте, что и Docker. Дайте его пользователю
доступ к сокету:

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### Раннер в контейнере с сокетом хоста {#runner-in-a-container-with-the-host-socket}

Контейнер раннера управляет демоном хоста через смонтированный сокет; контейнеры задач —
соседи раннера, а не вложенные в него контейнеры. Образ раннера работает с UID `1001`,
поэтому добавьте его в группу — владельца сокета:

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

Том `semaphore-runner-data` хранит токен раннера, выданный при регистрации, поэтому после
перезапуска раннер не регистрируется повторно.

То же самое с Docker Compose:

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

Секреты попадают в задачу через именованный том на демоне, а не через файловую систему
раннера, поэтому делить другие пути между раннером и хостом не нужно.

### Удалённый демон Docker по TLS {#remote-docker-daemon-over-tls}

Раннер и демон находятся на разных машинах. Защитите порт демона взаимным TLS (см.
[Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
и разместите клиентские файлы на раннере:

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

Если задан `cert_path`, раннер проверяет сертификат демона по `ca.pem` и аутентифицируется
с помощью `cert.pem` и `key.pem`. Имена файлов фиксированы.

:::warning
Без `cert_path` соединение `tcp://` — это обычный HTTP, и любой, кто может достучаться до
порта, управляет демоном. Один `tls_verify` TLS не включает (⚠️ 2026-11-05: параметр
читается, но не применяется); для удалённого демона всегда задавайте `cert_path`.
:::

### Сеть для внутренних сервисов {#a-network-for-internal-services}

По умолчанию контейнеры задач подключаются к `bridge`. Чтобы задачи могли обращаться к
сервисам по имени контейнера или чтобы изолировать их в отдельной сети, создайте сеть и
укажите её:

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` принимает любой сетевой режим, понятный Docker: имя сети, `bridge`, `host` или
`none`. Контейнер клонирования подключается к той же сети, поэтому с `none` репозиторий
склонировать не удастся.

### Образы из приватного реестра {#images-from-a-private-registry}

Исполнитель загружает образы без учётных данных реестра. Для приватного образа войдите в
реестр и загрузите образ на хосте демона, а политику загрузки оставьте такой, при которой
образ не загружается повторно:

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

С `if-not-present` используйте тег версии, а не `latest`: тег, который уже есть на демоне,
никогда не обновляется. С `never` отсутствующий образ приводит к ошибке задачи вместо
попытки загрузки.

### Весь блок одной переменной {#the-whole-block-as-one-variable}

Для развёртываний, настраиваемых только через окружение, передайте блок исполнителя в
виде JSON:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Справочник параметров {#configuration-reference}

Все параметры находятся в `runner.executor.docker` конфигурации раннера.

| Параметр | Переменная окружения | По умолчанию | Описание |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, затем сокет платформы | Адрес демона: `unix:///path`, `tcp://host:port` или `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Каталог с `ca.pem`, `cert.pem` и `key.pem` для взаимного TLS. Его указание включает TLS. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Пока не применяется; используйте `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Образ build. Поле **Executor image** шаблона переопределяет его. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Образ контейнера клонирования и заполнения тома секретов. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Сеть контейнеров клонирования и build. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` или `never`. Неизвестное значение заменяется на `if-not-present`. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | без ограничения | CPU на контейнер, как `docker run --cpus`. Допускаются дроби: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | без ограничения | Память на контейнер: байты или с `k`, `m`, `g` (`512m`, `2g`). Нераспознанное значение означает отсутствие ограничения. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Запускает контейнеры с `--privileged`. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Сколько секунд `docker stop` ждёт после **Stop**, прежде чем принудительно завершить контейнер. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | Не используется: исполнитель ждёт завершения контейнера, а не опрашивает его. |

Ограничения, сеть и `privileged` применяются одинаково к контейнеру клонирования и к контейнеру build.

## Остановка и очистка {#stop-and-clean-up}

**Stop** в интерфейсе отправляет `docker stop` работающему контейнеру, ждёт до
`cleanup_grace_seconds`, а затем удаляет контейнеры и оба тома.

Если процесс раннера убит во время задачи, её контейнеры и тома остаются на демоне;
при следующем запуске раннер их не собирает. Всё, что создаёт исполнитель, помечено
меткой `com.semaphoreui.runner=semaphore`, а `com.semaphoreui.task-id` содержит ID задачи.
Удалите остатки, когда на этом демоне не выполняется ни одна задача:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Устранение неполадок {#troubleshooting}

| Сообщение | Причина и решение |
|---|---|
| `docker executor is only available in the proprietary build` (журнал раннера) | Раннер — сборка Community. Используйте `semaphoreui/runner` или официальный бинарный файл. |
| `docker executor: daemon not reachable` | Неверный `host`, демон не работает, или пользователь раннера не может открыть сокет (`permission denied`). Проверьте командой `docker -H <host> info` от имени пользователя раннера; добавьте пользователя в группу сокета. |
| `pull image ...: ... unauthorized` или `not found` | Образ приватный или его имя написано с ошибкой. Сначала загрузите его на хосте демона, см. [приватный реестр](#images-from-a-private-registry). |
| `git clone exited with status 128` | Неверный URL репозитория, ветка или SSH-ключ, либо сеть блокирует Git-хост. Ошибка Git видна в выводе клонирования над этой строкой. |
| `interpreter python3 not found in image; set a runner image that provides it` | В образе build нет бинарного файла приложения. Укажите образ, в котором он есть, на раннере или в поле **Executor image** шаблона. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | В образе нет клиента OpenSSH; Ansible не может использовать ключ инвентаря. Установите `openssh-client`. |
| `Permission denied` в `/workspace` | Собственный образ работает от пользователя, который не может писать в `/workspace`. См. [Сборка собственного образа](./#build-a-custom-image). |
| `build container exited with status N` | Приложение завершилось с кодом `N`; причина в журнале выше. |
| `inventory login_password authentication is not supported` | См. [Ограничения](./#limitations). |

## Связанные страницы {#related-pages}

- [Исполнители](/admin-guide/executors): как выполняются задачи в контейнерах, образы, ограничения.
- [Исполнитель Kubernetes](./kubernetes): та же модель в кластере.
- [Раннеры](/admin-guide/runners): регистрация и запуск раннера.
- [Образ исполнителя](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): другой образ для одного шаблона.
