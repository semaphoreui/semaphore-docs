# Inventory dinamico Consul con Semaphore

![Badge Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Badge Consul](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## Panoramica {#overview}

Questa guida mostra come utilizzare [HashiCorp Consul](https://www.consul.io/) come sorgente di inventory dinamico in Semaphore. Invece di elencare manualmente gli host, Ansible interrogherà il catalogo di Consul in fase di esecuzione per individuare gli host di destinazione.

Questo approccio utilizza uno **script di inventory in Python** sottoposto a commit nel repository git. Semaphore esegue automaticamente lo script durante l'esecuzione di un playbook.

## Prerequisiti {#prerequisites}

- Un cluster Consul in esecuzione con nodi registrati
- Un token ACL Consul con accesso in lettura al catalogo *(solo se le [ACL](https://developer.hashicorp.com/consul/docs/security/acl) sono abilitate)*
- Python 3 installato sull'host Semaphore (o sul runner)
- Un repository git in cui archiviare il playbook e lo script di inventory

## Passaggio 1 — Creare lo script di inventory {#step-1--create-the-inventory-script}

Creare un file chiamato `inventory/consul_inventory.py` nel repository. Questo script interroga l'API HTTP di Consul e restituisce le informazioni sugli host nel formato atteso da Ansible.

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

Rendere eseguibile lo script:

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
È possibile personalizzare questo script per raggruppare gli host in base ai metadati dei nodi Consul, ai tag dei servizi o ai datacenter. L'esempio sopra è un punto di partenza minimale.
:::

## Passaggio 2 — Configurare il repository {#step-2--set-up-your-repository}

Il repository dovrebbe avere la seguente struttura:

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
Questo approccio utilizza solo la libreria standard di Python per interrogare direttamente l'API di Consul. Non sono necessarie collection Ansible aggiuntive per il funzionamento dello script di inventory.
:::

Un semplice playbook di test (`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

Eseguire il push di questo repository sul proprio provider git.

## Passaggio 3 — Configurare Semaphore {#step-3--configure-semaphore}

### Aggiungere un gruppo di variabili {#add-a-variable-group}

Lo script di inventory legge l'indirizzo e il token di Consul dalle variabili d'ambiente. Creare un gruppo di variabili in Semaphore per passare questi valori.

1. Andare nel progetto e fare clic su **Gruppi di variabili**
2. Fare clic su **Nuovo gruppo di variabili**
3. Assegnare un nome (ad es. `consul-inventory`)
4. In **Variabili d'ambiente**, aggiungere:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(necessario solo se le [ACL](https://developer.hashicorp.com/consul/docs/security/acl) sono abilitate sul cluster Consul)*
5. Fare clic su **Crea**

:::tip
Se il cluster Consul non ha le ACL abilitate, è possibile omettere la variabile `CONSUL_HTTP_TOKEN`. Lo script di inventory funzionerà comunque: semplicemente non invierà alcun token di autenticazione con le richieste API.
:::

### Aggiungere il repository {#add-the-repository}

1. Andare in **Repository** e fare clic su **Nuovo repository**
2. Inserire l'URL git del repository
3. Selezionare la chiave di accesso per il provider git
4. Fare clic su **Crea**

### Aggiungere l'Inventory {#add-the-inventory}

1. Andare in **Inventory** e fare clic su **Nuovo Inventory**
2. Assegnare un nome (ad es. `consul-dynamic-inventory`)
3. Selezionare **File** come tipo
4. Inserire il percorso: `inventory/consul_inventory.py`
5. Selezionare la chiave SSH che Ansible utilizzerà per connettersi agli host
6. Fare clic su **Crea**

:::note
Il percorso è relativo alla radice del repository git. Semaphore clona il repository e passa questo percorso a `ansible-playbook -i inventory/consul_inventory.py`.
:::

### Creare un modello di task {#create-a-task-template}

1. Andare in **Modelli di task** e fare clic su **Nuovo modello**
2. Assegnare un nome (ad es. `Consul Hello World`)
3. Impostare **Playbook** su `playbook.yml`
4. Selezionare il repository, l'inventory e il gruppo di variabili creati in precedenza
5. Fare clic su **Crea**

## Passaggio 4 — Eseguire {#step-4--run-it}

Fare clic su **Esegui** nel modello di task. Semaphore:

1. Clonerà il repository
2. Eseguirà il playbook utilizzando lo script di inventory Consul
3. Mostrerà l'output nel log del task

Si dovrebbe vedere un output simile a:

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## Raggruppamento degli host per metadati {#grouping-hosts-by-metadata}

Consul supporta i [metadati dei nodi](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta): coppie chiave-valore associate a ciascun nodo. È possibile utilizzarli per creare automaticamente gruppi Ansible.

Aggiungere quanto segue alla funzione `build_inventory()` dello script, dopo l'impostazione delle variabili host:

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

Questo crea gruppi come `role_webserver`, `env_production` o `os_ubuntu`. È quindi possibile utilizzarli come destinazione nei playbook:

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Approfondimenti {#further-reading}

- [Documentazione sull'inventory dinamico di Ansible](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [API Catalog di Consul](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Metadati dei nodi Consul](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)

