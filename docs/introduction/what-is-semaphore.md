---
title: What is Semaphore
description: What Semaphore UI does, the problems it solves, who it is for, and the cases where a different tool is the better choice.
---

# What is Semaphore

Semaphore UI is a self-hosted web interface and REST API for running automation that
you already have. You point it at a Git repository holding your Ansible playbooks,
Terraform configurations, or shell scripts, tell it which credentials and hosts to
use, and it becomes the one place where your team runs that automation, stores the
secrets it needs, and keeps a record of every run.

Semaphore does not replace Ansible, Terraform, or your scripts. It runs them, on a
server instead of on someone's laptop.

## The problem it solves {#the-problem-it-solves}

Automation usually starts on a workstation. One engineer has the playbook, the
inventory, the SSH key, and the right version of Ansible installed. That works until
a second person needs to run the same thing, or until someone asks what changed on a
host last Tuesday.

Semaphore moves the run to a shared server and adds the parts that were missing:

| Missing piece | What Semaphore provides |
|---|---|
| Everyone needs the tooling installed | One server (or a runner) has it; users only need a browser. |
| Credentials are copied between laptops | Encrypted [Key Store](/user-guide/key-store) that hands secrets to the run, never to the user. |
| No record of who ran what | Every [task](/user-guide/tasks) keeps its output, exit status, user, and time. |
| Nobody should have root to run one playbook | [Roles](/user-guide/team) decide who may run, edit, or only watch. |
| Runs happen when someone remembers | [Schedules](/user-guide/schedules), [webhooks](/user-guide/integrations), and API calls start them. |

## Who it is for {#who-it-is-for}

- **Infrastructure and platform teams** that already use Ansible or Terraform and want
  their colleagues to run it without handing out production credentials.
- **Small teams without a CI/CD platform**, who need scheduled and on-demand operational
  jobs but not a build pipeline.
- **Teams with a CI/CD platform** that want operational runs — restarts, deployments,
  certificate renewals — kept out of the build system and visible to people who do not
  read pipeline YAML.

Semaphore is self-hosted. There is no SaaS version: you run the binary or container on
your own infrastructure, and your secrets never leave it.

## What it runs {#what-it-runs}

Each [task template](/user-guide/task-templates) chooses an application:

- [Ansible](/user-guide/apps/ansible) — playbooks with inventories, vault passwords, and
  the full `ansible-playbook` option set.
- [Terraform, OpenTofu, and Terragrunt](/user-guide/apps/terraform) — plan and apply with
  workspaces and state held by your backend.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell), and
  [Python](/user-guide/apps/python) — anything that is not covered by the above.

Tasks run on the server itself or on [runners](/admin-guide/runners) placed close to the
systems they manage.

## When not to use it {#when-not-to-use-it}

Knowing the edges saves time later.

- **Building and testing source code.** Semaphore has no build artifacts, no matrix
  builds, no pull-request checks, and no container registry. Use GitHub Actions, GitLab
  CI, or Jenkins for that, and [start Semaphore tasks from them](/admin-guide/cicd) when
  a pipeline needs to touch infrastructure.
- **Replacing Ansible or Terraform.** Semaphore has no execution engine of its own. If
  your playbook does not work from a shell, it will not work from Semaphore.
- **Acting as a CMDB.** [Inventories](/user-guide/inventory) are the inventories your
  runs need, not a source of truth about your estate. Generate them from your real source
  with a dynamic inventory.
- **Being your organisation's secret manager.** Secrets are encrypted at rest and are
  designed to be used by tasks, not read back by people. If you already run HashiCorp
  Vault or another store, [connect it](/user-guide/key-store) rather than copying secrets in.
- **Running a single-node service where any downtime is unacceptable.** Multiple active
  nodes need [high availability](/admin-guide/ha), which is an Enterprise feature and
  requires PostgreSQL or MySQL plus Redis.

## What's next {#whats-next}

- [Architecture](/introduction/architecture) — the processes, the database, and where tasks execute.
- [Core concepts](/introduction/concepts) — the ten words the interface expects you to know.
- [Getting Started](/getting-started) — install it and run something.
