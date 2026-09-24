---
title: Host config
description: Associez un hôte Git ou l’URL d’un dépôt à un identifiant du Magasin de clés, afin que les sous-modules, les rôles Galaxy, les modules Terraform et les dépôts d’inventaire hébergés ailleurs soient accessibles avec leur propre clé.
---

# Host config

Une tâche s’authentifie auprès de son dépôt avec la clé sélectionnée dans le [Dépôt](/user-guide/repositories). Tout ce que la tâche récupère par ailleurs depuis Git ne reçoit aucun identifiant propre : un sous-module sur un autre serveur, un rôle de `requirements.yml`, un module Terraform, un inventaire conservé dans un second dépôt. **Host config** (configuration des hôtes) comble cette lacune. Un mappage lie un hôte Git ou l’URL d’un dépôt à un identifiant du [Magasin de clés](/user-guide/key-store), et chaque opération Git du projet l’utilise lorsqu’elle atteint cet hôte ou cette URL.

La page se trouve dans le menu du projet, sous **Dépôts**. Ajouter, modifier et supprimer des mappages requiert l’autorisation de gérer les ressources du projet, la même que celle dont a besoin le Magasin de clés.

![Page Host config d’un projet avec trois mappages](/assets/host-config-page.webp)

## Types de mappage {#mapping-types}

Cliquez sur **Add mapping** (ajouter un mappage) et choisissez ce que le mappage doit reconnaître.

### Host {#host}

Un mappage de type **Host** correspond à un nom d’hôte SSH, par exemple `github.com` ou `gitlab.example.com`, et nécessite une clé **SSH**. Chaque fois que la tâche ouvre une connexion SSH vers cet hôte, elle s’authentifie avec la clé mappée : un dépôt ou un sous-module cloné en SSH, une URL `git@host:group/repo.git` dans `requirements.yml`, et aussi les hôtes d’un inventaire Ansible portant ce nom. Lorsque la clé possède un login, il sert d’utilisateur SSH pour l’hôte.

<div style={{maxWidth: 720}}>

![Boîte de dialogue Add mapping avec le type Host sélectionné](/assets/host-config-form-host.webp)

</div>

### URL {#url}

Un mappage de type **URL** correspond à l’URL `https://` ou `http://` d’un dépôt. Il peut désigner un seul dépôt, `https://gitlab.example.com/infra/network.git`, ou se terminer par `/` pour couvrir tous les dépôts d’un groupe, `https://gitlab.example.com/ansible/`. Lorsque plusieurs mappages correspondent, l’URL la plus précise l’emporte : le mappage d’un dépôt donné prime donc sur le mappage du groupe qui le contient.

L’identifiant détermine la façon dont l’URL est atteinte :

| Identifiant | Ce qui se passe |
|---|---|
| Clé **SSH** | L’URL est réécrite sous sa forme SSH et la connexion s’authentifie avec la clé. Le login de la clé est l’utilisateur SSH, `git` lorsque la clé n’en a pas. |
| **Connexion avec mot de passe** | Le login et le mot de passe sont ajoutés à l’URL et envoyés en HTTPS. Laissez le login vide pour utiliser un jeton d’accès personnel. Seule une URL `https://` accepte cet identifiant, de sorte que le secret ne circule jamais en clair. |

L’URL ne doit contenir ni identifiants propres, ni espaces, ni guillemets, ni le caractère `=`.

<div style={{maxWidth: 720}}>

![Boîte de dialogue de modification d’un mappage URL utilisant une connexion avec mot de passe](/assets/host-config-form-url.webp)

</div>

## Où s’appliquent les mappages {#where-mappings-apply}

Les mappages d’un projet sont installés avant la première commande Git d’une tâche et restent en vigueur jusqu’à sa fin. Ils couvrent :

- le clonage et la mise à jour du dépôt du modèle, y compris ses sous-modules ;
- les rôles et collections installés depuis `requirements.yml`, voir [Prérequis Galaxy](/user-guide/apps/ansible#galaxy-requirements) ;
- les modules récupérés par `terraform init` ou `tofu init` ;
- les commandes Git lancées par le playbook ou le script lui-même, par exemple le module `git` d’Ansible ;
- le dépôt d’un inventaire stocké dans Git ;
- les hôtes de l’inventaire, lorsqu’un mappage **Host** correspond à leur nom ;
- la navigation dans les branches et les playbooks d’un dépôt dans le formulaire de modèle, ainsi que la scrutation des planifications qui démarrent sur un nouveau commit.

Les tâches envoyées à un [runner distant](/admin-guide/runners) reçoivent les mappages avec la tâche et s’y comportent donc de la même manière.

Un mappage remplace l’entrée du même hôte dans la configuration SSH globale du serveur (`ssh.config_path` dans la [configuration](/reference/configuration)) ; toutes les autres entrées de ce fichier continuent de fonctionner. Les mappages nécessitent le client Git en ligne de commande, qui est la valeur par défaut `git_client: cmd_git` ; avec le client intégré `go_git`, une tâche d’un projet comportant des mappages échoue avec une erreur explicite plutôt que d’utiliser le mauvais identifiant.

## Identifiants {#credentials}

Les clés privées ne touchent jamais le disque : chaque mappage SSH conserve sa clé dans un agent SSH qui vit aussi longtemps que la tâche, et la configuration SSH générée ne fait référence qu’à l’agent. Une connexion avec mot de passe est transmise à Git par son environnement de configuration, pas sur la ligne de commande, et Git affiche l’URL d’origine dans le journal de la tâche, de sorte que le secret n’apparaît ni dans l’un ni dans l’autre.

Une clé référencée par un mappage ne peut pas être supprimée ; la boîte de dialogue de confirmation liste les mappages qui l’utilisent. Changer le type d’une telle clé vers un type que le mappage ne peut pas utiliser, par exemple transformer la clé SSH d’un mappage Host en connexion avec mot de passe, est également refusé.

## Exemple {#example}

Un playbook est hébergé sur GitHub, utilise un sous-module d’un GitLab auto-hébergé et installe un rôle d’un second groupe GitLab via `requirements.yml` :

```yaml
# requirements.yml
- src: https://gitlab.example.com/ansible/role-nginx.git
  version: v2.1.0
```

Trois mappages permettent à la tâche de s’exécuter sans aucune modification du dépôt :

| Type | Hôte ou URL | Identifiant |
|---|---|---|
| Host | `github.com` | La clé de déploiement du dépôt GitHub |
| URL | `https://gitlab.example.com/ansible/` | Un jeton d’accès GitLab, sous forme de connexion avec mot de passe |
| URL | `https://gitlab.example.com/infra/network.git` | La clé SSH autorisée sur ce seul dépôt |

## Sauvegardes {#backups}

Les mappages font partie de la [sauvegarde du projet](./projects/settings#danger-zone). Ils désignent leur identifiant par son nom, de sorte qu’un projet restauré les garde liés aux clés restaurées. Comme pour toute clé, la valeur secrète elle-même n’est pas exportée.
