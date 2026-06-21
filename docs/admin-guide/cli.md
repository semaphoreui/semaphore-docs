# CLI

The `semaphore` binary is both the server and a full administration tool. Run it
with no arguments (or `semaphore help`) to list every command:

```bash
semaphore help
```

Most administrative tasks have a dedicated command group:

| Command group | Purpose |
|---------------|---------|
| [`semaphore users`](/admin-guide/cli/users) | Add, change, remove, and inspect users; manage API tokens and TOTP (2FA). |
| [`semaphore projects`](/admin-guide/cli/projects) | Export and import projects (backups). |
| [`semaphore vaults`](/admin-guide/cli/vaults) | Re-encrypt stored secrets and inspect encryption key usage. |
| [`semaphore runner`](/admin-guide/cli/runners) | Run in runner mode and register/unregister runners. |
| [`semaphore migrate`](/admin-guide/cli/migrations) | Apply or roll back database migrations. |

Several command groups have shorter aliases: `users`/`user`, `projects`/`project`,
`vaults`/`vault`, and `server`/`service`.

## Global options

These flags are accepted by every command:

| Option | Description |
|--------|-------------|
| `--config <path>` | Path to the configuration file. |
| `--no-config` | Don't read any configuration file — use environment variables only. |
| `--log-level <level>` | Log verbosity: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, or `PANIC`. Falls back to the `SEMAPHORE_LOG_LEVEL` environment variable. |
| `--debug-filter <spec>` | Narrows `DEBUG` output to specific namespaces, e.g. `'runner,task_*'` or `'*,-db'`. Only takes effect when the log level is `DEBUG`. Falls back to `SEMAPHORE_DEBUG_FILTER`. |

## Version

Print the current version.

```bash
semaphore version
```

## Interactive setup

Use this for first-time configuration. It generates secrets, walks through an
interactive questionnaire, writes a `config.json`, runs the database migrations,
and creates the first admin user.

```bash
semaphore setup
```

On completion it prints the commands to start the server, for example:

```bash
./semaphore server --config /path/to/config.json
```

## Server mode

Start the Semaphore server (web UI and API). `service` is an alias of `server`.

```bash
semaphore server --config /path/to/config.json
```

## Runner mode

Run Semaphore as a task runner. See [Runners](/admin-guide/cli/runners) for the
full set of subcommands (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/config.json
```

## Database migration

Bring the database schema up to date. See
[Database Migrations](/admin-guide/cli/migrations) for applying or rolling back
to a specific version.

```bash
semaphore migrate --config /path/to/config.json
```
