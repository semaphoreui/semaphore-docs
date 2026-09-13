---
title: "Workflows"
sidebar_custom_props:
  edition: pro
---

# Workflows <Pro />

Les workflows vous permettent d'enchaîner plusieurs modèles de tâches dans un graphe
orienté (DAG) avec des embranchements, des approbations et des pauses temporisées. Une
exécution de workflow progresse automatiquement à mesure que chaque étape se termine —
vous concevez le graphe une seule fois dans l'éditeur visuel, puis vous lancez les
exécutions depuis la page Workflows.

:::info
Les workflows sont une fonctionnalité **Semaphore Pro**. L'entrée de menu Workflows
n'apparaît que lorsque votre abonnement les inclut.
:::

## Vue d'ensemble {#overview}

Un workflow est composé de :

- **Nœuds** — les étapes du graphe (exécuter un modèle, attendre une approbation,
  marquer une pause, ou annoter avec une note).
- **Arêtes** — les connexions entre les nœuds, chacune étiquetée avec une **condition**
  qui détermine quand le nœud en aval démarre.

Lorsque vous démarrez un workflow, Semaphore crée une **exécution de workflow**. Le
serveur pilote la progression : à mesure que les tâches se terminent, que les
approbations sont tranchées ou que les délais expirent, les nœuds en aval sont lancés
selon les conditions des arêtes.

## Créer un workflow {#creating-a-workflow}

1. Ouvrez votre projet et allez dans **Workflows**.
2. Cliquez sur **Nouveau workflow**.
3. Dans l'éditeur graphique :
   - Faites glisser des nœuds depuis la palette vers le canevas.
   - Connectez les nœuds en tirant depuis la poignée de sortie d'un nœud vers un autre.
   - Cliquez sur un nœud ou une arête pour modifier ses propriétés dans le panneau latéral.
4. Définissez un **nom** (et éventuellement une **version de départ** pour la gestion des versions d'exécution).
5. Corrigez les problèmes listés dans le panneau **Problèmes**, puis cliquez sur **Enregistrer**.

![Éditeur de workflow](/assets/workflow-editor.webp)

L'éditeur valide le graphe avant l'enregistrement. Un workflow valide doit comporter au
moins un nœud, exactement un nœud de départ (sans arête entrante), aucun cycle, et une
configuration complète sur chaque nœud exécutable.

## Types de nœuds {#node-kinds}

| Type | Objectif |
|------|---------|
| **Task** | Exécute un modèle de tâche. Vous pouvez remplacer les paramètres du modèle (inventaire, groupe de variables, limit Ansible, arguments CLI supplémentaires) pour chaque nœud via les **paramètres de tâche**. |
| **Approval** | Met l'exécution en pause jusqu'à ce qu'un utilisateur disposant de la permission approuve ou rejette. Vous pouvez éventuellement définir un délai d'expiration (en secondes) et un message d'approbation. |
| **Delay** | Attend le nombre de secondes configuré avant de continuer vers les nœuds en aval. Utile pour les périodes de refroidissement, les fenêtres de maintenance, ou pour espacer des étapes dépendantes. |
| **Note** | Annotation libre sur le canevas. Les nœuds de type note ne s'exécutent pas et ne sont pas reliés par des arêtes — ils servent uniquement à la documentation. |

### Convergence {#convergence}

Les nœuds ayant plusieurs arêtes entrantes peuvent exiger que **tous** les nœuds en
amont se terminent (par défaut) ou **n'importe lequel** d'entre eux. Définissez
**Convergence** dans le panneau de propriétés du nœud.

### Nœuds de délai {#delay-nodes}

Un nœud de délai met l'exécution du workflow en pause pendant la durée configurée
(1 seconde minimum). Pendant l'attente :

- L'exécution reste au statut **running**.
- La vue d'exécution affiche un compte à rebours en direct sur le nœud de délai.
- Les nœuds en aval reliés par des arêtes ne sont pas démarrés avant la fin du délai.

Si l'exécution du workflow est **stopped** pendant qu'un délai est actif, le délai est
annulé et l'exécution se termine au statut **stopped**.

### Nœuds d'approbation {#approval-nodes}

Lorsque l'exécution atteint un nœud d'approbation, le statut passe à **approval**
jusqu'à ce que quelqu'un approuve ou rejette. Les contrôles Approuver/Rejeter
apparaissent dans la vue d'exécution. Les approbations rejetées font échouer
l'exécution selon les conditions des arêtes connectées.

## Conditions des arêtes {#edge-conditions}

Chaque arête possède une condition qui détermine quand le nœud en aval devient prêt :

| Condition | Le nœud en aval démarre lorsque le nœud en amont… |
|-----------|-------------------------------------------|
| **On success** | Se termine avec succès (par défaut). |
| **On failure** | Se termine avec une erreur. |
| **Always** | Se termine dans n'importe quel état terminal (succès ou échec). |

Utilisez les branches **On failure** pour des actions de compensation ou des
notifications. Utilisez **Always** lorsque l'étape suivante doit s'exécuter quel que
soit le résultat.

## Exécuter et surveiller {#running-and-monitoring}

- **Exécuter le workflow** — démarre une nouvelle exécution depuis la liste des workflows.
- **Vue d'exécution** — graphe en plein écran avec le statut en direct de chaque nœud
  (en cours d'exécution, succès, échec, approbation, compte à rebours de délai).
- **Arrêter** — pendant qu'une exécution est au statut `running` ou `approval`, les
  utilisateurs disposant de `run_project_tasks` peuvent l'arrêter. Toutes les tâches
  actives sont arrêtées, les approbations en attente sont rejetées et l'exécution est
  marquée **stopped**.

Statuts d'exécution : `running`, `approval`, `success`, `failed`, `stopped`.

## Gestion des versions d'exécution {#run-versioning}

Définissez **Version de départ** sur le workflow (par exemple `1.0.0`) pour activer les
étiquettes de version sur chaque exécution. Semaphore incrémente la version à chaque
nouvelle exécution, comme pour les modèles de build.

## Artefacts de workflow (set_stats) {#workflow-artifacts-set_stats}

Lorsqu'une tâche Ansible d'un workflow utilise `set_stats`, les variables sont stockées
comme **artefacts de workflow** pour cette exécution. Les nœuds de tâche en aval de la
même exécution les reçoivent automatiquement comme variables supplémentaires.

:::warning
Si des étapes du workflow s'exécutent sur des **runners distants**, les artefacts de
workflow ne circulent pas encore à travers les étapes exécutées sur un runner distant —
ils ne sont transmis qu'entre les tâches exécutées localement sur le serveur Semaphore.
Planifiez les transferts d'artefacts en conséquence ou gardez les étapes qui produisent
et consomment des artefacts sur le même chemin d'exécution.
:::

## Permissions {#permissions}

- La gestion des workflows (création, modification, suppression) nécessite les
  permissions de gestion des ressources du projet.
- L'exécution des workflows nécessite `run_project_tasks`.
- Le traitement des approbations nécessite un accès approprié au projet (les mêmes
  utilisateurs que ceux qui peuvent exécuter des tâches dans le projet).

## API {#api}

Les modèles et les exécutions de workflow sont disponibles sous
`/api/project/{project_id}/workflows`. Consultez la
[documentation de l'API](/reference/api) pour les schémas de requête et de réponse, y
compris les champs des nœuds `delay` (`delay_seconds`) et le point d'accès d'arrêt
(`POST …/runs/{run_id}/stop`).
