# Inventario dinámico de Consul con Semaphore

![Insignia de Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Insignia de Consul](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## Descripción general {#overview}

Esta guía muestra cómo usar [HashiCorp Consul](https://www.consul.io/) como fuente de inventario dinámico en Semaphore. En lugar de listar los hosts manualmente, Ansible consultará el catálogo de Consul en tiempo de ejecución para descubrir a qué hosts dirigirse.

Este enfoque utiliza un **script de inventario en Python** confirmado en su repositorio git. Semaphore ejecuta el script automáticamente al ejecutar un playbook.

## Requisitos previos {#prerequisites}

- Un clúster de Consul en funcionamiento con nodos registrados
- Un token ACL de Consul con acceso de lectura al catálogo *(solo si las [ACL](https://developer.hashicorp.com/consul/docs/security/acl) están habilitadas)*
- Python 3 instalado en el host de Semaphore (o en el runner)
- Un repositorio git para almacenar su playbook y el script de inventario

## Paso 1 — Crear el script de inventario {#step-1--create-the-inventory-script}

Cree un archivo llamado `inventory/consul_inventory.py` en su repositorio. Este script consulta la API HTTP de Consul y devuelve la información de los hosts en el formato que espera Ansible.

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

Haga el script ejecutable:

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
Puede personalizar este script para agrupar los hosts por metadatos de nodo de Consul, etiquetas de servicio o centros de datos. El ejemplo anterior es un punto de partida mínimo.
:::

## Paso 2 — Configurar el repositorio {#step-2--set-up-your-repository}

Su repositorio debería tener este aspecto:

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
Este enfoque usa únicamente la biblioteca estándar de Python para consultar directamente la API de Consul. No se requieren colecciones adicionales de Ansible para que el script de inventario funcione.
:::

Un playbook de prueba sencillo (`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

Suba este repositorio a su proveedor de git.

## Paso 3 — Configurar Semaphore {#step-3--configure-semaphore}

### Añadir un grupo de variables {#add-a-variable-group}

El script de inventario lee la dirección y el token de Consul desde variables de entorno. Cree un grupo de variables en Semaphore para pasar estos valores.

1. Vaya a su proyecto y haga clic en **Grupo de variables**
2. Haga clic en **Nuevo grupo de variables**
3. Asígnele un nombre (p. ej. `consul-inventory`)
4. En **Variables de entorno**, añada:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(solo es necesario si las [ACL](https://developer.hashicorp.com/consul/docs/security/acl) están habilitadas en su clúster de Consul)*
5. Haga clic en **Crear**

:::tip
Si su clúster de Consul no tiene las ACL habilitadas, puede omitir la variable `CONSUL_HTTP_TOKEN`. El script de inventario seguirá funcionando; simplemente no enviará un token de autenticación con sus solicitudes a la API.
:::

### Añadir el repositorio {#add-the-repository}

1. Vaya a **Repositorios** y haga clic en **Nuevo repositorio**
2. Introduzca la URL git de su repositorio
3. Seleccione la clave de acceso para su proveedor de git
4. Haga clic en **Crear**

### Añadir el inventario {#add-the-inventory}

1. Vaya a **Inventario** y haga clic en **Nuevo inventario**
2. Asígnele un nombre (p. ej. `consul-dynamic-inventory`)
3. Seleccione **Archivo** como tipo
4. Introduzca la ruta: `inventory/consul_inventory.py`
5. Seleccione la clave SSH que Ansible usará para conectarse a sus hosts
6. Haga clic en **Crear**

:::note
La ruta es relativa a la raíz de su repositorio git. Semaphore clona el repositorio y pasa esta ruta a `ansible-playbook -i inventory/consul_inventory.py`.
:::

### Crear una plantilla de tarea {#create-a-task-template}

1. Vaya a **Plantillas de tareas** y haga clic en **Nueva plantilla**
2. Asígnele un nombre (p. ej. `Consul Hello World`)
3. Establezca **Playbook** en `playbook.yml`
4. Seleccione el repositorio, el inventario y el grupo de variables que creó anteriormente
5. Haga clic en **Crear**

## Paso 4 — Ejecutarlo {#step-4--run-it}

Haga clic en **Ejecutar** en su plantilla de tarea. Semaphore:

1. Clonará su repositorio
2. Ejecutará el playbook usando su script de inventario de Consul
3. Mostrará la salida en el registro de la tarea

Debería ver una salida similar a esta:

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## Agrupar hosts por metadatos {#grouping-hosts-by-metadata}

Consul admite [metadatos de nodo](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta): pares clave-valor asociados a cada nodo. Puede usarlos para crear grupos de Ansible automáticamente.

Añada lo siguiente a la función `build_inventory()` de su script, después de establecer las variables del host:

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

Esto crea grupos como `role_webserver`, `env_production` u `os_ubuntu`. Después puede dirigirse a ellos en sus playbooks:

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Lecturas adicionales {#further-reading}

- [Documentación de inventario dinámico de Ansible](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [API de catálogo de Consul](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Metadatos de nodo de Consul](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
