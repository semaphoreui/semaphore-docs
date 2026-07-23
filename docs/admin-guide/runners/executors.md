# Executors (Pro)

An **executor** is the strategy a [runner](/admin-guide/runners) uses to execute each task. By default a runner executes tasks as ordinary processes on the runner host. In **Semaphore Pro**, a runner can instead dispatch every task into an ephemeral Docker container or Kubernetes Pod — the same model used by GitLab Runner and GitHub Actions container jobs.

Semaphore provides the following executors:

| Executor | Where the task runs | Requires |
|----------|--------------------|----------|
| `local` (default) | A subprocess on the runner host | Ansible/Terraform/etc. installed on the host |
| [`docker`](/admin-guide/runners/docker-executor) (Pro) | An ephemeral container, one per task | Access to a Docker daemon |
| [`k8s`](/admin-guide/runners/k8s-executor) (Pro) | An ephemeral Pod, one per task | Access to a Kubernetes cluster |

## Selecting an executor

- Use **`local`** when the runner host already has the required tooling installed and you trust the tasks it runs. Tasks share the host environment and filesystem.
- Use **`docker`** when you want every task to start in a clean, isolated container with a pinned toolchain image, on a single machine. All dependencies come from the container image, so nothing needs to be installed on the host except Docker itself.
- Use **`k8s`** when the runner should offload work to a Kubernetes cluster: tasks are scheduled as Pods, so you get cluster-level scheduling, resource limits, and isolation, and the runner process itself stays lightweight (it can run inside or outside the cluster).

Key differences at a glance:

| | `local` | `docker` | `k8s` |
|---|---|---|---|
| Clean environment for every task | ✗ | ✓ | ✓ |
| Runner host filesystem protected from tasks | ✗ | ✓ | ✓ |
| Toolchain defined by a container image | ✗ | ✓ | ✓ |
| Tasks can run on other machines | ✗ | limited (remote daemon) | ✓ |
| Extra infrastructure required | none | Docker daemon | Kubernetes cluster |

## Configuration

The executor is configured per runner in the `runner.executor` section of the runner's configuration file:

```json
{
  "runner": {
    "token_file": "/path/to/token",
    "executor": {
      "type": "local"
    }
  }
}
```

`type` accepts `local` (default), `docker`, or `k8s`. Executor-specific options live in the `docker` and `k8s` subsections — see the dedicated pages:

- [Docker executor](/admin-guide/runners/docker-executor)
- [Kubernetes executor](/admin-guide/runners/k8s-executor)

The executor is chosen once at runner startup. To run tasks with different executors, register multiple runners with different configurations.

## What tasks can run in containers

Both container executors support the same task types as the local executor:

- **Ansible** — `ansible-playbook` runs inside the container against your inventory.
- **Terraform / OpenTofu / Terragrunt** — including the Semaphore-managed HTTP state backend.
- **Shell scripts** — Bash, Python, PowerShell, or a custom interpreter.

The container image must provide the required tool (`ansible-playbook`, `terraform`, `bash`, …). The default image `semaphoreui/job:latest` covers the common cases; set your own image if you need a specific toolchain.
