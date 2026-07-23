# Vaults

The `semaphore vault` command manages the encryption of the secrets Semaphore
stores in the database — **Access Key secrets** (SSH keys, login/password pairs,
secret strings) and the **JWT signing key**.

```bash
semaphore vault --help
```

> `vault` is an alias for `vaults`.

It has two subcommands:

| Command | Purpose |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | Re-encrypt all stored secrets under the active encryption key. |
| [`vault check`](#checking-key-usage-vault-check) | Report which key id encrypts each stored secret (read-only). |

For how encryption keys are configured and rotated, see
[Encryption Keys](/admin-guide/security/encryption).

## Re-encrypting secrets (`vault rekey`)

Re-encrypts all locally stored secrets — Access Key secrets and the JWT signing
key — under the **active** encryption key, stamping that key's id into each
value. Secrets backed by an external secret storage are skipped (they are not
encrypted with the Semaphore keyring).

```bash
semaphore vault rekey
```

### Zero-downtime key rotation

The active key encrypts new writes; every other key in the keyset can still
decrypt old data. Rotation is therefore: add a key, switch the active pointer,
re-encrypt in the background, then drop the old key.

1. Add a new key to the keyset (a file in `keys_folder`, or a `keys:` entry) and
   point the active pointer (`active.secret_key`, or `secret_key_file`) at it.
   The change is applied within `keys_poll_interval` (default `15s`), or
   immediately with `kill -HUP <pid>` — no restart required.
2. Run `semaphore vault rekey` to re-encrypt existing data to the new key.
3. Run [`semaphore vault check`](#checking-key-usage-vault-check); once the old
   key shows `0 rows` it is safe to remove from the keyset.

### Options

| Flag | Description |
|------|-------------|
| `--old-key <key>` | Explicit old encryption key for a legacy single-key migration. Not needed when the old key is already in the keyset as a secondary. Used to decrypt un-prefixed (legacy) data that has no stamped key id. |
| `--backup <file>` | Write a backup of the current Access Key ciphertexts to `<file>` before re-encrypting. |
| `--rollback <file>` | Restore Access Key ciphertexts from a backup file instead of re-encrypting. |

### Backup and rollback

Take a snapshot of the current ciphertexts before re-encrypting, and restore it
if something goes wrong:

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

The backup is a JSON-lines file, one entry per Access Key (`project_id`,
`key_id`, `secret`). A rollback writes those ciphertexts back verbatim.

### Legacy single-key migration

If your data was encrypted by an older Semaphore that used the single
`access_key_encryption` key (no rotation, no stamped key id), pass that key
explicitly so it can be decrypted before being re-encrypted to the active key:

```bash
semaphore vault rekey --old-key <base64-old-key>
```

This is unnecessary once the old key is part of the keyset — Semaphore looks each
value up by its stamped id and decrypts with the matching key automatically.

## Checking key usage (`vault check`)

Read-only. Reports, per key id, how many locally stored Access Key secrets (and
the JWT signing key) that key encrypts, plus the JWT signing key's status. Run it
after `vault rekey` to confirm a retired key is safe to remove: a key with zero
references can be deleted from the keyset.

```bash
semaphore vault check
```

Example output:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

Each key id is reported with one of the following statuses:

| Status | Meaning |
|--------|---------|
| `active` | The key currently encrypts new writes. |
| `retired, rekey pending` | The key still encrypts some rows; run `vault rekey` to move them onto the active key. |
| `retired, SAFE TO REMOVE` | No rows reference the key (`0 rows`) — it can be removed from the keyset. |
| `legacy (no id)` | Rows encrypted before key ids existed; rekey to stamp an id. |
| `MISSING KEY (cannot decrypt)` | A referenced key id is absent from the keyset. |

If any secret references a key id that is missing from the keyset, the command
flags those rows and **exits with a non-zero status** — add the missing key back
to the keyset before that data can be decrypted.

### Multiple vault passwords (Ansible)

You can define multiple Ansible Vault passwords in the Key Store and attach them to an Ansible template. During execution, Semaphore will provide all configured passwords to Ansible so it can decrypt any referenced vaults.
