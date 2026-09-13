
# Файл конфигурации

## Создание файла конфигурации {#creating-configuration-file}

Semaphore использует файл `config.json` для основной конфигурации. Вы можете сгенерировать этот файл интерактивно с помощью встроенных инструментов или через веб-конфигуратор.

### Генерация через CLI {#generate-via-cli}

Используйте следующие команды для интерактивной генерации файла конфигурации:

* Для сервера Semaphore:
  ```
  semaphore setup
  ```
* Для runner'а Semaphore:
  ```
  semaphore runner setup
  ```
  
  :::tip
    Подробнее о настройке runner'а см. в разделе <a href="./../runners">Runner'ы</a>.
  :::

### Генерация на сайте {#generate-on-the-website}

Также можно воспользоваться интерактивным веб-конфигуратором:
* [Конфигуратор сервера](https://semaphoreui.com/install/binary/2_13/config)
* [Конфигуратор runner'а](https://semaphoreui.com/install/binary/2_13/runner)

## Пример файла конфигурации {#configuration-file-example}

Semaphore использует файл конфигурации `config.json` со следующим содержимым:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Использование файла конфигурации {#configuration-file-usage}

* Для сервера Semaphore:

```bash
semaphore server --config ./config.json
```

* Для runner'а Semaphore:

```bash
semaphore runner start --config ./config.json
```

## Каталог секретов {#secrets-directory}

Semaphore читает файлы секретов (например, [записи хранилища ключей на основе файлов](/user-guide/key-store/env-and-file-sources) или токены HashiCorp Vault и OpenBao, считываемые с диска) только из настраиваемого каталога.

| Опция | Переменная окружения | Описание |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Каталог для файлов секретов. По умолчанию: `/tmp/semaphore`. |
| `secrets_path` (устаревшая) | `SEMAPHORE_SECRETS_PATH` | Настройка верхнего уровня, сохранённая для обратной совместимости. Используется, только если `dirs.secrets` не задан или оставлен со значением по умолчанию. |

**Приоритет**: отличное от значения по умолчанию `dirs.secrets` имеет приоритет над устаревшим `secrets_path`. Если вы задаёте `SEMAPHORE_SECRETS_PATH`, Semaphore применяет его к обоим полям.

Пример в текущем формате:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

В старых установках всё ещё может использоваться:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

Файлы ключей, выбранные на вкладке **File** формы хранилища ключей, а также файлы токенов, на которые ссылаются внешние хранилища секретов, должны находиться внутри этого каталога. Пути за его пределами отклоняются с ошибкой `file path must be inside secrets path`. См. [Ключи из переменных окружения и файлов](/user-guide/key-store/env-and-file-sources).

## Операции Git {#git-operations}

Semaphore клонирует и обновляет репозитории задач перед каждым запуском. Этим поведением управляют две опции:

| Опция | Переменная окружения | Описание |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Реализация Git-клиента: `cmd_git` (по умолчанию, использует системный бинарный файл `git`) или `go_git` (клиент на чистом Go). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Сколько раз выполняются попытки clone и pull, прежде чем задача завершится ошибкой. По умолчанию: `4`. Установите `1`, чтобы выполнить одну попытку без повторов. |

Если clone или pull завершился ошибкой и попытки ещё остались, Semaphore ждёт с экспоненциальной задержкой (начиная с 1 секунды, удваивая при каждой попытке, максимум 60 секунд) и записывает в лог сообщение вроде `Git pull failed (...), retrying in 2s`. Повторы применяются только к сетевым операциям; неудачный checkout или ошибка аутентификации всё равно приводят к сбою задачи после исчерпания всех попыток.

Если ваш git-сервер периодически недоступен, увеличьте `git_attempts`. Если ошибки возникают сразу и постоянно (неверные учётные данные, отсутствующий репозиторий), устраните первопричину — повторы тут не помогут.

