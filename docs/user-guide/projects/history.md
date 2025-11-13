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

### Statistics

The project provides a statistics page summarizing task outcomes over a selected time range, with filtering by user.

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
