---
title: Клиент
description: Управление сервером Semaphore из терминала и из скриптов с помощью semaphore client - вход и контексты, приоритет настроек, форматы вывода, коды завершения и запуск задач из CI.
---

# Клиент

`semaphore client` управляет работающим сервером Semaphore через его REST API. Ему
нужны только URL сервера и API-токен — ни доступа к базе данных, ни файла
конфигурации сервера, — поэтому он работает с ноутбука, из задания CI или на хосте,
который никогда не видел `config.json` сервера.

```bash
semaphore client --help
```

Команды имеют вид `semaphore client <resource> <action> [id|name]`.
Ресурсы называются в единственном числе, а множественное служит псевдонимом
(`template list` и `templates list` — одно и то же). У каждого ресурса есть `list`,
`get`, `create`, `update` и `delete`; у задач добавляются `run`, `logs`, `wait`, `stop`
и подобные. Полный автоматически сгенерированный список всех команд и флагов —
в [справочнике команд](/reference/cli/commands#semaphore-client).

| Группа | Назначение |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Войти, проверить токен, вывести его, выйти. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Хранить несколько серверов в одном файле конфигурации и переключаться между ними. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Проекты, их участники, резервные копии и восстановление. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Шаблоны задач и `template run` для запуска задачи. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Логи, ожидание, остановка, подтверждение и перезапуск задач. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | Остальные ресурсы проекта. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Ресурсы уровня сервера (только для администраторов). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Версия и настройки сервера. |

## Первый вход {#first-login}

В интерактивном режиме клиент запрашивает логин, пароль и, если включён TOTP,
код, затем создаёт API-токен и сохраняет его. Пароль используется
один раз и нигде не сохраняется.

```bash
semaphore client auth login --url https://semaphore.example.com
```

С уже имеющимся токеном (так же входят на сервер, который предлагает только
единый вход (SSO), — создайте токен на странице **Tokens** своего профиля):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Оба способа сохраняют в `~/.semaphore/client.yml` *контекст* с именем `default`:
именно его берёт любая команда, пока не сказано иное. Второй сервер сохраняется
под собственным именем через `--context <имя>`, и работают с ним тем же
`--context <имя>` (или `SEMAPHORE_CLIENT_CONTEXT`). В файле ничто не помечает
контекст как «текущий», поэтому вход на один сервер не может переназначить
другой. Проверить, что используется сейчас, можно командой
`semaphore client auth status`.

## Конфигурация {#configuration}

Каждый параметр можно задать флагом, переменной окружения или в используемом
контексте; приоритет именно такой:
**флаг > окружение > контекст > значение по умолчанию**.

| Флаг | Переменная окружения | Значение |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | URL сервера, например `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Имя контекста, который используется вместо `default`. |
| — | `SEMAPHORE_CLIENT_TOKEN` | API-токен. Флага `--token` намеренно нет: аргументы процесса видны в `ps` и в истории оболочки. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | Файл с токеном (завершающий перевод строки игнорируется). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | ID или имя проекта для команд, работающих в рамках проекта. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (по умолчанию), `json` или `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Тайм-аут одного HTTP-запроса, по умолчанию `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | PEM-файл с CA, подписавшим сертификат сервера. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | Пропустить проверку TLS. Каждый вызов выводит предупреждение; лучше используйте `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | Никогда не задавать вопросов; команда, которой нужен ответ, вместо этого завершается ошибкой. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | Трассировать HTTP-запросы в stderr. Заголовки авторизации и cookie маскируются. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Путь к файлу конфигурации, по умолчанию `~/.semaphore/client.yml`. |

Токен из окружения используется, только если URL тоже задан через
окружение или флагом. Так токен CI не уйдёт на другой сервер, когда кто-то
запустит то же задание с `--context other`.

### Файл конфигурации {#the-configuration-file}

`~/.semaphore/client.yml` хранит именованные контексты. Его записывают `auth login` и
`context set`; его можно редактировать и вручную.

```yaml
contexts:
  default:
    url: https://semaphore.example.com
    token: 8s3k...            # или token_file
    project: 3                # проект по умолчанию, ID или имя
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

Клиент создаёт каталог с правами `0700`, а файл — с `0600`. Файл, доступный
на запись группе или остальным, отклоняется с подсказкой выполнить
`chmod 600`; файл, доступный на чтение остальным, вызывает предупреждение.

## Вывод {#output}

Данные идут в stdout; сообщения, предупреждения и прогресс — в stderr, поэтому скрипт
может перехватить одно без другого.

| Флаг | Действие |
|------|--------|
| `-o json` | Корректный JSON без оформления. Список всегда массив, пустой список — `[]`. Имена полей совпадают с API. |
| `-o yaml` | Те же данные в формате YAML. |
| `--fields id,name,status` | Только указанные столбцы или поля. Вложенные поля пишутся через точку: `--fields id,params.limit`. |
| `-q`, `--quiet` | Только ID, по одному на строку, — для `xargs` и циклов. |
| `--no-headers` | Таблица без строки заголовка. |
| `--no-color` | Без цветов. Цвета также отключаются, когда stdout не терминал или задана `NO_COLOR`. |

Когда stdout не терминал, столбцы таблицы разделяются табуляцией и никогда
не обрезаются.

К объектам обращаются по числовому ID или по имени. Имя ищется в
проекте без учёта регистра; если его носят несколько объектов, команда завершается
с кодом 5 и выводит кандидатов в stderr.

## Коды завершения {#exit-codes}

| Код | Значение |
|------|---------|
| `0` | Успех. Для команды с ожиданием: задача завершилась со статусом `success`. |
| `1` | Ошибка клиента или API — сбой сети, ошибка сервера, неожиданный ответ. |
| `2` | Ошибка использования: неизвестный флаг, отсутствующий аргумент, не указан проект или требуется подтверждение без терминала (передайте `--yes`). |
| `3` | Ожидаемая задача завершилась со статусом `error`. |
| `4` | Ошибка аутентификации (HTTP 401 или 403). |
| `5` | Объект не найден или имя соответствует нескольким объектам. |
| `6` | Ожидаемая задача завершилась со статусом `stopped`. |
| `124` | Истёк `--wait-timeout`. Задача продолжает выполняться на сервере. |
| `130` | Прервано по Ctrl+C. Клиент отключается; задача продолжает выполняться, если не был указан `--stop-on-interrupt`. |

## Запуск задач из скриптов {#running-tasks-from-scripts}

Настройте задание CI целиком через окружение, и пусть результат определяет
код завершения:

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Запустить задачу, транслировать её лог, завершиться с 0/3/6 по итоговому статусу
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Запустить сейчас, дождаться позже
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` и `--extra-vars-file` заполняют дополнительные переменные задачи;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` и `--diff` переопределяют
то, что шаблон разрешает переопределять.

Задача может остановиться на полпути и ждать подтверждения: план Terraform перед
применением или любой шаблон, приложение которого сначала спрашивает. В терминале
клиент печатает `Apply task <id>? [yes/no]` и отправляет ответ серверу. Без
терминала он сообщает об остановке в stderr и продолжает ждать, поэтому в CI
нужен `task confirm <id>` или `task reject <id>` со стороны, `--auto-approve`,
если шаблон это разрешает, либо `--wait-timeout`, чтобы прекратить ожидание.
Для конвейера, который не должен останавливаться ни перед каким шлюзом, есть
`--auto-reject`: он отклоняет такую задачу сразу, как только она спросит.
Отклонённая задача завершается статусом `error`, то есть кодом возврата 3.

Сочетайте `-o json` с `jq` для всего, чего не показывает таблица:

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Секреты и токены {#secrets-and-tokens}

- Токен никогда не выводится, кроме как командой `auth token`, которая нужна, чтобы передать его
  другому инструменту, и предупреждает, когда stdout — терминал.
- Пароли и ключевой материал читаются только из файлов или stdin:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. Секреты окружения передаются через
  `environment create --secrets-file`.
- `environment get` и `key get` показывают имена секретов, но никогда не их значения,
  в любом формате вывода.
- `auth logout --revoke` удаляет токен не только локально, но и на сервере.
- Разрушительные команды запрашивают подтверждение в терминале и требуют `--yes`
  без него; `project delete` требует имя проекта в `--confirm`.
