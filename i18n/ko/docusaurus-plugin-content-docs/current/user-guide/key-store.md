---
title: Key Store
description: Semaphore Key Store의 자격 증명, SSH 키 쌍 생성, 로그인 비밀번호, 토큰 시크릿 및 외부 시크릿 스토리지에 대한 포괄적인 가이드입니다.
---

# Key Store

**Key Store**는 Semaphore의 중앙 집중식 자격 증명 저장소 역할을 합니다. 원격 Git 리포지토리 복제, 대상 인프라 호스트 연결, 권한 상승(`sudo`/`become`) 및 Ansible Vault 시크릿 복호화에 필요한 인증 자료를 관리합니다.

![Key Store](/assets/key-store-keys.webp)

Key Store는 두 가지 기본 뷰로 나뉩니다:
* **Keys 탭**: 현재 프로젝트에 프로비저닝된 모든 자격 증명을 이름, 스토리지 백엔드, 자격 증명 유형 및 동기화 상태와 함께 나열합니다.
* **Storages 탭 (Pro)**: 외부 시크릿 백엔드(HashiCorp Vault, OpenBao, AWS Secrets Manager 또는 CyberArk 등)를 구성하여 동적 시크릿 확인 및 자동 동기화를 지원합니다.

---

## 자격 증명 유형 {#types}

Semaphore는 저장된 자격 증명을 세 가지 기본 유형으로 분류합니다:

### 1. SSH 키 {#1-ssh}
SSH 키는 Linux/UNIX 노드에 연결하고 SSH(`git@github.com:...`)를 통해 Git 리포지토리를 복제하는 데 사용되는 비대칭 암호화 인증을 제공합니다.

SSH 키 자격 증명을 구성할 때 다음을 지정할 수 있습니다:
* **키 이름**: 프로젝트 인벤토리 및 템플릿 전반에서 자격 증명을 식별하기 위한 설명 레이블입니다.
* **사용자 이름 (선택 사항)**: SSH 연결 설정 시 사용되는 기본 원격 사용자 계정입니다(예: `ansible` 또는 `ubuntu`).
* **암호 구문 (선택 사항)**: 암호화된 개인 키를 복호화하는 데 필요한 암호 구문입니다. 암호 구문 입력란에는 가시성 토글(`눈` 아이콘)이 포함되어 있으며 기본적으로 마스킹됩니다.
* **개인 키**: 원시 PEM/OpenSSH 개인 키 텍스트입니다.

#### 기본 내장 SSH 키 생성기 {#built-in-ssh-key-generator}

외부 머신에서 수동으로 `ssh-keygen`을 실행하는 대신 Semaphore는 모달 내에 **원클릭 내장 SSH 키 쌍 생성기**를 직접 포함하고 있습니다:

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. **유형** 드롭다운에서 **SSH 키**를 선택합니다.
2. **SSH 키 생성** 확인란을 선택합니다.
3. 수동 **개인 키** 텍스트 영역이 자동으로 비활성화되고 잠깁니다.
4. **생성**을 클릭합니다. Semaphore는 암호학적으로 안전한 키 쌍(ED25519/RSA)을 자동 생성하고 데이터베이스에 개인 키를 암호화하여 저장한 후 전용 대화 상자에 공개 키를 표시합니다:

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

제공된 **클립보드에 복사** 버튼을 사용하여 공개 키를 복사하고 Git 공급자의 배포 키 또는 대상 노드의 `~/.ssh/authorized_keys` 파일에 직접 붙여넣으세요.

#### 나중에 공개 키 추출 (공개 키 드로어) {#extracting-public-keys-later}

대화 상자를 닫거나 나중에 공개 키를 다시 검색해야 하는 경우 키 쌍을 다시 생성할 필요가 없습니다. 생성기로 생성된 기존 키를 편집할 때 Semaphore는 확장 가능한 **공개 키** 드로어를 제공합니다:

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* **표시** / **숨기기**를 클릭하여 원시 공개 키 문자열을 미리 봅니다.
* 클립보드 아이콘을 클릭하여 공개 키를 즉시 복사합니다.

#### 일반 Git 호스트에 배포 키 연결

SSH 인증이 필요한 Git 리포지토리의 경우 생성된 공개 키를 읽기 전용 배포 키로 추가합니다:
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. 비밀번호로 로그인 {#2-login-with-password}

**비밀번호로 로그인** 자격 증명 유형은 기존 사용자 이름/비밀번호 인증과 독립 실행형 시크릿 문자열을 모두 지원합니다:

* **호스트 및 sudo 인증**: 대상 호스트에 대한 비밀번호 기반 SSH 액세스 및 `sudo` 권한 상승 자격 증명을 제공합니다.
* **HTTPS Git 인증**: 사용자 이름과 개인 액세스 토큰(PAT)을 사용하여 HTTPS를 통해 원격 리포지토리에 인증합니다.
* **Ansible Vault 비밀번호**: 런타임 시 암호화된 Ansible Vault 파일 및 변수의 잠금을 해제합니다.

:::tip 시크릿 문자열 및 개인 액세스 토큰 (PAT)
순수 시크릿 문자열(API Bearer 토큰, Ansible Vault 암호 구문 또는 PAT 등)을 저장하려면 **로그인 / 사용자 이름 필드를 비워 두세요**. Semaphore는 연결된 사용자 식별자를 추가하지 않고 항목을 엄격하게 격리된 시크릿 문자열로 처리합니다.
:::

#### 시크릿 마스킹 및 덮어쓰기 방지 {#secret-masking-and-override-protection}

무단 노출 및 우발적인 수정으로부터 자격 증명을 보호하기 위해:
* 비밀번호 및 암호 구문 입력은 가시성 토글 옵션을 통해 인터페이스에서 철저히 마스킹됩니다.
* 기존 자격 증명을 편집할 때 민감한 시크릿 입력은 기본적으로 비활성화됩니다.
* 기존 시크릿을 업데이트하거나 교체하려면 양식 하단의 **덮어쓰기** 확인란을 명시적으로 선택해야 합니다. 이 안전 장치는 일상적인 관리 편집 중 의도치 않은 시크릿 덮어쓰기를 방지합니다.

---

### 3. 없음 {#3-none}

**없음** 자격 증명은 명시적인 널 인증 자리 표시자 역할을 합니다. SSH 키나 비밀번호가 필요 없는 공개 오픈 소스 Git 리포지토리(GitHub 또는 GitLab의 공개 리포지토리 등) 및 로컬 비인증 플레이북 실행에 사용됩니다.

---

## 시크릿 스토리지 {#secret-storages}

Semaphore는 분리된 시크릿 스토리지 아키텍처를 지원합니다. 자격 증명을 생성하거나 편집할 때 소스 스토리지 탭을 통해 기본 시크릿 자료가 상주하는 위치를 선택할 수 있습니다:

| 스토리지 소스 탭 | 사용 가능 에디션 | 설명 |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | 시크릿은 봉투 암호화로 보호되어 Semaphore 데이터베이스에 직접 저장됩니다. |
| **Storage** | Pro | 시크릿이 외부 시크릿 엔진(예: HashiCorp Vault, AWS Secrets Manager)을 참조합니다. |
| **Env** | Open Source & Pro | 시크릿은 Semaphore 서버의 환경 변수에서 런타임에 동적으로 확인됩니다. |
| **File** | Open Source & Pro | 시크릿은 서버의 구성된 시크릿 디렉터리에 있는 보호된 파일에서 읽힙니다. |

![시크릿 스토리지](/assets/key-store-storages.webp)

### 데이터베이스 스토리지 (Local) {#database}

기본적으로 시크릿은 대칭 AES 암호화를 사용하여 암호화된 형식으로 애플리케이션 데이터베이스에 저장됩니다. 마스터 키는 서버 설정을 통해 구성됩니다:
* 구성 키: `access_key_encryption`
* 환경 변수: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning 마스터 암호화 키 생성
프로덕션 인스턴스를 시작하기 전에 암호학적으로 안전한 32바이트 base64 암호화 키를 생성하세요:
```bash
head -c32 /dev/urandom | base64
```
이 키를 안전하게 백업해 두세요. 암호화 키를 분실하면 기존 데이터베이스 시크릿을 복구할 수 없습니다.
:::

### 환경 변수 및 파일 소스 (읽기 전용 스토리지) {#environment-variable-or-file}

**Env** 또는 **File** 소스 탭을 선택하면 Semaphore는 스토리지를 외부 읽기 전용 소스로 처리합니다. UI에 안내 알림이 표시됩니다:

> **Read-only secret storage chosen.**

![읽기 전용 시크릿 스토리지](/assets/key-store-env-readonly-storage.webp)

* **Env 소스**: Semaphore 서버 호스트 또는 컨테이너에서 내보낸 환경 변수의 정확한 이름을 입력합니다(예: `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **File 소스**: 구성된 시크릿 경로(`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, 기본값 `/tmp/semaphore`)에 대한 상대 파일 경로를 제공합니다.

구조화된 키의 경우 파일 및 환경 변수 내용이 유효한 JSON 객체로 서식 지정되어야 합니다. 자세한 내용은 [환경 변수 및 파일 소스](/user-guide/key-store/env-and-file-sources)를 참조하세요.

### 외부 엔터프라이즈 시크릿 엔진 (Pro & Enterprise) {#external-secret-engines}

Semaphore Pro 및 Enterprise는 주요 엔터프라이즈 시크릿 관리자에 대한 기본 커넥터로 Key Store를 확장합니다:

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: AppRole 또는 토큰 인증을 통해 연결하여 KV v1/v2 시크릿을 읽고 씁니다.
* **[OpenBao](/user-guide/key-store/openbao)**: HashiCorp Vault의 오픈 소스 API 호환 포크입니다.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />: AWS IAM 역할 또는 정적 자격 증명과 통합됩니다.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: 중앙 집중식 권한 있는 액세스 관리와 통합됩니다.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />: CyberArk PVWA REST API를 사용하여 시크릿을 읽고 씁니다.

---

## 원격 스토리지에서 시크릿 동기화 {#syncing-secrets-from-remote-storages}

자격 증명을 하나씩 수동으로 등록하는 대신 Semaphore는 외부 시크릿 저장소로부터의 자동 동기화를 지원합니다.

동기화를 통해 시크릿이 유지 관리되는 경우:
* Key Store 테이블에 활성 **synchronized** 배지가 표시됩니다.
* 외부 저장소를 단일 진실 공급원으로 보존하기 위해 UI에서 시크릿 자료를 수동으로 편집할 수 없습니다.
* 외부 시크릿 엔진의 모든 업데이트 또는 교체는 구성된 동기화 간격에 따라 Semaphore에 자동으로 전파됩니다.

자세한 구성 단계는 [시크릿 동기화](/user-guide/key-store/secret-sync)를 참조하세요.
