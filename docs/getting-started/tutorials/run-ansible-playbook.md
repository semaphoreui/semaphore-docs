# Tutorial: Run an Ansible playbook

In this tutorial you will run your first Ansible playbook with Semaphore UI. You will prepare a Git repository with a minimal playbook, connect it to a Semaphore project, create an **Ansible Playbook** task template, and run it against `localhost` — no remote servers or SSH keys required.

## Prerequisites

* A running Semaphore instance. See the [Quickstart](/getting-started/quickstart) if you do not have one yet.
* A [project](/user-guide/projects) created in Semaphore.
* Ansible available in the environment where Semaphore runs tasks (the official Docker image already includes it).
* A Git repository that the Semaphore server can reach (for example, a public repository on GitHub).

## Prepare the repository

The repository needs a single file: a playbook. This example pings the host and prints a message. It sets `gather_facts: false` so it also works in minimal environments (such as Docker installs) where local fact gathering can fail.

```yaml title="playbook.yml"
---
- name: Test Semaphore
  hosts: all
  gather_facts: false
  tasks:
    - name: Ping the host
      ansible.builtin.ping:

    - name: Print a message
      ansible.builtin.debug:
        msg: "Hello from Semaphore!"
```

Commit and push the file to your repository.

## Create the template

First add the supporting resources (keys, repository, inventory), then the template itself.

1. In the **Key Store** section, select **New Key**. Set the type to **None**, give it a name such as `no-auth`, and save it. This key is used to access a repository that requires no authentication.
2. In the **Key Store** section, select **New Key** again. Set the type to **Login with password** and give it a name such as `localhost-user`. The Inventory form requires a user credential; for a local connection it is not used to log in anywhere.
3. In the **Repositories** section, select **New Repository**. Enter a name, the URL of your Git repository (for example `https://github.com/yourname/semaphore-demo.git`), the branch (usually `main`), and select the `no-auth` access key.
4. In the **Inventory** section, select **New Inventory**. Enter a name, select `localhost-user` as **User Credentials**, choose the **Static** type, and paste the following inventory:

   ```
   localhost ansible_connection=local
   ```

5. In the **Task Templates** section, select **New Template**, then **Ansible Playbook**.
6. In the template form, fill in the fields:
   1. **Name** — for example `Hello Ansible`.
   2. **Path to playbook file** — `playbook.yml`.
   3. **Inventory** — the inventory you created in step 4.
   4. **Repository** — the repository you created in step 3.
7. Select **Create**.

## Run the task and read the log

1. On the template page, select **Run**.
2. In the **New Task** dialog, optionally enter a value in **Message (Optional)**, then select **Run**.

The task log opens automatically. First Semaphore clones the repository, then it starts `ansible-playbook`. You should see:

* `ok: [localhost]` for both the ping and the debug task;
* the message `Hello from Semaphore!` in the debug output;
* a `PLAY RECAP` line ending with `ok=2 ... failed=0`.

The task status turns to **Success**. If it fails instead, the log shows the exact Ansible error — the most common causes are a wrong playbook path or an unreachable repository URL.

## Next steps

* Pass variables to your playbooks with [Variable Groups](/user-guide/environment).
* Run the template automatically on a cron schedule with [Schedules](/user-guide/schedules).
* Ask for input at run time with [Survey Variables](/user-guide/task-templates/survey-vars).
* Learn about template types, tags, limits, and vaults on the [Ansible app page](/user-guide/apps/ansible).
