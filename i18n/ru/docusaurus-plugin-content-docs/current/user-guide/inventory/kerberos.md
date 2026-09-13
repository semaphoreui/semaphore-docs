
# Аутентификация Kerberos

Semaphore поддерживает аутентификацию Kerberos при запуске playbook на **Windows-хостах через WinRM**.

## Настройка инвентаря {#inventory-configuration}

```ini
[windows]
hostname

[windows:vars]
ansible_port=5985
ansible_connection=winrm
ansible_winrm_server_cert_validation=ignore
ansible_winrm_transport=ntlm
ansible_winrm_kinit_mode=managed
ansible_winrm_scheme=http
```

Также убедитесь, что:

* Указаны имя пользователя и пароль (учётные данные Semaphore)
* При необходимости имя пользователя указано в формате `domain\\username` (например, `CORP\\admin`)

Ключевая настройка:

```ini
ansible_winrm_kinit_mode=managed
```

Она указывает Ansible **автоматически получать билет Kerberos**, используя переданные имя пользователя и пароль, без необходимости вручную запускать kinit.


##  Пример playbook {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

Этот playbook проверяет базовое подключение через WinRM + Kerberos.


## Требования к хосту Semaphore UI {#semaphore-ui-host-requirements}

На хосте Semaphore установите следующие пакеты:

```bash
sudo apt install libkrb5-dev krb5-user
```

Затем отредактируйте `/etc/krb5.conf` и задайте realm по умолчанию (имя домена):

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

Он должен совпадать с вашим доменом Active Directory.

## Примечания {#notes}

* Запускать kinit вручную не нужно — Ansible сам получает билет, если задано `ansible_winrm_kinit_mode=managed`.

* Работает с транспортом NTLM по умолчанию (SSL не требуется при использовании HTTP и `cert_validation=ignore`).