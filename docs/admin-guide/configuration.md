# Configuration

Semaphore can be configured using several methods:

* [Online configurator](https://semaphoreui.com/install) &mdash; web interface for generating configuration online.
* [Configuration file](/admin-guide/configuration/config-file) &mdash; the primary and most flexible way to configure Semaphore.
* [Environment variables](/admin-guide/configuration/env-vars) &mdash; useful for containerized or cloud-native deployments.


## Configuration options

Full list of available configuration options:

| Config file option / Environment variable     | Description                        |
| ----------------------- | --------------------------------------------------------- |
| **Common** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Type of Git client. Can be `cmd_git` or `go_git`. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Path to SSH configuration file. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | TCP port on which the web interface will be available. Default: 3000 |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Useful if your server has multiple network interfaces      |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Path to directory where cloned repositories and generated files are stored. Default: /tmp/semaphore |
| <br />`dirs.secrets_path` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Path to directory where secrets are stored. Default: /tmp/semaphore |
| <br />`dirs.repos_path` <hr /> `SEMAPHORE_REPOS_PATH`<br /><br /> | Path to directory where repositories are stored. |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Controls how the HOME environment variable is set for tasks. Options: `template_dir` (default), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Max number of parallel tasks that can be run on the server. |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Max duration of a task in seconds. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Maximum number of recent tasks stored in the database for each template. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Timezone used for scheduling tasks and cron jobs. |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | OpenID provider settings. You can provide multiple OpenID providers. More about OpenID configuration read in [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Deny password login. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Allow non-admin users to create projects. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | JSON map which contains environment variables. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | JSON array of environment variables which will be forwarded from system. |
| <br />`global_integration_alias` <hr /> `SEMAPHORE_INTEGRATION_ALIAS` <br /><br /> | Global integration alias. |
| <br />`subscription_key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Subscription key or token. Disable activation from web UI when set. |
| <br />`subscription_key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Path to subscription key or token file. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | JSON map which contains apps configuration. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Enable to use remote runner. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Token used to register remote runners. |
| **Runner** ||
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Token for runner registration. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Path to token file for runner registration. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Path to private key file for runner. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | Runner runs only one job and exits. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | Webhook URL for runner. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Max number of parallel tasks for the runner. Default: 1. |
| **Teams** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Allow users to invite members to teams. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Type of invite: `username` (default), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Allow members to leave teams. |
| **Database** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Path to the SQLite database file.   |
| <br />`bolt.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Path to the BoltDB database file.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | MySQL database host.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | MySQL database (schema) name.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL user name.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | MySQL user's password.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Postgres database host.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Postgres database (schema) name.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres user name.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Postgres user's password.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Can be `sqlite` (default), `postgres`, `mysql` or `bolt` (deprecated).   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | JSON map which contains database connection options. |
| **Security** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Secret key used for encrypting access keys in database. Read more in [Database encryption reference](/admin-guide/security#database-encryption). |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Secret key used to sign cookies. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Secret key used to encrypt cookies. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Can be useful if you want to use Semaphore by the subpath, for example: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Do not add a trailing `/`. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Enable or disable TLS (HTTPS) for secure communication with the Semaphore server. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Path to TLS certificate file. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Path to TLS key file. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Port to redirect HTTP traffic to HTTPS. |
| <br />`auth.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Enable Two-factor authentication with using TOTP. |
| <br />`auth.totp.issuer` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Semaphore title in TOTP authorization app. |
| <br />`auth.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Allow users to reset TOTP using a recovery code. |
| **Process** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | User under which wrapped processes (such as Ansible, Terraform, or OpenTofu) will run. |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID of user under which wrapped processes (such as Ansible, Terraform, or OpenTofu) will run. |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID for group under which wrapped processes (such as Ansible, Terraform, or OpenTofu) will run. |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Chroot directory for wrapped processes. |
| **Email** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | Email address of the sender. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | SMTP server hostname. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | SMTP server port. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | Enable StartTLS to upgrade an unencrypted SMTP connection to a secure, encrypted one. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | Use SSL or TLS connection for communication with the SMTP server. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | Minimum TLS version to use for the connection. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | Username for SMTP server authentication. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | Password for SMTP server authentication. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | Flag which enables email alerts. |
| **Messengers** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Set to True to enable pushing alerts to Telegram. It should be used in combination with `telegram_chat` and `telegram_token`. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | Set to the Chat ID for the chat to send alerts to.  Read more in [Telegram Notifications Setup](/admin-guide/notifications#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | Set to the Authorization Token for the bot that will receive the alert payload.  Read more in [Telegram Notifications Setup](/admin-guide/notifications#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Set to True to enable pushing alerts to slack. It should be used in combination with `slack_url`                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | The slack webhook url. Semaphore will used it to POST Slack formatted json alerts to the provided url.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Flag which enables Microsoft Teams alerts. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | Microsoft Teams webhook URL. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Set to True to enable pushing alerts to Rocket.Chat. It should be used in combination with `rocketchat_url`. Available since v2.9.56.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | The rocketchat webhook url. Semaphore will used it to POST Rocket.Chat formatted json alerts to the provided url. Available since v2.9.56. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Enable Dingtalk alerts. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | Dingtalk messenger webhook URL. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Enable Gotify alerts. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | Gotify server URL. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Gotify server token. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | Flag which enables LDAP authentication. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | Flag to enable or disable TLS for LDAP connections. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | The distinguished name (DN) used to bind to the LDAP server for authentication. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | The password used to bind to the LDAP server for authentication. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | The hostname and port of the LDAP server (e.g., ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | The base distinguished name (DN) used for searching users in the LDAP directory (e.g., dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | The filter used to search for users in the LDAP directory (e.g., (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | LDAP attribute to use as the distinguished name (DN) mapping for user authentication. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | LDAP attribute to use as the email address mapping for user authentication. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | LDAP attribute to use as the user ID (UID) mapping for user authentication. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | LDAP attribute to use as the common name (CN) mapping for user authentication. |
| **Logging** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | Event log format. Can be `json` or empty for text. |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | Enable or disable event logging. |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | JSON map which contains event logger configuration. |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | Task log format. Can be `json` or empty for text. |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | Enable or disable task logging. |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | JSON map which contains task logger configuration. |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | JSON map which contains task result logger configuration. |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | Enable or disable writing logs to the configured syslog server. |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Protocol used to connect to the Syslog server: `udp` or `tcp`. |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Hostname and port of the Syslog server. Example: `localhost:514`. |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | The tag used to mark Semaphore UI records on the Syslog server. |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Format of the Syslog messages. Can be `rfc5424` or empty for default. |
| **Debugging** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | Add delay to API responses (for debugging purposes). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Directory for pprof dump files. |
| **High Availability (HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | Enable High Availability (HA) mode. |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | Unique identifier for the HA node. |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | Address of the Redis server used for HA. Example: `localhost:6379`. |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Redis database number. |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Password for the Redis server. |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Username for the Redis server. |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Enable TLS for the Redis connection. |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Skip TLS certificate verification for the Redis connection. |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | Directory for pprof dump files. |

## Frequently asked questions

### 1. How to configure a public URL for Semaphore UI

If you use nginx or other web server before Semaphore, you should provide configuration option `web_host`.

For example you configured NGINX on the server which proxies queries to Semaphore.

Server address `https://example.com` and you proxies all queries `https://example.com/semaphore` to Semaphore.

Your `web_host` will be `https://example.com/semaphore`.
