---
title: Guide utilisateur
description: "Pour les ingénieurs qui travaillent dans un projet Semaphore : ressources, modèles de tâches, tâches, planifications et accès de l'équipe."
---

# Guide utilisateur

Cette section s'adresse aux personnes qui ont déjà accès à un projet Semaphore.
Tout se passe ici dans l'interface web ou via l'API du projet. L'installation du
serveur, sa configuration et la connexion d'un fournisseur d'identité sont traitées
dans le [Guide d'administration](/admin-guide).

Le travail dans Semaphore suit une seule chaîne. Un **projet** contient tout le
reste. À l'intérieur, vous déclarez les ressources dont une exécution a besoin : un
**dépôt** contenant vos playbooks ou scripts, les **clés** utilisées pour l'atteindre
ainsi que vos hôtes, un **inventaire** des machines cibles et des **groupes de
variables** avec des valeurs et des secrets. Un **modèle de tâche** combine tout cela
en une définition de ce qu'il faut exécuter, et chaque exécution de ce modèle est une
**tâche**. Les planifications, les workflows et les webhooks entrants démarrent les
modèles à votre place.

## Mettre en place un projet {#set-up-a-project}

Dans cet ordre, car chaque étape dépend de la précédente.

| Page | Contenu |
|---|---|
| [Projets](/user-guide/projects) | Créer un projet, les sections de la barre latérale, la sauvegarde et la restauration. |
| [Équipes](/user-guide/team) | Les quatre rôles intégrés, et les rôles personnalisés sur Enterprise. |
| [Magasin de clés](/user-guide/key-store) | Clés SSH, identifiants de connexion et stockages de secrets externes. |
| [Dépôts](/user-guide/repositories) | Dépôts Git et chemins locaux qui contiennent votre automatisation. |
| [Inventaire](/user-guide/inventory) | Hôtes et paramètres de connexion pour Ansible, espaces de travail pour Terraform. |
| [Groupes de variables](/user-guide/environment) | Variables et secrets réutilisables transmis aux tâches. |

## Définir et exécuter le travail {#define-and-run-work}

| Page | Contenu |
|---|---|
| [Modèles de tâches](/user-guide/task-templates) | Chaque champ du formulaire de modèle, ainsi que les types de modèle. |
| [Applications](/user-guide/apps) | Ce que chaque application exécute : Ansible, Terraform, OpenTofu, Terragrunt et les scripts. |
| [Tâches](/user-guide/tasks) | Démarrer une tâche, statuts de tâche, journaux, arrêt et relance. |
| [Planifications](/user-guide/schedules) | Exécuter des modèles selon une planification cron. |
| [Workflows](/user-guide/workflows) | Enchaîner des modèles avec des approbations et des branchements. |
| [Intégrations](/user-guide/integrations) | Démarrer des tâches depuis des webhooks entrants. |
| [Runners de projet](/user-guide/projects/runners) | Envoyer les tâches d'un projet vers vos propres runners. |
| [Votre compte](/user-guide/account) | Paramètres personnels et tokens d'API. |

## Par où commencer {#where-to-start}

Si quelqu'un vient de vous ajouter à un projet, lisez [Projets](/user-guide/projects)
pour vous repérer, puis [Tâches](/user-guide/tasks) pour en exécuter une et lire son
journal. Si vous partez de zéro pour mettre en place un projet, suivez le tableau
ci-dessus dans l'ordre.

Vous débutez complètement avec Semaphore ? Commencez par
[Premiers pas](/getting-started).
