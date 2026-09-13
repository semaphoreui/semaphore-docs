# Runner'ы

Команда `semaphore runner` запускает Semaphore в **режиме runner'а** и управляет
регистрацией runner'а на сервере. Runner выполняет задачи на машине, отдельной
от сервера Semaphore.

```bash
semaphore runner --help
```

:::tip
О том, как работают runner'ы и как настроить серверную сторону, см. руководство
[Runner'ы](/admin-guide/runners).
:::

Запуск `semaphore runner` без подкоманды просто выводит справку. У команды
следующие подкоманды:

| Команда | Назначение |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | Интерактивно создать файл конфигурации runner'а (и зарегистрировать его, если указан токен). |
| [`runner register`](#registering-a-runner-runner-register) | Зарегистрировать runner на сервере с помощью регистрационного токена. |
| [`runner start`](#starting-a-runner-runner-start) | Запуститься в режиме runner'а и начать принимать задачи. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Удалить регистрацию runner'а с сервера. |

Все подкоманды принимают глобальный флаг `--config <path>`, указывающий на файл
конфигурации runner'а (и `--no-config` для работы только с переменными
окружения).

## Интерактивная настройка (`runner setup`) {#interactive-setup-runner-setup}

Проводит через интерактивную настройку, записывает файл конфигурации runner'а
и, если доступен регистрационный токен (введён в ответ на запрос или задан через
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`), сразу регистрирует runner на сервере.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Передайте `--config <path>`, чтобы указать, куда записать файл конфигурации.
Без него setup запросит выходной каталог (по умолчанию — текущий каталог) и
запишет туда `config.runner.json`.

По завершении выводятся команды для запуска runner'а, например:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

Сгенерированный файл конфигурации можно потом отредактировать вручную, не
запуская setup повторно.

### Опции конфигурации runner'а {#runner-configuration-options}

Поля блока `runner` файла конфигурации:

| Поле | Переменная окружения | Описание |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Токен аутентификации runner'а (выдаётся при регистрации). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Регистрационный токен. Только переменная окружения; в файл никогда не записывается. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Путь к файлу, содержащему регистрационный токен. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Имя runner'а, отображаемое на сервере. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | JSON-массив тегов для маршрутизации runner'ов проекта. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL, который сервер вызывает, когда задача поставлена в очередь для этого runner'а. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Принимает ли runner задачи. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | ID проекта для runner'а уровня проекта. Не указывайте для глобального runner'а. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Интервал опроса в секундах. По умолчанию: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Максимальное число одновременных задач. По умолчанию: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Завершиться после обработки одного задания. Полезно для runner'ов, запускаемых по запросу через webhook. |

Подробности настройки см. в разделе [Runner'ы](/admin-guide/runners), а полный
список опций — в разделе [Конфигурация](/admin-guide/configuration).

## Регистрация runner'а (`runner register`) {#registering-a-runner-runner-register}

Регистрирует runner на сервере и сохраняет выданный токен runner'а в файле
конфигурации (перезаписывая существующий токен). На сервере должен быть
настроен `runner_registration_token`; здесь вы передаёте тот же токен.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Флаг | Описание |
|------|-------------|
| `--registration-token-file <path>` | Прочитать регистрационный токен из файла. |
| `--stdin-registration-token` | Прочитать регистрационный токен из stdin. |
| `--name <name>` | Имя runner'а для регистрации. |
| `--tags <tags>` | Теги runner'а, через запятую или повторением флага (например `--tags a,b` или `--tags a --tags b`). |
| `--webhook <url>` | URL webhook'а runner'а. |
| `--enabled` | Включить или выключить runner на сервере. По умолчанию `true`; передайте `--enabled=false`, чтобы зарегистрировать выключенный runner. |
| `--project-id <id>` | Зарегистрировать как runner уровня проекта для указанного проекта. Если не указан (или `0`), runner регистрируется как глобальный. |

Применяются только фактически переданные флаги; `--name`, `--webhook`, `--tags`
и `--enabled` перезаписывают соответствующие значения из файла конфигурации и
окружения только тогда, когда заданы в командной строке.

### Откуда берётся регистрационный токен {#where-the-registration-token-comes-from}

При регистрации Semaphore берёт регистрационный токен из первого доступного
источника в следующем порядке:

1. Флаг `--registration-token-file`.
2. Параметр `registration_token_file` в файле конфигурации (или
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. Стандартный ввод, если передан `--stdin-registration-token`.
4. Переменная окружения `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`.

Существующий, но пустой файл токена — ошибка. Если ни один источник не даёт
токен, регистрация выполняется без него, и сервер её отклоняет.

## Запуск runner'а (`runner start`) {#starting-a-runner-runner-start}

Запускает runner, подключается к серверу и начинает принимать задачи. Это
команда, которую вы запускаете, чтобы зарегистрированный runner оставался в
сети.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Флаг | Описание |
|------|-------------|
| `--auto-register` | Зарегистрировать runner перед запуском, если он ещё не зарегистрирован (то есть в конфигурации нет токена runner'а). |
| `--register` | Псевдоним `--auto-register`. |

С `--auto-register`, если в конфигурации нет `token`, Semaphore читает
регистрационный токен из `registration_token_file` (или
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) либо из
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, затем повторяет попытки регистрации
каждые 5 секунд до успеха, перечитывает конфигурацию и запускается. Это удобно
для runner'ов, которые регистрируются сами при первом запуске, например в
контейнерах.

`runner start` не принимает `--registration-token-file` и
`--stdin-registration-token`; эти флаги относятся только к `runner register`.

## Отмена регистрации runner'а (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Удаляет регистрацию runner'а с сервера, используя токен runner'а из файла
конфигурации.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
