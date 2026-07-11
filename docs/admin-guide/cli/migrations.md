# Database Migrations

Database migrations allow you to update or roll back your Semaphore database schema to match the requirements of different Semaphore versions. This is essential for upgrades, downgrades, and maintaining compatibility.

## Getting Help

To see all available migration commands and options, run:

```
semaphore migrate --help
```

## Applying Migrations

### Apply All Pending Migrations

To apply all available migrations and bring your database up to date:

```
semaphore migrate
```

### Apply Migrations Up to a Specific Version

To migrate your database schema up to a specific version, use:

```
semaphore migrate --apply-to <version>
```

- `<version>`: The target migration version (e.g., `2.15` or `2.14.4`).

**Example:**
```
semaphore migrate --apply-to 2.15.1
```

## Rolling Back Migrations

To undo migrations and roll back your database schema to a previous version:

```
semaphore migrate --undo-to <version>
```

- `<version>` &mdash; The migration version you want to roll back to (e.g., `2.13` or `2.14.4`).

**Example:**
```
semaphore migrate --undo-to 2.13
```


## Migration from BoltDB to SQLite/MySQL/PostgreSQL
*Available in versions 2.17 and 2.18 only*

BoltDB was deprecated starting from version 2.16, and **support was removed in version 2.19** — the `--from-boltdb` flag and the `SEMAPHORE_MIGRATE_FROM_BOLTDB` environment variable no longer exist in 2.19+.

:::warning
If you still run on BoltDB, migrate **before** upgrading to 2.19 or later. Install Semaphore **2.17 or 2.18**, perform the migration below, and only then upgrade to a newer version.
:::

To migrate, first install Semaphore version 2.17 or 2.18, then configure the target database (SQLite, MySQL, or PostgreSQL) in your `config.json`. After that, run the following command to import all data from the old BoltDB file into the new database:

```
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

The command reads all projects, templates, inventories, repositories, keys, users, and task history from BoltDB and writes them into the database specified in the current Semaphore configuration. The original BoltDB file is not modified.

Additional arguments:
- `--err-log-size=N` &mdash; Maximum number of error lines displayed in the output.
- `--skip-task-output` &mdash; Do not import task outputs.
- `--merge-existing-users` &mdash; Reuse existing users matched by username instead of failing on conflict.


If you use Semaphore UI's Docker container, you can set the `SEMAPHORE_MIGRATE_FROM_BOLTDB` environment variable to automatically import the existing BoltDB database. The import runs only once, on the initial start of the container. Example:

```json
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


## Troubleshooting

- Always back up your database before applying or rolling back migrations.
- If you encounter errors, check the logs for details and ensure your CLI version matches your Semaphore server version.
