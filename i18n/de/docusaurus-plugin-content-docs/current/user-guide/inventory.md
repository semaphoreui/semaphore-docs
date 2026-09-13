# Inventory

![Inventory-Liste](/assets/inventory-list.webp)

Ein Inventory ist eine Datei, die eine Liste von Hosts enthält, gegen die Ansible Plays ausführt.
Ein Inventory speichert außerdem Variablen, die von Playbooks verwendet werden können. Ein Inventory kann in YAML, JSON oder TOML gespeichert werden.
Weitere Informationen zu Inventories finden Sie in der [Ansible-Dokumentation.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI kann ein Inventory entweder aus einer Datei auf dem Server lesen, auf die der Semaphore-Benutzer Lesezugriff hat, oder ein statisches Inventory verwenden, das über die Web-Oberfläche bearbeitet wird.
Jedes Inventory hat außerdem mindestens einen zugehörigen Zugangsschlüssel.
Der Benutzer-Zugangsschlüssel ist erforderlich; Ansible verwendet ihn, um sich bei den Hosts dieses Inventory anzumelden. Sudo-Zugangsdaten werden zur Rechteerweiterung auf dem jeweiligen Host verwendet.
Um ein Inventory zu erstellen, ist ein Benutzer-Zugangsschlüssel erforderlich, der entweder aus Benutzername mit Login oder aus einer im Key Store konfigurierten SSH-Verbindung besteht.
Informationen zu Zugangsschlüsseln finden Sie im Abschnitt [Key Store](key-store) dieser Website.

## Inventory-Typen {#inventory-types}

| Typ | Beschreibung |
|---|---|
| `static` | Inventory im INI-Format, das in der Web-Oberfläche bearbeitet wird. |
| `static-yaml` | Inventory im YAML-Format, das in der Web-Oberfläche bearbeitet wird. Verwenden Sie es für Plugin-Inventories wie [NetBox](./inventory/netbox-dynamic-inventory) oder [Consul](./inventory/consul-dynamic-inventory). |
| `file` | Pfad zu einer Inventory-Datei. Ein relativer Pfad verweist in das Repository des Task Template, ein absoluter Pfad auf eine Datei auf dem Server. Wählen Sie optional ein separates **Inventory-Repository**, wenn die Datei in einem anderen Git-Repository liegt. |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | Kein Ansible-Inventory: ein Workspace für [Terraform/OpenTofu](./apps/terraform/workspaces)- und [Terragrunt](./apps/terragrunt)-Task-Templates. |

## Ein Inventory erstellen {#creating-an-inventory}
1. Klicken Sie auf den Tab Key Store und stellen Sie sicher, dass Sie einen Schlüssel vom Typ login_password oder ssh haben
2. Klicken Sie auf den Tab Inventory und klicken Sie auf Neues Inventory
3. Benennen Sie das Inventory und wählen Sie den richtigen Benutzer-Zugangsschlüssel aus der Dropdown-Liste aus. Wählen Sie bei Bedarf den richtigen Sudo-Zugangsschlüssel aus
4. Wählen Sie den Inventory-Typ
  * Wenn Sie Datei auswählen, verwenden Sie den absoluten Pfad zur Datei. Befindet sich diese Datei in Ihrem Git-Repository, verwenden Sie den relativen Pfad, z. B. `inventory/linux-hosts.yaml`
  * Wenn Sie static oder static-yaml auswählen, fügen Sie Ihr Inventory in das Formular ein oder geben Sie es ein
5. Klicken Sie auf Erstellen.

## Ein Inventory aktualisieren {#updating-an-inventory}
1. Klicken Sie auf den Tab Inventory
2. Klicken Sie auf das Stiftsymbol neben dem Inventory, das Sie bearbeiten möchten
3. Nehmen Sie Ihre Änderungen vor
4. Klicken Sie auf Speichern

## Ein Inventory löschen {#deleting-an-inventory}
Bevor Sie ein Inventory entfernen, müssen Sie alle damit verknüpften Ressourcen entfernen.
Wenn Sie nicht sicher sind, welche Ressourcen in einer Umgebung verwendet werden, folgen Sie den Schritten 1 und 2 unten. Es wird angezeigt, welche Ressourcen verwendet werden, mit Links zu diesen Ressourcen.

1. Klicken Sie auf den Tab Inventory
2. Klicken Sie auf das Papierkorbsymbol neben dem Inventory
3. Klicken Sie auf Ja, wenn Sie das Inventory wirklich entfernen möchten
