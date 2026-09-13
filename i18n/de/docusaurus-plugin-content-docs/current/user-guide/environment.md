# Variablengruppen

![Liste der Variablengruppen](/assets/variable-groups-list.webp)

Der Bereich Variablengruppen in Semaphore dient zum Speichern zusätzlicher Variablen für ein Inventory und muss im JSON-Format gespeichert werden.

Alle Aufgabenvorlagen erfordern eine definierte Variablengruppe, auch wenn diese leer ist. 

## Eine Variablengruppe erstellen {#create-a-variable-group}
1. Klicken Sie auf den Tab Variablengruppe.
2. Klicken Sie auf die Schaltfläche Neue Variablengruppe.
3. Benennen Sie die Variablengruppe und geben Sie gültige JSON-Variablen ein oder fügen Sie sie ein. Wenn Sie nur eine leere Variablengruppe benötigen, geben Sie ```{}``` ein.

## Eine Variablengruppe aktualisieren {#updating-a-variable-group}
1. Klicken Sie auf den Tab Variablengruppen.
2. Klicken Sie auf das Stiftsymbol.
3. Nehmen Sie Ihre Änderungen vor und klicken Sie auf Speichern.

## Die Variablengruppe löschen {#deleting-the-variable-group}
Bevor Sie eine Variablengruppe entfernen, müssen Sie alle damit verknüpften Ressourcen entfernen.
Wenn Sie nicht sicher sind, welche Ressourcen eine Variablengruppe verwenden, folgen Sie den Schritten 1 und 2 unten. Es wird angezeigt, welche Ressourcen verwendet werden, mit Links zu diesen Ressourcen.

1. Klicken Sie auf die Variablengruppe.
2. Klicken Sie auf das Papierkorbsymbol neben der Variablengruppe.
3. Klicken Sie auf Ja, wenn Sie die Variablengruppe wirklich entfernen möchten.

## Verwendung von Variablengruppen - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
Wenn Sie eine gespeicherte Variable oder ein Secret aus einer Variablengruppe in Ihrer Terraform-Vorlage verwenden möchten, müssen Sie dem Namen das Präfix `TF_VAR_` voranstellen, damit das Terraform-Skript sie verwenden kann. 

**Beispiel**
Übergabe eines Hetzner-Cloud-API-Schlüssels an ein OpenTofu/Terraform-Playbook. 

1. Klicken Sie auf Variablengruppe
2. Klicken Sie auf `New Group`
3. Klicken Sie auf den Tab `Secrets`
4. Fügen Sie `TF_VAR_hcloud_token` hinzu und tragen Sie Ihr `secret` in das verborgene Feld ein
5. Klicken Sie auf Speichern

Wir referenzieren unser Secret `TF_VAR_hcloud_token` als `var.hcloud_token` in 
hetzner.tf
```
terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

# Declare the variable
variable "hcloud_token" {
  type        = string
  description = "Hetzner Cloud API token"
  sensitive   = true  # This prevents the token from being displayed in logs
}

provider "hcloud" {
  token = var.hcloud_token
}

# Create a new server running debian
resource "hcloud_server" "webserver" {
  name        = "webserver"
  image       = "ubuntu-24.04"
  server_type = "cpx11" 
  location    = "ash"
  ssh_keys = [ "mysshkey" ]
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
}
``` 
