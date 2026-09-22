# Переменные окружения

С помощью переменных окружения можно переопределить любую доступную опцию конфигурации.

Вы можете воспользоваться интерактивным генератором переменных окружения (для Docker):
* для [сервера](https://semaphoreui.com/install/docker/2_12/)
* для [runner'а](https://semaphoreui.com/install/docker/2_12/runner).

---

## Окружение приложений (Ansible, Terraform и т. д.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore может передавать переменные окружения процессам приложений (Ansible, Terraform/OpenTofu, Python, PowerShell и т. д.). Для этого есть две связанные опции:

- `env_vars` / `SEMAPHORE_ENV_VARS`: статические пары ключ-значение, которые будут заданы для процессов приложений.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: список имён переменных, которые сервер будет пробрасывать из окружения собственного процесса.

Пример файла конфигурации:

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

Эквивалент через переменные окружения:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Примечания:
- Проброс выполняется явно: процессы приложений наследуют только переменные, перечисленные в `forwarded_env_vars`.
- Секреты следует передавать безопасным способом (например, через секреты Docker/Kubernetes), а затем пробрасывать с помощью `forwarded_env_vars`.
- Тот же список используется для процессов `git`, которые клонируют и обновляют репозитории, поэтому всё, что нужно `git` из окружения хоста, тоже необходимо пробросить.

---

## Работа за корпоративным прокси {#running-behind-a-corporate-proxy}

Semaphore не передаёт собственное окружение процессам, которые запускает. Кроме `PATH`, переменная попадает в задачу или в клонирование `git` только если она перечислена в `forwarded_env_vars` или задана в `env_vars`.

Особенно это важно для установки из пакета (systemd). Переменные прокси, заданные в unit-файле, действуют на сам сервер Semaphore, но не на `git`:

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

С конфигурацией выше и без дополнительных настроек клонирование репозитория завершается ошибкой:

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` не увидел `NO_PROXY` и отправил запрос к внутреннему хосту через внешний прокси, который его отклонил. Чтобы это исправить, пробросьте три переменные явно:

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

Или через переменную окружения:

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

Примечания:
- Пробрасывайте `NO_PROXY` вместе с переменными прокси. Без неё трафик к внутренним Git-серверам тоже пойдёт через прокси.
- Многие инструменты читают варианты в нижнем регистре (`http_proxy`, `https_proxy`, `no_proxy`). В Linux и macOS имена переменных чувствительны к регистру, поэтому перечислите оба написания, если в вашем окружении они заданы строчными буквами.
- Собственные наборы CA работают так же. Если прокси терминирует TLS, пробросьте `GIT_SSL_CAINFO`, `SSL_CERT_FILE` или `REQUESTS_CA_BUNDLE` по необходимости, вместо того чтобы отключать проверку сертификатов.
- В установках с Docker это обычно выглядит работающим само по себе, потому что переменные прокси заданы для всего контейнера. Пробрасывать их явно всё равно рекомендуется, чтобы одна и та же конфигурация вела себя одинаково в обоих случаях.

---

## Конфигурация исполнителя runner'а {#runner-executor-configuration}

Для развёртываний runner'а весь блок executor можно задать одной JSON-переменной окружения вместо отдельных ключей:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Это эквивалентно заданию `runner.executor.type` и вложенных полей `runner.executor.docker.*` в файле конфигурации. Все настройки исполнителя runner'а см. в разделе [Опции конфигурации](/admin-guide/configuration).

---

## Секретные переменные окружения в группах переменных {#secret-environment-variables-in-variable-groups}

Помимо глобальных переменных окружения, вы можете задавать секреты на уровне проекта в группах переменных. Секретные ключи маскируются в интерфейсе и логах. Об использовании и интеграции с Terraform через переменные `TF_VAR_*` см. `Руководство пользователя → Группы переменных`.
