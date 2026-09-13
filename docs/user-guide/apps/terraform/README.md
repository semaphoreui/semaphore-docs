---
title: Terraform/OpenTofu
description: How to run Terraform and OpenTofu code from a task template, pass TF_VAR_ variables, and use workspaces and the HTTP backend.
---

# Terraform/OpenTofu

Using Semaphore UI you can run Terraform code. To do this, you need to create a **Terraform Code Template**.

1. Go to **Task Templates** section and click the **New Template** button.
2. Select **Terraform** as the app type.
3. Set up the template and click the **Create** button.
4. Click **Run** to execute the template.

## Passing variables {#passing-variables}

Variables from the selected **Variable Groups** are injected as environment variables. Prefix names with `TF_VAR_` so Terraform picks them up as input variables:

| Variable Group key | Terraform variable |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

For sensitive values, use the **Secrets** tab in Variable Groups — they are encrypted at rest.

## Workspaces {#workspaces}

Semaphore supports Terraform/OpenTofu workspaces natively. See [Workspaces](./workspaces) for creating and switching workspaces and using SSH keys for private modules.

## Backend override and HTTP backend (Pro) {#backend-override-and-http-backend-pro}

You can override the backend in a template to use the built-in HTTP backend without modifying your Terraform code. See [HTTP Backend (Pro)](./states) for details.

## Destroy flag and state migration {#destroy-flag-and-state-migration}

The task run dialog includes toggles for `-destroy` and `-migrate-state`. Use them when tearing down infrastructure or migrating Terraform state.

## Notes {#notes}

- Semaphore runs `terraform init` automatically before each run.
- State is managed by whatever backend is configured in your Terraform code (local, S3, GCS, etc.) unless you use the built-in HTTP backend (Pro).