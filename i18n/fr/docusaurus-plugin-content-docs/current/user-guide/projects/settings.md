# Paramètres

L'onglet **Paramètres** du tableau de bord du projet est accessible aux **Propriétaires** du projet. Il regroupe les options générales du projet et les actions destructives.

![Paramètres du projet](/assets/project-settings-general.webp)

## Général {#general}

| Champ | Description |
|---|---|
| **Nom du projet** | Nom d'affichage présenté dans le sélecteur de projet et dans les alertes. |
| **Nombre maximal de tâches parallèles** | Facultatif. Nombre maximal de tâches de ce projet pouvant s'exécuter simultanément. Laissez le champ vide pour ne pas imposer de limite. Les tâches au-delà de la limite restent dans la file avec le statut `waiting` jusqu'à ce qu'une place se libère. |
| **Identifiant de conversation Telegram** | Facultatif. Envoie les alertes de ce projet vers une conversation Telegram différente de celle configurée globalement. Voir [Notifications Telegram](/admin-guide/notifications/telegram#per-project-chat-ids). |
| **Autoriser les alertes pour ce projet** | Interrupteur principal des notifications. Lorsqu'il est désactivé, aucun canal n'envoie d'alertes concernant les tâches de ce projet, même si le canal est configuré sur le serveur. |

**Tester les alertes** envoie un message de test via chaque [canal de notification](/admin-guide/notifications) configuré, afin que vous puissiez vérifier la configuration du serveur sans exécuter de tâche. **Enregistrer** applique les modifications.

## Zone de danger {#danger-zone}

| Action | Effet |
|---|---|
| **Sauvegarder le projet** | Télécharge un fichier JSON contenant la définition du projet : modèles, inventaires, groupes de variables, clés (sans les valeurs secrètes), dépôts, planifications, vues et intégrations. Restaurez-le via **Nouveau projet → Restaurer le projet** ou avec [`semaphore projects import`](/reference/cli/projects). |
| **Vider le cache** | Supprime tous les fichiers mis en cache du projet sur le serveur, par exemple les dépôts clonés. La tâche suivante clonera de nouveau les dépôts. Cette action est irréversible. |
| **Supprimer le projet** | Supprime le projet avec toutes ses ressources et l'historique de ses tâches. Il n'y a pas de retour en arrière. |

## Paramètres connexes {#related-settings}

- Membres et rôles : [Équipes](../team)
- Runners rattachés au projet et étiquettes de runner : [Runners de projet](./runners)
- Les canaux de notification sont configurés sur le serveur : [Notifications](/admin-guide/notifications)
