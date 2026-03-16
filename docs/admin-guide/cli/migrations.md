# Database Migrations

Database migrations allow you to update or roll back your Semaphore database schema to match the requirements of different Semaphore versions. This is essential for upgrades, downgrades, and maintaining compatibility.

## Getting Help

To see all available migration commands and options, run:

```
semaphore migrations --help
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

- `<version>`: The migration version you want to roll back to (e.g., `2.13` or `2.14.4`).

**Example:**
```
semaphore migrate --undo-to 2.13
```


## Migration from BoltDB to SQLite/MySQL/PostgreSQL

BoltDB was deprecated starting from version 2.16, and many new features introduced in 2.17 are no longer supported by BoltDB. BoltDB support will be fully removed in version 2.19.

To migrate your data from BoltDB to another database backend, use:

```
semaphore migrate --from-boltdb /path/to/boltdb/file
```

- `/path/to/boltdb/file` &mdash; Path to the existing BoltDB database file.

Additional arguments:
- `--err-log-size=N` &mdash; Maximum number of error lines displayed in the output.
- `--skip-task-output` &mdash; Do not import task outputs.
- `--merge-existing-users` &mdash; Reuse existing users matched by username instead of failing on conflict.


If you use Semaphore UI's Docker container, you can set the `SEMAPHORE_MIGRATE_FROM_BOLTDB` environment variable to automatically import the existing BoltDB database. The import runs only once, on the initial start of the container.

## Troubleshooting

- Always back up your database before applying or rolling back migrations.
- If you encounter errors, check the logs for details and ensure your CLI version matches your Semaphore server version.
