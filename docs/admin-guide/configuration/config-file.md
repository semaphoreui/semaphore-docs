---
title: Configuration file
description: Generating config.json, an annotated example, passing it to the server and runner, and the secrets directory and git options.
---


# Configuration file

## Creating configuration file {#creating-configuration-file}

Semaphore uses a `config.json` file for its core configuration. You can generate this file interactively using built-in tools or through a web-based configurator.

### Generate via CLI {#generate-via-cli}

Use the following commands to generate the configuration file interactively:

* For the Semaphore server:
  ```
  semaphore setup
  ```
* For the Semaphore runner:
  ```
  semaphore runner setup
  ```
  
  :::tip
    For more details about runner configuration, see the <a href="./../runners">Runners</a> section.
  :::

### Generate on the website {#generate-on-the-website}

Alternatively, you can use the web-based interactive configurator:
* [Server configurator](https://semaphoreui.com/install/binary/2_13/config)
* [Runner configurator](https://semaphoreui.com/install/binary/2_13/runner)

## Configuration file example {#configuration-file-example}

Semaphore uses a `config.json` configuration file with following content:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Configuration file usage {#configuration-file-usage}

* For Semaphore server:

```bash
semaphore server --config ./config.json
```

* For Semaphore runner:

```bash
semaphore runner start --config ./config.json
```

## Secrets directory {#secrets-directory}

Semaphore reads secret files (for example [file-based Key Store entries](/user-guide/key-store/env-and-file-sources) or HashiCorp Vault and OpenBao tokens read from disk) only from a configurable directory.

| Option | Environment variable | Description |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Directory for secret files. Default: `/tmp/semaphore`. |
| `secrets_path` (legacy) | `SEMAPHORE_SECRETS_PATH` | Top-level setting kept for backward compatibility. Used only when `dirs.secrets` is unset or still at the default path. |

**Precedence**: a non-default `dirs.secrets` wins over the legacy `secrets_path`. When you set `SEMAPHORE_SECRETS_PATH`, Semaphore applies it to both fields.

Example using the current layout:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Legacy installations may still use:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

Key files selected in the **File** tab of the Key Store form, and token files referenced by external secret storages, must live inside this directory. Paths outside it are rejected with `file path must be inside secrets path`. See [Keys from environment variables and files](/user-guide/key-store/env-and-file-sources).

## Git operations {#git-operations}

Semaphore clones and updates task repositories before each run. Two options control this behavior:

| Option | Environment variable | Description |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Git client implementation: `cmd_git` (default, uses the system `git` binary) or `go_git` (pure Go client). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Number of times clone and pull operations are tried before the task fails. Default: `4`. Set to `1` to try once with no retries. |

When a clone or pull fails and retries remain, Semaphore waits with exponential backoff (starting at 1 second, doubling each attempt, capped at 60 seconds) and logs a message such as `Git pull failed (...), retrying in 2s`. Retries apply only to network operations; a failed checkout or authentication error still fails the task after all attempts are exhausted.

If your git server is intermittently unavailable, increase `git_attempts`. If failures are immediate and persistent (wrong credentials, missing repository), fix the underlying issue — retries will not help.

