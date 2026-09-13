---
title: Runners
description: The semaphore runner setup, register, start, and unregister subcommands, their flags, and the runner configuration fields.
---

# Runners

The `semaphore runner` command runs Semaphore in **runner mode** and manages a
runner's registration with the server. A runner executes tasks on a separate
machine from the Semaphore server.

```bash
semaphore runner --help
```

:::tip
For how runners work and how to configure the server side, see the
[Runners](/admin-guide/runners) guide.
:::

Running `semaphore runner` with no subcommand just prints help. It has the
following subcommands:

| Command | Purpose |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | Interactively create a runner configuration file (and register if a token is provided). |
| [`runner register`](#registering-a-runner-runner-register) | Register the runner on the server using a registration token. |
| [`runner start`](#starting-a-runner-runner-start) | Run in runner mode and start accepting tasks. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Remove the runner's registration from the server. |

All subcommands accept the global `--config <path>` flag to point at the runner
configuration file (and `--no-config` to run from environment variables only).

## Interactive setup (`runner setup`) {#interactive-setup-runner-setup}

Walks through an interactive setup, writes a runner configuration file, and, if
a registration token is available (entered during the prompts or set via
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`), registers the runner with the server
immediately.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Pass `--config <path>` to choose where the configuration file is written.
Without it, setup asks for an output directory (default: the current
directory) and writes `config.runner.json` there.

On completion it prints the commands to launch the runner, for example:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

You can edit the generated configuration file by hand afterward instead of
re-running setup.

### Runner configuration options {#runner-configuration-options}

Fields in the `runner` block of the configuration file:

| Field | Env variable | Description |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Runner authentication token (issued at registration). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Registration token. Environment variable only; it is never written to the file. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Path to a file containing the registration token. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Runner name shown on the server. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | JSON array of tags for project runner routing. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL the server calls when a task is queued for this runner. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Whether the runner accepts tasks. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | Project ID for a project-level runner. Omit for a global runner. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Poll interval in seconds. Default: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Maximum concurrent tasks. Default: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Exit after processing one job. Useful for runners started on demand by a webhook. |

See [Runners](/admin-guide/runners) for setup details and
[Configuration](/admin-guide/configuration) for the full option list.

## Registering a runner (`runner register`) {#registering-a-runner-runner-register}

Registers the runner on the server and stores the issued runner token in the
configuration file (overwriting any existing token). The server must have a
`runner_registration_token` configured; you pass that same token here.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Flag | Description |
|------|-------------|
| `--registration-token-file <path>` | Read the registration token from a file. |
| `--stdin-registration-token` | Read the registration token from stdin. |
| `--name <name>` | Runner name to register with. |
| `--tags <tags>` | Runner tags, comma-separated or by repeating the flag (e.g. `--tags a,b` or `--tags a --tags b`). |
| `--webhook <url>` | Runner webhook URL. |
| `--enabled` | Enable or disable the runner on the server. Defaults to `true`; pass `--enabled=false` to register a disabled runner. |
| `--project-id <id>` | Register as a project-level runner for the given project. If omitted (or `0`), the runner is registered as a global runner. |

Only the flags you actually pass are applied; `--name`, `--webhook`, `--tags`,
and `--enabled` overwrite the corresponding values from the configuration file
and environment only when set on the command line.

### Where the registration token comes from {#where-the-registration-token-comes-from}

When registering, Semaphore resolves the registration token from the first
available source, in this order:

1. The `--registration-token-file` flag.
2. The `registration_token_file` setting in the configuration file (or
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. Standard input, when `--stdin-registration-token` is passed.
4. The `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` environment variable.

A token file that exists but is empty is an error. If no source provides a
token, registration is attempted without one and the server rejects it.

## Starting a runner (`runner start`) {#starting-a-runner-runner-start}

Starts the runner, connects to the server, and begins accepting tasks. This is
the command you run to keep a registered runner online.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Flag | Description |
|------|-------------|
| `--auto-register` | Register the runner before starting if it is not already registered (i.e. the configuration has no runner token). |
| `--register` | Alias of `--auto-register`. |

With `--auto-register`, if the configuration has no `token`, Semaphore reads the
registration token from `registration_token_file` (or
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) or from
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, then retries registration every 5
seconds until it succeeds, reloads the configuration, and starts. This is
convenient for runners that register themselves on first boot, for example in
containers.

`runner start` does not accept `--registration-token-file` or
`--stdin-registration-token`; those flags belong to `runner register` only.

## Unregistering a runner (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Removes the runner's registration from the server, using the runner token from
the configuration file.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
