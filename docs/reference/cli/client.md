---
title: Client
description: Managing a Semaphore server from the terminal and from scripts with semaphore client - login and contexts, configuration precedence, output formats, exit codes, and running tasks from CI.
---

# Client

`semaphore client` drives a running Semaphore server over its REST API. It needs
only a server URL and an API token — no database access and no server
configuration file — so it works from a laptop, a CI job, or a host that has
never seen the server's `config.json`.

```bash
semaphore client --help
```

Commands follow the form `semaphore client <resource> <action> [id|name]`.
Resources are named in the singular, with the plural as an alias
(`template list` and `templates list` are the same). Every resource has `list`,
`get`, `create`, `update` and `delete`; tasks add `run`, `logs`, `wait`, `stop`
and the like. The exhaustive, generated list of every command and flag is in the
[Command reference](/reference/cli/commands#semaphore-client).

| Group | Purpose |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Log in, check the token, print it, log out. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Keep several servers in one configuration file and switch between them. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Projects, their members, backups and restores. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Task templates, and `template run` to start a task. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Logs, waiting, stopping, confirming and rerunning tasks. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | The other resources of a project. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Server-wide resources (administrators only). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Server version and settings. |

## First login {#first-login}

Interactive: the client asks for the login, the password and, when TOTP is
enabled, the code, then creates an API token and saves it. The password is used
once and never stored.

```bash
semaphore client auth login --url https://semaphore.example.com
```

With an existing token (also the way to log in to a server that only offers
single sign-on — create the token on the **Tokens** page of your profile):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Both forms save a *context* called `default` in `~/.semaphore/client.yml`:
that is the one every command uses when nothing else is said. Pass
`--context <name>` to keep a second server under its own name, and the same
`--context <name>` (or `SEMAPHORE_CLIENT_CONTEXT`) to work with it. Nothing in
the file marks a context as "current", so logging in to one server can never
re-point another. Check what is in use with `semaphore client auth status`.

## Configuration {#configuration}

Every setting can come from a flag, an environment variable or the context in
use, in that order of precedence: **flag > environment > context > default**.

| Flag | Environment variable | Meaning |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | Server URL, for example `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Name of the context to use instead of `default`. |
| — | `SEMAPHORE_CLIENT_TOKEN` | API token. There is deliberately no `--token` flag: process arguments are visible in `ps` and in shell history. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | File holding the token (a trailing newline is ignored). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | Project id or name for project-scoped commands. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (default), `json` or `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Timeout of one HTTP request, default `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | PEM file with the CA that signed the server certificate. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | Skip TLS verification. Every call prints a warning; prefer `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | Never prompt; a command that would need an answer fails instead. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | Trace HTTP requests to stderr. Authorization and cookie headers are masked. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Path of the configuration file, default `~/.semaphore/client.yml`. |

A token from the environment is used only when the URL also comes from the
environment or from a flag. This keeps a CI token from being sent to another
server when someone runs the same job with `--context other`.

### The configuration file {#the-configuration-file}

`~/.semaphore/client.yml` holds named contexts. `auth login` and `context set`
write it; you can also edit it by hand.

```yaml
contexts:
  default:
    url: https://semaphore.example.com
    token: 8s3k...            # or token_file
    project: 3                # default project, id or name
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

The client creates the directory with mode `0700` and the file with `0600`. A
file that is writable by the group or by others is refused with a hint to run
`chmod 600`; a file readable by others produces a warning.

## Output {#output}

Data goes to stdout; messages, warnings and progress go to stderr, so a script
can capture one without the other.

| Flag | Effect |
|------|--------|
| `-o json` | Valid JSON without decoration. A list is always an array, an empty list is `[]`. Field names are those of the API. |
| `-o yaml` | The same data as YAML. |
| `--fields id,name,status` | Only these columns or fields. Nested fields use a dot: `--fields id,params.limit`. |
| `-q`, `--quiet` | Only ids, one per line — for `xargs` and loops. |
| `--no-headers` | Table without the header line. |
| `--no-color` | No colours. Colours are also off when stdout is not a terminal or `NO_COLOR` is set. |

When stdout is not a terminal, table columns are separated by a tab and never
truncated.

Objects are addressed by numeric id or by name. A name is looked up in the
project, case-insensitively; when several objects share it the command exits
with code 5 and lists the candidates on stderr.

## Exit codes {#exit-codes}

| Code | Meaning |
|------|---------|
| `0` | Success. For a waiting command: the task finished with `success`. |
| `1` | Client or API error — network failure, server error, unexpected answer. |
| `2` | Usage error: unknown flag, missing argument, no project given, or a confirmation needed without a terminal (pass `--yes`). |
| `3` | The awaited task finished with status `error`. |
| `4` | Authentication failed (HTTP 401 or 403). |
| `5` | Object not found, or a name that matches several objects. |
| `6` | The awaited task finished with status `stopped`. |
| `124` | `--wait-timeout` elapsed. The task keeps running on the server. |
| `130` | Interrupted with Ctrl+C. The client disconnects; the task keeps running unless `--stop-on-interrupt` was given. |

## Running tasks from scripts {#running-tasks-from-scripts}

Configure a CI job entirely through the environment and let the exit code
decide the outcome:

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Start a task, stream its log, exit 0/3/6 by its final status
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Start now, wait later
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` and `--extra-vars-file` fill the task's extra variables;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` and `--diff` override
what the template allows to override.

A task can stop halfway and wait for approval: a Terraform plan before it is
applied, or any template whose app asks first. In a terminal the client prints
`Apply task <id>? [yes/no]` and sends the answer to the server. Without a
terminal it reports the stop on stderr and keeps waiting, so a CI job needs
`task confirm <id>` or `task reject <id>` from elsewhere, `--auto-approve` when
the template allows it, or `--wait-timeout` to give up. For a pipeline that
should never stop on a gate, `--auto-reject` turns such a task down as soon as
it asks. A rejected task ends as `error`, which means exit code 3.

Combine `-o json` with `jq` for anything the table does not show:

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Secrets and tokens {#secrets-and-tokens}

- The token is never printed, except by `auth token`, which exists to hand it to
  another tool and warns when stdout is a terminal.
- Passwords and key material are read from files or stdin only:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. Environment secrets go through
  `environment create --secrets-file`.
- `environment get` and `key get` show the names of secrets, never the values,
  in every output format.
- `auth logout --revoke` deletes the token on the server as well as locally.
- Destructive commands ask for confirmation in a terminal and require `--yes`
  without one; `project delete` requires the project name with `--confirm`.
