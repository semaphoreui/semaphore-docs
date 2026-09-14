---
title: 시작하기
description: Semaphore UI를 설치하고 첫 Ansible 작업을 실행하여 결과를 확인한 뒤 실행 일정을 설정합니다.
sidebar_label: 시작하기
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 시작하기

Semaphore UI는 Ansible, Terraform/OpenTofu, Bash, PowerShell, Python으로 반복 가능한 자동화를 실행하는 웹 인터페이스와 API입니다. Git에 저장된 자동화 코드, 자격 증명, 변수, 일정, 워크플로, 실행 환경을 통합하고 각 실행의 상태와 로그를 보관합니다.

이 가이드에서는 첫 실행 예제로 Ansible을 사용합니다. 자신의 저장소에 있는 플레이북을 사용하거나 공개 저장소 [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo)로 스크린샷의 예제를 재현하세요.

## 1. Semaphore 설치하기

Semaphore를 실행할 환경에 맞는 설치 방법을 선택합니다. 기본값은 네이티브 패키지입니다.

<Tabs groupId="installation-method">
  <TabItem value="package" label="네이티브 패키지" default className="InstallationMethod">

`amd64`의 Debian 또는 Ubuntu:

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

`amd64`의 RHEL, Fedora, Rocky Linux, AlmaLinux 또는 CentOS Stream:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

데이터베이스와 첫 관리자를 설정한 다음 생성된 설정으로 Semaphore를 시작합니다.

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

로컬 평가용으로는 SQLite를 선택하고, 데이터베이스 및 플레이북 경로를 수락하거나 지정하고, 공개 URL을 입력한 뒤 안내에 따라 첫 관리자를 생성합니다.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

`compose.yaml`을 생성합니다.

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

암호화 키를 생성한 다음 강력한 관리자 암호와 함께 `compose.yaml` 옆의 `.env` 파일에 저장합니다.

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

`.env`을 버전 관리에서 제외하고 컨테이너를 시작합니다.

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="바이너리 압축 파일" className="InstallationMethod">

[GitHub Releases](https://github.com/semaphoreui/semaphore/releases)에서 운영 체제와 CPU 아키텍처에 맞는 압축 파일을 다운로드합니다. Linux `amd64` 예제:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

로컬 평가용으로는 SQLite를 선택하고, 데이터베이스 및 플레이북 경로를 수락하거나 지정하고, 공개 URL을 입력한 뒤 안내에 따라 첫 관리자를 생성합니다.

macOS는 `darwin` 압축 파일, Windows는 `.zip`을 선택합니다. 이 가이드 뒷부분의 Ansible 절차에는 Ansible이 설치된 Linux, macOS, WSL, 컨테이너 또는 Linux 러너 실행 환경이 필요합니다.

  </TabItem>
  <TabItem value="helm" label="Helm으로 Kubernetes에 설치" className="InstallationMethod">

공식 차트를 추가하고 설치 전에 기본값을 확인합니다.

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

차트의 `appVersion`은 Semaphore 버전을 나타냅니다. 프로덕션에서 사용하기 전에 `values.yaml`에 영구 스토리지, 데이터베이스, 관리자 자격 증명, 액세스 키 암호화 키, ingress/TLS를 설정하세요.

  </TabItem>
</Tabs>

안내에 따라 설정하려면 공식 [Semaphore 설치 페이지](https://semaphoreui.com/install)에서 릴리스를 선택하고 설정을 생성하여 해당 다운로드 또는 실행 명령을 확인하세요.

<details>
<summary>어떤 설치 방법을 선택할지 모르겠나요?</summary>

| 설치 방법 | 적합한 환경 | 상세 가이드 |
| --- | --- | --- |
| **네이티브 패키지** | 지원되는 Linux 서버 | [패키지 관리자로 설치](/admin-guide/installation/package-manager) |
| **Docker Compose** | 빠른 격리 환경 구성 또는 컨테이너 호스트 | [Docker 설치](/admin-guide/installation/docker) |
| **바이너리 압축 파일** | macOS, Windows, FreeBSD 또는 적합한 패키지가 없는 Linux | [바이너리 설치](/admin-guide/installation/binary-file) |
| **Helm으로 Kubernetes에 설치** | 기존 Kubernetes 클러스터 | [Kubernetes 설치](/admin-guide/installation/k8s) |

상세 가이드는 프로덕션 데이터베이스, 서비스, 시크릿, 스토리지, ingress, 업그레이드를 다룹니다.

</details>

이 Ansible 절차에서는 Semaphore 서버 또는 러너에서 `git --version`과 `ansible-playbook --version`이 동작해야 합니다. 명령 중 하나라도 사용할 수 없다면 계속하기 전에 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)과 [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)을 설치하세요.

:::tip 프로덕션 설치
Semaphore를 프로덕션에서 사용하기 전에 [설정](/admin-guide/configuration), [보안](/admin-guide/security), [러너](/admin-guide/runners), [고가용성](/admin-guide/ha), [업그레이드](/admin-guide/upgrading)를 검토하세요.
:::

## 2. 로그인하기

1. 브라우저에서 Semaphore를 엽니다. 로컬 설치는 일반적으로 [http://localhost:3000](http://localhost:3000)을 사용합니다.
2. `semaphore setup` 또는 Docker 관리자 변수로 생성한 관리자 로그인 이름과 암호를 입력합니다.
3. **Sign In**을 선택합니다.

![Semaphore 로그인 화면](/assets/getting-started/sign-in.jpg)

초기 설정에는 프로젝트와 사용자를 생성할 수 있는 관리자 계정을 사용합니다. 일반 사용자는 관리자가 계정을 생성하고 프로젝트 접근 권한을 부여한 후 같은 페이지에서 로그인합니다. [사용자 관리](/user-guide/admin/users)를 참조하세요.

## 3. 프로젝트 생성하기

빈 Semaphore 인스턴스에 로그인하면 **New Project** 페이지가 자동으로 열립니다. 기존 프로젝트가 있다면 프로젝트 선택기를 열고 **New Project...**를 선택합니다. 양식을 작성합니다.

| 필드 | 입력할 내용 |
| --- | --- |
| **Project Name** | `Production infrastructure` 또는 애플리케이션 이름처럼 쉽게 알아볼 수 있는 작업 공간 이름입니다. |
| **Max number of parallel tasks** | 선택 사항입니다. 프로젝트의 동시 작업 수를 제한합니다. 비워 두면 서버 제한을 사용합니다. |
| **Telegram Chat ID** | 선택 사항입니다. 프로젝트에 Telegram 알림이 설정된 경우 사용합니다. |
| **Allow alerts for this project** | 선택 사항입니다. 설정된 프로젝트 알림을 활성화합니다. |
**Create**를 선택합니다.

**Create Demo Project**는 선택하지 마세요. 이 옵션은 샘플 리소스를 추가하지만 이 가이드는 빈 프로젝트부터 구성합니다. 나중에 다른 프로젝트를 생성할 때는 같은 옵션이 New Project 대화 상자의 **Demo** 스위치로 표시됩니다.

![사용 가능한 모든 필드가 표시된 빈 New Project 양식](/assets/getting-started/new-project-empty.jpg)

새 프로젝트에는 **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store**, **Repositories** 섹션이 있습니다. 프로젝트 설정, 팀 접근 권한, 활동, 기록은 [프로젝트](/user-guide/projects)를 참조하세요.

<details>
<summary>이 단계 보기</summary>

![빈 Semaphore 인스턴스에서 첫 프로젝트 생성](/assets/getting-started/create-first-project.gif)

</details>

## 4. 핵심 개념 이해하기

새 프로젝트는 빈 Dashboard로 열립니다. 사이드바가 프로젝트의 기본 탐색 메뉴입니다.

![리소스와 작업을 추가하기 전의 빈 Semaphore 프로젝트 화면](/assets/getting-started/after-sign-in.jpg)

- **Dashboard**는 실행 기록, 통계, 활동, 프로젝트 설정을 표시합니다.
- **Task Templates**, **Workflows**, **Schedule**는 무엇을 언제 실행할지 정의합니다.
- **Repositories**, **Inventory**, **Variable Groups**, **Key Store**는 코드, 대상, 변수, 자격 증명을 제공합니다.
- **Integrations**, **Team**, **Runners**는 외부 시스템, 사용자, 실행 호스트를 연결합니다.

다음 다이어그램은 이러한 리소스가 실행으로 이어지는 과정을 보여 줍니다.

<div class="BlockSchema">
  ![Semaphore 리소스와 트리거가 작업 실행으로 이어지는 과정](/assets/getting-started/core-concepts.svg)
</div>

UI 동작, API 요청 또는 일정은 **Task Template**을 직접 시작하거나 작업 템플릿을 사용하는 **Workflow**를 시작할 수 있습니다. Semaphore는 UI에 **Task**로 표시되는 작업 실행을 생성하고 Semaphore 서버 또는 조건에 맞는 원격 러너로 보냅니다. Ansible의 경우 해당 실행 호스트가 `ansible-playbook`을 실행하며, Inventory에는 Ansible이 관리하는 시스템이 나열됩니다.

| 개념 | 역할 |
| --- | --- |
| [**Project**](/user-guide/projects) | 자동화 리소스, 권한, 실행 기록을 포함하는 격리된 작업 공간입니다. |
| [**Repository**](/user-guide/repositories) | 작업에서 사용하는 자동화 파일이 있는 Git 브랜치 또는 태그를 가리킵니다. |
| [**Key Store**](/user-guide/key-store) | 재사용 가능한 SSH 키, 로그인 자격 증명, 토큰, Ansible Vault 암호를 Git 및 작업 입력과 별도로 저장합니다. |
| [**Inventory**](/user-guide/inventory) | 관리할 호스트와 그룹, 사용할 자격 증명을 Ansible에 알려 줍니다. |
| [**Variable Group**](/user-guide/environment) | 하나 이상의 템플릿에서 재사용할 Ansible 변수, 환경 변수, 시크릿을 저장합니다. |
| [**Task Template**](/user-guide/task-templates/) | 자동화 유형, 파일, 저장소, 인벤토리, 변수, 프롬프트, 실행 옵션 등 실행할 내용을 저장합니다. |
| [**Task (task run)**](/user-guide/tasks) | 고유한 입력, 상태, 타임스탬프, 로그, 상세 정보, 결과를 가진 한 번의 실행입니다. |
| **Workflow** | 성공, 실패, 승인, 메모 분기가 있는 여러 단계의 경로로 작업 템플릿을 연결합니다. |
| [**Schedule**](/user-guide/schedules) | cron 표현식에 따라 작업 템플릿이나 워크플로를 한 번 또는 반복해서 시작합니다. |
| [**Runner**](/admin-guide/runners) | 다른 네트워크나 보안 영역 등 Semaphore 주 서버 외부에서 대기 중인 작업을 실행합니다. |

## 5. 저장소 연결하기

Repository는 Semaphore를 Git에 저장된 자동화 코드와 연결합니다. Semaphore 자체에는 플레이북이 저장되지 않습니다. 자신의 저장소를 연결하거나 아래 공개 데모 값을 사용해 예제를 그대로 재현하세요. [통합](/user-guide/integrations)은 GitHub, GitLab 또는 다른 웹훅 소스에서 자동화를 시작하는 별도 기능입니다.

1. **Repositories**를 열고 **New Repository**를 선택합니다.
2. 저장소 이름, URL, 브랜치, 자격 증명을 입력합니다. 공개 데모를 사용하는 경우 다음 값을 사용합니다.

   | 필드 | 값 |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | 공개 저장소이므로 `None` |

3. **Create**를 선택합니다.

![Semaphore 공개 데모 저장소 정보가 입력된 저장소 양식](/assets/getting-started/repository-settings.jpg)

이제 저장소가 목록에 표시됩니다. Semaphore는 Repository 레코드를 생성할 때가 아니라 작업 시작 시 실행 호스트에서 저장소를 복제하거나 업데이트합니다. 스크린샷은 이 가이드에서 사용하는 데모 값을 보여 줍니다.

![프로젝트 저장소 목록에 연결된 Demo 저장소](/assets/getting-started/connected-repository.jpg)

비공개 저장소에는 `None` 대신 적절한 Key Store 자격 증명을 선택합니다. 로컬 경로, HTTPS, SSH, 브랜치, 자격 증명, 의존성 파일은 [저장소](/user-guide/repositories)를 참조하세요.

## 6. 원격 관리 대상 호스트의 SSH 키 추가하기

이 SSH 자격 증명을 사용하면 Ansible이 Semaphore 서버 또는 러너에서 Inventory의 원격 호스트로 연결할 수 있습니다. `localhost` 데모에는 SSH 키가 필요하지 않습니다. 7단계로 진행하세요.

데모는 `localhost`와 `ansible_connection=local`을 사용하므로 SSH 연결을 열지 않습니다. 자신의 플레이북으로 원격 호스트를 관리한다면 해당 키를 추가합니다.

1. 키의 공개 부분을 관리 대상 호스트의 `~/.ssh/authorized_keys`에 추가합니다.
2. **Key Store**를 열고 **New Key**를 선택합니다.
3. `Production hosts`처럼 쉽게 알아볼 이름을 입력하고 **Local**을 선택한 상태로 **SSH Key**를 선택합니다.
4. `ubuntu` 또는 `ec2-user`처럼 Ansible이 호스트에서 사용할 계정을 입력합니다.
5. `BEGIN` 및 `END` 줄을 포함한 전체 개인 키를 붙여 넣고 필요한 경우 암호 구문을 추가합니다.
6. **Create**를 선택합니다. 다음 단계에서 **Inventory → User Credentials** 아래에 이 키를 선택합니다.

![관리 대상 호스트에서 사용하는 계정의 New SSH Key 양식](/assets/getting-started/add-managed-host-ssh-key.jpg)

스크린샷에는 실제로 작동하는 시크릿이 아닌 자리 표시자가 들어 있습니다. 개인 키를 문서, 스크린샷, 작업 인수 또는 버전 관리에 공개하지 마세요.

Semaphore는 시크릿을 로컬에 저장하거나 [HashiCorp Vault](/user-guide/key-store/hashicorp-vault), [Devolutions Server](/user-guide/key-store/devolutions-server) 같은 외부 시크릿 저장소와 통합할 수 있습니다. 지원되는 모든 자격 증명 유형과 저장 옵션은 [키 저장소](/user-guide/key-store)를 참조하세요.

## 7. Ansible 인벤토리 생성하기

모든 Ansible 작업에는 인벤토리가 필요합니다. 첫 로컬 실행을 위해 저장소에 `inventory.ini` 같은 파일을 추가합니다.

```ini
[local]
localhost ansible_connection=local
```

여기서 `localhost`는 Semaphore 서버, 컨테이너 또는 러너인 실행 호스트를 뜻하며, 브라우저가 열린 컴퓨터와 같지 않을 수 있습니다. `ansible_connection=local`은 Ansible에 SSH를 사용하지 않도록 지시합니다. 데모 저장소는 `site` 그룹이 있는 동등한 파일 `invs/prod/hosts`를 사용합니다.

자신의 저장소에 `inventory.ini`을 만들었다면 계속하기 전에 Semaphore에 연결한 브랜치로 커밋하고 푸시하세요.

1. **Inventory**를 열고 **New Inventory → Ansible Inventory**를 선택합니다.
2. 인벤토리에 맞는 값을 입력합니다. 예:

   | 필드 | 값 |
   | --- | --- |
   | **Name** | `Local`(데모에서는 `Prod`) |
   | **User Credentials** | `localhost`에는 `None`, 원격 인벤토리에는 호스트의 SSH 자격 증명 사용 |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini`(데모에서는 `invs/prod/hosts`) |

3. **Runner tag**, **Sudo Credentials**, **Repository**를 비워 둔 뒤 **Create**를 선택합니다.

![데모 저장소 값으로 설정한 Ansible 파일 인벤토리](/assets/getting-started/ansible-inventory-settings.jpg)

**Repository**를 비워 두면 Semaphore는 작업 템플릿에서 선택한 저장소를 기준으로 인벤토리의 상대 경로를 확인합니다. 인벤토리가 다른 곳에 있을 때만 여기서 저장소를 선택합니다. 원격 호스트에는 6단계의 SSH 키를 **User Credentials**로 사용하세요.

정적, 파일 기반, 동적 인벤토리는 [인벤토리](/user-guide/inventory)를 참조하세요.

## 8. 변수 그룹 추가하기(선택 사항)

**Variable Group**은 하나 이상의 작업 템플릿에 연결할 수 있는 재사용 가능한 값 모음입니다. Ansible 변수에는 **Extra variables**, 프로세스로 내보낼 값에는 **Environment variables**, 암호화하고 마스킹할 민감한 값에는 **Secrets**를 사용합니다. 이렇게 하면 환경별 설정을 플레이북 밖에 두고 각 템플릿에 같은 값을 반복 입력하지 않아도 됩니다.

첫 작업은 변수 그룹 없이도 실행됩니다. 예제로 `ansible_python_interpreter=auto_silent`을 설정하는 그룹을 만듭니다. Ansible은 여전히 Python을 자동으로 찾지만 발견 과정에 관한 안내 경고를 출력하지 않습니다.

1. **Variable Groups**를 열고 **New Group**을 선택합니다.
2. **Group Name**에 `Ansible defaults`처럼 설명적인 이름을 지정합니다.
3. **Variables → Extra variables**에서 **Table**을 선택한 상태로 **+**를 선택합니다.
4. 다음을 입력합니다.

   | 이름 | 유형 | 값 |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. **Save**를 선택합니다.

![표 편집기에서 설정한 변수 그룹](/assets/getting-started/variable-group-table.jpg)

우선순위 규칙과 시크릿 저장 옵션은 [변수 그룹](/user-guide/environment)을 참조하세요.

## 9. Ansible 작업 템플릿 생성하기

### Git의 플레이북 검토하기

연결한 저장소에 Ansible 플레이북이 이미 있다면 사용하세요. 없다면 `get-started.yml` 같은 작은 예제를 추가합니다.

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

데모를 따라 한다면 대신 데모의 [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml)을 사용합니다. 데모 인벤토리의 `site` 그룹을 대상으로 포함된 `ping` 역할을 실행합니다.

데모는 Git 서브모듈에서 해당 역할을 다운로드하고 `semaphoreui.com`에 ICMP 요청을 한 번 보내므로 실행 호스트에 GitHub 접근과 아웃바운드 ICMP가 필요합니다. ICMP가 차단되어 있다면 로컬 `get-started.yml` 예제를 사용하세요.

![연결한 GitHub 저장소의 ping.yml](/assets/getting-started/demo-playbook-github.jpg)

스크린샷은 공개 데모 저장소의 플레이북을 보여 줍니다. 자동화를 Git에 보관하면 변경 사항을 검토할 수 있고 Semaphore가 각 실행에 사용한 정확한 커밋을 기록할 수 있습니다.

자신의 저장소에 `get-started.yml`을 만들었다면 계속하기 전에 Semaphore에 연결한 브랜치로 커밋하고 푸시하세요.

### 템플릿 설정하기

1. **Task Templates**를 열고 **New template → Applications**을 선택합니다.
2. **Ansible Playbook**을 활성화한 다음 **Task Templates**로 돌아갑니다.
3. **New template → Ansible Playbook**을 선택합니다.
4. **Task** 탭을 선택한 상태로 둡니다. **Build**와 **Deploy**는 버전 관리가 적용되는 CI/CD 템플릿 유형이며 이번 독립 실행에는 필요하지 않습니다.
5. 파일에 맞는 값으로 템플릿을 설정합니다. 예:

   | 필드 | 값 | 역할 |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | 재사용 가능한 템플릿과 해당 작업 기록을 식별합니다. |
   | **Repository** | 자신의 저장소(예제에서는 `Demo`) | 플레이북과 관련 파일을 제공합니다. |
   | **Path to playbook file** | `get-started.yml`(데모에서는 `ping.yml`) | 저장소 루트를 기준으로 경로를 확인합니다. |
   | **Inventory** | `Local`(데모에서는 `Prod`) | 첫 실행의 로컬 대상을 제공합니다. |
   | **Variable Groups** | 생성한 경우 `Ansible defaults` | 재사용 가능한 선택적 Ansible 설정을 추가합니다. |
   | **Runner tag** | 비워 둠 | 서버 설정에 따라 로컬 실행 또는 기본 러너를 사용합니다. |

6. 위의 작은 플레이북이나 공개 데모에는 **Ansible options**에서 **Skip Galaxy install**을 활성화합니다. 둘 다 이 작업에 Galaxy 의존성이 필요하지 않습니다. 자신의 저장소가 `requirements.yml` 파일의 역할이나 컬렉션을 요구한다면 비활성화 상태로 두세요.
7. **Create**를 선택합니다.

![저장소, 인벤토리, 변수 그룹을 설정한 Ansible 작업 템플릿](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>이 단계 보기</summary>

![Ansible 활성화 및 첫 Ansible 작업 템플릿 생성](/assets/getting-started/create-ansible-template.gif)

</details>

그 밖의 유용한 필드:

- **Vaults**는 암호화된 Ansible 콘텐츠에 사용할 Key Store 암호를 선택합니다.
- **Limit**, **Tags**, **Skip tags**는 플레이북 실행 범위를 좁힙니다.
- **Prompts**를 사용하면 UI 사용자, 일정 또는 API 요청이 특정 실행에 대해 허용된 값을 재정의할 수 있습니다.
- **Runner tag**는 작업 실행 위치를 제어하며 Ansible 대상을 선택하지 않습니다.

전체 필드와 실행 옵션은 [Ansible 템플릿](/user-guide/apps/ansible) 및 [작업 템플릿](/user-guide/task-templates/)을 참조하세요.

## 10. 템플릿 실행 및 작업 확인하기

1. 생성한 작업 템플릿을 열고 **Run**을 선택합니다.
2. 선택 사항으로 `First Semaphore run` 같은 메시지를 추가합니다.
3. **Dry Run**과 **Diff**를 비활성화한 상태로 **Run**을 선택합니다.

![추가 옵션을 설정하지 않은 Ansible 플레이북의 New Task 대화 상자](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore는 작업을 대기열에 넣고 저장소를 준비한 뒤 인벤토리와 선택적 변수 그룹을 적용하여 선택한 플레이북을 실행합니다. 상태는 **Waiting**, **Running**을 거쳐 **Success** 또는 **Failed**로 종료됩니다.

### 로그

**Log**에는 실제 명령 출력이 기록됩니다. 녹색 상태 표시만 보지 말고 마지막 `PLAY RECAP`를 읽으세요.

![ping 출력과 PLAY RECAP이 포함된 성공한 Ansible 작업 로그](/assets/getting-started/ansible-task-log-variable-group.jpg)

정확한 카운터 값은 플레이북에 따라 달라집니다. 성공한 첫 실행은 `localhost`에 대해 `unreachable=0`과 `failed=0`로 끝나야 합니다. 데모 로그의 `changed=1`은 셸 기반 ping 단계가 실행되어 변경을 보고했다는 뜻이며 오류가 아닙니다.

### 상세 정보와 요약

| 탭 | 확인할 내용 |
| --- | --- |
| **Log** | 실시간 실행 단계, 모듈 출력, 오류, 마지막 `PLAY RECAP`. |
| **Details** | 템플릿 유형, Git 커밋, 실행 메시지, 작성자, 타임스탬프, 소요 시간. |
| **Summary** | 작업 요약 기능을 사용할 수 있는 경우 완료 후 호스트별 Ansible 결과와 오류. |

![템플릿, 커밋, 시간 정보를 보여 주는 작업 상세 정보](/assets/getting-started/ansible-task-details.jpg)

![OK 및 Not OK 호스트 수를 보여 주는 작업 요약](/assets/getting-started/ansible-task-summary.jpg)

**Summary**를 사용할 수 없다면 **Log**에서 실행을 확인하세요. `PLAY RECAP`가 여전히 Ansible 결과를 판단하는 기준입니다.

<details>
<summary>실행과 결과 보기</summary>

![Ansible 작업 실행 후 로그와 상세 정보 확인](/assets/getting-started/run-and-inspect-task.gif)

</details>

### 이전 실행 찾기

작업 창을 닫으면 템플릿의 **Tasks** 탭으로 돌아갑니다. 각 실행에는 고유한 작업 번호, 상태, 사용자, 시작 시각, 소요 시간, 보관된 로그가 있습니다. **Dashboard → History**는 프로젝트 내 모든 템플릿의 실행을 보여 줍니다. 자세한 내용은 [작업](/user-guide/tasks) 및 [프로젝트 기록](/user-guide/projects/history)을 참조하세요.

![성공한 작업 실행이 있는 Ansible 템플릿 기록](/assets/getting-started/ansible-template-history.jpg)

작업이 실패하면 마지막으로 의미 있는 로그 줄을 기준으로 다음 확인 항목을 선택합니다.

- 복제 오류는 저장소 URL, 브랜치, Access Key 또는 실행 호스트의 네트워크 접근 문제를 가리킵니다.
- `ansible-playbook: command not found`는 Semaphore 서버 또는 선택한 러너에 Ansible이 없다는 뜻입니다.
- `UNREACHABLE`은 인벤토리 주소, 호스트 자격 증명, SSH 연결 가능 여부 또는 호스트 키 검증 문제를 가리킵니다.
- 실패한 Ansible 단계는 일반적으로 `PLAY RECAP` 바로 위에 작업 이름, 호스트, 모듈 오류를 표시합니다.

## 11. 일정에 따라 작업 실행하기

UI에서 작업이 성공하면 자동 실행을 설정할 수 있습니다. 예를 들어 cron 표현식 `0 3 * * *`은 Semaphore에 표시된 시간대를 기준으로 매일 03:00에 작업을 시작합니다.

1. **Schedule**을 열고 **New Schedule → Cron**을 선택합니다.
2. `Nightly playbook`처럼 설명적인 이름을 입력합니다.
3. 실행할 작업 템플릿을 선택합니다.
4. **Show cron format**을 활성화한 상태로 `0 3 * * *` 같은 cron 표현식을 입력합니다.
5. **Enabled**를 선택한 상태로 **Save**를 선택합니다.

![예제 작업을 매일 03:00에 실행하도록 설정한 cron 일정](/assets/getting-started/create-cron-schedule.jpg)

Semaphore는 저장 전에 설정된 시간대를 표시하고 다음 실행 시각을 계산합니다. 예약 실행은 템플릿과 같은 저장소, 인벤토리, 변수 그룹, 실행 설정을 사용합니다. 템플릿에 프롬프트가 있다면 일정에서 해당 값을 제공할 수 있습니다. cron 문법, 시간대 설정, 일회성 실행, 예약 매개변수는 [일정](/user-guide/schedules)을 참조하세요.

저장 후 일정이 **Enabled** 상태이고 **Next run**이 예상 시각을 표시하는지 확인합니다. 예약된 작업은 템플릿의 **Tasks** 탭과 **Dashboard → History**에 표시됩니다.

## 다음으로 시도할 항목

첫 Ansible 작업이 성공하면 다음을 시도하세요.

- 저장소에 인증이 필요하다면 [키 저장소](/user-guide/key-store)에 적절한 비공개 자격 증명을 추가합니다.
- 여러 템플릿에 성공, 실패, 승인, 메모의 순서 있는 경로가 필요하다면 **Workflow**를 만듭니다.
- GitHub, GitLab 또는 다른 시스템에서 인증된 웹훅 트리거를 사용하려면 [통합](/user-guide/integrations)을 사용합니다.
- 리소스 관리와 템플릿 실행을 프로그램에서 수행하려면 [API](/reference/api)를 사용합니다.
- 다른 네트워크, 운영 체제 또는 보안 영역에서 실행해야 한다면 [원격 러너](/admin-guide/runners)를 추가합니다.

프로덕션에서는 Semaphore를 HTTPS로 제공하고, 데이터베이스와 액세스 키 암호화 시크릿을 함께 백업하며, 중앙 인증을 설정하고 [보안](/admin-guide/security), [로그](/admin-guide/logs), [업그레이드](/admin-guide/upgrading)를 검토하세요.
