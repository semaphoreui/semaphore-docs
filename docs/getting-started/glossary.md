# Glossary

Short definitions of the terms you meet in the Semaphore UI interface and documentation, in alphabetical order.

## Build

A task template type used to create artifacts. Each run of a build template increments the artifact version, which your playbook receives via the `semaphore_vars.task_details.target_version` variable. Semaphore provides task versioning; the artifact creation itself is implemented in your playbook or script. See [CI/CD pipelines](/reference/cicd).

## Deploy

A task template type used to deploy artifacts to destination servers. Each deploy template is associated with a build template, and when you run it you can choose which build version to deploy — by default, the latest. See [CI/CD pipelines](/reference/cicd) and [Tasks](/user-guide/tasks).

## Integration

A connection between Semaphore and an external service such as GitHub or GitLab. An integration triggers a specific task template through a webhook endpoint, with optional matchers to filter incoming requests and value extractors to pass payload data to the task. See [Integrations](/user-guide/integrations).

## Inventory

A list of hosts that Ansible runs plays against, together with variables, stored in YAML, JSON, TOML, or INI format. An inventory can be static (edited in the web UI) or read from a file, and it references user credentials from the Key Store that Ansible uses to log in to the hosts. See [Inventory](/user-guide/inventory).

## Key Store

The per-project storage for credentials: SSH keys, login/password pairs and access tokens, sudo credentials, and Ansible Vault passwords. Secrets are stored encrypted in the database, or in an external secret manager such as HashiCorp Vault or OpenBao. See [Key Store](/user-guide/key-store).

## Project

The main unit of separation in Semaphore. All activity occurs within the context of a project, and projects are independent from one another, so you can use them to organize different teams, infrastructures, environments, or applications. See [Projects](/user-guide/projects).

## Repository

A place where your Ansible playbooks, roles, and scripts are stored — a remote Git repository accessed over HTTPS or SSH, or a local path on the server. All task templates require a repository in order to run. See [Repositories](/user-guide/repositories).

## Runner

An agent that runs tasks on a separate server from Semaphore UI, similar to GitLab or GitHub Actions runners. A runner connects to the server with a token, receives tasks, clones the repository, executes the job, and reports the results back. See [Runners](/admin-guide/runners).

## Schedule

An automatic trigger that runs a task template at predefined intervals, defined in standard cron syntax. Schedules are used for routine automation such as regular backups, compliance checks, and system updates. See [Schedules](/user-guide/schedules).

## Survey variables

Custom input fields added to a task template that prompt the user for values when a task is run. They are passed to the job as extra variables (Ansible), variables (Terraform/OpenTofu), or command-line arguments (scripts). See [Survey variables](/user-guide/task-templates/survey-vars).

## Task

A single run of a task template, created by clicking **Run**, **Build**, or **Deploy** on the template, or triggered by a schedule, an integration, or an API call. Each task has a status and a log you can follow live and read afterwards. See [Tasks](/user-guide/tasks).

## Task Template

The definition of how to run a task: the app (Ansible, Terraform/OpenTofu, Shell, PowerShell, or Python), the repository, the playbook or script path, the inventory, and variable groups. Running a template creates a task. See [Task Templates](/user-guide/task-templates/).

## Variable Group (Environment)

A named set of extra variables in JSON format, plus environment variables and secrets, that can be attached to task templates. Use variable groups for configuration shared across tasks. See [Variable Groups](/user-guide/environment).

## Vault

An Ansible Vault password stored in the Key Store (as a `Login with password` key) and attached to a task template to decrypt vault-encrypted content during a run. A template can have multiple vault passwords; Ansible tries each one. See [Key Store](/user-guide/key-store) and [Ansible](/user-guide/apps/ansible).
