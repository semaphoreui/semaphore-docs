<div class="breadcrumbs">
    <a href="/user-guide/task-templates/">Task templates</a>
    → Terraform/OpenTofu
</div>

# Terraform/OpenTofu

Using Semaphore UI you can run Terraform code. To do this, you need to create a **Terraform Code Template**.

1. Go go Task Templates section and click the **New Template** button.


2. Set up the template and click the **Create** button.


3. You can now run your Terraform code.

---

## Workspaces

Semaphore supports Terraform/OpenTofu workspaces natively. See `Workspaces` for creating and switching workspaces and integrating SSH keys for private modules.

## Backend override and HTTP backend (Pro)

You can enable the option to override backend settings in a template to use the built-in HTTP backend without modifying your Terraform code. For using the HTTP backend outside of Semaphore, create a backend alias and add the generated address, username and password to your Terraform configuration. See `HTTP Backend (Pro)` for details.

## Destroy flag and state migration

The Terraform task form supports `-destroy` and `-migrate-state` flags. Use them when planning or destroying infrastructure, or when migrating state.