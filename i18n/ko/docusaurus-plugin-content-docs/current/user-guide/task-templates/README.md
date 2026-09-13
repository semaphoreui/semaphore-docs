# 작업 템플릿

작업 템플릿은 무엇을 어떻게 실행할지 정의합니다. 애플리케이션, 리포지토리와 실행할 파일, 인벤토리, 변수 그룹, 자격 증명, 그리고 사용자가 작업을 시작할 때 변경할 수 있는 옵션이 포함됩니다. 모든 [작업](../tasks)은 템플릿에서 생성됩니다.

템플릿은 다음 애플리케이션을 지원합니다:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) 및 [Terragrunt](/user-guide/apps/terragrunt)
* [셸](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

관리자는 애플리케이션을 활성화하거나 비활성화하고 직접 추가할 수 있습니다. [애플리케이션](/user-guide/apps)을 참조하십시오.

## 템플릿 목록 {#template-list}

**작업 템플릿** 섹션에는 프로젝트의 모든 템플릿이 나열됩니다.

![템플릿 목록](/assets/templates-list.webp)

| 열 | 내용 |
|---|---|
| **이름** | 애플리케이션 아이콘과 함께 표시되는 템플릿 이름입니다. **재생** 버튼을 누르면 새 작업이 시작됩니다. |
| **버전** | 빌드 및 배포 템플릿의 경우 최신 빌드 버전이며, 그 외에는 마지막 작업의 결과 아이콘입니다. |
| **상태** | 마지막 작업의 상태 배지 또는 *Not launched*입니다. |
| **마지막 작업** | 마지막 작업의 번호와 이를 시작한 사용자입니다. |
| **Playbook** | 템플릿이 실행하는 파일입니다. |
| **인벤토리**, **변수 그룹**, **리포지토리** | 템플릿에 연결된 리소스입니다. |

목록 위의 탭은 [뷰](./views)로, 이름이 지정된 템플릿 그룹입니다. 오른쪽 상단의 기어 아이콘으로 표시할 열을 선택할 수 있습니다. 행 왼쪽의 화살표를 클릭하면 해당 템플릿의 최근 작업이 펼쳐집니다.

![펼쳐진 템플릿 행](/assets/templates-list-expanded.webp)

## 템플릿 페이지 {#template-page}

템플릿 이름을 클릭하면 해당 페이지가 열립니다. 오른쪽 상단의 버튼은 작업을 시작하며(유형에 따라 **Run**, **Build** 또는 **Deploy**), **Stop all**은 해당 템플릿의 실행 중이거나 대기 중인 모든 작업을 중지합니다.

| 탭 | 내용 |
|---|---|
| **Tasks** | 각 행에 **재실행** 버튼이 있는 이 템플릿의 작업 목록입니다. |
| **Details** | 플레이북, 유형, 인벤토리, 변수 그룹, 리포지토리와 함께 [통계](../projects/stats)와 동일한 필터를 가진 작업 상태 차트가 표시됩니다. |
| **Workspaces** | Terraform, OpenTofu, Terragrunt 템플릿에만 해당하며 워크스페이스 목록을 표시합니다. [워크스페이스](../apps/terraform/workspaces)를 참조하십시오. |

![템플릿 상세 정보](/assets/template-details.webp)

## 템플릿 유형 {#template-types}

| 유형 | 목적 |
|---|---|
| **Task** | 일반 실행입니다. 기본 유형입니다. |
| **Build** | 아티팩트를 생성하고 자동으로 증가하는 버전을 할당합니다. |
| **Deploy** | 빌드 템플릿이 생성한 버전을 배포합니다. |

빌드 및 배포 템플릿과 이들이 플레이북에 전달하는 `semaphore_vars`는 [빌드 및 배포 템플릿](./build-deploy)에서 설명합니다.

## 템플릿 양식 {#template-form}

**Manager** 역할 이상의 사용자는 **새 템플릿**과 연필 아이콘으로 템플릿을 생성하고 편집할 수 있습니다. 양식은 다음 그룹으로 구성됩니다. 애플리케이션 이름이 표시된 필드는 해당 애플리케이션에서만 나타납니다.

### 공통 필드 {#common-fields}

| 필드 | 설명 |
|---|---|
| **이름** | 필수입니다. 템플릿 이름입니다. |
| **설명** | 이름 아래에 표시되는 선택적 텍스트입니다. |
| **앱** | 실행할 애플리케이션입니다. |
| **리포지토리** | 플레이북이나 스크립트가 있는 리포지토리입니다. [리포지토리](../repositories)를 참조하십시오. |
| **브랜치** | 체크아웃할 Git 브랜치입니다. 비어 있으면 리포지토리에 설정된 브랜치를 사용합니다. |
| **Playbook / 스크립트 파일 이름** | 리포지토리 루트를 기준으로 한 파일 경로입니다. Terraform 앱의 경우: 설정이 있는 하위 디렉터리입니다. |
| **다른 작업 디렉터리 사용** | 리포지토리의 다른 디렉터리에서 도구를 실행합니다. |
| **인벤토리** | Ansible 인벤토리 또는 Terraform 앱을 위한 워크스페이스입니다. |
| **변수 그룹** | 변수와 시크릿이 작업에 주입되는 하나 이상의 변수 그룹입니다. [변수 그룹](../environment)을 참조하십시오. |
| **Vault 비밀번호**(Ansible) | Ansible Vault 잠금을 해제하는 데 사용되는 키입니다. [여러 Vault 비밀번호](../apps/ansible#multiple-vault-passwords)를 참조하십시오. |
| **뷰** | 템플릿을 표시할 [뷰](./views) 탭입니다. |
| **CLI args** | JSON 배열 형식의 추가 명령줄 인수입니다. 예: `["-vvv"]`. |

### 유형별 필드 {#type-specific-fields}

| 필드 | 유형 | 설명 |
|---|---|---|
| **시작 버전** | Build | 처음 할당할 버전입니다. 예: `1.0.0`. |
| **빌드 템플릿** | Deploy | 이 템플릿이 배포할 아티팩트를 생성하는 빌드 템플릿입니다. |
| **자동 실행** | Deploy | 빌드가 성공할 때마다 배포를 자동으로 시작합니다. |

### 고급 옵션 {#advanced-options}

| 필드 | 설명 |
|---|---|
| **병렬 작업 허용** | 이 템플릿의 여러 작업이 동시에 실행되도록 합니다. [병렬 작업](#parallel-tasks)을 참조하십시오. |
| **알림**, **성공 시 전송**, **오류 시 전송** | 이 템플릿의 작업에 대해 알림을 보낼지, 그리고 어떤 결과에서 보낼지를 지정합니다. 알림에는 [프로젝트 설정](../projects/settings)의 **이 프로젝트의 알림 허용**도 필요합니다. |
| **러너 태그**(Pro) | 이 태그를 가진 러너에서만 작업을 실행합니다. [프로젝트 러너](../projects/runners)를 참조하십시오. |
| **익스큐터 이미지** | Docker 및 Kubernetes 러너용 컨테이너 이미지입니다. [익스큐터 이미지](#executor-image-docker-and-kubernetes-runners)를 참조하십시오. |
| **작업 러너에 JWT 발급**, **JWT audience**, **JWT TTL** | 작업에 서명된 토큰을 제공합니다. [작업 JWT](./jwt)를 참조하십시오. |
| **새 git 커밋이 발견되면 작업 자동 실행** | 지정된 간격으로 리포지토리를 폴링하고 브랜치가 변경되면 작업을 시작합니다. |
| **설문 변수** | 사용자가 작업을 시작할 때 입력하는 항목입니다. [설문 변수](./survey-vars)를 참조하십시오. |

### 프롬프트 {#prompts}

프롬프트는 사용자가 새 작업 대화 상자에서 내장 옵션을 변경할 수 있게 하는 체크박스입니다. 브랜치, 인벤토리, CLI 인수, 그리고 Ansible의 경우 limit, tags, skip tags, 디버그 수준, Galaxy 설치가 포함됩니다. [프롬프트](./prompts)를 참조하십시오.

### 애플리케이션 옵션 {#application-options}

- **Ansible**: limit, tags, skip tags, Galaxy 설치 옵션입니다. [Ansible](../apps/ansible)을 참조하십시오.
- **Terraform/OpenTofu/Terragrunt**: auto approve와 백엔드 재정의입니다. [Terraform/OpenTofu](../apps/terraform)와 [HTTP 백엔드](../apps/terraform/states)를 참조하십시오.

---

## 병렬 작업 {#parallel-tasks}

기본적으로 동일한 템플릿의 작업은 순차적으로 실행됩니다. 같은 템플릿을 동시에 실행하려면 템플릿 설정에서 "병렬 작업 허용" 옵션을 활성화하십시오.

## 익스큐터 이미지(Docker 및 Kubernetes 러너) {#executor-image-docker-and-kubernetes-runners}

프로젝트 러너가 **Docker**(Pro) 또는 **Kubernetes**(Enterprise) 익스큐터를 사용하는 경우, 각 작업은 보통 러너에 설정된 기본 작업 이미지(예: `semaphoreui/job:latest`)에서 실행됩니다. 이 이미지는 템플릿별로 재정의할 수 있습니다.

1. 템플릿 설정을 엽니다
2. **익스큐터 이미지**를 컨테이너 이미지 참조(예: `my-registry/ansible:2.16` 또는 `semaphoreui/job:latest`)로 설정합니다
3. 템플릿을 저장합니다

**동작**:
- **Docker**와 **Kubernetes** 러너 익스큐터만 이 필드를 적용하며, 로컬 익스큐터는 무시합니다
- `runner.executor.docker.image` 또는 `runner.executor.k8s.image`에 설정된 러너의 기본 이미지를 사용하려면 필드를 비워 두십시오
- UI에서 필드를 비우면 재정의가 제거됩니다

**사용 사례**:
- 다른 툴체인이 필요한 템플릿(구버전 Ansible, 특정 Terraform 버전, 사용자 지정 이미지에 포함된 추가 OS 패키지)
- 러너 전체의 기본값을 변경하지 않고 보안이 중요한 템플릿을 위한 격리된 이미지

기본 이미지 설정은 [러너 설정](/admin-guide/configuration)을, 익스큐터 구성은 [프로젝트 러너](/user-guide/projects/runners)를 참조하십시오.
