# Docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Выберите базу данных и создайте файл `docker-compose.yml` со следующим содержимым:

<Tabs groupId="database">
  <TabItem value="sqlite" label="SQLite">

```yaml
services:
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_PLAYBOOK_PATH: /tmp/semaphore/
      SEMAPHORE_ADMIN_PASSWORD: changeme
      SEMAPHORE_ADMIN_NAME: admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: gs72mPntFATGJs9qK0pQ0rKtfidlexiMjYCH9gWKhTU=
      SEMAPHORE_LDAP_ACTIVATED: 'no' # if you wish to use ldap, set to: 'yes'
      SEMAPHORE_LDAP_HOST: dc01.local.example.com
      SEMAPHORE_LDAP_PORT: '636'
      SEMAPHORE_LDAP_NEEDTLS: 'yes'
      SEMAPHORE_LDAP_DN_BIND: 'uid=bind_user,cn=users,cn=accounts,dc=local,dc=shiftsystems,dc=net'
      SEMAPHORE_LDAP_PASSWORD: 'ldap_bind_account_password'
      SEMAPHORE_LDAP_DN_SEARCH: 'dc=local,dc=example,dc=com'
      SEMAPHORE_LDAP_SEARCH_FILTER: "(\u0026(uid=%s)(memberOf=cn=ipausers,cn=groups,cn=accounts,dc=local,dc=example,dc=com))"
      TZ: UTC
volumes:
  semaphore-data:
```

  </TabItem>
  <TabItem value="mysql" label="MySQL">

```yaml
services:
  mysql:
    restart: unless-stopped
    image: mysql:8.0
    hostname: mysql
    volumes:
      - semaphore-mysql:/var/lib/mysql
    environment:
      MYSQL_RANDOM_ROOT_PASSWORD: 'yes'
      MYSQL_DATABASE: semaphore
      MYSQL_USER: semaphore
      MYSQL_PASSWORD: semaphore
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_DB_USER: semaphore
      SEMAPHORE_DB_PASS: semaphore
      SEMAPHORE_DB_HOST: mysql
      SEMAPHORE_DB_PORT: 3306
      SEMAPHORE_DB_DIALECT: mysql
      SEMAPHORE_DB: semaphore
      SEMAPHORE_PLAYBOOK_PATH: /tmp/semaphore/
      SEMAPHORE_ADMIN_PASSWORD: changeme
      SEMAPHORE_ADMIN_NAME: admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: gs72mPntFATGJs9qK0pQ0rKtfidlexiMjYCH9gWKhTU=
      SEMAPHORE_LDAP_ACTIVATED: 'no' # if you wish to use ldap, set to: 'yes'
      SEMAPHORE_LDAP_HOST: dc01.local.example.com
      SEMAPHORE_LDAP_PORT: '636'
      SEMAPHORE_LDAP_NEEDTLS: 'yes'
      SEMAPHORE_LDAP_DN_BIND: 'uid=bind_user,cn=users,cn=accounts,dc=local,dc=shiftsystems,dc=net'
      SEMAPHORE_LDAP_PASSWORD: 'ldap_bind_account_password'
      SEMAPHORE_LDAP_DN_SEARCH: 'dc=local,dc=example,dc=com'
      SEMAPHORE_LDAP_SEARCH_FILTER: "(\u0026(uid=%s)(memberOf=cn=ipausers,cn=groups,cn=accounts,dc=local,dc=example,dc=com))"
      TZ: UTC
    depends_on:
      - mysql
volumes:
  semaphore-mysql:
```

  </TabItem>
  <TabItem value="postgres" label="Postgres">

```yaml
services:
  postgres:
    restart: unless-stopped
    image: postgres:14
    hostname: postgres
    volumes:
      - semaphore-postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: semaphore
      POSTGRES_PASSWORD: semaphore
      POSTGRES_DB: semaphore
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_DB_USER: semaphore
      SEMAPHORE_DB_PASS: semaphore
      SEMAPHORE_DB_HOST: postgres
      SEMAPHORE_DB_PORT: 5432
      SEMAPHORE_DB_DIALECT: postgres
      SEMAPHORE_DB: semaphore
      SEMAPHORE_PLAYBOOK_PATH: /tmp/semaphore/
      SEMAPHORE_ADMIN_PASSWORD: changeme
      SEMAPHORE_ADMIN_NAME: admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: gs72mPntFATGJs9qK0pQ0rKtfidlexiMjYCH9gWKhTU=
      SEMAPHORE_LDAP_ACTIVATED: 'no' # if you wish to use ldap, set to: 'yes'
      SEMAPHORE_LDAP_HOST: dc01.local.example.com
      SEMAPHORE_LDAP_PORT: '636'
      SEMAPHORE_LDAP_NEEDTLS: 'yes'
      SEMAPHORE_LDAP_DN_BIND: 'uid=bind_user,cn=users,cn=accounts,dc=local,dc=shiftsystems,dc=net'
      SEMAPHORE_LDAP_PASSWORD: 'ldap_bind_account_password'
      SEMAPHORE_LDAP_DN_SEARCH: 'dc=local,dc=example,dc=com'
      SEMAPHORE_LDAP_SEARCH_FILTER: "(\u0026(uid=%s)(memberOf=cn=ipausers,cn=groups,cn=accounts,dc=local,dc=example,dc=com))"
      TZ: UTC
    depends_on:
      - postgres
volumes:
  semaphore-postgres:
```

  </TabItem>
</Tabs>

Необходимо указать следующие конфиденциальные переменные:

* `SEMAPHORE_DB_PASS` и `MYSQL_PASSWORD` или `POSTGRES_PASSWORD` &mdash; пароль пользователя базы данных. Для SQLite не требуется.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; пароль администратора Semaphore.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; ключ для шифрования ключей доступа в базе данных. Его необходимо сгенерировать следующей командой: `head -c32 /dev/urandom | base64`.

Если вы используете Docker Swarm, настоятельно рекомендуется не встраивать учётные данные непосредственно в файл Compose (и вообще в переменные окружения), а использовать [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/). Semaphore [поддерживает](https://github.com/semaphoreui/semaphore/issues/1268) распространённый для Docker-контейнеров шаблон получения настроек из файлов вместо окружения: для этого к имени переменной окружения добавляется суффикс `_FILE`. См. [пример в документации Docker](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

Сокращённый пример с использованием секретов:

```yaml
secrets:
  semaphore_admin_pw:
    file: semaphore_admin_password.txt

services:
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_ADMIN_PASSWORD_FILE: /run/secrets/semaphore_admin_pw
      SEMAPHORE_ADMIN_NAME: admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN: admin
```


Выполните следующую команду, чтобы запустить Semaphore с настроенной базой данных (SQLite, MySQL или Postgres):

```bash
docker-compose up
```

&#x20;Semaphore будет доступен по следующему URL: [http://localhost:3000](http://localhost:3000).

## Установка дополнительных зависимостей Python {#installing-additional-python-dependencies}

Некоторым модулям и коллекциям Ansible, а также Python-приложениям нужны дополнительные пакеты Python, не входящие в образ.
Как образ сервера (`semaphoreui/semaphore`), так и образ runner'а (`semaphoreui/runner`) могут устанавливать их автоматически при запуске контейнера.

Чтобы воспользоваться этой возможностью:

1. Создайте файл `requirements.txt` с вашими зависимостями Python. См. [формат файла requirements для pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Смонтируйте его в контейнер как `requirements.txt` внутри каталога конфигурации. Каталог конфигурации задаётся переменной `SEMAPHORE_CONFIG_PATH`, по умолчанию это `/etc/semaphore`.

Пример `requirements.txt`:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Пример изменения `docker-compose.yml`:

```yaml
services:
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

То же самое работает и для контейнера runner'а:

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

Или с обычным `docker run`:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### Как это работает {#how-it-works}

При запуске контейнер проверяет наличие файла `${SEMAPHORE_CONFIG_PATH}/requirements.txt`. Если файл существует, выполняется:

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

Если файл отсутствует, контейнер выводит в лог `No additional python dependencies to install` и продолжает работу.

На что следует обратить внимание:

- **Пакеты устанавливаются в виртуальное окружение Ansible.** В образе встроенное venv Ansible стоит первым в `PATH`, поэтому `pip3` устанавливает пакеты в это venv, а не в системный Python. Ansible и Python-приложения, работающие в контейнере, видят эти пакеты. Флаг `--break-system-packages` не нужен.
- **Установка выполняется при каждом запуске**, а не только при первом. Пакеты не сохраняются между пересозданиями контейнера, поэтому при перезапуске контейнера с чистой файловой системой они устанавливаются заново. Для этого при запуске требуется сетевой доступ к PyPI (или к настроенному вами индексу).
- **Неудачная установка останавливает контейнер.** Если `pip3` завершается с ошибкой (опечатка в имени пакета, отсутствующая зависимость для сборки или нет сети), контейнер завершает работу до запуска Semaphore. Вывод pip ищите в логах контейнера.
- **Пакеты, требующие компиляции** (например, некоторые криптографические драйверы или драйверы баз данных) могут не установиться, поскольку в образе нет компилятора. Предпочитайте wheel-пакеты или соберите для них собственный образ.

### Альтернатива: собственный образ {#alternative-custom-image}

Если у вас много зависимостей, нужны системные пакеты или вы хотите более быстрый и автономный запуск, вместо этого включите пакеты в собственный образ:

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

Активировать виртуальное окружение не требуется. Базовый образ уже задаёт `PATH` и `VIRTUAL_ENV` для встроенного venv Ansible и переключается на пользователя `semaphore`, которому принадлежит это venv. Поэтому `pip3` в производном образе указывает на pip из venv и устанавливает пакеты туда — точно так же, как это делает хук при запуске.

Тот же подход работает и с базовым образом `semaphoreui/runner`.
