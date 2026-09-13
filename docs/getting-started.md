---
title: Getting Started
description: A step-by-step path from a fresh install to your first task run, plus the key concepts used across the UI.
---

# Getting Started

This page walks you from a fresh install to your first successful task. Each step links to the page with the details.

## From zero to first task {#from-zero-to-first-task}

1. **Install Semaphore** with your preferred method: [Installation](/admin-guide/installation).
2. **Log in** with the admin user you created during setup, or via the `SEMAPHORE_ADMIN_*` variables in Docker.
3. **Create a project.** A project isolates teams, infrastructures, or applications from each other: [Projects](/user-guide/projects).
4. **Connect what your automation needs:**
   - Source code with playbooks, modules, or scripts: [Repositories](/user-guide/repositories).
   - SSH keys, tokens, and passwords: [Key Store](/user-guide/key-store).
   - Target hosts and connection settings: [Inventory](/user-guide/inventory).
   - Reusable variables: [Variable Groups](/user-guide/environment).
5. **Create a task template and run it.** Pick the guide for your tool: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell), or [Python](/user-guide/apps/python). Then run and watch it: [Tasks](/user-guide/tasks).
6. **Automate and operationalize:**
   - Run on a schedule: [Schedules](/user-guide/schedules).
   - Control who can do what: [Teams and custom roles](/user-guide/team).
   - Get alerted on results: [Notifications](/admin-guide/notifications).

## Key concepts {#key-concepts}

These terms appear everywhere in the UI.

| Term | Meaning |
|------|---------|
| **Project** | The main unit of separation. Each project has its own repositories, keys, inventories, templates, and team. [Projects](/user-guide/projects) |
| **Repository** | A Git repository or local path where playbooks, modules, or scripts live. [Repositories](/user-guide/repositories) |
| **Inventory** | Hosts, groups, and connection settings for Ansible-style runs. [Inventory](/user-guide/inventory) |
| **Variable Group** | Reusable variables and environment configuration, also called Environment. [Variable Groups](/user-guide/environment) |
| **Key Store** | Encrypted credentials such as SSH keys, tokens, and passwords. [Key Store](/user-guide/key-store) |
| **Task Template** | The definition of a run: app, repository, inventory, variables, and options. [Task Templates](/user-guide/task-templates) |
| **Task** | A single execution of a template, with its log and status. [Tasks](/user-guide/tasks) |
| **Workflow** | A graph of templates with branching, approvals, and delays. Pro feature. [Workflows](/user-guide/workflows) |
| **Runner** | Where tasks execute: the server itself or a remote runner. [Runners](/admin-guide/runners) |

## Next steps {#next-steps}

- Put Semaphore behind TLS with a [reverse proxy](/admin-guide/reverse-proxy).
- Connect your identity provider: [LDAP](/admin-guide/authentication/ldap) or [OpenID Connect](/admin-guide/authentication/openid).
- Drive Semaphore from CI or scripts with the [API](/reference/api) and [CLI](/reference/cli).
