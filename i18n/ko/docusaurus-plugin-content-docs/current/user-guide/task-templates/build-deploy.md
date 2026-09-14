# 빌드 및 배포 템플릿

일반적인 **Task** 템플릿 외에도 Semaphore에는 간단한 파이프라인을 구성하는 두 가지 템플릿 유형이 있습니다. **Build**는 버전이 지정된 아티팩트를 생성하고, **Deploy**는 선택한 버전을 서버로 전달합니다. 두 유형 모두 템플릿 양식에서 선택하며, 사용자가 작업을 시작할 때 보이는 화면이 달라집니다.

## 빌드 템플릿 {#build-templates}

빌드 템플릿은 tarball, 컨테이너 이미지, 패키지와 같은 아티팩트를 생성합니다. 모든 빌드 작업에는 템플릿의 **Start Version**(예: `1.0.0`)부터 시작하여 자동으로 증가하는 버전이 부여됩니다. 이 버전은 템플릿 목록과 작업 이력의 **Version** 열에 표시됩니다.

<div class="DialogScreenshot">
  ![빌드 템플릿의 새 작업 대화 상자](/assets/task-new-build.webp)
</div>

playbook에서 `semaphore_vars.task_details.target_version`을 통해 이 버전을 사용하여 아티팩트 이름을 지정하십시오.

## 배포 템플릿 {#deploy-templates}

배포 템플릿은 **Build Template** 필드를 통해 빌드 템플릿과 연결됩니다. 사용자가 **Deploy**를 클릭하면 새 작업 대화 상자에서 배포할 **Build Version**을 묻습니다. 가장 최근에 성공한 빌드가 미리 선택됩니다.

<div class="DialogScreenshot">
![배포 템플릿의 새 작업 대화 상자](/assets/task-new-deploy.webp)
</div>

배포 템플릿에서 **Autorun**을 활성화하면 빌드가 성공할 때마다 배포가 자동으로 시작됩니다. 배포할 버전은 playbook에서 `semaphore_vars.task_details.incoming_version`으로 사용할 수 있습니다.

## `semaphore_vars` 변수 {#the-semaphore_vars-variable}

Semaphore는 실행하는 각 Ansible playbook에 `semaphore_vars` 변수를 전달합니다. 이 변수를 사용하여 어떤 유형의 작업이 실행되었는지, 어떤 버전을 빌드하거나 배포해야 하는지, 누가 작업을 실행했는지, 그리고 작업 메시지를 확인할 수 있습니다.

`build` 작업의 예:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

`deploy` 작업의 예:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

**Bash**, **PowerShell**, **Python** 템플릿의 경우 Semaphore는 동일한 `task_details` 값을 환경 변수로 제공합니다:

| `task_details` 필드 | 환경 변수 | 비고 |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` 또는 `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | 작업을 시작한 사용자 |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | 작업 메시지 |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | `build` 작업에 존재 |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | `deploy` 작업에 존재 |

Bash의 예:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

PowerShell의 예:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Python의 예:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## 파이프라인 예시 {#example-pipeline}

`build` Ansible 역할:

1. GitHub에서 애플리케이션 소스 코드를 가져옵니다.
2. 소스 코드를 컴파일합니다.
3. 바이너리를 `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`로 패키징합니다.
4. tarball을 S3 버킷에 업로드합니다.

`deploy` Ansible 역할:

1. S3 버킷에서 `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz`를 대상 서버로 다운로드합니다.
2. 대상 디렉터리에 압축을 해제합니다.
3. 구성 파일을 생성하거나 업데이트합니다.
4. 애플리케이션 서비스를 재시작합니다.

두 단계를 초과하는 연결, 승인 추가, 실패 시 분기가 필요한 경우에는 [워크플로우](../workflows)를 사용하십시오.
