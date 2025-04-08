# Logs

Semaphore stores Task and Activity logs in the database.
This allows to store all important information in the one place. 
You don't need backup any files to prevent data loosing. Only cache stored in file system.

# Server log

Semaphore doesn't use files for logging. All logs write to stdout.
If you run Semaphore as Systemd service you can see logs by command:

```
journalctl -u semaphore.service -f
```

# Activity log

Activity logs includes all actions of user in the Semaphore:

- Adding/removing resources like Templates, Inventories, Repositories, etc.
- Adding/removing team members.
- Running/stopping tasks.

## Pro since 2.10

Allows to write Activity log to file. Add following configuration option to your `config.json`:

```json
{
	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	}
}
```

Each row of the log has following format:

```
2024-01-03 12:00:34 user=234234 object=template
```

# Task log

Task logs can be viewed in realtime or from history from web interface.

You can configure how many tasks will be stored in the database for each template. Use following option for this:
* Environment variable: `SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30`
* `config.json` option:

  ```json
  {
    "max_tasks_per_template": 30
  }
  ```