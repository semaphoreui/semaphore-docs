---
title: 사전 준비 사항
description: Semaphore를 설치하기 전에 필요한 것 - 호스트, 데이터베이스, 네트워크 접근 권한, 자격 증명, 그리고 태스크가 호출하는 자동화 도구.
---

# 사전 준비 사항

Semaphore 자체의 필수 요구 사항은 많지 않습니다. 준비해야 할 것 대부분은 Semaphore가
실행할 자동화와 그 주변 환경에 속합니다. [설치](/admin-guide/installation)에 앞서 이
페이지를 따라가면 설치 자체는 몇 분이면 끝납니다.

## 호스트 {#a-host}

Semaphore는 단일 바이너리와 컨테이너 이미지로 배포되며 Linux, macOS, Windows에서
동작합니다. 패키지, Docker 이미지, Helm 차트가 대상으로 삼는 것은 Linux이며, 대부분의
배포도 Linux를 사용합니다.

서비스 자체는 가볍습니다. 웹 인터페이스를 제공하는 Go 프로세스일 뿐입니다. 실제로
메모리와 CPU를 소비하는 것은 같은 머신에서 동시에 실행되는 Ansible, Terraform, 그리고
여러분의 스크립트입니다. Semaphore가 아니라 수행할 작업에 맞춰 호스트 크기를 정하고,
프로젝트 설정의 **최대 병렬 태스크 수**로 동시 실행을 제한하세요. 또는 실행을
[러너](/admin-guide/runners)로 옮기고 러너 쪽 크기를 정하세요.

영구 저장소는 두 곳에 필요합니다. 데이터베이스, 그리고 저장소가 복제되는 `tmp_path`
디렉터리입니다. Docker에서는 볼륨을 뜻하며, 볼륨이 없는 컨테이너는 다시 만들 때 데이터를
잃습니다.

## 데이터베이스 {#a-database}

나중에 옮기려면 데이터를 마이그레이션해야 하므로, 설치 전에 하나를 선택하세요.

| 엔진 | 선택 기준 |
|---|---|
| **SQLite** | 서버 한 대, 팀 하나. 함께 제공되며 설정할 것이 없고, 기본값입니다. |
| **PostgreSQL** 또는 **MySQL/MariaDB** | 소수를 넘는 인원에게 서비스가 중요하거나, 기존 데이터베이스 플랫폼의 백업과 모니터링을 활용하고 싶거나, 노드를 두 대 이상 운영할 계획인 경우. |

[고가용성](/admin-guide/ha)에는 PostgreSQL 또는 MySQL과 Redis가 필요하며 SQLite는 사용할
수 없습니다. HA를 계획하고 있다면 처음부터 PostgreSQL로 시작하세요.

설치 전에 데이터베이스와 그에 대한 권한을 가진 사용자를 만들어 두세요. Semaphore는 처음
시작할 때와 업그레이드할 때마다 자체 테이블을 생성합니다.

## 네트워크 접근 {#network-access}

| Semaphore가 접근해야 하는 대상 | 용도 |
|---|---|
| Git 원격 저장소 | 템플릿이 가리키는 저장소 복제. |
| 자동화 대상 호스트와 클라우드 API | 실제 작업 수행. |
| 사용 중인 ID 공급자 | [LDAP](/admin-guide/authentication/ldap) 또는 [OpenID Connect](/admin-guide/authentication/openid) 로그인. |
| 알림 채널 | 이메일, Telegram, Slack 등. |

기본 설정에서 사용자는 `3000` 포트로 웹 인터페이스에 접속합니다. 누군가 로그인하기 전에
그 앞에 [TLS](/admin-guide/reverse-proxy)를 두세요. 세션과 API 토큰이 그 위로 오갑니다.

러너가 태스크를 실행할 예정이라면, Git 원격 저장소와 대상 호스트에 접근해야 하는 것은
*러너* 쪽이며, 러너에는 Semaphore 서버로 나가는 아웃바운드 접근이 필요합니다. 서버는
결코 러너에 연결하지 않습니다.

## 자동화 도구 {#automation-tooling}

태스크가 실행하는 것이 무엇이든, 실행되는 곳에 설치되어 있어야 합니다. 서버든, 러너든,
실행기가 사용하는 컨테이너 이미지든 마찬가지입니다.

- Docker 이미지에는 Ansible, Terraform, OpenTofu와 일반적인 의존성이 포함되어 있습니다.
  추가 Python 패키지는 마운트한 `requirements.txt`에 넣습니다.
  [추가 Python 의존성 설치](/admin-guide/installation/docker#installing-additional-python-dependencies)를
  참고하세요.
- 패키지나 바이너리로 설치하면 Semaphore만 설치됩니다. Git, Python, Ansible과 필요한
  컬렉션이나 프로바이더는 직접 설치해야 합니다.
  [수동 설치](/admin-guide/installation_manually)를 참고하세요.

템플릿을 만들기 전에, Semaphore가 실행되는 사용자 계정으로 해당 머신의 셸에서 플레이북이나
구성이 동작하는지 확인하세요. "로컬에서는 되는데"라는 문제의 거의 전부는 누락된 컬렉션,
프로바이더, Python 패키지로 밝혀집니다.

## 미리 준비할 자격 증명 {#credentials-to-have-ready}

첫 템플릿을 만들기 전에 아래를 모아 두세요. 그러지 않으면 하나하나가 작업을 멈추게 하는
장애물이 됩니다.

- Semaphore가 복제할 저장소마다 필요한 **배포 키 또는 토큰**.
- 관리 대상 호스트에 접근하는 데 쓰는 **SSH 키 또는 로그인 정보**.
- Terraform이나 모듈에 필요한 **클라우드 자격 증명**.
- 플레이북이 암호화되어 있다면 **Ansible Vault 비밀번호**.

이 모든 것은 저장소가 아니라 [키 저장소](/user-guide/key-store)에 두어야 합니다.

## 먼저 정해야 할 사항 {#decisions-to-make-first}

세 가지 선택은 지금은 비용이 적지만 나중에는 비싸집니다.

1. 위에서 설명한 **데이터베이스 엔진**.
2. **사용자가 사용할 URL.** `web_host`로 설정합니다. 리버스 프록시, OIDC 리디렉션 URI,
   웹훅 대상, 알림 링크가 모두 여기서 파생됩니다.
3. **`access_key_encryption`.** 설치 시점에 생성하고, 별도로 백업하며, 함부로 교체하지
   마세요. 저장된 모든 시크릿이 이 키로 암호화됩니다.

```bash
head -c32 /dev/urandom | base64
```

## 다음 단계 {#whats-next}

- [설치](/admin-guide/installation) — 방법을 선택하고 설치하기.
- [구성](/admin-guide/configuration) — 옵션을 지정하는 방법과 각 옵션의 의미.
- [시작하기](/getting-started) — 설치된 서버에서 첫 태스크까지.
