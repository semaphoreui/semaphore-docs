---
title: 관리자 가이드
description: 팀을 위해 Semaphore 서버를 설치, 설정, 보호, 운영하는 관리자를 위한 가이드입니다.
---

# 관리자 가이드

이 섹션은 다른 사람들을 위해 Semaphore를 설치하고 운영하는 관리자를 위한 것입니다.
여기에 있는 모든 작업에는 서버 자체에 대한 접근이 필요합니다. 설정 파일, 환경 변수,
명령줄 또는 Semaphore가 실행되는 머신에 접근할 수 있어야 합니다. 웹 인터페이스를 통해
프로젝트 안에서 수행하는 작업은 [사용자 가이드](/user-guide)에서 다룹니다.

Semaphore는 웹 인터페이스와 REST API를 갖춘 단일 Go 바이너리입니다. 데이터는 SQLite,
MySQL 또는 PostgreSQL에 저장하고, 자격 증명은 암호화된 상태로 보관하며, 작업은 서버
자체에서 실행하거나 별도의 러너에서 실행합니다. 따라서 제대로 동작하는 설치는 네 가지
결정으로 요약됩니다. 어떻게 설치할지, 데이터베이스를 어디에 둘지, 사용자가 어떻게
로그인할지, 그리고 작업을 어디에서 실행할지입니다.

## 설정하기 {#set-up}

서버를 시작하기 전이나 그 과정에서 구성하는 모든 항목입니다.

| 페이지 | 내용 |
|---|---|
| [설치](/admin-guide/installation) | 패키지 관리자, Docker, 바이너리, Kubernetes 및 수동 설정입니다. |
| [설정](/admin-guide/configuration) | `config.json` 파일, 환경 변수 및 지원되는 모든 옵션입니다. |
| [업그레이드](/admin-guide/upgrading) | 새 릴리스로 이전하는 방법과 먼저 확인할 사항입니다. |
| [리버스 프록시](/admin-guide/reverse-proxy) | nginx, Apache 또는 Caddy 뒤에서 TLS와 함께 Semaphore를 제공합니다. |
| [보안](/admin-guide/security) | 비밀번호 해싱, 시크릿 암호화, 네트워크 강화 및 작업 JWT입니다. |
| [인증](/admin-guide/authentication) | 로컬 계정과 2단계 인증, LDAP와 Active Directory, 그리고 12개 OpenID Connect 공급자를 통한 싱글 사인온. |
| [러너](/admin-guide/runners) | 서버가 아닌 다른 머신에서 작업을 실행합니다. |
| [고가용성](/admin-guide/ha) | 하나의 데이터베이스에 여러 Semaphore 노드를 연결해 실행합니다. |

## 운영하기 {#operate}

이미 실행 중인 서버에서 수행하는 모든 작업입니다.

| 페이지 | 내용 |
|---|---|
| [CLI](/reference/cli) | 셸에서 사용자, 프로젝트, vault, 러너 및 데이터베이스 마이그레이션을 관리합니다. |
| [API](/reference/api) | 토큰으로 인증하고 Semaphore를 프로그래밍 방식으로 제어합니다. |
| [CI/CD 통합](/admin-guide/cicd) | 외부 파이프라인에서 Semaphore 작업을 시작합니다. |
| [로그](/admin-guide/logs) | 서버 로그, 작업 로그 및 이를 다른 곳으로 전달하는 방법입니다. |
| [메트릭](/admin-guide/metrics) | Prometheus 엔드포인트와 여기서 노출되는 메트릭입니다. |
| [알림](/admin-guide/notifications) | 알림 전달 채널입니다. 이메일, Telegram, Slack 등이 있습니다. |
| [라이선스](/admin-guide/license) | Pro 또는 Enterprise 구독을 활성화합니다. |

## 어디서 시작할까요 {#where-to-start}

Semaphore를 처음 설치한다면 [설치](/admin-guide/installation)를 읽고 방법을 하나 선택한
다음, [설정](/admin-guide/configuration)에서 옵션을 지정하는 방법을 익히십시오. 다른
사람이 사용하기 전에 TLS를 적용한 [리버스 프록시](/admin-guide/reverse-proxy) 뒤에
서버를 배치하십시오.

유료 구독으로 무엇이 추가되는지는 [에디션](/editions)을 참조하십시오.
