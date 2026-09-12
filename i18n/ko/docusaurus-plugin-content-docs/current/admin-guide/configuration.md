# 설정

Semaphore는 여러 가지 방법으로 설정할 수 있습니다:

* [온라인 구성 도구](https://semaphoreui.com/install) &mdash; 온라인에서 설정을 생성하는 웹 인터페이스입니다.
* [설정 파일](/admin-guide/configuration/config-file) &mdash; Semaphore를 설정하는 기본적이고 가장 유연한 방법입니다.
* [환경 변수](/admin-guide/configuration/env-vars) &mdash; 컨테이너 또는 클라우드 네이티브 배포에 유용합니다.


## 설정 옵션 {#configuration-options}

사용 가능한 전체 설정 옵션 목록입니다:

| 설정 파일 옵션 / 환경 변수     | 설명                        |
| ----------------------- | --------------------------------------------------------- |
| **공통** ||
| <br />`git_client`      <hr /> `SEMAPHORE_GIT_CLIENT`<br /><br /> | Git 클라이언트 유형입니다. `cmd_git`(기본값) 또는 `go_git`을 사용할 수 있습니다. |
| <br />`git_attempts`    <hr /> `SEMAPHORE_GIT_ATTEMPTS`<br /><br /> | 작업이 실패 처리되기 전에 git clone 또는 pull을 시도하는 횟수입니다. 시도 사이에 지수 백오프(1초, 2초, 4초, … 최대 60초)를 사용합니다. 기본값: `4`. 재시도를 비활성화하려면 `1`로 설정하십시오. |
| <br />`ssh_config_path` <hr /> `SEMAPHORE_SSH_PATH`<br /><br /> | 사용자 지정 SSH 설정 파일의 경로입니다. 기본값: `~/.ssh/config`. |
| <br />`port`           <hr /> `SEMAPHORE_PORT`<br /><br /> | 웹 인터페이스를 사용할 수 있는 TCP 포트입니다. 기본값: `:3000` |
| <br />`interface`      <hr /> `SEMAPHORE_INTERFACE`<br /><br /> | 바인드 주소입니다(비어 있으면 모든 인터페이스). 서버에 네트워크 인터페이스가 여러 개인 경우 유용합니다. |
| <br />`tmp_path`       <hr /> `SEMAPHORE_TMP_PATH`<br /><br /> | 복제된 리포지토리와 생성된 파일이 저장되는 디렉터리의 경로입니다. 기본값: /tmp/semaphore |
| <br />`dirs.secrets` <hr /> `SEMAPHORE_SECRETS_PATH`<br /><br /> | 시크릿(예: Vault 토큰 파일)이 저장되는 디렉터리의 경로입니다. 기본값: `/tmp/semaphore`. `dirs.secrets`가 설정되지 않았거나 기본값 그대로인 경우 레거시 최상위 `secrets_path`도 여전히 허용됩니다. |
| <br />`dirs.repos` <hr /> `SEMAPHORE_REPOS_DIR`<br /><br /> | 리포지토리가 저장되는 디렉터리의 경로입니다. |
| <br />`dirs.ssh_agent_sockets` <hr /> `SEMAPHORE_SSH_AGENT_SOCKETS_DIR`<br /><br /> | SSH 에이전트 소켓이 저장되는 디렉터리의 경로입니다. 기본값: /tmp/semaphore |
| <br />`home_dir_mode`  <hr /> `SEMAPHORE_HOME_DIR_MODE` <br /><br /> | 작업에 대해 HOME 환경 변수를 설정하는 방식을 제어합니다. 옵션: `template_dir`(기본값), `project_home`, `user_home`. |
| <br />`max_parallel_tasks`    <hr /> `SEMAPHORE_MAX_PARALLEL_TASKS` <br /><br /> | 서버에서 실행할 수 있는 최대 병렬 작업 수입니다. 기본값: 9999 |
| <br />`max_task_duration_sec` <hr /> `SEMAPHORE_MAX_TASK_DURATION_SEC` <br /><br /> | 작업의 최대 실행 시간(초)입니다. |
| <br />`max_tasks_per_template`<hr /> `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` <br /><br /> | 각 템플릿에 대해 데이터베이스에 저장되는 최근 작업의 최대 개수입니다. |
| <br />`schedule.timezone`     <hr /> `SEMAPHORE_SCHEDULE_TIMEZONE` <br /><br /> | 작업 예약 및 cron 작업에 사용되는 시간대입니다. 기본값: UTC |
| <br />`oidc_providers` ![Static Badge](https://img.shields.io/badge/v2.10+-red) <hr /> `SEMAPHORE_OIDC_PROVIDERS` <br /><br /> | OpenID 공급자 설정입니다. 여러 OpenID 공급자를 지정할 수 있습니다. OpenID 설정에 대한 자세한 내용은 [OpenID](/admin-guide/openid)를 참조하십시오. |
| <br />`password_login_disable` <hr /> `SEMAPHORE_PASSWORD_LOGIN_DISABLED` <br /><br /> ![Static Badge](https://img.shields.io/badge/v2.10+-red)    <br /><br /> | 비밀번호 로그인을 거부합니다. |
| <br />`non_admin_can_create_project`      <hr /> `SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT` <br /><br /> | 관리자가 아닌 사용자도 프로젝트를 생성할 수 있도록 허용합니다. |
| <br />`env_vars`               <hr /> `SEMAPHORE_ENV_VARS` <br /><br /> | 작업 실행에 노출되는 환경 변수를 담은 JSON 맵입니다. |
| <br />`forwarded_env_vars`     <hr /> `SEMAPHORE_FORWARDED_ENV_VARS` <br /><br /> | 작업 실행으로 전달될 호스트 환경 변수의 JSON 배열입니다. |
| <br />`apps`                   <hr /> `SEMAPHORE_APPS` <br /><br /> | 앱 설정을 담은 JSON 맵입니다. |
| <br />`use_remote_runner`      <hr /> `SEMAPHORE_USE_REMOTE_RUNNER` <br /><br /> | 원격 러너를 사용하려면 활성화하십시오. |
| <br />`runner_registration_token` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` <br /><br /> | 러너가 서버에 등록할 때 사용하는 부트스트랩 토큰입니다. |
| **구독** ||
| <br />`subscription.key` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY` <br /><br /> | 구독 키 또는 토큰입니다. 설정하면 웹 UI에서의 활성화가 비활성화됩니다. |
| <br />`subscription.key_file` <hr /> `SEMAPHORE_SUBSCRIPTION_KEY_FILE` <br /><br /> | 구독 키 또는 토큰 파일의 경로입니다. |
| <br />`subscription.server_url` <hr /> `SEMAPHORE_SUBSCRIPTION_SERVER_URL` <br /><br /> | 구독/결제 서버 URL입니다. 기본값: https://portal.semaphoreui.com/billing |
| **JWT** ||
| <br />`jwt.enabled` <hr /> `SEMAPHORE_JWT_ENABLED` <br /><br /> | 활성화하면 Semaphore가 각 작업 실행에 대해 수명이 짧은 JWT를 발급하고 `/.well-known/jwks.json`을 통해 공개 키를 노출합니다. |
| <br />`jwt.issuer` <hr /> `SEMAPHORE_JWT_ISSUER` <br /><br /> | 발급된 JWT의 `iss` 클레임에 들어가는 값입니다. |
| <br />`jwt.default_ttl` <hr /> `SEMAPHORE_JWT_DEFAULT_TTL` <br /><br /> | 발급된 작업 JWT의 기본 수명으로, Go duration 형식(예: `30m`, `1h`)입니다. 기본값: 1h |
| <br />`jwt.max_ttl` <hr /> `SEMAPHORE_JWT_MAX_TTL` <br /><br /> | 템플릿별 JWT TTL의 절대 상한으로, Go duration 형식입니다. 기본값: 24h |
| **러너** ||
| <br />`runner.registration_token_file` <hr /> `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` <br /><br /> | 러너 등록 토큰이 들어 있는 파일의 경로입니다. |
| <br />`runner.token` <hr /> `SEMAPHORE_RUNNER_TOKEN` <br /><br /> | 러너 인증 토큰입니다. `runner.token_file`과 동시에 사용할 수 없습니다. |
| <br />`runner.token_file` <hr /> `SEMAPHORE_RUNNER_TOKEN_FILE` <br /><br /> | 러너 등록용 토큰 파일의 경로입니다. |
| <br />`runner.private_key_file` <hr /> `SEMAPHORE_RUNNER_PRIVATE_KEY_FILE` <br /><br /> | 러너의 개인 키 파일 경로입니다. |
| <br />`runner.one_off` <hr /> `SEMAPHORE_RUNNER_ONE_OFF` <br /><br /> | 러너가 하나의 작업만 처리하고 종료합니다. 동적 러너에 유용합니다. |
| <br />`runner.enabled` <hr /> `SEMAPHORE_RUNNER_ENABLED` <br /><br /> | 러너를 활성화합니다. |
| <br />`runner.webhook` <hr /> `SEMAPHORE_RUNNER_WEBHOOK` <br /><br /> | 러너의 webhook URL입니다. |
| <br />`runner.name` <hr /> `SEMAPHORE_RUNNER_NAME` <br /><br /> | 러너 이름입니다. |
| <br />`runner.tags` <hr /> `SEMAPHORE_RUNNER_TAGS` <br /><br /> | 러너 태그의 JSON 배열입니다. |
| <br />`runner.max_parallel_tasks` <hr /> `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` <br /><br /> | 러너의 최대 병렬 작업 수입니다. 기본값: 9999. |
| <br />`runner.check_interval_seconds` <hr /> `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` <br /><br /> | 러너가 새 작업을 확인하고 진행 상황을 보고하기 위해 서버를 폴링하는 주기(초)입니다. 기본값: 1. 값을 높이면 요청 수가 줄어드는 대신 작업 수신이 약간 느려집니다. |
| <br />`runner.project_id` <hr /> `SEMAPHORE_RUNNER_PROJECT_ID` <br /><br /> | 러너를 단일 프로젝트로 제한합니다. |
| <br />`runner.connection.server_ca_cert_file` <hr /> `SEMAPHORE_RUNNER_SERVER_CA_CERT_FILE` <br /><br /> | 시스템 신뢰 저장소에 더해 Semaphore 서버 인증서를 검증하는 데 사용되는 PEM 번들입니다. 서버가 자체 서명 인증서나 내부 CA 인증서를 사용하는 경우 설정하십시오. |
| <br />`runner.connection.skip_tls_verify` <hr /> `SEMAPHORE_RUNNER_SKIP_TLS_VERIFY` <br /><br /> | 서버 인증서 검증을 완전히 비활성화합니다. 안전하지 않으므로(MITM에 취약) 테스트 용도로만 사용하십시오. |
| <br />`runner.executor` <hr /> `SEMAPHORE_RUNNER_EXECUTOR` <br /><br /> | 전체 러너 실행기 설정(`type`과 그 아래에 중첩된 `docker` 또는 `k8s` 설정)을 담은 JSON 객체입니다. 하나의 환경 변수로 실행기 블록 전체를 설정하려는 경우 사용하십시오. |
| <br />`runner.executor.type` <hr /> &mdash; <br /><br /> | 러너가 각 작업을 실행하는 데 사용하는 전략입니다: `local`(기본값), `k8s` 또는 `docker`. |
| <br />`runner.executor.k8s.kubeconfig` <hr /> `SEMAPHORE_RUNNER_K8S_KUBECONFIG` <br /><br /> | kubeconfig 파일의 경로입니다. 비어 있으면 클러스터 내 설정을 사용합니다. |
| <br />`runner.executor.k8s.namespace` <hr /> `SEMAPHORE_RUNNER_K8S_NAMESPACE` <br /><br /> | 임시 작업 Pod가 생성되는 네임스페이스입니다. 기본값: semaphore |
| <br />`runner.executor.k8s.image` <hr /> `SEMAPHORE_RUNNER_K8S_IMAGE` <br /><br /> | 빌드 컨테이너의 기본 컨테이너 이미지입니다. 기본값: semaphoreui/job:latest |
| <br />`runner.executor.k8s.helper_image` <hr /> `SEMAPHORE_RUNNER_K8S_HELPER_IMAGE` <br /><br /> | git-clone 초기화 컨테이너에 사용되는 이미지입니다. 기본값: semaphoreui/helper:latest |
| <br />`runner.executor.k8s.service_account` <hr /> `SEMAPHORE_RUNNER_K8S_SERVICE_ACCOUNT` <br /><br /> | 작업 Pod가 실행되는 서비스 계정입니다. 기본값: default |
| <br />`runner.executor.k8s.pull_secrets` <hr /> `SEMAPHORE_RUNNER_K8S_PULL_SECRETS` <br /><br /> | 각 Pod에 연결되는 imagePullSecrets의 쉼표로 구분된 목록입니다. |
| <br />`runner.executor.k8s.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_POLL_INTERVAL_SECONDS` <br /><br /> | 실행기가 Pod 상태를 폴링하는 주기(초)입니다. 기본값: 3 |
| <br />`runner.executor.k8s.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_K8S_CLEANUP_GRACE_SECONDS` <br /><br /> | Pod 삭제 시 유예 기간(초)입니다. 기본값: 30 |
| <br />`runner.executor.docker.host` <hr /> `SEMAPHORE_RUNNER_DOCKER_HOST` <br /><br /> | Docker 데몬 URL(`unix://`, `tcp://` 또는 `npipe://`)입니다. 비어 있으면 표준 환경(`DOCKER_HOST`)과 플랫폼 기본 소켓을 사용합니다. |
| <br />`runner.executor.docker.tls_verify` <hr /> `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` <br /><br /> | `tcp://` 연결에 대해 TLS 인증서 검증을 활성화합니다. |
| <br />`runner.executor.docker.cert_path` <hr /> `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` <br /><br /> | 상호 TLS용 ca.pem, cert.pem, key.pem이 들어 있는 디렉터리입니다. |
| <br />`runner.executor.docker.image` <hr /> `SEMAPHORE_RUNNER_DOCKER_IMAGE` <br /><br /> | 빌드 컨테이너의 기본 이미지입니다. 기본값: semaphoreui/job:latest |
| <br />`runner.executor.docker.helper_image` <hr /> `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` <br /><br /> | 일시적인 git-clone 컨테이너에 사용되는 이미지입니다. 기본값: semaphoreui/helper:latest |
| <br />`runner.executor.docker.network` <hr /> `SEMAPHORE_RUNNER_DOCKER_NETWORK` <br /><br /> | 빌드 컨테이너가 참여하는 Docker 네트워크입니다. 기본값: bridge |
| <br />`runner.executor.docker.pull_policy` <hr /> `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` <br /><br /> | 이미지 pull 정책입니다: `always`, `if-not-present`(기본값) 또는 `never`. |
| <br />`runner.executor.docker.cpu_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` <br /><br /> | 0보다 크면 빌드 컨테이너의 CPU를 제한합니다(`--cpus`로 전달됨). |
| <br />`runner.executor.docker.memory_limit` <hr /> `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` <br /><br /> | 비어 있지 않으면 빌드 컨테이너의 메모리를 제한합니다(예: `2g`). |
| <br />`runner.executor.docker.poll_interval_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` <br /><br /> | 컨테이너 상태를 폴링하는 주기(초)입니다. 기본값: 2 |
| <br />`runner.executor.docker.cleanup_grace_seconds` <hr /> `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` <br /><br /> | `docker stop`에 전달되는 타임아웃(초)입니다. 기본값: 30 |
| <br />`runner.executor.docker.privileged` <hr /> `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` <br /><br /> | 빌드 컨테이너를 `--privileged`로 실행합니다. 위험하며 기본적으로 꺼져 있습니다. |
| **러너(서버 측 플릿)** ||
| <br />`runners.offline_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_OFFLINE_TIMEOUT_SEC` <br /><br /> | 이 시간(초) 동안 하트비트가 없으면 러너를 오프라인으로 간주합니다. 해당 러너의 "starting" 상태 작업은 재할당됩니다. 기본값: 120 |
| <br />`runners.task_fail_timeout_sec` <hr /> `SEMAPHORE_RUNNERS_TASK_FAIL_TIMEOUT_SEC` <br /><br /> | 이 시간(초) 동안 하트비트가 없으면 러너의 "running" 상태 작업을 실패 처리합니다. `offline_timeout_sec`보다 작은 값은 해당 값으로 맞춰집니다. 기본값: 420 |
| <br />`runners.reconcile_interval_sec` <hr /> `SEMAPHORE_RUNNERS_RECONCILE_INTERVAL_SEC` <br /><br /> | 디스패치된 작업을 러너 생존 상태와 대조하는 주기(초)입니다. 기본값: 30 |
| **팀** ||
| <br />`teams.invites_enabled` <hr /> `SEMAPHORE_TEAMS_INVITES_ENABLED` <br /><br /> | 사용자가 팀에 구성원을 초대할 수 있도록 허용합니다. |
| <br />`teams.invite_type` <hr /> `SEMAPHORE_TEAMS_INVITE_TYPE` <br /><br /> | 초대 유형입니다: `username`(기본값), `email`, `both`. |
| <br />`teams.members_can_leave` <hr /> `SEMAPHORE_TEAMS_MEMBERS_CAN_LEAVE` <br /><br /> | 구성원이 팀을 떠날 수 있도록 허용합니다. |
| **데이터베이스** ||
| <br />`sqlite.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | SQLite 데이터베이스 파일의 경로입니다.   |
| <br />`mysql.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | MySQL 데이터베이스 호스트입니다.                |
| <br />`mysql.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | MySQL 데이터베이스(스키마) 이름입니다.       |
| <br />`mysql.user` <hr />`SEMAPHORE_DB_USER`<br /><br /> | MySQL 사용자 이름입니다.                    |
| <br />`mysql.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | MySQL 사용자의 비밀번호입니다.              |
| <br />`postgres.host` <hr /> `SEMAPHORE_DB_HOST`<br /><br /> | Postgres 데이터베이스 호스트입니다.             |
| <br />`postgres.name` <hr /> `SEMAPHORE_DB_NAME`<br /><br /> | Postgres 데이터베이스(스키마) 이름입니다.    |
| <br />`postgres.user` <hr /> `SEMAPHORE_DB_USER`<br /><br /> | Postgres 사용자 이름입니다.                 |
| <br />`postgres.pass` <hr /> `SEMAPHORE_DB_PASS`<br /><br /> | Postgres 사용자의 비밀번호입니다.           |
| <br />`dialect`       <hr /> `SEMAPHORE_DB_DIALECT`<br /><br /> | `sqlite`(기본값), `postgres` 또는 `mysql`을 사용할 수 있습니다.   |
| <br /> `*.options`    <hr /> `SEMAPHORE_DB_OPTIONS`<br /><br /> | 데이터베이스 연결 옵션을 담은 JSON 맵입니다. |
| **보안** ||
| <br />`access_key_encryption` <hr /> `SEMAPHORE_ACCESS_KEY_ENCRYPTION`<br /><br /> | 데이터베이스에 저장된 액세스 키를 암호화하는 데 사용되는 Base64 인코딩 키입니다. 자세한 내용은 [데이터베이스 암호화 참조](/admin-guide/security#data-encryption)를 참조하십시오. |
| <br />`option_encryption` <hr /> `SEMAPHORE_OPTION_ENCRYPTION`<br /><br /> | 기존 단일 키 방식(순환 없음)으로 DB 옵션(JWT 서명 키)을 암호화하는 데 사용되는 Base64 인코딩 키입니다. 설정하지 않으면 액세스 키를 대신 사용합니다. |
| <br />`cookie_hash`           <hr /> `SEMAPHORE_COOKIE_HASH`<br /><br /> | 쿠키 서명에 사용되는 Base64 인코딩 HMAC 키입니다. |
| <br />`cookie_encryption`     <hr /> `SEMAPHORE_COOKIE_ENCRYPTION`<br /><br /> | 쿠키 암호화에 사용되는 Base64 인코딩 키입니다. |
| <br />`web_host`       <hr /> `SEMAPHORE_WEB_ROOT`<br /><br /> | Semaphore를 하위 경로로 사용하려는 경우 유용합니다. 예: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). 끝에 `/`를 붙이지 마십시오. |
| <br />`tls.enabled`    <hr /> `SEMAPHORE_TLS_ENABLED`<br /><br /> | Semaphore 서버와의 보안 통신을 위한 TLS(HTTPS)를 활성화하거나 비활성화합니다. |
| <br />`tls.cert_file`  <hr /> `SEMAPHORE_TLS_CERT_FILE`<br /><br /> | TLS 인증서 파일의 경로입니다. |
| <br />`tls.key_file`   <hr /> `SEMAPHORE_TLS_KEY_FILE`<br /><br /> | TLS 키 파일의 경로입니다. |
| <br />`tls.http_redirect_addr` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR`<br /><br /> | HTTP→HTTPS 리디렉션 리스너의 주소(`host[:port]`)입니다. `tls.http_redirect_port`와 동시에 사용할 수 없습니다. |
| <br />`tls.http_redirect_port` <hr /> `SEMAPHORE_TLS_HTTP_REDIRECT_PORT`<br /><br /> | HTTP 트래픽을 HTTPS로 리디렉션할 포트입니다. `tls.http_redirect_addr`와 동시에 사용할 수 없습니다. |
| <br />`mfa.totp.enabled`         <hr /> `SEMAPHORE_TOTP_ENABLED` <br /><br /> | TOTP를 사용한 2단계 인증을 활성화합니다. |
| <br />`mfa.totp.app_name` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <hr /> `SEMAPHORE_TOTP_ISSUER` ![Static Badge](https://img.shields.io/badge/v2.17.0-red) <br /><br /> | TOTP 인증 앱에 표시되는 발급자 레이블(Semaphore 제목)입니다. |
| <br />`mfa.totp.allow_recovery`  <hr /> `SEMAPHORE_TOTP_ALLOW_RECOVERY` <br /><br /> | 사용자가 복구 코드를 사용하여 TOTP를 재설정할 수 있도록 허용합니다. |
| <br />`mfa.email.enabled`        <hr /> `SEMAPHORE_EMAIL_2TP_ENABLED` <br /><br /> | 이메일 기반 다단계 인증을 활성화합니다. |
| <br />`mfa.email.allow_login_as_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_LOGIN_AS_EXTERNAL_USER` <br /><br /> | 외부(이메일 전용) 사용자로 로그인할 수 있도록 허용합니다. |
| <br />`mfa.email.allow_create_external_user` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOW_CREATE_EXTERNAL_USER` <br /><br /> | 최초 로그인 시 외부 사용자 생성을 허용합니다. |
| <br />`mfa.email.allowed_domains` <hr /> `SEMAPHORE_EMAIL_2TP_ALLOWED_DOMAINS` <br /><br /> | 허용되는 이메일 도메인의 JSON 배열입니다. |
| <br />`mfa.email.disable_for_oidc` <hr /> `SEMAPHORE_EMAIL_2TP_DISABLE_FOR_OIDC` <br /><br /> | OIDC로 인증한 사용자에 대해 이메일 MFA를 비활성화합니다. |
| **암호화** ||
| <br />`encryption.keys_file` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_FILE` <br /><br /> | 암호화 키링을 보관하는 별도 파일(YAML 또는 JSON)의 경로입니다. 변경 사항을 감시하므로 서버를 재시작하지 않아도 수정 내용이 적용됩니다. 설정하지 않으면 레거시 `access_key_encryption` 필드가 사용됩니다. |
| <br />`encryption.keys_poll_interval` <hr /> `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` <br /><br /> | `keys_file`의 변경 사항을 폴링하는 주기(`15s`와 같은 Go duration)입니다. `0`은 폴링을 비활성화합니다(SIGHUP으로는 여전히 강제로 다시 로드할 수 있음). 기본값: 15s |
| **프로세스** ||
| <br />`process.user`          <hr /> `SEMAPHORE_PROCESS_USER` <br /><br /> | 래핑된 프로세스(Ansible, Terraform, OpenTofu 등)가 실행될 사용자입니다. |
| <br />`process.uid`           <hr /> `SEMAPHORE_PROCESS_UID` <br /><br /> | 래핑된 프로세스(Ansible, Terraform, OpenTofu 등)가 실행될 사용자의 ID입니다. |
| <br />`process.gid`           <hr /> `SEMAPHORE_PROCESS_GID` <br /><br /> | 래핑된 프로세스(Ansible, Terraform, OpenTofu 등)가 실행될 그룹의 ID입니다. |
| <br />`process.chroot`        <hr /> `SEMAPHORE_PROCESS_CHROOT` <br /><br /> | 래핑된 프로세스의 chroot 디렉터리입니다. |
| <br />`process.no_new_privs`  <hr /> `SEMAPHORE_PROCESS_NO_NEW_PRIVS` <br /><br /> | 래핑된 프로세스가 새로운 권한을 얻을 수 없도록 `no_new_privs` 플래그를 설정합니다. |
| <br />`process.app_namespaces.user`  <hr /> `SEMAPHORE_PROCESS_APP_NS_USER` <br /><br /> | 앱 실행에 대해 UID/GID를 격리합니다(`CLONE_NEWUSER`). Linux 전용입니다. |
| <br />`process.app_namespaces.mount` <hr /> `SEMAPHORE_PROCESS_APP_NS_MOUNT` <br /><br /> | 앱 실행에서 시크릿 tmpfs와 같은 호스트 마운트 지점을 숨깁니다(`CLONE_NEWNS`). Linux 전용입니다. |
| <br />`process.app_namespaces.pid`   <hr /> `SEMAPHORE_PROCESS_APP_NS_PID` <br /><br /> | 앱 실행에서 호스트 프로세스를 숨깁니다(`CLONE_NEWPID`). Linux 전용입니다. |
| <br />`process.app_namespaces.ipc`   <hr /> `SEMAPHORE_PROCESS_APP_NS_IPC` <br /><br /> | 앱 실행에 대해 SysV IPC 및 POSIX 메시지 큐를 격리합니다(`CLONE_NEWIPC`). Linux 전용입니다. |
| <br />`process.app_namespaces.uts`   <hr /> `SEMAPHORE_PROCESS_APP_NS_UTS` <br /><br /> | 앱 실행에 대해 호스트 이름과 도메인을 격리합니다(`CLONE_NEWUTS`). Linux 전용입니다. |
| **이메일** ||
| <br />`email_sender`   <hr /> `SEMAPHORE_EMAIL_SENDER`<br /><br /> | 발신자의 이메일 주소입니다. |
| <br />`email_host`     <hr /> `SEMAPHORE_EMAIL_HOST`<br /><br /> | SMTP 서버 호스트 이름입니다. |
| <br />`email_port`     <hr /> `SEMAPHORE_EMAIL_PORT`<br /><br /> | SMTP 서버 포트입니다. |
| <br />`email_secure`   <hr /> `SEMAPHORE_EMAIL_SECURE`<br /><br /> | 암호화되지 않은 SMTP 연결을 안전한 암호화 연결로 업그레이드하는 StartTLS를 활성화합니다. |
| <br />`email_tls`      <hr /> `SEMAPHORE_EMAIL_TLS`<br /><br /> | SMTP 서버와의 통신에 SSL 또는 TLS 연결을 사용합니다. |
| <br />`email_tls_min_version` <hr /> `SEMAPHORE_EMAIL_TLS_MIN_VERSION`<br /><br /> | 연결에 사용할 최소 TLS 버전입니다. |
| <br />`email_username` <hr /> `SEMAPHORE_EMAIL_USERNAME`<br /><br /> | SMTP 서버 인증용 사용자 이름입니다. |
| <br />`email_password` <hr /> `SEMAPHORE_EMAIL_PASSWORD`<br /><br /> | SMTP 서버 인증용 비밀번호입니다. |
| <br />`email_alert`    <hr /> `SEMAPHORE_EMAIL_ALERT`<br /><br /> | 이메일 알림을 활성화하는 플래그입니다. |
| **메신저** ||
| <br />`telegram_alert` <hr /> `SEMAPHORE_TELEGRAM_ALERT`<br /><br /> | Telegram으로 알림을 보내려면 True로 설정하십시오. `telegram_chat` 및 `telegram_token`과 함께 사용해야 합니다. |
| <br />`telegram_chat`  <hr /> `SEMAPHORE_TELEGRAM_CHAT`<br /><br /> | 알림을 보낼 채팅의 Chat ID로 설정하십시오.  자세한 내용은 [Telegram 알림 설정](/admin-guide/notifications/telegram#chat-id)을 참조하십시오. |
| <br />`telegram_token` <hr /> `SEMAPHORE_TELEGRAM_TOKEN`<br /><br /> | 알림 페이로드를 받을 봇의 Authorization Token으로 설정하십시오.  자세한 내용은 [Telegram 알림 설정](/admin-guide/notifications/telegram#bot-setup)을 참조하십시오. |
| <br />`slack_alert`    <hr /> `SEMAPHORE_SLACK_ALERT`<br /><br /> | Slack으로 알림을 보내려면 True로 설정하십시오. `slack_url`과 함께 사용해야 합니다.                          |
| <br />`slack_url`      <hr /> `SEMAPHORE_SLACK_URL`<br /><br /> | Slack webhook URL입니다. Semaphore는 이 URL로 Slack 형식의 JSON 알림을 POST합니다.    |
| <br />`microsoft_teams_alert` <hr /> `SEMAPHORE_MICROSOFT_TEAMS_ALERT` <br /><br /> | Microsoft Teams 알림을 활성화하는 플래그입니다. |
| <br />`microsoft_teams_url`   <hr /> `SEMAPHORE_MICROSOFT_TEAMS_URL` <br /><br /> | Microsoft Teams webhook URL입니다. |
| <br />`rocketchat_alert`      <hr /> `SEMAPHORE_ROCKETCHAT_ALERT` <br /><br /> | Rocket.Chat으로 알림을 보내려면 True로 설정하십시오. `rocketchat_url`과 함께 사용해야 합니다. v2.9.56부터 사용할 수 있습니다.  |
| <br />`rocketchat_url`        <hr /> `SEMAPHORE_ROCKETCHAT_URL` <br /><br /> | Rocket.Chat webhook URL입니다. Semaphore는 이 URL로 Rocket.Chat 형식의 JSON 알림을 POST합니다. v2.9.56부터 사용할 수 있습니다. |
| <br />`dingtalk_alert`        <hr /> `SEMAPHORE_DINGTALK_ALERT` <br /><br /> | Dingtalk 알림을 활성화합니다. |
| <br />`dingtalk_url`          <hr /> `SEMAPHORE_DINGTALK_URL` <br /><br /> | Dingtalk 메신저 webhook URL입니다. |
| <br />`gotify_alert`          <hr /> `SEMAPHORE_GOTIFY_ALERT` <br /><br /> | Gotify 알림을 활성화합니다. |
| <br />`gotify_url`            <hr /> `SEMAPHORE_GOTIFY_URL` <br /><br /> | Gotify 서버 URL입니다. |
| <br />`gotify_token`          <hr /> `SEMAPHORE_GOTIFY_TOKEN` <br /><br /> | Gotify 서버 토큰입니다. |
| **LDAP** ||
| <br />`ldap_enable`           <hr /> `SEMAPHORE_LDAP_ENABLE` <br /><br /> | LDAP 인증을 활성화하는 플래그입니다. |
| <br />`ldap_needtls`          <hr /> `SEMAPHORE_LDAP_NEEDTLS` <br /><br /> | LDAP 연결에 대해 TLS를 활성화하거나 비활성화하는 플래그입니다. |
| <br />`ldap_binddn`           <hr /> `SEMAPHORE_LDAP_BIND_DN` <br /><br /> | 인증을 위해 LDAP 서버에 바인딩하는 데 사용되는 고유 이름(DN)입니다. |
| <br />`ldap_bindpassword`     <hr /> `SEMAPHORE_LDAP_BIND_PASSWORD` <br /><br /> | 인증을 위해 LDAP 서버에 바인딩하는 데 사용되는 비밀번호입니다. |
| <br />`ldap_server`           <hr /> `SEMAPHORE_LDAP_SERVER` <br /><br /> | LDAP 서버의 호스트 이름과 포트입니다(예: ldap-server.com:1389). |
| <br />`ldap_searchdn`         <hr /> `SEMAPHORE_LDAP_SEARCH_DN` <br /><br /> | LDAP 디렉터리에서 사용자를 검색하는 데 사용되는 기본 고유 이름(DN)입니다(예: dc=example,dc=org). |
| <br />`ldap_searchfilter`     <hr /> `SEMAPHORE_LDAP_SEARCH_FILTER` <br /><br /> | LDAP 디렉터리에서 사용자를 검색하는 데 사용되는 필터입니다(예: (&(objectClass=inetOrgPerson)(uid=%s))). |
| <br />`ldap_mappings.dn`      <hr /> `SEMAPHORE_LDAP_MAPPING_DN` <br /><br /> | 사용자 인증 시 고유 이름(DN) 매핑으로 사용할 LDAP 속성입니다. |
| <br />`ldap_mappings.mail`    <hr /> `SEMAPHORE_LDAP_MAPPING_MAIL` <br /><br /> | 사용자 인증 시 이메일 주소 매핑으로 사용할 LDAP 속성입니다. |
| <br />`ldap_mappings.uid`     <hr /> `SEMAPHORE_LDAP_MAPPING_UID` <br /><br /> | 사용자 인증 시 사용자 ID(UID) 매핑으로 사용할 LDAP 속성입니다. |
| <br />`ldap_mappings.cn`      <hr /> `SEMAPHORE_LDAP_MAPPING_CN` <br /><br /> | 사용자 인증 시 일반 이름(CN) 매핑으로 사용할 LDAP 속성입니다. |
| **로깅** ||
| <br />`log.events.format`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_FORMAT` <br /><br /> | 이벤트 로그 형식입니다. `json`으로 설정하거나, 텍스트 형식을 사용하려면 비워 두십시오. |
| <br />`log.events.enabled`     ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOG_ENABLED` <br /><br /> | 이벤트 로깅을 활성화하거나 비활성화합니다. |
| <br />`log.events.logger`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_EVENT_LOGGER` <br /><br /> | 이벤트 로거 설정을 담은 JSON 맵입니다. |
| <br />`log.tasks.format`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_FORMAT` <br /><br /> | 작업 로그 형식입니다. `json`으로 설정하거나, 텍스트 형식을 사용하려면 비워 두십시오. |
| <br />`log.tasks.enabled`      ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOG_ENABLED` <br /><br /> | 작업 로깅을 활성화하거나 비활성화합니다. |
| <br />`log.tasks.logger`       ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_LOGGER` <br /><br /> | 작업 로거 설정을 담은 JSON 맵입니다. |
| <br />`log.tasks.result_logger`  ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_TASK_RESULT_LOGGER` <br /><br /> | 작업 결과 로거 설정을 담은 JSON 맵입니다. |
| <br />`syslog.enabled` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ENABLED` <br /><br /> | 설정된 syslog 서버로의 로그 기록을 활성화하거나 비활성화합니다. |
| <br />`syslog.network` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_NETWORK` <br /><br /> | Syslog 서버에 연결하는 데 사용되는 프로토콜입니다: `udp` 또는 `tcp`. |
| <br />`syslog.address` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_ADDRESS` <br /><br /> | Syslog 서버의 호스트 이름과 포트입니다. 예: `localhost:514`. |
| <br />`syslog.tag` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_TAG` <br /><br /> | Syslog 서버에서 Semaphore UI 레코드를 표시하는 데 사용되는 태그입니다. |
| <br />`syslog.format` ![Static Badge](https://img.shields.io/badge/pro-red) <hr /> `SEMAPHORE_SYSLOG_FORMAT` <br /><br /> | Syslog 메시지의 형식입니다. `rfc5424`로 설정하거나, 기본값을 사용하려면 비워 두십시오. |
| **디버깅** ||
| <br />`debugging.api_delay` <hr /> `SEMAPHORE_API_DELAY` <br /><br /> | API 응답에 지연을 추가합니다(디버깅 용도). |
| <br />`debugging.pprof_dump_dir` <hr /> `SEMAPHORE_PPROF_DUMP_DIR` <br /><br /> | pprof 덤프 파일용 디렉터리입니다. |
| **고가용성(HA)** ||
| <br />`ha.enabled` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_ENABLED` <br /><br /> | 고가용성(HA) 모드를 활성화합니다. |
| <br />`ha.node_id` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_NODE_ID` <br /><br /> | HA 노드의 고유 식별자입니다. |
| <br />`ha.redis.addr` ![Static Badge](https://img.shields.io/badge/enterprise-yellow) <hr /> `SEMAPHORE_HA_REDIS_ADDR` <br /><br /> | HA에 사용되는 Redis 서버의 주소입니다. 예: `localhost:6379`. |
| <br />`ha.redis.db` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_DB` <br /><br /> | Redis 데이터베이스 번호입니다. |
| <br />`ha.redis.pass` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_PASS` <br /><br /> | Redis 서버의 비밀번호입니다. |
| <br />`ha.redis.user` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_USER` <br /><br /> | Redis 서버의 사용자 이름입니다. |
| <br />`ha.redis.tls` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS` <br /><br /> | Redis 연결에 TLS를 활성화합니다. |
| <br />`ha.redis.tls_skip_verify` ![Static Badge](https://img.shields.io/badge/enterprise-yellow)<hr /> `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` <br /><br /> | Redis 연결에 대한 TLS 인증서 검증을 건너뜁니다. |

## 자주 묻는 질문 {#frequently-asked-questions}

### 1. Semaphore UI의 공개 URL을 설정하는 방법 {#1-how-to-configure-a-public-url-for-semaphore-ui}

Semaphore 앞단에 nginx 또는 다른 웹 서버를 사용하는 경우 `web_host` 설정 옵션을 지정해야 합니다.

예를 들어 서버에 Semaphore로 요청을 프록시하는 NGINX를 구성했다고 가정하겠습니다.

서버 주소가 `https://example.com`이고 `https://example.com/semaphore`로 오는 모든 요청을 Semaphore로 프록시합니다.

이 경우 `web_host`는 `https://example.com/semaphore`가 됩니다.
