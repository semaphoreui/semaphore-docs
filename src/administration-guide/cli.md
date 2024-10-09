---
description: Command line interface documentation
---

# CLI

<div class="warning">
    For Semaphore installed via Snap you should use `sudo` for using CLI. This is completely safe because Semaphore works in a <a href="https://snapcraft.io/docs/snap-confinement">strict mode</a>.
</div>

### Version

```bash
semaphore version
```

### Interactive setup

Use this option for first time configuration.


<div class="warning">
    Do not use this command for Semaphore installed via Snap. Use <a href="./configuration#snap-configuration">Snap Configuration</a> instead.
</div>

```
semaphore setup
```

### User management

Using CLI you can add, remove or change user.

```
semaphore user --help
```

#### How to add admin user
```
semaphore user add --admin --login newAdmin --email new-admin@example.com --name "New Admin" --password "New$Password"
```

#### How to change user password
```
semaphore user change-by-login --login myAdmin --password "New$Password"
```

### Vault management

You can reencrypt your secrets in database with using following command:

```
semaphore vault rekey --old-key <encryption-key-which-used-before>
```

Your data will be decryped using `<encryption-key-which-used-before>` and will be encrypted using option `access_key_encryption` from configuration key.

