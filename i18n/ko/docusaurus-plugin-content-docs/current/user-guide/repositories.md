import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 리포지토리

리포지토리는 플레이북과 역할 같은 Ansible 콘텐츠를 저장하고 관리하는 공간입니다.

![리포지토리 목록](/assets/repositories-list.webp)

목록에는 이름, 브랜치가 포함된 Git URL, 인증에 사용되는 키가 표시됩니다.

Semaphore는 다음과 같은 리포지토리를 인식합니다:
  * 로컬 파일 시스템(`/path/to/the/repo`)
  * 로컬 Git 리포지토리(`file://`)
  * HTTPS(`https://`) 또는 SSH(`ssh://` 또는 짧은 형식 `git@host:org/repo.git`)로 접근하는 원격 Git 리포지토리
  * `git://` 프로토콜도 지원되지만 보안상의 이유로 권장하지 않습니다.

모든 작업 템플릿은 실행하려면 리포지토리가 필요합니다.

## 인증 {#authentication}
인증이 필요한 원격 리포지토리를 사용하는 경우 Semaphore의 **키 저장소** 섹션에서 키를 설정해야 합니다.

SSH를 사용하는 원격 리포지토리의 경우 **키 저장소**에 있는 SSH 키를 사용해야 합니다.

인증이 없는 원격 리포지토리의 경우 `None` 유형의 키를 생성할 수 있습니다.

리포지토리의 키는 해당 리포지토리에만 사용됩니다. 다른 곳에 호스팅되어 별도의 자격 증명이 필요한 서브모듈, `requirements.yml` 역할 또는 기타 리포지토리에 접근하려면 [Host config](/user-guide/host-config)에서 매핑을 추가하세요.

### 배포 키(Deploy Key) 구성 {#deploy-keys}

엔터프라이즈 자동화 환경에서는 개인 사용자 SSH 키나 개인 액세스 토큰(PAT) 대신 단일 리포지토리에 한정된 전용 **배포 키(Deploy Key)** 또는 액세스 키를 사용하는 것이 권장되는 모범 사례입니다. 배포 키의 이점은 다음과 같습니다:
* **수명 주기 격리**: CI/CD 및 자동화 파이프라인이 개별 직원의 계정이나 개인 자격 증명에 의존하지 않습니다.
* **최소 권한 원칙**: 배포 키를 엄격하게 읽기 전용으로 설정할 수 있어 Semaphore가 소스 리포지토리에 원치 않는 변경 사항을 푸시하지 못하도록 방지합니다.
* **영향 범위 제한**: 키를 교체해야 할 경우 해당 특정 리포지토리만 영향을 받습니다.

:::tip Semaphore에서 직접 SSH 키 생성
명령줄에서 SSH 키를 수동으로 생성할 필요가 없습니다. Semaphore에서 **Key Store** &rarr; **새 키** &rarr; **SSH Key** 선택 &rarr; **Generate**를 클릭합니다. Semaphore가 안전한 키 쌍을 생성하고 복사할 수 있는 **공개 키** 대화 상자를 표시합니다. 자세한 내용은 [Key Store](/user-guide/key-store#built-in-ssh-key-generator)를 참조하세요.
:::

Semaphore에서 생성된 공개 키를 복사하여 Git 공급자에 추가합니다:

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. GitHub: **Settings** &rarr; **Deploy keys** &rarr; **Add deploy key**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Allow write access**: Unchecked.

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. GitLab: **Settings** &rarr; **Repository** &rarr; **Deploy keys**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Grant write permissions**: Unchecked.

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. Bitbucket: **Repository settings** &rarr; **Access keys**.
2. Label: `Semaphore UI Runner`.
3. Key: Public Key.
4. Permissions: `Read`.

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

## 새 리포지토리 생성 {#creating-a-new-repository}
1. 추가하려는 리포지토리에 대한 키를 키 저장소 섹션에서 설정했는지 확인합니다.

2. Semaphore의 리포지토리 섹션으로 이동하여 오른쪽 상단의 **새 리포지토리** 버튼을 클릭합니다.

3. 리포지토리를 설정합니다:
    * 리포지토리 이름 지정
    * URL 추가. URL은 다음으로 시작해야 합니다:
        * 파일 시스템의 로컬 폴더는 `/path/to/the/repo`
        * HTTPS로 접근하는 원격 Git 리포지토리는 `https://`
        * SSH로 접근하는 원격 Git 리포지토리는 `ssh://`
        * 로컬 Git 리포지토리는 `file://`
        * Git 프로토콜로 접근하는 원격 Git 리포지토리는 `git://`
    * 리포지토리의 브랜치를 설정합니다. 어떤 값이어야 할지 확실하지 않다면 대개 master 또는 main입니다
    * 리포지토리가 모든 템플릿이 공유하는 모노레포라면 **모든 템플릿에 단일 체크아웃**을 선택합니다. [모노레포](#monorepo)를 참조하십시오
    * 이 리포지토리를 설정하기 전에 구성해 둔 **액세스 키**를 선택합니다.

4. 모든 설정이 완료되면 저장을 클릭합니다.

## 모노레포: 모든 템플릿에 하나의 체크아웃 {#monorepo}

:::info v2.20부터
**모든 템플릿에 단일 체크아웃** 옵션은 **Semaphore 2.20**부터 사용할 수 있습니다. 이전 버전은 항상 템플릿마다 리포지토리를 한 번씩 복제합니다.
:::

기본적으로 Semaphore는 템플릿마다 리포지토리를 한 번씩 복제하므로 각 템플릿은 자체 복사본에서 작업합니다. 많은 템플릿이 공유하는 큰 리포지토리의 경우 복사본이 디스크 공간을 차지하고, 각 작업은 자체 복사본의 복제 또는 풀로 시작됩니다.

**모든 템플릿에 단일 체크아웃**을 선택하면 리포지토리를 한 번만 복제하고 그 체크아웃을 프로젝트의 모든 템플릿이 공유합니다. 이 옵션은 복제되지 않는 로컬 폴더(`/path/to/the/repo`)에는 사용할 수 없습니다.

<div style={{maxWidth: 450}}>

![모든 템플릿에 단일 체크아웃이 활성화된 리포지토리 폼](/assets/repository-monorepo.webp)

</div>

공유 체크아웃의 동작 방식:

* 작업이 시작되기 전에 Semaphore는 체크아웃에 잠금을 걸고 리포지토리에 설정된 브랜치를 fetch 및 pull한 다음 잠금을 해제합니다. 체크아웃이 업데이트되는 동안 다른 템플릿의 작업은 잠금을 기다리지만, 작업 자체는 병렬로 실행됩니다.
* 브랜치마다 여전히 자체 체크아웃을 가지므로 브랜치가 다른 리포지토리는 작업 트리를 공유하지 않습니다.
* 체크아웃은 공유되지만 Ansible 홈 디렉터리(`requirements.yml`에서 설치된 역할과 컬렉션)는 템플릿마다 분리되어 있습니다.

모든 템플릿이 같은 브랜치의 같은 체크아웃에서 작업하므로 모노레포의 템플릿은 자체 **브랜치**를 가질 수 없고, 작업이 브랜치나 커밋을 선택할 수 있게 하는 **브랜치** 프롬프트도 활성화할 수 없습니다. 템플릿 폼은 둘 다 비활성화하고 그 이유를 설명하며, API는 그러한 템플릿을 거부합니다. 플레이북이 체크아웃에 쓰지 않도록 하십시오. 작업 트리가 변경되면 다음 pull이 실패하고, Semaphore는 체크아웃을 제거한 뒤 다시 복제합니다.

## 하위 디렉터리의 플레이북 {#subdirectories}

엔터프라이즈 리포지토리는 모든 플레이북을 루트에 두기보다는 전용 디렉터리, 모노레포 또는 다중 환경 레이아웃으로 자동화 자산을 구성하는 경우가 많습니다.

```text
my-automation-repo/
├── ansible.cfg
├── collections/
│   └── requirements.yml
├── roles/
│   └── common/
└── playbooks/
    ├── site.yml
    ├── provisioning/
    │   └── aws-vms.yml
    └── maintenance/
        └── patch-nodes.yml
```

[작업 템플릿](/user-guide/task-templates)을 생성할 때 **플레이북 파일 이름**은 항상 **리포지토리 루트 기준 상대 경로**로 지정됩니다:

* **상대 경로 사용**: `playbooks/site.yml` 또는 `playbooks/provisioning/aws-vms.yml`과 같이 입력합니다.
* **시작 슬래시 금지**: `/playbooks/site.yml` 형식을 사용하지 마세요. 시작 슬래시가 있으면 실행기가 복제본 대신 시스템 루트 디렉터리부터 검색하게 됩니다.
* **Unix 슬래시 사용**: Windows 러너 노드에서 실행되더라도 항상 `/`를 사용합니다.
* **대소문자 구분**: 경로는 폴더 및 파일의 대소문자와 정확히 일치해야 합니다(예: `playbooks/site.yml`).

:::info 작업 디렉터리 및 요구사항
플레이북이 하위 디렉터리(예: `playbooks/site.yml`)에서 실행될 때 Semaphore는 역할 및 컬렉션을 확인할 때 플레이북 디렉터리(`playbook_dir`)와 리포지토리 루트(`repo_path`)를 모두 평가합니다. 정확한 검색 순서는 아래의 [요구사항](#requirements)을 참조하세요.
:::

## 기존 리포지토리 편집 {#editing-an-existing-repository}
1. Semaphore의 리포지토리 섹션으로 이동합니다.

2. 변경하려는 리포지토리 옆의 연필 아이콘을 클릭하면 리포지토리 설정이 표시됩니다.

## 리포지토리 삭제 {#deleting-a-repository}
삭제하려는 리포지토리가 어떤 작업 템플릿에서도 사용되지 않는지 확인하십시오.
작업 템플릿에서 사용되고 있는 리포지토리는 삭제할 수 없습니다:
1. Semaphore의 리포지토리 섹션으로 이동합니다.

2. 삭제하려는 리포지토리의 휴지통 아이콘을 클릭합니다.

3. 이 리포지토리를 삭제하려는 것이 확실하면 확인 팝업에서 예를 클릭합니다.

### 종속성 보호 및 사용 중 안전 장치 {#dependency-protection}

현재 하나 이상의 작업 템플릿에 할당된 리포지토리는 삭제할 수 없습니다.

삭제를 시도하기 전에 Semaphore는 활성 템플릿 참조를 확인합니다:
1. 리포지토리 목록에서 휴지통 아이콘을 클릭하면 리포지토리가 프로젝트 템플릿에서 참조되고 있는지 확인합니다.
2. 종속성이 존재하는 경우 Semaphore는 해당 리포지토리를 참조하는 작업 템플릿 목록과 각 템플릿으로 연결되는 직접 링크가 포함된 경고 대화 상자를 표시합니다.
3. 사용 중인 상태에서 API를 통해 직접 삭제하려고 하면 HTTP `400 Bad Request`로 요청이 거부됩니다:

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

리포지토리를 안전하게 삭제하려면:
1. **템플릿**으로 이동하여 종속된 각 템플릿을 다른 리포지토리에 재할당하거나 사용하지 않는 템플릿을 삭제합니다.
2. **리포지토리**로 돌아가 리포지토리 옆의 휴지통 아이콘을 클릭합니다.
3. 팝업 대화 상자에서 삭제를 확인합니다.

:::tip 체크아웃 캐시 자동 삭제
리포지토리가 성공적으로 삭제되면 Semaphore는 호스트/러너 파일 시스템에서 리포지토리의 로컬 체크아웃 작업 디렉터리를 자동으로 삭제하여 디스크 공간을 확보합니다.
:::

## 요구 사항 {#requirements}
프로젝트를 초기화할 때 Semaphore는 다음 위치를 아래 순서대로 검색하여 requirements.yml에 명시된 Ansible 역할과 컬렉션을 설치합니다.

### 역할 {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### 컬렉션 {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### 처리 로직 {#processing-logic}

* 각 파일은 독립적으로 처리됩니다
* 파일이 존재하면 해당 유형(역할 또는 컬렉션)에 따라 처리됩니다
* 파일 처리 중 오류가 발생하면 설치 과정이 중단되고 오류를 반환합니다
* 루트 디렉터리에 있는 동일한 requirements.yml 파일(**`playbook_dir`/requirements.yml** 및 **`repo_path`/requirements.yml**)은 두 번 처리됩니다 - 한 번은 역할에 대해, 한 번은 컬렉션에 대해 처리됩니다

Semaphore는 오류가 발생하는 경우를 제외하고, 이전 위치가 발견되었거나 성공적으로 처리되었는지 여부와 관계없이 이 모든 위치를 처리하려고 시도합니다.
