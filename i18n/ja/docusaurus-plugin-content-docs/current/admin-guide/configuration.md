# 設定

Semaphore は、いくつかの方法で設定できます。

* [オンライン設定ツール](https://semaphoreui.com/install) &mdash; 設定をオンラインで生成するための Web インターフェースです。
* [設定ファイル](/admin-guide/configuration/config-file) &mdash; Semaphore を設定するための主要かつ最も柔軟な方法です。
* [環境変数](/admin-guide/configuration/env-vars) &mdash; コンテナ環境やクラウドネイティブなデプロイに便利です。


## 設定オプション {#configuration-options}

利用可能な設定オプションの一覧です。

| 設定ファイルのオプション / 環境変数     | 説明                        |
| ----------------------- | --------------------------------------------------------- |
| **共通** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Git クライアントの種類。`cmd_git`(デフォルト)または `go_git` を指定できます。 |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | タスクが失敗するまでに git clone または pull を試行する回数。試行の間隔には指数バックオフ(1 秒、次に 2 秒、4 秒、… 最大 60 秒)が使用されます。デフォルト: `4`。`1` に設定すると再試行が無効になります。 |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | カスタム SSH 設定ファイルへのパス。デフォルト: `~/.ssh/config`。 |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | Web インターフェースを公開する TCP ポート。デフォルト: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | バインドアドレス(空 = すべてのインターフェース)。サーバーに複数のネットワークインターフェースがある場合に便利です。 |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | クローンされたリポジトリや生成されたファイルを保存するディレクトリへのパス。デフォルト: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | シークレット(たとえば Vault の token ファイル)を保存するディレクトリへのパス。デフォルト: `/tmp/semaphore`。`dirs.secrets` が未設定またはデフォルトのままの場合は、従来のトップレベルの `secrets_path` も引き続き使用できます。 |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | リポジトリを保存するディレクトリへのパス。 |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | SSH エージェントのソケットを保存するディレクトリへのパス。デフォルト: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | タスクの HOME 環境変数の設定方法を制御します。オプション: `template_dir`(デフォルト)、`project_home`、`user_home`。 |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | サーバー上で同時に実行できるタスクの最大数。デフォルト: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | タスクの最大実行時間(秒)。 |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | テンプレートごとにデータベースへ保存される最近のタスクの最大数。 |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | タスクのスケジュールおよび cron ジョブに使用されるタイムゾーン。デフォルト: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | OpenID プロバイダーの設定。複数の OpenID プロバイダーを指定できます。OpenID の設定の詳細は [OpenID](/admin-guide/openid) を参照してください。 |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | パスワードによるログインを拒否します。 |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | 管理者以外のユーザーにプロジェクトの作成を許可します。 |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | タスク実行に公開される環境変数を含む JSON マップ。 |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | タスク実行に転送されるホストの環境変数の JSON 配列。 |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | アプリの設定を含む JSON マップ。 |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | リモート runner を使用する場合に有効にします。 |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | runner がサーバーに登録する際に使用するブートストラップ token。 |
| **サブスクリプション** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | サブスクリプションキーまたは token。設定すると Web UI からのアクティベーションが無効になります。 |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | サブスクリプションキーまたは token ファイルへのパス。 |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | サブスクリプション / 課金サーバーの URL。デフォルト: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | 有効にすると、Semaphore はタスク実行ごとに短命な JWT を発行し、その公開鍵を `/.well-known/jwks.json` で公開します。 |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | 発行される JWT の `iss` クレームに出力される値。 |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | 発行されるタスク JWT のデフォルトの有効期間。Go の duration 形式(例: `30m`、`1h`)で指定します。デフォルト: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | テンプレートごとの JWT TTL の上限。Go の duration 形式で指定します。デフォルト: 24h |
| **Runner** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | runner 登録 token を含むファイルへのパス。 |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | runner の認証 token。`runner.token_file` とは同時に指定できません。 |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | runner 登録用の token ファイルへのパス。 |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | runner の秘密鍵ファイルへのパス。 |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | runner が 1 つのジョブを処理して終了します。動的な runner に便利です。 |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | runner を有効にします。 |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | runner 用の webhook URL。 |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | runner の名前。 |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | runner のタグの JSON 配列。 |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | runner で同時に実行できるタスクの最大数。デフォルト: 9999。 |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | runner が新しいジョブをサーバーにポーリングし、進捗を報告する間隔(秒)。デフォルト: 1。値を大きくするとリクエスト量が減りますが、ジョブの取得がわずかに遅くなります。 |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | runner を単一のプロジェクトに制限します。 |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | システムのトラストストアに加えて、Semaphore サーバーの証明書を検証するために使用する PEM バンドル。サーバーが自己署名証明書または内部 CA の証明書を使用している場合に設定します。 |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | サーバー証明書の検証を完全に無効にします。安全ではありません(MITM 攻撃に脆弱です)。テスト目的でのみ使用してください。 |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | runner の executor 設定全体(`type` とネストされた `docker` または `k8s` の設定)を含む JSON オブジェクト。executor ブロック全体を 1 つの環境変数で設定したい場合に使用します。 |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | runner が各タスクを実行するために使用する方式: `local`(デフォルト)、`k8s` または `docker`。 |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | kubeconfig ファイルへのパス。空 = クラスター内設定。 |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | 一時的なタスク Pod を作成する Namespace。デフォルト: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | ビルドコンテナのデフォルトのコンテナイメージ。デフォルト: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | git clone 用の init コンテナに使用するイメージ。デフォルト: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | タスク Pod を実行するサービスアカウント。デフォルト: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | 各 Pod に付与する imagePullSecrets のカンマ区切りリスト。 |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | executor が Pod の状態をポーリングする間隔(秒)。デフォルト: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Pod を削除する際の猶予期間(秒)。デフォルト: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | Docker デーモンの URL(`unix://`、`tcp://` または `npipe://`)。空 = 標準の環境(`DOCKER_HOST`)とプラットフォームのデフォルトソケット。 |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | `tcp://` 接続で TLS 証明書の検証を有効にします。 |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | 相互 TLS 用の ca.pem、cert.pem、key.pem を格納するディレクトリ。 |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | ビルドコンテナのデフォルトイメージ。デフォルト: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | 一時的な git clone コンテナに使用するイメージ。デフォルト: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | ビルドコンテナが参加する Docker ネットワーク。デフォルト: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | イメージの pull ポリシー: `always`、`if-not-present`(デフォルト)または `never`。 |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | 0 より大きい場合、ビルドコンテナの CPU を制限します(`--cpus` として渡されます)。 |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | 空でない場合、ビルドコンテナのメモリを制限します(例: `2g`)。 |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | コンテナの状態をポーリングする間隔(秒)。デフォルト: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | `docker stop` に渡すタイムアウト(秒)。デフォルト: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | ビルドコンテナを `--privileged` で実行します。危険です。デフォルトでは無効です。 |
| **Runners(サーバー側のフリート)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | この秒数以上ハートビートが途絶えた runner はオフラインと見なされます。その runner の「starting」状態のタスクは再割り当てされます。デフォルト: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | この秒数以上ハートビートが途絶えた runner の「running」状態のタスクは失敗として扱われます。`offline_timeout_sec` 未満の値はその値に切り上げられます。デフォルト: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | ディスパッチ済みのタスクを runner の生存状態と照合する間隔(秒)。デフォルト: 30 |
| **チーム** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | ユーザーがチームにメンバーを招待できるようにします。 |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | 招待の種類: `username`(デフォルト)、`email`、`both`。 |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | メンバーがチームから離脱できるようにします。 |
| **データベース** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | SQLite データベースファイルへのパス。   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | MySQL データベースのホスト。                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | MySQL データベース(スキーマ)名。       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL のユーザー名。                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | MySQL ユーザーのパスワード。              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Postgres データベースのホスト。             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Postgres データベース(スキーマ)名。    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres のユーザー名。                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Postgres ユーザーのパスワード。           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | `sqlite`(デフォルト)、`postgres` または `mysql` を指定できます。   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | データベース接続オプションを含む JSON マップ。 |
| **セキュリティ** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | データベースに保存されるアクセスキーの暗号化に使用する Base64 エンコードされたキー。詳細は [データベース暗号化リファレンス](/admin-guide/security#data-encryption) を参照してください。 |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | 従来の単一キー方式(ローテーションなし)で DB オプション(JWT 署名キー)を暗号化するために使用する Base64 エンコードされたキー。未設定の場合はアクセスキーが使用されます。 |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | Cookie の署名に使用する Base64 エンコードされた HMAC キー。 |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | Cookie の暗号化に使用する Base64 エンコードされたキー。 |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Semaphore をサブパスで使用したい場合に便利です。例: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore)。末尾に `/` を付けないでください。 |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Semaphore サーバーとの安全な通信のために TLS(HTTPS)を有効または無効にします。 |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | TLS 証明書ファイルへのパス。 |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | TLS 鍵ファイルへのパス。 |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | HTTP→HTTPS リダイレクトリスナーのアドレス(`host[:port]`)。`tls.http_redirect_port` とは同時に指定できません。 |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | HTTP トラフィックを HTTPS にリダイレクトするポート。`tls.http_redirect_addr` とは同時に指定できません。 |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | TOTP を使用した二要素認証を有効にします。 |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | TOTP 認証アプリに表示される発行者ラベル(Semaphore のタイトル)。 |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | ユーザーがリカバリーコードを使用して TOTP をリセットできるようにします。 |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | メールベースの多要素認証を有効にします。 |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | 外部(メールのみの)ユーザーとしてのログインを許可します。 |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | 初回ログイン時に外部ユーザーの作成を許可します。 |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | 許可するメールドメインの JSON 配列。 |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | OIDC で認証されたユーザーに対してメール MFA を無効にします。 |
| **暗号化** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | 暗号化キーリング(YAML または JSON)を保持する別ファイルへのパス。変更が監視され、編集内容はサーバーを再起動せずに適用されます。未設定の場合は、従来の `access_key_encryption` フィールドが使用されます。 |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | `keys_file` の変更をポーリングする間隔(`15s` のような Go の duration 形式)。`0` でポーリングが無効になります(SIGHUP による再読み込みは引き続き可能です)。デフォルト: 15s |
| **プロセス** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | ラップされたプロセス(Ansible、Terraform、OpenTofu など)を実行するユーザー。 |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ラップされたプロセス(Ansible、Terraform、OpenTofu など)を実行するユーザーの ID。 |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ラップされたプロセス(Ansible、Terraform、OpenTofu など)を実行するグループの ID。 |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | ラップされたプロセス用の chroot ディレクトリ。 |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | ラップされたプロセスが新しい権限を取得できないように `no_new_privs` フラグを設定します。 |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | アプリ実行の UID/GID を分離します(`CLONE_NEWUSER`)。Linux のみ。 |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | アプリ実行からシークレット用 tmpfs などのホストのマウントポイントを隠します(`CLONE_NEWNS`)。Linux のみ。 |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | アプリ実行からホストのプロセスを隠します(`CLONE_NEWPID`)。Linux のみ。 |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | アプリ実行の SysV IPC と POSIX メッセージキューを分離します(`CLONE_NEWIPC`)。Linux のみ。 |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | アプリ実行のホスト名とドメインを分離します(`CLONE_NEWUTS`)。Linux のみ。 |
| **メール** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | 送信者のメールアドレス。 |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | SMTP サーバーのホスト名。 |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | SMTP サーバーのポート。 |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | 暗号化されていない SMTP 接続を安全な暗号化接続にアップグレードする StartTLS を有効にします。 |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | SMTP サーバーとの通信に SSL または TLS 接続を使用します。 |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | 接続に使用する TLS の最小バージョン。 |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | SMTP サーバー認証用のユーザー名。 |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | SMTP サーバー認証用のパスワード。 |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | メールアラートを有効にするフラグ。 |
| **メッセンジャー** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Telegram へのアラート送信を有効にするには True に設定します。`telegram_chat` および `telegram_token` と組み合わせて使用します。 |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | アラートの送信先チャットの Chat ID を設定します。詳細は [Telegram 通知の設定](/admin-guide/notifications/telegram#chat-id) を参照してください。 |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | アラートのペイロードを受け取るボットの Authorization Token を設定します。詳細は [Telegram 通知の設定](/admin-guide/notifications/telegram#bot-setup) を参照してください。 |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Slack へのアラート送信を有効にするには True に設定します。`slack_url` と組み合わせて使用します。                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | Slack の webhook URL。Semaphore はこの URL に Slack 形式の JSON アラートを POST します。    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Microsoft Teams アラートを有効にするフラグ。 |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | Microsoft Teams の webhook URL。 |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Rocket.Chat へのアラート送信を有効にするには True に設定します。`rocketchat_url` と組み合わせて使用します。v2.9.56 以降で利用可能です。  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | Rocket.Chat の webhook URL。Semaphore はこの URL に Rocket.Chat 形式の JSON アラートを POST します。v2.9.56 以降で利用可能です。 |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Dingtalk アラートを有効にします。 |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | Dingtalk メッセンジャーの webhook URL。 |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Gotify アラートを有効にします。 |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | Gotify サーバーの URL。 |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Gotify サーバーの token。 |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | LDAP 認証を有効にするフラグ。 |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | LDAP 接続の TLS を有効または無効にするフラグ。 |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | 認証のために LDAP サーバーへバインドする際に使用する識別名(DN)。 |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | 認証のために LDAP サーバーへバインドする際に使用するパスワード。 |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | LDAP サーバーのホスト名とポート(例: ldap-server.com:1389)。 |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | LDAP ディレクトリでユーザーを検索する際に使用するベース識別名(DN)(例: dc=example,dc=org)。 |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | LDAP ディレクトリでユーザーを検索する際に使用するフィルター(例: (&(objectClass=inetOrgPerson)(uid=%s)))。 |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | ユーザー認証で識別名(DN)のマッピングとして使用する LDAP 属性。 |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | ユーザー認証でメールアドレスのマッピングとして使用する LDAP 属性。 |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | ユーザー認証でユーザー ID(UID)のマッピングとして使用する LDAP 属性。 |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | ユーザー認証で共通名(CN)のマッピングとして使用する LDAP 属性。 |
| **ロギング** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | イベントログの形式。`json` またはテキストの場合は空を指定します。 |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | イベントログを有効または無効にします。 |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | イベントロガーの設定を含む JSON マップ。 |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | タスクログの形式。`json` またはテキストの場合は空を指定します。 |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | タスクログを有効または無効にします。 |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | タスクロガーの設定を含む JSON マップ。 |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | タスク結果ロガーの設定を含む JSON マップ。 |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | 設定した syslog サーバーへのログ書き込みを有効または無効にします。 |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Syslog サーバーへの接続に使用するプロトコル: `udp` または `tcp`。 |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Syslog サーバーのホスト名とポート。例: `localhost:514`。 |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Syslog サーバー上で Semaphore UI のレコードを識別するために使用するタグ。 |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Syslog メッセージの形式。`rfc5424` またはデフォルトの場合は空を指定します。 |
| **デバッグ** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | API レスポンスに遅延を追加します(デバッグ目的)。 |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | pprof ダンプファイル用のディレクトリ。 |
| **高可用性(HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | 高可用性(HA)モードを有効にします。 |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | HA ノードの一意の識別子。 |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | HA に使用する Redis サーバーのアドレス。例: `localhost:6379`。 |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Redis のデータベース番号。 |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Redis サーバーのパスワード。 |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Redis サーバーのユーザー名。 |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Redis 接続の TLS を有効にします。 |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Redis 接続の TLS 証明書検証をスキップします。 |

## よくある質問 {#frequently-asked-questions}

### 1. Semaphore UI の公開 URL を設定するには {#1-how-to-configure-a-public-url-for-semaphore-ui}

Semaphore の前段に nginx などの Web サーバーを使用する場合は、設定オプション `web_host` を指定する必要があります。

たとえば、サーバー上で Semaphore へリクエストをプロキシする NGINX を設定したとします。

サーバーのアドレスが `https://example.com` で、`https://example.com/semaphore` へのすべてのリクエストを Semaphore にプロキシしているとします。

この場合、`web_host` は `https://example.com/semaphore` になります。
