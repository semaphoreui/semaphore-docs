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

## Sorties et entrées {#outputs-and-inputs}

Un nœud de tâche peut transmettre des données structurées aux nœuds qui le suivent. La tâche
**produit des sorties** : un objet JSON de valeurs nommées, stocké avec la tâche lorsqu'elle
réussit. Une connexion vers le nœud de tâche suivant **fournit des entrées** : elle renseigne
les variables de sondage du modèle de ce nœud à partir des sorties du nœud précédent. Aucun
fichier n'est transmis, seulement des valeurs.

### Produire des sorties {#producing-outputs}

Chaque tâche démarrée par une exécution de workflow reçoit la variable d'environnement
`SEMAPHORE_OUTPUTS_FILE` : le chemin d'un fichier vide créé pour cette seule tâche. Tout ce que
la tâche y écrit sous forme d'objet JSON devient ses sorties.

| Application | Comment les sorties sont produites |
|-----|--------------------------|
| **Ansible** | `ansible.builtin.set_stats` avec `per_host: false` (par défaut). Le plugin de callback fourni `semaphore_outputs` écrit dans le fichier les statistiques agrégées de l'exécution ; les statistiques par hôte ne sont pas des sorties. |
| **Terraform, OpenTofu, Terragrunt** | Capturées automatiquement depuis `output -json` après une exécution réussie. Une valeur que la tâche a elle-même écrite dans le fichier l'emporte sur une sortie capturée du même nom. |
| **Bash, Python, PowerShell, Pulumi** | Le script écrit le fichier. |

```bash
# Bash : écrire le fichier de sorties
cat > "$SEMAPHORE_OUTPUTS_FILE" <<EOF
{"image_tag": "1.4.2", "replicas": 3, "subnet_ids": ["subnet-1", "subnet-2"]}
EOF
```

```yaml
# Ansible : set_stats devient des sorties
- name: Publish the image tag for the next nodes
  ansible.builtin.set_stats:
    data:
      image_tag: "{{ built_tag }}"
```

Règles :

- Les sorties ne sont lues que si la tâche **réussit**. Une tâche en échec ou arrêtée n'en a
  aucune, donc une branche **On failure** ne reçoit rien du nœud qui a échoué.
- Les noms de sorties correspondent à `^[A-Za-z_][A-Za-z0-9_-]*$`. Une valeur peut être
  n'importe quelle valeur JSON : chaîne, nombre, booléen, liste ou objet.
- Limites : le fichier fait au plus 256 Ko, avec au plus 100 sorties d'au plus 32 Ko chacune.
- Un fichier absent ou vide signifie « aucune sortie ». Un fichier qui n'est pas un objet JSON,
  qui utilise un nom invalide ou qui dépasse une limite **fait échouer la tâche**, avec la raison
  dans son journal.
- Les sorties Terraform qui ne peuvent pas être stockées — marquées `sensitive`, trop
  volumineuses, avec un nom invalide ou au-delà des limites — sont ignorées et listées dans le
  journal de la tâche et dans le panneau **Sorties** (Outputs) de la tâche comme **Non capturées** (Not captured). Elles ne
  font jamais échouer la tâche.

### Fournir des entrées {#delivering-inputs}

Cliquez sur une connexion qui aboutit à un nœud de tâche : son panneau latéral comporte une
section **Entrées** (Inputs).

- **Par nom** (par défaut). Chaque sortie du nœud source dont le nom est identique à celui d'une
  variable de sondage du modèle de destination renseigne cette variable. Les sorties sans
  variable correspondante sont ignorées ; une sortie Terraform contenant un trait d'union n'est
  jamais un nom de variable valide, elle n'est donc pas transmise.
- **Mapper les entrées explicitement** (Map inputs explicitly)**.** Cochez la case pour ne transmettre que les paires que
  vous listez : une variable de sondage du modèle de destination et la clé de sortie qui
  l'alimente. Une liste vide ne transmet rien. Dès que le workflow a une exécution terminée, le
  panneau suggère les clés produites par cette exécution et signale une clé qui n'a pas été
  capturée.

Une variable qu'aucune connexion ne renseigne prend la valeur définie sur le nœud, puis la valeur
par défaut de la variable. Une variable **obligatoire** laissée sans valeur fait échouer la tâche
du nœud avant son démarrage, avec une ligne de journal qui nomme la variable, de sorte que
l'exécution suit ses arêtes **On failure**.

Les valeurs sont converties vers le type de la variable : une variable `int` accepte un nombre ou
une chaîne de chiffres, une variable `enum` ou `select` n'accepte que ses propres options, une
variable `string` ou `text` accepte tout (un objet ou une liste arrive sous forme de JSON
compact). Une valeur qui ne convient pas est ignorée, avec la raison dans le journal de la tâche,
et la valeur de repli s'applique.

**Les nœuds d'approbation et de délai** laissent passer les sorties : `task → approval → task`
transmet toujours les données, et c'est le mode de la dernière connexion qui s'applique.

**Plusieurs connexions vers un même nœud.** Chaque connexion dont la source a réussi contribue.
Lorsque deux d'entre elles renseignent la même variable, un mappage explicite l'emporte sur une
transmission par nom ; entre deux connexions du même type, celle créée en premier l'emporte, de
sorte qu'une exécution donne toujours le même résultat. Le journal de la tâche indique laquelle
l'a emporté.

![The connection panel in by-name mode: matched survey variables are ticked](/assets/workflow-inputs-by-name.webp)

![The connection panel with explicit mapping: one output key per survey variable](/assets/workflow-inputs-explicit.webp)

### Où les voir {#where-to-see-outputs}

- La **vue d'exécution** affiche un badge *N sorties* (N outputs) sur chaque nœud qui en a produit.
- La **boîte de dialogue de la tâche** comporte un tableau **Sorties** avec les valeurs et la
  liste *Non capturées*.
- Le journal d'une tâche alimentée par une connexion commence par une ligne par variable, par
  exemple `Input "image_tag" <- output "image_tag" of node 3 (task #41)`, de sorte que la source
  de chaque valeur se trouve une ligne au-dessus de la valeur elle-même.

![Run view: nodes that produced outputs carry a badge](/assets/workflow-run-outputs.webp)

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Task dialog, Details tab: the Outputs table](/assets/task-outputs.webp)
</div>

### Limitations {#outputs-limitations}

- Les sorties sont stockées et affichées en clair pour toute personne pouvant voir la tâche.
  **Ne transmettez pas de secrets via les sorties.** Une variable de sondage de type `secret` ne
  peut pas être renseignée par une connexion.
- Les sorties sont des valeurs, jamais du code : Ansible les reçoit comme des chaînes littérales,
  et une expression Jinja2 contenue dans une valeur n'est pas évaluée.
- Les tâches exécutées sur des runners distants produisent et reçoivent des sorties comme les
  tâches exécutées sur le serveur. Les tâches exécutées par l'exécuteur **Docker** ou
  **Kubernetes** d'un runner ne produisent pas encore de sorties ; leur journal l'indique.

## Variables d'environnement {#environment-variables}

Une tâche démarrée par un workflow reçoit, en plus des
[variables reçues par chaque tâche](./tasks#environment-variables) :

| Variable | Valeur |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | ID du workflow |
| `SEMAPHORE_WORKFLOW_RUN_ID` | ID de l'exécution en cours |
| `SEMAPHORE_WORKFLOW_URL` | Lien vers la page de l'exécution, par exemple `https://semaphore.example.com/project/1/workflows/7/runs/42` (nécessite `web_host` dans la configuration du serveur) |
| `SEMAPHORE_OUTPUTS_FILE` | Chemin du fichier dans lequel la tâche écrit ses [sorties](#producing-outputs) |

Ces variables sont définies pour toutes les applications, y compris Ansible et Terraform, et sont transmises aux tâches exécutées sur des runners distants.

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
compris les champs des nœuds `delay` (`delay_seconds`), `input_mode` et `input_mappings` sur
les arêtes, le document `artifacts` de chaque tâche dans les détails de l'exécution
(`GET …/runs/{run_id}`) et le point d'accès d'arrêt (`POST …/runs/{run_id}/stop`).
