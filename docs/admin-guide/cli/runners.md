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
configuration file (and `--no-config` to run without one).

## Interactive setup (`runner setup`)

Walks through an interactive setup, writes a runner configuration file
(`config.runner.json` by default), and — if a registration token was provided
during the prompts — registers the runner with the server immediately.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

On completion it prints the commands to launch the runner, for example:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

You can edit the generated configuration file by hand afterward instead of
re-running setup.

## Registering a runner (`runner register`)

Registers the runner on the server and stores the issued runner token in the
configuration file (overwriting any existing token). The server must have a
`runner_registration_token` configured; you pass that same token here.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json
```

| Flag | Description |
|------|-------------|
| `--registration-token-file <path>` | Read the registration token from a file. |
| `--stdin-registration-token` | Read the registration token from stdin. |
| `--name <name>` | Runner name to register with. |
| `--tags <tags>` | Runner tags, comma-separated or by repeating the flag (e.g. `--tags a,b` or `--tags a --tags b`). |
| `--webhook <url>` | Runner webhook URL. |
| `--enabled` | Enable or disable the runner on the server. Defaults to `true`. |
| `--project-id <id>` | Register as a project-level runner for the given project. If omitted, the runner is registered as a global runner. |

Only the flags you actually pass are applied; `--name`, `--webhook`, `--tags`,
and `--enabled` overwrite the corresponding values in the configuration file
only when set on the command line.

### Where the registration token comes from

When registering, Semaphore resolves the registration token from the first
available source, in this order:

1. The `--registration-token-file` flag.
2. The `registration_token_file` setting in the configuration file.
3. Standard input, when `--stdin-registration-token` is passed.

If none of these provide a token, registration proceeds without one (which the
server will reject unless it requires no token). An empty token file is an
error.

## Starting a runner (`runner start`)

Starts the runner, connects to the server, and begins accepting tasks. This is
the command you run to keep a registered runner online.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Flag | Description |
|------|-------------|
| `--auto-register` | Register the runner before starting if it is not already registered (i.e. the configuration has no runner token). |
| `--register` | Alias of `--auto-register`. |

With `--auto-register`, if the configuration has no runner token, Semaphore
resolves a registration token (see
[Where the registration token comes from](#where-the-registration-token-comes-from)),
then retries registration every 5 seconds until it succeeds before starting.
This is convenient for runners that register themselves on first boot.

## Unregistering a runner (`runner unregister`)

Removes the runner's registration from the server.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
