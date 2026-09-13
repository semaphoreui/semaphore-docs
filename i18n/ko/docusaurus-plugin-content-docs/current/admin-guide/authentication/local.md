---
title: 로컬 계정
description: Semaphore 데이터베이스를 기준으로 하는 비밀번호 로그인 - 비밀번호 저장 방식, TOTP 2단계 인증, 세션 수명, 비밀번호 로그인 끄기.
---

# 로컬 계정

로컬 계정은 비밀번호를 Semaphore 데이터베이스에 보관합니다. 모든 설치 환경은 `semaphore setup`
또는 `SEMAPHORE_ADMIN_*` 변수로 만들어진 로컬 계정 하나로 시작하며, ID 공급자가 존재하기 전에는
이 계정으로 서버에 접근합니다.

싱글 사인온이 동작한 뒤에도 로컬 관리자 계정을 최소한 하나는 유지하세요. ID 공급자에 연결할 수
없을 때 다시 들어갈 수 있는 유일한 방법입니다.

## 비밀번호 저장 방식 {#how-passwords-are-stored}

비밀번호는 OWASP 최소 강도 매개변수를 적용한 **Argon2id**로 해시되며, 매개변수는 각 해시와 함께
[PHC 문자열 형식](https://github.com/P-H-C/phc-string-format/blob/master/phc-sf-spec.md)으로 기록됩니다.
2.20 이전 릴리스에서는 bcrypt를 사용했습니다. 해당 해시도 여전히 동작하며, 소유자가 다음에 로그인에
성공할 때 각각 Argon2id 해시로 교체됩니다. 다시 로그인하지 않는 계정은 bcrypt 해시를 그대로
유지하므로, 업그레이드하려면 그런 계정의 비밀번호를 재설정하세요.

전체 매개변수 표는 [보안](/admin-guide/security#password-hashing)에 있습니다.

Semaphore는 비밀번호 정책을 강제하지 않습니다. 최소 길이도, 복잡도 요구도, 만료도 없습니다.
정책이 필요하다면 디렉터리나 ID 공급자를 사용하세요. 그런 정책은 원래 그곳에 속합니다.

## 계정 관리 {#manage-accounts}

관리자는 웹 인터페이스에서 사용자를 관리하며, 스크립팅용으로 그리고 아무도 로그인할 수 없을 때의
복구용으로 동일한 작업을 명령줄에서도 수행할 수 있습니다.

```bash
semaphore users add --admin --login jane --name "Jane Doe" \
  --email jane@example.com --password 's3cret'
semaphore users change-by-login --login jane --password 'new-s3cret'
semaphore users list
```

모든 플래그는 [`semaphore users`](/reference/cli/users)를, 로그인한 사용자가 역할에 따라 무엇을 할 수
있는지는 [팀](/user-guide/team)을 참조하세요.

:::warning
명령줄에 입력한 비밀번호는 셸 기록과 해당 머신의 프로세스 목록에 남습니다. 첫 관리자 계정과 복구
작업에만 사용하고, 그 뒤에는 웹 인터페이스에서 비밀번호를 변경하세요.
:::

## 2단계 인증 {#two-factor-authentication}

Semaphore는 TOTP를 지원합니다. Google Authenticator, Aegis, 1Password 등의 앱이 생성하는 여섯 자리
코드입니다. 기본적으로 꺼져 있으며, 이를 활성화한 계정에만 적용됩니다. 모든 사용자에게 강제되지
않습니다.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true,
      "app_name": "Semaphore"
    }
  }
}
```

| 옵션 | 효과 |
|---|---|
| `mfa.totp.enabled` | 사용자가 자신의 계정에 TOTP를 추가할 수 있게 합니다. 이 옵션이 없으면 아무도 등록할 수 없습니다. |
| `mfa.totp.allow_recovery` | 등록 시 복구 코드를 하나 발급하므로, 휴대폰을 잃어버려도 계정을 잃지 않습니다. 복구 코드를 입력하면 **TOTP 등록이 해제되고** 사용자가 로그인됩니다. 그런 다음 다시 등록하면 됩니다. 이 코드는 bcrypt 해시로 저장됩니다. |
| `mfa.totp.app_name` | 인증 앱에 표시되는 발급자 라벨입니다. Semaphore를 두 개 이상 운영한다면 설정하세요. |

사용자는 자신의 계정 페이지에서 등록합니다. 기기를 분실한 사용자의 2단계 인증은 관리자가 확인하거나
제거할 수 있습니다.

```bash
semaphore users totp show --login jane
semaphore users totp disable --login jane
```

`mfa.totp.enabled`를 다시 끄더라도 등록 정보가 삭제되지는 않습니다. 2단계 인증을 요구하지 않게 될
뿐입니다. 다시 켜면 기존 등록 정보가 그대로 적용됩니다.

## 세션 수명 {#session-lifetime}

세션은 **활동이 없는 상태로 7일**이 지나면 만료됩니다. 이 비활성 제한 시간은 내장되어 있으며 설정할
수 없습니다.

절대 제한은 설정할 수 있으며, 마지막 요청이 아니라 로그인 시점부터 측정됩니다. 따라서 활발히
사용 중인 세션도 종료됩니다.

```json
{
  "auth": {
    "max_session_life_hours": 12
  }
}
```

기본값 `0`은 절대 제한이 없다는 뜻입니다. 공용 워크스테이션이나 규정 준수 규칙 때문에 사용자가
주기적으로 재인증해야 하는 경우에 설정하세요.

## 비밀번호 로그인 끄기 {#turn-password-sign-in-off}

ID 공급자를 구성하고 실제 사용자가 그 방식으로 로그인할 수 있음을 확인했다면,
`password_login_disable`이 비밀번호 방식을 완전히 거부합니다.

```json
{
  "password_login_disable": true
}
```

LDAP와 OpenID Connect는 영향을 받지 않습니다. 기존 로컬 계정은 역할과 이력을 그대로 유지하며,
단지 인증할 방법이 없어질 뿐입니다.

:::danger
이 옵션은 즉시 적용되며 여러분의 계정을 포함한 모든 로컬 계정에 영향을 줍니다. 설정하기 전에
로그를 읽는 것이 아니라 실제로 로그인해 보는 방식으로 싱글 사인온이 동작하는지 확인하세요.
실수를 복구하려면 서버의 구성 파일을 직접 수정하고 재시작해야 합니다.
:::

## 다음 단계 {#whats-next}

- [LDAP 및 Active Directory](/admin-guide/authentication/ldap) — 디렉터리를 기준으로 인증합니다.
- [OpenID Connect](/admin-guide/authentication/openid) — ID 공급자를 이용한 싱글 사인온입니다.
- [보안](/admin-guide/security) — 해싱 매개변수, 암호화, 하드닝.
