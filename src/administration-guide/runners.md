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

To set up the server for working with running you should add following option to your Semaphore server configuration:

```json
{
  "use_remote_runner": true
}
```

To set up the runner, use the following command:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

This command will create a configuration file at `/path/to/your/config/file.json`.

But before using this command, you need to understand how runners are registered on the server.

### Registering the Runner on the Server

There are two ways to register a runner on the Semaphore server:
1) Add it via the web interface.
2) Use the command line with the `semaphore runner register` command.

#### Adding the Runner via the Web Interface

#### Registering via CLI

To register a runner this way, you need to add the `runner_registration_token` option to your Semaphore server's configuration file. This option should be set to an arbitrary string. Choose a sufficiently complex string to avoid security issues.

When the `semaphore runner setup` command asks if you have a Runner token, answer No. Then use the following command to register the runner:

`semaphore runner register --config /path/to/your/config/file.json`

or

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Configuration File

As a result of running the `semaphore runner setup` command, a configuration file like the following will be created:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {

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

## Running the Runner

Now you can start the runner with the command:

```
semaphore runner --config /path/to/your/config/file.json
```

<!-- If everything is set up correctly, you will see the following output in the console:

```

``` -->

Your runner is ready to execute tasks ;)

## Runner unregistaration

You can remove runner using the web interfance.



Or unregister runner via CLI:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Security

<div class="warning">
  Use the HTTPS protocol for communication between the server and the runner, especially if they are not on the same private network.
</div>
