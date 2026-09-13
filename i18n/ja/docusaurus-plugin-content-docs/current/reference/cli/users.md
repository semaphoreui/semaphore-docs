# ユーザー

`semaphore users` コマンドは、ユーザーの追加、変更、削除、参照を行い、ユーザーの
API トークンと TOTP (2FA) 認証を管理します。

```bash
semaphore users --help
```

> `user` は `users` のエイリアスです。

| コマンド | 用途 |
|---------|---------|
| [`users add`](#add-a-user) | ユーザーを作成します。 |
| [`users change-by-login`](#change-a-user) | ログイン名で検索したユーザーを更新します。 |
| [`users change-by-email`](#change-a-user) | メールアドレスで検索したユーザーを更新します。 |
| [`users get`](#show-a-user) | 1 人のユーザーの詳細を表示します。 |
| [`users list`](#list-users) | すべてのユーザーのログイン名を表示します。 |
| [`users delete`](#delete-a-user) | ユーザーを削除します。 |
| [`users token create`](#create-a-token) | ユーザーの API トークンを作成します。 |
| [`users token list`](#list-tokens) | ユーザーの API トークンを一覧表示します。 |
| [`users totp enable`](#totp-management) | ユーザーの TOTP を有効にします。 |
| [`users totp show`](#totp-management) | ユーザーの TOTP の詳細を表示します。 |
| [`users totp disable`](#totp-management) | ユーザーの TOTP を無効にします。 |

## ユーザーの追加 {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| フラグ | 説明 |
|------|-------------|
| `--login` | ユーザーのログイン名。**必須。** |
| `--name` | ユーザーの表示名。**必須。** |
| `--email` | ユーザーのメールアドレス。**必須。** |
| `--password` | ユーザーのパスワード。通常のユーザーでは必須、外部ユーザーでは指定できません。 |
| `--admin` | 新しいユーザーを管理者にします。 |
| `--external` | 新しいユーザーを外部ユーザー (LDAP または OIDC) にします。外部ユーザーに `--password` を指定してはいけません。 |

成功すると、コマンドは `User <login> <email> added!` と表示します。

## ユーザーの変更 {#change-a-user}

変更するユーザーは、ログイン名またはメールアドレスで検索できます。

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

| フラグ | 説明 |
|------|-------------|
| `--login` | `change-by-login` では検索するユーザーのログイン名 (**必須**)。`change-by-email` ではユーザーの新しいログイン名。 |
| `--email` | `change-by-email` では検索するユーザーのメールアドレス (**必須**)。`change-by-login` ではユーザーの新しいメールアドレス。 |
| `--name` | ユーザーの新しい名前。 |
| `--password` | ユーザーの新しいパスワード。 |
| `--admin` | 管理者権限を付与します。 |

指定したフラグのみが適用され、省略したフィールドは変更されません。
`--admin` は管理者権限の付与のみ可能で、取り消すことはできません。取り消すには Web UI を
使用してください。

## ユーザーの表示 {#show-a-user}

ログイン名またはメールアドレスで検索した 1 人のユーザーの詳細を表示します。

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

`--login` または `--email` の少なくとも一方が必要です。出力には、ユーザーの ID、作成日時、
ログイン名、名前、メールアドレス、管理者ステータスが含まれます。一致するユーザーがいない場合、
コマンドはメッセージを表示して非ゼロのステータスで終了します。

## ユーザーの一覧表示 {#list-users}

すべてのユーザーのログイン名を 1 行に 1 つずつ表示します。

```bash
semaphore user list
```

## ユーザーの削除 {#delete-a-user}

ログイン名またはメールアドレスで検索したユーザーを削除します。

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

`--login` または `--email` の少なくとも一方が必要です。

## API トークンの管理 {#api-token-management}

CLI からユーザーの API トークンを管理します:

```bash
semaphore user token --help
```

### トークンの作成 {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| フラグ | 説明 |
|------|-------------|
| `--login` | トークン所有者のログイン名。**必須。** |
| `--name` | トークン名。 |
| `--ttl` | Go の duration 形式でのトークンの有効期間 (例: `1h`、`30m`、`24h`)。省略した場合、トークンは失効しません。 |

このコマンドは新しいトークンを 1 行で表示し、それ以外は何も出力しないため、スクリプトで
安全に取得できます:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

無効な `--ttl` 値や不明なログイン名が指定された場合はエラーが報告され、コマンドは非ゼロの
ステータスで終了します。

### トークンの一覧表示 {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` は必須です。各行には、トークン名、ステータス (`active` または `expired`)、
RFC 3339 形式の有効期限 (期限がない場合は `never`) がタブ区切りで表示されます。
トークンの値は表示されません。

## TOTP の管理 {#totp-management}

CLI から時間ベースのワンタイムパスワード (2FA) 認証を管理します:

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

すべての TOTP サブコマンドには `--login` が必要です。

- `enable` は、一度だけ使えるリカバリーコード、`otpauth://` URL、およびスキャン可能な
  QR コードを表示します。リカバリーコードは安全な場所に保管してください。ユーザーの TOTP が
  すでに有効な場合は失敗します。
- `show` は `otpauth://` URL と QR コードを再度表示します。ユーザーに TOTP が設定されていない
  場合は `TOTP disabled` と表示します。
- `disable` はユーザーの TOTP 認証を削除します。TOTP が有効になっていない場合は
  失敗します。

認証アプリに表示される発行者 (issuer) は、設定オプション `mfa.totp.app_name`
(`SEMAPHORE_TOTP_ISSUER`) から取得されます。デフォルトは `Semaphore` です。
