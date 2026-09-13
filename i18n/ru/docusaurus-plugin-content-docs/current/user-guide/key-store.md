# Хранилище ключей

Хранилище ключей в Semaphore используется для хранения учётных данных для доступа к удалённым репозиториям, доступа к удалённым хостам, учётных данных sudo и паролей Ansible Vault.

![Хранилище ключей](/assets/key-store-keys.webp)

На вкладке **Keys** перечислены учётные данные проекта с указанием их типа. На вкладке **Storages** (Pro) перечислены внешние хранилища секретов, настроенные для проекта, см. [Хранилища секретов](#secret-storages).

## Типы {#types}

### 1. SSH {#1-ssh}
SSH-ключи используются для доступа к удалённым серверам, а также к удалённым репозиториям.

Если вам нужна помощь в быстром создании ключа и размещении его на хосте, [вот краткое руководство.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

Для Git-репозиториев, использующих аутентификацию по SSH, в Git-репозитории, который вы хотите клонировать, должен быть добавлен ваш публичный ключ, соответствующий приватному.

Ниже приведены ссылки на документацию некоторых популярных Git-хостингов:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Login With Password {#2-login-with-password}
Login With Password — это комбинация имени пользователя и пароля либо токена доступа, которую можно использовать для следующего:
* Аутентификация на удалённых хостах (хотя это менее безопасно, чем использование SSH-ключей)
* Учётные данные sudo на удалённых хостах
* Аутентификация в удалённых Git-репозиториях по HTTPS (хотя SSH безопаснее)
* Разблокировка Ansible Vault

:::tip
    Этот тип секрета можно использовать как персональный токен доступа (PAT) или произвольную секретную строку. Просто оставьте поле Login пустым.
:::

### 3. None {#3-none}
Используется как заглушка для репозиториев, не требующих аутентификации, например для open-source-репозитория на GitLab.


## Хранилища секретов {#secret-storages}

Semaphore UI поддерживает различные хранилища для секретов. Вы можете выбрать хранилище для каждого секрета отдельно при его создании или изменении.

Внешние хранилища создаются на вкладке **Storages** хранилища ключей (Pro). У каждого хранилища есть имя и тип; ключи затем ссылаются на хранилище и путь к секрету внутри него.

![Хранилища секретов](/assets/key-store-storages.webp)

### База данных {#database}

По умолчанию секреты хранятся в базе данных в зашифрованном виде. Ключ шифрования задаётся параметром конфигурации
`access_key_encryption` или `SEMAPHORE_ACCESS_KEY_ENCRYPTION` (должен быть сгенерирован с помощью `head -c32 /dev/urandom | base64`).

### Переменная окружения или файл {#environment-variable-or-file}

Ключ может считывать своё значение из переменной окружения сервера Semaphore или из файла на сервере
(например, SSH-ключа, смонтированного в контейнер). Этот режим выбирается на вкладках **Env** и **File** формы ключа.

Файлы должны находиться внутри настроенного каталога секретов (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, по умолчанию `/tmp/semaphore`),
а ключи типов SSH и Login With Password должны быть обёрнуты в небольшой JSON-документ.

[Подробнее...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

Секреты могут храниться во внешнем экземпляре HashiCorp Vault вместо базы данных.

[Подробнее...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

Секреты могут храниться во внешнем экземпляре [OpenBao](https://openbao.org) (open-source-форк HashiCorp Vault с совместимым API).

[Подробнее...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

![Static Badge](https://img.shields.io/badge/enterprise-yellow)

Секреты могут храниться в AWS Secrets Manager. Аутентификация выполняется через IAM-роль либо instance profile или статические ключи доступа.

[Подробнее...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

Секреты могут храниться во внешнем экземпляре Devolutions Server вместо базы данных.

[Подробнее...](/user-guide/key-store/devolutions-server)

## Синхронизация секретов из удалённых хранилищ {#syncing-secrets-from-remote-storages}

Semaphore может автоматически импортировать секреты из внешнего менеджера секретов (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault или Devolutions Server) и поддерживать их в актуальном состоянии. Пути синхронизации позволяют выбрать, какие секреты импортировать и как их называть.

[Подробнее...](/user-guide/key-store/secret-sync)
