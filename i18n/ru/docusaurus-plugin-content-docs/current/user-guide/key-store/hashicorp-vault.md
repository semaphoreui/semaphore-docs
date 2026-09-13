---
title: "Хранилище секретов HashiCorp Vault"
---

# Хранилище секретов HashiCorp Vault <Pro />

Semaphore UI поддерживает HashiCorp Vault в качестве хранилища секретов.

![](/assets/vault1.webp)

Вы можете указать следующие параметры:
- **HashiCorp Vault URL** — адрес вашего сервера Vault.
- **Mount** — путь монтирования движка секретов.
- **Token** — токен аутентификации. Токен может быть:
    - Сохранён в базе данных.
    - Передан через переменную окружения.
    - Передан через файл (полезно для Vault Agent).
      :::warning
      Если токен берётся из **файла**, этот файл должен находиться **внутри** каталога секретов, который использует Semaphore. Настройте этот каталог с помощью `dirs.secrets` или переменной окружения `SEMAPHORE_SECRETS_PATH`. Устаревший параметр верхнего уровня `secrets_path` по-прежнему принимается для старых конфигураций. Если ничего не задано, по умолчанию используется `/tmp/semaphore`. Подробнее о приоритетах см. [Каталог секретов](/admin-guide/configuration/config-file#secrets-directory).

      Пример фрагмента `config.json`:

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

Хранилище может работать в режиме «только чтение».

## Как использовать {#how-to-use}

1. Настройте подключение к HashiCorp Vault в настройках Semaphore (URL, путь монтирования и токен).
2. При создании или редактировании ключа в хранилище ключей выберите **HashiCorp Vault** в качестве типа хранилища.
3. Укажите путь к секрету в Vault, по которому должны храниться учётные данные.

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

Вместо того чтобы хранить токен Vault напрямую, вы можете использовать [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent), который автоматически получает и обновляет токен.

Vault Agent работает как sidecar-процесс рядом с Semaphore и записывает действующий токен в файл на диске. Semaphore затем читает токен из этого файла.

Чтобы настроить это:

1. Настройте и запустите Vault Agent с подходящим [методом auto-auth](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) (например, AppRole, Kubernetes, AWS IAM).
2. Настройте Vault Agent на запись токена в файл с помощью блока `sink`, например:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. В Semaphore при настройке подключения к HashiCorp Vault выберите **File** в качестве источника токена и укажите путь к файлу с токеном (например, `/etc/vault/token`).

Такой подход позволяет избежать долгоживущих статических токенов и поручить Vault Agent аутентификацию и обновление токена автоматически.


## Группы переменных {#variable-groups}

HashiCorp Vault также можно использовать как хранилище для [групп переменных](/user-guide/environment). При редактировании группы переменных выберите **HashiCorp Vault** в качестве типа хранилища и укажите путь к папке, в которой будут храниться секреты.

![](/assets/vault3.webp)
