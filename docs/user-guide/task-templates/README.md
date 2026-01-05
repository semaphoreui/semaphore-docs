# Task Templates

Templates define how to run Semaphore tasks. Currently the following task types are supported:

* [Ansible](./apps/ansible.md)
* [Terraform/OpenTofu](./apps/terraform.md)
* [Shell](./apps/bash.md)
* [Powershell](./apps/powershell.md)
* [Python](./apps/python.md)

---

## Parallel tasks

By default, tasks from the same template execute sequentially. To allow concurrent runs of the same template, enable the "Allow parallel tasks" option in the template settings.
