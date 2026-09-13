# 시작하기

이 페이지는 새로 설치한 상태에서 첫 번째 작업을 성공적으로 실행할 때까지의 과정을 안내합니다. 각 단계는 자세한 내용이 담긴 페이지로 연결됩니다.

## 처음부터 첫 작업까지 {#from-zero-to-first-task}

1. 원하는 방법으로 **Semaphore를 설치합니다**: [설치](/admin-guide/installation).
2. 설치 중에 생성한 관리자 사용자로, 또는 Docker의 `SEMAPHORE_ADMIN_*` 변수를 통해 **로그인합니다**.
3. **프로젝트를 생성합니다.** 프로젝트는 팀, 인프라 또는 애플리케이션을 서로 분리합니다: [프로젝트](/user-guide/projects).
4. **자동화에 필요한 항목을 연결합니다:**
   - 플레이북, 모듈 또는 스크립트가 있는 소스 코드: [리포지토리](/user-guide/repositories).
   - SSH 키, 토큰, 비밀번호: [키 저장소](/user-guide/key-store).
   - 대상 호스트 및 연결 설정: [인벤토리](/user-guide/inventory).
   - 재사용 가능한 변수: [변수 그룹](/user-guide/environment).
5. **작업 템플릿을 생성하고 실행합니다.** 사용하는 도구에 맞는 가이드를 선택하십시오: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [셸](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) 또는 [Python](/user-guide/apps/python). 그리고 실행하여 진행 상황을 확인하십시오: [작업](/user-guide/tasks).
6. **자동화하고 운영에 적용합니다:**
   - 일정에 따라 실행: [스케줄](/user-guide/schedules).
   - 누가 무엇을 할 수 있는지 제어: [팀 및 사용자 지정 역할](/user-guide/team).
   - 결과에 대한 알림 받기: [알림](/admin-guide/notifications).

## 핵심 개념 {#key-concepts}

다음 용어는 UI 전반에 걸쳐 등장합니다.

| 용어 | 의미 |
|------|---------|
| **프로젝트** | 분리의 기본 단위입니다. 각 프로젝트는 고유한 리포지토리, 키, 인벤토리, 템플릿, 팀을 가집니다. [프로젝트](/user-guide/projects) |
| **리포지토리** | 플레이북, 모듈 또는 스크립트가 있는 Git 리포지토리 또는 로컬 경로입니다. [리포지토리](/user-guide/repositories) |
| **인벤토리** | Ansible 방식 실행을 위한 호스트, 그룹, 연결 설정입니다. [인벤토리](/user-guide/inventory) |
| **변수 그룹** | 재사용 가능한 변수와 환경 설정으로, Environment라고도 합니다. [변수 그룹](/user-guide/environment) |
| **키 저장소** | SSH 키, 토큰, 비밀번호와 같은 암호화된 자격 증명입니다. [키 저장소](/user-guide/key-store) |
| **작업 템플릿** | 실행에 대한 정의입니다: 앱, 리포지토리, 인벤토리, 변수, 옵션. [작업 템플릿](/user-guide/task-templates) |
| **작업** | 템플릿의 단일 실행으로, 로그와 상태를 가집니다. [작업](/user-guide/tasks) |
| **워크플로** | 분기, 승인, 지연을 포함하는 템플릿 그래프입니다. Pro 기능입니다. [워크플로](/user-guide/workflows) |
| **러너** | 작업이 실행되는 위치입니다: 서버 자체 또는 원격 러너. [러너](/admin-guide/runners) |

## 다음 단계 {#next-steps}

- [리버스 프록시](/admin-guide/reverse-proxy)를 사용해 Semaphore를 TLS 뒤에 배치하십시오.
- ID 공급자를 연결하십시오: [LDAP](/admin-guide/authentication/ldap) 또는 [OpenID Connect](/admin-guide/authentication/openid).
- [API](/reference/api)와 [CLI](/reference/cli)를 사용해 CI나 스크립트에서 Semaphore를 제어하십시오.
