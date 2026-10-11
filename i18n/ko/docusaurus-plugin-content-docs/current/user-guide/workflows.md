---
title: "워크플로우"
sidebar_custom_props:
  edition: pro
---

# 워크플로우 <Pro />

워크플로우를 사용하면 여러 작업 템플릿을 분기, 승인, 시간 지정 일시 중지가 포함된
방향 그래프(DAG)로 연결할 수 있습니다. 워크플로우 실행은 각 단계가 완료될 때마다
자동으로 진행됩니다. 시각적 편집기에서 그래프를 한 번 설계한 다음, 워크플로우
페이지에서 실행을 시작하면 됩니다.

:::info
워크플로우는 **Semaphore Pro** 기능입니다. 워크플로우 메뉴 항목은 구독에 해당
기능이 포함된 경우에만 표시됩니다.
:::

## 개요 {#overview}

워크플로우는 다음으로 구성됩니다:

- **노드** — 그래프의 단계입니다(템플릿 실행, 승인 대기, 지연을 위한 일시 중지,
  또는 메모로 주석 달기).
- **엣지** — 노드 간의 연결입니다. 각 엣지에는 다운스트림 노드가 언제 시작되는지를
  제어하는 **조건**이 지정됩니다.

워크플로우를 시작하면 Semaphore는 **워크플로우 실행**을 생성합니다. 진행은 서버가
주도합니다. 작업이 완료되거나 승인이 처리되거나 지연이 만료되면 엣지 조건에 따라
다운스트림 노드가 시작됩니다.

## 워크플로우 생성 {#creating-a-workflow}

1. 프로젝트를 열고 **Workflows**로 이동합니다.
2. **New Workflow**를 클릭합니다.
3. 그래픽 편집기에서:
   - 팔레트에서 노드를 캔버스로 끌어다 놓습니다.
   - 한 노드의 출력 핸들에서 다른 노드로 끌어서 노드를 연결합니다.
   - 노드나 엣지를 클릭하여 측면 패널에서 속성을 편집합니다.
4. **name**을 설정합니다(실행 버전 관리를 위한 **start version**은 선택 사항입니다).
5. **Problems** 패널에 표시된 문제를 모두 해결한 다음 **Save**를 클릭합니다.

![워크플로우 편집기](/assets/workflow-editor.webp)

편집기는 저장하기 전에 그래프를 검증합니다. 유효한 워크플로우에는 최소 하나의
노드가 있어야 하고, 시작 노드가 정확히 하나(들어오는 엣지가 없는 노드)여야 하며,
순환이 없어야 하고, 실행 가능한 모든 노드의 구성이 완료되어 있어야 합니다.

## 노드 종류 {#node-kinds}

| 종류 | 용도 |
|------|---------|
| **Task** | 작업 템플릿을 실행합니다. **task params**를 통해 노드별로 템플릿 파라미터(인벤토리, 환경, Ansible limit, 추가 CLI 인수)를 재정의할 수 있습니다. |
| **Approval** | 권한이 있는 사용자가 승인하거나 거부할 때까지 실행을 일시 중지합니다. 타임아웃(초)과 승인 메시지를 선택적으로 설정할 수 있습니다. |
| **Delay** | 다운스트림 노드로 계속 진행하기 전에 구성된 초 동안 대기합니다. 대기 기간, 유지 관리 시간대, 또는 의존 단계 사이에 간격을 두는 데 유용합니다. |
| **Note** | 캔버스에 자유롭게 작성하는 주석입니다. Note 노드는 실행되지 않으며 엣지로 연결되지 않습니다. 문서화 용도로만 사용됩니다. |

### 수렴 {#convergence}

들어오는 엣지가 여러 개인 노드는 모든 업스트림 노드가 완료되어야 하도록
(기본값) 설정하거나, 그중 하나만 완료되면 진행하도록 설정할 수 있습니다. 노드 속성
패널에서 **Convergence**를 설정하십시오.

### Delay 노드 {#delay-nodes}

Delay 노드는 구성된 기간(최소 1초) 동안 워크플로우 실행을 일시 중지합니다.
대기하는 동안:

- 실행은 **running** 상태를 유지합니다.
- 실행 화면의 Delay 노드에 실시간 카운트다운이 표시됩니다.
- 엣지로 연결된 다운스트림 노드는 지연이 완료될 때까지 시작되지 않습니다.

지연이 진행되는 동안 워크플로우 실행이 **중지**되면 지연이 취소되고 실행은
**stopped** 상태로 종료됩니다.

### Approval 노드 {#approval-nodes}

실행이 Approval 노드에 도달하면 누군가 승인하거나 거부할 때까지 상태가
**approval**로 변경됩니다. 실행 화면에 승인/거부 컨트롤이 표시됩니다.
거부된 승인은 연결된 엣지 조건에 따라 실행을 실패 처리합니다.

## 엣지 조건 {#edge-conditions}

각 엣지에는 다운스트림 노드가 언제 준비 상태가 되는지를 결정하는 조건이 있습니다:

| 조건 | 다음 조건에서 다운스트림이 시작됩니다: 업스트림 노드가… |
|-----------|-------------------------------------------|
| **On success** | 성공적으로 완료된 경우(기본값). |
| **On failure** | 오류로 완료된 경우. |
| **Always** | 모든 종료 상태(성공 또는 실패)로 완료된 경우. |

보정 작업이나 알림에는 **On failure** 분기를 사용하십시오. 결과와 상관없이 다음
단계를 실행해야 할 때는 **Always**를 사용하십시오.

## 실행 및 모니터링 {#running-and-monitoring}

- **Run workflow** — 워크플로우 목록에서 새 실행을 시작합니다.
- **Run view** — 각 노드의 실시간 상태(실행 중, 성공, 실패, 승인, 지연 카운트다운)가
  표시되는 전체 화면 그래프입니다.
- **Stop** — 실행이 `running` 또는 `approval` 상태인 동안
  `run_project_tasks` 권한이 있는 사용자가 중지할 수 있습니다. 모든 활성 작업이
  중지되고 대기 중인 승인은 거부되며 실행은 **stopped**로 표시됩니다.

실행 상태: `running`, `approval`, `success`, `failed`, `stopped`.

## 실행 버전 관리 {#run-versioning}

워크플로우에 **Start version**(예: `1.0.0`)을 설정하면 각 실행에 버전 레이블이
활성화됩니다. Semaphore는 빌드 템플릿과 유사하게 실행이 이어질 때마다 버전을
증가시킵니다.

## 출력과 입력 {#outputs-and-inputs}

작업 노드는 뒤따르는 노드에 구조화된 데이터를 전달할 수 있습니다. 작업은 **출력을 생성**합니다.
출력은 이름이 지정된 값으로 이루어진 JSON 객체이며, 작업이 성공하면 작업과 함께 저장됩니다.
다음 작업 노드로 들어가는 연결은 **입력을 전달**합니다. 즉, 이전 노드의 출력으로 해당 노드
템플릿의 설문 변수를 채웁니다. 파일은 전달되지 않으며 값만 전달됩니다.

### 출력 생성 {#producing-outputs}

워크플로우 실행으로 시작된 모든 작업은 환경 변수 `SEMAPHORE_OUTPUTS_FILE`을 받습니다. 이 변수는
해당 작업만을 위해 생성된 빈 파일의 경로입니다. 작업이 이 파일에 JSON 객체로 기록한 내용이
작업의 출력이 됩니다.

| 앱 | 출력 생성 방식 |
|-----|--------------------------|
| **Ansible** | `per_host: false`(기본값)로 설정한 `ansible.builtin.set_stats`. 함께 제공되는 `semaphore_outputs` 콜백 플러그인이 집계된 실행 통계를 파일에 기록합니다. 호스트별 통계는 출력이 아닙니다. |
| **Terraform, OpenTofu, Terragrunt** | 실행이 성공한 후 `output -json`에서 자동으로 수집됩니다. 작업이 직접 파일에 기록한 값은 같은 이름으로 수집된 출력보다 우선합니다. |
| **Bash, Python, PowerShell, Pulumi** | 스크립트가 파일을 기록합니다. |

```bash
# Bash: 출력 파일 기록
cat > "$SEMAPHORE_OUTPUTS_FILE" <<EOF
{"image_tag": "1.4.2", "replicas": 3, "subnet_ids": ["subnet-1", "subnet-2"]}
EOF
```

```yaml
# Ansible: set_stats가 출력이 됨
- name: Publish the image tag for the next nodes
  ansible.builtin.set_stats:
    data:
      image_tag: "{{ built_tag }}"
```

규칙:

- 출력은 작업이 **성공**한 경우에만 읽힙니다. 실패하거나 중지된 작업에는 출력이 없으므로
  **On failure** 분기는 실패한 노드로부터 아무것도 받지 않습니다.
- 출력 이름은 `^[A-Za-z_][A-Za-z0-9_-]*$`와 일치해야 합니다. 값은 문자열, 숫자, 불리언, 리스트,
  객체 등 모든 JSON 값이 될 수 있습니다.
- 제한: 파일은 최대 256 KB이며, 출력은 최대 100개, 각각 최대 32 KB입니다.
- 파일이 없거나 비어 있으면 "출력 없음"을 의미합니다. JSON 객체가 아니거나, 잘못된 이름을
  사용하거나, 제한을 초과하는 파일은 **작업을 실패시키며**, 그 이유가 작업 로그에 기록됩니다.
- 저장할 수 없는 Terraform 출력(`sensitive`로 표시되었거나, 너무 크거나, 이름이 잘못되었거나,
  제한을 초과하는 출력)은 건너뛰며, 작업 로그와 작업의 **Outputs** 패널에 **Not captured**로
  표시됩니다. 이러한 출력 때문에 작업이 실패하지는 않습니다.

### 입력 전달 {#delivering-inputs}

작업 노드로 끝나는 연결을 클릭하면 사이드 패널에 **Inputs** 섹션이 있습니다.

- **이름 기준**(기본값). 소스 노드의 출력 중 이름이 대상 템플릿의 설문 변수와 같은 출력이 해당
  변수를 채웁니다. 일치하는 변수가 없는 출력은 무시됩니다. 하이픈이 포함된 Terraform 출력은
  유효한 변수 이름이 될 수 없으므로 전달되지 않습니다.
- **Map inputs explicitly.** 체크박스를 선택하면 나열한 쌍, 즉 대상 템플릿의 설문 변수와 그 값을
  제공하는 출력 키만 전달됩니다. 목록이 비어 있으면 아무것도 전달되지 않습니다. 워크플로우에
  완료된 실행이 있으면 패널은 그 실행에서 생성된 키를 제안하고, 수집되지 않은 키를 표시합니다.

어떤 연결로도 채워지지 않은 변수는 노드에 설정된 값을 사용하고, 그 값도 없으면 변수의 기본값을
사용합니다. 값이 없는 **필수** 변수가 있으면 노드의 작업은 시작되기 전에 실패하며 해당 변수를
알려 주는 로그 줄이 기록되므로, 실행은 **On failure** 엣지를 따릅니다.

값은 변수 유형으로 변환됩니다. `int` 변수는 숫자나 숫자로 된 문자열을 받고, `enum` 또는 `select`
변수는 자체 옵션만 받으며, `string` 또는 `text` 변수는 모든 값을 받습니다(객체나 리스트는 압축된
JSON으로 전달됨). 맞지 않는 값은 무시되고 그 이유가 작업 로그에 기록되며, 대체 값이 적용됩니다.

**Approval 및 Delay 노드**는 출력을 그대로 통과시킵니다. `task → approval → task`에서도 데이터가
전달되며, 마지막 연결의 모드가 적용됩니다.

**한 노드로 들어가는 여러 연결.** 소스가 성공한 각 연결이 값을 제공합니다. 두 연결이 같은 변수를
채우면 명시적 매핑이 이름 기준 전달보다 우선합니다. 같은 종류끼리는 먼저 생성된 연결이 우선하므로
실행할 때마다 같은 결과가 나옵니다. 어느 연결이 우선했는지는 작업 로그에 기록됩니다.

![The connection panel in by-name mode: matched survey variables are ticked](/assets/workflow-inputs-by-name.webp)

![The connection panel with explicit mapping: one output key per survey variable](/assets/workflow-inputs-explicit.webp)

### 확인 위치 {#where-to-see-outputs}

- **Run view**는 출력을 생성한 모든 노드에 *N outputs* 배지를 표시합니다.
- **작업 대화 상자**에는 값과 *Not captured* 목록이 포함된 **Outputs** 표가 있습니다.
- 연결로 값을 받은 작업의 로그는 변수마다 한 줄로 시작합니다(예:
  `Input "image_tag" <- output "image_tag" of node 3 (task #41)`). 따라서 모든 값의 출처가 값
  바로 한 줄 위에 표시됩니다.

![Run view: nodes that produced outputs carry a badge](/assets/workflow-run-outputs.webp)

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Task dialog, Details tab: the Outputs table](/assets/task-outputs.webp)
</div>

### 제한 사항 {#outputs-limitations}

- 출력은 작업을 볼 수 있는 모든 사용자에게 평문으로 저장되고 표시됩니다. **출력을 통해 시크릿을
  전달하지 마십시오.** `secret` 유형의 설문 변수는 연결로 채울 수 없습니다.
- 출력은 코드가 아닌 값입니다. Ansible은 이를 리터럴 문자열로 받으며, 값 안의 Jinja2 표현식은
  평가되지 않습니다.
- 원격 러너의 작업도 서버의 작업과 마찬가지로 출력을 생성하고 받습니다. 러너의 **Docker** 또는
  **Kubernetes** 실행기로 실행되는 작업은 아직 출력을 생성하지 않으며, 로그에 그 사실이 기록됩니다.

## 환경 변수 {#environment-variables}

워크플로에서 시작된 작업은 [모든 작업이 받는 변수](./tasks#environment-variables)에 더해 다음 변수를 받습니다.

| 변수 | 값 |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | 워크플로 ID |
| `SEMAPHORE_WORKFLOW_RUN_ID` | 현재 실행 ID |
| `SEMAPHORE_WORKFLOW_URL` | 실행 페이지 링크 (예: `https://semaphore.example.com/project/1/workflows/7/runs/42`; 서버 설정에 `web_host`가 필요함) |
| `SEMAPHORE_OUTPUTS_FILE` | 작업이 [출력](#producing-outputs)을 기록하는 파일의 경로 |

이 변수는 Ansible과 Terraform을 포함한 모든 애플리케이션에 설정되며 원격 러너에서 실행되는 작업에도 전달됩니다.

## 권한 {#permissions}

- 워크플로우 관리(생성, 편집, 삭제)에는 프로젝트 리소스 관리 권한이
  필요합니다.
- 워크플로우 실행에는 `run_project_tasks`가 필요합니다.
- 승인 처리에는 적절한 프로젝트 접근 권한이 필요합니다(프로젝트에서 작업을 실행할
  수 있는 사용자와 동일).

## API {#api}

워크플로우 템플릿과 실행은
`/api/project/{project_id}/workflows`에서 사용할 수 있습니다. `delay` 노드 필드
(`delay_seconds`), 엣지의 `input_mode`와 `input_mappings`, 실행 세부 정보
(`GET …/runs/{run_id}`)에 포함된 각 작업의 `artifacts` 문서, 중지 엔드포인트
(`POST …/runs/{run_id}/stop`)를 포함한 요청 및 응답 스키마는 [API 문서](/reference/api)를 참고하십시오.
