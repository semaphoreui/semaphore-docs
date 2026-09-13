# 키 저장소

Semaphore의 키 저장소는 원격 리포지토리 접근, 원격 호스트 접근, sudo 자격 증명, Ansible vault 비밀번호를 저장하는 데 사용됩니다.

![키 저장소](/assets/key-store-keys.webp)

**Keys** 탭에는 프로젝트의 자격 증명이 유형과 함께 나열됩니다. **Storages** 탭(Pro)에는 프로젝트에 설정된 외부 시크릿 저장소가 나열됩니다. [시크릿 저장소](#secret-storages)를 참조하십시오.

## 유형 {#types}

### 1. SSH {#1-ssh}
SSH 키는 원격 서버뿐만 아니라 원격 리포지토리에 접근하는 데 사용됩니다.

키를 빠르게 생성해 호스트에 배치하는 방법에 대한 도움이 필요하면 [여기에 간단한 가이드가 있습니다.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

SSH 인증을 사용하는 Git 리포지토리의 경우, 복제하려는 Git 리포지토리에 개인 키와 연결된 공개 키가 등록되어 있어야 합니다.

아래는 일반적인 Git 리포지토리 문서 링크입니다:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. 비밀번호 로그인 {#2-login-with-password}
비밀번호 로그인은 사용자 이름과 비밀번호/액세스 토큰의 조합으로, 다음 용도로 사용할 수 있습니다:
* 원격 호스트 인증(다만 SSH 키를 사용하는 것보다 보안성이 낮습니다)
* 원격 호스트의 sudo 자격 증명
* HTTPS를 통한 원격 Git 리포지토리 인증(다만 SSH가 더 안전합니다)
* Ansible vault 잠금 해제

:::tip
    이 유형의 시크릿은 개인 액세스 토큰(PAT) 또는 비밀 문자열로 사용할 수 있습니다. Login 필드를 비워 두면 됩니다.
:::

### 3. 없음 {#3-none}
GitLab의 오픈 소스 리포지토리처럼 인증이 필요하지 않은 리포지토리를 위한 대체 값으로 사용됩니다.


## 시크릿 저장소 {#secret-storages}

Semaphore UI는 시크릿을 위한 다양한 저장소를 지원합니다. 시크릿을 생성하거나 편집할 때 시크릿별로 저장소를 선택할 수 있습니다.

외부 저장소는 키 저장소의 **Storages** 탭(Pro)에서 생성합니다. 각 저장소에는 이름과 유형이 있으며, 키는 해당 저장소와 그 안에 있는 시크릿의 경로를 참조합니다.

![시크릿 저장소](/assets/key-store-storages.webp)

### 데이터베이스 {#database}

시크릿은 기본적으로 암호화된 형태로 데이터베이스에 저장됩니다. 암호화 키는 설정 옵션
`access_key_encryption` 또는 `SEMAPHORE_ACCESS_KEY_ENCRYPTION`으로 설정합니다(`head -c32 /dev/urandom | base64`로 생성해야 합니다).

### 환경 변수 또는 파일 {#environment-variable-or-file}

키는 Semaphore 서버의 환경 변수나 서버상의 파일
(예: 컨테이너에 마운트된 SSH 키)에서 값을 읽을 수 있습니다. 키 양식의 **Env**와 **File** 탭에서 이 모드를 선택합니다.

파일은 설정된 시크릿 디렉터리(`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, 기본값 `/tmp/semaphore`) 내부에 있어야 하며,
SSH 및 비밀번호 로그인 키는 작은 JSON 문서로 감싸야 합니다.

[자세히 보기...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

시크릿을 데이터베이스 대신 외부 HashiCorp Vault 인스턴스에 저장할 수 있습니다.

[자세히 보기...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

시크릿을 외부 [OpenBao](https://openbao.org) 인스턴스(HashiCorp Vault의 오픈 소스 API 호환 포크)에 저장할 수 있습니다.

[자세히 보기...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

![Static Badge](https://img.shields.io/badge/enterprise-yellow)

시크릿을 AWS Secrets Manager에 저장할 수 있습니다. IAM 역할/인스턴스 프로필 또는 정적 액세스 키로 인증합니다.

[자세히 보기...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

시크릿을 데이터베이스 대신 외부 Devolutions Server 인스턴스에 저장할 수 있습니다.

[자세히 보기...](/user-guide/key-store/devolutions-server)

## 원격 저장소에서 시크릿 동기화 {#syncing-secrets-from-remote-storages}

Semaphore는 외부 시크릿 관리자(HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault 또는 Devolutions Server)에서 시크릿을 자동으로 가져와 동기화 상태로 유지할 수 있습니다. 동기화 경로를 사용하면 가져올 시크릿과 그 이름 지정 방식을 선택할 수 있습니다.

[자세히 보기...](/user-guide/key-store/secret-sync)
