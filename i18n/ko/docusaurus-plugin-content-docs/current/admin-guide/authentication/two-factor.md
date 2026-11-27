---
title: 2단계 인증
description: Semaphore에서 TOTP 2단계 인증이 동작하는 방식과 서버에서 켜는 방법, 계정에 설정하는 방법, 코드로 로그인하는 방법, 복구하는 방법을 설명합니다.
---

# 2단계 인증

2단계 인증(2FA)은 첫 번째 로그인 단계 다음에 두 번째 증명, 즉 사용자 휴대폰의 인증 앱이 표시하는
여섯 자리 코드를 요구합니다. 따라서 비밀번호를 도난당한 것만으로는 로그인할 수 없습니다.

Semaphore는 두 번째 인증 요소를 TOTP(시간 기반 일회용 비밀번호)로 구현합니다. Google Authenticator,
Microsoft Authenticator, Aegis, 1Password, Bitwarden 등의 앱이 사용하는 표준입니다. 모든 에디션에서
사용할 수 있습니다.

## 동작 방식 {#how-it-works}

로그인할 때 코드를 요구할지는 두 개의 스위치가 결정합니다.

- **서버**가 TOTP를 허용해야 합니다. `mfa.totp.enabled` 옵션이며, 기본적으로 꺼져 있습니다.
- **계정**에 TOTP가 설정되어 있어야 합니다. 각 사용자가 자신의 계정에서 직접 켜며, 모든 사용자에게
  강제되지 않습니다.

둘 다 켜져 있으면 로그인은 두 단계로 진행됩니다.

1. 사용자는 평소처럼 비밀번호, LDAP 또는 OpenID Connect 공급자를 통해 로그인합니다. 2단계 인증은
   세 가지 방식 모두에 적용됩니다.
2. Semaphore는 세션을 열지만 검증되지 않은 상태로 표시하고 코드를 요청합니다. 코드가 승인될 때까지
   해당 세션의 모든 API 호출은 `401`과 `{"error":"TOTP_REQUIRED"}`로 거부됩니다.
3. 사용자가 앱에 표시된 코드를 입력합니다. Semaphore는 계정에 저장된 시크릿과 코드를 대조하고,
   올바른 코드이면 세션이 검증되어 로그인이 완료됩니다.

코드는 30초마다 바뀌며, 앱은 계정을 설정할 때 한 번 받은 시크릿으로 코드를 계산합니다. Semaphore와
휴대폰은 서로 통신하지 않으므로 휴대폰에는 네트워크 연결이 필요 없고, 대략 정확한 시계만 있으면
됩니다.

## 서버에서 켜기 {#turn-it-on-for-the-server}

구성 파일에 `mfa.totp` 섹션을 추가하고 Semaphore를 재시작합니다.

```json
{
  "mfa": {
    "totp": {
      "enabled": true,
      "allow_recovery": true
    }
  }
}
```

같은 설정을 환경 변수로도 지정할 수 있습니다.

```bash
SEMAPHORE_TOTP_ENABLED=true
SEMAPHORE_TOTP_ALLOW_RECOVERY=true
```

| 옵션 | 환경 변수 | 효과 |
|---|---|---|
| `mfa.totp.enabled` | `SEMAPHORE_TOTP_ENABLED` | 사용자가 TOTP를 설정할 수 있게 하고, 로그인할 때 코드를 요구합니다. 이 옵션이 없으면 이 설정은 누구에게도 표시되지 않습니다. |
| `mfa.totp.allow_recovery` | `SEMAPHORE_TOTP_ALLOW_RECOVERY` | TOTP를 설정할 때 각 사용자에게 일회용 [복구 코드](#recovery-code)를 발급하고, 휴대폰을 잃어버렸을 때 이 코드로 로그인할 수 있게 합니다. |
| `mfa.totp.app_name` | `SEMAPHORE_TOTP_ISSUER` | 인증 앱이 계정 옆에 표시하는 발급자 이름입니다. 기본값은 `Semaphore`입니다. 아래 경고를 참조하세요. |

:::warning ⚠️ 웹 인터페이스는 `app_name`을 사용하지 않습니다 (2026-11-27)
웹 인터페이스에서 설정한 계정은 `mfa.totp.app_name` 값과 관계없이 인증 앱에서 항상
`Semaphore:<email>`로 표시됩니다. 구성된 이름을 사용하는 것은
[`semaphore users totp enable`](#manage-the-second-factor-from-the-command-line)뿐입니다.
Semaphore를 두 개 이상 운영한다면 사용자는 이메일 주소로 항목을 구분하거나, 앱에서 항목 이름을
바꾸면 됩니다.
:::

모든 옵션은 [구성 레퍼런스](/reference/configuration)에도
나와 있습니다.

## 내 계정에 TOTP 설정하기 {#set-up-totp-for-your-account}

먼저 휴대폰에 인증 앱을 설치합니다. 그런 다음:

1. 프로젝트를 열고 사이드바 하단의 내 이름을 클릭한 뒤 **Edit Account**를
   선택합니다.
2. **Security** 탭을 엽니다.
3. **Two-factor authentication** 아래에서 **Time-based one-time password**를 켭니다.
   Semaphore가 즉시 시크릿을 만들어 QR 코드로 표시합니다.
4. 인증 앱에서 계정을 추가하고 QR 코드를 스캔합니다. 앱에 `Semaphore`의 여섯 자리 코드가
   표시되기 시작합니다.
5. QR 코드 아래에 **Recovery code**가 표시되면 옆의 버튼으로 복사해 비밀번호 관리자나 종이 등
   안전한 곳에 보관하세요. 지금 한 번만 표시됩니다.
6. 대화 상자를 닫습니다.

<div style={{maxWidth: 450}}>

![2단계 인증이 켜진 Edit User 대화 상자의 Security 탭: 스캔할 QR 코드와 그 아래의 복구 코드](/assets/two-factor-enrol.webp)

</div>

스위치는 즉시 적용됩니다. 누를 **Save** 버튼도, 입력할 테스트 코드도 없습니다. 로그아웃하기 전에
앱에 Semaphore 코드가 표시되는지 확인하세요. 다음 로그인 때 그 코드를 요구합니다.

나중에 **Security** 탭을 다시 열어 다른 기기에서 QR 코드를 스캔할 수 있습니다. 복구 코드는 다시
표시되지 않습니다.

## 코드로 로그인하기 {#sign-in-with-a-code}

비밀번호, LDAP 또는 싱글 사인온 단계가 끝나면 Semaphore는 **Two-step verification**을 표시합니다.

![인증 앱의 여섯 자리 코드를 요구하는 Two-step verification 화면](/assets/two-factor-verify.webp)

앱에 현재 표시된 여섯 자리를 입력합니다. 여섯 번째 숫자를 입력하면 양식이 자동으로 제출됩니다.
코드가 틀렸거나 만료되었으면 오류가 표시되고 같은 화면에 머뭅니다. 다음 코드를 기다렸다가 다시
시도하세요.

**Return to login**은 이번 로그인을 취소하고 처음부터 다시 시작합니다.

## 복구 코드 사용하기 {#recovery-code}

휴대폰을 잃어버리거나 초기화했을 때, 복구 코드가 있으면 사용자가 스스로 다시 로그인할 수 있습니다.

1. 평소처럼 비밀번호로 로그인합니다.
2. **Two-step verification**에서 **Use recovery code**를 클릭합니다.
3. 복구 코드를 입력하고 **Send**를 클릭합니다.

Semaphore가 로그인을 완료하고 **계정에서 TOTP를 제거합니다**. 복구 코드도 함께 소진됩니다.
[위에서](#set-up-totp-for-your-account) 설명한 대로 즉시 TOTP를 다시 설정해 새 시크릿과 새 복구
코드를 받으세요.

**Use recovery code**는 서버에서 `mfa.totp.allow_recovery`가 켜져 있을 때만
표시됩니다. 복구 코드는 16자이며 bcrypt 해시로만 저장되므로, 관리자를 포함한 누구도 나중에
사용자의 코드를 다시 읽을 수 없습니다.

## 2단계 인증 제거하기 {#remove-the-second-factor}

**내 계정.** **Edit Account**의 **Security** 탭에서 **Time-based one-time password**를 끕니다.
TOTP가 즉시 제거되고, 다음 로그인 때는 첫 번째 단계만 요구합니다. 인증 앱에서도 Semaphore 항목을
삭제하세요. 더 이상 어떤 계정과도 맞지 않습니다.

**다른 사람의 계정.** 휴대폰을 잃어버렸고 복구 코드도 없는 사용자는 TOTP를 스스로 제거할 수
없습니다. 관리자 또는 전역 역할에 사용자 관리 권한이 있는 사용자가 **Users**를 열어 해당 사용자를
편집하고 **Security** 탭에서 스위치를 끕니다. 사용자는 비밀번호만으로 로그인한 뒤 TOTP를 다시
설정합니다.

### 명령줄에서 2단계 인증 관리하기 {#manage-the-second-factor-from-the-command-line}

서버에서는 웹 인터페이스 없이도 같은 작업을 할 수 있습니다. 유일한 관리자가 휴대폰을 잃어버렸을
때 유용합니다.

```bash
semaphore users totp disable --login jane
```

`semaphore users totp enable --login jane`은 사용자에게 TOTP를 설정하고 `otpauth://` URL, QR 코드,
복구 코드를 터미널에 출력합니다. `show`는 기존 설정의 URL과 QR 코드를 출력합니다. 두 명령 모두
시크릿 자체를 출력하므로 다른 사람이 터미널을 볼 수 없는 곳에서만 실행하고, QR 코드는 소유자에게
직접 전달하세요. 전체 구문은 [`semaphore users`](/reference/cli/users#totp-management)에 있습니다.

## 서버에서 끄기 {#turn-it-off-for-the-server}

`mfa.totp.enabled`를 `false`로 설정하거나 섹션을 제거하고 재시작합니다. 그러면 로그인할 때 더 이상
코드를 요구하지 않으며, **Security**에서 **Two-factor authentication** 설정이
사라집니다.

누구의 설정도 삭제되지 않습니다. 옵션을 다시 켜면 TOTP가 있던 모든 계정이 같은 시크릿으로 다시
코드를 요구합니다. 아무것도 다시 스캔할 필요가 없습니다.

## 알아 둘 사항 {#things-to-know}

- **API 토큰은 2단계 인증을 거치지 않습니다.** `Authorization: Bearer` 토큰이 있는 요청에는
  코드를 요구하지 않습니다. 토큰은 로그인이 완전히 끝난 세션에서만 만들 수 있지만, TOTP를 설정하기
  전부터 있던 토큰은 계속 동작합니다. TOTP를 켠 뒤에는 **API Tokens** 페이지에서 토큰을
  검토하세요.
- **Semaphore는 코드 입력 시도 횟수를 제한하지 않습니다.** 여섯 자리는 경우의 수가 적으므로
  [리버스 프록시](/admin-guide/reverse-proxy)에서 `POST /api/auth/verify`와
  `POST /api/auth/recovery`에 속도 제한을 거세요.
- **시크릿은 데이터베이스에 그대로 저장됩니다.** `user__totp` 테이블이나 데이터베이스 백업을 읽을
  수 있는 사람은 모든 계정의 유효한 코드를 생성할 수 있습니다. 백업은 구성 파일과 마찬가지로
  보호하세요.
- **TOTP를 필수로 지정할 수 없습니다.** Semaphore에는 사용자에게 설정을 강제하는 옵션이 없습니다.
  정책상 모든 사용자에게 2단계 인증이 필요하다면 ID 공급자에서 강제하고, 사용자가
  [OpenID Connect](/admin-guide/authentication/openid)를 통해 로그인하게 하세요.

2단계 인증의 설정, 제거, 사용은 [감사 로그](/admin-guide/audit-log)에 `iam.mfa` 및 `auth.mfa`
이벤트로 기록됩니다. 목록은 [감사 이벤트](/reference/audit-events)를 참조하세요.

## 다음 단계 {#whats-next}

- [로컬 계정](/admin-guide/authentication/local) — 비밀번호, 세션 수명, 비밀번호 로그인 끄기.
- [보안](/admin-guide/security) — 해싱 매개변수, 암호화, 하드닝.
- [`semaphore users`](/reference/cli/users#totp-management) — TOTP 명령.
