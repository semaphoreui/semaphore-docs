# Настройка

Semaphore можно настроить несколькими способами:

* [Онлайн-конфигуратор](https://semaphoreui.com/install) &mdash; веб-интерфейс для генерации конфигурации онлайн.
* [Файл конфигурации](/admin-guide/configuration/config-file) &mdash; основной и самый гибкий способ настройки Semaphore.
* [Переменные окружения](/admin-guide/configuration/env-vars) &mdash; удобны для контейнерных и cloud-native развёртываний.


## Параметры конфигурации {#configuration-options}

Полный список доступных параметров конфигурации:

| Параметр файла конфигурации / Переменная окружения     | Описание                        |
| ----------------------- | --------------------------------------------------------- |
| **Общие** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Тип Git-клиента. Может быть `cmd_git` (по умолчанию) или `go_git`. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | Сколько раз выполняется попытка git clone или pull, прежде чем задача завершится с ошибкой. Между попытками используется экспоненциальная задержка (1 с, затем 2 с, 4 с, … до 60 с). По умолчанию: `4`. Установите `1`, чтобы отключить повторные попытки. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Путь к пользовательскому файлу конфигурации SSH. По умолчанию: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | TCP-порт, на котором будет доступен веб-интерфейс. По умолчанию: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Адрес привязки (пустое значение = все интерфейсы). Полезно, если у сервера несколько сетевых интерфейсов. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Путь к каталогу, где хранятся клонированные репозитории и сгенерированные файлы. По умолчанию: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Путь к каталогу, где хранятся секреты (например, файлы токенов Vault). По умолчанию: `/tmp/semaphore`. Устаревший параметр верхнего уровня `secrets_path` по-прежнему принимается, если `dirs.secrets` не задан или оставлен со значением по умолчанию. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Путь к каталогу, где хранятся репозитории. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Путь к каталогу, где хранятся сокеты SSH-агента. По умолчанию: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Управляет тем, как задаётся переменная окружения HOME для задач. Варианты: `template_dir` (по умолчанию), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Максимальное количество параллельных задач, которые могут выполняться на сервере. По умолчанию: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Максимальная длительность задачи в секундах. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Максимальное количество последних задач, хранимых в базе данных для каждого шаблона. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Часовой пояс, используемый для планирования задач и cron-заданий. По умолчанию: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | Настройки провайдеров OpenID. Можно указать несколько провайдеров OpenID. Подробнее о настройке OpenID читайте в разделе [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Запретить вход по паролю. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Разрешить пользователям без прав администратора создавать проекты. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | JSON-словарь с переменными окружения, доступными при выполнении задач. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | JSON-массив переменных окружения хоста, которые будут переданы в запуски задач. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | JSON-словарь с конфигурацией приложений. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Включите, чтобы использовать удалённый runner. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Начальный (bootstrap) токен, который runner'ы используют для регистрации на сервере. |
| **Подписка** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Ключ или токен подписки. Если задан, отключает активацию через веб-интерфейс. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Путь к файлу с ключом или токеном подписки. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | URL сервера подписки / биллинга. По умолчанию: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | Если включено, Semaphore выпускает короткоживущий JWT для каждого запуска задачи и публикует его открытый ключ по адресу `/.well-known/jwks.json`. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Значение, записываемое в claim `iss` выпускаемых JWT. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Время жизни выпускаемого JWT задачи по умолчанию в формате длительности Go (например, `30m`, `1h`). По умолчанию: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Жёсткая верхняя граница TTL JWT, задаваемого на уровне шаблона, в формате длительности Go. По умолчанию: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Путь к файлу, содержащему токен регистрации runner'а. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Токен аутентификации runner'а. Взаимоисключающий с `runner.token_file`. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Путь к файлу токена для регистрации runner'а. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Путь к файлу закрытого ключа runner'а. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | Runner обрабатывает одно задание и завершает работу. Полезно для динамических runner'ов. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Включить runner. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | URL вебхука для runner'а. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Имя runner'а. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | JSON-массив тегов runner'а. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Максимальное количество параллельных задач для runner'а. По умолчанию: 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | Как часто runner опрашивает сервер на наличие новых заданий и отправляет отчёты о ходе выполнения, в секундах. По умолчанию: 1. Большие значения снижают количество запросов ценой немного более медленного подхвата заданий. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Ограничить runner одним проектом. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | PEM-набор сертификатов, используемый для проверки сертификата сервера Semaphore в дополнение к системному хранилищу доверенных сертификатов. Задайте, если сервер использует самоподписанный сертификат или сертификат внутреннего CA. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Полностью отключить проверку сертификата сервера. Небезопасно (уязвимо для атак MITM) — используйте только для тестирования. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | JSON-объект с полной конфигурацией исполнителя runner'а (`type` плюс вложенные настройки `docker` или `k8s`). Используйте, если хотите задать весь блок исполнителя одной переменной окружения. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Стратегия, которую runner использует для выполнения каждой задачи: `local` (по умолчанию), `k8s` или `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Путь к файлу kubeconfig. Пустое значение = конфигурация внутри кластера. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Пространство имён, в котором создаются временные Pod'ы задач. По умолчанию: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Образ контейнера по умолчанию для контейнера сборки. По умолчанию: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Образ, используемый для init-контейнера git-clone. По умолчанию: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Сервисный аккаунт, от имени которого запускаются Pod'ы задач. По умолчанию: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Список imagePullSecrets через запятую, прикрепляемых к каждому Pod'у. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | Как часто исполнитель опрашивает состояние Pod'а, в секундах. По умолчанию: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Льготный период при удалении Pod'ов, в секундах. По умолчанию: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | URL демона Docker (`unix://`, `tcp://` или `npipe://`). Пустое значение = стандартное окружение (`DOCKER_HOST`) и сокет по умолчанию для платформы. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | Включить проверку TLS-сертификата для подключений по `tcp://`. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Каталог, содержащий ca.pem, cert.pem и key.pem для взаимного TLS. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Образ по умолчанию для контейнера сборки. По умолчанию: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Образ, используемый для временного контейнера git-clone. По умолчанию: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Сеть Docker, к которой подключается контейнер сборки. По умолчанию: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Политика загрузки образов: `always`, `if-not-present` (по умолчанию) или `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | Если > 0, ограничивает CPU контейнера сборки (передаётся как `--cpus`). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | Если не пусто, ограничивает память контейнера сборки (например, `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | Как часто опрашивается состояние контейнера, в секундах. По умолчанию: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Таймаут, передаваемый в `docker stop`, в секундах. По умолчанию: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Запускать контейнер сборки с `--privileged`. Опасно; по умолчанию выключено. |
| **Runner'ы (парк на стороне сервера)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Время устаревания heartbeat (в секундах), после которого runner считается отключённым. Его задачи в состоянии «starting» переназначаются. По умолчанию: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Время устаревания heartbeat (в секундах), после которого задачи runner'а в состоянии «running» помечаются как неуспешные. Значения ниже `offline_timeout_sec` приводятся к нему. По умолчанию: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | Как часто (в секундах) распределённые задачи сверяются с доступностью runner'ов. По умолчанию: 30 |
| **Команды** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Разрешить пользователям приглашать участников в команды. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Тип приглашения: `username` (по умолчанию), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Разрешить участникам покидать команды. |
| **База данных** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Путь к файлу базы данных SQLite.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Хост базы данных MySQL.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Имя базы данных (схемы) MySQL.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | Имя пользователя MySQL.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Пароль пользователя MySQL.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Хост базы данных Postgres.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Имя базы данных (схемы) Postgres.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Имя пользователя Postgres.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Пароль пользователя Postgres.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Может быть `sqlite` (по умолчанию), `postgres` или `mysql`.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | JSON-словарь с параметрами подключения к базе данных. |
| **Безопасность** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Ключ в кодировке Base64, используемый для шифрования ключей доступа, хранящихся в базе данных. Подробнее в разделе [Шифрование базы данных](/admin-guide/security#data-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Ключ в кодировке Base64, используемый для шифрования параметров БД (ключа подписи JWT) по старой схеме с одним ключом (без ротации). Если не задан, используется ключ доступа. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | HMAC-ключ в кодировке Base64, используемый для подписи cookie. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Ключ в кодировке Base64, используемый для шифрования cookie. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Может быть полезно, если вы хотите использовать Semaphore по подпути, например: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Не добавляйте завершающий `/`. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Включить или отключить TLS (HTTPS) для защищённого взаимодействия с сервером Semaphore. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Путь к файлу TLS-сертификата. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Путь к файлу TLS-ключа. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Адрес (`host[:port]`) слушателя для перенаправления HTTP→HTTPS. Взаимоисключающий с `tls.http_redirect_port`. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Порт для перенаправления HTTP-трафика на HTTPS. Взаимоисключающий с `tls.http_redirect_addr`. |
| <br />`auth.max_session_life_hours` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <hr /> `SEMAPHORE_AUTH_MAX_SESSION_LIFE_HOURS` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <br /><br /> | Абсолютное время жизни сеанса входа в часах, отсчитываемое с момента входа. После его истечения пользователь должен войти снова, даже если сеанс недавно был активен. `0` (по умолчанию) означает отсутствие абсолютного ограничения; тогда сеансы истекают только после 7 дней без активности. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Включить двухфакторную аутентификацию с использованием TOTP. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Метка издателя (название Semaphore), отображаемая в приложениях-аутентификаторах TOTP. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Разрешить пользователям сбрасывать TOTP с помощью кода восстановления. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | Включить многофакторную аутентификацию по электронной почте. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Разрешить вход в качестве внешнего пользователя (только по электронной почте). |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Разрешить создание внешних пользователей при первом входе. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | JSON-массив разрешённых доменов электронной почты. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | Отключить MFA по электронной почте для пользователей, аутентифицированных через OIDC. |
| **Шифрование** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Путь к отдельному файлу с наборами ключей шифрования (YAML или JSON). Отслеживается на изменения — правки применяются без перезапуска сервера. Если не задан, используется устаревшее поле `access_key_encryption`. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | Как часто `keys_file` проверяется на изменения (длительность Go, например `15s`). `0` отключает опрос (SIGHUP по-прежнему принудительно перезагружает файл). По умолчанию: 15s |
| **Процесс** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | Пользователь, от имени которого будут запускаться обёрнутые процессы (такие как Ansible, Terraform или OpenTofu). |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID пользователя, от имени которого будут запускаться обёрнутые процессы (такие как Ansible, Terraform или OpenTofu). |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID группы, от имени которой будут запускаться обёрнутые процессы (такие как Ansible, Terraform или OpenTofu). |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Каталог chroot для обёрнутых процессов. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Установить флаг `no_new_privs`, чтобы обёрнутые процессы не могли получить новые привилегии. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | Изолировать UID/GID (`CLONE_NEWUSER`) для запусков приложений. Только Linux. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Скрывать точки монтирования хоста, такие как tmpfs с секретами (`CLONE_NEWNS`), для запусков приложений. Только Linux. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Скрывать процессы хоста от запусков приложений (`CLONE_NEWPID`). Только Linux. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | Изолировать SysV IPC и очереди сообщений POSIX (`CLONE_NEWIPC`) для запусков приложений. Только Linux. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Изолировать имя хоста и домен (`CLONE_NEWUTS`) для запусков приложений. Только Linux. |
| **Электронная почта** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | Адрес электронной почты отправителя. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | Имя хоста SMTP-сервера. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | Порт SMTP-сервера. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | Включить StartTLS для перевода незашифрованного SMTP-соединения в защищённое зашифрованное. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | Использовать SSL- или TLS-соединение для взаимодействия с SMTP-сервером. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Минимальная версия TLS для соединения. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Имя пользователя для аутентификации на SMTP-сервере. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Пароль для аутентификации на SMTP-сервере. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Флаг, включающий оповещения по электронной почте. |
| **Мессенджеры** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Установите True, чтобы включить отправку оповещений в Telegram. Используется вместе с `telegram_chat` и `telegram_token`. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Укажите Chat ID чата, в который отправлять оповещения.  Подробнее в разделе [Настройка уведомлений Telegram](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Укажите токен авторизации бота, который будет получать данные оповещения.  Подробнее в разделе [Настройка уведомлений Telegram](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Установите True, чтобы включить отправку оповещений в Slack. Используется вместе с `slack_url`                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | URL вебхука Slack. Semaphore будет отправлять на него POST-запросы с оповещениями в формате JSON для Slack.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Флаг, включающий оповещения в Microsoft Teams. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | URL вебхука Microsoft Teams. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Установите True, чтобы включить отправку оповещений в Rocket.Chat. Используется вместе с `rocketchat_url`. Доступно с версии v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | URL вебхука Rocket.Chat. Semaphore будет отправлять на него POST-запросы с оповещениями в формате JSON для Rocket.Chat. Доступно с версии v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Включить оповещения Dingtalk. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | URL вебхука мессенджера Dingtalk. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Включить оповещения Gotify. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | URL сервера Gotify. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Токен сервера Gotify. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Флаг, включающий аутентификацию через LDAP. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Флаг для включения или отключения TLS для LDAP-подключений. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | Отличительное имя (DN), используемое для привязки к LDAP-серверу при аутентификации. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | Пароль, используемый для привязки к LDAP-серверу при аутентификации. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | Имя хоста и порт LDAP-сервера (например, ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | Базовое отличительное имя (DN), используемое для поиска пользователей в каталоге LDAP (например, dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | Фильтр, используемый для поиска пользователей в каталоге LDAP (например, (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | Атрибут LDAP, используемый как сопоставление отличительного имени (DN) для аутентификации пользователя. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | Атрибут LDAP, используемый как сопоставление адреса электронной почты для аутентификации пользователя. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | Атрибут LDAP, используемый как сопоставление идентификатора пользователя (UID) для аутентификации пользователя. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | Атрибут LDAP, используемый как сопоставление общего имени (CN) для аутентификации пользователя. |
| **Журналирование** ||
| <br />`log.events.format`      <Pro /> <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Формат журнала событий. Может быть `json` или пустым для текстового формата. |
| <br />`log.events.enabled`     <Pro /> <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Включить или отключить журналирование событий. |
| <br />`log.events.logger`      <Pro /> <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | JSON-словарь с конфигурацией логгера событий. |
| <br />`log.tasks.format`       <Pro /> <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Формат журнала задач. Может быть `json` или пустым для текстового формата. |
| <br />`log.tasks.enabled`      <Pro /> <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Включить или отключить журналирование задач. |
| <br />`log.tasks.logger`       <Pro /> <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | JSON-словарь с конфигурацией логгера задач. |
| <br />`log.tasks.result_logger`  <Pro /> <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | JSON-словарь с конфигурацией логгера результатов задач. |
| <br />`syslog.enabled` <Pro /> <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Включить или отключить запись журналов на настроенный syslog-сервер. |
| <br />`syslog.network` <Pro /> <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Протокол подключения к Syslog-серверу: `udp` или `tcp`. |
| <br />`syslog.address` <Pro /> <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Имя хоста и порт Syslog-сервера. Пример: `localhost:514`. |
| <br />`syslog.tag` <Pro /> <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Тег, которым помечаются записи Semaphore UI на Syslog-сервере. |
| <br />`syslog.format` <Pro /> <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Формат сообщений Syslog. Может быть `rfc5424` или пустым для формата по умолчанию. |
| **Отладка** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Добавить задержку в ответы API (для целей отладки). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Каталог для файлов дампов pprof. |
| **Высокая доступность (HA)** ||
| <br />`ha.enabled` <Enterprise /> <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Включить режим высокой доступности (HA). |
| <br />`ha.node_id` <Enterprise /><hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Уникальный идентификатор узла HA. |
| <br />`ha.redis.addr` <Enterprise /> <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Адрес Redis-сервера, используемого для HA. Пример: `localhost:6379`. |
| <br />`ha.redis.db` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Номер базы данных Redis. |
| <br />`ha.redis.pass` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Пароль Redis-сервера. |
| <br />`ha.redis.user` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Имя пользователя Redis-сервера. |
| <br />`ha.redis.tls` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Включить TLS для подключения к Redis. |
| <br />`ha.redis.tls_skip_verify` <Enterprise /><hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Пропускать проверку TLS-сертификата при подключении к Redis. |

## Часто задаваемые вопросы {#frequently-asked-questions}

### 1. Как настроить публичный URL для Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Если перед Semaphore используется nginx или другой веб-сервер, необходимо задать параметр конфигурации `web_host`.

Например, вы настроили NGINX на сервере, который проксирует запросы к Semaphore.

Адрес сервера — `https://example.com`, и все запросы `https://example.com/semaphore` проксируются к Semaphore.

Ваш `web_host` будет `https://example.com/semaphore`.
