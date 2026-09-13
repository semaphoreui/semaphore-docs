# 配置

Semaphore 可以通过以下几种方式进行配置：

* [在线配置生成器](https://semaphoreui.com/install) &mdash; 用于在线生成配置的 Web 界面。
* [配置文件](/admin-guide/configuration/config-file) &mdash; 配置 Semaphore 的主要且最灵活的方式。
* [环境变量](/admin-guide/configuration/env-vars) &mdash; 适用于容器化或云原生部署。


## 配置选项 {#configuration-options}

可用配置选项的完整列表：

| 配置文件选项 / 环境变量     | 说明                        |
| ----------------------- | --------------------------------------------------------- |
| **通用** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Git 客户端类型。可以是 `cmd_git`（默认）或 `go_git`。 |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | git clone 或 pull 在任务失败前的尝试次数。两次尝试之间采用指数退避（1 秒，然后 2 秒、4 秒……最多 60 秒）。默认：`4`。设为 `1` 可禁用重试。 |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | 自定义 SSH 配置文件的路径。默认：`~/.ssh/config`。 |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | Web 界面监听的 TCP 端口。默认：`:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | 绑定地址（为空 = 所有网络接口）。当服务器有多个网络接口时很有用。 |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | 存放克隆的仓库和生成文件的目录路径。默认：/tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | 存放机密数据（例如 Vault 令牌文件）的目录路径。默认：`/tmp/semaphore`。当 `dirs.secrets` 未设置或保持默认值时，仍接受旧版的顶层 `secrets_path`。 |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | 存放仓库的目录路径。 |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | 存放 SSH agent 套接字的目录路径。默认：/tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | 控制任务的 HOME 环境变量如何设置。可选值：`template_dir`（默认）、`project_home`、`user_home`。 |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | 服务器上可并行运行的最大任务数。默认：9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | 任务的最长持续时间（秒）。 |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | 每个模板在数据库中保留的最近任务的最大数量。 |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | 用于计划任务和 cron 作业的时区。默认：UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | OpenID 提供方设置。可以配置多个 OpenID 提供方。关于 OpenID 配置的更多信息，请阅读 [OpenID](/admin-guide/openid)。 |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | 禁止密码登录。 |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | 允许非管理员用户创建项目。 |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | 包含暴露给任务运行的环境变量的 JSON 映射。 |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | 将被转发到任务运行中的主机环境变量的 JSON 数组。 |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | 包含应用配置的 JSON 映射。 |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | 启用以使用远程运行器。 |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | 运行器向服务器注册时使用的引导令牌。 |
| **订阅** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | 订阅密钥或令牌。设置后将禁用通过 Web 界面激活。 |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | 订阅密钥或令牌文件的路径。 |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | 订阅/计费服务器 URL。默认：https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | 启用后，Semaphore 会为每次任务运行签发一个短期 JWT，并通过 `/.well-known/jwks.json` 公开其公钥。 |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | 签发的 JWT 中 `iss` 声明的值。 |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | 签发的任务 JWT 的默认有效期，采用 Go 时长格式（例如 `30m`、`1h`）。默认：1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | 每个模板 JWT TTL 的硬性上限，采用 Go 时长格式。默认：24h |
| **运行器** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | 包含运行器注册令牌的文件路径。 |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | 运行器认证令牌。与 `runner.token_file` 互斥。 |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | 用于运行器注册的令牌文件路径。 |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | 运行器私钥文件的路径。 |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | 运行器只处理一个作业然后退出。适用于动态运行器。 |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | 启用运行器。 |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | 运行器的 Webhook URL。 |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | 运行器名称。 |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | 运行器标签的 JSON 数组。 |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | 运行器可并行运行的最大任务数。默认：9999。 |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | 运行器向服务器轮询新作业并上报进度的频率（秒）。默认：1。较大的值可减少请求量，但作业拾取会略微变慢。 |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | 将运行器限制到单个项目。 |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | 在系统信任库之外，用于验证 Semaphore 服务器证书的 PEM 证书包。当服务器使用自签名证书或内部 CA 证书时设置。 |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | 完全禁用服务器证书验证。不安全（易受中间人攻击）——仅用于测试。 |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | 包含完整运行器执行器配置的 JSON 对象（`type` 以及嵌套的 `docker` 或 `k8s` 设置）。当你希望通过单个环境变量设置整个执行器配置块时使用。 |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | 运行器执行每个任务所用的策略：`local`（默认）、`k8s` 或 `docker`。 |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | kubeconfig 文件的路径。为空 = 使用集群内配置。 |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | 创建临时任务 Pod 的命名空间。默认：semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | 构建容器的默认镜像。默认：semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | 用于 git-clone init 容器的镜像。默认：semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | 任务 Pod 运行所用的服务账号。默认：default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | 附加到每个 Pod 的 imagePullSecrets 列表，以逗号分隔。 |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | 执行器轮询 Pod 状态的频率（秒）。默认：3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | 删除 Pod 时的宽限期（秒）。默认：30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | Docker 守护进程 URL（`unix://`、`tcp://` 或 `npipe://`）。为空 = 使用标准环境（`DOCKER_HOST`）和平台默认套接字。 |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | 为 `tcp://` 连接启用 TLS 证书验证。 |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | 存放用于双向 TLS 的 ca.pem、cert.pem 和 key.pem 的目录。 |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | 构建容器的默认镜像。默认：semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | 用于临时 git-clone 容器的镜像。默认：semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | 构建容器加入的 Docker 网络。默认：bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | 镜像拉取策略：`always`、`if-not-present`（默认）或 `never`。 |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | 大于 0 时，限制构建容器的 CPU（作为 `--cpus` 传递）。 |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | 非空时，限制构建容器的内存（例如 `2g`）。 |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | 轮询容器状态的频率（秒）。默认：2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | 传递给 `docker stop` 的超时时间（秒）。默认：30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | 以 `--privileged` 运行构建容器。危险；默认关闭。 |
| **运行器（服务器端运行器集群）** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | 心跳过期时间（秒），超过后运行器被视为离线。其处于“starting”状态的任务会被重新分配。默认：120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | 心跳过期时间（秒），超过后运行器处于“running”状态的任务会被标记为失败。小于 `offline_timeout_sec` 的值会被提升至该值。默认：420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | 已分派任务与运行器存活状态进行核对的频率（秒）。默认：30 |
| **团队** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | 允许用户邀请成员加入团队。 |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | 邀请类型：`username`（默认）、`email`、`both`。 |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | 允许成员退出团队。 |
| **数据库** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | SQLite 数据库文件的路径。   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | MySQL 数据库主机。                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | MySQL 数据库（schema）名称。       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL 用户名。                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | MySQL 用户密码。              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Postgres 数据库主机。             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Postgres 数据库（schema）名称。    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres 用户名。                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Postgres 用户密码。           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | 可以是 `sqlite`（默认）、`postgres` 或 `mysql`。   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | 包含数据库连接选项的 JSON 映射。 |
| **安全** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | 用于加密数据库中存储的访问密钥的 Base64 编码密钥。更多信息请阅读[数据库加密参考](/admin-guide/security#data-encryption)。 |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | 使用旧版单密钥方案（无轮换）加密数据库选项（JWT 签名密钥）的 Base64 编码密钥。未设置时回退为访问密钥加密密钥。 |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | 用于签名 Cookie 的 Base64 编码 HMAC 密钥。 |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | 用于加密 Cookie 的 Base64 编码密钥。 |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | 当你希望通过子路径访问 Semaphore 时很有用，例如：[http://yourdomain.com/semaphore](http://yourdomain.com/semaphore)。不要添加结尾的 `/`。 |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | 启用或禁用 TLS（HTTPS），以便与 Semaphore 服务器进行安全通信。 |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | TLS 证书文件的路径。 |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | TLS 密钥文件的路径。 |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | HTTP→HTTPS 重定向监听器的地址（`host[:port]`）。与 `tls.http_redirect_port` 互斥。 |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | 将 HTTP 流量重定向到 HTTPS 的端口。与 `tls.http_redirect_addr` 互斥。 |
| <br />`auth.max_session_life_hours` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <hr /> `SEMAPHORE_AUTH_MAX_SESSION_LIFE_HOURS` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <br /><br /> | 登录会话的绝对有效期（小时），从登录时开始计算。超过后用户必须重新登录，即使会话最近仍处于活动状态。`0`（默认）表示没有绝对限制；此时会话仅在 7 天无活动后过期。 |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | 启用基于 TOTP 的双因素认证。 |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | 在 TOTP 身份验证器应用中显示的签发者标签（Semaphore 标题）。 |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | 允许用户使用恢复码重置 TOTP。 |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | 启用基于邮件的多因素认证。 |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | 允许以外部（仅邮箱）用户身份登录。 |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | 允许在首次登录时创建外部用户。 |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | 允许的邮箱域名的 JSON 数组。 |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | 对通过 OIDC 认证的用户禁用邮件 MFA。 |
| **加密** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | 存放加密密钥环的独立文件（YAML 或 JSON）的路径。该文件会被监视变更——修改后无需重启服务器即可生效。未设置时，使用旧版的 `access_key_encryption` 字段。 |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | 轮询 `keys_file` 变更的频率（Go 时长格式，例如 `15s`）。`0` 表示禁用轮询（SIGHUP 仍会强制重新加载）。默认：15s |
| **进程** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | 运行被包装进程（如 Ansible、Terraform 或 OpenTofu）所用的用户。 |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | 运行被包装进程（如 Ansible、Terraform 或 OpenTofu）所用用户的 ID。 |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | 运行被包装进程（如 Ansible、Terraform 或 OpenTofu）所用用户组的 ID。 |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | 被包装进程的 chroot 目录。 |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | 设置 `no_new_privs` 标志，使被包装进程无法获得新的权限。 |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | 为应用运行隔离 UID/GID（`CLONE_NEWUSER`）。仅限 Linux。 |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | 为应用运行隐藏主机挂载点，例如机密数据 tmpfs（`CLONE_NEWNS`）。仅限 Linux。 |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | 对应用运行隐藏主机进程（`CLONE_NEWPID`）。仅限 Linux。 |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | 为应用运行隔离 SysV IPC 和 POSIX 消息队列（`CLONE_NEWIPC`）。仅限 Linux。 |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | 为应用运行隔离主机名和域名（`CLONE_NEWUTS`）。仅限 Linux。 |
| **邮件** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | 发件人的邮箱地址。 |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | SMTP 服务器主机名。 |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | SMTP 服务器端口。 |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | 启用 StartTLS，将未加密的 SMTP 连接升级为安全的加密连接。 |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | 使用 SSL 或 TLS 连接与 SMTP 服务器通信。 |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | 连接所用的最低 TLS 版本。 |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | SMTP 服务器认证的用户名。 |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | SMTP 服务器认证的密码。 |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | 启用邮件告警的标志。 |
| **即时通讯工具** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | 设为 True 以启用向 Telegram 推送告警。应与 `telegram_chat` 和 `telegram_token` 一起使用。 |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | 设为接收告警的聊天的 Chat ID。更多信息请阅读 [Telegram 通知设置](/admin-guide/notifications/telegram#chat-id) |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | 设为接收告警内容的机器人的授权令牌。更多信息请阅读 [Telegram 通知设置](/admin-guide/notifications/telegram#bot-setup) |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | 设为 True 以启用向 Slack 推送告警。应与 `slack_url` 一起使用                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | Slack Webhook URL。Semaphore 会使用它向该 URL 以 POST 方式发送 Slack 格式的 JSON 告警。    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | 启用 Microsoft Teams 告警的标志。 |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | Microsoft Teams Webhook URL。 |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | 设为 True 以启用向 Rocket.Chat 推送告警。应与 `rocketchat_url` 一起使用。自 v2.9.56 起可用。  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | Rocket.Chat Webhook URL。Semaphore 会使用它向该 URL 以 POST 方式发送 Rocket.Chat 格式的 JSON 告警。自 v2.9.56 起可用。 |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | 启用 DingTalk 告警。 |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | DingTalk 即时通讯 Webhook URL。 |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | 启用 Gotify 告警。 |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | Gotify 服务器 URL。 |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Gotify 服务器令牌。 |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | 启用 LDAP 认证的标志。 |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | 启用或禁用 LDAP 连接 TLS 的标志。 |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | 用于绑定到 LDAP 服务器进行认证的专有名称（DN）。 |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | 用于绑定到 LDAP 服务器进行认证的密码。 |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | LDAP 服务器的主机名和端口（例如 ldap-server.com:1389）。 |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | 在 LDAP 目录中搜索用户所用的基础专有名称（DN）（例如 dc=example,dc=org）。 |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | 在 LDAP 目录中搜索用户所用的过滤器（例如 (&(objectClass=inetOrgPerson)(uid=%s))）。 |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | 用户认证时用作专有名称（DN）映射的 LDAP 属性。 |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | 用户认证时用作邮箱地址映射的 LDAP 属性。 |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | 用户认证时用作用户 ID（UID）映射的 LDAP 属性。 |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | 用户认证时用作通用名称（CN）映射的 LDAP 属性。 |
| **日志** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | 事件日志格式。可以是 `json`，或留空表示文本格式。 |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | 启用或禁用事件日志。 |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | 包含事件日志记录器配置的 JSON 映射。 |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | 任务日志格式。可以是 `json`，或留空表示文本格式。 |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | 启用或禁用任务日志。 |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | 包含任务日志记录器配置的 JSON 映射。 |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | 包含任务结果日志记录器配置的 JSON 映射。 |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | 启用或禁用将日志写入已配置的 syslog 服务器。 |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | 连接 Syslog 服务器所用的协议：`udp` 或 `tcp`。 |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Syslog 服务器的主机名和端口。示例：`localhost:514`。 |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | 用于在 Syslog 服务器上标记 Semaphore UI 记录的标签。 |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Syslog 消息的格式。可以是 `rfc5424`，或留空表示默认格式。 |
| **调试** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | 为 API 响应添加延迟（用于调试）。 |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | pprof 转储文件的目录。 |
| **高可用（HA）** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | 启用高可用（HA）模式。 |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | HA 节点的唯一标识符。 |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | 用于 HA 的 Redis 服务器地址。示例：`localhost:6379`。 |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Redis 数据库编号。 |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Redis 服务器的密码。 |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Redis 服务器的用户名。 |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | 为 Redis 连接启用 TLS。 |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | 跳过 Redis 连接的 TLS 证书验证。 |

## 常见问题 {#frequently-asked-questions}

### 1. 如何为 Semaphore UI 配置公开 URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

如果你在 Semaphore 前面使用 nginx 或其他 Web 服务器，则应提供配置选项 `web_host`。

例如，你在服务器上配置了 NGINX，将请求代理到 Semaphore。

服务器地址为 `https://example.com`，并且你将所有发往 `https://example.com/semaphore` 的请求代理到 Semaphore。

那么你的 `web_host` 应为 `https://example.com/semaphore`。
