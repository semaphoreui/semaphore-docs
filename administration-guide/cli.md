---
description: Command line interface documentation
---

# CLI

{% hint style="info" %}
For Semaphore installed via Snap you should use `sudo` for using CLI. This is completely safe because Semaphore works in a [strict mode](https://snapcraft.io/docs/snap-confinement).
{% endhint %}

### Version

```bash
semaphore version
```

### Interactive setup

Use this option for first time configuration.

{% hint style="info" %}
Do not use this command for Semaphore installed via Snap. Use [Snap Configuration](https://docs.ansible-semaphore.com/administration-guide/configuration#snap-configuration) instead.
{% endhint %}

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

### Vault management

You can reencrypt your secrets in database with using following command:

```
semaphore vault rekey --old-key <encryption-key-which-used-before>
```

Your data will be decryped using `<encryption-key-which-used-before>` and will be encrypted using key in configuration key `access_key_encryption`.

