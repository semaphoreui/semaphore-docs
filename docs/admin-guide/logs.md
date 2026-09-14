# Logs

Semaphore writes server logs to **stdout** and stores **Task** and **Activity** logs in a **database**, centralizing key log information and eliminating the need to back up log files separately. The only data stored on the file system is caching data.

---

## Server log {#server-log}

Semaphore does not log to files. Instead, all application logs are written to **stdout**.  
If Semaphore is running as a systemd service, you can view the logs with the following command:

```bash
journalctl -u semaphore.service -f
```

If Semaphore is running in Docker container, you can view the logs with the following commamd:
```
docker logs -f my-semaphore-container
```

This provides a live (streaming) view of the logs.

### Log level and debug namespaces {#log-level-and-debug-namespaces}

Set verbosity with the `SEMAPHORE_LOG_LEVEL` environment variable or the `--log-level` flag on any Semaphore CLI command (`DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`, `PANIC`). See the [CLI reference](/admin-guide/cli#global-options).

At `DEBUG` level you can narrow output to specific subsystems with `SEMAPHORE_DEBUG_FILTER` or `--debug-filter`. The filter matches the `context` field on structured log lines (for example `task_pool`, `task_logger`, `runner`, `git`). Syntax mirrors the Node.js [`debug`](https://www.npmjs.com/package/debug) package:

- `runner` — only the `runner` namespace
- `task_*` — any context starting with `task_`
- `*,-db` — everything except `db`

The filter only affects **DEBUG** lines and has no effect unless the global level is `DEBUG`.

### Task dispatch fields {#task-dispatch-fields}

When the task pool queues or starts a task, server logs include structured fields such as `task_id`, `task_name`, and `username` (the Semaphore user who started the task, or the API identity for scheduled and integration runs). Use these fields when correlating journalctl or container logs with a specific run in the UI.

---

## Activity log {#activity-log}

The Activity Log captures user actions performed in Semaphore, including:

- Adding or removing resources (e.g., Templates, Inventories, Repositories).
- Adding or removing team members.

### Pro version 2.10 and later {#pro-version-210-and-later}

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
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### Activity (events) logging options {#activity-events-logging-options}

The Activity (events) logging options allow you to configure how Semaphore records user actions and system events to a file. These settings control the behavior of event logging, including whether it's enabled, the format of log entries, and specific logger configurations. When enabled, user actions like creating templates or managing teams will be written to the specified log file according to these settings.

| Parameter             | Environment Variables | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Enable event logging to file. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Log record format. Leave empty for raw format, or set to `json`. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Logger options](#logger-options). |

#### Tasks logging options {#tasks-logging-options}

The Tasks logging options allow you to configure how Semaphore records task execution details to a file. These settings control the logging of task-related events, including task starts, completions, and their execution status. When enabled, all task operations and their outcomes will be written to the specified log file according to these settings, providing a detailed audit trail of task execution history.

| Parameter             | Environment Variables | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Enable task logging to file. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Log record format. Leave empty for raw format, or set to `json`. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Logger options](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Logger options. |



#### Logger options {#logger-options}

| Parameter             | Type | Description           |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | Path and name of the file to write logs to. Backup log files will be retained in the same directory.  It uses `processname`-lumberjack.log in temporary if empty. |
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

## Task history {#task-history}

Semaphore stores information about task execution in the database. Task history provides a detailed view of all executed tasks, including their status and logs. You can monitor tasks in real time or review historical logs through the web interface.

### Configuring task retention {#configuring-task-retention}

By default, Semaphore stores all tasks in the database. If you run a large number of tasks, they can occupy a significant amount of disk space.

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

## Syslog protocol support {#syslog-protocol-support}

Semaphore can forward activity and task log entries to an external syslog collector for long‑term storage or centralized monitoring. Syslog forwarding is disabled by default.

Configure syslog support in `config.json`:

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

The same options are available through environment variables if you prefer not to edit the JSON file:

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Syslog options {#syslog-options}

| Parameter             | Environment Variables | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | Turn syslog forwarding on or off. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | Protocol used to reach the collector, such as `udp` or `tcp`. |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | Collector address in `host:port` format. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | Optional identifier prepended to every message. |


Restart the Semaphore service after changing these values so that the new syslog destination is applied.

---

## SIEM integration {#siem-integration}

Semaphore 2.20+ records a security audit trail suitable for forwarding to a SIEM (Splunk, Elastic Security, QRadar, Wazuh, etc.).

Every audit event includes the **action** (`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), the **client IP address** and the **user agent**, in addition to the acting user and the affected object. Besides resource changes, Semaphore logs:

- Successful logins (password, LDAP and OpenID), logouts, failed login attempts and failed MFA verifications.
- User account creation, update, deletion and password changes.
- API token creation and deletion (only the short token prefix is logged, never the secret).

There are three ways to deliver audit events to your SIEM:

1. **Pull:** read `/api/events` (see [API docs](/admin-guide/api)).
2. **File collector:** enable the Activity Log file (Pro, see above) and ship `events.log` (JSON format recommended) with Filebeat, Fluentd or a Splunk Universal Forwarder.
3. **Audit webhook (Pro):** push events in real time over HTTPS — a generic JSON endpoint or Splunk HTTP Event Collector.

### Audit webhook {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

Or using environment variables:

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### Audit webhook options {#audit-webhook-options}

| Parameter             | Environment Variables | Description           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | Turn audit event forwarding on or off. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | Full receiver endpoint URL. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | Payload format: empty for plain JSON or `splunk_hec` for a Splunk HEC envelope. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | Extra HTTP headers, e.g. the HEC token: `{"Authorization": "Splunk <token>"}`. |

Delivery is asynchronous: events are queued in memory and retried up to three times with backoff, so an unavailable receiver never slows down or fails user requests. If the receiver stays down, queued events are dropped with a warning in the server log.

## Summary {#summary}

- **Server log:** Written to stdout; viewable via `journalctl` if running under systemd.  
- **Activity and tasks log:** Tracks all user actions. Optionally, **Pro 2.10+** can write these to a file.  
- **Task history:** Stores real-time and historical task execution logs. Retention is configurable per template.

Following these guidelines ensures you have proper visibility into Semaphore UI operations while controlling storage usage and log retention.
