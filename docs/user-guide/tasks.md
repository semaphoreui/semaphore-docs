# Tasks

A task is a single run of a [task template](/user-guide/task-templates/). Each task records who started it, the checked-out commit, its status, and the full output log, so every run can be reviewed and repeated later. Finished tasks stay available in the template's task list and in the project [History](/user-guide/projects/history).

## Start a task

You start a task from its template.

1. In the **Task Templates** section, open the required template.
2. Select the run button: **Run** for a task template, **Build** for a build template, or **Deploy** for a deploy template.
3. In the new task dialog, optionally enter a message and fill in the remaining fields (see the reference table below).
4. Start the task.

![](/assets/image6.png)

Which fields the dialog shows depends on the template's app, kind, and [prompt settings](/user-guide/task-templates/prompts):

| Field | Shown for | Description |
|-------|-----------|-------------|
| Message | All templates | Optional note stored with the task and shown in the task history. |
| Build Version | Deploy templates | The build to deploy. Defaults to the most recent successful build. |
| Survey variables | Templates with [survey variables](/user-guide/task-templates/survey-vars) | Custom input fields defined by the template. |
| Branch | Templates with **Allow overriding branch in task** enabled | Git branch to check out instead of the template's branch. |
| Inventory | Ansible templates with inventory override allowed | Inventory to use instead of the template's inventory. |
| CLI args | Templates with **Allow CLI args in task** enabled | Extra command-line arguments as a JSON array. |
| Debug, Dry Run, Diff, Limit, Tags, Skip tags | Ansible templates, per the template's prompt settings | Map to `-v`/`-vvvv`, `--check`, `--diff`, `--limit`, `--tags`, and `--skip-tags`. |
| Plan, Destroy, Auto Approve, Upgrade, Reconfigure | Terraform/OpenTofu/Terragrunt templates | Control the plan/apply behavior of the run. |

## Deploy a specific build version

A deploy task installs an artifact produced by a build task, and you can choose which build to deploy.

1. In the **Task Templates** section, open the deploy template and select **Deploy**.
2. In the **Build Version** field, select the build version. By default, the most recent successful build is selected.
3. Start the task.

![](/assets/task_deploy1.png)

## Monitor a running task

When a task starts, Semaphore opens the task window with the current status and the live output log. You can reopen it at any time by selecting the task in the template's task list or in the project **History**.

![](/assets/image7.png)

To see the unprocessed output, select the **Raw log** action in the task window.

## Stop a task

You can stop a task that is waiting in the queue or already running.

1. Open the window of the running task.
2. Select **Stop**. The task switches to the `stopping` status and then to `stopped`.
3. If the task does not terminate, select **Force Stop** to kill it immediately.

## Re-run a task

You can start a new task with the same parameters as a previous one.

1. In the template's task list or the project **History**, select the replay icon next to the task.
2. The new task dialog opens pre-filled with the original task's parameters. Adjust them if needed and start the task.

## Task statuses

A task moves through the following statuses:

| Status | Description |
|--------|-------------|
| `waiting` | The task is queued and waiting to start. |
| `starting` | The task has been taken from the queue and is being prepared. |
| `waiting_confirmation` | The task is paused until a user approves it. |
| `confirmed` | The task has been approved. |
| `rejected` | The task has been rejected and will not run. |
| `running` | The task is executing. |
| `stopping` | A stop was requested; the task is shutting down. |
| `stopped` | The task was stopped before finishing. |
| `success` | The task finished successfully. |
| `error` | The task failed. Shown as **Failed** in the UI. |

## Task log retention

By default, Semaphore keeps the tasks and logs of every run forever. To limit how many tasks are kept per template, set the `max_tasks_per_template` option in `config.json` or the `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` environment variable. When the limit is exceeded, the oldest tasks of the template are deleted as new tasks are created.
