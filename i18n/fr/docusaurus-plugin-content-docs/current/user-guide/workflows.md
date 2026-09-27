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
3. Ajoutez le premier nœud : cliquez sur un type dans la **Palette**, faites-le glisser sur
   le canevas, ou utilisez le bouton **+** dans le coin supérieur droit du canevas.
4. Survolez un nœud et cliquez sur la poignée **+** de son port de sortie pour ajouter
   l'étape suivante. Le nouveau nœud est placé à droite et relié par une arête
   **On success**. Vous pouvez aussi connecter des nœuds en tirant d'un port de sortie vers
   un port d'entrée.
5. Cliquez sur un nœud pour le modifier dans le **panneau de propriétés** à droite : type de
   nœud, modèle de tâche et paramètres de tâche, délai d'expiration et message d'approbation,
   durée du délai, convergence.
6. Cliquez sur la **pastille de condition** au milieu d'une arête pour changer sa condition,
   ou survolez-la et cliquez sur **×** pour supprimer l'arête.
7. Définissez un **nom** (et éventuellement une **version de départ** pour la gestion des
   versions d'exécution).
8. Corrigez les problèmes listés dans la puce **Problèmes** de la barre d'outils, puis
   cliquez sur **Enregistrer**.

![Éditeur de workflow](/assets/workflow-editor.webp)

L'éditeur valide le graphe au fil de votre travail. Les nœuds présentant un problème
affichent un badge d'avertissement, et la puce de la barre d'outils liste chaque problème ;
cliquez sur l'un d'eux pour sélectionner le nœud. Un workflow valide doit comporter au moins
un nœud, exactement un nœud de départ (sans arête entrante), aucun cycle, et une
configuration complète sur chaque nœud exécutable. **Enregistrer** reste désactivé tant que
le graphe n'est pas valide.

![Menu d'ajout rapide](/assets/workflow-editor-quick-add.webp)

### Commandes de l'éditeur {#editor-controls}

| Action | Comment |
|--------|-----|
| Déplacer le canevas | Faites glisser un espace vide, ou faites défiler avec la molette de la souris / le trackpad. |
| Zoomer | Maintenez <kbd>Ctrl</kbd> (<kbd>Cmd</kbd> sous macOS) et faites défiler, pincez sur le trackpad, ou utilisez les boutons **+** / **−** dans le coin inférieur gauche. |
| Afficher tout le graphe à l'écran | Cliquez sur le bouton **ajuster la vue** dans le coin inférieur gauche. L'éditeur ajuste aussi le graphe à l'ouverture. |
| Réorganiser les nœuds automatiquement | Cliquez sur **ranger** dans le coin inférieur gauche. Les nœuds s'alignent sur une grille de 20 px lorsque vous les déplacez. |
| Ajouter un nœud | Poignée **+** sur un nœud, clic ou glisser depuis la palette, le bouton **+**, ou clic droit sur un espace vide du canevas. |
| Supprimer le nœud ou l'arête sélectionné | <kbd>Delete</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> sous macOS), ou le bouton de suppression dans le panneau de propriétés. |
| Annuler / rétablir | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd> sous macOS), ou les flèches de la barre d'outils. Jusqu'à 50 étapes. |
| Désélectionner | <kbd>Esc</kbd> ferme le panneau de propriétés et efface la sélection. |

Quitter l'éditeur avec des modifications non enregistrées demande une confirmation. Le
point sur le bouton **Enregistrer** indique que le graphe diffère de la version enregistrée.

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

Lorsque l'exécution atteint un nœud d'approbation, le statut de l'exécution passe à
**approval** jusqu'à ce que quelqu'un approuve ou rejette. La carte d'approbation de la vue
d'exécution affiche le message d'approbation avec les boutons **Approuver** et **Rejeter**
pour les utilisateurs autorisés à exécuter des tâches dans le projet. Une approbation
rejetée fait échouer le nœud, et l'exécution continue le long des arêtes **On failure** ou
**Always**.

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
- **Vue d'exécution** — le même graphe que dans l'éditeur, en lecture seule, avec le statut
  en direct de chaque nœud. Une icône de statut dans le coin de la carte indique le succès,
  l'échec, l'exécution en cours, l'attente d'approbation ou le compte à rebours d'un délai ;
  le sous-titre indique la durée. Les nœuds qui n'ont pas encore démarré sont estompés, et
  l'arête menant à un nœud en cours d'exécution est animée.
- **Journal de tâche** — cliquez sur un nœud de tâche déjà démarré pour ouvrir son journal
  de tâche.
- **Arrêter** — pendant qu'une exécution est au statut `running` ou `approval`, les
  utilisateurs disposant de `run_project_tasks` peuvent l'arrêter. Toutes les tâches
  actives sont arrêtées, les approbations en attente sont rejetées et l'exécution est
  marquée **stopped**.

![Vue d'exécution du workflow](/assets/workflow-run.webp)

![Approbation en attente dans la vue d'exécution](/assets/workflow-run-approval.webp)

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
