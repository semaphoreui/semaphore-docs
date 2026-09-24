---
title: User Guide
description: "For engineers who work inside a Semaphore project: resources, task templates, tasks, schedules, and team access."
---

# User Guide

This section is for people who already have access to a Semaphore project.
Everything here happens in the web interface or through the project API. Installing
the server, configuring it, and connecting an identity provider are covered in the
[Admin Guide](/admin-guide).

Work in Semaphore follows one chain. A **project** holds everything else. Inside it
you register the resources a run needs: a **repository** with your playbooks or
scripts, the **keys** used to reach it and your hosts, an **inventory** of target
machines, and **variable groups** with values and secrets. A **task template**
combines those into a definition of what to run, and every run of that template is
a **task**. Schedules, workflows, and incoming webhooks start templates for you.

## Set up a project {#set-up-a-project}

In this order, because each step depends on the previous one.

| Page | What it covers |
|---|---|
| [Projects](/user-guide/projects) | Creating a project, the sections in the sidebar, backup and restore. |
| [Teams](/user-guide/team) | The four built-in roles, and custom roles on Enterprise. |
| [Key Store](/user-guide/key-store) | SSH keys, logins, and external secret storages. |
| [Repositories](/user-guide/repositories) | Git repositories and local paths that hold your automation. |
| [Host config](/user-guide/host-config) | Credentials for Git hosts and repository URLs that the repository key does not cover: submodules, Galaxy roles, Terraform modules. |
| [Inventory](/user-guide/inventory) | Hosts and connection settings for Ansible, workspaces for Terraform. |
| [Variable Groups](/user-guide/environment) | Reusable variables and secrets passed into tasks. |

## Define and run work {#define-and-run-work}

| Page | What it covers |
|---|---|
| [Task Templates](/user-guide/task-templates) | Every field of the template form, plus template types. |
| [Apps](/user-guide/apps) | What each application runs: Ansible, Terraform, OpenTofu, Terragrunt, and scripts. |
| [Tasks](/user-guide/tasks) | Starting a task, task statuses, logs, stopping, and re-running. |
| [Schedules](/user-guide/schedules) | Running templates on a cron schedule. |
| [Workflows](/user-guide/workflows) | Chaining templates with approvals and branching. |
| [Integrations](/user-guide/integrations) | Starting tasks from incoming webhooks. |
| [Project runners](/user-guide/projects/runners) | Sending a project's tasks to your own runners. |
| [Your account](/user-guide/account) | Personal settings and API tokens. |

## Where to start {#where-to-start}

If someone has just added you to a project, read [Projects](/user-guide/projects)
to find your way around, then [Tasks](/user-guide/tasks) to run one and read its
log. If you are setting a project up from scratch, follow the table above in order.

New to Semaphore entirely? Start with [Getting Started](/getting-started).
