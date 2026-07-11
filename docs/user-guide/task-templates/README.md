# Task Templates

Templates define how to run Semaphore tasks. Currently the following task types are supported:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform)
* [Shell](/user-guide/apps/bash)
* [Powershell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

---

## Parallel tasks

By default, tasks from the same template execute sequentially. To allow concurrent runs of the same template, enable the "Allow parallel tasks" option in the template settings.
