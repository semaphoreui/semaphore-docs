# OpenBao secret storage

Semaphore UI supports [OpenBao](https://openbao.org) as a storage for secrets.

OpenBao is an open-source fork of HashiCorp Vault and is API-compatible with it, so the storage works exactly like the [HashiCorp Vault storage](/user-guide/key-store/hashicorp-vault).

Prerequisites:

- A running OpenBao server.
- An authentication token with access to the KV secrets engine mount.

You can provide the following options:
- **Server URL** — address of your OpenBao server.
- **Mount** — the KV v2 secrets engine mount path (`secret` by default).
- **Namespace** — OpenBao namespace (v2.3+), optional.
- **Token** — authentication token. The token can be:
    - Stored in the database.
    - Provided via an environment variable.
    - Provided via a file.
      :::warning
      When the token comes from a **file**, that file must be **inside** the secrets directory Semaphore uses. Configure that directory using either the `SEMAPHORE_SECRETS_PATH` environment variable or `dirs.secrets_path` in the Semaphore config. If neither is set, the default is `/tmp/semaphore`. See [Configuration](/admin-guide/configuration) for the full list of options.
      :::

The storage can work in read-only mode.

## How to use

1. In your project, open **Key Store** → **Storages** and create a new **OpenBao** storage (URL, mount path, and token).
2. When creating or editing a key in the Key Store, select your OpenBao storage as the storage type.
3. Provide the secret path in OpenBao where the credential should be stored.

## Syncing secrets

Secrets stored in OpenBao can be automatically imported into the Key Store and kept in sync, the same way as with other external storages. See [Syncing secrets from remote storages](/user-guide/key-store/secret-sync).

## Variable Groups

OpenBao can also be used as a storage for [Variable Groups](/user-guide/environment). When editing a variable group, select your OpenBao storage as the storage type and specify the path of the folder where secrets will be stored.
