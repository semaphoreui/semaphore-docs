# Tâches

Une tâche est une exécution unique d'un [modèle de tâche](./task-templates) : une exécution d'un playbook Ansible, d'une configuration Terraform/OpenTofu/Terragrunt, ou d'un script Bash, PowerShell ou Python. Chaque tâche conserve son propre journal, son statut et ses détails, de sorte que vous pouvez toujours voir ce qui a été exécuté, quand, par qui et avec quelle révision du dépôt.

## Démarrer une tâche {#starting-a-task}

Vous devez disposer du rôle **Task Runner** ou supérieur dans le projet (voir [Équipes](./team)). Démarrez une tâche depuis l'un des deux emplacements suivants :

- Dans **Modèles de tâches**, cliquez sur le bouton **lecture** dans la ligne du modèle.
- Sur la page du modèle, cliquez sur le bouton en haut à droite. Son libellé dépend du type de modèle : **Run**, **Build** ou **Deploy**.

Les deux ouvrent la boîte de dialogue **Nouvelle tâche**. Son contenu dépend de l'application et des options activées dans le modèle.

<div class="DialogScreenshot">
![Boîte de dialogue Nouvelle tâche pour un modèle Ansible](/assets/task-new-ansible.webp)
</div>

| Champ | Affiché pour | Description |
|---|---|---|
| **Message** | tous les modèles | Note facultative enregistrée avec la tâche et affichée dans l'historique et les alertes. |
| **Build Version** | modèles de déploiement | Quel build déployer. Le dernier build réussi est sélectionné par défaut. Voir [Modèles de build et de déploiement](./task-templates/build-deploy). |
| Variables de questionnaire | modèles avec des [variables de questionnaire](./task-templates/survey-vars) | Un champ de saisie par variable ; les variables obligatoires doivent être remplies. |
| **Dry Run** `--check`, **Diff** `--diff` | Ansible | Exécuter le playbook en mode vérification ou afficher les modifications de fichiers. Les autres invites Ansible (Limit, Tags, Skip tags, Debug) apparaissent lorsqu'elles sont activées dans le modèle, voir [Invites](./task-templates/prompts). |
| **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure** | Terraform, OpenTofu, Terragrunt | Exécuter uniquement `plan`, ajouter `-destroy`, `-auto-approve`, `-upgrade` ou `-reconfigure`. Voir [Terraform/OpenTofu](./apps/terraform). |
| **Branche**, **Inventaire**, **Arguments CLI** | toute application | Remplacer les valeurs du modèle pour cette exécution. Chaque remplacement doit être autorisé dans les paramètres du modèle. |

<div class="DialogScreenshot">
![Boîte de dialogue Nouvelle tâche pour un modèle Terraform](/assets/task-new-terraform.webp)
</div>

Cliquez sur **Run** (ou **Build** / **Deploy**) pour placer la tâche dans la file d'attente.

### File d'attente et exécution parallèle {#queue-and-parallel-execution}

Les tâches d'un même modèle s'exécutent l'une après l'autre, sauf si **Autoriser les tâches parallèles** est activé dans le modèle. Le projet peut également limiter le nombre total de tâches en cours d'exécution avec **Nombre maximal de tâches parallèles** dans les [paramètres du projet](./projects/settings). Une tâche qui doit attendre reste au statut `waiting` et démarre automatiquement dès qu'un emplacement est libre.

## Fenêtre de tâche {#task-window}

Cliquer sur une tâche n'importe où dans l'interface ouvre la fenêtre de tâche. L'en-tête affiche le modèle, le numéro de la tâche, le message de commit de la révision du dépôt, le badge de statut, qui a démarré la tâche et quand, ainsi que la durée. L'icône en forme de flèches agrandit la fenêtre en plein écran.

![Journal de la tâche](/assets/task-log.webp)

| Onglet | Contenu |
|---|---|
| **Log** | Sortie en direct de la tâche avec horodatage. Le journal est diffusé pendant l'exécution de la tâche. **Raw log** ouvre la sortie brute dans un nouvel onglet du navigateur. |
| **Détails** | Informations sur le modèle (application, modèle), informations sur le commit (message et hachage) et informations d'exécution : message, dates de création, de démarrage et de fin, durée et, le cas échéant, le runner, la branche, la limite et les variables utilisées pour l'exécution. |
| **Résumé** (Pro) | Pour les tâches Ansible : combien d'hôtes se sont terminés correctement et combien ont échoué, avec un tableau des tâches en échec par serveur. |

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Détails de la tâche](/assets/task-details.webp)
</div>

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Résumé de la tâche](/assets/task-summary.webp)
</div>

## Statuts des tâches {#task-statuses}

| Statut | Signification |
|---|---|
| `waiting` | La tâche est dans la file d'attente : une autre tâche du même modèle est en cours d'exécution, la limite du projet est atteinte, ou aucun runner n'est encore disponible. |
| `starting` | Un runner a pris la tâche et prépare le dépôt et l'environnement. |
| `waiting_confirmation` | L'outil a posé une question et attend un utilisateur, par exemple `terraform apply` sans **Auto Approve** ou un script qui lit une entrée. Utilisez **Confirmer** ou **Rejeter** dans la fenêtre de tâche. |
| `confirmed` | Un utilisateur a confirmé la question ; la tâche continue. |
| `rejected` | Un utilisateur a rejeté la question ; la tâche se termine. |
| `running` | Le playbook ou le script est en cours d'exécution. |
| `stopping` | Un arrêt a été demandé et le processus est en cours de terminaison. |
| `stopped` | La tâche a été arrêtée par un utilisateur. |
| `success` | Terminée avec le code de sortie 0. |
| `error` | Terminée avec un code de sortie non nul ou n'a pas pu démarrer. Affiché comme **Failed** dans l'interface. |

## Arrêter des tâches {#stopping-tasks}

Ouvrez la fenêtre de tâche d'une tâche en cours d'exécution et cliquez sur **Stop**. Semaphore envoie un signal de terminaison et la tâche passe au statut `stopping` pendant que le processus se termine. Si le processus ne réagit pas, le bouton devient **Force Stop** ; cliquez dessus pour tuer immédiatement le processus.

Pour arrêter toutes les tâches en cours d'exécution et en file d'attente d'un modèle, ouvrez la page du modèle et utilisez **Tout arrêter**. Le menu déroulant propose à la fois **Stop** et **Force stop**.

<div class="DialogScreenshot" style={{maxWidth: 200}}>

![Menu Tout arrêter](/assets/task-stop-all-menu.webp)

</div>

## Relancer une tâche {#running-a-task-again}

Dans l'onglet **Tâches** d'un modèle, chaque ligne possède un bouton de **relance**. Il ouvre la boîte de dialogue Nouvelle tâche avec le message et les paramètres de cette tâche pré-remplis.

![Tâches du modèle avec les boutons de relance](/assets/template-tasks.webp)

## Où les tâches sont listées {#where-tasks-are-listed}

- **Tableau de bord → Historique** : toutes les tâches du projet, voir [Historique](./projects/history).
- **Page du modèle → Tâches** : les tâches d'un seul modèle.
- **Modèles de tâches** : dépliez une ligne avec la flèche à gauche pour voir les dernières tâches du modèle sans quitter la liste.

## Conservation des journaux {#log-retention}

Les tâches et les journaux sont conservés indéfiniment par défaut. Utilisez `max_tasks_per_template` pour ne conserver que les dernières tâches de chaque modèle, voir [Historique](./projects/history#task-retention).
