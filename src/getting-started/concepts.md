# Core Concepts

Semaphore UI groups automation around a few key building blocks. Understanding how they relate makes the rest of the documentation easier to navigate.

## Projects

Projects are secure containers for everything your team needs to run automation: repositories, inventories, secrets, runners, and task templates. Each project maintains its own permissions, allowing you to separate teams or environments (for example `Production`, `Staging`, `Sandbox`).

* Access control is role-based (viewer, operator, admin) and can be delegated per project.
* Integrations such as repositories, keys, and notifications are scoped to the project.
* Activity history shows who ran which tasks and when.

See the detailed [Projects guide](../user-guide/projects.md).

## Repositories

A repository is the source of automation content: Ansible playbooks, Terraform configurations, shell scripts, and more. Semaphore pulls code on demand from Git, local paths, or archive files.

* Supports HTTPS/SSH Git, Bitbucket, GitLab, GitHub, Gitea, and custom providers.
* Optionally use access keys or deploy keys from the [Key Store](../user-guide/key-store.md).
* Pin branches, tags, or commit SHAs for reproducible runs.

Learn how to add repositories in the [Repositories guide](../user-guide/repositories.md).

## Inventories

Inventories describe the infrastructure or targets your automation will operate on. Semaphore supports:

* Static inventories defined inline.
* Dynamic inventories fetched from scripts or sources like NetBox.
* Per-project defaults and overrides.

Inventories are configured under **Inventory**, covered in the [Inventory guide](../user-guide/inventory.md).

## Task Templates

Task templates specify what Semaphore runs (e.g. an Ansible playbook, Terraform plan, shell script) and how it runs (repository, inventory, environment variables, surveys, confirmations).

* Templates support different executors: Ansible, Terraform/OpenTofu, Bash, PowerShell, Python, and more.
* Surveys gather runtime input from operators to avoid hard-coded variables.
* Templates can require manual approval before execution.

See [Task Templates](../user-guide/task-templates/README.md) for detailed options per executor.

## Tasks & Schedules

When you run a task template, Semaphore creates a *task* instance. Tasks record logs, target hosts, outputs, and metadata.

* Tasks can be triggered manually, via schedules, or through the REST API/CLI.
* Schedule rules support cron-style expressions with timezone awareness.
* Task history is searchable for auditing and troubleshooting.

Review the [Tasks](../user-guide/tasks.md) and [Schedules](../user-guide/schedules.md) guides to learn more.

## Secrets & Variables

Projects keep secrets and configuration data separate from code. Use:

* **Key Store** for SSH keys, tokens, and credentials.
* **Environment** (variable groups) for runtime variables and secrets exposed as environment variables.
* **Vaults** to store Ansible Vault passwords securely.

Details live in [Key Store](../user-guide/key-store.md) and [Variable Groups](../user-guide/environment.md).

## Runners

Runners execute tasks. By default Semaphore runs tasks on the server host, but you can register additional runners to scale out or isolate workloads.

* Remote runners connect over gRPC and support labels to target specific workloads.
* Projects can restrict templates to a subset of runners.
* Runner health is visible in the project dashboard and API.

Learn how to install and manage runners in the [Runners guide](../administration-guide/runners.md).

## Notifications & Integrations

Semaphore can notify teams about task outcomes and integrate with chat, email, and webhooks.

* Built-in connectors include Email, Slack, Microsoft Teams, Telegram, Rocket.Chat, DingTalk, Gotify, and custom webhooks.
* Configure notifications per project or per template.

See [Notifications](../administration-guide/notifications.md) for configuration steps.

---

Ready to see how these pieces surface in the interface? Continue with the [UI Tour](./ui-tour.md).
