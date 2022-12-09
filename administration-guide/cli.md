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

