# Consul Dynamic Inventory with Semaphore

![Ansible Badge](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Consul Badge](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## Overview

This guide shows how to use [HashiCorp Consul](https://www.consul.io/) as a dynamic inventory source in Semaphore. Instead of manually listing hosts, Ansible will query Consul's catalog at runtime to discover which hosts to target.

This approach uses a **Python inventory script** committed to your git repository. Semaphore runs the script automatically when executing a playbook.

## Prerequisites

- A running Consul cluster with registered nodes
- A Consul ACL token with read access to the catalog *(only if [ACLs](https://developer.hashicorp.com/consul/docs/security/acl) are enabled)*
- Python 3 installed on the Semaphore host (or runner)
- A git repository to store your playbook and inventory script

## Step 1 — Create the Inventory Script

Create a file called `inventory/consul_inventory.py` in your repository. This script queries the Consul HTTP API and returns host information in the format Ansible expects.

```python
#!/usr/bin/env python3
"""
Consul dynamic inventory for Ansible.
Groups nodes by node_meta values and filters out unhealthy nodes.
"""

import json
import os
import sys
import urllib.request
import ssl

CONSUL_ADDR = os.environ.get("CONSUL_HTTP_ADDR", "https://consul.example.com")
CONSUL_TOKEN = os.environ.get("CONSUL_HTTP_TOKEN", "")


def consul_get(path):
    url = f"{CONSUL_ADDR}/v1/{path}"
    req = urllib.request.Request(url)
    if CONSUL_TOKEN:
        req.add_header("X-Consul-Token", CONSUL_TOKEN)
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read())


def is_healthy(node_name):
    """Return True if the node has a passing serfHealth check."""
    try:
        checks = consul_get(f"health/node/{node_name}")
        return any(
            c["CheckID"] == "serfHealth" and c["Status"] == "passing"
            for c in checks
        )
    except Exception:
        return False


def build_inventory():
    inventory = {"_meta": {"hostvars": {}}}
    all_hosts = []

    for node in consul_get("catalog/nodes"):
        name = node["Node"]

        if not is_healthy(name):
            continue

        all_hosts.append(name)
        inventory["_meta"]["hostvars"][name] = {
            "ansible_host": node["Address"],
            "ansible_user": "your_ssh_user",
            "ansible_python_interpreter": "/usr/bin/python3",
        }

    inventory["all"] = {"hosts": all_hosts}
    return inventory


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--host":
        print(json.dumps({}))
    else:
        print(json.dumps(build_inventory(), indent=2))
```

Make the script executable:

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
You can customise this script to group hosts by Consul node metadata, service tags, or datacenters. The example above is a minimal starting point.
:::

## Step 2 — Set Up Your Repository

Your repository should look like this:

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
This approach uses only the Python standard library to query the Consul API directly. No additional Ansible collections are required for the inventory script to work.
:::

A simple test playbook (`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

Push this repository to your git provider.

## Step 3 — Configure Semaphore

### Add a Variable Group

The inventory script reads the Consul address and token from environment variables. Create a Variable Group in Semaphore to pass these values.

1. Go to your project and click **Variable Group**
2. Click **New Variable Group**
3. Name it (e.g. `consul-inventory`)
4. Under **Environment Variables**, add:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(only required if [ACLs](https://developer.hashicorp.com/consul/docs/security/acl) are enabled on your Consul cluster)*
5. Click **Create**

:::tip
If your Consul cluster does not have ACLs enabled, you can omit the `CONSUL_HTTP_TOKEN` variable. The inventory script will still work — it simply won't send an authentication token with its API requests.
:::

### Add the Repository

1. Go to **Repositories** and click **New Repository**
2. Enter the git URL of your repository
3. Select the access key for your git provider
4. Click **Create**

### Add the Inventory

1. Go to **Inventory** and click **New Inventory**
2. Name it (e.g. `consul-dynamic-inventory`)
3. Select **File** as the type
4. Enter the path: `inventory/consul_inventory.py`
5. Select the SSH key that Ansible will use to connect to your hosts
6. Click **Create**

:::note
The path is relative to the root of your git repository. Semaphore clones the repo and passes this path to `ansible-playbook -i inventory/consul_inventory.py`.
:::

### Create a Task Template

1. Go to **Task Templates** and click **New Template**
2. Name it (e.g. `Consul Hello World`)
3. Set **Playbook** to `playbook.yml`
4. Select the repository, inventory, and variable group you created above
5. Click **Create**

## Step 4 — Run It

Click **Run** on your task template. Semaphore will:

1. Clone your repository
2. Execute the playbook using your Consul inventory script
3. Display the output in the task log

You should see output like:

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## Grouping Hosts by Metadata

Consul supports [node metadata](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta) — key-value pairs attached to each node. You can use these to create Ansible groups automatically.

Add this to the `build_inventory()` function in your script, after setting the host vars:

```python
        # Get node metadata
        node_detail = consul_get(f"catalog/node/{name}")
        meta = node_detail.get("Node", {}).get("Meta", {})

        # Group by metadata keys
        for key in ("role", "env", "os"):
            val = meta.get(key)
            if val:
                group = f"{key}_{val}"
                inventory.setdefault(group, {"hosts": []})
                inventory[group]["hosts"].append(name)
```

This creates groups like `role_webserver`, `env_production`, or `os_ubuntu`. You can then target them in your playbooks:

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Further Reading

- [Ansible Dynamic Inventory Documentation](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [Consul Catalog API](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Consul Node Metadata](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
