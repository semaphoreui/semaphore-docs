# Modèles de tâches

Un modèle de tâche définit ce qu'il faut exécuter et comment : l'application, le dépôt et le fichier à exécuter, l'inventaire, les groupes de variables, les identifiants, et les options qu'un utilisateur peut modifier au moment de démarrer une tâche. Chaque [tâche](../tasks) est créée à partir d'un modèle.

Les modèles prennent en charge les applications suivantes :

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) et [Terragrunt](/user-guide/apps/terragrunt)
* [Shell](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

Les administrateurs peuvent activer ou désactiver des applications et ajouter les leurs, voir [Applications](/user-guide/apps).

## Liste des modèles {#template-list}

La section **Modèles de tâches** liste tous les modèles du projet.

![Liste des modèles](/assets/templates-list.webp)

| Colonne | Contenu |
|---|---|
| **Nom** | Nom du modèle avec l'icône de l'application. Le bouton **lecture** démarre une nouvelle tâche. |
| **Version** | La dernière version construite pour les modèles de build et de déploiement, sinon l'icône de résultat de la dernière tâche. |
| **Statut** | Badge de statut de la dernière tâche, ou *Non lancé*. |
| **Dernière tâche** | Numéro de la dernière tâche et qui l'a démarrée. |
| **Playbook** | Le fichier que le modèle exécute. |
| **Inventaire**, **Groupes de variables**, **Dépôt** | Ressources rattachées au modèle. |

Les onglets au-dessus de la liste sont des [vues](./views) : des groupes de modèles nommés. L'icône d'engrenage en haut à droite vous permet de choisir les colonnes affichées. Cliquez sur la flèche à gauche d'une ligne pour déplier les dernières tâches de ce modèle.

![Ligne de modèle dépliée](/assets/templates-list-expanded.webp)

## Page du modèle {#template-page}

Cliquez sur le nom d'un modèle pour ouvrir sa page. Le bouton en haut à droite démarre une tâche (**Run**, **Build** ou **Deploy** selon le type), **Tout arrêter** interrompt toutes les tâches en cours d'exécution ou en file d'attente du modèle.

| Onglet | Contenu |
|---|---|
| **Tâches** | Les tâches de ce modèle, avec un bouton de **relance** sur chaque ligne. |
| **Détails** | Le playbook, le type, l'inventaire, les groupes de variables et le dépôt, ainsi que le graphique des statuts de tâches avec les mêmes filtres que les [Statistiques](../projects/stats). |
| **Espaces de travail** | Modèles Terraform, OpenTofu et Terragrunt uniquement : la liste des espaces de travail, voir [Espaces de travail](../apps/terraform/workspaces). |

![Détails du modèle](/assets/template-details.webp)

## Types de modèle {#template-types}

| Type | Objectif |
|---|---|
| **Task** | Une exécution simple. Le type par défaut. |
| **Build** | Produit un artefact et lui attribue une version auto-incrémentée. |
| **Deploy** | Déploie une version produite par un modèle de build. |

Les modèles de build et de déploiement, ainsi que les `semaphore_vars` qu'ils transmettent aux playbooks, sont décrits dans [Modèles de build et de déploiement](./build-deploy).

## Formulaire du modèle {#template-form}

Les utilisateurs ayant le rôle **Manager** ou supérieur peuvent créer et modifier des modèles avec **Nouveau modèle** et l'icône en forme de crayon. Le formulaire est organisé selon les groupes suivants. Les champs marqués d'un nom d'application n'apparaissent que pour cette application.

### Champs communs {#common-fields}

| Champ | Description |
|---|---|
| **Nom** | Obligatoire. Nom du modèle. |
| **Description** | Texte facultatif affiché sous le nom. |
| **App** | Application à exécuter. |
| **Dépôt** | Dépôt contenant le playbook ou le script, voir [Dépôts](../repositories). |
| **Branche** | Branche Git à extraire. Vide signifie la branche configurée dans le dépôt. |
| **Nom du fichier Playbook / Script** | Chemin du fichier relatif à la racine du dépôt. Pour les applications Terraform : le sous-répertoire contenant la configuration. |
| **Répertoire de travail différent** | Exécuter l'outil depuis un autre répertoire du dépôt. |
| **Inventaire** | Inventaire Ansible, ou espace de travail pour les applications Terraform. |
| **Groupes de variables** | Un ou plusieurs groupes de variables dont les variables et les secrets sont injectés dans la tâche, voir [Groupes de variables](../environment). |
| **Mot de passe du vault** (Ansible) | Clés utilisées pour déverrouiller Ansible Vault, voir [Plusieurs mots de passe de coffre](../apps/ansible#multiple-vault-passwords). |
| **Vue** | L'onglet de [vue](./views) dans lequel le modèle apparaît. |
| **CLI args** | Arguments de ligne de commande supplémentaires sous forme de tableau JSON, par exemple `["-vvv"]`. |

### Champs propres au type {#type-specific-fields}

| Champ | Type | Description |
|---|---|---|
| **Version initiale** | Build | La première version à attribuer, par exemple `1.0.0`. |
| **Modèle de build** | Deploy | Le modèle de build dont ce modèle déploie les artefacts. |
| **Exécution automatique** | Deploy | Démarrer automatiquement un déploiement après chaque build réussi. |

### Options avancées {#advanced-options}

| Champ | Description |
|---|---|
| **Autoriser les tâches parallèles** | Permettre à plusieurs tâches de ce modèle de s'exécuter simultanément, voir [Tâches parallèles](#parallel-tasks). |
| **Alertes**, **Envoyer en cas de succès**, **Envoyer en cas d'erreur** | Indique si des notifications sont envoyées pour les tâches de ce modèle et pour quels résultats. Les notifications nécessitent également l'option **Autoriser les alertes pour ce projet** dans les [paramètres du projet](../projects/settings). |
| **Étiquette de runner** (Pro) | N'exécuter les tâches que sur les runners portant cette étiquette, voir [Runners de projet](../projects/runners). |
| **Image de l'exécuteur** | Image de conteneur pour les runners Docker et Kubernetes, voir [Image de l'exécuteur](#executor-image-docker-and-kubernetes-runners). |
| **Émettre un JWT pour l'exécuteur de tâche**, **Audience du JWT**, **TTL du JWT** | Fournir à la tâche un jeton signé, voir [JWT de tâche](./jwt). |
| **Exécuter automatiquement la tâche si un nouveau commit git est détecté** | Interroger le dépôt à l'intervalle indiqué et démarrer une tâche lorsque la branche avance. |
| **Variables de questionnaire** | Saisies que l'utilisateur renseigne au démarrage d'une tâche, voir [Variables de questionnaire](./survey-vars). |

### Invites {#prompts}

Les invites sont des cases à cocher qui permettent à l'utilisateur de modifier des options intégrées dans la boîte de dialogue Nouvelle tâche : branche, inventaire, arguments CLI et, pour Ansible, limit, tags, skip tags, niveau de débogage et installation Galaxy. Voir [Invites](./prompts).

### Options des applications {#application-options}

- **Ansible** : limit, tags, skip tags et options d'installation Galaxy, voir [Ansible](../apps/ansible).
- **Terraform/OpenTofu/Terragrunt** : approbation automatique et remplacement du backend, voir [Terraform/OpenTofu](../apps/terraform) et [Backend HTTP](../apps/terraform/states).

---

## Tâches parallèles {#parallel-tasks}

Par défaut, les tâches issues d'un même modèle s'exécutent séquentiellement. Pour autoriser des exécutions concurrentes du même modèle, activez l'option « Autoriser les tâches parallèles » dans les paramètres du modèle.

## Image de l'exécuteur (runners Docker et Kubernetes) {#executor-image-docker-and-kubernetes-runners}

Lorsqu'un runner de projet utilise l'exécuteur **Docker** (Pro) ou **Kubernetes** (Enterprise), chaque tâche s'exécute normalement dans l'image de job par défaut configurée sur le runner (par exemple `semaphoreui/job:latest`). Vous pouvez remplacer cette image modèle par modèle.

1. Ouvrez les paramètres du modèle
2. Définissez **Image de l'exécuteur** sur la référence de l'image de conteneur (par exemple `my-registry/ansible:2.16` ou `semaphoreui/job:latest`)
3. Enregistrez le modèle

**Comportement** :
- Seuls les exécuteurs de runner **Docker** et **Kubernetes** prennent en compte ce champ ; l'exécuteur local l'ignore
- Laissez le champ vide pour utiliser l'image par défaut du runner issue de `runner.executor.docker.image` ou `runner.executor.k8s.image`
- Effacer le champ dans l'interface supprime le remplacement

**Cas d'usage** :
- Modèles nécessitant une chaîne d'outils différente (une version plus ancienne d'Ansible, une version précise de Terraform, des paquets système supplémentaires intégrés dans une image personnalisée)
- Images isolées pour les modèles sensibles du point de vue de la sécurité, sans modifier la valeur par défaut appliquée à l'ensemble du runner

Consultez [Configuration du runner](/admin-guide/configuration) pour les paramètres d'image par défaut et [Runners de projet](/user-guide/projects/runners) pour la configuration des exécuteurs.
