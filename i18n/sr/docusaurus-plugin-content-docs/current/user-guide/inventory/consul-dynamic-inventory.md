# Consul dinamički inventar sa Semaphore-om

![Ansible bedž](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Consul bedž](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## Pregled {#overview}

Ovaj vodič pokazuje kako da koristite [HashiCorp Consul](https://www.consul.io/) kao izvor dinamičkog inventara (Inventory) u Semaphore-u. Umesto ručnog navođenja hostova, Ansible će u vreme izvršavanja upitati Consul katalog da otkrije koje hostove treba da cilja.

Ovaj pristup koristi **Python skriptu inventara** sačuvanu u vašem git repozitorijumu (Repository). Semaphore automatski pokreće skriptu pri izvršavanju playbook-a.

## Preduslovi {#prerequisites}

- Pokrenut Consul klaster sa registrovanim čvorovima
- Consul ACL token sa pravom čitanja kataloga *(samo ako su [ACL-ovi](https://developer.hashicorp.com/consul/docs/security/acl) uključeni)*
- Python 3 instaliran na Semaphore hostu (ili runner-u)
- Git repozitorijum za čuvanje vašeg playbook-a i skripte inventara

## Korak 1 — Kreirajte skriptu inventara {#step-1--create-the-inventory-script}

Kreirajte fajl pod nazivom `inventory/consul_inventory.py` u svom repozitorijumu. Ova skripta šalje upite Consul HTTP API-ju i vraća informacije o hostovima u formatu koji Ansible očekuje.

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

Učinite skriptu izvršnom:

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
Ovu skriptu možete prilagoditi tako da grupiše hostove prema Consul metapodacima čvorova, tagovima servisa ili datacentrima. Gornji primer je minimalna polazna tačka.
:::

## Korak 2 — Podesite repozitorijum {#step-2--set-up-your-repository}

Vaš repozitorijum bi trebalo da izgleda ovako:

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
Ovaj pristup koristi samo Python standardnu biblioteku za direktne upite Consul API-ju. Za rad skripte inventara nisu potrebne dodatne Ansible kolekcije.
:::

Jednostavan testni playbook (`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

Pošaljite (push) ovaj repozitorijum svom git provajderu.

## Korak 3 — Podesite Semaphore {#step-3--configure-semaphore}

### Dodajte grupu promenljivih {#add-a-variable-group}

Skripta inventara čita Consul adresu i token iz promenljivih okruženja. Kreirajte grupu promenljivih (Variable Group) u Semaphore-u da biste prosledili ove vrednosti.

1. Idite na svoj projekat (Project) i kliknite **Grupe promenljivih** (Variable Group)
2. Kliknite **Nova grupa promenljivih** (New Variable Group)
3. Dajte joj naziv (npr. `consul-inventory`)
4. Pod **Promenljive okruženja** (Environment Variables) dodajte:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(potrebno samo ako su [ACL-ovi](https://developer.hashicorp.com/consul/docs/security/acl) uključeni na vašem Consul klasteru)*
5. Kliknite **Kreiraj** (Create)

:::tip
Ako na vašem Consul klasteru ACL-ovi nisu uključeni, možete izostaviti promenljivu `CONSUL_HTTP_TOKEN`. Skripta inventara će i dalje raditi — jednostavno neće slati token za autentifikaciju u svojim API zahtevima.
:::

### Dodajte repozitorijum {#add-the-repository}

1. Idite na **Repozitorijumi** (Repositories) i kliknite **Novi repozitorijum** (New Repository)
2. Unesite git URL svog repozitorijuma
3. Izaberite pristupni ključ za svog git provajdera
4. Kliknite **Kreiraj** (Create)

### Dodajte inventar {#add-the-inventory}

1. Idite na **Inventar** (Inventory) i kliknite **Novi inventar** (New Inventory)
2. Dajte mu naziv (npr. `consul-dynamic-inventory`)
3. Izaberite **File** kao tip
4. Unesite putanju: `inventory/consul_inventory.py`
5. Izaberite SSH ključ koji će Ansible koristiti za povezivanje na vaše hostove
6. Kliknite **Kreiraj** (Create)

:::note
Putanja je relativna u odnosu na koren vašeg git repozitorijuma. Semaphore klonira repozitorijum i prosleđuje ovu putanju komandi `ansible-playbook -i inventory/consul_inventory.py`.
:::

### Kreirajte šablon zadatka {#create-a-task-template}

1. Idite na **Šabloni zadataka** (Task Templates) i kliknite **Novi šablon** (New Template)
2. Dajte mu naziv (npr. `Consul Hello World`)
3. Podesite **Playbook** na `playbook.yml`
4. Izaberite repozitorijum, inventar i grupu promenljivih koje ste kreirali iznad
5. Kliknite **Kreiraj** (Create)

## Korak 4 — Pokrenite {#step-4--run-it}

Kliknite **Pokreni** (Run) na svom šablonu zadatka. Semaphore će:

1. Klonirati vaš repozitorijum
2. Izvršiti playbook koristeći vašu Consul skriptu inventara
3. Prikazati izlaz u logu zadatka

Trebalo bi da vidite izlaz sličan ovom:

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## Grupisanje hostova prema metapodacima {#grouping-hosts-by-metadata}

Consul podržava [metapodatke čvorova](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta) — parove ključ-vrednost pridružene svakom čvoru. Možete ih koristiti za automatsko kreiranje Ansible grupa.

Dodajte ovo u funkciju `build_inventory()` u svojoj skripti, nakon postavljanja promenljivih hosta:

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

Ovim se kreiraju grupe kao što su `role_webserver`, `env_production` ili `os_ubuntu`. Zatim ih možete ciljati u svojim playbook-ovima:

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## Dodatna literatura {#further-reading}

- [Ansible dokumentacija o dinamičkom inventaru](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [Consul Catalog API](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Consul metapodaci čvorova](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
