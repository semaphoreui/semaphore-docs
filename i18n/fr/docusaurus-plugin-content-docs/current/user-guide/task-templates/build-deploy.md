# Modèles de build et de déploiement

En plus des modèles **Task** ordinaires, Semaphore propose deux types de modèles qui forment un pipeline simple : **Build** crée un artefact versionné, **Deploy** livre une version choisie sur les serveurs. Les deux types se sélectionnent dans le formulaire du modèle et modifient ce que l'utilisateur voit au démarrage d'une tâche.

## Modèles de build {#build-templates}

Un modèle de build produit un artefact : une archive tar, une image de conteneur, un paquet. Chaque tâche de build reçoit une version auto-incrémentée, à partir de la **Version initiale** du modèle (par exemple `1.0.0`). La version est affichée dans la colonne **Version** de la liste des modèles et de l'historique des tâches.

<div class="DialogScreenshot">
  ![Boîte de dialogue Nouvelle tâche pour un modèle de build](/assets/task-new-build.webp)
</div>

Utilisez la version dans votre playbook via `semaphore_vars.task_details.target_version` pour nommer l'artefact.

## Modèles de déploiement {#deploy-templates}

Un modèle de déploiement est lié à un modèle de build par le champ **Modèle de build**. Lorsqu'un utilisateur clique sur **Deploy**, la boîte de dialogue Nouvelle tâche demande la **Version de build** à déployer ; le dernier build réussi est présélectionné.

<div class="DialogScreenshot">
![Boîte de dialogue Nouvelle tâche pour un modèle de déploiement](/assets/task-new-deploy.webp)
</div>

Activez l'**Exécution automatique** dans le modèle de déploiement pour démarrer automatiquement un déploiement après chaque build réussi. La version à déployer est disponible dans le playbook sous la forme `semaphore_vars.task_details.incoming_version`.

## La variable `semaphore_vars` {#the-semaphore_vars-variable}

Semaphore transmet la variable `semaphore_vars` à chaque playbook Ansible qu'il exécute. Utilisez-la pour savoir quel type de tâche a été exécuté, quelle version doit être construite ou déployée, qui a lancé la tâche, et quel est le message de la tâche.

Exemple pour les tâches `build` :

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

Exemple pour les tâches `deploy` :

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

Pour les modèles **Bash**, **PowerShell** et **Python**, Semaphore fournit les mêmes valeurs de `task_details` sous forme de variables d'environnement :

| Champ de `task_details` | Variable d'environnement | Remarques |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` ou `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | Utilisateur qui a démarré la tâche |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | Message de la tâche |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Présent pour les tâches `build` |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Présent pour les tâches `deploy` |

Exemple pour Bash :

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

Exemple pour PowerShell :

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Exemple pour Python :

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## Exemple de pipeline {#example-pipeline}

Un rôle Ansible `build` :

1. Récupérer le code source de l'application depuis GitHub.
2. Compiler le code source.
3. Empaqueter le binaire dans `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`.
4. Téléverser l'archive tar vers un bucket S3.

Un rôle Ansible `deploy` :

1. Télécharger `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` depuis le bucket S3 vers les serveurs de destination.
2. La décompresser dans le répertoire de destination.
3. Créer ou mettre à jour les fichiers de configuration.
4. Redémarrer le service de l'application.

Pour enchaîner plus de deux étapes, ajouter des approbations ou bifurquer en cas d'échec, utilisez les [Workflows](../workflows).
