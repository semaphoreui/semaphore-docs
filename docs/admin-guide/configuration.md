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
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Type of Git client. Can be `cmd_git` (default) or `go_git`. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | Path to custom SSH configuration file. Default: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | TCP port on which the web interface will be available. Default: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | Bind address (empty = all interfaces). Useful if your server has multiple network interfaces. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | Path to directory where cloned repositories and generated files are stored. Default: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | Path to directory where secrets are stored. Default: /tmp/semaphore |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | Path to directory where repositories are stored. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | Path to directory where SSH agent sockets are stored. Default: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | Controls how the HOME environment variable is set for tasks. Options: `template_dir` (default), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | Max number of parallel tasks that can be run on the server. Default: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | Max duration of a task in seconds. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | Maximum number of recent tasks stored in the database for each template. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | Timezone used for scheduling tasks and cron jobs. Default: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | OpenID provider settings. You can provide multiple OpenID providers. More about OpenID configuration read in [OpenID](/admin-guide/openid). |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | Deny password login. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | Allow non-admin users to create projects. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | JSON map which contains environment variables exposed to task runs. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | JSON array of host environment variables which will be forwarded into task runs. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | JSON map which contains apps configuration. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | Enable to use remote runner. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | Bootstrap token used by runners to register with the server. |
| **Subscription** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | Subscription key or token. Disables activation from the web UI when set. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | Path to subscription key or token file. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | Subscription / billing server URL. Default: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | When enabled, Semaphore mints a short-lived JWT for each task run and exposes its public key via `/.well-known/jwks.json`. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | Value emitted in the `iss` claim of issued JWTs. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | Default lifetime of an issued task JWT, as a Go duration (e.g. `30m`, `1h`). Default: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | Hard upper bound on per-template JWT TTL, as a Go duration. Default: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | Path to file containing the runner registration token. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | Runner authentication token. Mutually exclusive with `runner.token_file`. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | Path to token file for runner registration. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | Path to private key file for runner. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | Runner processes a single job and exits. Useful for dynamic runners. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | Enable the runner. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | Webhook URL for runner. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | Runner name. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | JSON array of runner tags. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | Max number of parallel tasks for the runner. Default: 9999. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | Restrict the runner to a single project. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | PEM bundle used to verify the Semaphore server certificate, in addition to the system trust store. Set when the server uses a self-signed or internal-CA certificate. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | Disable server certificate verification entirely. Insecure (vulnerable to MITM) — use only for testing. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | Strategy the runner uses to execute each task: `local` (default), `k8s` or `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | Path to a kubeconfig file. Empty = in-cluster configuration. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | Namespace where ephemeral task Pods are created. Default: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | Default container image for the build container. Default: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | Image used for the git-clone init container. Default: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | Service account that task Pods run under. Default: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | Comma-separated list of imagePullSecrets attached to each Pod. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | How often the executor polls Pod status, in seconds. Default: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Grace period when deleting Pods, in seconds. Default: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | Docker daemon URL (`unix://`, `tcp://` or `npipe://`). Empty = standard environment (`DOCKER_HOST`) and platform default socket. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | Enable TLS certificate verification for `tcp://` connections. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | Directory holding ca.pem, cert.pem and key.pem for mutual TLS. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | Default image for the build container. Default: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | Image used for the transient git-clone container. Default: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | Docker network the build container joins. Default: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | Image pull policy: `always`, `if-not-present` (default) or `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | When > 0, caps the build container CPU (passed as `--cpus`). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | When non-empty, caps the build container memory (e.g. `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | How often container status is polled, in seconds. Default: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | Timeout passed to `docker stop`, in seconds. Default: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | Run the build container with `--privileged`. Dangerous; off by default. |
| **Runners (server-side fleet)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | Heartbeat staleness (seconds) after which a runner is considered offline. Its "starting" tasks are reassigned. Default: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | Heartbeat staleness (seconds) after which a runner's "running" tasks are failed. Values below `offline_timeout_sec` are clamped to it. Default: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | How often (seconds) dispatched tasks are reconciled against runner liveness. Default: 30 |
| **Teams** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | Allow users to invite members to teams. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | Type of invite: `username` (default), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | Allow members to leave teams. |
| **Database** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Path to the SQLite database file.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | MySQL database host.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | MySQL database (schema) name.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL user name.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | MySQL user's password.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Postgres database host.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Postgres database (schema) name.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres user name.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Postgres user's password.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | Can be `sqlite` (default), `postgres` or `mysql`.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | JSON map which contains database connection options. |
| **Security** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | Base64-encoded key used for encrypting access keys stored in the database. Read more in [Database encryption reference](/admin-guide/security#database-encryption). |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | Base64-encoded key used to encrypt DB options (the JWT signing key) with the old single-key scheme (no rotation). Falls back to the access key when unset. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Base64-encoded HMAC key used to sign cookies. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Base64-encoded key used to encrypt cookies. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Can be useful if you want to use Semaphore by the subpath, for example: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). Do not add a trailing `/`. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Enable or disable TLS (HTTPS) for secure communication with the Semaphore server. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | Path to TLS certificate file. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | Path to TLS key file. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | Address (`host[:port]`) for the HTTP→HTTPS redirect listener. Mutually exclusive with `tls.http_redirect_port`. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | Port to redirect HTTP traffic to HTTPS. Mutually exclusive with `tls.http_redirect_addr`. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | Enable Two-factor authentication using TOTP. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | Issuer label (Semaphore title) shown in TOTP authenticator apps. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | Allow users to reset TOTP using a recovery code. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | Enable email-based multi-factor authentication. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | Allow login as an external (email-only) user. |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | Allow creating external users on first login. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | JSON array of allowed email domains. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | Disable email MFA for users authenticated via OIDC. |
| **Encryption** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | Path to a separate file holding the encryption keyrings (YAML or JSON). Watched for changes — edits are applied without restarting the server. When unset, the legacy `access_key_encryption` field is used. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | How often `keys_file` is polled for changes (a Go duration like `15s`). `0` disables polling (a SIGHUP still forces a reload). Default: 15s |
| **Process** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | User under which wrapped processes (such as Ansible, Terraform, or OpenTofu) will run. |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ID of user under which wrapped processes (such as Ansible, Terraform, or OpenTofu) will run. |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ID for group under which wrapped processes (such as Ansible, Terraform, or OpenTofu) will run. |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | Chroot directory for wrapped processes. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | Set the `no_new_privs` flag so wrapped processes cannot gain new privileges. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | Isolate UIDs/GIDs (`CLONE_NEWUSER`) for app runs. Linux only. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | Hide host mount points such as secret tmpfs (`CLONE_NEWNS`) for app runs. Linux only. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | Hide host processes from app runs (`CLONE_NEWPID`). Linux only. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | Isolate SysV IPC and POSIX message queues (`CLONE_NEWIPC`) for app runs. Linux only. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | Isolate hostname and domain (`CLONE_NEWUTS`) for app runs. Linux only. |
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

## Frequently asked questions

### 1. How to configure a public URL for Semaphore UI

If you use nginx or other web server before Semaphore, you should provide configuration option `web_host`.

For example you configured NGINX on the server which proxies queries to Semaphore.

Server address `https://example.com` and you proxies all queries `https://example.com/semaphore` to Semaphore.

Your `web_host` will be `https://example.com/semaphore`.
