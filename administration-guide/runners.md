---
description: Command line interface documentation
---

# Runners

Runners enable running tasks on a separate server from Ansible Semaphore.

Semaphore runners operate on the same principle as GitLab or GitHub Actions runners:

- You launch a runner on a separate server, specifying the Semaphore server's address and an authentication token.
- The runner connects to Semaphore and signals its readiness to accept tasks.
- When a new task appears, Semaphore provides all the necessary information to the runner, which, in turn, clones the repository and runs Ansible.
- The runner sends the task execution results back to Semaphore.

For end users, working with Semaphore with or without runners appears the same.

Using runners offers the following advantages:
- Executing tasks more securely. For instance, a runner can be located within a closed subnet.
- Distributing the workload across multiple servers. You can start multiple runners, and tasks will be randomly distributed among them.
