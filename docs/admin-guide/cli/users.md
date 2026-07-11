# Users

Using the CLI you can add, change, remove, and inspect users, as well as manage their API tokens and TOTP (2FA) verification.

```bash
semaphore user --help
```

## Add a user

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

## Change a user

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
| `--login` | For `change-by-login`, the login of the user to find (**required**). For both commands, also used to set the user's new login. |
| `--email` | For `change-by-email`, the email of the user to find (**required**). For both commands, also used to set the user's new email. |
| `--name` | User's new name. |
| `--password` | User's new password. |
| `--admin` | Mark the user as an admin. |

Only the flags you provide are applied; omitted fields are left unchanged.

## Show a user

Print a single user's details, looked up by login or email.

```bash
semaphore user get --login myAdmin
# or
semaphore user get --email admin@example.com
```

At least one of `--login` or `--email` is required. The output includes the user's ID, creation time, login, name, email, and admin status.

## List users

Print the logins of all users.

```bash
semaphore user list
```

## Delete a user

Remove a user, looked up by login or email.

```bash
semaphore user delete --login myAdmin
# or
semaphore user delete --email admin@example.com
```

At least one of `--login` or `--email` is required.

## API token management

Manage a user's API tokens via the CLI:

```bash
semaphore user token --help
```

### Create a token

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
| `--ttl` | Token lifetime (e.g. `1h`, `30m`, `24h`). The token never expires if omitted. |

The command prints the new token's ID on success.

### List tokens

```bash
semaphore user token list --login john
```

`--login` is required. Each line lists the token name, its status (`active` or `expired`), and its expiry time (`never` if it has no expiry).

## TOTP management

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

All TOTP subcommands require `--login`. Enabling TOTP prints a one-time recovery code along with the otpauth URL and a scannable QR code; store the recovery code in a safe place.
