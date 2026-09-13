# Runner'ы

Runner'ы позволяют выполнять задачи на отдельном сервере, независимом от Semaphore UI.

Runner'ы Semaphore работают по тому же принципу, что и runner'ы GitLab или GitHub Actions:

- Вы запускаете runner на отдельном сервере, указывая адрес сервера Semaphore и токен аутентификации.
- Runner подключается к Semaphore и сообщает о готовности принимать задачи.
- Когда появляется новая задача, Semaphore передаёт runner'у всю необходимую информацию, а тот, в свою очередь, клонирует репозиторий и запускает Ansible, Terraform, PowerShell и т. д.
- Runner отправляет результаты выполнения задачи обратно в Semaphore.

Для конечных пользователей работа с Semaphore с runner'ами или без них выглядит одинаково.

Если runner'ы не определены, сервер Semaphore UI сам выступает в роли runner'а. Все задачи выполняются в контексте сервера Semaphore UI с доступом к его файловой системе.

Использование runner'ов даёт следующие преимущества:
- Более безопасное выполнение задач. Например, runner может находиться в закрытой подсети или изолированном Docker-контейнере.
- Распределение нагрузки между несколькими серверами. Вы можете запустить несколько runner'ов, и задачи будут случайным образом распределяться между ними.

## Настройка {#set-up}

### Настройка сервера {#set-up-a-server}

Чтобы настроить сервер для работы с runner'ами, добавьте в конфигурацию сервера Semaphore следующие параметры:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

или с помощью переменных окружения:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Настройка runner'а {#setup-a-runner}

Для настройки runner'а используйте следующую команду:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

Эта команда создаст файл конфигурации по пути `/path/to/your/config/file.json`.

Но прежде чем использовать эту команду, нужно понять, как runner'ы регистрируются на сервере.

### Регистрация runner'а на сервере {#registering-the-runner-on-the-server}

Есть два способа зарегистрировать runner на сервере Semaphore:
1) Добавить его через веб-интерфейс или API.
2) Использовать командную строку с командой `semaphore runner register`.

#### Добавление runner'а через веб-интерфейс {#adding-the-runner-via-the-web-ui}

![Изображение runner'а](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Регистрация через CLI {#registering-via-cli}

Чтобы зарегистрировать runner этим способом, добавьте параметр `runner_registration_token` в файл конфигурации сервера Semaphore. Этому параметру нужно присвоить произвольную строку. Выберите достаточно сложную строку, чтобы избежать проблем с безопасностью.

Когда команда `semaphore runner setup` спросит, есть ли у вас токен runner'а, ответьте No. Затем используйте следующую команду для регистрации runner'а:

`semaphore runner register --config /path/to/your/config/file.json`

или

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Файл конфигурации {#configuration-file}

В результате выполнения команды `semaphore runner setup` будет создан файл конфигурации следующего вида:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

Вы можете вручную редактировать этот файл без повторного вызова `semaphore runner setup`.

Чтобы перерегистрировать runner, используйте команду `semaphore runner register`. Она перезапишет токен в файле, указанном в конфигурации.

## Запуск runner'а {#running-the-runner}

Теперь можно запустить runner командой:

```
semaphore runner start --config /path/to/your/config/file.json
```

Ваш runner готов выполнять задачи.

### Запуск runner'а в Docker {#running-the-runner-in-docker}

Образ `semaphoreui/runner` запускает runner автоматически. Передайте URL сервера и регистрационный токен через переменные окружения:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Если вашим playbook'ам нужны дополнительные пакеты Python, смонтируйте `requirements.txt` по пути `/etc/semaphore/requirements.txt`. Контейнер устанавливает их с помощью `pip3` при каждом запуске, прежде чем runner подключится к серверу:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

Подробнее о том, куда устанавливаются пакеты и как обрабатываются ошибки, см. в разделе [Установка дополнительных зависимостей Python](/admin-guide/installation/docker#installing-additional-python-dependencies).

### Интервал опроса (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Каждый runner опрашивает сервер Semaphore с фиксированным интервалом для получения новых заданий и
отчёта о ходе выполнения задач. Настройте его в файле конфигурации runner'а:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

Или с помощью переменной окружения:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Значение | Эффект |
|-------|--------|
| **1** (по умолчанию) | Задания подхватываются примерно в течение секунды; оптимально для запусков с низкой задержкой. |
| **Больше** (например, 5–30) | Снижает HTTP-трафик, когда много runner'ов работают с одним сервером. Задания могут запускаться чуть позже. |

Страница Runner'ов в Semaphore UI показывает этот параметр в разделе **Расширенные настройки** при
генерации сниппетов для настройки (файл конфигурации, Docker и примеры с переменными окружения).

Некорректные или нулевые значения заменяются значением по умолчанию — 1 секунда.

### Теги runner'ов (Pro) {#runner-tags-pro}

Вы можете назначить один или несколько тегов runner'у проекта. Затем шаблоны могут требовать определённый тег, чтобы задачи выполнялись только на подходящих runner'ах. Настройте теги при добавлении runner'а в интерфейсе проекта и укажите требуемый тег в настройках шаблона.

## Отмена регистрации runner'а {#runner-deregistration}

Вы можете удалить runner через веб-интерфейс.

![Изображение runner'а](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

Или отмените регистрацию runner'а через CLI:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Безопасность {#security}

Runner'ы аутентифицируются на сервере с помощью непрозрачного bearer-токена
(`X-Runner-Token`), выдаваемого при регистрации. Защищайте этот токен, как и любые другие
учётные данные — храните его в файле конфигурации с ограниченным доступом или в менеджере секретов.

:::warning
Используйте HTTPS для обмена данными между сервером и runner'ом, особенно если
они находятся не в одной приватной сети. Для самоподписанных сертификатов или сертификатов внутреннего CA
настройте `runner.connection.server_ca_cert_file` на стороне runner'а.
Не используйте `runner.connection.skip_tls_verify` в production.
:::
