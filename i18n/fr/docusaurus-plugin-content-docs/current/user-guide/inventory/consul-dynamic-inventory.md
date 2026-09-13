# Inventaire dynamique Consul avec Semaphore

![Badge Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Badge Consul](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## Vue d'ensemble {#overview}

Ce guide explique comment utiliser [HashiCorp Consul](https://www.consul.io/) comme source d'inventaire dynamique dans Semaphore. Au lieu de lister les hôtes manuellement, Ansible interroge le catalogue de Consul à l'exécution pour découvrir les hôtes à cibler.

Cette approche repose sur un **script d'inventaire Python** versionné dans votre dépôt git. Semaphore exécute automatiquement ce script lors de l'exécution d'un playbook.

## Prérequis {#prerequisites}

- Un cluster Consul en fonctionnement avec des nœuds enregistrés
- Un token ACL Consul avec un accès en lecture au catalogue *(uniquement si les [ACL](https://developer.hashicorp.com/consul/docs/security/acl) sont activées)*
- Python 3 installé sur l'hôte Semaphore (ou le runner)
- Un dépôt git pour stocker votre playbook et votre script d'inventaire

## Étape 1 — Créer le script d'inventaire {#step-1--create-the-inventory-script}

Créez un fichier nommé `inventory/consul_inventory.py` dans votre dépôt. Ce script interroge l'API HTTP de Consul et renvoie les informations sur les hôtes au format attendu par Ansible.

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

Rendez le script exécutable :

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
Vous pouvez adapter ce script pour regrouper les hôtes selon les métadonnées de nœud Consul, les tags de service ou les datacenters. L'exemple ci-dessus est un point de départ minimal.
:::

## Étape 2 — Préparer votre dépôt {#step-2--set-up-your-repository}

Votre dépôt doit ressembler à ceci :

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
Cette approche n'utilise que la bibliothèque standard Python pour interroger directement l'API Consul. Aucune collection Ansible supplémentaire n'est nécessaire au fonctionnement du script d'inventaire.
:::

Un playbook de test simple (`playbook.yml`) :

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

Poussez ce dépôt chez votre fournisseur git.

## Étape 3 — Configurer Semaphore {#step-3--configure-semaphore}

### Ajouter un groupe de variables {#add-a-variable-group}

Le script d'inventaire lit l'adresse et le token Consul dans des variables d'environnement. Créez un groupe de variables dans Semaphore pour transmettre ces valeurs.

1. Ouvrez votre projet et cliquez sur **Groupe de variables**
2. Cliquez sur **Nouveau groupe de variables**
3. Donnez-lui un nom (par exemple `consul-inventory`)
4. Sous **Variables d'environnement**, ajoutez :
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(requis uniquement si les [ACL](https://developer.hashicorp.com/consul/docs/security/acl) sont activées sur votre cluster Consul)*
5. Cliquez sur **Créer**

:::tip
Si les ACL ne sont pas activées sur votre cluster Consul, vous pouvez omettre la variable `CONSUL_HTTP_TOKEN`. Le script d'inventaire fonctionnera quand même : il n'enverra simplement pas de token d'authentification avec ses requêtes API.
:::

### Ajouter le dépôt {#add-the-repository}

1. Allez dans **Dépôts** et cliquez sur **Nouveau dépôt**
2. Saisissez l'URL git de votre dépôt
3. Sélectionnez la clé d'accès de votre fournisseur git
4. Cliquez sur **Créer**

### Ajouter l'inventaire {#add-the-inventory}

1. Allez dans **Inventaire** et cliquez sur **Nouvel inventaire**
2. Donnez-lui un nom (par exemple `consul-dynamic-inventory`)
3. Sélectionnez **Fichier** comme type
4. Saisissez le chemin : `inventory/consul_inventory.py`
5. Sélectionnez la clé SSH qu'Ansible utilisera pour se connecter à vos hôtes
6. Cliquez sur **Créer**

:::note
Le chemin est relatif à la racine de votre dépôt git. Semaphore clone le dépôt et transmet ce chemin à `ansible-playbook -i inventory/consul_inventory.py`.
:::

### Créer un modèle de tâche {#create-a-task-template}

1. Allez dans **Modèles de tâches** et cliquez sur **Nouveau modèle**
2. Donnez-lui un nom (par exemple `Consul Hello World`)
3. Définissez **Playbook** sur `playbook.yml`
4. Sélectionnez le dépôt, l'inventaire et le groupe de variables créés ci-dessus
5. Cliquez sur **Créer**

## Étape 4 — Exécuter {#step-4--run-it}

Cliquez sur **Exécuter** sur votre modèle de tâche. Semaphore va :

1. Cloner votre dépôt
2. Exécuter le playbook à l'aide de votre script d'inventaire Consul
3. Afficher la sortie dans le journal de la tâche

Vous devriez voir une sortie semblable à :

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## Regroupement des hôtes par métadonnées {#grouping-hosts-by-metadata}

Consul prend en charge les [métadonnées de nœud](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta) : des paires clé-valeur attachées à chaque nœud. Vous pouvez les utiliser pour créer automatiquement des groupes Ansible.

Ajoutez ceci à la fonction `build_inventory()` de votre script, après la définition des variables d'hôte :

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

Cela crée des groupes tels que `role_webserver`, `env_production` ou `os_ubuntu`. Vous pouvez ensuite les cibler dans vos playbooks :

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Pour aller plus loin {#further-reading}

- [Documentation Ansible sur les inventaires dynamiques](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [API Catalog de Consul](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Métadonnées de nœud Consul](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
