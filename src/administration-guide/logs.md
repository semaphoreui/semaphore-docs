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

Semaphore Pro 2.10+ supports writing the Activity Log to a file. To enable this, add the following configuration to your `config.json`:

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

Each line in the file follows this format:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Task log

Task Logs detail the execution of tasks in Semaphore. You can view them in real-time or access historical logs through the web interface.

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
- **Activity log:** Tracks all user actions. Optionally, Pro 2.10+ can write these to a file.  
- **Task log:** Stores real-time and historical task execution logs. Retention is configurable per template.

Following these guidelines ensures you have proper visibility into Semaphore UI operations while controlling storage usage and log retention.