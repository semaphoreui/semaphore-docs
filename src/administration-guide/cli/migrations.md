<div class="breadcrumbs">
    <a href="/administration-guide/runners">CLI</a>
    → Database migrations
</div>

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

## Troubleshooting

- Always back up your database before applying or rolling back migrations.
- If you encounter errors, check the logs for details and ensure your CLI version matches your Semaphore server version.
