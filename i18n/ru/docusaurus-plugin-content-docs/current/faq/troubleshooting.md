# Устранение неполадок

## Runner выдаёт ошибку 404 {#runner-prints-error-404}

### Как исправить {#how-to-fix}

[Getting 401 error code from Runner](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## Проблема Gathering Facts для localhost {#gathering-facts-issue-for-localhost}

Проблема может возникать в Semaphore UI, установленном через [Snap](https://snapcraft.io/semaphore) или [Docker](https://hub.docker.com/r/semaphoreui/semaphore).

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Почему это происходит {#why-this-happens}

Подробнее об использовании localhost в Ansible читайте в статье [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible пытается собрать факты локально, но Ansible находится в ограниченном изолированном контейнере, который этого не позволяет.

### Как это исправить {#how-to-fix-this}

Есть два способа:

1. Отключить сбор фактов:

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Явно задать тип подключения **ssh**:
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```
---
## panic: pq: SSL is not enabled on the server {#panic-pq-ssl-is-not-enabled-on-the-server}

Это означает, что ваш Postgres не работает по SSL.

### Как это исправить {#how-to-fix-this-1}

Добавьте параметр `sslmode=disable` в файл конфигурации:

```json
	"postgres": {
		"host": "localhost",
		"user": "postgres",
		"pass": "pwd",
		"name": "semaphore",
		"options": {
			"sslmode": "disable"
		}
	},
```
---
## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

Это означает, что вы пытаетесь получить доступ по HTTPS к репозиторию, который требует аутентификации.

### Как это исправить {#how-to-fix-this-2}

* Перейдите на экран **Хранилище ключей**.
* Создайте новый ключ типа `Login with password`.
* Укажите ваш логин для GitHub/BitBucket и т. д.
* Укажите пароль. Для GitHub/BitBucket нельзя использовать пароль от учётной записи — вместо него следует использовать Personal Access Token (PAT). Подробнее [здесь](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* После создания ключа перейдите на экран **Репозитории**, найдите ваш репозиторий и укажите ключ.

---

## Git clone или pull периодически завершается ошибкой {#git-clone-or-pull-fails-intermittently}

В логах задач могут появляться сообщения вроде `Git pull failed (...), retrying in 2s`, за которыми следует либо успех, либо окончательная ошибка после нескольких попыток.

### Почему это происходит {#why-this-happens-1}

Git-сервер (GitHub, GitLab, Bitbucket или self-hosted экземпляр) был временно недоступен, вернул временную HTTP-ошибку, либо в сети между Semaphore и сервером произошёл кратковременный сбой. Semaphore автоматически повторяет операции clone и pull, прежде чем пометить задачу как неудачную.

### Как это исправить {#how-to-fix-this-3}

1. **Временные сбои**: обычно проходят сами. Semaphore повторяет попытки до `git_attempts` раз (по умолчанию 4) с экспоненциальной задержкой между попытками.
2. **Частые сбои**: увеличьте количество попыток в конфигурации:

```json
{
  "git_attempts": 8
}
```

Или через переменную окружения:

```bash
export SEMAPHORE_GIT_ATTEMPTS=8
```

3. **Немедленные, постоянные сбои**: повторные попытки не помогут. Проверьте URL репозитория, имя ветки, ключи доступа и сетевую доступность с сервера Semaphore или хоста runner’а.

Подробнее о `git_client` и `git_attempts` см. в разделе [Операции Git](/admin-guide/configuration/config-file#git-operations).

---

## Вывод Bash-скрипта отсутствует или неполный {#bash-script-output-is-missing-or-incomplete}

Bash-задача завершается успешно, но в логе почти нет вывода от `echo`, `printf` или других команд — особенно когда скрипт завершается быстро.

### Почему это происходит {#why-this-happens-2}

Semaphore перехватывает stdout и stderr shell-команд во время их выполнения. Очень короткие скрипты могут завершиться раньше, чем будет прочитан весь буферизованный вывод, поэтому последние строки могут не попасть в лог задачи.

### Как это исправить {#how-to-fix-this-4}

1. **Обновитесь**: свежие версии Semaphore дочитывают вывод процесса, прежде чем пометить задачу завершённой. Обновите сервер и runner’ы, если вы используете старый релиз.
2. **Сбрасывайте буфер вывода в скрипте**, когда нужна гарантированная доставка:

```bash
#!/bin/bash
echo "Starting deploy"
echo "Done" >&2
```

Для критически важной диагностики записывайте данные в файл внутри рабочей области репозитория и выводите его через `cat` в конце скрипта.
3. **Избегайте тихого раннего выхода**: используйте `set -euo pipefail` и явные сообщения об ошибках, чтобы сбои были видны даже при скудном выводе.

---

## unable to read LDAP response packet: unexpected EOF {#unable-to-read-ldap-response-packet-unexpected-eof}

Скорее всего, вы пытаетесь подключиться к серверу LDAP небезопасным способом, тогда как он ожидает защищённое соединение (через TLS).

### Как это исправить {#how-to-fix-this-5}

Включите TLS в файле `config.json`:

```json
...
"ldap_needtls": true
...
```

---

## LDAP Result Code 49 "Invalid Credentials" {#ldap-result-code-49-invalid-credentials}

У вас неверный пароль или `binddn`.

### Как это исправить {#how-to-fix-this-6}

Используйте утилиту `ldapwhoami` и проверьте, работает ли ваш binddn:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

Она интерактивно запросит пароль и должна вернуть код **0** и вывести указанный **DN**.

Также вы можете прочитать следующие статьи: 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/semaphoreui/semaphore/issues/906](https://github.com/semaphoreui/semaphore/issues/906)

---

## LDAP Result Code 32 "No Such Object" {#ldap-result-code-32-no-such-object}

Скоро будет.
