---
title: CLI
description: Overview of the semaphore command groups, the global flags, the config file lookup order, and the setup, server, runner, and migrate commands.
---

# CLI

The `semaphore` binary is both the server and a full administration tool. Run it
with no arguments (or `semaphore help`) to list every command:

```bash
semaphore help
```

For the exhaustive, generated list of every command and flag, see the
[Command reference](/reference/cli/commands). Most administrative tasks have a
dedicated command group:

| Command group | Purpose |
|---------------|---------|
| [`semaphore users`](/reference/cli/users) | Add, change, remove, and inspect users; manage API tokens and TOTP (2FA). |
| [`semaphore projects`](/reference/cli/projects) | Export and import projects (backups). |
| [`semaphore vaults`](/reference/cli/vaults) | Re-encrypt stored secrets and inspect encryption key usage. |
| [`semaphore runner`](/reference/cli/runners) | Run in runner mode and register/unregister runners. |
| [`semaphore migrate`](/reference/cli/migrations) | Apply or roll back database migrations. |

Several command groups have shorter aliases: `users`/`user`, `projects`/`project`,
`vaults`/`vault`, and `server`/`service`.

:::info
Every command that touches the database (`users`, `projects`, `vaults`, `migrate`,
`server`) applies any pending schema migrations before it runs. Take a database
backup before running the CLI from a newer Semaphore version against an existing
database.
:::

## Global options {#global-options}

These flags are accepted by every command:

| Option | Description |
|--------|-------------|
| `--config <path>` | Path to the configuration file. |
| `--no-config` | Don't read any configuration file — use environment variables only. |
| `--log-level <level>` | Log verbosity: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, or `PANIC`. Falls back to the `SEMAPHORE_LOG_LEVEL` environment variable. |
| `--debug-filter <spec>` | Narrows `DEBUG` output to specific namespaces, e.g. `'runner,task_*'` or `'*,-db'`. Only takes effect when the log level is `DEBUG`. Falls back to `SEMAPHORE_DEBUG_FILTER`. |

### How the configuration file is found {#how-the-configuration-file-is-found}

When `--config` is omitted, Semaphore looks for the file in this order and uses
the first one that exists:

1. The path in the `SEMAPHORE_CONFIG_PATH` environment variable.
2. `config.json`, `config.yaml`, or `config.yml` in the current directory.
3. `/usr/local/etc/semaphore/config.json` (or `.yaml` / `.yml`).
4. `/etc/semaphore/config.json` (or `.yaml` / `.yml`).

Environment variables are applied on top of the file, so they override file
values. With `--no-config`, only environment variables and defaults are used. See
[Configuration](/admin-guide/configuration) for the full option list.

## Version {#version}

Print the current version.

```bash
semaphore version
```

## Interactive setup {#interactive-setup}

Use this for first-time configuration. It generates secrets, walks through an
interactive questionnaire, writes the configuration file, runs the database
migrations, and creates the first admin user.

```bash
semaphore setup
```

Pass `--config <path>` to choose where the configuration file is written.
Without it, setup asks for an output directory (default: the current
directory) and writes `config.json` there.

If the username or email you enter already exists, setup keeps the existing
user instead of creating a new one.

On completion it prints the commands to start the server, for example:

```bash
./semaphore server --config /path/to/config.json
```

## Server mode {#server-mode}

Start the Semaphore server (web UI and API). `service` is an alias of `server`.

```bash
semaphore server --config /path/to/config.json
```

The server applies pending database migrations on start and prints the
database, temporary path, interface, and port it is using.

## Runner mode {#runner-mode}

Run Semaphore as a task runner. See [Runners](/reference/cli/runners) for the
full set of subcommands (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/runner-config.json
```

## Database migration {#database-migration}

Bring the database schema up to date. See
[Database Migrations](/reference/cli/migrations) for applying or rolling back
to a specific version.

```bash
semaphore migrate --config /path/to/config.json
```
