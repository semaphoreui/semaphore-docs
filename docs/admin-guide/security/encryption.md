---
id: encryption
title: Encryption Keys
sidebar_label: Encryption Keys
description: How Semaphore encrypts secrets, configures encryption keys, and rotates them with zero downtime.
---

# Encryption Keys

Semaphore encrypts the most sensitive data it stores — **Access Key secrets**
(SSH private keys, login/password pairs, secret strings) and the **JWT signing
key** — using AES‑256‑GCM. This page explains how to configure those keys, how
rotation works, and how to operate it safely.

:::info Two keys, two purposes

| Key | Protects | Active pointer |
|-----|----------|----------------|
| **Secrets key** | Access Key secrets stored in the database | `active.secrets_key` |
| **Options key** | Encrypted DB options (the JWT signing key) | `active.options_key` |

If no options key is configured, options fall back to the secrets key.
:::

---

## Quick start

The simplest setup is a single key supplied in the main config:

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secrets_key: key1
```

Generate a key with:

```bash
openssl rand -base64 32
```

That's it — Semaphore now encrypts secrets with `key1`. The same key is used for
the JWT signing key (options fall back to the secrets key).

:::tip Production
Prefer **`file:` references** or a **`keys_folder`** (see below) over inline
`value:`, so the key material lives in a mounted secret rather than the config.
:::

---

## How keys are identified

Every key has a **key id** derived from the key material itself — a fingerprint,
`base64url(sha256(key))[:8]`. The id (not the key) is stored alongside each
encrypted value, so decryption is a direct lookup of the exact key that wrote it.

This means:

- **Labels are free to rename.** `key1`, `secrets_key_primary.txt` — these are
  for humans. The database never stores them, only the fingerprint.
- **A key can never be mis-pointed.** Change a key's bytes and it becomes a *new*
  id; the old data keeps referencing the old id.
- **Removing a key fails loudly**, not silently — a missing key id is an explicit
  error, never garbage output.

You never set ids by hand; Semaphore computes them.

---

## The keys file

`encryption.keys_file` points to a file whose content is a **registry of keys**
plus **pointers** to the active key per purpose. It is parsed as **YAML or JSON,
regardless of file extension**.

There are two ways to provide the registry — an inline map, a folder of files, or
both combined.

### Inline map

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secrets_key }                         # from a file (prod)
active:
  secrets_key: key1
  options_key: key2
```

Each entry is a [`KeySource`](#keysource): either `value` (inline base64) **or**
`file` (path to a file containing the base64 key) — never both.

### Folder of key files

Point `keys_folder` at a directory; **every regular file is one key**, labelled by
its filename. Ideal for mounted Docker/Kubernetes secrets.

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secrets_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  options_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Kubernetes-friendly
`keys_folder` skips dot‑prefixed entries (`..data`, `..2024_*`) and follows
symlinks, so it works directly with the way Kubernetes mounts `Secret`/`ConfigMap`
volumes.
:::

### Combined

`keys` and `keys_folder` merge into one registry; `active` may point by label
*or* by filename:

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secrets_key: inline1
  options_key_file: options_key_primary.txt
```

---

## Rotation (zero downtime)

The active key encrypts **new** writes; every other key in the registry can still
**decrypt** old data. Rotation is therefore: add a key, switch the pointer,
re-encrypt in the background, then drop the old key.

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secrets_key: key2        # (or secrets_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

No process restart is needed at any step.

### Applying changes without a restart

Semaphore re-reads the keys file (and the key files it references) and swaps the
in‑memory keys atomically. Two triggers:

| Trigger | Behaviour |
|---------|-----------|
| **File watcher** | Polls every `encryption.keys_poll_interval` (default `15s`). Set to `"0"` to disable. |
| **`SIGHUP`** | `kill -HUP <pid>` forces an immediate reload (Unix only). |

:::caution Windows
Windows has no `SIGHUP`. Rely on the **poller** (the default) — it works on every
platform — or restart the service.
:::

A reload validates the new keys first and, on any error, leaves the running keys
untouched.

---

## CLI commands

### `vault check`

Read‑only. Reports, per key id, how many stored secrets it encrypts, so you can
see what is on the active key and what is safe to remove.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

Statuses: `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)`, and `MISSING KEY` (a referenced key is absent — exit code 1).

### `vault rekey`

Re‑encrypts all stored secrets (and the JWT signing key) under the active key.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## Backward compatibility

Upgrading is safe and requires **no data migration**:

- Existing installs that set **`access_key_encryption`** (or the
  `SEMAPHORE_ACCESS_KEY_ENCRYPTION` env var) keep working unchanged — that flat
  key becomes the active secrets key.
- Data written by older Semaphore (no key id) still decrypts. On its next write,
  or after `vault rekey`, it is re‑stamped with a key id.
- **No encryption at all** (no key configured) continues to store secrets as
  plain base64 and decrypts them the same way.

To migrate an old single-key install onto a keys file, just include the old key
in the registry:

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secrets_key: new
```

Old data decrypts via `old`; run `vault rekey` to move everything onto `new`.

---

## Kubernetes & Docker

Mount your keys as a `Secret` volume and point `keys_folder` at it:

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secrets_key_file: secrets_key_primary.txt
  options_key_file: options_key_primary.txt
```

When you update the `Secret`, Kubernetes refreshes the mounted files and the
poller applies the change within `keys_poll_interval` — no pod restart.

---

## Security best practices

:::danger Protect the keys file
- Restrict permissions: `chmod 0400`, owned by the Semaphore service user.
- **Never commit real keys** to version control — add the file to `.gitignore`.
- Back it up securely. **Losing every key means losing all encrypted data.**
- Prefer mounted secrets (`file:` / `keys_folder`) over inline `value:`, and env
  over neither — `value:` keeps the key in the config file.
:::

---

## Reference

### `encryption` (main config)

| Field | Env | Default | Description |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | Path to the keys file (YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | How often the keys file is polled. `"0"` disables polling. |

### Legacy flat keys (main config)

| Field | Env | Description |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | Single secrets key, no rotation. Used when `keys_file` is unset. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | Single options key, no rotation. Falls back to the secrets key. |

### Keys file

| Field | Description |
|-------|-------------|
| `keys` | Map of `label → KeySource` (inline registry). |
| `keys_folder` | Directory of key files (one regular file per key, labelled by filename). |
| `active.secrets_key` | Label (in `keys`) of the active secrets key. |
| `active.options_key` | Label of the active options key. |
| `active.secrets_key_file` | Filename in `keys_folder` of the active secrets key (relative). |
| `active.options_key_file` | Filename in `keys_folder` of the active options key (relative). |

### KeySource

| Field | Description |
|-------|-------------|
| `value` | Inline base64 key material. |
| `file` | Path to a file containing the base64 key. |

`value` and `file` are mutually exclusive. Keys must be base64 of **16, 24, or 32
bytes** (AES‑128/192/256).

---

## Troubleshooting

| Symptom | Cause / fix |
|---------|-------------|
| Panics at startup: `encryption_keys… not found` / `invalid` | The keys file or a referenced key file is missing/malformed, or a key is not valid base64 of 16/24/32 bytes. Fix the file; startup fails fast on purpose. |
| `vault check` shows `MISSING KEY <id>` (exit 1) | Data was encrypted with a key no longer in the registry. Add that key back before it can be decrypted. |
| `cannot decrypt access key, perhaps encryption key was changed` | A legacy (un‑prefixed) value can't be decrypted by any configured key. Ensure the original key is present (in the registry or `access_key_encryption`). |
| Rotation not applied | Check `keys_poll_interval` (not `"0"`) and that the keys file actually changed; or send `SIGHUP`. |
| `active.secrets_key: no key labelled "…"` | The active pointer names a label/filename that isn't in `keys`/`keys_folder`. |
