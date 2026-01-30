# Vaults

You can reencrypt your secrets in database with using following command:

```
semaphore vault rekey --old-key <encryption-key-which-used-before>
```

Your data will be decryped using `<encryption-key-which-used-before>` and will be encrypted using option `access_key_encryption` from configuration key.

#### Multiple vault passwords (Ansible)

You can define multiple Ansible Vault passwords in the Key Store and attach them to an Ansible template. During execution, Semaphore will provide all configured passwords to Ansible so it can decrypt any referenced vaults.
