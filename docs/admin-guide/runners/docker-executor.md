# Docker executor (Pro)

:::info Pro feature
This feature is available in Semaphore UI Pro.
:::

The Docker executor runs every task in an ephemeral Docker container. One runner process drives many short-lived containers — one per task, plus a transient git-clone helper container — created against a local or remote Docker daemon.

Use the Docker executor to:

- Give every task a clean, reproducible build environment defined by a container image.
- Keep the runner host's filesystem and installed software isolated from task code.
- Avoid installing Ansible, Terraform, or other tooling on the runner host.

Prerequisites:

- A running Docker daemon reachable from the runner (local Unix socket by default).
- The runner user must have permission to use the daemon (e.g. membership in the `docker` group).

## How it works

For each task the executor performs the following steps:

1. **Prepare.** The runner verifies the daemon is reachable, computes the task's build plan, writes the task's secrets (SSH keys, Ansible vault passwords, extra variables, static inventory) into a private per-task directory on the runner host, and creates a named **workspace volume** shared by all of the task's containers.
2. **Clone.** A helper container (the `helper_image`) clones the repository into `/workspace/repo` on the workspace volume. Private repositories are cloned using the repository's SSH key via `ssh-agent`. This step is skipped for local-path repositories.
3. **Build.** The build container (the `image`) starts with the workspace volume mounted at `/workspace` and the secrets directory bind-mounted read-only at `/secrets`. It runs the task's command — `ansible-playbook`, the Terraform sequence, or your shell script — with the working directory set to `/workspace/repo`. Output streams live into the task log; the container's exit code decides task success or failure.
4. **Cleanup.** The containers, the workspace volume, and the host secrets directory are removed — also when the task fails or is stopped.

If the runner restarts mid-task, leftover containers and volumes are found and removed by labels the executor stamps on every resource it creates.

### Secrets

Secrets never appear in the container command line or image. They are materialized as files under `/secrets` inside the container:

| Path | Content |
|------|---------|
| `/secrets/ssh/<key-id>/id_rsa` | SSH private key (plus optional `passphrase` file) |
| `/secrets/vault/<name>` | Ansible vault password file |
| `/secrets/extra-vars/values.json` | Extra variables passed to Ansible via `--extra-vars @file` |
| `/secrets/inventory/…` | Static (database-stored) inventory file |

Environment-type secrets from Variable Groups are injected as container environment variables. The `/secrets` bind mount is read-only and the underlying host directory is readable only by the runner's user and group; it is deleted during cleanup.

Secret files currently require a **local** Docker daemon (Unix socket). Against a remote (`tcp://`) daemon, host bind-mounts are impossible, so tasks that need secret files fail with a clear error at prepare time.

## Configuration

Set the runner's executor type to `docker` and configure the `docker` subsection:

```json
{
  "runner": {
    "token_file": "/path/to/token",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "helper_image": "semaphoreui/helper:latest",
        "network": "bridge",
        "pull_policy": "if-not-present",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### Options

| Option | Env variable | Default | Description |
|--------|--------------|---------|-------------|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST` env or platform default socket | Docker daemon URL. Supports `unix://`, `tcp://`, and `npipe://` schemes. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Enable TLS certificate verification for `tcp://` connections. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Directory holding `ca.pem`, `cert.pem`, and `key.pem` for mutual TLS with a remote daemon. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Image for the build container. Must provide the tools your tasks need (`ansible-playbook`, `terraform`, `bash`, …). |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image for the transient git-clone container. Must provide `git` and `ssh`. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Docker network the containers join. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | How images are pulled: `always`, `if-not-present`, or `never`. See [pull policies](#pull-policies). |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | unlimited | CPU cap for the build container (equivalent of `docker run --cpus`). |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | unlimited | Memory cap for the build container, e.g. `"512m"`, `"2g"`. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | How often container status is polled. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Timeout passed to `docker stop` when a task is stopped or cleaned up. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Run the build container with `--privileged`. **Insecure** — see [privileged mode](#privileged-mode). |

### Remote Docker daemon

To use a daemon on another machine, set `host` to a `tcp://` URL and provide TLS material:

```json
{
  "docker": {
    "host": "tcp://docker-host.example.com:2376",
    "tls_verify": true,
    "cert_path": "/etc/semaphore/docker-certs"
  }
}
```

The standard `DOCKER_HOST`, `DOCKER_TLS_VERIFY`, and `DOCKER_CERT_PATH` environment variables are also honoured when `host` is not set. Note the secrets limitation described above: tasks that need secret files require a local daemon.

## Pull policies

- **`always`** — pull the image before every task. Guarantees up-to-date images; the right choice when the image tag is a moving target (like `latest`) and the runner is shared.
- **`if-not-present`** (default) — pull only when the image is missing locally. Faster and lighter on the network, but a cached image is never refreshed automatically — remove it manually (`docker rmi`) to force an update. On shared hosts, note that any task can use any locally cached image.
- **`never`** — never pull; only images already present on the daemon host can be used. Gives the operator full control over which images tasks run in.

An unknown `pull_policy` value falls back to the default rather than failing the runner.

## Privileged mode

`"privileged": true` passes `--privileged` to the build container, which disables Docker's container security mechanisms and gives task code root-equivalent access to the host. Use it only if a task genuinely requires it (e.g. Docker-in-Docker builds), on a dedicated, isolated runner host, and only for trusted templates. Leave it off otherwise.

## Choosing images

The default `semaphoreui/job:latest` image contains the toolchain for the common task types. To use your own image:

- The image must have `sh` available — the executor runs the task through `sh -c`.
- For shell tasks, the configured interpreter (`bash`, `python3`, `powershell`, or your custom app binary) must be on the image's `PATH`. If it is missing, the task fails with an explicit "interpreter not found in image" message.
- Ansible and Terraform tasks need `ansible-playbook` / `terraform` (or `tofu`, `terragrunt`) on `PATH`, plus `ssh` when connecting to inventory hosts over SSH.
