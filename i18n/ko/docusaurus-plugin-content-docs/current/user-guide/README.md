---
title: 사용자 가이드
description: "Semaphore 프로젝트 안에서 작업하는 엔지니어를 위한 가이드: 리소스, 작업 템플릿, 작업, 스케줄, 팀 접근 권한을 다룹니다."
---

# 사용자 가이드

이 섹션은 이미 Semaphore 프로젝트에 접근할 수 있는 사용자를 위한 것입니다. 여기에 있는
모든 작업은 웹 인터페이스나 프로젝트 API에서 이루어집니다. 서버를 설치하고 설정하며 ID
공급자를 연결하는 방법은 [관리자 가이드](/admin-guide)에서 다룹니다.

Semaphore의 작업은 하나의 흐름을 따릅니다. **프로젝트**가 나머지 모든 것을 담습니다.
그 안에 실행에 필요한 리소스를 등록합니다. 플레이북이나 스크립트가 있는 **리포지토리**,
리포지토리와 호스트에 접근하는 데 사용하는 **키**, 대상 머신의 **인벤토리**, 그리고 값과
시크릿을 담은 **변수 그룹**입니다. **작업 템플릿**은 이들을 조합해 무엇을 실행할지 정의하며,
그 템플릿의 실행 하나하나가 **작업**입니다. 스케줄, 워크플로우, 수신 웹훅은 템플릿을 대신
시작해 줍니다.

## 프로젝트 설정하기 {#set-up-a-project}

각 단계가 이전 단계에 의존하므로 다음 순서대로 진행하십시오.

| 페이지 | 내용 |
|---|---|
| [프로젝트](/user-guide/projects) | 프로젝트 생성, 사이드바의 각 섹션, 백업과 복원입니다. |
| [팀](/user-guide/team) | 네 가지 기본 제공 역할과 Enterprise의 사용자 지정 역할입니다. |
| [키 저장소](/user-guide/key-store) | SSH 키, 로그인 정보 및 외부 시크릿 저장소입니다. |
| [리포지토리](/user-guide/repositories) | 자동화 코드가 있는 Git 리포지토리와 로컬 경로입니다. |
| [Host config](/user-guide/host-config) | 리포지토리 키로는 접근할 수 없는 Git 호스트와 리포지토리 URL의 자격 증명입니다. 서브모듈, Galaxy 역할, Terraform 모듈에 사용합니다. |
| [인벤토리](/user-guide/inventory) | Ansible을 위한 호스트와 연결 설정, Terraform을 위한 워크스페이스입니다. |
| [변수 그룹](/user-guide/environment) | 작업에 전달되는 재사용 가능한 변수와 시크릿입니다. |

## 작업 정의 및 실행 {#define-and-run-work}

| 페이지 | 내용 |
|---|---|
| [작업 템플릿](/user-guide/task-templates) | 템플릿 양식의 모든 필드와 템플릿 유형입니다. |
| [앱](/user-guide/apps) | 각 애플리케이션이 실행하는 대상입니다. Ansible, Terraform, OpenTofu, Terragrunt 및 스크립트가 있습니다. |
| [작업](/user-guide/tasks) | 작업 시작, 작업 상태, 로그, 중지 및 재실행입니다. |
| [스케줄](/user-guide/schedules) | cron 스케줄에 따라 템플릿을 실행합니다. |
| [워크플로우](/user-guide/workflows) | 승인과 분기를 포함해 템플릿을 연결합니다. |
| [통합](/user-guide/integrations) | 수신 웹훅으로 작업을 시작합니다. |
| [프로젝트 러너](/user-guide/projects/runners) | 프로젝트의 작업을 직접 운영하는 러너로 보냅니다. |
| [내 계정](/user-guide/account) | 개인 설정과 API 토큰입니다. |

## 어디서 시작할까요 {#where-to-start}

누군가 방금 여러분을 프로젝트에 추가했다면 [프로젝트](/user-guide/projects)를 읽어
전체 구조를 파악한 다음, [작업](/user-guide/tasks)에서 작업을 하나 실행하고 로그를
읽어 보십시오. 프로젝트를 처음부터 설정한다면 위 표의 순서대로 진행하십시오.

Semaphore 자체가 처음이신가요? [시작하기](/getting-started)부터 시작하십시오.
