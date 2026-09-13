---
title: Semaphore란 무엇인가
description: Semaphore UI가 하는 일, 해결하는 문제, 대상 사용자, 그리고 다른 도구가 더 나은 선택인 경우.
---

# Semaphore란 무엇인가

Semaphore UI는 이미 보유하고 있는 자동화를 실행하기 위한 셀프 호스팅 웹 인터페이스이자
REST API입니다. Ansible 플레이북, Terraform 구성, 셸 스크립트가 들어 있는 Git 저장소를
지정하고, 어떤 자격 증명과 호스트를 사용할지 알려 주면, Semaphore는 팀이 그 자동화를
실행하고, 필요한 시크릿을 저장하고, 모든 실행 기록을 남기는 단일 창구가 됩니다.

Semaphore는 Ansible, Terraform, 혹은 여러분의 스크립트를 대체하지 않습니다. 누군가의
노트북이 아니라 서버에서 그것들을 실행할 뿐입니다.

## 해결하는 문제 {#the-problem-it-solves}

자동화는 대개 워크스테이션에서 시작됩니다. 엔지니어 한 명이 플레이북, 인벤토리, SSH 키,
그리고 알맞은 버전의 Ansible을 갖추고 있습니다. 두 번째 사람이 같은 작업을 실행해야
하거나, 지난 화요일에 어떤 호스트에서 무엇이 바뀌었는지 누군가 물어보기 전까지는 이
방식이 통합니다.

Semaphore는 실행을 공유 서버로 옮기고, 빠져 있던 부분을 채워 줍니다.

| 빠져 있던 부분 | Semaphore가 제공하는 것 |
|---|---|
| 모두가 도구를 설치해야 함 | 서버(또는 러너) 한 대에만 설치하면 되고, 사용자는 브라우저만 있으면 됩니다. |
| 자격 증명이 노트북 사이를 오감 | 암호화된 [키 저장소](/user-guide/key-store)가 시크릿을 사용자가 아니라 실행에 전달합니다. |
| 누가 무엇을 실행했는지 기록이 없음 | 모든 [태스크](/user-guide/tasks)가 출력, 종료 상태, 사용자, 시간을 보관합니다. |
| 플레이북 하나 실행하려고 root 권한을 줄 수는 없음 | [역할](/user-guide/team)이 누가 실행하고, 편집하고, 보기만 할 수 있는지 결정합니다. |
| 누군가 기억할 때만 실행됨 | [스케줄](/user-guide/schedules), [웹훅](/user-guide/integrations), API 호출이 실행을 시작합니다. |

## 누구를 위한 것인가 {#who-it-is-for}

- **인프라 및 플랫폼 팀** — 이미 Ansible이나 Terraform을 사용하고 있으며, 운영 자격
  증명을 나눠 주지 않고도 동료들이 이를 실행할 수 있게 하고 싶은 경우.
- **CI/CD 플랫폼이 없는 소규모 팀** — 빌드 파이프라인은 필요 없지만 예약 작업과 온디맨드
  운영 작업이 필요한 경우.
- **CI/CD 플랫폼이 있는 팀** — 재시작, 배포, 인증서 갱신 같은 운영 작업을 빌드 시스템에서
  분리하고, 파이프라인 YAML을 읽지 않는 사람들에게도 보이게 하고 싶은 경우.

Semaphore는 셀프 호스팅 방식입니다. SaaS 버전은 없습니다. 바이너리나 컨테이너를 직접
인프라에서 실행하며, 시크릿은 그 밖으로 나가지 않습니다.

## 무엇을 실행하는가 {#what-it-runs}

각 [태스크 템플릿](/user-guide/task-templates)은 애플리케이션을 하나 선택합니다.

- [Ansible](/user-guide/apps/ansible) — 인벤토리, 볼트 비밀번호, 그리고 전체
  `ansible-playbook` 옵션을 갖춘 플레이북.
- [Terraform, OpenTofu, Terragrunt](/user-guide/apps/terraform) — 워크스페이스를 사용하고
  상태는 사용자의 백엔드에 보관하는 plan과 apply.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell),
  [Python](/user-guide/apps/python) — 위에서 다루지 않는 모든 것.

태스크는 서버 자체에서 실행되거나, 관리 대상 시스템 가까이에 배치된
[러너](/admin-guide/runners)에서 실행됩니다.

## 언제 사용하지 말아야 하는가 {#when-not-to-use-it}

한계를 알아 두면 나중에 시간을 아낄 수 있습니다.

- **소스 코드 빌드와 테스트.** Semaphore에는 빌드 아티팩트, 매트릭스 빌드, 풀 리퀘스트
  검사, 컨테이너 레지스트리가 없습니다. 그런 용도로는 GitHub Actions, GitLab CI,
  Jenkins를 사용하고, 파이프라인이 인프라를 건드려야 할 때
  [거기서 Semaphore 태스크를 시작](/admin-guide/cicd)하세요.
- **Ansible이나 Terraform 대체.** Semaphore에는 자체 실행 엔진이 없습니다. 플레이북이
  셸에서 동작하지 않는다면 Semaphore에서도 동작하지 않습니다.
- **CMDB 역할.** [인벤토리](/user-guide/inventory)는 실행에 필요한 인벤토리일 뿐,
  인프라 자산에 대한 신뢰할 수 있는 원본이 아닙니다. 동적 인벤토리를 사용해 실제 원본에서
  생성하세요.
- **조직의 시크릿 관리자 역할.** 시크릿은 저장 시 암호화되며, 사람이 다시 읽어 보는 것이
  아니라 태스크가 사용하도록 설계되었습니다. 이미 HashiCorp Vault 등 다른 저장소를 운영
  중이라면, 시크릿을 복사해 넣지 말고 [연결](/user-guide/key-store)하세요.
- **다운타임이 전혀 허용되지 않는 단일 노드 서비스 운영.** 여러 노드를 동시에 활성화하려면
  [고가용성](/admin-guide/ha)이 필요하며, 이는 Enterprise 기능으로 PostgreSQL 또는 MySQL과
  Redis가 있어야 합니다.

## 다음 단계 {#whats-next}

- [아키텍처](/introduction/architecture) — 프로세스, 데이터베이스, 태스크가 실행되는 위치.
- [핵심 개념](/introduction/concepts) — 인터페이스가 알고 있다고 전제하는 열 가지 용어.
- [시작하기](/getting-started) — 설치하고 무언가를 실행해 보기.
