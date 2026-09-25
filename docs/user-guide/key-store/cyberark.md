---
title: CyberArk secret storage
description: Enterprise option for reading and storing Key Store secrets in CyberArk Privileged Access Manager (Self-Hosted or Privilege Cloud) through the PVWA REST API.
sidebar_custom_props:
  edition: pro
---

# CyberArk secret storage <Enterprise />

Semaphore UI Enterprise can use **CyberArk Privileged Access Manager** (PAM Self-Hosted or Privilege Cloud) as an external storage for Key Store secrets instead of the database. Semaphore talks to the Password Vault Web Access (PVWA) REST API: every Semaphore key maps to a CyberArk **account** inside a **Safe**.

## Configuration options {#configuration-options}

When you create a **CyberArk** storage under **Key Store → Storages**, configure:

| Field | Description |
|-------|-------------|
| **Server URL** | PVWA base address, for example `https://pvwa.example.com`. A trailing `/PasswordVault` is accepted. Required. |
| **Skip TLS certificate verification** | Disables certificate validation. Only for test environments. |
| **Authentication method** | PVWA logon method for the Semaphore user: `CyberArk` (default), `LDAP`, `RADIUS` or `Windows`. |
| **Username** | The PVWA user Semaphore logs on with. Required. |
| **Password** | Password of that user. Can be stored in the database, read from an environment variable, or loaded from a file. |
| **Default Safe** | Safe used when a key references an account without a Safe prefix, and the default sync path. |
| **Platform ID for new accounts** | Platform assigned to accounts Semaphore creates (for example `UnixSSH`). Required only when the storage is not read-only and you create keys from Semaphore. |
| **Address for new accounts** | Optional address property for accounts Semaphore creates. Some platforms require it. |

The storage can work in read-only mode. In that mode Semaphore only reads and syncs accounts and never creates, updates, or deletes anything in the Vault.

### Required PVWA permissions {#required-pvwa-permissions}

Grant the Semaphore user the following permissions on each Safe you use:

| Operation | Safe permissions |
|-----------|------------------|
| Read a key, sync | **List accounts**, **Retrieve accounts** |
| Create a key from Semaphore | **Add accounts** |
| Update a key from Semaphore | **Update password value**, **Update account properties** |
| Delete a key from Semaphore | **Delete accounts** |

Semaphore always requests a concurrent PVWA session (`concurrentSession`), so several Semaphore nodes or a running task and a scheduled sync can share the same user without logging each other out. This requires PVWA 11.3 or later.

:::warning
Do not enable "require reason" or ticketing-system integration for the Safes used by Semaphore. Semaphore sends a fixed reason but cannot provide ticket numbers.
:::

## How to use {#how-to-use}

1. In your project, open **Key Store → Storages** and create a **CyberArk** storage.
2. When creating or editing a key, select that storage and enter the account as `Safe/AccountName`. The account name is the object name shown in PVWA. If the storage has a default Safe, `AccountName` alone is enough.
3. Optionally configure [sync paths](/user-guide/key-store/secret-sync) to import whole Safes automatically on a schedule.

### Key type mapping {#key-type-mapping}

| Semaphore key type | CyberArk account |
|--------------------|------------------|
| **Login with password** | Password account: `userName` becomes the login, the account secret becomes the password. |
| **SSH** | Key account (`secretType: key`): `userName` becomes the login, the account secret is the private key. SSH keys with a passphrase cannot be stored in CyberArk. |
| **Secret / string** | Password account without a user name. The account secret is used as is. |

When Semaphore creates an account, automatic management by the Central Policy Manager (CPM) is disabled so CyberArk does not rotate a secret Semaphore just wrote. If you want CyberArk to rotate the credential, manage the account from PVWA and mark the storage read-only in Semaphore.

## Syncing secrets {#syncing-secrets}

A sync path is the name of a Safe. Semaphore imports every account of the Safe as a key named after the account (with the optional prefix). The key type is detected from the account: key accounts become SSH keys, password accounts with a user name become Login with password keys, and password accounts without a user name become plain secrets. See [Syncing secrets from remote storages](/user-guide/key-store/secret-sync).
