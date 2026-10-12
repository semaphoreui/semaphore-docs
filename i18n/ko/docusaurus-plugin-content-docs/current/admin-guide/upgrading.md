# 업그레이드

### 패키지 관리자 {#package-manager}

[릴리스 페이지](https://github.com/semaphoreui/semaphore/releases)에서 패키지 파일을 다운로드합니다.

&#x20;Debian 및 Ubuntu용은 `*.deb`, CentOS 및 RedHat용은 `*.rpm`입니다.&#x20;

패키지 관리자를 사용하여 설치합니다.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="debian-x64" label="Debian / Ubuntu (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.deb

      sudo dpkg -i semaphore_2.17.15_linux_amd64.deb
      ```
  </TabItem>
  <TabItem value="debian-arm64" label="Debian / Ubuntu (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.deb

      sudo dpkg -i semaphore_2.17.15_linux_arm64.deb
      ```
  </TabItem>
  <TabItem value="centos-x64" label="CentOS (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.rpm

      sudo yum install semaphore_2.17.15_linux_amd64.rpm
      ```
  </TabItem>
  <TabItem value="centos-arm64" label="CentOS (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.rpm

      sudo yum install semaphore_2.17.15_linux_arm64.rpm
      ```
  </TabItem>
</Tabs>


### 바이너리 {#binary}

<Tabs>
  <TabItem value="linux-x64" label="Linux (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.tar.gz

      tar xf semaphore_2.17.15_linux_amd64.tar.gz
      ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.tar.gz

      tar xf semaphore_2.17.15_linux_arm64.tar.gz
      ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows (x64)">
      ```powershell
      Invoke-WebRequest `
      -Uri ("https://github.com/semaphoreui/semaphore/releases/" +
            "download/v2.17.15/semaphore_2.17.15_windows_amd64.zip") `
      -OutFile semaphore.zip

      Expand-Archive -Path semaphore.zip  -DestinationPath ./
      ```
  </TabItem>
</Tabs>

## 주요 동작 변경 사항 {#behavior-changes}

이러한 변경 사항은 최신 **2.20.x** 릴리스로 업그레이드할 때 적용됩니다. 데이터베이스 마이그레이션은 필요하지 않지만, 이전 동작에 의존하던 playbook이나 API 클라이언트는 수정이 필요할 수 있습니다.

### Ansible 추가 변수는 리터럴입니다 {#ansible-extra-vars-literal}

Semaphore는 더 이상 Ansible 추가 변수를 명령줄로 전달하지 않습니다. 변수 그룹, 설문 응답, 워크플로 입력, 기본 제공 `semaphore_vars` 객체는 임시 YAML 파일에 기록되어 `--extra-vars @file`로 전달됩니다. 모든 문자열 값에는 `!unsafe` 태그가 붙으므로 Ansible은 이를 데이터로 처리하며 값 안의 Jinja2를 평가하지 않습니다.

설문 필드, 변수 그룹 또는 `--extra-vars` 템플릿에 Jinja2를 저장해 두고 playbook 실행 전에 Semaphore나 Ansible이 이를 확장해 주기를 기대했다면, 이제 그러한 확장은 일어나지 않습니다. 로직을 playbook으로 옮기거나(예: `my_var`가 Semaphore에서 전달된 단순 값일 때 `{{ my_var }}` 사용) Semaphore 외부에서 값을 계산하십시오.

설문 시크릿과 변수 그룹 시크릿은 별도의 Ansible Vault 파일에 암호화됩니다. Semaphore는 작업마다 일회용 vault ID와 비밀번호를 생성하고 Ansible의 vault 프롬프트에 stdin으로 응답합니다. 이는 템플릿에 연결하는 vault 비밀번호와는 별개입니다.

[설문 변수](/user-guide/task-templates/survey-vars), [변수 그룹](/user-guide/environment) 및 [보안 — Ansible 작업 변수](/admin-guide/security#ansible-task-variables)를 참조하십시오.

### 워크플로 출력 및 작업 API 필드 {#workflow-outputs-and-task-api}

[워크플로 출력](/user-guide/workflows#producing-outputs)은 작업 실행 중에 기록되며, API로 작업을 시작할 때는 설정할 수 없습니다. `POST /api/project/{project_id}/tasks`는 본문에 `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts`, `runner_id`가 있어도 이를 무시합니다.
