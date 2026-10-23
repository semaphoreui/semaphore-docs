---
title: CyberArk 시크릿 스토리지
description: PVWA REST API를 통해 CyberArk Privileged Access Manager에 Key Store 시크릿을 읽고 저장하는 Enterprise 옵션입니다.
sidebar_custom_props:
  edition: pro
---

# CyberArk 시크릿 스토리지 <Enterprise />

Semaphore UI Enterprise는 데이터베이스 대신 **CyberArk Privileged Access Manager**(PAM Self-Hosted 또는 Privilege Cloud)를 Key Store 시크릿의 외부 스토리지로 사용할 수 있습니다. Semaphore는 Password Vault Web Access(PVWA) REST API와 통신하며, 각 Semaphore 키는 **Safe** 내의 CyberArk **계정**에 매핑됩니다.

## 구성 옵션 {#configuration-options}

**Key Store → Storages**에서 **CyberArk** 스토리지를 생성할 때 다음 항목을 구성합니다:

| 필드 | 설명 |
|------|------|
| **서버 URL** | PVWA 기본 주소(예: `https://pvwa.example.com`). 뒤에 `/PasswordVault`가 붙는 것도 허용됩니다. 필수 항목입니다. |
| **TLS 인증서 검증 건너뛰기** | 인증서 유효성 검사를 비활성화합니다. 테스트 환경에서만 사용하세요. |
| **인증 방법** | Semaphore 사용자의 PVWA 로그온 방법: `CyberArk`(기본값), `LDAP`, `RADIUS` 또는 `Windows`. |
| **사용자 이름** | Semaphore가 로그온할 PVWA 사용자입니다. 필수 항목입니다. |
| **비밀번호** | 해당 사용자의 비밀번호입니다. 데이터베이스에 저장하거나 환경 변수에서 읽거나 파일에서 로드할 수 있습니다. |
| **기본 Safe** | 키가 Safe 접두사 없이 계정을 참조할 때 사용되는 Safe이자 기본 동기화 경로입니다. |
| **새 계정용 플랫폼 ID** | Semaphore가 생성하는 계정에 할당되는 플랫폼입니다(예: `UnixSSH`). 스토리지가 읽기 전용이 아니고 Semaphore에서 키를 생성할 때만 필수입니다. |
| **새 계정용 주소** | Semaphore가 생성하는 계정의 선택적 주소 속성입니다. 일부 플랫폼에서 필요합니다. |

스토리지는 읽기 전용 모드로 작동할 수 있습니다. 이 모드에서 Semaphore는 계정을 읽고 동기화하기만 하며 Vault에서 항목을 생성, 수정 또는 삭제하지 않습니다.

### 필요한 PVWA 권한 {#required-pvwa-permissions}

사용하는 각 Safe에 대해 Semaphore 사용자에게 다음 권한을 부여하세요:

| 작업 | Safe 권한 |
|------|-----------|
| 키 읽기, 동기화 | **계정 목록 보기**, **계정 검색** |
| Semaphore에서 키 생성 | **계정 추가** |
| Semaphore에서 키 업데이트 | **비밀번호 값 업데이트**, **계정 속성 업데이트** |
| Semaphore에서 키 삭제 | **계정 삭제** |

Semaphore는 항상 동시 PVWA 세션(`concurrentSession`)을 요청하므로 여러 Semaphore 노드나 실행 중인 작업 및 예약된 동기화가 동일한 사용자를 공유해도 서로 로그아웃되지 않습니다. 이를 위해 PVWA 11.3 이상이 필요합니다.

:::warning
Semaphore가 사용하는 Safe에 대해 "사유 입력 필수"나 티켓팅 시스템 연동을 활성화하지 마세요. Semaphore는 고정된 사유를 전송하지만 티켓 번호는 제공할 수 없습니다.
:::

## 사용 방법 {#how-to-use}

1. 프로젝트에서 **Key Store → Storages**를 열고 **CyberArk** 스토리지를 생성합니다.
2. 키를 생성하거나 편집할 때 해당 스토리지를 선택하고 계정을 `Safe/AccountName` 형식으로 입력합니다. 계정 이름은 PVWA에 표시되는 개체 이름입니다. 스토리지에 기본 Safe가 있는 경우 `AccountName`만으로 충분합니다.
3. 필요에 따라 [동기화 경로](/user-guide/key-store/secret-sync)를 구성하여 전체 Safe를 일정에 따라 자동으로 가져옵니다.

### 키 유형 매핑 {#key-type-mapping}

| Semaphore 키 유형 | CyberArk 계정 |
|-------------------|---------------|
| **비밀번호로 로그인** | 비밀번호 계정: `userName`이 로그인이 되고 계정 시크릿이 비밀번호가 됩니다. |
| **SSH** | 키 계정(`secretType: key`): `userName`이 로그인이 되고 계정 시크릿이 개인 키가 됩니다. 암호 구문이 있는 SSH 키는 CyberArk에 저장할 수 없습니다. |
| **시크릿 / 문자열** | 사용자 이름이 없는 비밀번호 계정입니다. 계정 시크릿이 있는 그대로 사용됩니다. |

Semaphore가 계정을 생성할 때 Central Policy Manager(CPM)에 의한 자동 관리가 비활성화되어 Semaphore가 방금 작성한 시크릿을 CyberArk가 교체하지 않도록 합니다. CyberArk가 자격 증명을 순환하도록 하려면 PVWA에서 계정을 관리하고 Semaphore에서 스토리지를 읽기 전용으로 표시하세요.

## 시크릿 동기화 {#syncing-secrets}

동기화 경로는 Safe의 이름입니다. Semaphore는 Safe의 각 계정을 계정 이름을 딴 키로 가져옵니다(선택적 접두사 포함). 키 유형은 계정에서 감지됩니다. 키 계정은 SSH 키가 되고 사용자 이름이 있는 비밀번호 계정은 비밀번호 로그인 키가 되며 사용자 이름이 없는 계정은 일반 시크릿이 됩니다. [원격 스토리지에서 시크릿 동기화](/user-guide/key-store/secret-sync)를 참조하세요.
