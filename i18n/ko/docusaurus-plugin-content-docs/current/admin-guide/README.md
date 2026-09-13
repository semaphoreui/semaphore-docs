# 관리자 가이드

Semaphore UI 관리자 가이드에 오신 것을 환영합니다. 이 가이드는 Semaphore 인스턴스를 설치, 구성, 유지 관리하기 위한 포괄적인 정보를 제공합니다.

## Semaphore UI란? {#what-is-semaphore-ui}

Semaphore UI는 자동화 작업을 실행하기 위한 현대적인 오픈 소스 웹 인터페이스입니다. 더 복잡한 자동화 플랫폼을 대체할 수 있는 가볍고 빠르며 사용하기 쉬운 도구로 설계되었습니다.

다음 작업을 안전하게 관리하고 실행할 수 있습니다.
*   **Ansible** playbook
*   **Terraform/OpenTofu** 코드형 인프라
*   **PowerShell** 및 **Shell** 스크립트
*   **Python** 스크립트

## 핵심 기능과 철학 {#core-features--philosophy}

Semaphore의 설계 원칙을 이해하면 Semaphore를 최대한 활용하는 데 도움이 됩니다.

*   **가볍고 높은 성능**: Semaphore는 **Go**로 작성되었으며 **단일 바이너리 파일**로 배포됩니다. 리소스 요구 사항(CPU/RAM)이 최소화되어 있으며 Kubernetes, Docker, JVM과 같은 외부 의존성이 필요하지 않습니다. 덕분에 빠르고 효율적이며 배포하기 쉽습니다.
*   **간단한 설치와 유지 관리**: 몇 분 안에 Semaphore를 실행할 수 있습니다. 설치는 바이너리를 다운로드해서 실행하는 것만큼 간단할 수 있습니다. 단순한 아키텍처 덕분에 업그레이드와 유지 관리가 쉽습니다.
*   **유연한 배포**: 바이너리, systemd 서비스 또는 Docker 컨테이너로 실행할 수 있습니다. 개인 홈랩부터 엔터프라이즈 환경까지 모든 곳에 적합합니다.
*   **자체 호스팅과 보안**: Semaphore는 자체 호스팅 솔루션입니다. 모든 데이터, 자격 증명, 로그가 사용자의 인프라에 남아 있으므로 완전한 제어권을 가질 수 있습니다. 자격 증명은 데이터베이스에서 항상 암호화됩니다.
*   **강력한 통합**: 단순하지만 Semaphore는 LDAP/OpenID 인증, 프로젝트별 세분화된 역할 기반 접근 제어(RBAC), 작업 실행을 확장하기 위한 원격 runner, 프로그래밍 방식 접근을 위한 완전한 REST API와 같은 강력한 기능을 지원합니다.

이 가이드는 여러분의 요구에 맞게 이러한 기능을 설정하고 관리하는 방법을 안내합니다.

<!-- ## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting -->

## 빠른 링크 {#quick-links}

- 설치: [개요](/admin-guide/installation)
  - [패키지 관리자](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [바이너리 파일](/admin-guide/installation/binary-file)
  - [Kubernetes (Helm 차트)](/admin-guide/installation/k8s)
  - [클라우드](/admin-guide/installation/cloud)
  - [수동 설치](/admin-guide/installation_manually)
- 구성: [개요](/admin-guide/configuration)
  - [구성 파일](/admin-guide/configuration/config-file)
  - [환경 변수](/admin-guide/configuration/env-vars)
  - [대화형 설정](/admin-guide/configuration/cli)
- 보안: [개요](/admin-guide/security)
  - [데이터베이스 보안](/admin-guide/security/database)
  - [네트워크 보안](/admin-guide/security/network)
  - [NGINX 구성](/admin-guide/reverse-proxy/nginx)
  - [Apache 구성](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- 인증:
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
- 운영:
  - [CLI](/admin-guide/cli)
  - [Runner](/admin-guide/runners)
  - [로그](/admin-guide/logs)
  - [알림](/admin-guide/notifications)
    - [이메일](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- 유지 관리:
  - [업그레이드](/admin-guide/upgrading)
  - [라이선스 활성화](/admin-guide/license)
  - [문제 해결](/faq/troubleshooting)
