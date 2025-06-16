<div class="breadcrumbs">
    <a href="/user-guide/projects/">Projects</a>
    → History
</div>

# History

The History screen in Semaphore provides a comprehensive view of all task executions within your project. This feature allows you to track, analyze the execution history of your tasks, providing valuable insights into your automation workflows.

## Overview

The History page displays a chronological list of all task executions, including:

- Task templates used
- Execution status (success, failure, in progress)
- Start and end times
- Duration
- User who initiated the task
- Task output and logs

## Viewing Task History

### Accessing History

1. Navigate to your project in Semaphore
2. Click on "History" tab
3. View the list of all task executions
<!-- 
### History List Features

The history list provides several features to help you manage and analyze task executions:

1. **Filtering**
   - Filter by task template
   - Filter by status
   - Filter by date range
   - Filter by user

2. **Sorting**
   - Sort by execution time
   - Sort by duration
   - Sort by status
   - Sort by template name

3. **Search**
   - Search by task ID
   - Search by template name
   - Search by user
   - Search by status -->

## Task Details

Clicking on any task in the history list opens a detailed view showing:

1. **Task Information**
   - Task ID
   - Template used
   - Start and end times
   - Duration
   - Status
   - User who ran the task

2. **Execution Details**
   - Complete task output
   - Error messages (if any)
   - Environment variables used
   - Inventory information
   - Repository details

3. **Task Logs**
   - Real-time log viewing
   - Log download option
   - Log search functionality
   - Error highlighting

## Task Management

### Actions Available

From the history view, you can:

- Access complete task logs
- Download task output
- Search within logs

## Task Retention

Semaphore allows you to configure how long task history is retained:

1. **Default Behavior**
   - All tasks are stored in the database
   - No automatic deletion by default

2. **Configuring Retention**
   - Set maximum tasks per template
   - Configure via environment variable:
     ```bash
     SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
     ```
   - Or via config.json:
     ```json
     {
       "max_tasks_per_template": 30
     }
     ```

3. **Retention Rules**
   - When the limit is reached, oldest tasks are automatically deleted
   - Deletion is per template
   - Task logs are removed along with task records
<!-- 
## Best Practices

1. **Regular Maintenance**
   - Review and clean up old task history
   - Configure appropriate retention limits
   - Archive important task outputs if needed

2. **Monitoring**
   - Regularly check task success rates
   - Monitor task durations
   - Review error patterns

3. **Troubleshooting**
   - Use task history to identify patterns
   - Compare successful vs failed tasks
   - Track changes in task behavior

## Exporting History

You can export task history for:

1. **Audit Purposes**
   - Compliance requirements
   - Security reviews
   - Performance analysis

2. **Analysis**
   - Track task success rates
   - Monitor execution times
   - Identify patterns

3. **Backup**
   - Archive important task history
   - Maintain records for future reference

## Security Considerations

1. **Access Control**
   - Task history is subject to project permissions
   - Sensitive information in task output is protected
   - Access logs are maintained

2. **Data Protection**
   - Secure storage of task history
   - Proper cleanup of sensitive data
   - Compliance with data retention policies

 -->