---
title: Database Migrations
description: Applying and rolling back the database schema with semaphore migrate, its flags, and the removed BoltDB import.
---

# Database Migrations

The `semaphore migrate` command updates or rolls back the Semaphore database
schema to match a given Semaphore version. Use it for upgrades and downgrades.

```bash
semaphore migrate --help
```

:::info
You rarely need to run `migrate` by hand. `semaphore server`, `semaphore setup`,
and every other CLI command that touches the database apply pending migrations
automatically before they run. `migrate` is for applying migrations without
starting the server, or for rolling back.
:::

:::warning
Always back up your database before applying or rolling back migrations.
:::

## Applying migrations {#applying-migrations}

Apply all pending migrations and bring the database up to date:

```bash
semaphore migrate --config /path/to/config.json
```

Apply migrations only up to a specific version:

```bash
semaphore migrate --apply-to 2.15.1
```

## Rolling back migrations {#rolling-back-migrations}

Undo migrations down to a previous version:

```bash
semaphore migrate --undo-to 2.13
```

Use the Semaphore version you are downgrading to. The binary you run `migrate`
with must know about every migration being undone, so run it with the **newer**
binary before installing the older one.

## Options {#options}

| Flag | Description |
|------|-------------|
| `--apply-to <version>` | Apply migrations up to and including this version (e.g. `2.15` or `2.14.4`). |
| `--undo-to <version>` | Roll back migrations down to this version. |

`--apply-to` and `--undo-to` are mutually exclusive; passing both is an error.
Without either flag, all pending migrations are applied.

On completion the command prints the database connection it used.

:::note
`semaphore migrate` still accepts `--err-log-size`, `--skip-task-output`, and
`--merge-existing-users` for backward compatibility, but in 2.19 and later they
have no effect. They belonged to the BoltDB import described below.
:::

## Migration from BoltDB to SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*Available in versions 2.17 and 2.18 only*

BoltDB was deprecated starting from version 2.16, and **support was removed in
version 2.19**. The `--from-boltdb` flag and the `SEMAPHORE_MIGRATE_FROM_BOLTDB`
environment variable no longer exist in 2.19+, and `semaphore setup` refuses to
configure a BoltDB database.

:::warning
If you still run on BoltDB, migrate **before** upgrading to 2.19 or later.
Install Semaphore **2.17 or 2.18**, perform the migration below, and only then
upgrade to a newer version.
:::

To migrate, first install Semaphore version 2.17 or 2.18, then configure the
target database (SQLite, MySQL, or PostgreSQL) in your `config.json`. After
that, run the following command to import all data from the old BoltDB file
into the new database:

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

The command reads all projects, templates, inventories, repositories, keys,
users, and task history from BoltDB and writes them into the database specified
in the current Semaphore configuration. The original BoltDB file is not
modified.

Additional arguments (2.17 and 2.18 only):

| Flag | Description |
|------|-------------|
| `--err-log-size <n>` | Maximum number of error lines displayed in the output. |
| `--skip-task-output` | Do not import task outputs. |
| `--merge-existing-users` | Reuse existing users matched by username instead of failing on conflict. |

If you use the Semaphore UI Docker container, you can set the
`SEMAPHORE_MIGRATE_FROM_BOLTDB` environment variable to automatically import the
existing BoltDB database. The import runs only once, on the initial start of the
container. Example:

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## Troubleshooting {#troubleshooting}

- If a migration fails, check the logs for details and make sure the CLI binary
  is the same version as the Semaphore server.
- Make sure the CLI uses the same configuration file (and therefore the same
  database) as the server. See
  [How the configuration file is found](/reference/cli#how-the-configuration-file-is-found).
