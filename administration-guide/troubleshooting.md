# Troubleshooting

## Gathering Facts issue for localhost

The issue can occur on Ansible Semaphore which installed via Snap or Docker.

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Why it happens

More information for localhost in Ansible read in article [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

Ansible tries to gathering facts locally, but Ansible localed in limited isolated container which doesn't allow this.

### How to fix

There are two ways:

1. Disable facts gathering:

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Explicit set conneciton type to **ssh**:
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```