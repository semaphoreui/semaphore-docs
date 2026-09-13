# Premiers pas

Cette page vous guide depuis une installation fraîche jusqu'à votre première tâche réussie. Chaque étape renvoie vers la page contenant les détails.

## De zéro à la première tâche {#from-zero-to-first-task}

1. **Installez Semaphore** avec la méthode de votre choix : [Installation](/admin-guide/installation).
2. **Connectez-vous** avec l'utilisateur administrateur créé lors de l'installation, ou via les variables `SEMAPHORE_ADMIN_*` sous Docker.
3. **Créez un projet.** Un projet isole les équipes, les infrastructures ou les applications les unes des autres : [Projets](/user-guide/projects).
4. **Connectez ce dont votre automatisation a besoin :**
   - Le code source contenant les playbooks, modules ou scripts : [Dépôts](/user-guide/repositories).
   - Les clés SSH, tokens et mots de passe : [Coffre de clés](/user-guide/key-store).
   - Les hôtes cibles et les paramètres de connexion : [Inventaire](/user-guide/inventory).
   - Les variables réutilisables : [Groupes de variables](/user-guide/environment).
5. **Créez un modèle de tâche et exécutez-le.** Choisissez le guide correspondant à votre outil : [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) ou [Python](/user-guide/apps/python). Puis exécutez-le et suivez son déroulement : [Tâches](/user-guide/tasks).
6. **Automatisez et industrialisez :**
   - Exécution planifiée : [Planifications](/user-guide/schedules).
   - Contrôle de qui peut faire quoi : [Équipes et rôles personnalisés](/user-guide/team).
   - Alertes sur les résultats : [Notifications](/admin-guide/notifications).

## Concepts clés {#key-concepts}

Ces termes apparaissent partout dans l'interface.

| Terme | Signification |
|------|---------|
| **Projet** | L'unité principale de séparation. Chaque projet possède ses propres dépôts, clés, inventaires, modèles et équipe. [Projets](/user-guide/projects) |
| **Dépôt** | Un dépôt Git ou un chemin local où résident les playbooks, modules ou scripts. [Dépôts](/user-guide/repositories) |
| **Inventaire** | Hôtes, groupes et paramètres de connexion pour les exécutions de type Ansible. [Inventaire](/user-guide/inventory) |
| **Groupe de variables** | Variables réutilisables et configuration d'environnement, aussi appelé Environnement. [Groupes de variables](/user-guide/environment) |
| **Coffre de clés** | Identifiants chiffrés tels que clés SSH, tokens et mots de passe. [Coffre de clés](/user-guide/key-store) |
| **Modèle de tâche** | La définition d'une exécution : application, dépôt, inventaire, variables et options. [Modèles de tâches](/user-guide/task-templates) |
| **Tâche** | Une exécution unique d'un modèle, avec son journal et son statut. [Tâches](/user-guide/tasks) |
| **Workflow** | Un graphe de modèles avec branchements, approbations et délais. Fonctionnalité Pro. [Workflows](/user-guide/workflows) |
| **Runner** | L'endroit où les tâches s'exécutent : le serveur lui-même ou un runner distant. [Runners](/admin-guide/runners) |

## Étapes suivantes {#next-steps}

- Placez Semaphore derrière TLS avec un [reverse proxy](/admin-guide/reverse-proxy).
- Connectez votre fournisseur d'identité : [LDAP](/admin-guide/authentication/ldap) ou [OpenID Connect](/admin-guide/authentication/openid).
- Pilotez Semaphore depuis votre CI ou vos scripts avec l'[API](/reference/api) et la [CLI](/reference/cli).
