---
title: Get Started
description: Install Semaphore UI and run, inspect, and schedule your first Ansible task.
sidebar_label: Get Started
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Get Started

Semaphore UI is a web interface and API for running repeatable automation with Ansible, Terraform/OpenTofu, Bash, PowerShell, and Python. It brings together automation stored in Git, credentials, variables, schedules, workflows, and execution environments, then keeps the status and log for every run.

This guide uses Ansible for the first working example. Use a playbook from your own repository, or follow the reproducible example shown in the screenshots with the public [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo) repository.

<div className="VideoEmbed">
  <iframe
    src="https://www.youtube-nocookie.com/embed/LVKwud2Wno4"
    title="Semaphore UI Quickstart: Install, Run & Schedule Ansible"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    referrerPolicy="strict-origin-when-cross-origin"
    allowFullScreen
  ></iframe>
</div>

## 1. Install Semaphore

Choose the installation method that matches where Semaphore will run. The native package is selected by default.

<Tabs groupId="installation-method">
  <TabItem value="package" label="Native package" default className="InstallationMethod">

For Debian or Ubuntu on `amd64`:

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

For RHEL, Fedora, Rocky Linux, AlmaLinux, or CentOS Stream on `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

Configure the database and first administrator, then start Semaphore with the generated configuration:

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

For a local evaluation, choose SQLite, accept or set the database and playbook paths, enter the public URL, and create the first administrator when prompted.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

Create `compose.yaml`:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

Generate an encryption key, then put it and a strong administrator password in a `.env` file beside `compose.yaml`:

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

Keep `.env` out of version control and start the container:

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="Binary archive" className="InstallationMethod">

Download the archive for your operating system and CPU architecture from [GitHub Releases](https://github.com/semaphoreui/semaphore/releases). Linux `amd64` example:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

For a local evaluation, choose SQLite, accept or set the database and playbook paths, enter the public URL, and create the first administrator when prompted.

Choose a `darwin` archive for macOS or a `.zip` for Windows. The Ansible walkthrough later in this guide still needs a Linux, macOS, WSL, container, or Linux runner execution environment with Ansible installed.

  </TabItem>
  <TabItem value="helm" label="Kubernetes with Helm" className="InstallationMethod">

Add the official chart and inspect its defaults before installing:

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

The chart's `appVersion` identifies the Semaphore version. Configure persistent storage, the database, administrator credentials, the access-key encryption key, and ingress/TLS in `values.yaml` before production use.

  </TabItem>
</Tabs>


For a guided setup, use the official [Semaphore Installation page](https://semaphoreui.com/install) to select the release, build the configuration, and get the matching download or run commands.

<details>
<summary>Not sure which installation method to choose?</summary>

| Installation method | Choose it for | Detailed guide |
| --- | --- | --- |
| **Native package** | A supported Linux server | [Package manager installation](/admin-guide/installation/package-manager) |
| **Docker Compose** | A quick isolated setup or container host | [Docker installation](/admin-guide/installation/docker) |
| **Binary archive** | macOS, Windows, FreeBSD, or Linux without a suitable package | [Binary installation](/admin-guide/installation/binary-file) |
| **Kubernetes with Helm** | An existing Kubernetes cluster | [Kubernetes installation](/admin-guide/installation/k8s) |

The detailed guides cover production databases, services, secrets, storage, ingress, and upgrades.

</details>

For this Ansible walkthrough, `git --version` and `ansible-playbook --version` must work on the Semaphore server or runner. If either command is unavailable there, install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) before continuing.

:::tip Production installation
Before using Semaphore in production, review [Configuration](/admin-guide/configuration), [Security](/admin-guide/security), [Runners](/admin-guide/runners), [High availability](/admin-guide/ha), and [Upgrading](/admin-guide/upgrading).
:::

## 2. Sign in

1. Open Semaphore in a browser. A local installation normally uses [http://localhost:3000](http://localhost:3000).
2. Enter the administrator login and password created by `semaphore setup` or the Docker administrator variables.
3. Select **Sign In**.

![Semaphore sign-in screen](/assets/getting-started/sign-in.jpg)

Use the administrator account for the first setup because it can create projects and users. Regular users sign in on the same page after an administrator creates their account and grants project access. See [User management](/user-guide/admin/users).

## 3. Create a project

After you sign in to an empty Semaphore instance, the **New Project** page opens automatically. If projects already exist, open the project selector and select **New Project...**. Complete the form:

| Field | What to enter |
| --- | --- |
| **Project Name** | A recognizable workspace name, for example `Production infrastructure` or your application name. |
| **Max number of parallel tasks** | Optional. Limits simultaneous tasks in this project; leave it empty to use the server limit. |
| **Telegram Chat ID** | Optional. Used when Telegram notifications are configured for the project. |
| **Allow alerts for this project** | Optional. Enables configured project notifications. |
Select **Create**.

Do not select **Create Demo Project**: it adds sample resources, while this guide builds a clean project. When you create another project later, the same option appears as a **Demo** switch in the New Project dialog.

![Empty New Project form with all available fields](/assets/getting-started/new-project-empty.jpg)

The new project opens with sections for **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store**, and **Repositories**. See [Projects](/user-guide/projects) for project settings, team access, activity, and history.

<details>
<summary>Watch this step</summary>

![Creating the first project on an empty Semaphore instance](/assets/getting-started/create-first-project.gif)

</details>

## 4. Understand the core concepts

The new project opens on an empty Dashboard. The sidebar is the main navigation for this project:

![Clean Semaphore project interface before resources and tasks are added](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** shows run history, statistics, activity, and project settings.
- **Task Templates**, **Workflows**, and **Schedule** define what runs and when.
- **Repositories**, **Inventory**, **Variable Groups**, and **Key Store** provide code, targets, variables, and credentials.
- **Integrations**, **Team**, and **Runners** connect external systems, users, and execution hosts.

The diagram shows how these resources produce a run:

<div class="BlockSchema">
  ![How Semaphore resources and triggers become a task run](/assets/getting-started/core-concepts.svg)
</div>

A UI action, API request, or schedule can start a **Task Template** directly or start a **Workflow** that uses task templates. Semaphore creates a task run—shown as a **Task** in the UI—and sends it to the Semaphore server or an eligible remote runner. For Ansible, that execution host runs `ansible-playbook`; the Inventory lists the systems Ansible manages.

| Concept | What it does |
| --- | --- |
| [**Project**](/user-guide/projects) | An isolated workspace containing automation resources, permissions, and run history. |
| [**Repository**](/user-guide/repositories) | Points to the Git branch or tag containing the automation files used by a task. |
| [**Key Store**](/user-guide/key-store) | Stores reusable SSH keys, login credentials, tokens, and Ansible Vault passwords outside Git and task input. |
| [**Inventory**](/user-guide/inventory) | Tells Ansible which hosts and groups to manage and which credentials to use. |
| [**Variable Group**](/user-guide/environment) | Stores reusable Ansible variables, environment variables, and secrets for one or more templates. |
| [**Task Template**](/user-guide/task-templates/) | Saves what to run: automation type, file, repository, inventory, variables, prompts, and execution options. |
| [**Task (task run)**](/user-guide/tasks) | One execution, with its own inputs, status, timestamps, log, details, and result. |
| **Workflow** | Connects task templates into a multi-step path with success, failure, approval, and note branches. |
| [**Schedule**](/user-guide/schedules) | Starts a task template or workflow once or repeatedly from a cron expression. |
| [**Runner**](/admin-guide/runners) | Runs queued tasks outside the main Semaphore server, for example in another network or security boundary. |

## 5. Connect the repository

A Repository connects Semaphore to automation stored in Git; Semaphore does not store the playbook itself. Connect your own repository, or use the public demo values below to follow the example exactly. [Integrations](/user-guide/integrations) are a separate feature for starting automation from GitHub, GitLab, or another webhook source.

1. Open **Repositories** and select **New Repository**.
2. Enter your repository name, URL, branch, and credential. If you are following the public demo, use:

   | Field | Value |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None` because this repository is public |

3. Select **Create**.

![Repository form filled with the public Semaphore demo repository](/assets/getting-started/repository-settings.jpg)

Your repository should now appear in the list. Semaphore clones or updates it on the execution host when a task starts, not when you create the Repository record. The screenshot shows the demo values used in this guide.

![Connected Demo repository in the project repository list](/assets/getting-started/connected-repository.jpg)

For a private repository, select a suitable Key Store credential instead of `None`. See [Repositories](/user-guide/repositories) for local paths, HTTPS, SSH, branches, credentials, and requirements files.

## 6. Add an SSH key for a remote managed host

This SSH credential lets Ansible connect from the Semaphore server or runner to a remote host in the Inventory. If you are following the `localhost` demo, no SSH key is needed; continue to step 7.

The demo uses `localhost` with `ansible_connection=local`, so it does not open an SSH connection. When your own playbook manages a remote host, add its key:

1. Add the public half of the key to `~/.ssh/authorized_keys` on the managed host.
2. Open **Key Store** and select **New Key**.
3. Enter a recognizable name, for example `Production hosts`, keep **Local** selected, and choose **SSH Key**.
4. Enter the account Ansible should use on the host, for example `ubuntu` or `ec2-user`.
5. Paste the complete private key, including its `BEGIN` and `END` lines, and add the passphrase when required.
6. Select **Create**. In the next step, choose this key under **Inventory → User Credentials**.

![New SSH Key form for the account used on managed hosts](/assets/getting-started/add-managed-host-ssh-key.jpg)

The screenshot contains a placeholder, not a working secret. Never publish a private key in documentation, screenshots, task arguments, or source control.

Semaphore can store secrets locally or use external secret-storage integrations such as [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) and [Devolutions Server](/user-guide/key-store/devolutions-server). See [Key Store](/user-guide/key-store) for all supported credential types and storage options.

## 7. Create the Ansible inventory

Every Ansible task needs an inventory. For a first local run, add a file such as `inventory.ini` to your repository:

```ini
[local]
localhost ansible_connection=local
```

Here, `localhost` means the execution host—the Semaphore server, container, or runner—not necessarily the computer where your browser is open. `ansible_connection=local` tells Ansible not to use SSH. The demo repository uses the equivalent file `invs/prod/hosts` with a group named `site`.

If you created `inventory.ini` in your own repository, commit and push it to the branch connected to Semaphore before continuing.

1. Open **Inventory** and select **New Inventory → Ansible Inventory**.
2. Enter values that match your inventory. For example:

   | Field | Value |
   | --- | --- |
   | **Name** | `Local` (`Prod` in the demo) |
   | **User Credentials** | `None` for `localhost`; use your host SSH credential for a remote inventory |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini` (`invs/prod/hosts` in the demo) |

3. Leave **Runner tag**, **Sudo Credentials**, and **Repository** empty, then select **Create**.

![Ansible file inventory configured with the demo repository values](/assets/getting-started/ansible-inventory-settings.jpg)

Leaving **Repository** empty means Semaphore resolves this relative inventory path from the Repository selected in the Task Template. Select a Repository here only when the inventory lives elsewhere. For a remote host, use the SSH key from step 6 as **User Credentials**.

See [Inventory](/user-guide/inventory) for static, file-based, and dynamic inventories.

## 8. Add a Variable Group (optional)

A **Variable Group** is a reusable set of values that you can attach to one or more Task Templates. Use **Extra variables** for Ansible variables, **Environment variables** for values exported to the process, and **Secrets** for sensitive values that should be encrypted and masked. This keeps environment-specific configuration out of the playbook and avoids entering the same values in every template.

The first task works without a Variable Group. As an example, create one that sets `ansible_python_interpreter=auto_silent`; Ansible will still discover Python automatically but will not print its informational discovery warning.

1. Open **Variable Groups** and select **New Group**.
2. Set **Group Name** to a descriptive name, for example `Ansible defaults`.
3. Under **Variables → Extra variables**, keep **Table** selected and select **+**.
4. Enter:

   | Name | Type | Value |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. Select **Save**.

![Variable Group configured in the table editor](/assets/getting-started/variable-group-table.jpg)

See [Variable Groups](/user-guide/environment) for precedence rules and secret-storage options.

## 9. Create the Ansible task template

### Review the playbook in Git

If the repository you connected already contains an Ansible playbook, use it. Otherwise, add a small example such as `get-started.yml`:

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

If you are following the demo, use its [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml) instead. It targets the demo inventory's `site` group and runs the included `ping` role.

The demo downloads that role from a Git submodule and sends one ICMP request to `semaphoreui.com`, so the execution host needs GitHub access and outbound ICMP. If ICMP is blocked, use the local `get-started.yml` example instead.

![ping.yml in the connected GitHub repository](/assets/getting-started/demo-playbook-github.jpg)

The screenshot shows the playbook in the public demo repository. Keeping automation in Git makes changes reviewable and lets Semaphore record the exact commit used for each run.

If you created `get-started.yml` in your own repository, commit and push it to the branch connected to Semaphore before continuing.

### Configure the template

1. Open **Task Templates** and select **New template → Applications**.
2. Enable **Ansible Playbook**, then return to **Task Templates**.
3. Select **New template → Ansible Playbook**.
4. Keep the **Task** tab selected. **Build** and **Deploy** are versioned CI/CD template types and are not needed for this independent run.
5. Configure the template with values that match your files. For example:

   | Field | Value | Why it matters |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | Identifies the reusable template and its task history. |
   | **Repository** | Your repository (`Demo` in the example) | Supplies the playbook and related files. |
   | **Path to playbook file** | `get-started.yml` (`ping.yml` in the demo) | Resolves from the repository root. |
   | **Inventory** | `Local` (`Prod` in the demo) | Supplies the local target for this first run. |
   | **Variable Groups** | `Ansible defaults`, if created | Adds the optional reusable Ansible setting. |
   | **Runner tag** | Leave empty | Uses local execution or the default runner, depending on server configuration. |

6. Under **Ansible options**, enable **Skip Galaxy install** for the small playbook above or the public demo: neither needs Galaxy dependencies for this task. Leave it off when your own repository requires roles or collections from a `requirements.yml` file.
7. Select **Create**.

![Ansible task template with its repository, inventory, and Variable Group](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>Watch this step</summary>

![Enabling Ansible and creating the first Ansible task template](/assets/getting-started/create-ansible-template.gif)

</details>

Other useful fields include:

- **Vaults** selects Key Store passwords for encrypted Ansible content.
- **Limit**, **Tags**, and **Skip tags** narrow what the playbook runs.
- **Prompts** allow a UI user, schedule, or API request to override enabled values for a specific run.
- **Runner tag** controls where the task executes; it does not select an Ansible target.

See [Ansible templates](/user-guide/apps/ansible) and [Task Templates](/user-guide/task-templates/) for all fields and execution options.

## 10. Run the template and inspect the task

1. Open the Task Template you created and select **Run**.
2. Add an optional message such as `First Semaphore run`.
3. Leave **Dry Run** and **Diff** off, then select **Run**.

![Clean New Task dialog for the Ansible playbook](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore queues the task, prepares the repository, applies the inventory and optional Variable Group, and runs the selected playbook. The status moves through **Waiting** and **Running** before finishing as **Success** or **Failed**.

### Log

**Log** is the source of truth for command output. Read the final `PLAY RECAP`, not only the green status badge.

![Successful Ansible task log with ping output and PLAY RECAP](/assets/getting-started/ansible-task-log-variable-group.jpg)

The exact counters depend on your playbook. A successful first run should end with `unreachable=0` and `failed=0` for `localhost`. If the demo log shows `changed=1`, it means its shell-based ping step ran and reported a change; it is not an error.

### Details and Summary

| Tab | What to check |
| --- | --- |
| **Log** | Live execution phases, module output, errors, and the final `PLAY RECAP`. |
| **Details** | Template type, Git commit, run message, author, timestamps, and duration. |
| **Summary** | Host-level Ansible results and errors after completion, when the task-summary feature is available. |

![Task Details with template, commit, and timing information](/assets/getting-started/ansible-task-details.jpg)

![Task Summary with OK and Not OK host counts](/assets/getting-started/ansible-task-summary.jpg)

If **Summary** is unavailable, verify the run in **Log**; `PLAY RECAP` remains the authoritative Ansible result.

<details>
<summary>Watch the run and result</summary>

![Running the Ansible task and inspecting its log and details](/assets/getting-started/run-and-inspect-task.gif)

</details>

### Find previous runs

Close the task window to return to the template's **Tasks** tab. Every run has its own task number, status, user, start time, duration, and preserved log. **Dashboard → History** shows runs from every template in the project. See [Tasks](/user-guide/tasks) and [Project history](/user-guide/projects/history) for more detail.

![Ansible template history with successful task runs](/assets/getting-started/ansible-template-history.jpg)

If the task fails, use the last meaningful Log line to choose the next check:

- A clone error points to the repository URL, branch, Access Key, or network access from the execution host.
- `ansible-playbook: command not found` means Ansible is missing from the Semaphore server or selected runner.
- `UNREACHABLE` points to inventory addressing, host credentials, SSH reachability, or host-key verification.
- A failed Ansible step normally includes its task name, host, and module error immediately above `PLAY RECAP`.

## 11. Run the task on a schedule

After the task succeeds from the UI, you can run it automatically. For example, the cron expression `0 3 * * *` starts it every day at 03:00 in the timezone shown by Semaphore.

1. Open **Schedule** and select **New Schedule → Cron**.
2. Enter a descriptive name, for example `Nightly playbook`.
3. Select the Task Template you want to run.
4. Keep **Show cron format** enabled and enter a cron expression, for example `0 3 * * *`.
5. Keep **Enabled** selected and choose **Save**.

![Cron schedule configured to run the example task every day at 03:00](/assets/getting-started/create-cron-schedule.jpg)

Semaphore shows the configured timezone and calculates the next run before you save. A scheduled run uses the same repository, inventory, Variable Groups, and execution settings as the template. If the template exposes prompts, the schedule can provide values for them. See [Schedules](/user-guide/schedules) for cron syntax, timezone configuration, one-time runs, and scheduled parameters.

After saving, verify that the schedule is **Enabled** and that **Next run** shows the expected time. Scheduled tasks appear in the template's **Tasks** tab and in **Dashboard → History**.

## What to try next

Once the first Ansible task succeeds:

- Add the appropriate private credential in [Key Store](/user-guide/key-store) when your Repository requires authentication.
- Build a **Workflow** when several templates need ordered success, failure, approval, or note paths.
- Use [Integrations](/user-guide/integrations) for authenticated webhook triggers from GitHub, GitLab, or another system.
- Use the [API](/reference/api) to manage resources and start templates programmatically.
- Add a [remote runner](/admin-guide/runners) when execution must happen in another network, operating system, or security boundary.

For production, put Semaphore behind HTTPS, back up the database and access-key encryption secret together, configure centralized authentication, and review [Security](/admin-guide/security), [Logs](/admin-guide/logs), and [Upgrading](/admin-guide/upgrading).
