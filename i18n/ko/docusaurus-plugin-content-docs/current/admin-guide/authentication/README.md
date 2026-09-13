---
title: 인증
description: 사용자가 Semaphore에 로그인하는 세 가지 방식 - 로컬 계정, LDAP, OpenID Connect - 이들을 어떻게 조합하는지, 그리고 ID가 어떻게 연결되는지 설명합니다.
---

# 인증

Semaphore는 사용자가 누구인지 확인하는 세 가지 방식을 제공합니다. 이 방식들은 서로 독립적이며
동시에 모두 활성화할 수 있습니다. 따라서 로그인 화면에 비밀번호 입력 양식, 디렉터리 로그인,
그리고 ID 공급자별 버튼이 함께 표시될 수 있습니다.

| 방식 | 비밀번호를 검증하는 주체 | 사용하는 경우 |
|---|---|---|
| [로컬 계정](/admin-guide/authentication/local) | Semaphore가 자체 데이터베이스를 기준으로 검증 | 디렉터리가 없거나 비상용 관리자 계정이 필요한 경우. |
| [LDAP 및 Active Directory](/admin-guide/authentication/ldap) | 디렉터리 서버 | 사용자가 이미 LDAP 또는 AD에 존재하고 자격 증명을 하나로 통일하려는 경우. |
| [OpenID Connect](/admin-guide/authentication/openid) | ID 공급자 | Keycloak, Okta, Entra ID, Google, GitHub 등으로 싱글 사인온을 사용하는 경우. |

인증은 사용자가 *누구인지*만 판단합니다. 사용자가 무엇을 할 수 있는지는 서버 역할과 각
프로젝트에서의 역할에 따라 별도로 결정됩니다 —
[팀](/user-guide/team)을 참조하세요.

## 사용자 레코드가 생성되는 방식 {#how-a-user-record-comes-to-exist}

어떤 방식으로 로그인하든 로그인하는 모든 사람은 Semaphore 데이터베이스에 행을 하나씩 가집니다.
로컬 계정은 관리자가 만들거나 `semaphore user add`로 만듭니다. LDAP 또는 OIDC 계정은 처음
로그인에 성공할 때 생성되며, Semaphore는 그 옆에 **외부 ID**를 함께 저장합니다. 외부 ID는
공급자 ID와 해당 공급자가 반환한 사용자 ID로 구성됩니다.

이후의 로그인은 이 외부 ID를 기준으로 매칭되므로, 디렉터리에서 사용자 이름을 바꿔도 계정이
새로 만들어지지 않습니다. 주의가 필요한 것은 아직 외부 ID가 없는 기존 사용자의 *첫* 로그인입니다.
이때의 동작은 `external_auth_email_matching` 옵션이 결정합니다.

| 값 | 동작 |
|---|---|
| `auto` (기본값) | 이메일로 연결하되, 아직 ID가 없는 외부 사용자에 대해서만 연결합니다. 이렇게 하면 2.20 이전에 만들어진 계정을 한 번 인계하며, 그 외에는 아무것도 하지 않습니다. |
| `always` | 모든 외부 사용자를 이메일로 연결합니다. 한 사람이 여러 공급자를 통해 로그인하는 경우에 사용하세요. |
| `never` | 이메일로 절대 연결하지 않습니다. ID는 오직 공급자 ID로만 매칭됩니다. |

로컬 비밀번호 계정은 어떤 모드에서도 이메일로 매칭되지 않습니다. 그렇지 않으면 사용자가 자신의
이메일 주소를 직접 선택할 수 있는 OIDC 공급자를 이용해 관리자 계정을 탈취할 수 있기 때문입니다.

:::warning
공급자 ID, 즉 `oidc_providers` 또는 `ldap_providers`의 키는 저장되는 모든 ID의 일부입니다.
이름을 바꾸면 이를 참조하는 ID가 고아가 되고, 해당 사용자는 다음 로그인 때 비어 있는 새 계정을
받게 됩니다. 처음에 한 번만 신중하게 정하세요.
:::

## 방식 조합하기 {#combining-methods}

현실적인 구성은 사용자에게는 싱글 사인온을 제공하고, ID 공급자에 연결할 수 없는 날을 대비해
로컬 관리자 계정을 하나 남겨 두는 것입니다.

1. 공급자를 구성하고 실제 사용자가 그 방식으로 로그인할 수 있는지 확인합니다.
2. 해당 사용자에게 필요한 역할을 부여합니다.
3. 강력한 비밀번호와
   [TOTP](/admin-guide/authentication/local#two-factor-authentication)가 활성화된 로컬 관리자 계정을 하나 유지합니다.
4. `password_login_disable`을 설정해 나머지 사용자가 비밀번호를 사용하지 못하게 합니다.

반드시 이 순서대로 진행하세요. 1단계 전에 `password_login_disable`을 설정하면 설명 그대로
동작하여 자기 서버에서 잠기게 됩니다.

## 이 섹션의 내용 {#in-this-section}

| 페이지 | 다루는 내용 |
|---|---|
| [로컬 계정](/admin-guide/authentication/local) | 비밀번호, TOTP, 이메일 일회용 코드, 세션 수명, 비밀번호 로그인 비활성화. |
| [LDAP 및 Active Directory](/admin-guide/authentication/ldap) | 디렉터리 바인딩, 검색 필터, 속성 매핑, TLS. |
| [OpenID Connect](/admin-guide/authentication/openid) | 공급자 구성, 클레임 표현식, IdP 시작 로그인, 그리고 열두 가지 공급자 예시. |

## 어디서 시작할까 {#where-to-start}

새로 설치한 환경에는 설정 과정에서 만들어진 로컬 관리자 계정이 이미 있으므로,
[로컬 계정](/admin-guide/authentication/local)에서 이 계정을 안전하게 만드는 것부터 시작한 다음
나머지 사용자를 위해 [OpenID Connect](/admin-guide/authentication/openid) 또는
[LDAP](/admin-guide/authentication/ldap)를 추가하세요.
