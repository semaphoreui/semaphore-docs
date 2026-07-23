# Configuration options

Semaphore server configuration comes from two sources:

* A **config file** (`config.json`), passed with `--config <path>` (or found via the `SEMAPHORE_CONFIG_PATH` environment variable).
* **Environment variables**, which override values from the config file.

See [Configuration](/admin-guide/configuration) for how to supply the config file and environment variables.

Options below are listed by their config file key. Nested objects use dotted notation: `tls.enabled` means

```json
{
  "tls": {
    "enabled": true
  }
}
```

Options marked *(sensitive)* hold secrets; prefer environment variables or files over committing them to a config file. A dash (—) means the option has no description or no default in the schema.

## Database

The `mysql`, `postgres`, and `sqlite` sections all have the same structure (shown as `<dialect>.*` below). The `SEMAPHORE_DB_*` environment variables apply to the section selected by `dialect`.

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `dialect` | `SEMAPHORE_DB_DIALECT` | string (`mysql`, `postgres`, `sqlite`) | `sqlite` | Database engine used by Semaphore. |
| `<dialect>.host` | `SEMAPHORE_DB_HOST` | string | `0.0.0.0` | — |
| `<dialect>.user` | `SEMAPHORE_DB_USER` | string | | — |
| `<dialect>.pass` | `SEMAPHORE_DB_PASS` | string | | Database password (sensitive). |
| `<dialect>.name` | `SEMAPHORE_DB` | string | `semaphore` | — |
| `<dialect>.options` | `SEMAPHORE_DB_OPTIONS` | map of string | | — |

## Web server

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `port` | `SEMAPHORE_PORT` | string | `:3000` | TCP port the HTTP server listens on. Leading ':' optional. |
| `interface` | `SEMAPHORE_INTERFACE` | string | | Bind address (empty = all interfaces). |
| `web_host` | `SEMAPHORE_WEB_ROOT` | string (URI) | | Public URL of this Semaphore instance. |
| `tls.enabled` | `SEMAPHORE_TLS_ENABLED` | boolean | | — |
| `tls.cert_file` | `SEMAPHORE_TLS_CERT_FILE` | string | | — |
| `tls.key_file` | `SEMAPHORE_TLS_KEY_FILE` | string | | — |
| `tls.http_redirect_addr` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR` | string | | Address (host[:port]) for the HTTP→HTTPS redirect listener. Mutually exclusive with `http_redirect_port`. |
| `tls.http_redirect_port` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT` | integer or null | | Port for the HTTP→HTTPS redirect listener. Mutually exclusive with `http_redirect_addr`. |

## Paths and directories

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `tmp_path` | `SEMAPHORE_TMP_PATH` | string | `/tmp/semaphore` | Working directory for ephemeral project data. |
| `home_dir_mode` | `SEMAPHORE_HOME_DIR_MODE` | string (``, `user_home`, `project_home`, `template_dir`) | `template_dir` | How HOME is set for task runs. |
| `ssh_config_path` | `SEMAPHORE_SSH_PATH` | string | | Path to custom SSH config (default ~/.ssh/config). |
| `git_client` | `SEMAPHORE_GIT_CLIENT` | string (`go_git`, `cmd_git`) | `cmd_git` | Git client implementation. |
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | string | `/tmp/semaphore` | — |
| `dirs.repos` | `SEMAPHORE_REPOS_DIR` | string | | — |
| `dirs.ssh_agent_sockets` | `SEMAPHORE_SSH_AGENT_SOCKETS_DIR` | string | `/tmp/semaphore` | — |

## Secrets and encryption

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `cookie_hash` | `SEMAPHORE_COOKIE_HASH` | string | | Base64-encoded HMAC key for session cookies (sensitive). |
| `cookie_encryption` | `SEMAPHORE_COOKIE_ENCRYPTION` | string | | Base64-encoded encryption key for session cookies (sensitive). |
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | string | | Base64-encoded 32-byte key used to encrypt stored access keys (sensitive). Legacy entry point; the secrets keyring is also configurable via `encryption.keys_file` (`active.secret_key`), with rotation. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | string | | Base64-encoded key used to encrypt DB options (the JWT signing key) with the old single-key scheme, no rotation (sensitive). Counterpart of `access_key_encryption`; rotation is configured instead via `encryption.keys_file` (`active.option_key`). When unset, options fall back to the secrets key. |
| `encryption.keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | string | | Path to a separate file holding the encryption keyrings (YAML or JSON, any extension). The only source for the keyrings, watched for changes — edits are applied without restarting the server. When unset, the legacy `access_key_encryption` field is used. |
| `encryption.keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | string | `15s` | How often `keys_file` is polled for changes (a Go duration like "15s"). "0" disables polling (a SIGHUP still forces a reload). |

### Encryption keys file structure

The file referenced by `encryption.keys_file` is a separate file (not part of `config.json`); it has no environment variable equivalents. It contains a registry of keys plus pointers to the active key per purpose. The registry is an inline map (`keys`) and/or a folder of key files (`keys_folder`, one regular file per key, labelled by filename); the two combine. The key id stored in the database is derived from the key material, so a key is retired simply by no longer being active while some rows still reference it.

| Key | Type | Description |
|-----|------|-------------|
| `keys` | map of key source | Inline registry, label → key source. |
| `keys.<label>.value` | string | Base64-encoded key material (sensitive). Mutually exclusive with `file`. |
| `keys.<label>.file` | string | Path to a file containing the base64-encoded key. Mutually exclusive with `value`. |
| `keys_folder` | string | Directory of key files (each regular file is one key, labelled by its filename). |
| `active.secret_key` | string | Label of the active secrets key in `keys`. |
| `active.option_key` | string | Label of the active options key in `keys`. |
| `active.secret_key_file` | string | Filename (in `keys_folder`) of the active secrets key. |
| `active.option_key_file` | string | Filename (in `keys_folder`) of the active options key. |

See [Encryption](/admin-guide/security/encryption) for details.

## Authentication and feature toggles

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `password_login_disable` | `SEMAPHORE_PASSWORD_LOGIN_DISABLED` | boolean | | — |
| `external_auth_email_matching` | `SEMAPHORE_EXTERNAL_AUTH_EMAIL_MATCHING` | string (`auto`, `always`, `never`) | `auto` | Whether an LDAP/OIDC login may be linked to an existing user by email when no external identity record exists yet. "auto" links only external users without any linked identity (one-time adoption of pre-2.20 accounts), "always" links any external user, "never" matches strictly by provider ID. Local (password) accounts are never matched. Provider key "ldap" is reserved for the LDAP integration. |
| `non_admin_can_create_project` | `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` | boolean | | — |
| `use_remote_runner` | `SEMAPHORE_USE_REMOTE_RUNNER` | boolean | | — |

## Multi-factor authentication

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | boolean | | — |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | boolean | | — |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | string | | Issuer label shown in authenticator apps. |
| `mfa.email.enabled` | `SEMAPHORE_EMAIL_2TP_ENABLED` | boolean | | — |
| `mfa.email.allow_login_as_external_user` | `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` | boolean | | — |
| `mfa.email.allow_create_external_user` | `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` | boolean | | — |
| `mfa.email.allowed_domains` | `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` | array of string | | — |
| `mfa.email.disable_for_oidc` | `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` | boolean | | — |

## LDAP

The flat `ldap_*` options configure a single (legacy) LDAP directory. `ldap_providers` configures multiple directories. See [LDAP and AD](/admin-guide/ldap).

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `ldap_enable` | `SEMAPHORE_LDAP_ENABLE` | boolean | | — |
| `ldap_binddn` | `SEMAPHORE_LDAP_BIND_DN` | string | | — |
| `ldap_bindpassword` | `SEMAPHORE_LDAP_BIND_PASSWORD` | string | | LDAP bind password (sensitive). |
| `ldap_server` | `SEMAPHORE_LDAP_SERVER` | string | | — |
| `ldap_searchdn` | `SEMAPHORE_LDAP_SEARCH_DN` | string | | — |
| `ldap_searchfilter` | `SEMAPHORE_LDAP_SEARCH_FILTER` | string | | — |
| `ldap_mappings.dn` | `SEMAPHORE_LDAP_MAPPING_DN` | string | `dn` | — |
| `ldap_mappings.mail` | `SEMAPHORE_LDAP_MAPPING_MAIL` | string | `mail` | — |
| `ldap_mappings.uid` | `SEMAPHORE_LDAP_MAPPING_UID` | string | `uid` | — |
| `ldap_mappings.cn` | `SEMAPHORE_LDAP_MAPPING_CN` | string | `cn` | — |
| `ldap_needtls` | `SEMAPHORE_LDAP_NEEDTLS` | boolean | | — |
| `ldap_tls_skip_verify` | `SEMAPHORE_LDAP_TLS_SKIP_VERIFY` | boolean | `false` | Disable verification of the LDAP server's TLS certificate for the legacy flat `ldap_*` config. Defaults to false (certificates are verified). |
| `ldap_providers` | `SEMAPHORE_LDAP_PROVIDERS` | map of LDAP provider | | LDAP directories, keyed by provider id. The key "ldap" is reserved for the legacy flat `ldap_*` options and is ignored here. |

### LDAP provider options

Each entry of `ldap_providers.<id>` supports the following keys (no per-key environment variables; set the whole map via `SEMAPHORE_LDAP_PROVIDERS` as JSON):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `display_name` | string | | — |
| `server` | string | | — |
| `need_tls` | boolean | | — |
| `tls_skip_verify` | boolean | `false` | Disable verification of the LDAP server's TLS certificate. Defaults to false (certificates are verified). Only enable on trusted networks with self-signed certificates. |
| `bind_dn` | string | | — |
| `bind_password` | string | | LDAP bind password (sensitive). |
| `search_dn` | string | | — |
| `search_filter` | string | | — |
| `mappings.dn` / `mappings.mail` / `mappings.uid` / `mappings.cn` | string | `dn` / `mail` / `uid` / `cn` | — |
| `color` | string | | — |
| `icon` | string | | MDI icon name without the mdi- prefix. |
| `order` | integer | | — |

## OpenID Connect

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `oidc_providers` | `SEMAPHORE_OIDC_PROVIDERS` | map of OIDC provider | | OIDC identity providers, keyed by provider id used in callback URLs. |

### OIDC provider options

Each entry of `oidc_providers.<id>` supports the following keys (no per-key environment variables; set the whole map via `SEMAPHORE_OIDC_PROVIDERS` as JSON). See [OpenID Connect](/admin-guide/openid) for provider-specific guides.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `client_id` | string | | — |
| `client_id_file` | string | | — |
| `client_secret` | string | | OIDC client secret (sensitive). |
| `client_secret_file` | string | | — |
| `redirect_url` | string (URI) | | — |
| `scopes` | array of string | | — |
| `display_name` | string | | — |
| `color` | string | | — |
| `icon` | string | | — |
| `provider_url` | string (URI) | | OIDC autodiscovery URL. |
| `endpoint.issuer` | string (URI) | | — |
| `endpoint.auth` | string (URI) | | — |
| `endpoint.token` | string (URI) | | — |
| `endpoint.userinfo` | string (URI) | | — |
| `endpoint.jwks` | string (URI) | | — |
| `endpoint.algorithms` | array of string | | — |
| `username_claim` | string | `preferred_username` | — |
| `name_claim` | string | `preferred_username` | — |
| `email_claim` | string | `email` | — |
| `order` | integer | | — |
| `return_via_state` | boolean | `true` | — |
| `require_verified_email` | boolean | `false` | Use the email for account matching only if the provider sent email_verified=true. Off by default because some providers (e.g. Okta) do not return the claim. |

## Email (SMTP) alerts

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `email_alert` | `SEMAPHORE_EMAIL_ALERT` | boolean | | — |
| `email_sender` | `SEMAPHORE_EMAIL_SENDER` | string | | — |
| `email_host` | `SEMAPHORE_EMAIL_HOST` | string | | — |
| `email_port` | `SEMAPHORE_EMAIL_PORT` | string | | — |
| `email_username` | `SEMAPHORE_EMAIL_USERNAME` | string | | — |
| `email_password` | `SEMAPHORE_EMAIL_PASSWORD` | string | | SMTP password (sensitive). |
| `email_secure` | `SEMAPHORE_EMAIL_SECURE` | boolean | | — |
| `email_tls` | `SEMAPHORE_EMAIL_TLS` | boolean | | — |
| `email_tls_min_version` | `SEMAPHORE_EMAIL_TLS_MIN_VERSION` | string (`1.0`–`1.3`) | `1.2` | — |

## Chat integrations

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `telegram_alert` | `SEMAPHORE_TELEGRAM_ALERT` | boolean | | — |
| `telegram_chat` | `SEMAPHORE_TELEGRAM_CHAT` | string | | — |
| `telegram_token` | `SEMAPHORE_TELEGRAM_TOKEN` | string | | Telegram bot token (sensitive). |
| `slack_alert` | `SEMAPHORE_SLACK_ALERT` | boolean | | — |
| `slack_url` | `SEMAPHORE_SLACK_URL` | string (URI) | | — |
| `rocketchat_alert` | `SEMAPHORE_ROCKETCHAT_ALERT` | boolean | | — |
| `rocketchat_url` | `SEMAPHORE_ROCKETCHAT_URL` | string (URI) | | — |
| `microsoft_teams_alert` | `SEMAPHORE_MICROSOFT_TEAMS_ALERT` | boolean | | — |
| `microsoft_teams_url` | `SEMAPHORE_MICROSOFT_TEAMS_URL` | string (URI) | | — |
| `dingtalk_alert` | `SEMAPHORE_DINGTALK_ALERT` | boolean | | — |
| `dingtalk_url` | `SEMAPHORE_DINGTALK_URL` | string (URI) | | — |
| `gotify_alert` | `SEMAPHORE_GOTIFY_ALERT` | boolean | | — |
| `gotify_url` | `SEMAPHORE_GOTIFY_URL` | string (URI) | | — |
| `gotify_token` | `SEMAPHORE_GOTIFY_TOKEN` | string | | Gotify app token (sensitive). |

## Task execution

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `max_task_duration_sec` | `SEMAPHORE_MAX_TASK_DURATION_SEC` | integer | | — |
| `max_tasks_per_template` | `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` | integer | | — |
| `max_parallel_tasks` | `SEMAPHORE_MAX_PARALLEL_TASKS` | integer | `9999` | — |
| `schedule.timezone` | `SEMAPHORE_SCHEDULE_TIMEZONE` | string | `UTC` | — |

## Task JWTs

JWT issuance settings for task executions.

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `jwt.enabled` | `SEMAPHORE_JWT_ENABLED` | boolean | | When true, Semaphore mints a short-lived JWT for each task run and exposes its public key via /.well-known/jwks.json. |
| `jwt.issuer` | `SEMAPHORE_JWT_ISSUER` | string | | Value emitted in the `iss` claim of issued JWTs. |
| `jwt.default_ttl` | `SEMAPHORE_JWT_DEFAULT_TTL` | string | `1h` | Default lifetime of an issued task JWT, as a Go duration (e.g. 30m, 1h). Overridden per-template by `jwt_params.ttl`. |
| `jwt.max_ttl` | `SEMAPHORE_JWT_MAX_TTL` | string | `24h` | Hard upper bound on per-template JWT TTL, as a Go duration. Any configured `jwt_params.ttl` above this is rejected. |

## Apps and environment

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `apps` | `SEMAPHORE_APPS` | map of app | | Pre-registered app templates, keyed by app id. |
| `env_vars` | `SEMAPHORE_ENV_VARS` | map of string | | Environment variables exposed to task runs. |
| `forwarded_env_vars` | `SEMAPHORE_FORWARDED_ENV_VARS` | array of string | | Host environment variables forwarded into task runs. |

### App options

Each entry of `apps.<id>` supports the following keys (no per-key environment variables; set the whole map via `SEMAPHORE_APPS` as JSON):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `active` | boolean | | — |
| `priority` | integer | | — |
| `title` | string | | — |
| `icon` | string | | — |
| `color` | string | | — |
| `dark_color` | string | | — |
| `path` | string | | Path to the app binary or working directory. |
| `args` | array of string | | — |

## Runner (runner process)

Settings for a Semaphore process running in [runner mode](/admin-guide/runners). The top-level `runner_registration_token` option belongs to the server.

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `runner_registration_token` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | string | | Bootstrap token used by runners to register with the server. |
| `runner.registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | string | | — |
| `runner.token` | `SEMAPHORE_RUNNER_TOKEN` | string | | Runner authentication token (sensitive). |
| `runner.token_file` | `SEMAPHORE_RUNNER_TOKEN_FILE` | string | | — |
| `runner.one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | boolean | | Runner processes a single job and exits. |
| `runner.webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | string (URI) | | — |
| `runner.name` | `SEMAPHORE_RUNNER_NAME` | string | | — |
| `runner.tags` | `SEMAPHORE_RUNNER_TAGS` | array of string | | — |
| `runner.max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | integer | `9999` | — |
| `runner.enabled` | `SEMAPHORE_RUNNER_ENABLED` | boolean | | — |
| `runner.project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | integer or null | | — |
| `runner.connection.server_ca_cert_file` | `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` | string | | PEM bundle used to verify the Semaphore server certificate, in addition to the system trust store. Set when the server uses a self-signed or internal-CA certificate. |
| `runner.connection.skip_tls_verify` | `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` | boolean | | Disables server certificate verification entirely. Insecure (vulnerable to MITM) — use only for testing. |

### Runner executor

Strategy the runner uses to execute each task. See [Executors](/admin-guide/runners/executors).

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `runner.executor.type` | | string (`local`, `k8s`, `docker`) | `local` | — |

#### Kubernetes executor

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `runner.executor.k8s.kubeconfig` | `SEMAPHORE_RUNNER_K8S_KUBECONFIG` | string | | Path to a kubeconfig file. Empty = in-cluster configuration. |
| `runner.executor.k8s.namespace` | `SEMAPHORE_RUNNER_K8S_NAMESPACE` | string | `semaphore` | — |
| `runner.executor.k8s.image` | `SEMAPHORE_RUNNER_K8S_IMAGE` | string | `alpine:latest` | — |
| `runner.executor.k8s.helper_image` | `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` | string | `alpine/git:latest` | — |
| `runner.executor.k8s.service_account` | `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` | string | `default` | Service account that task Pods run under. |
| `runner.executor.k8s.pull_secrets` | `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` | string | | Comma-separated list of imagePullSecrets attached to each Pod. |
| `runner.executor.k8s.poll_interval_seconds` | `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` | integer | `3` | — |
| `runner.executor.k8s.cleanup_grace_seconds` | `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` | integer | `30` | — |

#### Docker executor

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `runner.executor.docker.host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | string | | Docker daemon URL (unix://, tcp:// or npipe://). Empty = standard environment (DOCKER_HOST) and platform default socket. |
| `runner.executor.docker.tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | boolean | | Enables TLS certificate verification for tcp:// connections. |
| `runner.executor.docker.cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | string | | Directory holding ca.pem, cert.pem and key.pem for mutual TLS. |
| `runner.executor.docker.image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | string | `semaphoreui/job:latest` | — |
| `runner.executor.docker.helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | string | `semaphoreui/job:latest` | — |
| `runner.executor.docker.network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | string | `bridge` | — |
| `runner.executor.docker.pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | string | `if-not-present` | Image pull policy — always, if-not-present or never. |
| `runner.executor.docker.cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | number | | When > 0, caps the build container CPU (passed as --cpus). |
| `runner.executor.docker.memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | string | | When non-empty, caps the build container memory (e.g. "2g"). |
| `runner.executor.docker.poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | integer | `2` | — |
| `runner.executor.docker.cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | integer | `30` | — |
| `runner.executor.docker.privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | boolean | | Runs the build container with --privileged. Dangerous; off by default. |

## Runner fleet (server side)

Server-side settings describing how the server treats its runner fleet. Unrelated to `runner`, which configures a runner process itself.

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `runners.offline_timeout_sec` | `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` | integer | `120` | Heartbeat staleness (seconds) after which a runner is considered offline. An offline runner receives no new tasks and its "starting" tasks are reassigned to another runner. Must be comfortably larger than the runner poll interval. |
| `runners.task_fail_timeout_sec` | `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` | integer | `420` | Heartbeat staleness (seconds) after which a runner's "running" tasks are failed. A runner that reconnects within this window continues its tasks. Values below `offline_timeout_sec` are clamped to it. |
| `runners.reconcile_interval_sec` | `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` | integer | `30` | How often (seconds) dispatched tasks are reconciled against runner liveness. |

## Teams

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `teams.invites_enabled` | `SEMAPHORE_TEAMS_INVITES_ENABLED` | boolean | | — |
| `teams.invite_type` | `SEMAPHORE_TEAMS_INVITE_TYPE` | string (`email`, `username`, `both`) | `username` | — |
| `teams.members_can_leave` | `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` | boolean | | — |

## Logging

See [Logs](/admin-guide/logs) for a task-oriented guide.

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `log.events.enabled` | `SEMAPHORE_EVENT_LOG_ENABLED` | boolean | | — |
| `log.events.format` | `SEMAPHORE_EVENT_LOG_FORMAT` | string (``, `json`) | | — |
| `log.events.logger` | `SEMAPHORE_EVENT_LOGGER` | rotating-file logger | | — |
| `log.tasks.enabled` | `SEMAPHORE_TASK_LOG_ENABLED` | boolean | | — |
| `log.tasks.format` | `SEMAPHORE_TASK_LOG_FORMAT` | string (``, `json`) | | — |
| `log.tasks.logger` | `SEMAPHORE_TASK_LOGGER` | rotating-file logger | | — |
| `log.tasks.result_logger` | `SEMAPHORE_TASK_RESULT_LOGGER` | rotating-file logger | | — |

### Rotating-file logger options

The `logger` and `result_logger` objects are natefinch/lumberjack rotating-file loggers. Their sub-keys have no individual environment variables; the corresponding parent variable takes the whole object as JSON.

| Option | Type | Description |
|--------|------|-------------|
| `filename` | string | — |
| `maxsize` | integer | Max megabytes before rotation. |
| `maxage` | integer | Max days to retain old log files. |
| `maxbackups` | integer | Max number of old log files to retain. |
| `localtime` | boolean | — |
| `compress` | boolean | — |

### Syslog

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `syslog.enabled` | `SEMAPHORE_SYSLOG_ENABLED` | boolean | | — |
| `syslog.network` | `SEMAPHORE_SYSLOG_NETWORK` | string | | tcp / udp / unix (empty = local). |
| `syslog.address` | `SEMAPHORE_SYSLOG_ADDRESS` | string | | — |
| `syslog.tag` | `SEMAPHORE_SYSLOG_TAG` | string | | — |
| `syslog.format` | `SEMAPHORE_SYSLOG_FORMAT` | string (``, `rfc5424`) | | — |

## Metrics

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `metrics.enabled` | `SEMAPHORE_METRICS_ENABLED` | boolean | | — |
| `metrics.username` | `SEMAPHORE_METRICS_USERNAME` | string | | — |
| `metrics.password` | `SEMAPHORE_METRICS_PASSWORD` | string | | Basic Auth password for the /api/metrics endpoint (sensitive). |

## Process hardening

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `process.user` | `SEMAPHORE_PROCESS_USER` | string | | — |
| `process.uid` | `SEMAPHORE_PROCESS_UID` | integer | | — |
| `process.chroot` | `SEMAPHORE_PROCESS_CHROOT` | string | | — |
| `process.gid` | `SEMAPHORE_PROCESS_GID` | integer | | — |
| `process.no_new_privs` | `SEMAPHORE_PROCESS_NO_NEW_PRIVS` | boolean | | — |
| `process.app_namespaces.user` | `SEMAPHORE_PROCESS_APP_NS_USER` | boolean | | Linux CLONE_NEW* flags applied to app runs. No-op on non-Linux. |
| `process.app_namespaces.mount` | `SEMAPHORE_PROCESS_APP_NS_MOUNT` | boolean | | — |
| `process.app_namespaces.pid` | `SEMAPHORE_PROCESS_APP_NS_PID` | boolean | | — |
| `process.app_namespaces.ipc` | `SEMAPHORE_PROCESS_APP_NS_IPC` | boolean | | — |
| `process.app_namespaces.uts` | `SEMAPHORE_PROCESS_APP_NS_UTS` | boolean | | — |

## High availability

See [High availability](/admin-guide/ha).

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | boolean | | — |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | string | | Cluster node id; auto-generated if empty. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | string | | — |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | integer | | — |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | string | | — |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | string | | Redis password (sensitive). |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | boolean | | — |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | boolean | | — |

## Subscription

Subscription settings for licensed features. See [License](/admin-guide/license).

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `subscription.key` | `SEMAPHORE_SUBSCRIPTION_KEY` | string | | Subscription key (sensitive). Setting this disables in-UI activation. |
| `subscription.key_file` | `SEMAPHORE_SUBSCRIPTION_KEY_FILE` | string | | — |
| `subscription.server_url` | `SEMAPHORE_SUBSCRIPTION_SERVER_URL` | string (URI) | `https://portal.semaphoreui.com/billing` | — |

## Debugging

| Option | Env variable | Type | Default | Description |
|--------|--------------|------|---------|-------------|
| `debugging.api_delay` | `SEMAPHORE_API_DELAY` | string | | Artificial delay applied to API responses (e.g. "200ms"). |
| `debugging.pprof_dump_dir` | `SEMAPHORE_PPROF_DUMP_DIR` | string | | — |

---

:::note
This page is generated from [`config.schema.yaml`](https://github.com/semaphoreui/semaphore/blob/develop/config.schema.yaml) in the Semaphore repository. The schema itself is kept in sync with the Go configuration structs (`util.ConfigType` in `util/config.go`) by the `semaphore-config-schema` skill; environment variable names come from the `env:` tags on those structs. To regenerate, update the schema first, then rebuild this page from it.
:::
