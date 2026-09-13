# Inventory

![Elenco degli Inventory](/assets/inventory-list.webp)

Un Inventory è un file che contiene l'elenco degli host su cui Ansible eseguirà i play.
Un Inventory memorizza inoltre variabili che possono essere utilizzate dai playbook. Un Inventory può essere archiviato in formato YAML, JSON o TOML.
Ulteriori informazioni sugli Inventory sono disponibili nella [documentazione di Ansible.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI può leggere un Inventory da un file sul server a cui l'utente Semaphore ha accesso in lettura, oppure un Inventory statico modificato tramite l'interfaccia web.
A ogni Inventory è inoltre associata almeno una credenziale.
La credenziale utente è obbligatoria ed è quella che Ansible utilizza per accedere agli host di quell'Inventory. Le credenziali sudo vengono utilizzate per l'elevazione dei privilegi sull'host.
Per creare un Inventory è necessario disporre nel Key Store di una credenziale utente, costituita da un nome utente con password oppure da una configurazione SSH.
Le informazioni sulle credenziali sono disponibili nella sezione [Key Store](key-store) di questo sito.

## Tipi di Inventory {#inventory-types}

| Tipo | Descrizione |
|---|---|
| `static` | Inventory in formato INI modificato nell'interfaccia web. |
| `static-yaml` | Inventory in formato YAML modificato nell'interfaccia web. Da utilizzare per gli Inventory basati su plugin come [NetBox](./inventory/netbox-dynamic-inventory) o [Consul](./inventory/consul-dynamic-inventory). |
| `file` | Percorso di un file di Inventory. Un percorso relativo punta all'interno del Repository del Task Template, un percorso assoluto a un file sul server. Facoltativamente è possibile selezionare un **Inventory repository** separato se il file si trova in un altro repository Git. |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | Non è un Inventory di Ansible: è un workspace per i Task Template [Terraform/OpenTofu](./apps/terraform/workspaces) e [Terragrunt](./apps/terragrunt). |

## Creazione di un Inventory {#creating-an-inventory}
1. Fare clic sulla scheda Key Store e verificare di disporre di una chiave di tipo login_password o ssh
2. Fare clic sulla scheda Inventory e poi su Nuovo Inventory
3. Assegnare un nome all'Inventory e selezionare la credenziale utente corretta dal menu a discesa. Se necessario, selezionare la credenziale sudo corretta
4. Selezionare il tipo di Inventory
  * Se si seleziona file, utilizzare il percorso assoluto del file. Se il file si trova nel repository git, utilizzare il percorso relativo. Es. `inventory/linux-hosts.yaml`
  * Se si seleziona static o static-yaml, incollare o digitare l'Inventory nel modulo
5. Fare clic su Crea.

## Aggiornamento di un Inventory {#updating-an-inventory}
1. Fare clic sulla scheda Inventory
2. Fare clic sull'icona a forma di matita accanto all'Inventory da modificare
3. Apportare le modifiche
4. Fare clic su Salva

## Eliminazione di un Inventory {#deleting-an-inventory}
Prima di rimuovere un Inventory, è necessario rimuovere tutte le risorse ad esso collegate.
Se non si è sicuri di quali risorse utilizzino un ambiente, seguire i passaggi 1 e 2 riportati di seguito. Verranno mostrate le risorse in uso, con i collegamenti a tali risorse.

1. Fare clic sulla scheda Inventory
2. Fare clic sull'icona del cestino accanto all'Inventory
3. Fare clic su Sì se si è sicuri di voler rimuovere l'Inventory
