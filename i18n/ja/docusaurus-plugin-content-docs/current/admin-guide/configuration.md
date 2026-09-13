# 設定

Semaphore は、いくつかの方法で設定できます。

* [オンライン設定ツール](https://semaphoreui.com/install) &mdash; オンラインで設定を生成する Web インターフェースです。
* [設定ファイル](/admin-guide/configuration/config-file) &mdash; Semaphore を設定する主要かつ最も柔軟な方法です。
* [環境変数](/admin-guide/configuration/env-vars) &mdash; コンテナー環境やクラウドネイティブなデプロイに便利です。


## 設定オプション {#configuration-options}

利用可能な設定オプションの一覧です。

| 設定ファイルのオプション / 環境変数     | 説明                        |
| ----------------------- | --------------------------------------------------------- |
| **共通** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Git クライアントの種類です。`cmd_git`（既定）または `go_git` を指定できます。 |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | タスクが失敗するまでに git clone または pull を試行する回数です。試行の間には指数バックオフ（1 秒、次に 2 秒、4 秒、… 最大 60 秒）を使用します。既定値: `4`。再試行を無効にするには `1` を設定します。 |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | カスタム SSH 設定ファイルのパスです。既定値: `~/.ssh/config`。 |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | Web インターフェースを公開する TCP ポートです。既定値: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | バインドアドレスです（空の場合はすべてのインターフェース）。サーバーに複数のネットワークインターフェースがある場合に便利です。 |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | クローンしたリポジトリと生成されたファイルを保存するディレクトリのパスです。既定値: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | シークレット（たとえば Vault のトークンファイル）を保存するディレクトリのパスです。既定値: `/tmp/semaphore`。`dirs.secrets` が未設定または既定値のままの場合、従来のトップレベルの `secrets_path` も引き続き受け付けられます。 |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | リポジトリを保存するディレクトリのパスです。 |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | SSH エージェントのソケットを保存するディレクトリのパスです。既定値: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | タスクに対して HOME 環境変数をどのように設定するかを制御します。選択肢: `template_dir`（既定）、`project_home`、`user_home`。 |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | サーバー上で並列に実行できるタスクの最大数です。既定値: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | タスクの最大実行時間（秒）です。 |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | テンプレートごとにデータベースに保存される最近のタスクの最大数です。 |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | タスクと cron ジョブのスケジュールに使用するタイムゾーンです。既定値: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | OpenID プロバイダーの設定です。複数の OpenID プロバイダーを指定できます。OpenID の設定の詳細は [OpenID](/admin-guide/openid) を参照してください。 |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | パスワードによるログインを拒否します。 |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | 管理者以外のユーザーにプロジェクトの作成を許可します。 |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | タスクの実行に公開される環境変数を含む JSON マップです。 |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | タスクの実行に転送されるホストの環境変数の JSON 配列です。 |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | アプリの設定を含む JSON マップです。 |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | リモートランナーを使用する場合に有効にします。 |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | ランナーがサーバーに登録する際に使用するブートストラップトークンです。 |
| **サブスクリプション** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | サブスクリプションのキーまたはトークンです。設定すると、Web UI からのアクティベーションが無効になります。 |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | サブスクリプションのキーまたはトークンのファイルへのパスです。 |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | サブスクリプション／課金サーバーの URL です。既定値: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | 有効にすると、Semaphore はタスクの実行ごとに短命の JWT を発行し、その公開鍵を `/.well-known/jwks.json` で公開します。 |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | 発行される JWT の `iss` クレームに設定される値です。 |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | 発行されるタスク JWT の既定の有効期間です。Go の duration 形式（例: `30m`、`1h`）で指定します。既定値: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | テンプレートごとの JWT TTL の上限です。Go の duration 形式で指定します。既定値: 24h |
| **ランナー** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | ランナーの登録トークンを含むファイルへのパスです。 |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | ランナーの認証トークンです。`runner.token_file` とは排他的です。 |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | ランナー登録用のトークンファイルへのパスです。 |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | ランナーの秘密鍵ファイルへのパスです。 |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | ランナーが 1 つのジョブを処理して終了します。動的なランナーに便利です。 |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | ランナーを有効にします。 |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | ランナーの Webhook URL です。 |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | ランナーの名前です。 |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | ランナーのタグの JSON 配列です。 |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | ランナーが並列に実行するタスクの最大数です。既定値: 9999。 |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | ランナーが新しいジョブを取得し進捗を報告するためにサーバーをポーリングする間隔（秒）です。既定値: 1。値を大きくするとリクエスト数は減りますが、ジョブの取得がわずかに遅くなります。 |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | ランナーを 1 つのプロジェクトに限定します。 |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | システムのトラストストアに加えて、Semaphore サーバーの証明書を検証するために使用する PEM バンドルです。サーバーが自己署名証明書または社内 CA の証明書を使用している場合に設定します。 |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | サーバー証明書の検証を完全に無効にします。安全ではありません（中間者攻撃に対して脆弱です）。テスト時のみ使用してください。 |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | ランナーのエグゼキューター設定全体（`type` と、入れ子になった `docker` または `k8s` の設定）を含む JSON オブジェクトです。エグゼキューターのブロック全体を 1 つの環境変数で設定したい場合に使用します。 |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | ランナーが各タスクを実行する際の方式です。`local`（既定）、`k8s`、`docker` のいずれかです。 |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | kubeconfig ファイルへのパスです。空の場合はクラスター内設定を使用します。 |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | 一時的なタスク Pod を作成する名前空間です。既定値: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | ビルドコンテナーの既定のコンテナーイメージです。既定値: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | git clone を行う init コンテナーに使用するイメージです。既定値: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | タスク Pod が実行されるサービスアカウントです。既定値: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | 各 Pod に付与する imagePullSecrets のカンマ区切りの一覧です。 |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | エグゼキューターが Pod の状態をポーリングする間隔（秒）です。既定値: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Pod を削除する際の猶予期間（秒）です。既定値: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | Docker デーモンの URL（`unix://`、`tcp://`、`npipe://`）です。空の場合は標準の環境変数（`DOCKER_HOST`）とプラットフォーム既定のソケットを使用します。 |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | `tcp://` 接続で TLS 証明書の検証を有効にします。 |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | 相互 TLS 用の ca.pem、cert.pem、key.pem を格納するディレクトリです。 |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | ビルドコンテナーの既定のイメージです。既定値: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | git clone を行う一時コンテナーに使用するイメージです。既定値: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | ビルドコンテナーが参加する Docker ネットワークです。既定値: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | イメージの取得ポリシーです。`always`、`if-not-present`（既定）、`never` のいずれかです。 |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | 0 より大きい場合、ビルドコンテナーの CPU を制限します（`--cpus` として渡されます）。 |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | 空でない場合、ビルドコンテナーのメモリを制限します（例: `2g`）。 |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | コンテナーの状態をポーリングする間隔（秒）です。既定値: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | `docker stop` に渡すタイムアウト（秒）です。既定値: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | ビルドコンテナーを `--privileged` で実行します。危険なため、既定では無効です。 |
| **ランナー（サーバー側のフリート）** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | ハートビートが古くなってからランナーをオフラインと判断するまでの時間（秒）です。そのランナーの「開始中」のタスクは再割り当てされます。既定値: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | ハートビートが古くなってからランナーの「実行中」のタスクを失敗させるまでの時間（秒）です。`offline_timeout_sec` より小さい値は、その値に切り上げられます。既定値: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | ディスパッチ済みのタスクをランナーの稼働状況と照合する間隔（秒）です。既定値: 30 |
| **チーム** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | ユーザーがチームにメンバーを招待できるようにします。 |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | 招待の種類です。`username`（既定）、`email`、`both` のいずれかです。 |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | メンバーがチームから離脱できるようにします。 |
| **データベース** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | SQLite データベースファイルへのパスです。   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | MySQL データベースのホストです。                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | MySQL データベース（スキーマ）の名前です。       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL のユーザー名です。                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | MySQL ユーザーのパスワードです。              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Postgres データベースのホストです。             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Postgres データベース（スキーマ）の名前です。    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres のユーザー名です。                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Postgres ユーザーのパスワードです。           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | `sqlite`（既定）、`postgres`、`mysql` を指定できます。   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | データベース接続のオプションを含む JSON マップです。 |
| **セキュリティ** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | データベースに保存されるアクセスキーの暗号化に使用する Base64 エンコードされたキーです。詳細は[データベース暗号化のリファレンス](/admin-guide/security#data-encryption)を参照してください。 |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | 旧来の単一キー方式（ローテーションなし）で DB オプション（JWT の署名鍵）を暗号化するために使用する Base64 エンコードされたキーです。未設定の場合はアクセスキーが使用されます。 |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | クッキーの署名に使用する Base64 エンコードされた HMAC キーです。 |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | クッキーの暗号化に使用する Base64 エンコードされたキーです。 |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Semaphore をサブパスで使用したい場合に便利です。例: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore)。末尾に `/` を付けないでください。 |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Semaphore サーバーとの安全な通信のために TLS (HTTPS) を有効または無効にします。 |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | TLS 証明書ファイルへのパスです。 |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | TLS キーファイルへのパスです。 |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | HTTP から HTTPS へリダイレクトするリスナーのアドレス（`host[:port]`）です。`tls.http_redirect_port` とは排他的です。 |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | HTTP トラフィックを HTTPS へリダイレクトするポートです。`tls.http_redirect_addr` とは排他的です。 |
| <br />`auth.max_session_life_hours` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <hr /> `SEMAPHORE_AUTH_MAX_SESSION_LIFE_HOURS` ![Static Badge](https://img.shields.io/badge/v2.20.0-red) <br /><br /> | ログインからの経過時間で数えた、ログインセッションの絶対的な有効期間（時間）です。これを超えると、最近までセッションが使用されていた場合でもユーザーは再度ログインする必要があります。`0`（既定）は絶対的な上限なしを意味し、その場合セッションは 7 日間操作がなかったときにのみ期限切れになります。 |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | TOTP を使用した 2 要素認証を有効にします。 |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | TOTP の認証アプリに表示される発行者のラベル（Semaphore のタイトル）です。 |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | リカバリーコードを使用して TOTP をリセットできるようにします。 |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | メールベースの多要素認証を有効にします。 |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | 外部（メールのみの）ユーザーとしてのログインを許可します。 |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | 初回ログイン時に外部ユーザーを作成できるようにします。 |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | 許可するメールドメインの JSON 配列です。 |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | OIDC で認証されたユーザーに対してメール MFA を無効にします。 |
| **暗号化** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | 暗号化キーリングを保持する別ファイル（YAML または JSON）へのパスです。変更は監視され、サーバーを再起動せずに適用されます。未設定の場合は、従来の `access_key_encryption` フィールドが使用されます。 |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | `keys_file` の変更をポーリングする間隔です（`15s` のような Go の duration 形式）。`0` でポーリングを無効にします（SIGHUP を送ると引き続き再読み込みが強制されます）。既定値: 15s |
| **プロセス** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | ラップされたプロセス（Ansible、Terraform、OpenTofu など）を実行するユーザーです。 |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | ラップされたプロセス（Ansible、Terraform、OpenTofu など）を実行するユーザーの ID です。 |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | ラップされたプロセス（Ansible、Terraform、OpenTofu など）を実行するグループの ID です。 |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | ラップされたプロセスの chroot ディレクトリです。 |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | `no_new_privs` フラグを設定して、ラップされたプロセスが新しい権限を獲得できないようにします。 |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | アプリの実行で UID/GID を分離します（`CLONE_NEWUSER`）。Linux のみ。 |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | アプリの実行からシークレットの tmpfs などのホストのマウントポイントを隠します（`CLONE_NEWNS`）。Linux のみ。 |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | アプリの実行からホストのプロセスを隠します（`CLONE_NEWPID`）。Linux のみ。 |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | アプリの実行で SysV IPC と POSIX メッセージキューを分離します（`CLONE_NEWIPC`）。Linux のみ。 |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | アプリの実行でホスト名とドメインを分離します（`CLONE_NEWUTS`）。Linux のみ。 |
| **メール** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | 送信者のメールアドレスです。 |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | SMTP サーバーのホスト名です。 |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | SMTP サーバーのポートです。 |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | StartTLS を有効にして、暗号化されていない SMTP 接続を安全な暗号化接続へ切り替えます。 |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | SMTP サーバーとの通信に SSL または TLS 接続を使用します。 |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | 接続に使用する TLS の最小バージョンです。 |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | SMTP サーバー認証のユーザー名です。 |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | SMTP サーバー認証のパスワードです。 |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | メールアラートを有効にするフラグです。 |
| **メッセンジャー** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Telegram へのアラート送信を有効にするには True を設定します。`telegram_chat` と `telegram_token` と組み合わせて使用してください。 |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | アラートの送信先チャットのチャット ID を設定します。詳細は [Telegram 通知の設定](/admin-guide/notifications/telegram#chat-id)を参照してください。 |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | アラートのペイロードを受け取るボットの認証トークンを設定します。詳細は [Telegram 通知の設定](/admin-guide/notifications/telegram#bot-setup)を参照してください。 |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Slack へのアラート送信を有効にするには True を設定します。`slack_url` と組み合わせて使用してください。                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | Slack の Webhook URL です。Semaphore はこの URL に Slack 形式の JSON アラートを POST します。    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Microsoft Teams のアラートを有効にするフラグです。 |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | Microsoft Teams の Webhook URL です。 |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Rocket.Chat へのアラート送信を有効にするには True を設定します。`rocketchat_url` と組み合わせて使用してください。v2.9.56 以降で利用できます。  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | Rocket.Chat の Webhook URL です。Semaphore はこの URL に Rocket.Chat 形式の JSON アラートを POST します。v2.9.56 以降で利用できます。 |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | DingTalk のアラートを有効にします。 |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | DingTalk メッセンジャーの Webhook URL です。 |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Gotify のアラートを有効にします。 |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | Gotify サーバーの URL です。 |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Gotify サーバーのトークンです。 |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | LDAP 認証を有効にするフラグです。 |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | LDAP 接続で TLS を有効または無効にするフラグです。 |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | 認証のために LDAP サーバーへバインドする際に使用する識別名 (DN) です。 |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | 認証のために LDAP サーバーへバインドする際に使用するパスワードです。 |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | LDAP サーバーのホスト名とポートです（例: ldap-server.com:1389）。 |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | LDAP ディレクトリでユーザーを検索する際のベース識別名 (DN) です（例: dc=example,dc=org）。 |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | LDAP ディレクトリでユーザーを検索する際に使用するフィルターです（例: (&(objectClass=inetOrgPerson)(uid=%s))）。 |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | ユーザー認証で識別名 (DN) のマッピングとして使用する LDAP 属性です。 |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | ユーザー認証でメールアドレスのマッピングとして使用する LDAP 属性です。 |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | ユーザー認証でユーザー ID (UID) のマッピングとして使用する LDAP 属性です。 |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | ユーザー認証で一般名 (CN) のマッピングとして使用する LDAP 属性です。 |
| **ロギング** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | イベントログの形式です。`json` またはテキストの場合は空を指定できます。 |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | イベントのロギングを有効または無効にします。 |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | イベントロガーの設定を含む JSON マップです。 |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | タスクログの形式です。`json` またはテキストの場合は空を指定できます。 |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | タスクのロギングを有効または無効にします。 |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | タスクロガーの設定を含む JSON マップです。 |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | タスク結果ロガーの設定を含む JSON マップです。 |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | 設定した syslog サーバーへのログ書き込みを有効または無効にします。 |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Syslog サーバーへの接続に使用するプロトコルです。`udp` または `tcp` です。 |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Syslog サーバーのホスト名とポートです。例: `localhost:514`。 |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Syslog サーバー上で Semaphore UI のレコードを示すために使用するタグです。 |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Syslog メッセージの形式です。`rfc5424` または既定の場合は空を指定できます。 |
| **デバッグ** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | API のレスポンスに遅延を追加します（デバッグ用）。 |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | pprof のダンプファイルを保存するディレクトリです。 |
| **高可用性 (HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | 高可用性 (HA) モードを有効にします。 |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | HA ノードの一意の識別子です。 |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | HA に使用する Redis サーバーのアドレスです。例: `localhost:6379`。 |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Redis のデータベース番号です。 |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Redis サーバーのパスワードです。 |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Redis サーバーのユーザー名です。 |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Redis 接続で TLS を有効にします。 |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Redis 接続で TLS 証明書の検証をスキップします。 |

## よくある質問 {#frequently-asked-questions}

### 1. Semaphore UI の公開 URL を設定する方法 {#1-how-to-configure-a-public-url-for-semaphore-ui}

Semaphore の前段に nginx やその他の Web サーバーを使用している場合は、設定オプション `web_host` を指定してください。

たとえば、Semaphore へリクエストをプロキシするサーバーに NGINX を設定したとします。

サーバーのアドレスが `https://example.com` で、`https://example.com/semaphore` へのすべてのリクエストを Semaphore にプロキシしているとします。

この場合、`web_host` は `https://example.com/semaphore` になります。
