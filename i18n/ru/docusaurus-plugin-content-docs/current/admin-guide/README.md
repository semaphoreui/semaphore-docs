# Руководство администратора

Добро пожаловать в Руководство администратора Semaphore UI. Это руководство содержит исчерпывающую информацию об установке, настройке и сопровождении вашего экземпляра Semaphore.

## Что такое Semaphore UI? {#what-is-semaphore-ui}

Semaphore UI — это современный веб-интерфейс с открытым исходным кодом для запуска задач автоматизации. Он задуман как лёгкая, быстрая и простая в использовании альтернатива более сложным платформам автоматизации.

Он позволяет безопасно управлять задачами и выполнять их для:
*   playbook'ов **Ansible**
*   инфраструктуры как кода на **Terraform/OpenTofu**
*   скриптов **PowerShell** и **Shell**
*   скриптов **Python**

## Ключевые возможности и философия {#core-features--philosophy}

Понимание принципов, заложенных в Semaphore, поможет использовать его максимально эффективно:

*   **Лёгкий и производительный**: Semaphore написан на **Go** и распространяется как **единый бинарный файл**. Он предъявляет минимальные требования к ресурсам (CPU/RAM) и не нуждается во внешних зависимостях вроде Kubernetes, Docker или JVM. Благодаря этому он быстрый, эффективный и простой в развёртывании.
*   **Простой в установке и сопровождении**: Semaphore можно запустить за считанные минуты. Установка может сводиться к скачиванию бинарного файла и его запуску. Простая архитектура делает обновление и сопровождение несложными.
*   **Гибкое развёртывание**: запускайте его как бинарный файл, как сервис systemd или в Docker-контейнере. Он подходит для чего угодно — от личной домашней лаборатории до корпоративных сред.
*   **Самостоятельное размещение и безопасность**: Semaphore — это self-hosted-решение. Все ваши данные, учётные данные и логи остаются в вашей собственной инфраструктуре, что даёт вам полный контроль. Учётные данные всегда хранятся в базе данных в зашифрованном виде.
*   **Мощные интеграции**: при всей простоте Semaphore поддерживает такие мощные возможности, как аутентификация через LDAP/OpenID, детальное ролевое разграничение доступа (RBAC) на уровне проекта, удалённые runner'ы для масштабирования выполнения задач и полноценный REST API для программного доступа.

Это руководство проведёт вас через настройку и управление этими возможностями под ваши конкретные нужды.

<!-- ## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting -->

## Быстрые ссылки {#quick-links}

- Установка: [Обзор](/admin-guide/installation)
  - [Менеджер пакетов](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [Бинарный файл](/admin-guide/installation/binary-file)
  - [Kubernetes (Helm chart)](/admin-guide/installation/k8s)
  - [Облако](/admin-guide/installation/cloud)
  - [Ручная установка](/admin-guide/installation_manually)
- Конфигурация: [Обзор](/admin-guide/configuration)
  - [Файл конфигурации](/admin-guide/configuration/config-file)
  - [Переменные окружения](/admin-guide/configuration/env-vars)
  - [Интерактивная настройка](/admin-guide/configuration/cli)
- Безопасность: [Обзор](/admin-guide/security)
  - [Безопасность базы данных](/admin-guide/security/database)
  - [Сетевая безопасность](/admin-guide/security/network)
  - [Конфигурация NGINX](/admin-guide/reverse-proxy/nginx)
  - [Конфигурация Apache](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- Аутентификация:
  - [LDAP](/admin-guide/ldap)
  - [OpenID](/admin-guide/openid)
    - [GitHub](/admin-guide/openid/github)
    - [Google](/admin-guide/openid/google)
    - [GitLab](/admin-guide/openid/gitlab)
    - [Gitea](/admin-guide/openid/gitea)
    - [Authelia](/admin-guide/openid/authelia)
    - [Authentik](/admin-guide/openid/authentik)
    - [Keycloak](/admin-guide/openid/keycloak)
    - [Okta](/admin-guide/openid/okta)
    - [PingFederate](/admin-guide/openid/pingfederate)
    - [Azure](/admin-guide/openid/azure)
    - [Zitadel](/admin-guide/openid/zitadel)
- Эксплуатация:
  - [CLI](/admin-guide/cli)
  - [Runner'ы](/admin-guide/runners)
  - [Логи](/admin-guide/logs)
  - [Уведомления](/admin-guide/notifications)
    - [Email](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- Сопровождение:
  - [Обновление](/admin-guide/upgrading)
  - [Активация лицензии](/admin-guide/license)
  - [Устранение неполадок](/faq/troubleshooting)
