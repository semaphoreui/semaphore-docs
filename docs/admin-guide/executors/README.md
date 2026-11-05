---
title: Executors
description: How a runner executes tasks with the local, Docker, or Kubernetes executor, what runs inside the containers, and what the container executors do not support.
---

# Executors

An executor decides **where a runner starts the task process**. The runner still
polls the server, receives the task and sends the log back; only the place the
Ansible, Terraform or shell process runs changes.

| Executor | `runner.executor.type` | Where a task runs | Edition |
|---|---|---|---|
| Local | `local` (default) | A child process on the runner host, with the runner's files, tools and `PATH`. | Community |
| Docker | `docker` | A new container on a Docker daemon, removed after the task. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | A new Pod in a Kubernetes namespace, deleted after the task. | <FeatureState feature="k8s-executor" /> |

The executor is a setting of the **runner**, not of the server or the template. The
Semaphore server itself always runs tasks locally; to run tasks in containers, start a
[runner](/admin-guide/runners) and route the templates to it with a runner tag.

## Choose an executor {#choose-an-executor}

| You need | Use |
|---|---|
| Tools installed on one machine, access to its files, workflow outputs | Local |
| A clean environment for every task, different toolchains per template, on one or a few hosts | [Docker](./docker) |
| Tasks scheduled across a cluster, Kubernetes RBAC and Secrets, no Docker socket | [Kubernetes](./kubernetes) |

## Set the executor {#set-the-executor}

Add the `executor` block to the `runner` section of the runner configuration file:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

Or set the environment variable:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

Every option has an environment variable; the full lists are on the
[Docker](./docker#configuration-reference) and [Kubernetes](./kubernetes#configuration-reference)
pages. Restart the runner after changing the executor.

:::info
The container executors are part of the Pro build of the runner. Use the
`semaphoreui/runner` image or the official `semaphore` binary. The
`semaphoreui/runner-community` image is built without them and logs
`docker executor is only available in the proprietary build` at startup.
:::

## How a container task runs {#how-a-container-task-runs}

Both container executors run a task the same way:

1. **Prepare.** The runner creates a shared workspace and puts the task's secrets
   (SSH keys, vault passwords, extra variables, a static inventory) where the
   containers can read them.
2. **Clone.** A short-lived *helper* container clones the repository into
   `/workspace/repo` (`git clone --depth 1` of the task's branch).
3. **Build.** The *build* container starts in `/workspace/repo` and runs the app:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell`, or the binary of a custom app. Its exit code is the task result.
4. **Log.** The output of both containers is streamed into the task log while they run.
5. **Clean up.** Containers, volumes, Secrets and ConfigMaps of the task are removed,
   whether the task succeeded, failed or was stopped.

| Step | Docker | Kubernetes |
|---|---|---|
| Workspace | Named volume `semaphore-workspace-<task>-<random>` | `emptyDir` volume of the Pod |
| Secrets | Named volume `semaphore-secrets-<task>-<random>`, mounted read-only | One Secret or ConfigMap per kind, mounted read-only |
| Clone | Container `semaphore-job-<task>-<random>-clone` | Init container `git-clone` |
| Build | Container `semaphore-job-<task>-<random>-build` | Container `build` of Pod `semaphore-job-<task>-<random>` |
| Stop button | `docker stop` with `cleanup_grace_seconds`, then remove | Pod deleted with `cleanup_grace_seconds` |

A task stopped from the UI ends in the **Stopped** status, as with the local executor.

## Inside the build container {#inside-the-build-container}

| Path | Content |
|---|---|
| `/workspace` | Writable workspace; also `HOME` of the task. |
| `/workspace/repo` | The cloned repository; the working directory. |
| `/secrets/ssh/<key id>/id_rsa` | SSH private key of the repository or the inventory. Loaded into `ssh-agent` before the app starts. |
| `/secrets/vault/<name>` | Ansible vault password, passed as `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Variable Group extra variables plus `semaphore_vars`, passed as `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` or `inventory.yml` | A static inventory stored in Semaphore. File inventories are read from the repository. |

The container receives a fixed set of environment variables, listed in
[Task environment variables](/reference/task-environment#container-executors). The
runner's own `env_vars`, `forwarded_env_vars`, `PATH` and `apps.*` paths are **not**
passed into the container.

## Images {#images}

Two images take part in every task:

| Image | Default | Used for | Needs |
|---|---|---|---|
| Build image | `semaphoreui/job:latest` | Running the app. | `sh`, the app binary on `PATH`; for SSH keys `ssh-agent`, `ssh-add`, `setsid`. |
| Helper image | `semaphoreui/helper:latest` | Cloning the repository (Docker also uses it to fill the secrets volume). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` is Debian with Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu and Terragrunt. It runs as user `nobody`, group `0`.

The build image is set per runner (`image`) and can be overridden per template with
the **Executor image** field, see
[Executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
The helper image is set per runner only.

### Build a custom image {#build-a-custom-image}

Extend `semaphoreui/job` when your tasks need extra Ansible collections, Python
packages or tools. Container executors do **not** install `requirements.yml` from the
repository, so bake collections and roles into the image:

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

If you build an image from scratch, keep these properties of `semaphoreui/job`:

- `/workspace` exists and is writable by the user the container runs as.
- `/etc/passwd` is group-writable (`chmod g=u /etc/passwd`). A container started with a
  random UID (OpenShift) then gets a passwd entry, which OpenSSH and Git require.
- The image does not need a special entrypoint: the executor runs its script with `sh -c`.

## Limitations {#limitations}

Compared with the local executor, the container executors currently:

| Not supported | What to do instead |
|---|---|
| Inventory credentials of type **Login with password** (SSH password or become password) | Use an SSH key. A task with such a key fails with `inventory login_password authentication is not supported`. |
| Terraform tasks that wait for manual confirmation | Enable **Auto approve** in the template, or run plan-only tasks. Otherwise the task fails with `terraform manual approval is not supported`. |
| Repositories of type **Local** | The workspace stays empty; use a Git repository. |
| Installing `requirements.yml` (Galaxy roles and collections) | [Bake them into the image](#build-a-custom-image). |
| Workflow outputs (`SEMAPHORE_OUTPUTS_FILE`) | Use the local executor for tasks whose outputs a workflow reads. |
| Per-host credentials from host config | Use the local executor. |
| Git history beyond the last commit | The clone is shallow (`--depth 1`). |

SSH host keys are not checked: the clone accepts a new host key, and Ansible runs with
`ANSIBLE_HOST_KEY_CHECKING=False`.

## Related pages {#related-pages}

- [Docker executor](./docker): setup, configuration, security, troubleshooting.
- [Kubernetes executor](./kubernetes): RBAC, runner deployment, configuration, troubleshooting.
- [Runners](/admin-guide/runners): registering and starting a runner.
- [Configuration options](/reference/configuration): every `runner.executor.*` option.
