# CLI

The `semaphore` binary is both the server and a full administration tool. Run it
with no arguments (or `semaphore help`) to list every command:

```bash
semaphore help
```

## Main commands

| Command | Description | Usage |
|---------|-------------|-------|
| `semaphore server` | Run in server mode (web UI and API). `service` is an alias. | `semaphore server --config /path/to/config.json` |
| `semaphore setup` | Perform interactive setup: generates secrets, walks through a questionnaire, writes a `config.json`, runs database migrations, and creates the first admin user. On completion it prints the command to start the server. | `semaphore setup` |
| `semaphore version` | Print the version of Semaphore. | `semaphore version` |

## Management commands

Most administrative tasks have a dedicated command group with its own page:

| Command group | Description |
|---------------|-------------|
| [`semaphore users`](/admin-guide/cli/users) | Manage users: add, change, remove, and inspect users; manage API tokens (`token create`, `token list`) and TOTP (`totp enable`, `totp disable`, `totp show`). |
| [`semaphore projects`](/admin-guide/cli/projects) | Manage projects: `export` and `import` project backups. |
| [`semaphore vaults`](/admin-guide/cli/vaults) | Manage access keys and other secrets: `rekey` re-encrypts all stored secrets under the active encryption key; `check` reports which key id encrypts each stored secret. |
| [`semaphore runner`](/admin-guide/cli/runners) | Run in runner mode. Subcommands: `setup`, `register`, `start`, `unregister`. |
| [`semaphore migrate`](/admin-guide/cli/migrations) | Execute database migrations. Flags: `--apply-to`, `--undo-to`, `--err-log-size`, `--skip-task-output`, `--merge-existing-users`. |

Several command groups have shorter aliases: `users`/`user`, `projects`/`project`,
`vaults`/`vault`, and `server`/`service`.

## Global flags

These flags are accepted by every command:

| Flag | Description |
|------|-------------|
| `--config <path>` | Configuration file path. |
| `--no-config` | Don't use a configuration file — rely on environment variables only. |
| `--log-level <level>` | Log level: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, or `PANIC`. Falls back to the `SEMAPHORE_LOG_LEVEL` environment variable. |
| `--debug-filter <spec>` | Debug namespace filter (only with `DEBUG` level), e.g. `'runner,task_*'` or `'*,-db'`. Falls back to the `SEMAPHORE_DEBUG_FILTER` environment variable. |
