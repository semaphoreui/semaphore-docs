# Inventaire

![Liste des inventaires](/assets/inventory-list.webp)

Un inventaire est un fichier contenant la liste des hôtes sur lesquels Ansible exécutera ses plays.
Un inventaire stocke également des variables utilisables par les playbooks. Un inventaire peut être stocké au format YAML, JSON ou TOML.
Vous trouverez plus d'informations sur les inventaires dans la [documentation Ansible.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI peut lire un inventaire soit depuis un fichier du serveur auquel l'utilisateur Semaphore a un accès en lecture, soit depuis un inventaire statique édité via l'interface web.
Chaque inventaire est également associé à au moins un identifiant.
L'identifiant utilisateur est obligatoire : c'est celui qu'Ansible utilise pour se connecter aux hôtes de cet inventaire. Les identifiants sudo servent à élever les privilèges sur l'hôte.
Pour créer un inventaire, vous devez disposer d'un identifiant utilisateur, soit un nom d'utilisateur avec mot de passe, soit une clé SSH configurée dans le Magasin de clés.
Vous trouverez des informations sur les identifiants dans la section [Magasin de clés](key-store) de ce site.

## Types d'inventaire {#inventory-types}

| Type | Description |
|---|---|
| `static` | Inventaire au format INI édité dans l'interface web. |
| `static-yaml` | Inventaire au format YAML édité dans l'interface web. Utilisez-le pour les inventaires fournis par des plugins, comme [NetBox](./inventory/netbox-dynamic-inventory) ou [Consul](./inventory/consul-dynamic-inventory). |
| `file` | Chemin vers un fichier d'inventaire. Un chemin relatif pointe dans le dépôt du modèle, un chemin absolu vers un fichier sur le serveur. Vous pouvez éventuellement sélectionner un **Dépôt d'inventaire** distinct si le fichier se trouve dans un autre dépôt Git. |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | Il ne s'agit pas d'un inventaire Ansible : c'est un espace de travail pour les modèles [Terraform/OpenTofu](./apps/terraform/workspaces) et [Terragrunt](./apps/terragrunt). |

## Créer un inventaire {#creating-an-inventory}
1. Cliquez sur l'onglet Magasin de clés et vérifiez que vous disposez d'une clé de type login_password ou ssh
2. Cliquez sur l'onglet Inventaire, puis sur Nouvel inventaire
3. Nommez l'inventaire et sélectionnez le bon identifiant utilisateur dans la liste déroulante. Sélectionnez le bon identifiant sudo, si nécessaire
4. Sélectionnez le type d'inventaire
  * Si vous choisissez file, utilisez le chemin absolu du fichier. Si ce fichier se trouve dans votre dépôt git, utilisez un chemin relatif. Ex. `inventory/linux-hosts.yaml`
  * Si vous choisissez static ou static-yaml, collez ou saisissez votre inventaire dans le formulaire
5. Cliquez sur Créer.

## Mettre à jour un inventaire {#updating-an-inventory}
1. Cliquez sur l'onglet Inventaire
2. Cliquez sur l'icône en forme de crayon à côté de l'inventaire à modifier
3. Effectuez vos modifications
4. Cliquez sur Enregistrer

## Supprimer un inventaire {#deleting-an-inventory}
Avant de supprimer un inventaire, vous devez supprimer toutes les ressources qui lui sont liées.
Si vous ne savez pas quelles ressources sont utilisées dans un environnement, suivez les étapes 1 et 2 ci-dessous. Elles vous indiqueront les ressources utilisées, avec des liens vers celles-ci.

1. Cliquez sur l'onglet Inventaire
2. Cliquez sur l'icône de corbeille à côté de l'inventaire
3. Cliquez sur Oui si vous êtes sûr de vouloir supprimer l'inventaire
