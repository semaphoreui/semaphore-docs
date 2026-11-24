# Inventaire

![Liste des inventaires](/assets/inventory-list.webp)

Un inventaire est un fichier contenant la liste des hôtes sur lesquels Ansible exécutera ses plays.
Un inventaire stocke également des variables utilisables par les playbooks. Un inventaire peut être stocké au format YAML, JSON ou TOML.
Vous trouverez plus d'informations sur les inventaires dans la [documentation Ansible.](https://docs.ansible.com/ansible/latest/inventory_guide/intro_inventory.html)

Semaphore UI peut lire un inventaire soit depuis un fichier du serveur auquel l'utilisateur Semaphore a un accès en lecture, soit depuis un inventaire statique édité via l'interface web.
Un inventaire géré conserve les hôtes et les variables sous forme d'enregistrements que vous modifiez dans l'interface web.
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
| `managed` | Les hôtes et les variables sont gérés comme des enregistrements dans l'interface web. Voir [Inventaire géré](#managed-inventory). |
| `terraform-workspace`, `tofu-workspace`, `terragrunt-workspace` | Il ne s'agit pas d'un inventaire Ansible : c'est un espace de travail pour les modèles [Terraform/OpenTofu](./apps/terraform/workspaces) et [Terragrunt](./apps/terragrunt). |

## Créer un inventaire {#creating-an-inventory}
1. Cliquez sur l'onglet Magasin de clés et vérifiez que vous disposez d'une clé de type login_password ou ssh
2. Cliquez sur l'onglet Inventaire, puis sur Nouvel inventaire
3. Nommez l'inventaire et sélectionnez le bon identifiant utilisateur dans la liste déroulante. Sélectionnez le bon identifiant sudo, si nécessaire
4. Sélectionnez le type d'inventaire
  * Si vous choisissez file, utilisez le chemin absolu du fichier. Si ce fichier se trouve dans votre dépôt git, utilisez un chemin relatif. Ex. `inventory/linux-hosts.yaml`
  * Si vous choisissez static ou static-yaml, collez ou saisissez votre inventaire dans le formulaire
  * Si vous choisissez managed, créez d'abord l'inventaire, puis ajoutez les hôtes et les variables sur sa page. Voir [Inventaire géré](#managed-inventory)
5. Cliquez sur Créer.

## Mettre à jour un inventaire {#updating-an-inventory}
1. Cliquez sur l'onglet Inventaire
2. Cliquez sur l'icône en forme de crayon à côté de l'inventaire à modifier
3. Effectuez vos modifications
4. Cliquez sur Enregistrer

Pour modifier les hôtes et les variables d'un inventaire géré, voir [Inventaire géré](#managed-inventory).

## Supprimer un inventaire {#deleting-an-inventory}
Avant de supprimer un inventaire, vous devez supprimer toutes les ressources qui lui sont liées.
Si vous ne savez pas quelles ressources sont utilisées dans un environnement, suivez les étapes 1 et 2 ci-dessous. Elles vous indiqueront les ressources utilisées, avec des liens vers celles-ci.

1. Cliquez sur l'onglet Inventaire
2. Cliquez sur l'icône de corbeille à côté de l'inventaire
3. Cliquez sur Oui si vous êtes sûr de vouloir supprimer l'inventaire

## Inventaire géré {#managed-inventory}

Un inventaire géré conserve vos hôtes sous forme d'enregistrements plutôt que de texte d'inventaire. Utilisez-le si vous ajoutez, modifiez ou désactivez souvent des hôtes et que vous ne voulez pas modifier un long texte.

Cliquez sur le nom de l'inventaire dans la liste. La page comporte trois onglets :

* **Hosts** : recherchez des hôtes par nom, filtrez-les par groupe, ajoutez-les, modifiez-les et supprimez-les. La colonne **Groups** indique les groupes d'un hôte. La colonne **Variables** indique combien de variables possède un hôte.
* **Groups** : groupes d'hôtes. Voir [Groupes](#managed-inventory-groups).
* **Variables** : variables de l'inventaire entier.

Un hôte a un nom, une description facultative et des variables. Le nom est ce qu'Ansible voit comme hôte. Il doit être unique dans l'inventaire, il distingue les majuscules des minuscules, et il ne doit pas contenir d'espaces, de virgules, de crochets ni de deux-points. Placez l'adresse et le port dans les variables `ansible_host` et `ansible_port`.

Écrivez les variables d'un hôte et de l'inventaire en YAML ou en JSON, sous forme de mapping :

```yaml
ansible_host: 10.0.0.5
ansible_user: deploy
```

Une valeur définie sur un hôte l'emporte sur la même variable définie sur l'inventaire. Les ancres, les alias et les clés de fusion YAML ne sont pas acceptés.

Pour ignorer un hôte, désactivez son interrupteur dans la liste des hôtes. Les tâches créées ensuite n'utilisent pas cet hôte. Réactivez-le pour l'utiliser de nouveau.

Dans l'onglet **Hosts**, la colonne **Last run** <Pro /> indique comment la dernière tâche avec cet inventaire s'est terminée sur chaque hôte, et quand. Cliquez sur la date pour ouvrir la tâche. Un hôte sur lequel rien n'a encore été exécuté affiche « never run ». Cliquez sur le nom d'un hôte déjà exécuté pour ouvrir sa page avec l'historique des tâches. Un hôte renommé conserve sa dernière exécution.

* Vous ne pouvez pas changer le type d'un inventaire vers `managed` ni depuis `managed` après sa création.
* Les hôtes et les variables d'un inventaire géré font partie de la sauvegarde du projet.
* Les utilisateurs qui peuvent seulement consulter le projet peuvent ouvrir la page, mais ils ne peuvent pas la modifier.

### Groupes {#managed-inventory-groups}

Un groupe vous permet d'exécuter un playbook sur une partie des hôtes, par exemple avec `hosts: web`, et de définir une variable une seule fois pour de nombreux hôtes.

Ajoutez un groupe dans l'onglet **Groups**. Un groupe a un nom, une description facultative, des variables et des groupes enfants. Le nom doit être unique dans l'inventaire, et les noms `all` et `ungrouped` sont réservés. Les hôtes d'un groupe enfant appartiennent aussi au groupe parent. Un groupe ne peut pas être son propre ancêtre.

Pour placer un hôte dans des groupes, choisissez-les dans le champ **Groups** lorsque vous ajoutez ou modifiez l'hôte. Pour modifier plusieurs hôtes à la fois, sélectionnez-les dans l'onglet **Hosts** et cliquez sur **Add to groups** ou **Remove from groups**. Un hôte peut appartenir à plusieurs groupes.

Pour voir les hôtes d'un groupe, choisissez le groupe dans le filtre de l'onglet **Hosts**. La liste inclut les hôtes de ses groupes enfants.

Une valeur définie sur un hôte l'emporte sur la même variable définie sur un groupe, et une valeur définie sur un groupe l'emporte sur l'inventaire. Une tâche qui cible un groupe s'exécute sur ses hôtes activés.
