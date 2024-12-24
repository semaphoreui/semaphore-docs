<div class="breadcrumbs">
    <a href="/administration-guide/runners">CLI</a>
    → Vaults
</div>

### Vaults

You can reencrypt your secrets in database with using following command:

```
semaphore vault rekey --old-key <encryption-key-which-used-before>
```

Your data will be decryped using `<encryption-key-which-used-before>` and will be encrypted using option `access_key_encryption` from configuration key.
