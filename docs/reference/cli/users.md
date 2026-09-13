---
title: Users
description: Creating, changing, listing, and deleting users from the command line, plus API token and TOTP (2FA) management.
---

# Users

The `semaphore users` command adds, changes, removes, and inspects users, and
manages their API tokens and TOTP (2FA) verification.

```bash
semaphore users --help
```

> `user` is an alias for `users`.

| Command | Purpose |
|---------|---------|
| [`users add`](#add-a-user) | Create a user. |
| [`users change-by-login`](#change-a-user) | Update a user found by login. |
| [`users change-by-email`](#change-a-user) | Update a user found by email. |
| [`users get`](#show-a-user) | Print one user's details. |
| [`users list`](#list-users) | Print all user logins. |
| [`users delete`](#delete-a-user) | Remove a user. |
| [`users token create`](#create-a-token) | Create an API token for a user. |
| [`users token list`](#list-tokens) | List a user's API tokens. |
| [`users totp enable`](#totp-management) | Enable TOTP for a user. |
| [`users totp show`](#totp-management) | Show a user's TOTP details. |
| [`users totp disable`](#totp-management) | Disable TOTP for a user. |

## Add a user {#add-a-user}

```bash
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

| Flag | Description |
|------|-------------|
| `--login` | User login. **Required.** |
| `--name` | User's display name. **Required.** |
| `--email` | User's email. **Required.** |
| `--password` | User's password. Required for regular users; not allowed for external users. |
| `--admin` | Mark the new user as an admin. |
| `--external` | Mark the new user as external (LDAP or OIDC). External users must not be given a `--password`. |

On success the command prints `User <login> <email> added!`.

## Change a user {#change-a-user}

You can find the user to change either by login or by email.

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

| Flag | Description |
|------|-------------|
| `--login` | For `change-by-login`, the login of the user to find (**required**). For `change-by-email`, the user's new login. |
| `--email` | For `change-by-email`, the email of the user to find (**required**). For `change-by-login`, the user's new email. |
| `--name` | User's new name. |
| `--password` | User's new password. |
| `--admin` | Grant admin rights. |

Only the flags you provide are applied; omitted fields are left unchanged.
`--admin` can only grant admin rights. It cannot revoke them; use the web UI
for that.

## Show a user {#show-a-user}

Print a single user's details, looked up by login or email.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

At least one of `--login` or `--email` is required. The output includes the
user's ID, creation time, login, name, email, and admin status. If no user
matches, the command prints a message and exits with a non-zero status.

## List users {#list-users}

Print the logins of all users, one per line.

```bash
semaphore user list
```

## Delete a user {#delete-a-user}

Remove a user, looked up by login or email.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

At least one of `--login` or `--email` is required.

## API token management {#api-token-management}

Manage a user's API tokens via the CLI:

```bash
semaphore user token --help
```

### Create a token {#create-a-token}

```bash
# Token that never expires
semaphore user token create --login john --name "CI token"

# Token that expires after 24 hours
semaphore user token create --login john --name "CI token" --ttl 24h
```

| Flag | Description |
|------|-------------|
| `--login` | Login of the token owner. **Required.** |
| `--name` | Token name. |
| `--ttl` | Token lifetime as a Go duration (e.g. `1h`, `30m`, `24h`). The token never expires if omitted. |

The command prints the new token on its own line and nothing else, so it is safe
to capture in a script:

```bash
TOKEN=$(semaphore user token create --login ci --name "CI token" --ttl 720h)
```

An invalid `--ttl` value or an unknown login is reported and the command exits
with a non-zero status.

### List tokens {#list-tokens}

```bash
semaphore user token list --login john
```

`--login` is required. Each line lists the token name, its status (`active` or
`expired`), and its expiry time in RFC 3339 format (`never` if it has no
expiry), separated by tabs. Token values are never printed.

## TOTP management {#totp-management}

Manage time-based one-time password (2FA) verification via the CLI:

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

All TOTP subcommands require `--login`.

- `enable` prints a one-time recovery code, the `otpauth://` URL, and a
  scannable QR code. Store the recovery code in a safe place. It fails if TOTP
  is already enabled for the user.
- `show` prints the `otpauth://` URL and QR code again, or `TOTP disabled` if
  the user has no TOTP set up.
- `disable` removes the user's TOTP verification. It fails if TOTP is not
  enabled.

The issuer shown in authenticator apps is taken from the `mfa.totp.app_name`
configuration option (`SEMAPHORE_TOTP_ISSUER`). It defaults to `Semaphore`.
