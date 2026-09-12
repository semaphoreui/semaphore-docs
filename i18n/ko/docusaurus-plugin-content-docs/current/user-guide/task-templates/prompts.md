# 프롬프트

프롬프트는 각 템플릿 유형에 특화된 미리 정의된 플래그와 옵션으로, 이를 활성화하면 실행 시점에 사용자 지정이 가능합니다. 직접 만드는 사용자 정의 필드인 [설문 변수](/user-guide/task-templates/survey-vars)와 달리, 프롬프트는 Ansible, Terraform 및 기타 도구의 특정 CLI 플래그에 대응하는 내장 옵션입니다.

이 기능을 통해 다음을 수행할 수 있습니다:
- 실행 시점에 템플릿 기본값 재정의
- 특정 호스트 또는 리소스 대상 지정
- CLI 플래그로 실행 동작 제어
- API 호출 또는 스케줄을 통한 실행 옵션 전달

## 프롬프트와 설문 변수 비교 {#prompts-vs-survey-variables}

| 기능 | 프롬프트 | 설문 변수 |
|---------|---------|-----------------|
| **정의** | 미리 정의된 템플릿별 옵션 | 직접 만드는 사용자 정의 필드 |
| **예시** | Ansible: `--limit`, `--tags`<br/>Terraform: 워크스페이스, `-destroy` | 환경 이름, 버전 번호, 사용자 정의 파라미터 |
| **설정 방법** | 템플릿의 체크박스로 활성화 | 템플릿 설정에서 이름과 유형을 지정하여 추가 |
| **전달 방식** | 내장 CLI 플래그 | Ansible: `--extra-vars`<br/>Terraform: `-var` |

**프롬프트**는 특정 도구를 위해 Semaphore에 내장된 표준화된 옵션이며, **설문 변수**는 직접 정의하는 유연한 사용자 정의 필드입니다.

## Ansible 프롬프트 {#ansible-prompts}

Ansible playbook 템플릿에서는 다음 CLI 옵션에 대한 프롬프트를 활성화할 수 있습니다:

### Limit {#limit}

playbook 실행 시 대상 호스트를 지정하려면 `--limit` 프롬프트를 활성화합니다.

**CLI 대응 명령**: `ansible-playbook playbook.yml --limit webservers`

**활용 사례**:
- inventory 호스트의 일부에서만 playbook 실행
- 배포 대상 서버 지정
- 전체 배포 전에 단일 호스트에서 변경 사항 테스트

**예시**:
- inventory에 웹 서버 50대가 있습니다
- Limit 프롬프트를 활성화합니다
- 작업 실행 시 `web-01.example.com`을 지정하면 해당 서버만 대상으로 합니다
- 또는 `webservers:&production`을 지정하여 운영 웹 서버만 대상으로 합니다

### Tags {#tags}

특정 태그가 있는 작업만 실행하려면 `--tags` 프롬프트를 활성화합니다.

**CLI 대응 명령**: `ansible-playbook playbook.yml --tags deploy,restart`

**활용 사례**:
- playbook의 특정 부분만 실행
- 설정 작업 없이 배포 단계만 실행
- 전체 playbook 실행 없이 서비스 빠르게 재시작

**예시**:
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Tags 프롬프트를 활성화하고 `deploy,restart`를 입력하면 설치 단계를 건너뜁니다.

### Skip Tags {#skip-tags}

특정 태그가 있는 작업을 건너뛰려면 `--skip-tags` 프롬프트를 활성화합니다.

**CLI 대응 명령**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**활용 사례**:
- 운영 환경에서 선택적 작업 건너뛰기
- 디버그 또는 테스트 작업 제외
- 불필요한 경우 시간이 오래 걸리는 작업 우회

**예시**: 위의 playbook에서 Skip Tags를 활성화하고 `install`을 입력하면 패키지 설치를 건너뛰고 배포 및 재시작 작업만 실행합니다.

### Ansible 프롬프트 활성화하기 {#enabling-ansible-prompts}

Ansible 프롬프트를 활성화하려면:

1. **작업 템플릿**으로 이동하여 Ansible 템플릿을 선택합니다
2. 템플릿 설정에서 **Ansible Prompts** 섹션을 찾습니다
3. 원하는 프롬프트의 체크박스를 활성화합니다:
   - ☐ **Limit** - `--limit` 플래그 활성화
   - ☐ **Tags** - `--tags` 플래그 활성화
   - ☐ **Skip Tags** - `--skip-tags` 플래그 활성화
4. 템플릿을 저장합니다

![](/assets/ansible_2.png)

활성화하면 이 필드들이 작업 실행 양식, API 요청, 스케줄 설정에 표시됩니다.

## Terraform/OpenTofu 프롬프트 {#terraformopentofu-prompts}

Terraform 및 OpenTofu 템플릿에서 Semaphore는 여러 내장 프롬프트를 제공합니다:

### 워크스페이스 선택 {#workspace-selection}

작업 실행에 사용할 Terraform 워크스페이스를 선택합니다.

**CLI 대응 명령**: `terraform workspace select staging`

**활용 사례**:
- 여러 환경(dev, staging, production) 관리
- 서로 다른 구성에 대한 상태 파일 분리
- 인프라 변경 사항을 격리하여 테스트

**설정**:
1. 템플릿의 **Workspaces** 탭에서 워크스페이스를 생성합니다
2. 워크스페이스 선택기가 작업 양식에 자동으로 표시됩니다
3. 사용자는 작업 실행 시 대상 워크스페이스를 선택합니다

자세한 설정은 [Terraform 워크스페이스](/user-guide/apps/terraform/workspaces)를 참고하십시오.

### Destroy 플래그 {#destroy-flag}

인프라를 해체하려면 `-destroy` 플래그를 활성화합니다.

**CLI 대응 명령**: `terraform apply -destroy`

**활용 사례**:
- 임시 테스트 환경 정리
- 인프라 폐기
- 특정 리소스 제거

**중요**: 이 작업은 파괴적인 작업입니다. 주의해서 사용하고 워크플로에 확인 절차를 요구하는 것을 고려하십시오.

### Migrate State 플래그 {#migrate-state-flag}

백엔드 설정을 변경할 때 `-migrate-state` 플래그를 활성화합니다.

**CLI 대응 명령**: `terraform init -migrate-state`

**활용 사례**:
- 다른 백엔드로 상태 이동
- 저장 위치 간 마이그레이션
- 백엔드 설정 업데이트

### Terraform 프롬프트 활성화하기 {#enabling-terraform-prompts}

Terraform 프롬프트는 템플릿 설정에서 사용할 수 있습니다:

1. **작업 템플릿**으로 이동하여 Terraform 템플릿을 선택합니다
2. 템플릿 설정에서 사용 가능한 프롬프트를 설정합니다:
   - 워크스페이스 선택 (워크스페이스가 설정되어 있으면 자동으로 활성화됨)
   - Destroy 플래그 옵션
   - Migrate state 옵션
3. 템플릿을 저장합니다

Terraform 작업을 실행할 때 작업 양식에 이 옵션들이 표시됩니다.

## Bash, PowerShell, Python 프롬프트 {#bash-powershell-and-python-prompts}

Bash, PowerShell, Python 템플릿의 경우 대부분의 사용자 지정이 [설문 변수](/user-guide/task-templates/survey-vars)를 통해 처리되므로 프롬프트가 최소한으로 제공됩니다.

사용 가능한 프롬프트는 다음과 같습니다:

- CLI args
- Branch

이러한 템플릿 유형은 스크립트에 파라미터를 전달할 때 사용자 정의 설문 변수를 활용하는 것이 더 유리합니다.

## 프롬프트 사용하기 {#using-prompts}

### 수동 작업 실행 {#manual-task-execution}

프롬프트가 활성화된 템플릿에서 작업을 실행할 때:

1. 템플릿에서 **Run**을 클릭합니다
2. 활성화된 프롬프트 필드가 포함된 양식이 나타납니다
3. 사용할 프롬프트의 값을 입력합니다 (선택 필드는 비워 둘 수 있습니다)
4. **Run Task**를 클릭합니다

작업은 지정한 프롬프트 값을 CLI 플래그로 전달받아 실행됩니다.

### API 호출 {#api-calls}

API를 통해 프롬프트 값을 전달하려면 요청 페이로드에 포함합니다:

**Ansible 예시:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**중요**: 값이 수용되려면 템플릿에서 프롬프트가 활성화되어 있어야 합니다. 프롬프트를 활성화하지 않고 API로 프롬프트 값을 전달하면 해당 값은 무시됩니다.

### 예약된 작업 {#scheduled-tasks}

스케줄에 프롬프트 값을 포함하여 자동화된 작업 실행을 사용자 지정할 수 있습니다:

**예시**: Ansible 프롬프트가 있는 스케줄
- `limit: "production"` 및 `tags: "deploy"`를 사용하는 일간 배포 스케줄
- `tags: "updates,cleanup"`을 사용하는 주간 유지 관리 스케줄

각 예약 실행이 지정된 옵션을 사용하도록 스케줄 설정에서 프롬프트 값을 설정하십시오.

### 통합 및 webhook {#integrations-and-webhooks}

통합은 webhook에서 값을 추출하여 프롬프트에 매핑할 수 있습니다:

**예시**: GitHub webhook으로 배포 트리거
- webhook에서 브랜치 이름 추출
- 특정 환경을 대상으로 하도록 Limit 프롬프트에 매핑
- 브랜치 환경과 일치하는 서버에만 배포

webhook 설정은 [통합](../integrations)을 참고하십시오.

## 모범 사례 {#best-practices}

### 필요한 프롬프트만 활성화하기 {#enable-only-necessary-prompts}

활성화된 프롬프트마다 작업 양식에 필드가 추가됩니다. 사용자가 실제로 사용자 지정해야 하는 프롬프트만 활성화하십시오.

✅ **좋음**: 특정 호스트를 대상으로 해야 하는 운영 팀을 위해 Limit 활성화
❌ **나쁨**: "혹시 몰라서" 모든 프롬프트 활성화

### 설문 변수와 함께 사용하기 {#combine-with-survey-variables}

도구별 CLI 옵션에는 프롬프트를, 사용자 정의 파라미터에는 설문 변수를 사용하십시오:

**Ansible 템플릿 예시:**
- **프롬프트**: Limit (어떤 호스트), Tags (어떤 작업)
- **설문 변수**: `app_version` (어떤 버전), `enable_rollback` (사용자 정의 로직)

### API 사용법 문서화하기 {#document-api-usage}

템플릿이 API로 트리거되는 경우, 어떤 프롬프트를 사용할 수 있고 예상 형식이 무엇인지 문서화하십시오:

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### 안전한 테스트를 위해 Limit 사용하기 {#use-limit-for-safe-testing}

잠재적으로 파괴적인 playbook은 항상 Limit 프롬프트로 먼저 테스트하십시오:

1. 템플릿에서 Limit 프롬프트를 활성화합니다
2. 첫 번째 실행: `limit: "test-server-01"`을 지정하여 호스트 하나에서 테스트합니다
3. 성공 여부를 확인합니다
4. 두 번째 실행: `limit: "production"`을 지정하여 모든 호스트에 배포합니다

### 프롬프트 조합 검증하기 {#validate-prompt-combinations}

일부 프롬프트 조합은 의미가 없을 수 있습니다. 문서화하거나 검증을 추가하십시오:

- `--tags deploy`와 `--skip-tags deploy`를 함께 사용하면 충돌합니다
- 워크스페이스와 destroy 플래그를 함께 지정할 때는 각별한 주의가 필요합니다

## 일반적인 활용 사례 {#common-use-cases}

### Limit을 사용한 점진적 배포 {#gradual-rollout-with-limit}

Ansible Limit을 사용하여 운영 환경에 점진적으로 배포합니다:

1. 실행 1: `limit: "web-01.example.com"` - 서버 한 대에 배포
2. 문제 모니터링
3. 실행 2: `limit: "webservers:&canary"` - 카나리 서버에 배포
4. 지표 검증
5. 실행 3: `limit: "webservers:&production"` - 전체 배포

### Tags를 사용한 선택적 실행 {#selective-execution-with-tags}

Tags를 사용하여 playbook의 특정 부분만 실행합니다:

**오전**: `tags: "deploy"` - 새 버전 배포
**오후**: `tags: "config"` - 설정 업데이트
**저녁**: `tags: "restart"` - 새 설정으로 서비스 재시작

### 워크스페이스를 사용한 환경 관리 {#environment-management-with-workspaces}

환경 관리에 Terraform 워크스페이스 선택을 사용합니다:

- **개발**: `dev` 워크스페이스 선택 - 저렴한 리소스, 빠른 반복
- **스테이징**: `staging` 워크스페이스 선택 - 테스트를 위한 운영 유사 환경
- **운영**: `prod` 워크스페이스 선택 - 전체 운영 인프라

### Destroy를 사용한 정리 {#cleanup-with-destroy}

임시 인프라에 Terraform destroy를 사용합니다:

1. 테스트 환경 생성: `test-branch-123` 워크스페이스로 실행
2. 통합 테스트 실행
3. 정리: destroy 플래그를 활성화하고 `test-branch-123` 워크스페이스로 실행

## 문제 해결 {#troubleshooting}

### 프롬프트 값이 무시됨 {#prompt-values-ignored}

**문제**: 프롬프트 값을 전달했지만 적용되지 않음

**해결책**: 템플릿 설정에서 해당 프롬프트가 활성화되어 있는지 확인하십시오. 프롬프트는 명시적으로 활성화해야 합니다.

### limit을 지정할 수 없음 {#cannot-specify-limit}

**문제**: 작업 양식에 Limit 필드가 표시되지 않음

**해결책**: 
1. 템플릿을 편집합니다
2. "Ansible Prompts" 섹션을 찾습니다
3. "Limit" 체크박스를 활성화합니다
4. 템플릿을 저장합니다

### 프롬프트 값이 있는 API 호출 실패 {#api-calls-fail-with-prompt-values}

**문제**: 프롬프트 값이 포함된 API 요청이 오류를 반환함

**해결책**: 
1. 템플릿에서 프롬프트가 활성화되어 있는지 확인합니다
2. 요청 본문의 JSON 형식을 확인합니다
3. 필드 이름이 정확히 일치하는지 확인합니다 (`host_limit`이 아닌 `limit`)

### Tags로 작업이 필터링되지 않음 {#tags-not-filtering-tasks}

**문제**: 태그를 지정했지만 모든 작업이 실행됨

**해결책**: 
1. playbook의 작업에 태그가 올바르게 정의되어 있는지 확인합니다
2. 태그 이름에 오타가 없는지 확인합니다
3. 태그가 공백 없이 쉼표로 구분되어 있는지 확인합니다: `deploy, restart`가 아닌 `deploy,restart`

## 관련 문서 {#related-documentation}

- [설문 변수](/user-guide/task-templates/survey-vars) - 템플릿용 사용자 정의 필드
- [Ansible 템플릿](/user-guide/apps/ansible) - Ansible 관련 설정
- [Terraform 템플릿](/user-guide/apps/terraform) - Terraform 관련 설정
- [스케줄](../schedules) - 자동화된 작업 실행
- [통합](../integrations) - webhook으로 트리거되는 작업
- [API 문서](../../admin-guide/api) - API 레퍼런스
