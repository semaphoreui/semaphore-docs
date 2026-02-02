# Welcome to Semaphore UI

Semaphore UI is a modern, open-source web UI and API for running automation with **Ansible**, **Terraform/OpenTofu**, **PowerShell**, **Shell/Bash**, and **Python**.

Semaphore is written in **Go** (lightweight, fast) and runs on **Windows**, **macOS**, and **Linux**. It supports **SQLite**, **MySQL**, and **PostgreSQL**.

## Choose your path

- **I’m installing or operating Semaphore (admins/operators)**
  - Install: [Installation](/administration-guide/installation)
  - Configure: [Configuration](/administration-guide/configuration)
  - Secure: [Security](/administration-guide/security)
  - Auth: [LDAP](/administration-guide/ldap) or [OpenID Connect](/administration-guide/openid)
  - Scale & run remotely: [Runners](/administration-guide/runners)
  - Keep it healthy: [Logs](/administration-guide/logs), [Upgrading](/administration-guide/upgrading), [Troubleshooting](/administration-guide/troubleshooting)
  - Enterprise setups: [High availability](/administration-guide/ha)

- **I’m using Semaphore day-to-day (teams/users)**
  - Organize work: [Projects](/user-guide/projects) and [Teams](/user-guide/team)
  - Run automation: [Tasks](/user-guide/tasks) and [Schedules](/user-guide/schedules)
  - Connect your code: [Repositories](/user-guide/repositories)
  - Targets and variables: [Inventory](/user-guide/inventory) and [Variable Groups](/user-guide/environment)
  - Credentials: [Key Store](/user-guide/key-store)
  - Connect tools: [Integrations](/user-guide/integrations)

- **I’m here for a specific tool**
  - [Ansible](/user-guide/apps/ansible)
  - [Terraform/OpenTofu](/user-guide/apps/terraform)
  - [Shell/Bash](/user-guide/apps/bash)
  - [PowerShell](/user-guide/apps/powershell)
  - [Python](/user-guide/apps/python)

## First run checklist (from zero to first task)

Use this as a simple “happy path” to get productive quickly:

1. **Install Semaphore** using your preferred method: [Installation](/administration-guide/installation)
2. **Run initial setup** (config + first admin user): [Interactive setup](/administration-guide/configuration/cli)
3. **Create a project** to isolate work (teams, infra, apps): [Projects](/user-guide/projects)
4. **Connect what Semaphore needs**
   - Source: [Repositories](/user-guide/repositories)
   - Secrets/credentials: [Key Store](/user-guide/key-store)
   - Targets: [Inventory](/user-guide/inventory)
   - Variables: [Variable Groups](/user-guide/environment)
5. **Create a task template and run it**
   - App-specific guides: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell/Bash](/user-guide/apps/bash)
   - Run and monitor: [Tasks](/user-guide/tasks)
6. **Automate & operationalize**
   - Schedule runs: [Schedules](/user-guide/schedules)
   - Control access: [RBAC](/user-guide/rbac)
   - Get alerts: [Notifications](/administration-guide/notifications)

## Key concepts (glossary)

If you’re new, these terms show up everywhere in the UI:

- **Project**: the main unit of separation (teams/infrastructures/applications) — [Projects](/user-guide/projects)
- **Repository**: where your playbooks/modules/scripts live — [Repositories](/user-guide/repositories)
- **Inventory**: hosts/groups/connection settings for Ansible-style runs — [Inventory](/user-guide/inventory)
- **Variable Group (Environment)**: reusable variables and configuration per project — [Variable Groups](/user-guide/environment)
- **Key Store**: encrypted credentials (SSH keys, tokens, passwords) — [Key Store](/user-guide/key-store)
- **Task / Task template**: the definition and the run of automation — [Tasks](/user-guide/tasks)
- **Runner**: where tasks execute (local or remote) — [Runners](/administration-guide/runners)

## Common workflows

- **CI/CD in Semaphore**: build, deploy, and rollback — [CI/CD](/administration-guide/cicd)
- **Run at scale**: distribute execution using runners — [Runners](/administration-guide/runners)
- **Programmatic automation**: integrate Semaphore into your pipelines — [API](/administration-guide/api)
- **Manage via CLI**: setup, users, runners, migrations — [CLI](/administration-guide/cli)

## Get help, report issues, or contribute

- **Help / community**: join the [Discord](https://discord.gg/5R6k7hNGcH)
- **Bug reports / feature requests**: open an issue on [GitHub Issues](https://github.com/semaphoreui/semaphore/issues)
- **Source code**: [GitHub](https://github.com/semaphoreui/semaphore)

## FAQ

If something isn’t working as expected, start here: [Troubleshooting FAQ](/faq/troubleshooting)
