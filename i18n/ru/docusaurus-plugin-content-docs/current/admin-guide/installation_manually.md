# Ручная установка Semaphore

----

**Содержание:**

* [Служебный пользователь](/admin-guide/installation_manually#service-user)
* [Python3](/admin-guide/installation_manually#python3)
* [Коллекции и роли Ansible](/admin-guide/installation_manually#ansible-collections--roles)
* [Обратный прокси](/admin-guide/installation_manually#reverse-proxy)
* [Служба Systemd](/admin-guide/installation_manually#extended-systemd-service)
* [Устранение неполадок](/admin-guide/installation_manually#troubleshooting)

----

В этой документации подробно описано, как настроить Semaphore при использовании следующих способов установки:

* [Менеджер пакетов](/admin-guide/installation/package-manager)
* [Бинарный файл](/admin-guide/installation/binary-file)

Программный пакет Semaphore — лишь часть системы, необходимой для успешного запуска Ansible с его помощью.

Среда выполнения Python3 и Ansible также очень важна!

ПРИМЕЧАНИЕ: существуют [готовые роли Ansible Galaxy](https://galaxy.ansible.com/search?deprecated=false&keywords=ansible%20semaphore&order_by=-relevance&page=1), которые выполняют эту настройку за вас или могут послужить основой для вашей собственной роли Ansible!

----

## Служебный пользователь {#service-user}

Semaphore не требуется запускать от имени пользователя `root` — и не стоит этого делать.

**Преимущества** использования служебного пользователя:
* Собственная пользовательская конфигурация
* Собственное окружение
* Процессы легко идентифицировать
* Повышенная безопасность системы

Системного пользователя можно создать вручную с помощью `adduser` или с помощью модуля [ansible.builtin.user](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html).

В этой документации мы предполагаем, что:
* созданный служебный пользователь называется `semaphore`
* для него задана оболочка `/bin/bash`
* его домашний каталог — `/home/semaphore`

### Устранение неполадок {#troubleshooting}

Если выполнение Ansible из Semaphore завершается ошибкой, отлаживать проблему нужно в контексте служебного пользователя.

Для этого есть несколько вариантов:

* Переключить всю сессию оболочки в контекст пользователя:

  ```bash
  sudo su --login semaphore
  ```

* Выполнить одну команду в контексте пользователя:

  ```bash
  sudo --login -u semaphore <command>
  ```

----

## Python3 {#python3}

[Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html) написан на языке программирования [Python3](https://docs.python.org/3/).

Поэтому его корректная настройка необходима для правильной работы Ansible.

Прежде всего убедитесь, что в системе установлены пакеты `python3` и `python3-pip`!

Установить необходимые модули Python можно несколькими способами:
* Установить их в контексте служебного пользователя
* Установить их в отдельное [виртуальное окружение](https://virtualenv.pypa.io/en/latest/) для службы

### Requirements {#requirements}

В любом случае рекомендуется использовать файл `requirements.txt` для указания модулей, которые нужно установить.

Мы будем предполагать, что используется файл `/home/semaphore/requirements.txt`.

Пример его содержимого:

```text
ansible
# for common jinja-filters
netaddr
jmespath
# for common modules
pywinrm
passlib
requests
docker
```

ПРИМЕЧАНИЕ: эти зависимости также следует время от времени обновлять!

Вариант автоматического обновления показан ниже в примере службы.

### Модули в контексте пользователя {#modules-in-user-context}

**Вручную**:

```bash
sudo --login -u semaphore python3 -m pip install --user --upgrade -r /home/semaphore/requirements.txt
```

**С помощью Ansible**:

```yaml
- name: Install requirements
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    extra_args: '--user --upgrade'
  become_user: 'semaphore'
```

### Модули в virtualenv {#modules-in-a-virtualenv}

Мы будем предполагать, что virtualenv создан в `/home/semaphore/venv`

Убедитесь, что виртуальное окружение активируется внутри службы! Это также показано ниже в примере службы.

**Вручную**:
```bash
sudo su --login semaphore
python3 -m pip install --user virtualenv
python3 -m venv /home/semaphore/venv
# activate the context of the virtual environment
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3
python3 -m pip install --upgrade -r /home/semaphore/requirements.txt
# disable the context to the virtual environment
deactivate
```

**С помощью Ansible**:

```yaml
- name: Create virtual environment and install requirements into it
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    virtualenv: '/home/semaphore/venv'
    state: present  # or 'latest' to upgrade the requirements
```

#### Устранение неполадок {#troubleshooting-1}

Если при использовании виртуального окружения возникают проблемы с Python3, для их отладки нужно переключиться в его контекст:

```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

# troubleshooting

deactivate
```

Иногда виртуальное окружение ломается при обновлении системы. В этом случае можно просто удалить существующее и создать его заново.

----

## Коллекции и роли Ansible {#ansible-collections--roles}

Возможно, вы захотите заранее установить модули и роли Ansible, чтобы их не приходилось устанавливать при каждом запуске задачи!

### Requirements {#requirements-1}

Рекомендуется использовать файл `requirements.yml` для указания модулей, которые нужно установить.

Мы будем предполагать, что используется файл `/home/semaphore/requirements.yml`.

Пример его содержимого:

```yaml
---

collections:
  - 'namespace.collection'
  # for common collections:
  - 'community.general'
  - 'ansible.posix'
  - 'community.mysql'
  - 'community.crypto'

roles:
  - src: 'namespace.role'
```

См. также: [Установка коллекций](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy), [Установка ролей](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-multiple-roles-from-a-file)

ПРИМЕЧАНИЕ: эти зависимости также следует время от времени обновлять!

Вариант автоматического обновления показан ниже в примере службы.

### Установка в контексте пользователя {#install-in-user-context}

**Вручную**:
```bash
sudo su --login semaphore
ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml
```

### Установка при использовании virtualenv {#install-when-using-a-virtualenv}

**Вручную**:
```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml

deactivate
```

----

## Обратный прокси {#reverse-proxy}

См.: [Безопасность — Шифрованное соединение](/admin-guide/security/network#reverse-proxy)

----

## Расширенная служба Systemd {#extended-systemd-service}

Ниже приведён базовый шаблон службы systemd.

Дополнительные настройки добавляйте в соответствующую секцию `[PART]`

### Основа {#base}

```ini
[Unit]
Description=Semaphore UI
Documentation=https://semaphoreui.com/docs
Wants=network-online.target
After=network-online.target
ConditionPathExists=/usr/bin/semaphore
ConditionPathExists=/etc/semaphore/config.json

[Service]
ExecStart=/usr/bin/semaphore server --config /etc/semaphore/config.json
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

### Служебный пользователь {#service-user-1}

```ini
[Service]
User=semaphore
Group=semaphore
```

----

### Модули Python {#python-modules}

#### В контексте пользователя {#in-user-context}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

# so the executables are found
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/semaphore/.local/bin"
# set the correct python path. You can get the correct path with: python3 -c "import site; print(site.USER_SITE)" 
Environment="PYTHONPATH=/home/semaphore/.local/lib/python3.10/site-packages"
```

#### В virtualenv {#in-virtualenv}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && python3 -m pip install --upgrade -r /home/semaphore/requirements.txt'

# REPLACE THE EXISTING 'ExecStart'
ExecStart=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                        && /usr/bin/semaphore server --config /etc/semaphore/config.json'
```

----

### Коллекции и роли Ansible {#ansible-collections--roles-1}

#### Если Python3 используется в контексте пользователя {#if-using-python3-in-user-context}

```ini
[Service]
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

#### Если Python3 используется в virtualenv {#if-using-python3-in-virtualenv}

```ini
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

----

### Другие сценарии {#other-use-cases}

#### Использование локальной MariaDB {#using-local-mariadb}

```ini
[Unit]
Requires=mariadb.service
```

#### Использование локального Nginx {#using-local-nginx}

```ini
[Unit]
Wants=nginx.service
```

#### Отправка логов в syslog {#sending-logs-to-syslog}

```ini
[Service]
StandardOutput=journal
StandardError=journal
SyslogIdentifier=semaphore
```

### Полные примеры {#full-examples}

#### Модули Python в контексте пользователя {#python-modules-in-user-context}

```ini
[Unit]
Description=Semaphore UI
Documentation=https://semaphoreui.com/docs
Wants=network-online.target
After=network-online.target
ConditionPathExists=/usr/bin/semaphore
ConditionPathExists=/etc/semaphore/config.json

[Service]
User=semaphore
Group=semaphore
Restart=always
RestartSec=10s
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:~/.local/bin"

ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

ExecStart=/usr/bin/semaphore server --config /etc/semaphore/config.json
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
```

#### Модули Python в virtualenv {#python-modules-in-virtualenv}

```ini
[Unit]
Description=Semaphore UI
Documentation=https://semaphoreui.com/docs
Wants=network-online.target
After=network-online.target
ConditionPathExists=/usr/bin/semaphore
ConditionPathExists=/etc/semaphore/config.json

[Service]
User=semaphore
Group=semaphore
Restart=always
RestartSec=10s

ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && python3 -m pip install --upgrade -r /home/semaphore/requirements.txt'
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'

ExecStart=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                        && /usr/bin/semaphore server --config /etc/semaphore/config.json'
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
```

### Исправления {#fixes}

Если в системе задан нестандартный язык, могут возникнуть проблемы, которые решаются обновлением соответствующих переменных окружения:

```ini
[Service]
Environment=LANG="en_US.UTF-8"
Environment=LC_ALL="en_US.UTF-8"
```

----

## Устранение неполадок {#troubleshooting-2}

Если при выполнении задачи возникает проблема, причина может быть в окружении вашей системы, а не в самом Semaphore!

Выполните следующие шаги, чтобы проверить, воспроизводится ли проблема вне Semaphore:

- Переключитесь в контекст пользователя:

  ```bash
  sudo su --login semaphore
  ```

- Переключитесь в контекст virtualenv, если вы его используете:

  ```ini
  source /home/semaphore/venv/bin/activate
  # verify we are using python3 from inside the venv
  which python3
  > /home/semaphore/venv/bin/python3
  
  # troubleshooting
  
  deactivate
  ```

- Запустите playbook Ansible вручную

  - Если он **завершается ошибкой** => проблема в вашем окружении
  - Если он **работает**:
    - Перепроверьте конфигурацию внутри Semaphore
    - Возможно, проблема в Semaphore
