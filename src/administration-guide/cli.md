# CLI

<!-- <div class="warning">
    For Semaphore installed via Snap you should use <code>sudo</code> for using CLI. 
    This is completely safe because Semaphore works in a <a href="https://snapcraft.io/docs/snap-confinement">strict mode</a>.
</div> -->

## Common config options

| Option               | Description                               |
|----------------------|-------------------------------------------|
|`--config config.json`| Path to the configuration file.           |
|`--no-cofnig`         | Do not use any configuration file. Only environment variable will be used. |
|`--log-level ERROR`   | `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, `PANIC` |

## Version

Print current version.

```bash
semaphore version
```


## Help

Print list of supported commands.

```bash
semaphore help
```

## Database migration

Update database schema to latest version.

```
semaphore migrate
```

## Interactive setup

Use this option for first time configuration.

```
semaphore setup
```

## Server mode

Start the server.

```
semaphore server
```

## Runner mode

Start the runner.

```
semaphore runner
```
