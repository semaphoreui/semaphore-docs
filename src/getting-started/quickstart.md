# Quick Start

Follow this walkthrough to get Semaphore UI running on your workstation and execute a simple automation task. The steps take around 10–15 minutes and require no prior knowledge of the platform.

## 1. Pick an install method

Choose the option that best fits your environment:

| When to use | Recommended guide |
| --- | --- |
| You want an isolated test environment in minutes | [Docker install](../administration-guide/installation/docker.md)
| You prefer native binaries and system integration | [Binary install](../administration-guide/installation/binary-file.md)
| You run on Kubernetes and want to evaluate at cluster scale | [Helm chart](../administration-guide/installation/k8s.md)

> Need another option (package manager, cloud images, manual install)? See the full [Installation overview](../administration-guide/installation.md).

After installation, run the `semaphore` binary (or container) and browse to `http://localhost:3000` to complete the initial setup wizard.

## 2. Complete the setup wizard

Semaphore walks you through the steps below:

1. Create the first administrator user.
2. Provide database connection details.
3. Generate or supply an encryption key (used for secrets).
4. Confirm SMTP settings if you want email alerts. You can skip this for a quick evaluation.

The wizard produces a configuration file on disk. You can always adjust it later using the [configuration reference](../administration-guide/configuration.md).

## 3. Create a sandbox project

Once you sign in, create a project to hold your automation assets:

1. Go to **Projects → New Project**.
2. Give it a name like `Demo Project` and keep the default repository and inventory settings.
3. After the project opens, note the tabs across the top: **Task Templates**, **Tasks**, **Schedules**, **Access Keys**, **Repositories**, **Inventory**, and **Environment**.

Projects let you scope permissions and integrations. Learn more in the [Projects overview](../user-guide/projects.md).

## 4. Add a repository and key

You can use any Git repository with an Ansible playbook or shell script. For a quick test, use a public sample playbook.

1. Navigate to **Repositories → Add Repository**.
2. Select `Git`, paste the repository URL (for example, `https://github.com/semaphoreui/semaphore-demo`), and save.
3. If the repository is private, create an access key under **Key Store** and reference it here. Keys and tokens are encrypted at rest; see [Key Store](../user-guide/key-store.md).

## 5. Define a task template

Task templates describe what Semaphore will run.

1. Open **Task Templates → New Template**.
2. Choose **Ansible Playbook** (or another executor you prefer).
3. Select the repository and playbook path (e.g. `site.yml`).
4. Pick an inventory (the default `Static Inventory` works for local demos) and click **Create**.

Read more in the [Task Templates guide](../user-guide/task-templates/README.md).

## 6. Run and inspect the task

1. In the template list, click **Run**.
2. Provide optional variables or confirmations, then start the task.
3. Observe the live output and status indicators.
4. After completion, review the log, duration, and host results. You can download logs or re-run from the same page.

The [Tasks guide](../user-guide/tasks.md) explains status codes, log retention, and re-run behavior.

## 7. Keep going

You now have a functioning Semaphore environment. Continue with:

* [Core Concepts](./concepts.md) to understand how projects, inventories, templates, and permissions fit together.
* [UI Tour](./ui-tour.md) for a guided walkthrough of navigation, filters, and dashboards.
* [Next Steps](./next-steps.md) to move from a sandbox to a shared or production deployment.
