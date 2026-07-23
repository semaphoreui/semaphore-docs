---
slug: /user-guide/task-templates
---

# Task Templates

A task template defines a repeatable job: which app runs it, which repository and script or playbook it uses, which inventory and variables it gets, and what a user may change when launching it. Every [task](/user-guide/tasks) is a run of a template, so templates are the central object of a Semaphore project.

Each template uses one of the supported apps:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform)
* [Bash](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

## Template kinds

Every template is one of three kinds, selected at the top of the template form:

| Kind | Purpose |
|------|---------|
| Task | Runs a job with no versioning. Use it for ordinary automation: applying a playbook, running a script, applying a Terraform configuration. |
| Build | Produces versioned artifacts. A build template has a **Start Version**, and each successful build gets a new version that deploy templates can reference. |
| Deploy | Delivers an artifact produced by a **Build Template** to servers. Each deploy task is associated with a build version. With **Autorun** enabled, the deploy template starts automatically after each successful build. |

## Create a template

You create templates in the Task Templates section of a project.

1. In the **Task Templates** section, select **New Template**.
2. Select the template kind: **Task**, **Build**, or **Deploy**.
3. Enter a **Name** and select the app-specific script source: the playbook filename for Ansible, or the script filename for Bash, PowerShell, and Python.
4. Select the **Repository** and, for Ansible, the **Inventory**.
5. Optionally set the remaining fields (see the reference table below).
6. Select **Create**.

## Template fields

The template form contains the following fields; some appear only for certain apps or kinds:

| Field | Description |
|-------|-------------|
| Name | Template name shown in the template list. Required. |
| Playbook / script filename | Path to the playbook or script inside the repository. Required for all apps except Terraform/OpenTofu. |
| Inventory | [Inventory](/user-guide/inventory) used by the task. Required for Ansible templates. |
| Repository | [Repository](/user-guide/repositories) that is cloned before the run. Required. |
| Branch | Git branch to check out. |
| Variable Groups | One or more [variable groups](/user-guide/environment). At run time their variables and secrets are merged, with later groups overriding earlier ones. |
| Vaults | Vault passwords from the [Key Store](/user-guide/key-store) used to decrypt Ansible vault content. |
| View | The tab of the Task Templates page where the template is listed. |
| Runner tag | Requires the task to run on a [runner](/user-guide/projects/runners) with the matching tag. |
| CLI args | Extra command-line arguments as a JSON array, for example `["-vvvv"]`. |
| Survey variables | Custom input fields shown in the new task dialog. See [Survey Variables](/user-guide/task-templates/survey-vars). |
| Start Version | Build templates only: the version assigned to the first build, for example `0.0.1`. |
| Build Template | Deploy templates only: the build template whose artifacts this template deploys. |
| Autorun | Deploy templates only: start a deploy automatically after each successful build. |
| Suppress success alerts | Sends alerts only for failed tasks of this template. |
| Task JWT | Issues a short-lived signed token to each task. See [Task JWTs](/user-guide/task-templates/jwt). |

Ansible and Terraform/OpenTofu templates additionally have app-specific options — default `limit`, `tags`, and `skip tags` values, auto-approve, backend overrides — and switches that control what a user may override when starting a task. See [Prompts](/user-guide/task-templates/prompts).

## Allow parallel tasks

By default, tasks of the same template run sequentially: a new task waits until the previous one finishes. To allow concurrent runs of the same template, enable the **Allow parallel tasks** checkbox in the template form.

## Run templates on a schedule

A template can be started automatically by cron. Schedules are managed in the **Schedule** section of the project; see [Schedules](/user-guide/schedules). A template can also be limited to scheduled runs that have new commits: enable the corresponding checkbox in the template form and select the repository and check interval.

## Related pages

* [Survey Variables](/user-guide/task-templates/survey-vars)
* [Prompts](/user-guide/task-templates/prompts)
* [Task JWTs](/user-guide/task-templates/jwt)
* [Tasks](/user-guide/tasks)
* [Schedules](/user-guide/schedules)
