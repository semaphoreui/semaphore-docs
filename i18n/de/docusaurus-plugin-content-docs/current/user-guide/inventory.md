# Inventory

![Inventory-Liste](/assets/inventory-list.webp)

Ein Inventory ist eine Datei, die eine Liste von Hosts enthält, gegen die Ansible Plays ausführt.
Ein Inventory speichert außerdem Variablen, die von Playbooks verwendet werden können. Ein Inventory kann in YAML, JSON oder TOML gespeichert werden.
Weitere Informationen zu Inventories finden Sie in der [Ansible-Dokumentation.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI kann ein Inventory entweder aus einer Datei auf dem Server lesen, auf die der Semaphore-Benutzer Lesezugriff hat, oder ein statisches Inventory verwenden, das über die Web-Oberfläche bearbeitet wird.
Ein Managed Inventory speichert Hosts und Variablen als Datensätze, die Sie in der Web-Oberfläche bearbeiten.
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
| `managed` | Hosts und Variablen werden als Datensätze in der Web-Oberfläche gepflegt. Siehe [Managed Inventory](#managed-inventory). |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | Kein Ansible-Inventory: ein Workspace für [Terraform/OpenTofu](./apps/terraform/workspaces)- und [Terragrunt](./apps/terragrunt)-Task-Templates. |

## Ein Inventory erstellen {#creating-an-inventory}
1. Klicken Sie auf den Tab Key Store und stellen Sie sicher, dass Sie einen Schlüssel vom Typ login_password oder ssh haben
2. Klicken Sie auf den Tab Inventory und klicken Sie auf Neues Inventory
3. Benennen Sie das Inventory und wählen Sie den richtigen Benutzer-Zugangsschlüssel aus der Dropdown-Liste aus. Wählen Sie bei Bedarf den richtigen Sudo-Zugangsschlüssel aus
4. Wählen Sie den Inventory-Typ
  * Wenn Sie Datei auswählen, verwenden Sie den absoluten Pfad zur Datei. Befindet sich diese Datei in Ihrem Git-Repository, verwenden Sie den relativen Pfad, z. B. `inventory/linux-hosts.yaml`
  * Wenn Sie static oder static-yaml auswählen, fügen Sie Ihr Inventory in das Formular ein oder geben Sie es ein
  * Wenn Sie managed auswählen, erstellen Sie zuerst das Inventory und fügen Sie dann Hosts und Variablen auf seiner Seite hinzu. Siehe [Managed Inventory](#managed-inventory)
5. Klicken Sie auf Erstellen.

## Ein Inventory aktualisieren {#updating-an-inventory}
1. Klicken Sie auf den Tab Inventory
2. Klicken Sie auf das Stiftsymbol neben dem Inventory, das Sie bearbeiten möchten
3. Nehmen Sie Ihre Änderungen vor
4. Klicken Sie auf Speichern

Wie Sie Hosts und Variablen eines Managed Inventory ändern, erfahren Sie unter [Managed Inventory](#managed-inventory).

## Ein Inventory löschen {#deleting-an-inventory}
Bevor Sie ein Inventory entfernen, müssen Sie alle damit verknüpften Ressourcen entfernen.
Wenn Sie nicht sicher sind, welche Ressourcen in einer Umgebung verwendet werden, folgen Sie den Schritten 1 und 2 unten. Es wird angezeigt, welche Ressourcen verwendet werden, mit Links zu diesen Ressourcen.

1. Klicken Sie auf den Tab Inventory
2. Klicken Sie auf das Papierkorbsymbol neben dem Inventory
3. Klicken Sie auf Ja, wenn Sie das Inventory wirklich entfernen möchten

## Managed Inventory {#managed-inventory}

Ein Managed Inventory speichert Ihre Hosts als Datensätze statt als Inventory-Text. Verwenden Sie es, wenn Sie Hosts oft hinzufügen, ändern oder ausschalten und keinen großen Text bearbeiten möchten.

Klicken Sie in der Liste auf den Namen des Inventory. Die Seite hat drei Tabs:

* **Hosts**: Hosts nach Namen suchen, nach Gruppe filtern, hinzufügen, bearbeiten und löschen. Die Spalte **Groups** zeigt die Gruppen eines Hosts. Die Spalte **Variables** zeigt, wie viele Variablen ein Host hat.
* **Groups**: Gruppen von Hosts. Siehe [Gruppen](#managed-inventory-groups).
* **Variables**: Variablen des gesamten Inventory.

Ein Host hat einen Namen, eine optionale Beschreibung und Variablen. Der Name ist das, was Ansible als Host sieht. Er muss im Inventory eindeutig sein, Groß- und Kleinschreibung wird unterschieden, und er darf keine Leerzeichen, Kommas, eckigen Klammern oder Doppelpunkte enthalten. Schreiben Sie die Adresse und den Port in die Variablen `ansible_host` und `ansible_port`.

Schreiben Sie die Variablen eines Hosts und des Inventory als Mapping in YAML oder JSON:

```yaml
ansible_host: 10.0.0.5
ansible_user: deploy
```

Ein Wert, der an einem Host gesetzt ist, hat Vorrang vor derselben Variable im Inventory. YAML-Anker, Aliase und Merge-Keys werden nicht akzeptiert.

Um einen Host zu überspringen, schalten Sie seinen Schalter in der Host-Liste aus. Danach erstellte Tasks verwenden den Host nicht. Schalten Sie ihn wieder ein, um den Host erneut zu verwenden.

* Den Typ eines Inventory können Sie nach dem Erstellen nicht zu `managed` oder von `managed` weg ändern.
* Hosts und Variablen eines Managed Inventory sind Teil des Projekt-Backups.
* Benutzer, die das Projekt nur ansehen dürfen, können die Seite öffnen, aber nichts ändern.

### Gruppen {#managed-inventory-groups}

Mit einer Gruppe können Sie ein Playbook auf einem Teil der Hosts ausführen, zum Beispiel mit `hosts: web`, und eine Variable einmal für viele Hosts setzen.

Fügen Sie eine Gruppe im Tab **Groups** hinzu. Eine Gruppe hat einen Namen, eine optionale Beschreibung, Variablen und untergeordnete Gruppen. Der Name muss im Inventory eindeutig sein, und die Namen `all` und `ungrouped` sind vergeben. Die Hosts einer untergeordneten Gruppe gehören auch zur übergeordneten Gruppe. Eine Gruppe kann nicht ihr eigener Vorfahre sein.

Um einen Host in Gruppen aufzunehmen, wählen Sie sie im Feld **Groups** aus, wenn Sie den Host hinzufügen oder bearbeiten. Um mehrere Hosts auf einmal zu ändern, wählen Sie sie im Tab **Hosts** aus und klicken Sie auf **Add to groups** oder **Remove from groups**. Ein Host kann in mehreren Gruppen sein.

Um die Hosts einer Gruppe zu sehen, wählen Sie die Gruppe im Filter im Tab **Hosts**. Die Liste enthält auch die Hosts ihrer untergeordneten Gruppen.

Ein Wert, der an einem Host gesetzt ist, hat Vorrang vor derselben Variable in einer Gruppe, und ein Wert in einer Gruppe hat Vorrang vor dem Inventory. Ein Task, der auf eine Gruppe zielt, läuft auf ihren eingeschalteten Hosts.
