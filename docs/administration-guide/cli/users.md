# Users

Using CLI you can add, remove or change user.

```
semaphore user --help
```

## How to add admin user

```
semaphore user add \
    --admin \
    --login newAdmin \
    --email new-admin@example.com \
    --name "New Admin" \
    --password "New$Password"
```

## How to change user password

```
semaphore user change-by-login \
    --login myAdmin \
    --password "New$Password"
```

## TOTP management

Manage time-based one-time password (2FA) via CLI:

```
semaphore user totp --help
```

Examples:

```
# Enable TOTP for a user
semaphore user totp enable --login john

# Generate recovery codes (if allowed by config)
semaphore user totp recovery --login john
```
