# Tutorial: Run Terraform or OpenTofu code

In this tutorial you will run your first Terraform (or OpenTofu) code with Semaphore UI. You will prepare a Git repository with a minimal configuration, connect it to a Semaphore project, create a **Terraform Code** task template, and apply the configuration — no cloud account or credentials required.

## Prerequisites

* A running Semaphore instance. See the [Quickstart](/getting-started/quickstart) if you do not have one yet.
* A [project](/user-guide/projects) created in Semaphore.
* The `terraform` or `tofu` binary available in the environment where Semaphore runs tasks.
* Internet access from the task environment, so `terraform init` can download the provider.
* A Git repository that the Semaphore server can reach (for example, a public repository on GitHub).

## Prepare the repository

The repository needs a single file: a Terraform configuration. This example uses the `local_file` resource, which only writes a file in the working directory, so it needs no cloud credentials.

```hcl title="main.tf"
terraform {
  required_providers {
    local = {
      source = "hashicorp/local"
    }
  }
}

resource "local_file" "hello" {
  filename = "${path.module}/hello.txt"
  content  = "Hello from Semaphore!\n"
}

output "file_path" {
  value = local_file.hello.filename
}
```

Commit and push the file to your repository.

## Create the template

First add the supporting resources (key and repository), then the template itself.

1. In the **Key Store** section, select **New Key**. Set the type to **None**, give it a name such as `no-auth`, and save it. This key is used to access a repository that requires no authentication.
2. In the **Repositories** section, select **New Repository**. Enter a name, the URL of your Git repository (for example `https://github.com/yourname/semaphore-demo.git`), the branch (usually `main`), and select the `no-auth` access key.
3. In the **Task Templates** section, select **New Template**, then **Terraform Code** (or **OpenTofu Code** if you use OpenTofu).
4. In the template form, fill in the fields:
   1. **Name** — for example `Hello Terraform`.
   2. **Subdirectory path (Optional)** — leave empty, because `main.tf` is in the repository root.
   3. **Workspace (Optional)** — leave empty to use the default workspace.
   4. **Repository** — the repository you created in step 2.
   5. Enable **Auto approve** so the apply runs without waiting for manual confirmation.
5. Select **Create**.

## Run the task and read the log

1. On the template page, select **Run**.
2. In the **New Task** dialog, optionally enter a value in **Message (Optional)**, then select **Run**.

The task log opens automatically. Semaphore clones the repository and runs `terraform init` automatically before the run, so you should see:

* the `local` provider being downloaded during initialization;
* a plan reporting `1 to add, 0 to change, 0 to destroy`;
* `Apply complete! Resources: 1 added, 0 changed, 0 destroyed.`;
* the `file_path` output pointing at the created `hello.txt`.

The task status turns to **Success**.

To tear the resource down, run the template again and enable the **Destroy** (`-destroy`) toggle in the **New Task** dialog. The dialog also offers **Plan**, **Auto Approve** (`-auto-approve`), **Upgrade** (`-upgrade`), and **Reconfigure** (`-reconfigure`) toggles.

## Next steps

* Pass input variables with [Variable Groups](/user-guide/environment) — prefix names with `TF_VAR_` so Terraform picks them up.
* Run the template automatically on a cron schedule with [Schedules](/user-guide/schedules).
* Ask for input at run time with [Survey Variables](/user-guide/task-templates/survey-vars).
* Learn about workspaces, backends, and state on the [Terraform/OpenTofu app page](/user-guide/apps/terraform/).
