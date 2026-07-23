# Projects

A project is the unit of separation in Semaphore. All activity — running tasks, storing credentials, managing team access — happens inside a project. Projects are independent from one another, so you can use them to organize unrelated systems, teams, infrastructures, or environments within a single Semaphore installation.

A project contains:

* [Task Templates](/user-guide/task-templates/) — definitions of the jobs the project can run.
* [Repositories](/user-guide/repositories) — Git repositories with your playbooks, code, and scripts.
* [Inventory](/user-guide/inventory) — the hosts and workspaces your tasks operate on.
* [Key Store](/user-guide/key-store) — credentials for accessing repositories and hosts.
* [Variable Groups](/user-guide/environment) — variables and secrets passed to tasks.
* [Team](/user-guide/team) — the users who can access the project and their roles.

## Create a project

You create projects from the project menu in the left sidebar.

Prerequisites:

* Your user account must be allowed to create projects.

1. In the left sidebar, select the current project name to open the project menu, then select **New Project...**. If you have no projects yet, Semaphore shows the new project screen right away.
2. In the **New Project** dialog, enter a project **Name**.
3. Optionally fill in the remaining fields (see the reference table below).
4. Select **Create**.

![](/assets/project_new_ipad.png)

The New Project dialog has the following fields:

| Field | Description |
|-------|-------------|
| Name | The project name shown in the project menu. Required. |
| Max number of parallel tasks | Maximum number of tasks the project may run at the same time. `0` or empty means unlimited. |
| Telegram Chat ID | Chat ID used for Telegram alerts about task failures. Optional. |
| Allow alerts for this project | Enables sending alerts for this project's tasks. |

## Switch between projects

Each browser session works within one active project at a time.

1. In the left sidebar, select the current project name to open the project menu.
2. Select the project you want to switch to.

## Back up a project

You can download a backup file that describes the project's configuration.

Prerequisites:

* You must have access to the project's **Settings** section (project owner or administrator).

1. In the project's **Settings** section, select **Backup Project**.
2. Save the downloaded backup file.

Secret values from the Key Store are not included in the backup. After a restore, the restored keys are empty and you must re-enter their secrets.

## Restore a project

Restoring a backup file creates a new project with the configuration from the backup.

Prerequisites:

* Your user account must be allowed to create projects.

1. In the left sidebar, select the current project name to open the project menu, then select **Restore Project...**.
2. In the **Restore Project** dialog, choose the backup file.
3. Select **Restore**.

After the restore, re-enter the secrets for any keys that were restored empty.

## Related pages

* [History](/user-guide/projects/history)
* [Activity](/user-guide/projects/activity)
* [Settings](/user-guide/projects/settings)
* [Project runners (Pro)](/user-guide/projects/runners)
* [Team](/user-guide/team)
