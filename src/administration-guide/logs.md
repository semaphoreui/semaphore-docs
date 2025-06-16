# Logs

Semaphore writes server logs to **stdout** and stores **Task** and **Activity** logs in a **database**, centralizing key log information and eliminating the need to back up log files separately. The only data stored on the file system is caching data.

---

## Server log

Semaphore does not log to files. Instead, all application logs are written to **stdout**.  
If Semaphore is running as a systemd service, you can view the logs with the following command:

```bash
journalctl -u semaphore.service -f
```

This provides a live (streaming) view of the logs.

---

## Activity log

The Activity Log captures all user actions performed in Semaphore, including:

- Adding or removing resources (e.g., Templates, Inventories, Repositories).
- Adding or removing team members.
- Starting or stopping tasks.

### Pro version 2.10 and later

**Semaphore Pro** 2.10+ supports writing the Activity Log and Task log to a file. To enable this, add the following configuration to your `config.json`:

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


Or you can do this using following environment variables:

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOG_PATH=./events.log

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOG_PATH=./tasks.log
```

#### Activity (events) logging options

The Activity (events) logging options allow you to configure how Semaphore records user actions and system events to a file. These settings control the behavior of event logging, including whether it's enabled, the format of log entries, and specific logger configurations. When enabled, all user actions (like creating templates, managing teams, or running tasks) will be written to the specified log file according to these settings.

| Parameter             | Environment Variables | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Enable event logging to file. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Log record format. Can be `raw` or `json`. |
| `logger`              | `SEMAPHORE_EVENT_LOG_LOGGER`  | Logger opitons. |

#### Tasks logging options

The Tasks logging options allow you to configure how Semaphore records task execution details to a file. These settings control the logging of task-related events, including task starts, completions, and their execution status. When enabled, all task operations and their outcomes will be written to the specified log file according to these settings, providing a detailed audit trail of task execution history.

| Parameter             | Environment Variables | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Enable task logging to file. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Log record format. Can be `raw` or `json`. |
| `logger`              | `SEMAPHORE_TASK_LOG_LOGGER`  | Logger opitons. |

#### Task results logging options

| Parameter             | Environment Variables | Description           |
| --------------------- | --------------------- | --------------------- |
| `result_logger`              | `SEMAPHORE_TASK_RESULT_LOGGER`  | Logger opitons. |


#### Logger options

| Parameter             | Type | Description           |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | Path and name of the file to write logs to. Backup log files will be retained in the same directory.  It uses <processname>-lumberjack.log in temporary if empty. |
| `maxsize`      | Integer | The maximum size in megabytes of the log file before it gets rotated. It defaults to 100 megabytes. |
| `maxage`       | Integer | The maximum number of days to retain old log files based on the timestamp encoded in their filename.  Note that a day is defined as 24 hours and may not exactly correspond to calendar days due to daylight savings, leap seconds, etc. The default is not to remove old log files based on age. |
| `maxbackups`   | Integer | The maximum number of old log files to retain.  The default is to retain all old log files (though MaxAge may still cause them to get deleted.) |
| `localtime`    | Boolean | Determines if the time used for formatting the timestamps in backup files is the computer's local time.  The default is to use UTC time. |
| `compress`     | Boolean | Determines if the rotated log files should be compressed using gzip. The default is not to perform compression. |



Each line in the file follows this format:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Task history

Semaphore stores information about task execution in the database. Task history provides a detailed view of all executed tasks, including their status and logs. You can monitor tasks in real time or review historical logs through the web interface.

### Configuring task retention

By default, Semaphore stores all tasks in the database. If you run a large number of tasks, the can occupy a significant amount of disk space.

You can configure how many tasks are retained per template using one of the following approaches:

1. **Environment Variable**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **`config.json` Option**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

When the number of tasks exceeds this limit, the oldest Task Logs are automatically deleted.

---

## Summary

- **Server log:** Written to stdout; viewable via `journalctl` if running under systemd.  
- **Activity and tasks log:** Tracks all user actions. Optionally, **Pro 2.10+** can write these to a file.  
- **Task history:** Stores real-time and historical task execution logs. Retention is configurable per template.

Following these guidelines ensures you have proper visibility into Semaphore UI operations while controlling storage usage and log retention.