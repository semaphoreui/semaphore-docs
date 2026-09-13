# 작업

작업은 [작업 템플릿](./task-templates)을 한 번 실행한 것입니다. 즉 Ansible playbook 한 번의 실행, Terraform/OpenTofu/Terragrunt 구성 한 번의 실행, 또는 Bash, PowerShell, Python 스크립트 한 번의 실행을 의미합니다. 모든 작업은 자체 로그, 상태, 세부 정보를 보관하므로 무엇이 언제, 누구에 의해, 리포지토리의 어떤 리비전으로 실행되었는지 항상 확인할 수 있습니다.

## 작업 시작 {#starting-a-task}

프로젝트에서 **Task Runner** 역할 이상이 필요합니다([팀](./team) 참고). 다음 두 곳에서 작업을 시작할 수 있습니다:

- **Task Templates**에서 템플릿 행의 **play** 버튼을 클릭합니다.
- 템플릿 페이지에서 오른쪽 상단의 버튼을 클릭합니다. 버튼 레이블은 템플릿 유형에 따라 **Run**, **Build**, **Deploy**로 달라집니다.

두 방법 모두 **New Task** 대화 상자를 엽니다. 대화 상자의 내용은 애플리케이션과 템플릿에서 활성화된 옵션에 따라 달라집니다.

![Ansible 템플릿의 새 작업 대화 상자](/assets/task-new-ansible.webp)

| 필드 | 표시 대상 | 설명 |
|---|---|---|
| **Message** | 모든 템플릿 | 작업과 함께 저장되며 이력과 알림에 표시되는 선택적 메모입니다. |
| **Build Version** | 배포 템플릿 | 배포할 빌드입니다. 가장 최근에 성공한 빌드가 기본으로 선택됩니다. [빌드 및 배포 템플릿](./task-templates/build-deploy)을 참고하십시오. |
| 설문 변수 | [설문 변수](./task-templates/survey-vars)가 있는 템플릿 | 변수마다 입력 필드가 하나씩 표시되며, 필수 변수는 반드시 입력해야 합니다. |
| **Dry Run** `--check`, **Diff** `--diff` | Ansible | playbook을 점검 모드로 실행하거나 파일 변경 사항을 표시합니다. 다른 Ansible 프롬프트(Limit, Tags, Skip tags, Debug)는 템플릿에서 활성화한 경우 표시됩니다. [프롬프트](./task-templates/prompts)를 참고하십시오. |
| **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure** | Terraform, OpenTofu, Terragrunt | `plan`만 실행하거나 `-destroy`, `-auto-approve`, `-upgrade`, `-reconfigure`를 추가합니다. [Terraform/OpenTofu](./apps/terraform)를 참고하십시오. |
| **Branch**, **Inventory**, **CLI args** | 모든 애플리케이션 | 이번 실행에 대해 템플릿 값을 재정의합니다. 각 재정의는 템플릿 설정에서 허용되어 있어야 합니다. |

![Terraform 템플릿의 새 작업 대화 상자](/assets/task-new-terraform.webp)

**Run**(또는 **Build** / **Deploy**)을 클릭하면 작업이 대기열에 추가됩니다.

### 대기열과 병렬 실행 {#queue-and-parallel-execution}

동일한 템플릿의 작업은 템플릿에서 **Allow parallel tasks**를 활성화하지 않은 경우 순차적으로 실행됩니다. 또한 [프로젝트 설정](./projects/settings)의 **Max number of parallel tasks**로 프로젝트 전체의 실행 중 작업 수를 제한할 수 있습니다. 대기해야 하는 작업은 `waiting` 상태로 유지되며 여유 슬롯이 생기면 자동으로 시작됩니다.

## 작업 창 {#task-window}

UI에서 작업을 클릭하면 작업 창이 열립니다. 헤더에는 템플릿, 작업 번호, 리포지토리 리비전의 커밋 메시지, 상태 배지, 작업을 시작한 사용자와 시각, 소요 시간이 표시됩니다. 화살표 아이콘을 클릭하면 창이 전체 화면으로 확장됩니다.

![작업 로그](/assets/task-log.webp)

| 탭 | 내용 |
|---|---|
| **Log** | 타임스탬프가 포함된 작업의 실시간 출력입니다. 작업이 실행되는 동안 로그가 스트리밍됩니다. **Raw log**를 클릭하면 가공되지 않은 출력이 새 브라우저 탭에서 열립니다. |
| **Details** | 템플릿 정보(애플리케이션, 템플릿), 커밋 정보(메시지와 해시), 실행 정보(메시지, 생성 시각, 시작 시각, 종료 시각, 소요 시간), 그리고 설정된 경우 해당 실행에 사용된 러너, 브랜치, limit, 변수가 표시됩니다. |
| **Summary** (Pro) | Ansible 작업의 경우 정상적으로 완료된 호스트 수와 실패한 호스트 수를 서버별 실패 작업 표와 함께 보여줍니다. |

![작업 세부 정보](/assets/task-details.webp)

![작업 요약](/assets/task-summary.webp)

## 작업 상태 {#task-statuses}

| 상태 | 의미 |
|---|---|
| `waiting` | 작업이 대기열에 있습니다. 동일한 템플릿의 다른 작업이 실행 중이거나, 프로젝트 제한에 도달했거나, 아직 사용 가능한 러너가 없습니다. |
| `starting` | 러너가 작업을 가져와 리포지토리와 환경을 준비하고 있습니다. |
| `waiting_confirmation` | 도구가 질문을 하고 사용자를 기다리고 있습니다. 예를 들어 **Auto Approve** 없이 실행한 `terraform apply`나 입력을 읽는 스크립트가 이에 해당합니다. 작업 창에서 **Confirm** 또는 **Reject**를 사용하십시오. |
| `confirmed` | 사용자가 질문을 확인했으며 작업이 계속됩니다. |
| `rejected` | 사용자가 질문을 거부했으며 작업이 종료됩니다. |
| `running` | playbook 또는 스크립트가 실행 중입니다. |
| `stopping` | 중지가 요청되었으며 프로세스가 종료되고 있습니다. |
| `stopped` | 사용자가 작업을 중지했습니다. |
| `success` | 종료 코드 0으로 완료되었습니다. |
| `error` | 0이 아닌 종료 코드로 완료되었거나 시작에 실패했습니다. UI에는 **Failed**로 표시됩니다. |

## 작업 중지 {#stopping-tasks}

실행 중인 작업의 작업 창을 열고 **Stop**을 클릭합니다. Semaphore가 종료 신호를 보내고, 프로세스가 종료되는 동안 작업은 `stopping` 상태가 됩니다. 프로세스가 반응하지 않으면 버튼이 **Force Stop**으로 바뀌며, 이를 클릭하면 프로세스를 즉시 종료합니다.

하나의 템플릿에서 실행 중이거나 대기 중인 모든 작업을 중지하려면 템플릿 페이지를 열고 **Stop all**을 사용하십시오. 드롭다운에서 **Stop**과 **Force stop**을 모두 선택할 수 있습니다.

<div style={{maxWidth: 200}}>

![모두 중지 메뉴](/assets/task-stop-all-menu.webp)

</div>

## 작업 다시 실행 {#running-a-task-again}

템플릿의 **Tasks** 탭에서 각 행에는 **rerun** 버튼이 있습니다. 이 버튼을 클릭하면 해당 작업의 메시지와 파라미터가 채워진 새 작업 대화 상자가 열립니다.

![다시 실행 버튼이 있는 템플릿 작업 목록](/assets/template-tasks.webp)

## 작업이 표시되는 위치 {#where-tasks-are-listed}

- **Dashboard → History**: 프로젝트의 모든 작업입니다. [이력](./projects/history)을 참고하십시오.
- **Template page → Tasks**: 하나의 템플릿에 속한 작업입니다.
- **Task Templates**: 왼쪽의 화살표로 행을 펼치면 목록을 벗어나지 않고 해당 템플릿의 최근 작업을 확인할 수 있습니다.

## 로그 보관 {#log-retention}

작업과 로그는 기본적으로 영구히 보관됩니다. 각 템플릿의 최근 작업만 보관하려면 `max_tasks_per_template`를 사용하십시오. [이력](./projects/history#task-retention)을 참고하십시오.
