# Schedules
# Schedules

The schedule function in Semaphore allows to automate the execution of templates (e.g. playbook runs) at predefined intervals. This feature allows to implement routine automation tasks, such as regular backups, compliance checks, system updates, and more.

## Setup and Configuration

### Accessing the Schedule Feature

1. Log in to your Ansible Semaphore web interface
2. Navigate to the "Schedule" tab in the main navigation menu
3. Click the "New Schedule" button in the top right corner to create a new schedule

![](<../.gitbook/assets/schedule01.png>)

### Creating a New Schedule

When creating a new schedule, you'll need to configure the following options:

| Field | Description |
|-------|-------------|
| Name | A descriptive name for the scheduled task |
| Template | The specific Task Template to execute |
| Timing | Either in cron format for more fexibility or using the built-in options for common intervals |

![](<../.gitbook/assets/schedule02.png>) ![](<../.gitbook/assets/schedule03.png>)

### Cron Format Syntax

The schedule uses standard cron syntax with five fields:

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Examples:
- `*/15 * * * *` - Run every 15 minutes
- `0 2 * * *` - Run at 2:00 AM every day
- `0 0 * * 0` - Run at midnight on Sundays
- `0 9 1 * *` - Run at 9:00 AM on the first day of every month

## Use Cases

### System Maintenance

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

Schedule this playbook to run weekly during off-hours to ensure systems stay up-to-date.

### Backup Operations

Create schedules for database backups with different frequencies:
- Daily backups that retain for one week
- Weekly backups that retain for one month
- Monthly backups that retain for one year

### Compliance Checks

Schedule regular compliance scans to ensure systems meet security requirements:

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### Environment Provisioning and Cleanup

For development or testing environments. Schedule cloud environment creation in the morning and teardown in the evening to optimize costs.

## Best Practices

* Use descriptive names for schedules that indicate both function and timing (e.g. "Weekly-Backup-Sunday-2AM")
* Avoid scheduling too many resource-intensive tasks concurrently
* Consider the effect of long-running scheduled tasks on other schedules
* Test schedules with short intervals before setting up production schedules with longer intervals
* Document the purpose and expected outcomes of scheduled tasks
