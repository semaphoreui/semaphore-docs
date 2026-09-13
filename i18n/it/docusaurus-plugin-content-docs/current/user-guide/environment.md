# Variable Group

![Elenco dei Variable Group](/assets/variable-groups-list.webp)

La sezione Variable Groups di Semaphore è il luogo in cui memorizzare variabili aggiuntive per un Inventory e deve essere in formato JSON.

Tutti i Task Template richiedono che sia definito un Variable Group, anche se vuoto. 

## Creazione di un Variable Group {#create-a-variable-group}
1. Fare clic sulla scheda Variable Group.
2. Fare clic sul pulsante Nuovo Variable Group.
3. Assegnare un nome al Variable Group e digitare o incollare variabili JSON valide. Se è necessario soltanto un Variable Group vuoto, digitare ```{}```.

## Aggiornamento di un Variable Group {#updating-a-variable-group}
1. Fare clic sulla scheda Variable Groups.
2. Fare clic sull'icona a forma di matita.
3. Apportare le modifiche e fare clic su salva.

## Eliminazione di un Variable Group {#deleting-the-variable-group}
Prima di rimuovere un Variable Group, è necessario rimuovere tutte le risorse ad esso collegate.
Se non si è sicuri di quali risorse vengano utilizzate in un Variable Group, seguire i passaggi 1 e 2 riportati di seguito. Verranno mostrate le risorse in uso, con i collegamenti a tali risorse.

1. Fare clic sul Variable Group.
2. Fare clic sull'icona del cestino accanto al Variable Group.
3. Fare clic su Sì se si è sicuri di voler rimuovere il Variable Group.

## Utilizzo dei Variable Group - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
Quando si desidera utilizzare una variabile o un segreto memorizzato in un Variable Group all'interno di un Task Template terraform, è necessario anteporre al nome il prefisso `TF_VAR_` affinché lo script terraform lo utilizzi. 

**Esempio**
Passaggio della chiave API di Hetzner Cloud a un playbook OpenTofu/Terraform. 

1. Fare clic su Variable Group
2. Fare clic su `New Group`
3. Fare clic sulla scheda `Secrets`
4. Aggiungere `TF_VAR_hcloud_token` e inserire il proprio `secret` nel campo nascosto
5. Fare clic su Salva

Il segreto `TF_VAR_hcloud_token` verrà richiamato come `var.hcloud_token` in 
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
