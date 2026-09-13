# Dynamisches Consul-Inventory mit Semaphore

![Ansible-Badge](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Consul-Badge](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## Überblick {#overview}

Diese Anleitung zeigt, wie Sie [HashiCorp Consul](https://www.consul.io/) als dynamische Inventory-Quelle in Semaphore verwenden. Anstatt Hosts manuell aufzulisten, fragt Ansible zur Laufzeit den Consul-Katalog ab, um zu ermitteln, welche Hosts angesprochen werden sollen.

Dieser Ansatz verwendet ein **Python-Inventory-Skript**, das in Ihrem Git-Repository eingecheckt ist. Semaphore führt das Skript beim Ausführen eines Playbooks automatisch aus.

## Voraussetzungen {#prerequisites}

- Ein laufender Consul-Cluster mit registrierten Nodes
- Ein Consul-ACL-Token mit Lesezugriff auf den Katalog *(nur wenn [ACLs](https://developer.hashicorp.com/consul/docs/security/acl) aktiviert sind)*
- Python 3 auf dem Semaphore-Host (oder Runner) installiert
- Ein Git-Repository zum Speichern Ihres Playbooks und Inventory-Skripts

## Schritt 1 — Das Inventory-Skript erstellen {#step-1--create-the-inventory-script}

Erstellen Sie in Ihrem Repository eine Datei namens `inventory/consul_inventory.py`. Dieses Skript fragt die Consul-HTTP-API ab und gibt Host-Informationen in dem Format zurück, das Ansible erwartet.

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

Machen Sie das Skript ausführbar:

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
Sie können dieses Skript anpassen, um Hosts nach Consul-Node-Metadaten, Service-Tags oder Datacentern zu gruppieren. Das obige Beispiel ist ein minimaler Ausgangspunkt.
:::

## Schritt 2 — Das Repository einrichten {#step-2--set-up-your-repository}

Ihr Repository sollte wie folgt aussehen:

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
Dieser Ansatz verwendet ausschließlich die Python-Standardbibliothek, um die Consul-API direkt abzufragen. Es sind keine zusätzlichen Ansible-Collections erforderlich, damit das Inventory-Skript funktioniert.
:::

Ein einfaches Test-Playbook (`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

Pushen Sie dieses Repository zu Ihrem Git-Anbieter.

## Schritt 3 — Semaphore konfigurieren {#step-3--configure-semaphore}

### Eine Variablengruppe hinzufügen {#add-a-variable-group}

Das Inventory-Skript liest die Consul-Adresse und das Token aus Umgebungsvariablen. Erstellen Sie in Semaphore eine Variablengruppe, um diese Werte zu übergeben.

1. Gehen Sie zu Ihrem Projekt und klicken Sie auf **Variablengruppe**
2. Klicken Sie auf **Neue Variablengruppe**
3. Vergeben Sie einen Namen (z. B. `consul-inventory`)
4. Fügen Sie unter **Umgebungsvariablen** Folgendes hinzu:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(nur erforderlich, wenn [ACLs](https://developer.hashicorp.com/consul/docs/security/acl) in Ihrem Consul-Cluster aktiviert sind)*
5. Klicken Sie auf **Erstellen**

:::tip
Wenn in Ihrem Consul-Cluster keine ACLs aktiviert sind, können Sie die Variable `CONSUL_HTTP_TOKEN` weglassen. Das Inventory-Skript funktioniert trotzdem — es sendet dann einfach kein Authentifizierungstoken mit seinen API-Anfragen.
:::

### Das Repository hinzufügen {#add-the-repository}

1. Gehen Sie zu **Repositories** und klicken Sie auf **Neues Repository**
2. Geben Sie die Git-URL Ihres Repositories ein
3. Wählen Sie den Zugangsschlüssel für Ihren Git-Anbieter aus
4. Klicken Sie auf **Erstellen**

### Das Inventory hinzufügen {#add-the-inventory}

1. Gehen Sie zu **Inventory** und klicken Sie auf **Neues Inventory**
2. Vergeben Sie einen Namen (z. B. `consul-dynamic-inventory`)
3. Wählen Sie **Datei** als Typ
4. Geben Sie den Pfad ein: `inventory/consul_inventory.py`
5. Wählen Sie den SSH-Schlüssel aus, den Ansible für die Verbindung zu Ihren Hosts verwendet
6. Klicken Sie auf **Erstellen**

:::note
Der Pfad ist relativ zum Stammverzeichnis Ihres Git-Repositories. Semaphore klont das Repository und übergibt diesen Pfad an `ansible-playbook -i inventory/consul_inventory.py`.
:::

### Eine Aufgabenvorlage erstellen {#create-a-task-template}

1. Gehen Sie zu **Aufgabenvorlagen** und klicken Sie auf **Neue Vorlage**
2. Vergeben Sie einen Namen (z. B. `Consul Hello World`)
3. Setzen Sie **Playbook** auf `playbook.yml`
4. Wählen Sie das Repository, das Inventory und die Variablengruppe aus, die Sie oben erstellt haben
5. Klicken Sie auf **Erstellen**

## Schritt 4 — Ausführen {#step-4--run-it}

Klicken Sie in Ihrer Aufgabenvorlage auf **Ausführen**. Semaphore wird:

1. Ihr Repository klonen
2. Das Playbook mit Ihrem Consul-Inventory-Skript ausführen
3. Die Ausgabe im Aufgabenprotokoll anzeigen

Sie sollten eine Ausgabe wie diese sehen:

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## Hosts nach Metadaten gruppieren {#grouping-hosts-by-metadata}

Consul unterstützt [Node-Metadaten](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta) — Schlüssel-Wert-Paare, die jedem Node zugeordnet sind. Sie können diese verwenden, um Ansible-Gruppen automatisch zu erstellen.

Fügen Sie Folgendes in die Funktion `build_inventory()` Ihres Skripts ein, nach dem Setzen der Host-Variablen:

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

Dadurch entstehen Gruppen wie `role_webserver`, `env_production` oder `os_ubuntu`. Diese können Sie anschließend in Ihren Playbooks ansprechen:

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Weiterführende Informationen {#further-reading}

- [Ansible-Dokumentation zu dynamischen Inventories](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [Consul-Katalog-API](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Consul-Node-Metadaten](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
