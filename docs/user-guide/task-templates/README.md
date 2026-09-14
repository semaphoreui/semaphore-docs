# Task Templates

Templates define how to run Semaphore tasks. Currently the following task types are supported:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform)
* [Shell](/user-guide/apps/bash)
* [Powershell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

---

## Parallel tasks {#parallel-tasks}

By default, tasks from the same template execute sequentially. To allow concurrent runs of the same template, enable the "Allow parallel tasks" option in the template settings.

## Executor image (Docker and Kubernetes runners) {#executor-image-docker-and-kubernetes-runners}

When a project runner uses the **Docker** (Pro) or **Kubernetes** (Enterprise) executor, each task normally runs in the default job image configured on the runner (for example `semaphoreui/job:latest`). You can override that image per template.

1. Open the template settings
2. Set **Executor image** to the container image reference (for example `my-registry/ansible:2.16` or `semaphoreui/job:latest`)
3. Save the template

**Behavior**:
- Only **Docker** and **Kubernetes** runner executors honor this field; the local executor ignores it
- Leave the field empty to use the runner's default image from `runner.executor.docker.image` or `runner.executor.k8s.image`
- Clearing the field in the UI removes the override

**Use cases**:
- Templates that need a different toolchain (older Ansible, a specific Terraform version, extra OS packages baked into a custom image)
- Isolated images for security-sensitive templates without changing the runner-wide default

See [Runner configuration](/admin-guide/configuration) for default image settings and [Project runners](/user-guide/projects/runners) for executor setup.

## Task notifications {#task-notifications}

Semaphore can send task result notifications to channels configured on the server (email, Slack, Telegram, and others). Notifications are only sent when **Allow alerts for this project** is enabled on the project (Project → Settings).

Per template, you can reduce noise with two options in the template editor:

| Template field | UI label | Effect |
| --- | --- | --- |
| `suppress_success_alerts` | Suppress success alerts | Skips notifications when the task finishes with **success** |
| `suppress_error_alerts` | Suppress error alerts ![Static Badge](https://img.shields.io/badge/v2.20.5-red) | Skips notifications when the task finishes with **failure** |

These flags apply to all configured notification channels for that task (Slack, Telegram, Microsoft Teams, and so on). They do not affect the task log in the UI or task history in the database.

**Typical uses**:

- Cron or health-check templates that fail often but should not page the team (`suppress_error_alerts`)
- Noisy jobs that succeed frequently (`suppress_success_alerts`)

Email alerts are only sent on task **failure** (when alerts are enabled). Other channels also notify on **success** and when a task is **waiting for confirmation**. Suppression still follows the template flags above.

See [Notifications](/admin-guide/notifications_old) for server-side setup.
