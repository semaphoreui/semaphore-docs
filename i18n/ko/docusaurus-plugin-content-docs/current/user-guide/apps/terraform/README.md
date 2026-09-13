
# Terraform/OpenTofu

Semaphore UI를 사용하면 Terraform 코드를 실행할 수 있습니다. 이를 위해 **Terraform 코드 템플릿**을 생성해야 합니다.

1. **작업 템플릿** 섹션으로 이동하여 **새 템플릿** 버튼을 클릭합니다.
2. 앱 유형으로 **Terraform**을 선택합니다.
3. 템플릿을 설정하고 **생성** 버튼을 클릭합니다.
4. **실행**을 클릭하여 템플릿을 실행합니다.

## 변수 전달 {#passing-variables}

선택한 **변수 그룹**의 변수는 환경 변수로 주입됩니다. Terraform이 입력 변수로 인식하도록 이름 앞에 `TF_VAR_` 접두사를 붙이십시오:

| 변수 그룹 키 | Terraform 변수 |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

민감한 값의 경우 변수 그룹의 **시크릿** 탭을 사용하십시오. 이 값들은 저장 시 암호화됩니다.

## 워크스페이스 {#workspaces}

Semaphore는 Terraform/OpenTofu 워크스페이스를 기본적으로 지원합니다. 워크스페이스 생성 및 전환, 비공개 모듈용 SSH 키 사용에 대해서는 [워크스페이스](./workspaces)를 참조하십시오.

## 백엔드 재정의 및 HTTP 백엔드 (Pro) {#backend-override-and-http-backend-pro}

Terraform 코드를 수정하지 않고도 템플릿에서 백엔드를 재정의하여 내장 HTTP 백엔드를 사용할 수 있습니다. 자세한 내용은 [HTTP 백엔드 (Pro)](./states)를 참조하십시오.

## Destroy 플래그 및 상태 마이그레이션 {#destroy-flag-and-state-migration}

작업 실행 대화 상자에는 `-destroy` 및 `-migrate-state` 토글이 포함되어 있습니다. 인프라를 해체하거나 Terraform 상태를 마이그레이션할 때 사용하십시오.

## 참고 사항 {#notes}

- Semaphore는 매 실행 전에 `terraform init`을 자동으로 실행합니다.
- 내장 HTTP 백엔드(Pro)를 사용하지 않는 한, 상태는 Terraform 코드에 구성된 백엔드(local, S3, GCS 등)에 의해 관리됩니다.