# Tasks

A task is an instance of launching an Ansible playbook. You can create the task from [Task Template](task-templates/) by clicking the button Run/Build/Deploy for the required template.

![](<../.gitbook/assets/image (6).png>)

The **Deploy** task type allows you to specify a version of the build associated with the task. By default, it is the latest build version.

![](<../.gitbook/assets/task\_deploy (1).png>)

When the task is running, or it has finished, you can see the task status and the running log.

![](<../.gitbook/assets/image (7).png>)

## Tasks log retention
You'll notice that logs of previous runs of your tasks are available in the tasks template or in the dashboard.

However, by default, log retention is infinite.

You can configure this by using the `max_tasks_per_template` parameter in `config.json` or the `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` environment variable.

