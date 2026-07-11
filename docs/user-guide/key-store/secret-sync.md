# Syncing secrets from remote storages

Semaphore can connect to an external secret manager — such as **HashiCorp Vault**, **OpenBao**, **AWS Secrets Manager**, **Azure Key Vault**, or **Devolutions Server (DVLS)** — and automatically import secrets from it into the Key Store. Instead of copying credentials into Semaphore by hand and keeping them up to date, you point Semaphore at your remote storage and it maintains a local mirror for you.

**Sync paths** are the rules that tell Semaphore *which* secrets to import from a remote storage and *how* to name them once they arrive. A secret manager can hold thousands of secrets across many folders; sync paths let you select just the subtrees you care about and control the naming of the keys that get created.

## Key concepts

- **Remote storage** — a configured connection to an external secret manager, including its address and the credential Semaphore uses to read from it.
- **Sync** — the process of reading secrets from the remote storage and reconciling them with the keys stored in Semaphore.
- **Sync path** — a single import rule, made up of a *path*, a *prefix*, and a *separator*.

## How a sync path works

Each sync path has three fields:

- **Path** — the location in the remote storage to import from. This is the base folder, prefix, or subtree that Semaphore lists and reads. Everything found under it becomes a candidate for import.
- **Prefix** — a string added to the front of every generated key name. Use it to namespace imported secrets so they don't collide with keys from other paths or other storages (for example, `prod-`).
- **Separator** — the character used to join the pieces of a secret's remote location into a single key name. Because a remote secret may live several folders deep, the separator determines how that hierarchy is flattened into one readable name.

When a sync runs, Semaphore walks the **path**, and for each secret it finds it builds a key name by combining the secret's location with the **separator** and prepending the **prefix**. The type of key created (SSH key, login/password, or a plain secret string) is inferred automatically from the shape of the remote secret.

You can define **multiple sync paths** on a single storage. Each path is imported independently, so you can pull from several unrelated areas of the same secret manager and give each its own prefix and naming style.

:::tip
Sensible defaults are applied per provider — for example, HashiCorp Vault, OpenBao, and AWS Secrets Manager default to `/` as the separator, Azure Key Vault to `-`, and Devolutions Server to `\` — so in most cases you only need to fill in the path.
:::

## Running a sync

There are two ways a sync happens:

1. **Manually.** Open the storage and use the **Sync now** action. Semaphore immediately reconciles that storage against its configured sync paths. This is useful for a first import or to pull in a change right away.
2. **Automatically, on a schedule.** Enable **Sync keys** for the storage and set a **sync interval** in minutes. Semaphore then re-runs the sync on that cadence in the background. An interval of `0` disables automatic syncing, leaving only the manual option.

Each storage records when it was last synced and whether the last attempt failed, so you can always see the state of the mirror.

:::note
In a high-availability deployment, automatic syncs are coordinated across nodes, so a given sync runs on only one node at a time — you won't get duplicate imports.
:::

## What syncing does to your keys

A sync is a **full mirror**, not a one-time copy. On every run, Semaphore reconciles the remote storage with the keys it previously imported:

- **New** secrets found under a sync path are created as keys.
- **Existing** imported keys are **updated** to match the current remote value.
- Keys that were previously imported but **no longer exist** in the remote storage are **removed**.

Only keys that Semaphore imported are touched — keys you created manually are never modified or deleted by a sync.

:::warning
Because imported keys are managed copies of the remote secrets, deleting a storage (or disabling its sync) also removes the keys that came from it.
:::

## Two scopes: shared keys and environment variables

Sync paths can be configured in two places:

- **Storage level** — imported secrets become **shared keys**, available across the project wherever keys are used.
- **Environment level** — a [Variable Group](/user-guide/environment) can point at a storage and its sync paths to import secrets as **environment variables** scoped to that group.

The mechanics are identical; only the destination of the imported secrets differs.

## Notes and limitations

- Syncing is supported only for **external** storage types (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault, Devolutions Server). The built-in **Database** storage holds secrets natively and has nothing to sync.
- The remote storage credential itself (the token or key Semaphore uses to authenticate) is stored securely and separately from the secrets it imports.
- If sync is turned off and no paths remain, the sync configuration for that storage is cleared.
