
# Ansible

Semaphore UI를 사용하면 Ansible 플레이북을 실행할 수 있습니다. 이를 위해 **Ansible Playbook** 템플릿을 생성해야 합니다.

1. **작업 템플릿** 섹션으로 이동하여 **새 템플릿**을 클릭한 다음 **Ansible Playbook**을 클릭합니다.

![](/assets/ansible_1.png)

2. 템플릿을 설정합니다.

템플릿에서는 다음 매개변수를 지정할 수 있습니다:

* 리포지토리
* 플레이북 파일 경로
* 작업 디렉터리(선택 사항)
* 인벤토리
* 변수 그룹
* Vault
* 추가 CLI 인수(tags, skip-tags, limit, verbosity)
* 환경 변수

![](/assets/ansible_2.png)

## 작업 디렉터리 {#working-directory}

템플릿 리포지토리의 하위 디렉터리에서 Ansible 명령을 실행하려면 **작업 디렉터리**를 사용합니다. 리포지토리 루트를 기준으로 한 상대 경로를 입력하십시오. 예를 들어 `ansible.cfg`가 `<repository>/automation`에 저장되어 있다면 `automation`을 입력합니다. 절대 경로와 리포지토리 외부 경로는 허용되지 않습니다. 생략하면 Semaphore는 리포지토리 루트를 사용합니다.

작업 디렉터리는 프로세스의 현재 디렉터리에 의존하는 Ansible 동작에 영향을 줍니다. Ansible의 [설정 파일 검색 순서][ansible-config-search]에는 현재 디렉터리의 `ansible.cfg`가 포함됩니다. 또한 작업 디렉터리는 추가 CLI 인수에 있는 상대 경로의 해석에도 영향을 줍니다. 예로 [`--extra-vars @vars.yml`][ansible-extra-vars-file]과 [`--private-key key.pem`][ansible-private-key]이 있습니다. 플레이북 경로와 파일 인벤토리 경로는 각각의 리포지토리 루트를 기준으로 유지됩니다.

작업 디렉터리를 변경하더라도 그 자체로 해당 디렉터리의 `roles/` 또는 `collections/` 하위 디렉터리가 Ansible 검색 경로에 추가되지는 않습니다. [플레이북 기준 역할 탐색][ansible-role-search]과 [플레이북에 인접한 컬렉션][ansible-playbook-collections]은 여전히 플레이북 위치를 기준으로 합니다. 다만 선택된 `ansible.cfg`가 `roles_path` 또는 `collections_path`를 설정하는 경우에는 작업 디렉터리가 간접적으로 탐색에 영향을 줄 수 있습니다.

[ansible-config-search]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html#the-configuration-file
[ansible-extra-vars-file]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#vars-from-a-json-or-yaml-file
[ansible-private-key]: https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-private-key
[ansible-role-search]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#storing-and-finding-roles
[ansible-playbook-collections]: https://docs.ansible.com/ansible/latest/collections_guide/collections_installing.html#installing-collections-adjacent-to-playbooks

## 템플릿 유형 {#template-types}

ansible-playbook 템플릿은 다음 유형 중 하나일 수 있습니다:

* [Task](#task)
* [Build](#build)
* [Deploy](#deploy)

### Task {#task}

지정된 매개변수로 지정된 플레이북을 실행하기만 합니다.

*limit* 기능과 함께 API 호출로 템플릿을 실행하려는 경우 *Ansible prompts: Limit* 옵션을 활성화해야 합니다. 그렇지 않으면 API 호출에서 설정한 limit이 무시됩니다. API로 트리거된 작업에서는 대화형 프롬프트가 표시되지 않고 작업이 무인으로 실행됩니다.

### Build {#build}

이 유형의 템플릿은 [아티팩트](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\))를 생성하는 데 사용해야 합니다. 아티팩트의 시작 버전은 템플릿 매개변수에서 지정할 수 있습니다. 실행할 때마다 아티팩트 버전이 증가합니다.

![](/assets/template_new_build_ipad1.png)

Semaphore는 아티팩트를 기본적으로 지원하지 않으며 작업 버전 관리만 제공합니다. 아티팩트 생성은 직접 구현해야 합니다. 방법을 알아보려면 [CI/CD](../../admin-guide/cicd) 문서를 읽어 보십시오.

### Deploy {#deploy}

이 유형의 템플릿은 대상 서버에 아티팩트를 배포하는 데 사용해야 합니다. 각 `deploy` 템플릿은 `build` 템플릿과 연결됩니다.


이를 통해 아티팩트의 특정 버전을 서버에 배포할 수 있습니다.

## 템플릿 옵션 {#template-options}

### 스케줄 {#schedule}

템플릿 설정에서 cron 스케줄을 지정하여 작업 스케줄링을 설정할 수 있습니다. cron 표현식 형식은 [문서](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format)에서 확인할 수 있습니다.


#### 리포지토리에 새 커밋이 추가될 때 작업 실행 {#run-a-task-when-a-new-commit-is-added-to-the-repository}

cron을 사용해 리포지토리의 새 커밋을 주기적으로 확인하고, 커밋이 도착하면 작업을 트리거할 수 있습니다.

예를 들어 git 리포지토리에 앱 소스 코드가 있다고 가정합니다. 이를 **리포지토리**에 추가하고 새 커밋에 대해 Build 작업을 트리거할 수 있습니다.


### Tags, skip-tags, limit {#tags-skip-tags-and-limit}

템플릿은 다음 Ansible CLI 옵션을 지원합니다:

- `--tags`
- `--skip-tags`
- `--limit`

이 값들은 템플릿에서 설정할 수 있으며 작업을 생성할 때 재정의할 수 있습니다. API를 통해 이 값들을 전달하려면 해당 프롬프트가 활성화되어 있는지 확인하십시오.

### Galaxy 요구 사항 {#galaxy-requirements}

플레이북을 실행하기 전에 Semaphore는 플레이북 디렉터리, 리포지토리 루트, 그리고 그들의 `roles/` 및 `collections/` 하위 디렉터리에서 발견된 `requirements.yml` 파일의 역할과 컬렉션을 `ansible-galaxy install --force`를 사용해 설치합니다.

실행할 때마다 다시 설치하지 않도록, Semaphore는 각 요구 사항 파일의 체크섬을 저장하고 파일이 변경된 경우에만 설치를 다시 실행합니다. 이 동작은 접을 수 있는 **Galaxy install options** 섹션(**Ansible prompts** 아래)의 두 가지 템플릿 옵션으로 제어합니다:

- **Skip Galaxy install** — `ansible-galaxy`를 전혀 실행하지 않습니다. 요구 사항이 러너 이미지에 미리 설치되어 있는 경우 사용하십시오.
- **Force Galaxy install** — 저장된 체크섬을 무시하고 항상 `ansible-galaxy install --force`를 실행합니다. 요구 사항 파일이 변동하는 대상(예: 태그 대신 브랜치)을 가리키고 있고 매 실행마다 최신 버전을 원하는 경우 사용하십시오.

**Skip Galaxy install**은 섹션 하단의 **Prompts** 아래에 있는 같은 이름의 체크박스를 활성화하면 작업 실행 양식에 노출할 수 있습니다. 프롬프트가 활성화되면 실행 시점에 선택한 값이 템플릿 기본값을 재정의합니다.

#### 추가 Galaxy 인수 {#galaxy-extra-args}

**Role install args**와 **Collection install args**(**Ansible prompts** 아래의 접을 수 있는 **Galaxy install options** 섹션에 있으며 기본적으로 접혀 있고, 옆의 카운터는 사용자 지정된 Galaxy 설정 개수를 표시함)는 각각 `ansible-galaxy role install`과 `ansible-galaxy collection install`에 플래그를 추가합니다. 두 하위 명령이 서로 다른 플래그를 허용하기 때문에 별도로 설정합니다. 예를 들어 `--pre`는 컬렉션에만 유효합니다.

각 항목은 하나의 argv 토큰입니다. 값은 인라인(`--timeout=60`)으로 지정하거나 다음 항목(`--timeout`, `60`)으로 지정할 수 있습니다. 다음 플래그만 허용됩니다:

| 범위 | 플래그 |
|-------|-------|
| 둘 다 | `-c`/`--ignore-certs`, `-f`/`--force`, `--force-with-deps`, `-i`/`--ignore-errors`, `-n`/`--no-deps`, `-s`/`--server <url>`, `--timeout <seconds>`, `-v`…`-vvvv`/`--verbose` |
| 역할만 | `-g`/`--keep-scm-meta` |
| 컬렉션만 | `--pre`, `-U`/`--upgrade`, `--offline`, `--no-cache`, `--clear-response-cache`, `--disable-gpg-verify`, `--keyring <path>`, `--signature <url>`, `--required-valid-signature-count <n>`, `--ignore-signature-status-code(s) <code>` |

그 외의 값은 템플릿을 저장할 때 거부됩니다. 특히 명령줄 인수는 프로세스 목록에서 볼 수 있기 때문에 `--token`/`--api-key`는 허용되지 않습니다. 대신 변수 그룹에서 환경 변수(예: `ANSIBLE_GALAXY_SERVER_<NAME>_TOKEN`)를 통해 Galaxy 자격 증명을 설정하십시오. 요구 사항 파일(`-r`)은 Semaphore가 설정하며, 템플릿이 리포지토리 외부에 쓰지 못하도록 설치 경로(`-p`, `--roles-path`, `--collections-path`)는 의도적으로 허용되지 않습니다. 대신 `ansible.cfg`에서 `roles_path`/`collections_path`를 설정하거나 `ANSIBLE_ROLES_PATH`/`ANSIBLE_COLLECTIONS_PATH`를 사용하십시오.

### 병렬 처리(`--forks` / `-f`) {#parallelism---forks---f}

템플릿의 **추가 CLI 인수**에 `--forks` 또는 `-f`를 전달하여 Ansible이 동시에 연결하는
호스트 수를 제어합니다. 인수는 유효한 JSON이어야 하며,
개별 토큰의 배열을 사용하십시오:

```json
["--forks", "10"]
```

짧은 형식도 지원됩니다:

```json
["-f", "10"]
```

템플릿에서 **작업에서 인수 재정의 허용**이 활성화되어 있으면 작업이 실행 시점에
자체 forks 값을 제공할 수 있습니다. Ansible은 템플릿 인수와 작업 인수를 모두 전달받으며,
명령줄에서 마지막에 나오는 `--forks` / `-f`가 적용됩니다.

인수가 유효한 JSON이 아니면 실행이 시작되기 전에 설명이 포함된 검증 오류와 함께
작업이 실패합니다.

### 인증 {#authentication}

플레이북의 호스트 인증은 인벤토리에 지정된 키 저장소의 사용자 참조를 사용해 수행됩니다. SSH에 사용되는 사용자는 키 저장소 항목의 선택적 사용자 값으로 결정됩니다.

### 여러 Vault 비밀번호 {#multiple-vault-passwords}

키 저장소의 여러 Vault 비밀번호를 템플릿에 연결할 수 있습니다. 실행 중에 Ansible은 제공된 비밀번호를 사용해 복호화를 시도합니다.

### 상세 출력 수준 {#verbosity-level}

문제 해결에 도움이 되도록 템플릿/작업 양식에서 작업의 Ansible 상세 출력 수준(예: `-v`, `-vvv`)을 조정할 수 있습니다.
