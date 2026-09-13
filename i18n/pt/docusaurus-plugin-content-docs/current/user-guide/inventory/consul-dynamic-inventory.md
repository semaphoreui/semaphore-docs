# Inventário Dinâmico do Consul com o Semaphore

![Badge do Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Badge do Consul](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## Visão geral {#overview}

Este guia mostra como usar o [HashiCorp Consul](https://www.consul.io/) como fonte de inventário dinâmico no Semaphore. Em vez de listar os hosts manualmente, o Ansible consultará o catálogo do Consul em tempo de execução para descobrir quais hosts devem ser alvo.

Essa abordagem usa um **script de inventário em Python** commitado no seu repositório git. O Semaphore executa o script automaticamente ao executar um playbook.

## Pré-requisitos {#prerequisites}

- Um cluster Consul em execução com nós registrados
- Um token ACL do Consul com acesso de leitura ao catálogo *(somente se as [ACLs](https://developer.hashicorp.com/consul/docs/security/acl) estiverem habilitadas)*
- Python 3 instalado no host do Semaphore (ou no runner)
- Um repositório git para armazenar seu playbook e o script de inventário

## Passo 1 — Crie o Script de Inventário {#step-1--create-the-inventory-script}

Crie um arquivo chamado `inventory/consul_inventory.py` no seu repositório. Esse script consulta a API HTTP do Consul e retorna as informações dos hosts no formato esperado pelo Ansible.

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

Torne o script executável:

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
Você pode personalizar esse script para agrupar hosts por metadados de nó do Consul, tags de serviço ou datacenters. O exemplo acima é um ponto de partida mínimo.
:::

## Passo 2 — Configure Seu Repositório {#step-2--set-up-your-repository}

Seu repositório deve ficar assim:

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
Essa abordagem usa apenas a biblioteca padrão do Python para consultar a API do Consul diretamente. Nenhuma coleção adicional do Ansible é necessária para que o script de inventário funcione.
:::

Um playbook de teste simples (`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

Envie esse repositório para o seu provedor git.

## Passo 3 — Configure o Semaphore {#step-3--configure-semaphore}

### Adicione um Grupo de Variáveis {#add-a-variable-group}

O script de inventário lê o endereço e o token do Consul a partir de variáveis de ambiente. Crie um Grupo de Variáveis no Semaphore para passar esses valores.

1. Vá para o seu projeto e clique em **Grupo de Variáveis**
2. Clique em **Novo Grupo de Variáveis**
3. Dê um nome a ele (por exemplo, `consul-inventory`)
4. Em **Variáveis de Ambiente**, adicione:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(necessário apenas se as [ACLs](https://developer.hashicorp.com/consul/docs/security/acl) estiverem habilitadas no seu cluster Consul)*
5. Clique em **Criar**

:::tip
Se o seu cluster Consul não tiver ACLs habilitadas, você pode omitir a variável `CONSUL_HTTP_TOKEN`. O script de inventário continuará funcionando — ele simplesmente não enviará um token de autenticação nas requisições à API.
:::

### Adicione o Repositório {#add-the-repository}

1. Vá para **Repositórios** e clique em **Novo Repositório**
2. Insira a URL git do seu repositório
3. Selecione a chave de acesso do seu provedor git
4. Clique em **Criar**

### Adicione o Inventário {#add-the-inventory}

1. Vá para **Inventário** e clique em **Novo Inventário**
2. Dê um nome a ele (por exemplo, `consul-dynamic-inventory`)
3. Selecione **Arquivo** como o tipo
4. Insira o caminho: `inventory/consul_inventory.py`
5. Selecione a chave SSH que o Ansible usará para se conectar aos seus hosts
6. Clique em **Criar**

:::note
O caminho é relativo à raiz do seu repositório git. O Semaphore clona o repositório e passa esse caminho para `ansible-playbook -i inventory/consul_inventory.py`.
:::

### Crie um Modelo de Tarefa {#create-a-task-template}

1. Vá para **Modelos de Tarefa** e clique em **Novo Modelo**
2. Dê um nome a ele (por exemplo, `Consul Hello World`)
3. Defina **Playbook** como `playbook.yml`
4. Selecione o repositório, o inventário e o grupo de variáveis que você criou acima
5. Clique em **Criar**

## Passo 4 — Execute {#step-4--run-it}

Clique em **Executar** no seu modelo de tarefa. O Semaphore irá:

1. Clonar seu repositório
2. Executar o playbook usando seu script de inventário do Consul
3. Exibir a saída no log da tarefa

Você deverá ver uma saída como esta:

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## Agrupando Hosts por Metadados {#grouping-hosts-by-metadata}

O Consul oferece suporte a [metadados de nó](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta) — pares chave-valor anexados a cada nó. Você pode usá-los para criar grupos do Ansible automaticamente.

Adicione isto à função `build_inventory()` no seu script, após definir as variáveis do host:

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

Isso cria grupos como `role_webserver`, `env_production` ou `os_ubuntu`. Você pode então direcioná-los nos seus playbooks:

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Leitura Adicional {#further-reading}

- [Documentação de Inventário Dinâmico do Ansible](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [API de Catálogo do Consul](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Metadados de Nó do Consul](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
