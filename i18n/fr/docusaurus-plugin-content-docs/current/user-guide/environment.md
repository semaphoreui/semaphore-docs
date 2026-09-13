# Groupes de variables

![Liste des groupes de variables](/assets/variable-groups-list.webp)

La section Groupes de variables de Semaphore est l'endroit où stocker des variables supplémentaires pour un inventaire ; elles doivent être stockées au format JSON.

Tous les modèles de tâches nécessitent un groupe de variables, même s'il est vide. 

## Créer un groupe de variables {#create-a-variable-group}
1. Cliquez sur l'onglet Groupes de variables.
2. Cliquez sur le bouton Nouveau groupe de variables.
3. Nommez le groupe de variables et saisissez ou collez des variables JSON valides. Si vous avez simplement besoin d'un groupe de variables vide, saisissez ```{}```.

## Mettre à jour un groupe de variables {#updating-a-variable-group}
1. Cliquez sur l'onglet Groupes de variables.
2. Cliquez sur l'icône en forme de crayon.
3. Effectuez vos modifications et cliquez sur Enregistrer.

## Supprimer un groupe de variables {#deleting-the-variable-group}
Avant de supprimer un groupe de variables, vous devez supprimer toutes les ressources qui lui sont liées.
Si vous ne savez pas quelles ressources sont utilisées dans un groupe de variables, suivez les étapes 1 et 2 ci-dessous. Elles vous indiqueront les ressources utilisées, avec des liens vers celles-ci.

1. Cliquez sur le groupe de variables.
2. Cliquez sur l'icône de corbeille à côté du groupe de variables.
3. Cliquez sur Oui si vous êtes sûr de vouloir supprimer le groupe de variables.

## Utiliser les groupes de variables - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
Lorsque vous souhaitez utiliser une variable ou un secret stocké dans un groupe de variables au sein de votre modèle terraform, vous devez préfixer son nom par `TF_VAR_` pour que le script terraform puisse l'utiliser. 

**Exemple**
Transmettre une clé d'API Hetzner Cloud à un playbook OpenTofu/Terraform. 

1. Cliquez sur Groupes de variables
2. Cliquez sur `New Group`
3. Cliquez sur l'onglet `Secrets`
4. Ajoutez `TF_VAR_hcloud_token` et saisissez votre `secret` dans le champ masqué
5. Cliquez sur Enregistrer

Nous appellerons notre secret `TF_VAR_hcloud_token` sous la forme `var.hcloud_token` dans 
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

