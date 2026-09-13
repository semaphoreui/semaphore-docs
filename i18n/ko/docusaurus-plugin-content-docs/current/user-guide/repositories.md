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
    * 이 리포지토리를 설정하기 전에 구성해 둔 **액세스 키**를 선택합니다.

4. 모든 설정이 완료되면 저장을 클릭합니다.

## 기존 리포지토리 편집 {#editing-an-existing-repository}
1. Semaphore의 리포지토리 섹션으로 이동합니다.

2. 변경하려는 리포지토리 옆의 연필 아이콘을 클릭하면 리포지토리 설정이 표시됩니다.

## 리포지토리 삭제 {#deleting-a-repository}
삭제하려는 리포지토리가 어떤 작업 템플릿에서도 사용되지 않는지 확인하십시오.
작업 템플릿에서 사용되고 있는 리포지토리는 삭제할 수 없습니다:
1. Semaphore의 리포지토리 섹션으로 이동합니다.

2. 삭제하려는 리포지토리의 휴지통 아이콘을 클릭합니다.

3. 이 리포지토리를 삭제하려는 것이 확실하면 확인 팝업에서 예를 클릭합니다.

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
