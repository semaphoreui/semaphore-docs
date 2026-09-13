# 설문 변수

설문 변수는 작업 실행 시 사용자 입력을 수집하기 위해 작업 템플릿에 추가할 수 있는 사용자 정의 입력 필드입니다. playbook이나 스크립트에 값을 하드코딩하는 대신, 실행 시점에 사용자에게 값을 묻는 사용자 정의 변수를 정의할 수 있습니다.

이 기능은 다음과 같은 경우에 유용합니다:
- 같은 템플릿을 다른 파라미터로 실행 (예: 설정 값)
- API 호출을 통한 동적 입력 수용
- 예약된 작업에 사용자 정의 파라미터 전달
- 추출된 webhook 데이터로 통합에서 작업 트리거

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## 설문 변수와 프롬프트 비교 {#survey-variables-vs-prompts}

설문 변수와 프롬프트의 차이를 이해하는 것이 중요합니다:

| 기능 | 설문 변수 | 프롬프트 |
|---------|-----------------|---------|
| **정의** | 직접 만드는 사용자 정의 필드 | 미리 정의된 템플릿별 옵션 |
| **예시** | 환경 이름, 버전 번호, API 엔드포인트 | Ansible: `--limit`, `--tags`<br/>Terraform: 워크스페이스 |
| **설정 방법** | 템플릿 설정에서 이름과 유형을 지정하여 추가 | 템플릿의 체크박스로 활성화 |
| **전달 방식** | Ansible: `--extra-vars`<br/>Terraform: `-var` | 내장 CLI 플래그 |

**설문 변수**는 직접 정의하는 유연한 사용자 정의 필드이며, **프롬프트**는 각 템플릿 유형에 특화된 내장 옵션(예: Ansible의 `--limit` 또는 `--tags` 플래그)입니다.

## 템플릿에 설문 변수 추가하기 {#adding-survey-variables-to-a-template}

설문 변수는 템플릿 설정에서 구성합니다:

1. **작업 템플릿**으로 이동하여 템플릿을 선택합니다
2. 템플릿 설정에서 **설문 변수** 섹션으로 이동합니다
3. **설문 변수 추가**를 클릭합니다
4. 변수를 설정합니다:
   - **Name**: 변수 이름 (코드에서 사용됨)
   - **Title**: 양식에 표시되는 레이블
   - **Type**: 필드 유형 선택
   - **Pass variable as**: 추가 변수(기본값) 또는 환경 변수
   - **Default value**: 작업 양식을 열 때 미리 채워지는 선택적 값
   - **Required**: 필드를 반드시 입력해야 하는지 여부
5. 템플릿을 저장합니다

사용자가 이 템플릿에서 작업을 실행하면 사용자 정의 설문 변수가 포함된 양식이 표시됩니다.

## 변수 유형 {#variable-types}

설문 변수는 여섯 가지 유형을 지원합니다:

### String {#string}

문자열 값을 위한 텍스트 입력 필드입니다.

**활용 사례**: 환경 이름, 브랜치 이름, 호스트 이름, 파일 경로

**예시**: `environment`라는 변수는 사용자에게 "production", "staging" 또는 "development"를 입력하도록 요청합니다

### Integer {#integer}

정수 값을 위한 숫자 입력 필드입니다.

**활용 사례**: 포트 번호, 재시도 횟수, 타임아웃, 리소스 제한

**예시**: `timeout_seconds`라는 변수는 사용자에게 "300" 또는 "600"을 입력하도록 요청합니다

### Text {#text}

더 긴 문자열 값을 위한 여러 줄 텍스트 영역입니다.

**활용 사례**: commit 메시지, JSON 조각, 자유 형식 메모, 여러 줄 설정

**예시**: 배포 전에 사용자가 릴리스 노트를 붙여넣는 `changelog`라는 변수

### Enum (단일 선택) {#enum-single-select}

사용자가 미리 정의된 목록에서 정확히 하나의 옵션을 선택하는 드롭다운 메뉴입니다.

**활용 사례**: 환경 유형, 배포 전략, 불리언과 유사한 선택

**예시**: "rolling", "blue-green", "canary" 옵션이 있는 `deployment_type`이라는 변수

enum 변수를 생성할 때는 변수 편집기에서 각 옵션에 표시 레이블과 값을 추가합니다.

### Select (다중 선택) {#select-multi-select}

사용자가 미리 정의된 목록에서 하나 이상의 옵션을 선택할 수 있는 드롭다운입니다. 선택된 값은 단일 문자열이 아닌 JSON 배열(예: `["staging","production"]`)로 전달됩니다.

**활용 사례**: 대상 리전, 기능 플래그, 여러 호스트 그룹, 태그 목록

**예시**: `us-east-1`, `eu-west-1`, `ap-southeast-1` 옵션이 있는 `target_regions`라는 변수

**제약 사항**:
- 기본값은 옵션 목록에서 선택해야 하며 여러 개를 선택할 수 있습니다
- Bash, PowerShell, Python 템플릿에서는 인수 또는 환경 변수 값에서 JSON 배열을 파싱해야 합니다 (아래 예시 참고)

### Secret {#secret}

값이 숨겨지는 비밀번호 입력 필드입니다.

**활용 사례**: API 키, 비밀번호, token, 민감한 설정

**예시**: 보안을 위해 입력한 값이 점으로 표시되는 `api_token`이라는 변수

## 기본값 {#default-values}

대부분의 변수 유형에 선택적 기본값을 설정할 수 있습니다. 사용자가 작업 실행 대화 상자를 열면 필드가 이 기본값으로 미리 채워집니다.

- **String, integer, text, secret**: 단일 기본값
- **Enum**: 목록에서 하나의 옵션
- **Select**: 목록에서 하나 이상의 옵션

기본값은 같은 템플릿이 예측 가능한 파라미터로 반복 실행되는 스케줄과 통합에 유용합니다. 사용자는 작업을 시작하기 전에 값을 변경할 수 있습니다.

## 변수 전달 방식 (대상) {#pass-variable-as-target}

각 설문 변수는 두 가지 방식 중 하나로 전달할 수 있습니다:

| 설정 | 동작 |
|---------|----------|
| **Extra variable** (기본값) | 앱별 방식으로 전달됩니다: Ansible `--extra-vars`, Terraform `-var`, 또는 셸 앱의 경우 `name=value` CLI 인수 |
| **Environment variable** | 설문 변수 이름과 동일한 이름의 프로세스 환경 변수로 설정됩니다 |

스크립트나 도구가 CLI 플래그 대신 환경에서 값을 읽는 경우 **Environment variable**을 사용하십시오. `TF_VAR_` 규칙을 따라야 하는 Terraform 변수의 경우, 설문 변수 이름을 `TF_VAR_instance_type`으로 지정하고 대상을 환경 변수로 설정하십시오.

환경 변수 대상을 가진 변수는 extra-vars, `-var` 또는 CLI 인수에 중복으로 전달되지 **않습니다**. 각 값은 정확히 한 번만 전달됩니다.

## 설문 변수가 작업에 전달되는 방식 {#how-survey-variables-are-passed-to-tasks}

설문 변수는 템플릿 유형과 **Pass variable as** 설정에 따라 다르게 전달됩니다.

**다중 선택(`select` 유형) 값**은 모든 전달 경로(extra-vars JSON, `-var`, CLI 인수, 환경 변수)에서 JSON으로 인코딩된 배열입니다. 옵션 `1`과 `2`를 선택하면 공백으로 구분된 문자열이 아닌 `["1","2"]`가 됩니다.

### Ansible 템플릿 {#ansible-templates}

설문 변수는 `--extra-vars` 플래그를 사용하여 Ansible 추가 변수로 전달됩니다.

**예시**: `app_version`이라는 설문 변수를 정의한 경우:

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

작업 실행 시 사용자가 설문 양식에 "2.5.0"을 입력하면 Ansible은 다음과 같이 값을 받습니다:

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Terraform/OpenTofu 템플릿 {#terraformopentofu-templates}

설문 변수는 `-var` 플래그를 사용하여 Terraform 변수로 전달됩니다.

**예시**: `instance_count`라는 설문 변수를 정의한 경우:

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

작업 실행 시 사용자가 설문 양식에 "3"을 입력하면 Terraform은 다음과 같이 값을 받습니다:

```bash
terraform apply -var="instance_count=3"
```

### Shell/Bash 템플릿 {#shellbash-templates}

설문 변수는 Bash 스크립트에 명령줄 인수로 전달됩니다:

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

스크립트 내에서 다음 코드를 사용하여 인수를 배열로 파싱할 수 있습니다:

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

**다중 선택** 변수의 경우 값은 JSON 배열 문자열입니다. `jq`로 파싱하십시오 (실행기 이미지에서 `jq`를 사용할 수 있는지 확인하십시오):

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### PowerShell 템플릿 {#powershell-templates}

설문 변수는 실행 중인 PowerShell 스크립트에 명령줄 인수로 전달됩니다:

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


인수를 파싱하려면 실행 중인 스크립트에서 다음 코드를 사용하십시오:

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

**다중 선택** 변수의 경우 인수 값에서 JSON 배열을 파싱하십시오:

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Python 템플릿 {#python-templates}

설문 변수는 실행 중인 Python 스크립트에 명령줄 인수로 전달됩니다:

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

인수를 파싱하려면 실행 중인 스크립트에서 다음 코드를 사용하십시오:

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

**다중 선택** 변수의 경우 JSON 배열을 파싱하십시오:

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## 설문 변수 사용하기 {#using-survey-variables}

### 수동 작업 실행 {#manual-task-execution}

설문 변수가 있는 템플릿에서 작업을 실행할 때:

1. 템플릿에서 **Run**을 클릭합니다
2. 정의된 모든 설문 변수가 포함된 양식이 나타납니다
3. 각 필드의 값을 입력합니다
4. **Run Task**를 클릭합니다

작업은 입력한 값을 playbook 또는 스크립트에 전달받아 실행됩니다.
<!-- 
### API calls {#api-calls}

To pass survey variable values via API:

**Example API request:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

Survey variable values are passed in the `environment` object of the request payload.

**Important**: The task runs unattended when triggered via API—no interactive prompt appears. -->

### 예약된 작업 {#scheduled-tasks}

스케줄에 설문 변수 값을 포함하여 같은 템플릿을 서로 다른 스케줄에서 다른 파라미터로 실행할 수 있습니다.

**설정:**

1. 템플릿에 설문 변수를 추가합니다
2. 해당 템플릿의 스케줄을 생성합니다
3. 스케줄 설정에서 설문 변수의 값을 정의합니다
4. 각 예약 실행은 미리 정의된 값을 사용합니다

**활용 사례 예시**: 서로 다른 보관 정책으로 백업 playbook 실행:
- `retention_days=7`을 사용하는 일간 스케줄
- `retention_days=30`을 사용하는 주간 스케줄
- `retention_days=365`를 사용하는 월간 스케줄

자세한 내용은 [스케줄](../schedules) 문서를 참고하십시오.

### 통합 및 webhook {#integrations-and-webhooks}

통합은 수신된 webhook에서 값을 추출하여 설문 변수에 매핑할 수 있습니다.

**설정:**

1. 템플릿에 설문 변수를 추가합니다
2. 이 템플릿을 트리거하는 통합을 생성합니다
3. webhook 페이로드에서 데이터를 가져오는 값 추출기를 설정합니다
4. 추출된 값을 설문 변수에 매핑합니다

**예시**: GitHub 릴리스가 생성될 때 배포 트리거:
- webhook 페이로드에서 릴리스 태그 추출
- `release_version`이라는 설문 변수에 매핑
- 배포 playbook이 버전 번호를 받음

자세한 내용은 [통합](../integrations) 문서를 참고하십시오.

## 모범 사례 {#best-practices}

### 설명적인 이름 사용하기 {#use-descriptive-names}

설문 변수의 목적을 나타내는 명확하고 설명적인 이름을 선택하십시오:
- ✅ 좋음: `target_environment`, `app_version`, `backup_retention_days`
- ❌ 나쁨: `env`, `ver`, `days`

### 유용한 제목 제공하기 {#provide-helpful-titles}

제목은 양식에 표시되므로 사용자가 이해하기 쉽게 작성하십시오:
- 변수 이름: `db_host`
- 제목: "Database hostname or IP address"

### 알려진 옵션에는 enum 또는 select 사용하기 {#use-enum-or-select-for-known-options}

사용자가 제한된 옵션 집합에서 선택해야 하는 경우 string 대신 enum 또는 select를 사용하십시오:
- ✅ 정확히 하나만 선택할 때는 **Enum**: production, staging 또는 development
- ✅ 여러 선택이 유효할 때는 **Select**: 여러 리전 또는 기능 플래그
- ❌ "production 또는 staging을 입력하세요"라는 안내가 있는 String 필드

### 환경 변수 대상은 신중하게 사용하기 {#use-environment-variable-target-deliberately}

playbook, 스크립트 또는 도구가 프로세스 환경에서 명시적으로 값을 읽는 경우가 아니라면 기본 추가 변수 전달 방식을 사용하십시오. 환경 변수 대상 변수의 이름은 다운스트림 도구가 기대하는 이름과 정확히 일치하도록 지정하십시오 (예: `TF_VAR_region`).

### 필수 필드를 적절히 표시하기 {#mark-required-fields-appropriately}

정말 필요한 경우에만 필드를 필수로 표시하십시오. 선택 필드에 대해서는 playbook에서 합리적인 기본값을 제공하는 것을 고려하십시오.

### 코드에서 검증하기 {#validate-in-your-code}

설문 변수 값이 항상 유효하다고 가정하지 마십시오. playbook이나 스크립트에 검증 로직을 추가하십시오:

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### 민감한 데이터에는 secret 사용하기 {#use-secrets-for-sensitive-data}

API 키, 비밀번호, token과 같은 민감한 값에는 항상 secret 유형을 사용하십시오. 이렇게 하면 UI와 로그에서 값이 숨겨집니다.

### 변수 그룹과 함께 사용하기 {#combine-with-variable-groups}

설문 변수는 [변수 그룹](../environment)과 잘 어울립니다:
- 여러 작업에서 공유되는 정적 설정에는 **변수 그룹**을 사용하십시오
- 작업 실행마다 달라지는 값에는 **설문 변수**를 사용하십시오

**예시**:
- 변수 그룹: 데이터베이스 연결 정보, API 엔드포인트
- 설문 변수: 배포 환경, 버전 번호, 기능 플래그

## 일반적인 활용 사례 {#common-use-cases}

### 환경별 배포 {#environment-specific-deployments}

다음과 같은 설문 변수를 생성합니다:
- `environment`: "production, staging, development" 옵션이 있는 enum
- `app_version`: 배포할 버전을 위한 string
- `enable_debug`: "true, false" 옵션이 있는 enum

### 데이터베이스 작업 {#database-operations}

다음과 같은 설문 변수를 생성합니다:
- `db_name`: 데이터베이스 이름을 위한 string
- `backup_retention_days`: 보관 정책을 위한 integer
- `maintenance_window`: 시간 창을 위한 string

### 인프라 프로비저닝 {#infrastructure-provisioning}

다음과 같은 설문 변수를 생성합니다:
- `instance_count`: 인스턴스 수를 위한 integer
- `instance_type`: "t2.micro, t2.small, t2.medium" 옵션이 있는 enum
- `region`: AWS 리전이 있는 enum

### CI/CD pipeline {#cicd-pipelines}

다음과 같은 설문 변수를 생성합니다:
- `git_branch`: 빌드할 브랜치를 위한 string
- `build_type`: "debug, release" 옵션이 있는 enum
- `run_tests`: "true, false" 옵션이 있는 enum

## 변수 그룹과의 차이점 {#differences-from-variable-groups}

| 기능 | 설문 변수 | 변수 그룹 |
|---------|-----------------|-----------------|
| **목적** | 작업별 실행 시점 입력 | 재사용 가능한 정적 설정 |
| **정의 시점** | 작업 실행 시점 | 프로젝트에 미리 설정 |
| **활용 사례** | 실행마다 달라지는 값 | 여러 작업에서 공유되는 설정 |
| **형식** | 유형이 지정된 개별 필드 | 중첩 객체가 있는 JSON 형식 |
| **범위** | 단일 작업 실행 | 여러 템플릿/inventory |
| **보안** | secret 유형으로 민감한 값 숨김 | 민감한 데이터를 위한 Secrets 탭 |

실행 시점의 유연성이 필요하면 설문 변수를, 여러 작업 실행에서 일관된 설정을 원하면 변수 그룹을 사용하십시오.
