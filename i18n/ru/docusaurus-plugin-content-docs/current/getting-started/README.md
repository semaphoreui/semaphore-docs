---
title: Начало работы
description: Установите Semaphore UI, запустите первую задачу Ansible, проверьте результат и настройте расписание.
sidebar_label: Начало работы
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Начало работы

Semaphore UI — веб-интерфейс и API для повторяемой автоматизации с Ansible, Terraform/OpenTofu, Bash, PowerShell и Python. Он объединяет автоматизацию из Git, учётные данные, переменные, расписания, рабочие процессы и среды выполнения, сохраняя статус и журнал каждого запуска.

В этом руководстве первый рабочий пример использует Ansible. Возьмите playbook из своего репозитория или повторите пример со скриншотов с помощью публичного репозитория [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo).

<div className="VideoEmbed">
  <iframe
    src="https://www.youtube-nocookie.com/embed/LVKwud2Wno4"
    title="Быстрый старт Semaphore UI: установка, запуск и планирование Ansible"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  ></iframe>
</div>

## 1. Установите Semaphore

Выберите способ установки с учётом того, где будет работать Semaphore. По умолчанию выбран системный пакет.

<Tabs groupId="installation-method">
  <TabItem value="package" label="Системный пакет" default className="InstallationMethod">

Для Debian или Ubuntu на `amd64`:

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

Для RHEL, Fedora, Rocky Linux, AlmaLinux или CentOS Stream на `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

Настройте базу данных и первого администратора, затем запустите Semaphore с созданной конфигурацией:

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

Для локального ознакомления выберите SQLite, подтвердите или задайте пути к базе данных и playbook, укажите публичный URL и создайте первого администратора по запросу.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

Создайте `compose.yaml`:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

Сгенерируйте ключ шифрования и поместите его вместе с надёжным паролем администратора в файл `.env` рядом с `compose.yaml`:

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

Не добавляйте `.env` в систему контроля версий и запустите контейнер:

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="Архив с исполняемым файлом" className="InstallationMethod">

Скачайте архив для своей операционной системы и архитектуры процессора из [GitHub Releases](https://github.com/semaphoreui/semaphore/releases). Пример для Linux `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

Для локального ознакомления выберите SQLite, подтвердите или задайте пути к базе данных и playbook, укажите публичный URL и создайте первого администратора по запросу.

Для macOS выберите архив `darwin`, для Windows — `.zip`. Пример с Ansible далее в руководстве требует среды выполнения Linux, macOS, WSL, контейнера или Linux-раннера с установленным Ansible.

  </TabItem>
  <TabItem value="helm" label="Kubernetes с Helm" className="InstallationMethod">

Добавьте официальный чарт и изучите его настройки по умолчанию перед установкой:

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

Поле `appVersion` чарта указывает версию Semaphore. Перед использованием в production настройте в `values.yaml` постоянное хранилище, базу данных, учётные данные администратора, ключ шифрования ключей доступа и ingress/TLS.

  </TabItem>
</Tabs>

Для пошаговой настройки используйте официальную [страницу установки Semaphore](https://semaphoreui.com/install), чтобы выбрать релиз, подготовить конфигурацию и получить соответствующие команды скачивания или запуска.

<details>
<summary>Не знаете, какой способ установки выбрать?</summary>

| Способ установки | Когда выбирать | Подробное руководство |
| --- | --- | --- |
| **Системный пакет** | Поддерживаемый сервер Linux | [Установка через менеджер пакетов](/admin-guide/installation/package-manager) |
| **Docker Compose** | Быстрая изолированная установка или хост контейнеров | [Установка в Docker](/admin-guide/installation/docker) |
| **Архив с исполняемым файлом** | macOS, Windows, FreeBSD или Linux без подходящего пакета | [Установка из исполняемого файла](/admin-guide/installation/binary-file) |
| **Kubernetes с Helm** | Существующий кластер Kubernetes | [Установка в Kubernetes](/admin-guide/installation/k8s) |

Подробные руководства описывают базы данных для production, службы, секреты, хранилища, ingress и обновления.

</details>

Для этого примера с Ansible команды `git --version` и `ansible-playbook --version` должны работать на сервере Semaphore или раннере. Если какая-либо команда недоступна, установите [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) и [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) перед продолжением.

:::tip Установка для production
Перед использованием Semaphore в production изучите разделы [Конфигурация](/admin-guide/configuration), [Безопасность](/admin-guide/security), [Раннеры](/admin-guide/runners), [Высокая доступность](/admin-guide/ha) и [Обновление](/admin-guide/upgrading).
:::

## 2. Войдите в систему

1. Откройте Semaphore в браузере. Локальная установка обычно доступна по адресу [http://localhost:3000](http://localhost:3000).
2. Введите логин и пароль администратора, созданного через `semaphore setup` или переменные администратора Docker.
3. Нажмите **Sign In**.

![Экран входа в Semaphore](/assets/getting-started/sign-in.jpg)

Для первоначальной настройки используйте учётную запись администратора: она позволяет создавать проекты и пользователей. Обычные пользователи входят на той же странице после того, как администратор создаст их учётные записи и предоставит доступ к проекту. См. [Управление пользователями](/user-guide/admin/users).

## 3. Создайте проект

После входа в пустой экземпляр Semaphore автоматически откроется страница **New Project**. Если проекты уже есть, откройте переключатель проектов и выберите **New Project...**. Заполните форму:

| Поле | Что указать |
| --- | --- |
| **Project Name** | Понятное название рабочего пространства, например `Production infrastructure` или название вашего приложения. |
| **Max number of parallel tasks** | Необязательно. Ограничивает число одновременно выполняемых задач проекта; оставьте пустым, чтобы использовать ограничение сервера. |
| **Telegram Chat ID** | Необязательно. Используется, когда для проекта настроены уведомления Telegram. |
| **Allow alerts for this project** | Необязательно. Включает настроенные уведомления проекта. |
Нажмите **Create**.

Не выбирайте **Create Demo Project**: эта кнопка добавляет демонстрационные ресурсы, а в руководстве создаётся пустой проект. При создании следующих проектов та же настройка отображается переключателем **Demo** в диалоге New Project.

![Пустая форма New Project со всеми доступными полями](/assets/getting-started/new-project-empty.jpg)

В новом проекте доступны разделы **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store** и **Repositories**. Настройки проекта, доступ команды, активность и история описаны в разделе [Проекты](/user-guide/projects).

<details>
<summary>Посмотрите этот шаг</summary>

![Создание первого проекта в пустом экземпляре Semaphore](/assets/getting-started/create-first-project.gif)

</details>

## 4. Разберитесь в основных понятиях

Новый проект открывается с пустой панелью Dashboard. Боковая панель служит основной навигацией по проекту:

![Интерфейс пустого проекта Semaphore до добавления ресурсов и задач](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** показывает историю запусков, статистику, активность и настройки проекта.
- **Task Templates**, **Workflows** и **Schedule** определяют, что и когда запускается.
- **Repositories**, **Inventory**, **Variable Groups** и **Key Store** предоставляют код, целевые хосты, переменные и учётные данные.
- **Integrations**, **Team** и **Runners** подключают внешние системы, пользователей и узлы выполнения.

На схеме показано, как эти ресурсы участвуют в запуске:

<div class="BlockSchema">
  ![Как ресурсы и триггеры Semaphore приводят к запуску задачи](/assets/getting-started/core-concepts.svg)
</div>

Действие в интерфейсе, запрос API или расписание могут запустить **Task Template** напрямую либо запустить **Workflow**, использующий шаблоны задач. Semaphore создаёт запуск, отображаемый в интерфейсе как **Task**, и направляет его на сервер Semaphore или подходящий удалённый раннер. Для Ansible этот узел выполняет `ansible-playbook`, а Inventory перечисляет системы под управлением Ansible.

| Понятие | Назначение |
| --- | --- |
| [**Project**](/user-guide/projects) | Изолированное рабочее пространство с ресурсами автоматизации, правами доступа и историей запусков. |
| [**Repository**](/user-guide/repositories) | Указывает ветку или тег Git с файлами автоматизации, используемыми задачей. |
| [**Key Store**](/user-guide/key-store) | Хранит переиспользуемые SSH-ключи, учётные данные, токены и пароли Ansible Vault вне Git и входных параметров задач. |
| [**Inventory**](/user-guide/inventory) | Указывает Ansible управляемые хосты и группы, а также необходимые учётные данные. |
| [**Variable Group**](/user-guide/environment) | Хранит переиспользуемые переменные Ansible, переменные окружения и секреты для одного или нескольких шаблонов. |
| [**Task Template**](/user-guide/task-templates/) | Сохраняет параметры запуска: тип автоматизации, файл, репозиторий, inventory, переменные, запрашиваемые параметры и настройки выполнения. |
| [**Task (task run)**](/user-guide/tasks) | Одно выполнение со своими входными данными, статусом, временными метками, журналом, сведениями и результатом. |
| **Workflow** | Связывает шаблоны задач в многошаговую последовательность с ветвлениями для успеха, ошибки, согласования и заметок. |
| [**Schedule**](/user-guide/schedules) | Запускает шаблон задачи или workflow однократно либо регулярно по cron-выражению. |
| [**Runner**](/admin-guide/runners) | Выполняет задачи из очереди вне основного сервера Semaphore, например в другой сети или зоне безопасности. |

## 5. Подключите репозиторий

Репозиторий связывает Semaphore с автоматизацией в Git; сам playbook в Semaphore не хранится. Подключите свой репозиторий или используйте приведённые ниже значения публичного демо, чтобы точно повторить пример. [Интеграции](/user-guide/integrations) — отдельная функция для запуска автоматизации из GitHub, GitLab и других источников webhook.

1. Откройте **Repositories** и выберите **New Repository**.
2. Введите название репозитория, URL, ветку и учётные данные. Для публичного демо используйте:

   | Поле | Значение |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None`, поскольку репозиторий публичный |

3. Нажмите **Create**.

![Форма репозитория с данными публичного демо Semaphore](/assets/getting-started/repository-settings.jpg)

Репозиторий должен появиться в списке. Semaphore клонирует или обновляет его на узле выполнения при запуске задачи, а не при создании записи Repository. Скриншот показывает демонстрационные значения из этого руководства.

![Подключённый репозиторий Demo в списке репозиториев проекта](/assets/getting-started/connected-repository.jpg)

Для приватного репозитория вместо `None` выберите подходящие учётные данные из Key Store. Локальные пути, HTTPS, SSH, ветки, учётные данные и файлы зависимостей описаны в разделе [Репозитории](/user-guide/repositories).

## 6. Добавьте SSH-ключ для удалённого управляемого хоста

Эти учётные данные SSH позволяют Ansible подключаться с сервера Semaphore или раннера к удалённому хосту из Inventory. Для демо с `localhost` SSH-ключ не нужен; переходите к шагу 7.

Демо использует `localhost` с `ansible_connection=local`, поэтому SSH-соединение не открывается. Если ваш playbook управляет удалённым хостом, добавьте его ключ:

1. Добавьте публичную часть ключа в `~/.ssh/authorized_keys` на управляемом хосте.
2. Откройте **Key Store** и выберите **New Key**.
3. Введите понятное название, например `Production hosts`, оставьте выбранным **Local** и выберите **SSH Key**.
4. Укажите учётную запись, которую Ansible должен использовать на хосте, например `ubuntu` или `ec2-user`.
5. Вставьте приватный ключ целиком, включая строки `BEGIN` и `END`, и при необходимости укажите парольную фразу.
6. Нажмите **Create**. На следующем шаге выберите этот ключ в поле **Inventory → User Credentials**.

![Форма New SSH Key для учётной записи на управляемых хостах](/assets/getting-started/add-managed-host-ssh-key.jpg)

На скриншоте показан заполнитель, а не действующий секрет. Никогда не публикуйте приватный ключ в документации, скриншотах, аргументах задач или системе контроля версий.

Semaphore может хранить секреты локально или использовать внешние хранилища, например [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) и [Devolutions Server](/user-guide/key-store/devolutions-server). Все поддерживаемые типы учётных данных и варианты хранения описаны в разделе [Хранилище ключей](/user-guide/key-store).

## 7. Создайте inventory Ansible

Каждой задаче Ansible нужен inventory. Для первого локального запуска добавьте в репозиторий файл, например `inventory.ini`:

```ini
[local]
localhost ansible_connection=local
```

Здесь `localhost` означает узел выполнения — сервер Semaphore, контейнер или раннер, а не обязательно компьютер с открытым браузером. Параметр `ansible_connection=local` указывает Ansible не использовать SSH. В демо-репозитории используется эквивалентный файл `invs/prod/hosts` с группой `site`.

Если вы создали `inventory.ini` в своём репозитории, перед продолжением сделайте коммит и отправьте его в ветку, подключённую к Semaphore.

1. Откройте **Inventory** и выберите **New Inventory → Ansible Inventory**.
2. Укажите значения для своего inventory. Например:

   | Поле | Значение |
   | --- | --- |
   | **Name** | `Local` (`Prod` в демо) |
   | **User Credentials** | `None` для `localhost`; для удалённого inventory используйте SSH-учётные данные хоста |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini` (`invs/prod/hosts` в демо) |

3. Оставьте поля **Runner tag**, **Sudo Credentials** и **Repository** пустыми и нажмите **Create**.

![Файловый inventory Ansible с настройками демо-репозитория](/assets/getting-started/ansible-inventory-settings.jpg)

Если поле **Repository** пустое, Semaphore разрешает относительный путь inventory относительно репозитория, выбранного в шаблоне задачи. Выбирайте здесь репозиторий, только если inventory хранится отдельно. Для удалённого хоста укажите SSH-ключ из шага 6 в поле **User Credentials**.

Статические, файловые и динамические inventory описаны в разделе [Inventory](/user-guide/inventory).

## 8. Добавьте группу переменных (необязательно)

**Variable Group** — переиспользуемый набор значений, который можно подключить к одному или нескольким шаблонам задач. Используйте **Extra variables** для переменных Ansible, **Environment variables** для значений, передаваемых в окружение процесса, и **Secrets** для конфиденциальных значений, требующих шифрования и маскирования. Так настройки окружения остаются вне playbook, и их не нужно повторять в каждом шаблоне.

Первая задача работает и без группы переменных. Для примера создайте группу со значением `ansible_python_interpreter=auto_silent`; Ansible по-прежнему найдёт Python автоматически, но не выведет информационное предупреждение об обнаружении интерпретатора.

1. Откройте **Variable Groups** и выберите **New Group**.
2. В поле **Group Name** укажите понятное название, например `Ansible defaults`.
3. В разделе **Variables → Extra variables** оставьте выбранным **Table** и нажмите **+**.
4. Введите:

   | Имя | Тип | Значение |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. Нажмите **Save**.

![Группа переменных, настроенная в табличном редакторе](/assets/getting-started/variable-group-table.jpg)

Правила приоритета и варианты хранения секретов описаны в разделе [Группы переменных](/user-guide/environment).

## 9. Создайте шаблон задачи Ansible

### Проверьте playbook в Git

Если подключённый репозиторий уже содержит playbook Ansible, используйте его. Иначе добавьте небольшой пример, например `get-started.yml`:

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

Если вы используете демо, возьмите его [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml). Он обращается к группе `site` в демо-inventory и запускает включённую роль `ping`.

Демо загружает эту роль из подмодуля Git и отправляет один ICMP-запрос к `semaphoreui.com`, поэтому узлу выполнения нужны доступ к GitHub и исходящий ICMP. Если ICMP заблокирован, используйте локальный пример `get-started.yml`.

![ping.yml в подключённом репозитории GitHub](/assets/getting-started/demo-playbook-github.jpg)

На скриншоте показан playbook из публичного демо-репозитория. Хранение автоматизации в Git позволяет проверять изменения и фиксировать в Semaphore точный коммит каждого запуска.

Если вы создали `get-started.yml` в своём репозитории, перед продолжением сделайте коммит и отправьте его в ветку, подключённую к Semaphore.

### Настройте шаблон

1. Откройте **Task Templates** и выберите **New template → Applications**.
2. Включите **Ansible Playbook**, затем вернитесь в **Task Templates**.
3. Выберите **New template → Ansible Playbook**.
4. Оставьте выбранной вкладку **Task**. **Build** и **Deploy** — типы шаблонов CI/CD с версиями; для этого самостоятельного запуска они не нужны.
5. Настройте шаблон в соответствии со своими файлами. Например:

   | Поле | Значение | Назначение |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | Обозначает переиспользуемый шаблон и его историю задач. |
   | **Repository** | Ваш репозиторий (`Demo` в примере) | Предоставляет playbook и связанные файлы. |
   | **Path to playbook file** | `get-started.yml` (`ping.yml` в демо) | Путь определяется от корня репозитория. |
   | **Inventory** | `Local` (`Prod` в демо) | Предоставляет локальный целевой хост для первого запуска. |
   | **Variable Groups** | `Ansible defaults`, если создана | Добавляет необязательную переиспользуемую настройку Ansible. |
   | **Runner tag** | Оставьте пустым | Использует локальное выполнение или раннер по умолчанию в зависимости от конфигурации сервера. |

6. В разделе **Ansible options** включите **Skip Galaxy install** для небольшого playbook выше или публичного демо: этой задаче не нужны зависимости Galaxy. Оставьте настройку выключенной, если ваш репозиторий требует роли или коллекции из файла `requirements.yml`.
7. Нажмите **Create**.

![Шаблон задачи Ansible с репозиторием, inventory и группой переменных](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>Посмотрите этот шаг</summary>

![Включение Ansible и создание первого шаблона задачи Ansible](/assets/getting-started/create-ansible-template.gif)

</details>

Другие полезные поля:

- **Vaults** выбирает пароли из Key Store для зашифрованного содержимого Ansible.
- **Limit**, **Tags** и **Skip tags** ограничивают область выполнения playbook.
- **Prompts** позволяют пользователю интерфейса, расписанию или запросу API переопределять разрешённые значения для конкретного запуска.
- **Runner tag** определяет, где выполняется задача; это поле не выбирает целевой хост Ansible.

Все поля и настройки выполнения описаны в разделах [Шаблоны Ansible](/user-guide/apps/ansible) и [Шаблоны задач](/user-guide/task-templates/).

## 10. Запустите шаблон и проверьте задачу

1. Откройте созданный шаблон задачи и нажмите **Run**.
2. При желании добавьте сообщение, например `First Semaphore run`.
3. Оставьте **Dry Run** и **Diff** выключенными, затем нажмите **Run**.

![Диалог New Task для playbook Ansible без дополнительных настроек](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore ставит задачу в очередь, подготавливает репозиторий, применяет inventory и необязательную группу переменных, затем запускает выбранный playbook. Статус проходит через **Waiting** и **Running** и завершается значением **Success** или **Failed**.

### Журнал

**Log** содержит фактический вывод команд. Читайте итоговый `PLAY RECAP`, а не только зелёный индикатор статуса.

![Журнал успешной задачи Ansible с выводом ping и PLAY RECAP](/assets/getting-started/ansible-task-log-variable-group.jpg)

Точные счётчики зависят от playbook. Успешный первый запуск должен завершиться с `unreachable=0` и `failed=0` для `localhost`. Если в журнале демо указано `changed=1`, значит, шаг ping через shell выполнился и сообщил об изменении; это не ошибка.

### Подробности и сводка

| Вкладка | Что проверить |
| --- | --- |
| **Log** | Этапы выполнения в реальном времени, вывод модулей, ошибки и итоговый `PLAY RECAP`. |
| **Details** | Тип шаблона, коммит Git, сообщение запуска, автор, временные метки и длительность. |
| **Summary** | Результаты Ansible и ошибки по хостам после завершения, если доступна функция сводки задачи. |

![Вкладка Details со сведениями о шаблоне, коммите и времени](/assets/getting-started/ansible-task-details.jpg)

![Сводка задачи с количеством хостов OK и Not OK](/assets/getting-started/ansible-task-summary.jpg)

Если **Summary** недоступна, проверьте запуск в **Log**; `PLAY RECAP` остаётся достоверным итогом Ansible.

<details>
<summary>Посмотрите запуск и результат</summary>

![Запуск задачи Ansible и просмотр её журнала и подробностей](/assets/getting-started/run-and-inspect-task.gif)

</details>

### Найдите предыдущие запуски

Закройте окно задачи, чтобы вернуться на вкладку **Tasks** шаблона. Каждый запуск имеет свой номер задачи, статус, пользователя, время начала, длительность и сохранённый журнал. **Dashboard → History** показывает запуски всех шаблонов проекта. Подробнее см. [Задачи](/user-guide/tasks) и [История проекта](/user-guide/projects/history).

![История шаблона Ansible с успешными запусками задач](/assets/getting-started/ansible-template-history.jpg)

Если задача завершилась ошибкой, используйте последнюю содержательную строку журнала, чтобы выбрать следующую проверку:

- Ошибка клонирования указывает на URL репозитория, ветку, Access Key или сетевой доступ с узла выполнения.
- `ansible-playbook: command not found` означает, что на сервере Semaphore или выбранном раннере не установлен Ansible.
- `UNREACHABLE` указывает на адресацию в inventory, учётные данные хоста, доступность SSH или проверку ключа хоста.
- При ошибке шага Ansible непосредственно перед `PLAY RECAP` обычно указаны название задачи, хост и ошибка модуля.

## 11. Запустите задачу по расписанию

После успешного запуска через интерфейс задачу можно выполнять автоматически. Например, cron-выражение `0 3 * * *` запускает её каждый день в 03:00 в часовом поясе, показанном в Semaphore.

1. Откройте **Schedule** и выберите **New Schedule → Cron**.
2. Введите понятное название, например `Nightly playbook`.
3. Выберите шаблон задачи для запуска.
4. Оставьте **Show cron format** включённым и введите cron-выражение, например `0 3 * * *`.
5. Оставьте **Enabled** выбранным и нажмите **Save**.

![Расписание cron для ежедневного запуска задачи из примера в 03:00](/assets/getting-started/create-cron-schedule.jpg)

Semaphore показывает настроенный часовой пояс и рассчитывает следующий запуск до сохранения. Запуск по расписанию использует те же репозиторий, inventory, группы переменных и настройки выполнения, что и шаблон. Если шаблон предоставляет запрашиваемые параметры, расписание может задавать их значения. Синтаксис cron, часовой пояс, однократные запуски и параметры расписания описаны в разделе [Расписания](/user-guide/schedules).

После сохранения убедитесь, что расписание имеет состояние **Enabled**, а **Next run** показывает ожидаемое время. Задачи по расписанию отображаются на вкладке **Tasks** шаблона и в **Dashboard → History**.

## Что попробовать дальше

После успешного выполнения первой задачи Ansible:

- Добавьте подходящие приватные учётные данные в [Хранилище ключей](/user-guide/key-store), если репозиторий требует аутентификации.
- Создайте **Workflow**, если нескольким шаблонам нужны упорядоченные переходы для успеха, ошибки, согласования или заметок.
- Используйте [Интеграции](/user-guide/integrations) для аутентифицированных webhook-триггеров из GitHub, GitLab и других систем.
- Используйте [API](/reference/api) для программного управления ресурсами и запуска шаблонов.
- Добавьте [удалённый раннер](/admin-guide/runners), если выполнение требуется в другой сети, операционной системе или зоне безопасности.

Для production разместите Semaphore за HTTPS, создавайте резервные копии базы данных вместе с секретом шифрования ключей доступа, настройте централизованную аутентификацию и изучите разделы [Безопасность](/admin-guide/security), [Журналы](/admin-guide/logs) и [Обновление](/admin-guide/upgrading).
