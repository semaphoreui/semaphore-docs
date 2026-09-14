# Шаблоны сборки и развёртывания

Помимо обычных шаблонов **Task**, в Semaphore есть два типа шаблонов, образующих простой конвейер: **Build** создаёт версионированный артефакт, а **Deploy** доставляет выбранную версию на серверы. Оба типа выбираются в форме шаблона и меняют то, что видит пользователь при запуске задачи.

## Шаблоны сборки {#build-templates}

Шаблон сборки создаёт артефакт: архив, образ контейнера, пакет. Каждой задаче сборки присваивается автоматически увеличивающаяся версия, начиная со значения **Start Version** шаблона (например, `1.0.0`). Версия отображается в столбце **Version** списка шаблонов и в истории задач.

<div class="DialogScreenshot">
  ![Диалог New Task для шаблона сборки](/assets/task-new-build.webp)
</div>

Используйте версию в playbook через `semaphore_vars.task_details.target_version`, чтобы задать имя артефакта.

## Шаблоны развёртывания {#deploy-templates}

Шаблон развёртывания связывается с шаблоном сборки через поле **Build Template**. Когда пользователь нажимает **Deploy**, диалог New Task запрашивает **Build Version** для развёртывания; по умолчанию выбрана последняя успешная сборка.

<div class="DialogScreenshot">
![Диалог New Task для шаблона развёртывания](/assets/task-new-deploy.webp)
</div>

Включите **Autorun** в шаблоне развёртывания, чтобы развёртывание запускалось автоматически после каждой успешной сборки. Версия для развёртывания доступна в playbook как `semaphore_vars.task_details.incoming_version`.

## Переменная `semaphore_vars` {#the-semaphore_vars-variable}

Semaphore передаёт переменную `semaphore_vars` в каждый запускаемый playbook Ansible. Из неё можно узнать тип выполняемой задачи, какую версию нужно собрать или развернуть, кто запустил задачу и какое у неё сообщение.

Пример для задач `build`:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

Пример для задач `deploy`:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

Для шаблонов **Bash**, **PowerShell** и **Python** Semaphore предоставляет те же значения `task_details` в виде переменных окружения:

| Поле `task_details` | Переменная окружения | Примечания |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` или `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | Пользователь, запустивший задачу |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | Сообщение задачи |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Присутствует для задач `build` |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Присутствует для задач `deploy` |

Пример для Bash:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

Пример для PowerShell:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Пример для Python:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## Пример конвейера {#example-pipeline}

Роль Ansible для `build`:

1. Получить исходный код приложения из GitHub.
2. Скомпилировать исходный код.
3. Упаковать бинарный файл в `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`.
4. Загрузить архив в бакет S3.

Роль Ansible для `deploy`:

1. Скачать `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` из бакета S3 на целевые серверы.
2. Распаковать его в целевой каталог.
3. Создать или обновить файлы конфигурации.
4. Перезапустить службу приложения.

Чтобы объединить более двух шагов, добавить согласования или ветвление при ошибке, используйте [Рабочие процессы](../workflows).
