# Projets

Un projet est l'unité principale de séparation dans Semaphore UI. Chaque ressource que vous manipulez appartient à exactement un projet : modèles de tâches, tâches, inventaires, groupes de variables, clés, dépôts, intégrations, planifications, runners et membres de l'équipe.

Les projets sont indépendants les uns des autres : vous pouvez donc les utiliser pour organiser des systèmes sans rapport entre eux au sein d'une même installation de Semaphore : différentes équipes, infrastructures, environnements ou applications.

## Navigation dans un projet {#project-navigation}

Après avoir ouvert un projet, la barre latérale de gauche affiche le sélecteur de projet en haut et toutes les sections du projet en dessous. Sous le nom du projet figure votre rôle dans ce projet (par exemple `task_runner`). Le rôle détermine les sections que vous pouvez modifier ; voir [Équipes](./team).

![Tableau de bord du projet avec l'onglet Historique](/assets/project-dashboard-history.webp)

| Section | Contenu |
|---|---|
| **Tableau de bord** | Onglets [Historique](./projects/history), [Statistiques](./projects/stats), [Activité](./projects/activity) et, pour les propriétaires du projet, [Paramètres](./projects/settings) |
| **Modèles de tâches** | Définitions de ce qu'il faut exécuter et comment : [Modèles de tâches](./task-templates) |
| **Workflows** (Pro) | Graphes de modèles avec approbations et branchements : [Workflows](./workflows) |
| **Planification** | Planifications de type cron pour les modèles : [Planifications](./schedules) |
| **Inventaire** | Hôtes et paramètres de connexion pour Ansible, espaces de travail pour Terraform : [Inventaire](./inventory) |
| **Groupes de variables** | Variables et secrets réutilisables injectés dans les tâches : [Groupes de variables](./environment) |
| **Magasin de clés** | Identifiants chiffrés et stockages de secrets externes : [Magasin de clés](./key-store) |
| **Dépôts** | Dépôts Git ou chemins locaux contenant vos playbooks et scripts : [Dépôts](./repositories) |
| **Intégrations** | Webhooks entrants qui démarrent des tâches : [Intégrations](./integrations) |
| **Équipe** | Membres et leurs rôles : [Équipes](./team) |
| **Runners** (Pro) | Runners rattachés à ce projet : [Runners de projet](./projects/runners) |

Le bas de la barre latérale contient l'interrupteur du mode sombre, le sélecteur de langue et votre [menu de compte](./account).

## Créer un projet {#creating-a-project}

La création de projets est réservée aux administrateurs. Les utilisateurs ordinaires ne peuvent créer des projets que si l'option serveur `non_admin_can_create_project` (`SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT`) est activée, voir [Configuration](/admin-guide/configuration).

1. Cliquez sur le nom du projet en haut de la barre latérale et choisissez **Nouveau projet**.
2. Remplissez le formulaire :

| Champ | Description |
|---|---|
| **Nom du projet** | Nom d'affichage du projet. Vous pourrez le modifier plus tard dans les [Paramètres](./projects/settings). |
| **Nombre maximal de tâches parallèles** | Facultatif. Nombre de tâches de ce projet pouvant s'exécuter simultanément. Laissez le champ vide pour ne pas imposer de limite. Les tâches au-delà de la limite attendent dans la file avec le statut `waiting`. |
| **Démo** | Remplit le nouveau projet avec des données d'exemple : un dépôt de démonstration public, un inventaire, une clé et plusieurs modèles de tâches. À utiliser pour essayer Semaphore sans rien configurer. |

3. Cliquez sur **Créer**.

L'utilisateur qui crée un projet en devient le **Propriétaire**.

## Passer d'un projet à l'autre {#switching-between-projects}

Cliquez sur le nom du projet en haut de la barre latérale pour voir tous les projets dont vous êtes membre et passer d'un projet à l'autre. Le dernier projet ouvert est mémorisé dans votre navigateur.

## Sauvegarde et restauration {#backup-and-restore}

Un projet peut être exporté vers un fichier JSON et importé dans la même instance Semaphore ou dans une autre :

- **Export** : ouvrez **Tableau de bord → Paramètres** et cliquez sur **Sauvegarder le projet** (voir [Paramètres](./projects/settings)).
- **Import** : cliquez sur le nom du projet dans la barre latérale, choisissez **Restaurer le projet** et téléversez le fichier de sauvegarde.

Ces deux opérations sont également disponibles en ligne de commande, voir [CLI : Projets](/admin-guide/cli/projects).
