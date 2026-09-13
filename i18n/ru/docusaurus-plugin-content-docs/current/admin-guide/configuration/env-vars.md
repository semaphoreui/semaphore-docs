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
