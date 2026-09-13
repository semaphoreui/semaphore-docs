---
title: Terragrunt
description: Prerequisites, template setup, and run options for Terragrunt code, including how Semaphore invokes terragrunt run.
---

# Terragrunt

[Terragrunt](https://terragrunt.gruntwork.io/) is a wrapper for Terraform and OpenTofu that keeps configurations DRY and manages dependencies between modules. Semaphore runs it the same way as [Terraform/OpenTofu](./terraform), with a few differences described here.

## Prerequisites {#prerequisites}

1. Install the `terragrunt` binary and a `terraform` or `tofu` binary on the Semaphore server or on the [runner](/admin-guide/runners) that executes the tasks.
2. Enable the **Terragrunt Code** application: it is disabled by default. Open **Applications** from the account menu and turn the switch on, see [Applications](/user-guide/apps).

## Creating a Terragrunt template {#creating-a-terragrunt-template}

1. Go to **Task Templates** and click **New Template**.
2. Select **Terragrunt Code** as the app.
3. Set the **Repository** and the subdirectory with your `terragrunt.hcl`.
4. Select or create a **Workspace** in the Inventory field. Terragrunt templates use inventories of the type `terragrunt-workspace`, see [Workspaces](./terraform/workspaces).
5. Click **Create**, then **Run**.

![Terragrunt template](/assets/templates-list.webp)

## Running tasks {#running-tasks}

The New Task dialog offers the same options as for Terraform: **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, and **Reconfigure**.

Semaphore calls `terragrunt run -- <terraform arguments>` and passes the Terraform or OpenTofu binary with `--tf-path`, unless you already set `--tf-path` in the template's CLI args. Workspace selection is performed with `terragrunt run -- workspace select -or-create=true <name>`.

Variables from the selected **Variable Groups** are passed as environment variables, so use the `TF_VAR_` prefix for input variables. Extra variables and survey variables are passed as `-var name=value` arguments.

## Notes {#notes}

- `terragrunt` runs `init` automatically before every command.
- The HTTP state backend and the state list on the **Workspaces** tab work as for Terraform, see [HTTP backend](./terraform/states).
- To use `run-all` across several modules, add the arguments in **CLI args** of the template.
