# 사용자

`semaphore users` 명령은 사용자를 추가, 변경, 삭제, 조회하고 사용자의 API
token과 TOTP(2FA) 인증을 관리합니다.

```bash
semaphore users --help
```

> `user`는 `users`의 별칭입니다.

| 명령 | 용도 |
|---------|---------|
| [`users add`](#add-a-user) | 사용자를 생성합니다. |
| [`users change-by-login`](#change-a-user) | 로그인으로 찾은 사용자를 업데이트합니다. |
| [`users change-by-email`](#change-a-user) | 이메일로 찾은 사용자를 업데이트합니다. |
| [`users get`](#show-a-user) | 사용자 한 명의 세부 정보를 출력합니다. |
| [`users list`](#list-users) | 모든 사용자의 로그인을 출력합니다. |
| [`users delete`](#delete-a-user) | 사용자를 삭제합니다. |
| [`users token create`](#create-a-token) | 사용자의 API token을 생성합니다. |
| [`users token list`](#list-tokens) | 사용자의 API token을 나열합니다. |
| [`users totp enable`](#totp-management) | 사용자의 TOTP를 활성화합니다. |
| [`users totp show`](#totp-management) | 사용자의 TOTP 세부 정보를 표시합니다. |
| [`users totp disable`](#totp-management) | 사용자의 TOTP를 비활성화합니다. |

## 사용자 추가 {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| 플래그 | 설명 |
|------|-------------|
| `--login` | 사용자 로그인. **필수.** |
| `--name` | 사용자의 표시 이름. **필수.** |
| `--email` | 사용자의 이메일. **필수.** |
| `--password` | 사용자의 비밀번호. 일반 사용자에게는 필수이며, 외부 사용자에게는 허용되지 않습니다. |
| `--admin` | 새 사용자를 관리자로 지정합니다. |
| `--external` | 새 사용자를 외부 사용자(LDAP 또는 OIDC)로 지정합니다. 외부 사용자에게는 `--password`를 지정하면 안 됩니다. |

성공하면 명령은 `User <login> <email> added!`를 출력합니다.

## 사용자 변경 {#change-a-user}

변경할 사용자를 로그인 또는 이메일로 찾을 수 있습니다.

```bash
# Find user by login
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"

# Find user by email
semaphore user change-by-email \
    --email admin@example.com \
    --name "Renamed Admin"
```

| 플래그 | 설명 |
|------|-------------|
| `--login` | `change-by-login`의 경우 찾을 사용자의 로그인(**필수**). `change-by-email`의 경우 사용자의 새 로그인. |
| `--email` | `change-by-email`의 경우 찾을 사용자의 이메일(**필수**). `change-by-login`의 경우 사용자의 새 이메일. |
| `--name` | 사용자의 새 이름. |
| `--password` | 사용자의 새 비밀번호. |
| `--admin` | 관리자 권한을 부여합니다. |

제공한 플래그만 적용되며, 생략한 필드는 변경되지 않습니다.
`--admin`은 관리자 권한을 부여만 할 수 있습니다. 권한을 회수할 수는 없으며,
회수하려면 웹 UI를 사용하십시오.

## 사용자 표시 {#show-a-user}

로그인 또는 이메일로 조회한 사용자 한 명의 세부 정보를 출력합니다.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

`--login` 또는 `--email` 중 하나 이상이 필요합니다. 출력에는 사용자의 ID,
생성 시각, 로그인, 이름, 이메일, 관리자 여부가 포함됩니다. 일치하는 사용자가
없으면 명령은 메시지를 출력하고 0이 아닌 상태로 종료됩니다.

## 사용자 목록 {#list-users}

모든 사용자의 로그인을 한 줄에 하나씩 출력합니다.

```bash
semaphore user list
```

## 사용자 삭제 {#delete-a-user}

로그인 또는 이메일로 조회한 사용자를 삭제합니다.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

`--login` 또는 `--email` 중 하나 이상이 필요합니다.

## API token 관리 {#api-token-management}

CLI로 사용자의 API token을 관리합니다.

```bash
semaphore user token --help
```

### token 생성 {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| 플래그 | 설명 |
|------|-------------|
| `--login` | token 소유자의 로그인. **필수.** |
| `--name` | token 이름. |
| `--ttl` | Go duration 형식의 token 유효 기간(예: `1h`, `30m`, `24h`). 생략하면 token이 만료되지 않습니다. |

이 명령은 새 token만 한 줄로 출력하고 다른 내용은 출력하지 않으므로 스크립트에서
안전하게 캡처할 수 있습니다.

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

잘못된 `--ttl` 값이나 알 수 없는 로그인은 보고되며 명령은 0이 아닌 상태로
종료됩니다.

### token 목록 {#list-tokens}

```bash
semaphore user token list --login john
```

`--login`은 필수입니다. 각 줄에는 token 이름, 상태(`active` 또는 `expired`),
RFC 3339 형식의 만료 시각(만료가 없으면 `never`)이 탭으로 구분되어 표시됩니다.
token 값은 절대 출력되지 않습니다.

## TOTP 관리 {#totp-management}

CLI로 시간 기반 일회용 비밀번호(2FA) 인증을 관리합니다.

```bash
semaphore user totp --help
```

```bash
# Enable TOTP for a user (prints a recovery code, the otpauth URL, and a QR code)
semaphore user totp enable --login john

# Show the current TOTP details (otpauth URL and QR code)
semaphore user totp show --login john

# Disable TOTP for a user
semaphore user totp disable --login john
```

모든 TOTP 하위 명령에는 `--login`이 필요합니다.

- `enable`은 일회용 복구 코드, `otpauth://` URL, 스캔 가능한 QR 코드를
  출력합니다. 복구 코드는 안전한 곳에 보관하십시오. 사용자에게 TOTP가 이미
  활성화되어 있으면 실패합니다.
- `show`는 `otpauth://` URL과 QR 코드를 다시 출력하며, 사용자에게 TOTP가
  설정되어 있지 않으면 `TOTP disabled`를 출력합니다.
- `disable`은 사용자의 TOTP 인증을 제거합니다. TOTP가 활성화되어 있지 않으면
  실패합니다.

인증 앱에 표시되는 발급자는 `mfa.totp.app_name` 구성 옵션
(`SEMAPHORE_TOTP_ISSUER`)에서 가져옵니다. 기본값은 `Semaphore`입니다.
