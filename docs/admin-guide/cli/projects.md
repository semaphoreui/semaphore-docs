# Projects

The `semaphore projects` command exports and imports projects as backup files. A
backup is a single JSON document that contains a project's templates,
inventories, repositories, environments, keys, schedules, and related settings.

```bash
semaphore projects --help
```

> `project` is an alias for `projects`.

It has two subcommands:

| Command | Purpose |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | Write a project's backup to a file (or stdout). |
| [`projects import`](#importing-projects-projects-import) | Restore one or more projects from backup files. |

## Exporting a project (`projects export`)

Exports a single project, identified by either its numeric ID or its name.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| Flag | Description |
|------|-------------|
| `--project-id <id>` | ID of the project to export. |
| `--project-name <name>` | Name of the project to export (case-insensitive match). |
| `--file <path>` | Write the backup to this file. If omitted, the backup is printed to stdout. |

Exactly one of `--project-id` or `--project-name` is required — supplying both,
or neither, is an error.

## Importing projects (`projects import`)

Imports one or more project backups. You can import a single file or every
backup found in a directory. Each imported project is created as a **new**
project owned by an existing admin (the first admin in the database, or the
first user if no admin exists), so importing never overwrites an existing
project.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| Flag | Description |
|------|-------------|
| `--file <path>` | Path to a single backup file to import. |
| `--dir <path>` | Directory to scan for backup files. Files ending in `.json`, `.backup`, or `.bk` are imported, in sorted order. |
| `--project-name <name>` | Override the imported project's name. Only valid with `--file`. |

Exactly one of `--file` or `--dir` is required — supplying both, or neither, is
an error. `--project-name` may only be combined with `--file`.

When importing a directory, files that fail to import are reported and skipped;
the command continues with the rest and exits with a non-zero status only if
nothing was imported.
