---
title: Runners
description: How runners work, registering and configuring them, running one in Docker, the poll interval, and token security.
---

# Runners

Runners enable running tasks on a separate server from Semaphore UI.

Semaphore runners operate on the same principle as GitLab or GitHub Actions runners:

- You launch a runner on a separate server, specifying the Semaphore server's address and an authentication token.
- The runner connects to Semaphore and signals its readiness to accept tasks.
- When a new task appears, Semaphore provides all the necessary information to the runner, which, in turn, clones the repository and runs Ansible, Terraform, PowerShell, etc.
- The runner sends the task execution results back to Semaphore.

For end users, working with Semaphore with or without runners appears the same.

When no runners are defined, the Semaphore UI server itself acts as a runner. All tasks execute within the context of the Semaphore UI server, having access to the file system.

Using runners offers the following advantages:
- Executing tasks more securely. For instance, a runner can be located within a closed subnet or isolated docker container.
- Distributing the workload across multiple servers. You can start multiple runners, and tasks will be randomly distributed among them.

## Set up {#set-up}

### Set up a server {#set-up-a-server}

To set up the server for working with runners you should add following option to your Semaphore server configuration:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

or with using environment variables:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Setup a runner {#setup-a-runner}

To set up the runner, use the following command:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

This command will create a configuration file at `/path/to/your/config/file.json`.

But before using this command, you need to understand how runners are registered on the server.

### Registering the runner on the server {#registering-the-runner-on-the-server}

There are two ways to register a runner on the Semaphore server:
1) Add it via the web interface or API.
2) Use the command line with the `semaphore runner register` command.

#### Adding the runner via the web UI {#adding-the-runner-via-the-web-ui}

![Runner Image](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Registering via CLI {#registering-via-cli}

To register a runner this way, you need to add the `runner_registration_token` option to your Semaphore server's configuration file. This option should be set to an arbitrary string. Choose a sufficiently complex string to avoid security issues.

When the `semaphore runner setup` command asks if you have a Runner token, answer No. Then use the following command to register the runner:

`semaphore runner register --config /path/to/your/config/file.json`

or

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Configuration file {#configuration-file}

As a result of running the `semaphore runner setup` command, a configuration file like the following will be created:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

You can manually edit this file without needing to call `semaphore runner setup` again.

To re-register the runner, you can use the `semaphore runner register` command. This will overwrite the token in the file specified in the configuration.

## Running the runner {#running-the-runner}

Now you can start the runner with the command:

```
semaphore runner start --config /path/to/your/config/file.json
```

Your runner is ready to execute tasks.

### Running the runner in Docker {#running-the-runner-in-docker}

The `semaphoreui/runner` image starts the runner automatically. Pass the server URL and registration token through environment variables:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

If your playbooks need extra Python packages, mount a `requirements.txt` at `/etc/semaphore/requirements.txt`. The container installs it with `pip3` on every start, before the runner connects to the server:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

See [Installing Additional Python Dependencies](/admin-guide/installation/docker#installing-additional-python-dependencies) for details on where packages are installed and how failures are handled.

### Poll interval (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Each runner polls the Semaphore server on a fixed interval for new jobs and to
report task progress. Configure it in the runner configuration file:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

Or with an environment variable:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Value | Effect |
|-------|--------|
| **1** (default) | Jobs are picked up within about one second; best for low-latency runs. |
| **Higher** (e.g. 5–30) | Reduces HTTP traffic when you operate many runners against one server. Jobs may start slightly later. |

The Runners page in the Semaphore UI exposes this under **Advanced options** when
generating setup snippets (config file, Docker, and environment-variable examples).

Invalid or zero values fall back to the default of 1 second.

### Runner tags (Pro) {#runner-tags-pro}

You can assign one or more tags to a project runner. Templates can then require a tag so tasks run only on matching runners. Configure tags when adding a runner in the project UI, and set the required tag in the template settings.

## Runner deregistration {#runner-deregistration}

You can remove a runner using the web interface.

![Runner Image](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

Or unregister runner via CLI:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Security {#security}

Runners authenticate to the server with an opaque bearer token
(`X-Runner-Token`), issued at registration. Protect this token like any other
credential — store it in a restricted configuration file or secret manager.

:::warning
Use HTTPS for communication between the server and the runner, especially when
they are not on the same private network. For self-signed or internal CA
certificates, configure `runner.connection.server_ca_cert_file` on the runner.
Do not use `runner.connection.skip_tls_verify` in production.
:::
