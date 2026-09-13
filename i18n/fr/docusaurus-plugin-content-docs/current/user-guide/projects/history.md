# Historique

L'onglet **Historique** du tableau de bord du projet liste toutes les tâches du projet, de la plus récente à la plus ancienne. C'est la vue par défaut lorsque vous ouvrez un projet.

![Historique du projet](/assets/project-dashboard-history.webp)

## Colonnes {#columns}

| Colonne | Contenu |
|---|---|
| **Tâche** | Numéro de la tâche, modèle à partir duquel elle a été créée et message du commit de la révision du dépôt utilisée. Une icône à gauche indique l'application (Ansible, Terraform, Bash, etc.). |
| **Version** | Pour les [modèles de build et de déploiement](../task-templates/build-deploy) : la version construite ou déployée. Pour les autres modèles, seulement une icône de statut. |
| **Statut** | Badge du statut actuel, voir [Statuts des tâches](../tasks#task-statuses). |
| **Utilisateur** | Qui a démarré la tâche. Les tâches démarrées par une planification ou une intégration n'ont pas d'utilisateur. |
| **Début** | Date et heure de début dans le fuseau horaire de votre navigateur. |
| **Durée** | Durée d'exécution de la tâche. |

La liste est paginée. Cliquez sur le numéro de la tâche ou sur le nom du modèle pour ouvrir la [fenêtre de la tâche](../tasks#task-window) avec le journal, les détails et le résumé. Cliquez sur le nom du modèle dans l'en-tête de la fenêtre de la tâche pour accéder à la page du modèle.

## Conservation des tâches {#task-retention}

Par défaut, toutes les tâches et leurs journaux sont conservés indéfiniment. Pour limiter l'historique par modèle, définissez `max_tasks_per_template` dans `config.json` ou la variable d'environnement `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` :

```json
{
  "max_tasks_per_template": 30
}
```

Lorsque la limite est atteinte, les tâches les plus anciennes de ce modèle sont supprimées avec leurs journaux. Consultez [Configuration](/admin-guide/configuration) pour la liste complète des options.

## Voir aussi {#see-also}

- [Statistiques](./stats) : résultats des tâches agrégés par jour.
- [Activité](./activity) : journal d'audit des modifications apportées au projet.
