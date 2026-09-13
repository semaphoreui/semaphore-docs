# Terragrunt

[Terragrunt](https://terragrunt.gruntwork.io/)는 Terraform과 OpenTofu를 위한 래퍼로, 설정을 DRY하게 유지하고 모듈 간 의존성을 관리합니다. Semaphore는 [Terraform/OpenTofu](./terraform)와 동일한 방식으로 Terragrunt를 실행하며, 여기에 설명된 몇 가지 차이점이 있습니다.

## 사전 요구 사항 {#prerequisites}

1. 작업을 실행하는 Semaphore 서버 또는 [러너](/admin-guide/runners)에 `terragrunt` 바이너리와 `terraform` 또는 `tofu` 바이너리를 설치하십시오.
2. **Terragrunt Code** 애플리케이션을 활성화하십시오. 기본적으로 비활성화되어 있습니다. 계정 메뉴에서 **애플리케이션**을 열고 스위치를 켜십시오. [애플리케이션](/user-guide/apps)을 참조하십시오.

## Terragrunt 템플릿 생성 {#creating-a-terragrunt-template}

1. **작업 템플릿**으로 이동하여 **새 템플릿**을 클릭합니다.
2. 앱으로 **Terragrunt Code**를 선택합니다.
3. **리포지토리**와 `terragrunt.hcl`이 있는 하위 디렉터리를 설정합니다.
4. 인벤토리 필드에서 **워크스페이스**를 선택하거나 생성합니다. Terragrunt 템플릿은 `terragrunt-workspace` 유형의 인벤토리를 사용합니다. [워크스페이스](./terraform/workspaces)를 참조하십시오.
5. **생성**을 클릭한 다음 **실행**을 클릭합니다.

![Terragrunt 템플릿](/assets/templates-list.webp)

## 작업 실행 {#running-tasks}

새 작업 대화 상자는 Terraform과 동일한 옵션을 제공합니다: **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure**.

Semaphore는 `terragrunt run -- <terraform arguments>`를 호출하고, 템플릿의 CLI 인수에 이미 `--tf-path`를 설정하지 않은 경우 `--tf-path`로 Terraform 또는 OpenTofu 바이너리를 전달합니다. 워크스페이스 선택은 `terragrunt run -- workspace select -or-create=true <name>`으로 수행됩니다.

선택한 **변수 그룹**의 변수는 환경 변수로 전달되므로 입력 변수에는 `TF_VAR_` 접두사를 사용하십시오. 추가 변수와 설문 변수는 `-var name=value` 인수로 전달됩니다.

## 참고 사항 {#notes}

- `terragrunt`는 모든 명령 전에 `init`을 자동으로 실행합니다.
- HTTP 상태 백엔드와 **워크스페이스** 탭의 상태 목록은 Terraform과 동일하게 동작합니다. [HTTP 백엔드](./terraform/states)를 참조하십시오.
- 여러 모듈에 걸쳐 `run-all`을 사용하려면 템플릿의 **CLI args**에 해당 인수를 추가하십시오.
