# 애플리케이션

애플리케이션은 작업 템플릿이 실행하는 도구입니다. Semaphore에는 7개의 내장 애플리케이션이 포함되어 있으며, 관리자는 이를 켜고 끌 수 있고 직접 만든 애플리케이션을 등록할 수도 있습니다.

| 애플리케이션 | ID | 템플릿이 실행하는 내용 | 가이드 |
|---|---|---|---|
| Ansible Playbook | `ansible` | 선택한 인벤토리로 `ansible-playbook`을 실행합니다 | [Ansible](./ansible) |
| Terraform Code | `terraform` | 선택한 하위 디렉터리와 워크스페이스에서 `terraform`을 실행합니다 | [Terraform/OpenTofu](./terraform) |
| OpenTofu Code | `tofu` | `tofu`를 실행하며 옵션은 Terraform과 동일합니다 | [Terraform/OpenTofu](./terraform) |
| Terragrunt Code | `terragrunt` | Terraform 또는 OpenTofu를 래핑하는 `terragrunt`를 실행합니다 | [Terragrunt](./terragrunt) |
| Bash Script | `bash` | `/bin/bash`로 셸 스크립트를 실행합니다 | [셸](./bash) |
| PowerShell Script | `powershell` | `pwsh`로 `.ps1` 스크립트를 실행합니다 | [PowerShell](./powershell) |
| Python Script | `python` | `python3`로 `.py` 스크립트를 실행합니다 | [Python](./python) |

해당 도구는 작업을 실행하는 머신, 즉 Semaphore 서버 또는 [러너](/admin-guide/runners)에 설치되어 있어야 합니다. 공식 Docker 이미지에는 Ansible, Terraform, OpenTofu, Bash, Python이 포함되어 있습니다.

## 애플리케이션 관리 {#managing-applications}

관리자는 사이드바 하단의 계정 메뉴에서 **애플리케이션**을 엽니다.

![애플리케이션 페이지](/assets/apps-list.webp)

각 행의 스위치로 애플리케이션을 활성화하거나 비활성화합니다. 비활성화된 애플리케이션은 템플릿 양식에 제공되지 않지만 기존 템플릿은 계속 동작합니다. 템플릿을 생성할 때는 활성화된 애플리케이션만 표시되므로, 서버에 설치되지 않은 도구는 비활성화하십시오.

애플리케이션을 클릭하면 제목, 아이콘, 바이너리 경로, 우선순위(템플릿 양식에서의 순서)를 변경할 수 있습니다.

## 사용자 지정 애플리케이션 {#custom-applications}

**새 앱**을 사용하면 모든 명령줄 도구를 애플리케이션으로 등록할 수 있습니다:

| 필드 | 설명 |
|---|---|
| **ID** | API와 템플릿에서 사용되는 짧은 식별자입니다. 예: `pulumi`. |
| **아이콘** | 이름 옆에 표시되는 아이콘입니다. |
| **이름** | 템플릿 양식에 표시되는 제목입니다. |
| **경로** | 서버 또는 러너에 있는 실행 파일의 경로입니다. |
| **우선순위** | 애플리케이션 목록에서의 위치입니다. |
| **활성** | 템플릿에서 해당 애플리케이션을 제공할지 여부입니다. |

사용자 지정 애플리케이션의 템플릿은 리포지토리의 스크립트 파일을 인수로 하여 실행 파일을 실행하고, [Bash](./bash) 템플릿과 동일한 방식으로 변수 그룹을 환경 변수로 전달받습니다.

애플리케이션은 서버 설정에서 미리 정의할 수도 있습니다. [설정](/admin-guide/configuration)의 `apps` 섹션을 참조하십시오.
