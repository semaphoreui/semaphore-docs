# 在 Semaphore 中使用 Consul 动态清单

![Ansible 徽章](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Consul 徽章](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## 概述 {#overview}

本指南介绍如何在 Semaphore 中将 [HashiCorp Consul](https://www.consul.io/) 用作动态清单（Inventory）来源。无需手动列出主机，Ansible 会在运行时查询 Consul 的目录，以发现要操作的主机。

这种方式使用提交到 Git 仓库（Repository）中的 **Python 清单脚本**。Semaphore 在执行剧本时会自动运行该脚本。

## 前置条件 {#prerequisites}

- 一个正在运行且已注册节点的 Consul 集群
- 一个对目录拥有读取权限的 Consul ACL 令牌*（仅当启用了 [ACL](https://developer.hashicorp.com/consul/docs/security/acl) 时需要）*
- Semaphore 主机（或运行器）上已安装 Python 3
- 一个用于存放剧本和清单脚本的 Git 仓库

## 步骤 1 — 创建清单脚本 {#step-1--create-the-inventory-script}

在仓库中创建名为 `inventory/consul_inventory.py` 的文件。该脚本查询 Consul HTTP API，并以 Ansible 期望的格式返回主机信息。

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

将脚本设为可执行：

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
你可以自定义此脚本，按 Consul 节点元数据、服务标签或数据中心对主机进行分组。上面的示例只是一个最小的起点。
:::

## 步骤 2 — 设置仓库 {#step-2--set-up-your-repository}

你的仓库结构应如下所示：

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
这种方式仅使用 Python 标准库直接查询 Consul API。清单脚本无需任何额外的 Ansible 集合即可工作。
:::

一个简单的测试剧本（`playbook.yml`）：

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

将此仓库推送到你的 Git 服务提供商。

## 步骤 3 — 配置 Semaphore {#step-3--configure-semaphore}

### 添加变量组 {#add-a-variable-group}

清单脚本从环境变量中读取 Consul 地址和令牌。在 Semaphore 中创建一个变量组（Variable Group）来传递这些值。

1. 进入你的项目（Project），点击 **Variable Group**
2. 点击 **New Variable Group**
3. 为其命名（例如 `consul-inventory`）
4. 在 **Environment Variables** 下添加：
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token`*（仅当 Consul 集群启用了 [ACL](https://developer.hashicorp.com/consul/docs/security/acl) 时需要）*
5. 点击 **Create**

:::tip
如果你的 Consul 集群未启用 ACL，可以省略 `CONSUL_HTTP_TOKEN` 变量。清单脚本仍然可以工作——只是在 API 请求中不会发送认证令牌。
:::

### 添加仓库 {#add-the-repository}

1. 进入 **Repositories**，点击 **New Repository**
2. 输入仓库的 Git URL
3. 选择用于访问 Git 服务提供商的访问密钥
4. 点击 **Create**

### 添加清单 {#add-the-inventory}

1. 进入 **Inventory**，点击 **New Inventory**
2. 为其命名（例如 `consul-dynamic-inventory`）
3. 选择 **File** 作为类型
4. 输入路径：`inventory/consul_inventory.py`
5. 选择 Ansible 用于连接主机的 SSH 密钥
6. 点击 **Create**

:::note
该路径相对于 Git 仓库的根目录。Semaphore 会克隆仓库，并将此路径传递给 `ansible-playbook -i inventory/consul_inventory.py`。
:::

### 创建任务模板 {#create-a-task-template}

1. 进入**任务模板**（Task Templates），点击 **New Template**
2. 为其命名（例如 `Consul Hello World`）
3. 将 **Playbook** 设置为 `playbook.yml`
4. 选择上面创建的仓库、清单和变量组
5. 点击 **Create**

## 步骤 4 — 运行 {#step-4--run-it}

在任务模板上点击 **Run**。Semaphore 将会：

1. 克隆你的仓库
2. 使用你的 Consul 清单脚本执行剧本
3. 在任务日志中显示输出

你应该会看到类似如下的输出：

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## 按元数据对主机分组 {#grouping-hosts-by-metadata}

Consul 支持[节点元数据](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)——附加在每个节点上的键值对。你可以利用它们自动创建 Ansible 分组。

在脚本的 `build_inventory()` 函数中，设置主机变量之后添加以下代码：

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

这会创建诸如 `role_webserver`、`env_production` 或 `os_ubuntu` 的分组。然后你可以在剧本中针对它们进行操作：

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## 延伸阅读 {#further-reading}

- [Ansible 动态清单文档](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [Consul 目录 API](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Consul 节点元数据](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
