---
title: Docker executor
description: Run every task of a runner in a fresh Docker container on a local or remote daemon, with configuration examples, security notes and troubleshooting.
sidebar_custom_props:
  edition: pro
---

# Docker executor <FeatureState feature="docker-executor" />

With the Docker executor a runner starts each task in a new container and removes it
when the task ends. The runner talks to a Docker daemon through its API: the daemon can
be on the same host, or remote over TLS.

How a container task runs, what is inside the container and what is not supported is
described in [Executors](./#how-a-container-task-runs). This page covers the Docker setup.

## Before you begin {#before-you-begin}

- A Semaphore server with a Pro or Enterprise license.
- A runner registered on the server, see [Runners](/admin-guide/runners). Use the
  `semaphoreui/runner` image or the official `semaphore` binary.
- Docker Engine reachable from the runner, and permission to use it: membership in the
  `docker` group, access to the mounted socket, or TLS client certificates.
- The daemon can pull `semaphoreui/job` and `semaphoreui/helper` (or your own images).

## Quick start {#quick-start}

Add the executor to the runner configuration and restart the runner:

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

With no other options the runner uses the local socket (`DOCKER_HOST` if set,
otherwise `unix:///var/run/docker.sock`), the `semaphoreui/job:latest` build image and
the `bridge` network.

Run any task routed to this runner. The task log starts with:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

While the task runs you can see its containers:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Examples {#examples}

### Runner binary on a Docker host {#runner-binary-on-a-docker-host}

The runner runs as a systemd service on the same host as Docker. Give its user access
to the socket:

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### Runner in a container with the host socket {#runner-in-a-container-with-the-host-socket}

The runner container controls the host daemon through the mounted socket; task
containers are siblings of the runner, not nested in it. The runner image runs as UID
`1001`, so add it to the group that owns the socket:

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

The `semaphore-runner-data` volume keeps the runner token issued at registration, so
the runner does not register again after a restart.

The same with Docker Compose:

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

Secrets reach the task through a named volume on the daemon, never through the runner's
file system, so no other paths have to be shared between the runner and the host.

### Remote Docker daemon over TLS {#remote-docker-daemon-over-tls}

The runner and the daemon are on different machines. Protect the daemon port with
mutual TLS (see [Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
and put the client files on the runner:

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

When `cert_path` is set, the runner checks the daemon certificate against `ca.pem` and
authenticates with `cert.pem` and `key.pem`. The file names are fixed.

:::warning
Without `cert_path` a `tcp://` connection is plain HTTP, and anyone who reaches the port
controls the daemon. `tls_verify` alone does not enable TLS (⚠️ 2026-11-05: the option is
read but not applied); always set `cert_path` for a remote daemon.
:::

### A network for internal services {#a-network-for-internal-services}

By default task containers join `bridge`. To let tasks reach services by container
name, or to isolate them in their own network, create a network and set it:

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` accepts any network mode Docker understands: a network name, `bridge`,
`host` or `none`. The clone container joins the same network, so with `none` the
repository cannot be cloned.

### Images from a private registry {#images-from-a-private-registry}

The executor pulls images without registry credentials. For a private image, log in
and pull it on the daemon host, and keep a pull policy that does not pull again:

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

Use a version tag rather than `latest` with `if-not-present`: a tag that is already on
the daemon is never refreshed. `never` makes a missing image fail the task instead of
attempting a pull.

### The whole block as one variable {#the-whole-block-as-one-variable}

For deployments configured only through the environment, pass the executor block as
JSON:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Configuration reference {#configuration-reference}

All options live under `runner.executor.docker` in the runner configuration.

| Option | Environment variable | Default | Description |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, then the platform socket | Daemon address: `unix:///path`, `tcp://host:port` or `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Directory with `ca.pem`, `cert.pem` and `key.pem` for mutual TLS. Setting it turns TLS on. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Not applied yet; use `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Build image. A template's **Executor image** overrides it. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image for the clone container and for filling the secrets volume. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Network of the clone and build containers. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` or `never`. An unknown value falls back to `if-not-present`. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | no limit | CPUs per container, like `docker run --cpus`. Fractions allowed: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | no limit | Memory per container: bytes, or with `k`, `m`, `g` (`512m`, `2g`). An unparseable value means no limit. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Runs the containers with `--privileged`. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Seconds `docker stop` waits after **Stop** before it kills the container. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | Not used: the executor waits for the container to exit instead of polling it. |

The limits, network and `privileged` apply to the clone and the build container alike.

## Stop and clean up {#stop-and-clean-up}

**Stop** in the UI sends `docker stop` to the running container, waits up to
`cleanup_grace_seconds`, and then removes the containers and both volumes.

If the runner process is killed during a task, its containers and volumes stay on the
daemon; the runner does not collect them on the next start. Everything the executor
creates carries the `com.semaphoreui.runner=semaphore` label, and
`com.semaphoreui.task-id` holds the task ID. Remove leftovers when no task is running
on this daemon:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Troubleshooting {#troubleshooting}

| Message | Cause and fix |
|---|---|
| `docker executor is only available in the proprietary build` (runner log) | The runner is a Community build. Use `semaphoreui/runner` or the official binary. |
| `docker executor: daemon not reachable` | Wrong `host`, the daemon is down, or the runner user cannot open the socket (`permission denied`). Check with `docker -H <host> info` as the runner user; add the user to the socket group. |
| `pull image ...: ... unauthorized` or `not found` | The image is private or misspelled. Pull it on the daemon host first, see [private registry](#images-from-a-private-registry). |
| `git clone exited with status 128` | The repository URL, branch or SSH key is wrong, or the network blocks the Git host. The clone output above the line shows the Git error. |
| `interpreter python3 not found in image; set a runner image that provides it` | The build image lacks the app binary. Set an image that has it, on the runner or in the template's **Executor image**. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | The image has no OpenSSH client; Ansible cannot use the inventory key. Install `openssh-client`. |
| `Permission denied` under `/workspace` | A custom image runs as a user that cannot write `/workspace`. See [Build a custom image](./#build-a-custom-image). |
| `build container exited with status N` | The app failed with exit code `N`; the reason is in the log above. |
| `inventory login_password authentication is not supported` | See [Limitations](./#limitations). |

## Related pages {#related-pages}

- [Executors](/admin-guide/executors): how container tasks run, images, limitations.
- [Kubernetes executor](./kubernetes): the same model on a cluster.
- [Runners](/admin-guide/runners): registering and starting a runner.
- [Executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): a different image for one template.
