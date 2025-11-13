# Runners

Runners enable running tasks on a separate server from Semaphore UI.

Semaphore runners operate on the same principle as GitLab or GitHub Actions runners:

- You launch a runner on a separate server, specifying the Semaphore server's address and an authentication token.
- The runner connects to Semaphore and signals its readiness to accept tasks.
- When a new task appears, Semaphore provides all the necessary information to the runner, which, in turn, clones the repository and runs Ansible, Terraform, PowerShell, etc.
- The runner sends the task execution results back to Semaphore.

For end users, working with Semaphore with or without runners appears the same.

Using runners offers the following advantages:
- Executing tasks more securely. For instance, a runner can be located within a closed subnet or isolated docker container.
- Distributing the workload across multiple servers. You can start multiple runners, and tasks will be randomly distributed among them.

## Set up

### Set up a server

To set up the server for working with running you should add following option to your Semaphore server configuration:

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

### Setup a runner

To set up the runner, use the following command:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

This command will create a configuration file at `/path/to/your/config/file.json`.

But before using this command, you need to understand how runners are registered on the server.

### Registering the runner on the server

There are two ways to register a runner on the Semaphore server:
1) Add it via the web interface or API.
2) Use the command line with the `semaphore runner register` command.

#### Adding the runner via the web UI

<img src="https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57" width="600" />

#### Registering via CLI

To register a runner this way, you need to add the `runner_registration_token` option to your Semaphore server's configuration file. This option should be set to an arbitrary string. Choose a sufficiently complex string to avoid security issues.

When the `semaphore runner setup` command asks if you have a Runner token, answer No. Then use the following command to register the runner:

`semaphore runner register --config /path/to/your/config/file.json`

or

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Configuration file

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
    "token_file": "path/to/the/file/where/runner/saves/token"

    // Here you can provide other runner-specific options, 
    // which will be used for runner registration, for example: 
    // max_parallel_tasks, webhook, one_off, etc.
    // ...
  }
}
```

You can manually edit this file without needing to call `semaphore runner setup` again.

To re-register the runner, you can use the `semaphore runner register` command. This will overwrite the token in the file specified in the configuration.

## Running the runner

Now you can start the runner with the command:

```
semaphore runner start --config /path/to/your/config/file.json
```

Your runner is ready to execute tasks ;)

### Runner tags (Pro)

You can assign one or more tags to a project runner. Templates can then require a tag so tasks run only on matching runners. Configure tags when adding a runner in the project UI, and set the required tag in the template settings.

## Runner unregistaration

You can remove runner using the web interfance.

<img src="https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040" width="600" />

---

Or unregister runner via CLI:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Security

Data transfer security is ensured by using asymmetric encryption: the server encrypts data using a public key, the runner decrypts it using a private key.

Public and private keys are generated automatically when the runner registers on the server.

<div class="warning">
  Use the HTTPS protocol for communication between the server and the runner, especially if they are not on the same private network.
</div>
