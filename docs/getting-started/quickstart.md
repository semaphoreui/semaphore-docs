# Quickstart

In this tutorial you start Semaphore UI with Docker Compose, connect a public example repository, and run your first Ansible playbook. It takes about 15 minutes.

Prerequisites:

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.
- Outbound internet access (to pull the Docker image, clone the example repository, and let the example playbook ping an external host).

## Step 1: Start Semaphore with Docker Compose

This setup uses SQLite (supported in Semaphore v2.16+), so no separate database container is needed. For MySQL or PostgreSQL setups, see the [Docker installation guide](/admin-guide/installation/docker).

1. In an empty directory, create a file named `docker-compose.yml` with the following content:

   ```yaml
   services:
     semaphore:
       restart: unless-stopped
       ports:
         - 3000:3000
       image: semaphoreui/semaphore:latest
       environment:
         SEMAPHORE_DB_DIALECT: sqlite
         SEMAPHORE_DB: /etc/semaphore/semaphore.sqlite
         SEMAPHORE_ADMIN: admin
         SEMAPHORE_ADMIN_PASSWORD: changeme
         SEMAPHORE_ADMIN_NAME: admin
         SEMAPHORE_ADMIN_EMAIL: admin@localhost
         SEMAPHORE_ACCESS_KEY_ENCRYPTION: your_generated_key
       volumes:
         - semaphore-data:/etc/semaphore
   volumes:
     semaphore-data:
   ```

2. In a terminal, generate an encryption key and put it into the `SEMAPHORE_ACCESS_KEY_ENCRYPTION` value:

   ```bash
   head -c32 /dev/urandom | base64
   ```

   Also replace `changeme` with a password of your own.

3. In the same directory, start the container:

   ```bash
   docker compose up -d
   ```

**Expected result:** after the image is pulled and the container starts, the Semaphore login page is available at [http://localhost:3000](http://localhost:3000).

## Step 2: Log in

1. In your browser, open [http://localhost:3000](http://localhost:3000).
2. On the login page, enter the username `admin` and the password you set in `SEMAPHORE_ADMIN_PASSWORD`, then submit the form.

**Expected result:** you are logged in and Semaphore shows the **New Project** screen, because no projects exist yet.

## Step 3: Create a project

1. On the **New Project** screen, enter a project name, for example `Demo`.
2. Leave the **Create Demo Project** checkbox unchecked — in this tutorial you create each resource yourself.
3. Select **Create**.

**Expected result:** the project opens and its sections (Task Templates, Inventory, Variable Groups, Key Store, Repositories, and more) appear in the left navigation.

## Step 4: Check the None key

Every new project automatically contains a key named **None** of type `None`. It is a placeholder credential for resources that need no authentication, such as public repositories.

1. In the left navigation, select **Key Store**.

**Expected result:** the list contains a key named **None**. If it is missing, select **New Key**, enter the name `None`, choose the type **None**, and save it.

## Step 5: Add a repository

This tutorial uses the public example repository [semaphoreui/demo-project](https://github.com/semaphoreui/demo-project), which contains ready-to-run Ansible playbooks and scripts. Any public Git repository with a playbook works the same way.

1. In the left navigation, select **Repositories**.
2. In the upper right corner, select **New Repository**.
3. Fill in the form:
   - **Name**: `Demo`
   - **URL**: `https://github.com/semaphoreui/demo-project.git`
   - **Branch**: `main`
   - **Access Key**: `None`
4. Save the repository.

**Expected result:** the repository `Demo` appears in the list.

## Step 6: Create an inventory

The example playbooks in the demo repository target a host group named `site`, so the inventory below defines that group with a single entry: the container itself, using the `local` connection.

1. In the left navigation, select **Inventory**.
2. Select **New Inventory**.
3. Fill in the form:
   - **Name**: `Localhost`
   - **User Credentials**: `None` (a local connection needs no SSH credentials)
   - **Type**: **Static**
4. Enter the inventory content:

   ```ini
   [site]
   localhost ansible_connection=local
   ```

5. Save the inventory.

**Expected result:** the inventory `Localhost` appears in the list.

## Step 7: Create a task template

1. In the left navigation, select **Task Templates**.
2. Select **New template**, then **Ansible Playbook**.
3. Fill in the form:
   - **Name**: `Ping site`
   - **Path to playbook file**: `ping.yml`
   - **Inventory**: `Localhost`
   - **Repository**: `Demo`
   - **Variable Groups**: leave empty — this field is optional.
4. Save the template.

**Expected result:** the template `Ping site` opens, with an empty task history.

## Step 8: Run the task

1. On the template page, select **Run**.
2. In the **New Task** dialog, optionally enter a message, then select **Run**.

**Expected result:** a task log window opens and streams output live. Semaphore clones the repository, then runs `ansible-playbook`. The playbook pings `semaphoreui.com` and prints the result. The run ends with a `PLAY RECAP` line showing `failed=0` and the task status changes to Success.

## Step 9: Read the log

1. In the left navigation, select **Dashboard** — the task you just ran is listed with its status. Selecting the task reopens its log.
2. In the task log window, select **Raw log** to view the unprocessed output.

**Expected result:** you can revisit the full output of any past task. Task history is also shown on each template's page.

## Troubleshooting

### `fatal: [localhost]: FAILED!` during Gathering Facts

**Cause:** on some Docker and Snap installations, Ansible cannot gather facts about `localhost` because it runs in a limited, isolated container.

**Resolution:** in your own playbooks, set `gather_facts: false` for plays targeting `localhost`, or set the connection type to `ssh` and target a real host. See [Troubleshooting](/troubleshooting) for details.

## Next steps

- Follow the [tutorials](/getting-started/tutorials) to run more examples from the demo repository — `install_htop.yml`, `demo.sh` (Bash), `demo.py` (Python), or `demo.tf` (Terraform/OpenTofu) — and see the app guides for [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Bash](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell), and [Python](/user-guide/apps/python).
- Target real servers: add an [SSH key](/user-guide/key-store) and an [inventory](/user-guide/inventory) of your hosts.
- Automate runs with [Schedules](/user-guide/schedules) and [Integrations](/user-guide/integrations).
- Set up production-grade installation, authentication, and runners in the [Admin guide](/admin-guide/installation).
