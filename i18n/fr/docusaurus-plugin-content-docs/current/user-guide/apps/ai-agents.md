---
title: Agents IA
description: Création d'un modèle d'agent Claude Code ou Codex, son prompt et les expressions de prompt, la clé API, les serveurs MCP, les arguments CLI et le journal de la tâche.
---

# Agents IA

Avec Semaphore UI, vous pouvez exécuter des agents de programmation IA : [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) et [Codex](https://developers.openai.com/codex/cli). Un modèle d'agent lance l'outil en ligne de commande de l'agent dans un répertoire d'un dépôt et lui transmet un prompt. L'agent travaille seul, sans personne pour répondre à ses questions, et rend compte de ce qu'il fait dans le journal de la tâche.

Utilisez un modèle d'agent pour un travail que vous décririez autrement à un collègue : relire le dernier commit, trouver et corriger un test en échec, mettre à jour une dépendance et ouvrir une pull request. Comme tout autre modèle, il peut être lancé à la main, par une [planification](/user-guide/schedules), une [intégration](/user-guide/integrations) ou un [workflow](/user-guide/workflows).

## Avant de commencer {#before-you-begin}

- **L'outil en ligne de commande de l'agent est installé** sur la machine qui exécute les tâches : le serveur Semaphore ou le [runner](/admin-guide/runners).

  | Application | ID | Commande | Installation |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore active une application lorsqu'il trouve sa commande dans le `PATH` au démarrage. Un administrateur peut aussi l'activer et définir le chemin de l'exécutable sur la page [Applications](/user-guide/apps#managing-applications).
- **Une clé API** du fournisseur du modèle, voir [Clé API](#api-key).
- **Un dépôt** dans lequel l'agent travaille, ajouté aux [Dépôts](/user-guide/repositories).

## Créer un modèle {#create-a-template}

1. Rendez-vous dans la section **Modèles de tâches**, cliquez sur **Nouveau modèle**, puis sur **Claude Code Agent** ou **Codex Agent**.

![Le menu Nouveau modèle avec les éléments Claude Code Agent et Codex Agent](/assets/agent-template-new.webp)

2. Configurez le modèle.

![L'éditeur d'un modèle Claude Code Agent](/assets/agent-template-editor.webp)

Le modèle vous permet de spécifier les paramètres suivants :

| Champ | Description |
|---|---|
| **Dépôt** | Le dépôt dans lequel l'agent travaille. Semaphore le clone ou le met à jour avant la tâche, comme pour tout autre modèle. |
| **Subdirectory path** | Facultatif. Le répertoire du dépôt dans lequel l'agent est lancé. S'il est omis, l'agent démarre à la racine du dépôt. |
| **MCP servers** | Facultatif. Un inventaire MCP contenant les serveurs dont l'agent peut appeler les outils, voir [Serveurs MCP](#mcp-servers). |
| **Groupes de variables** | Variables et secrets destinés à l'agent : la clé API, les valeurs des [expressions de prompt](#prompt-expressions), les variables d'environnement du processus de l'agent. |
| **Prompt** | L'instruction avec laquelle l'agent s'exécute, voir [Prompt](#prompt). |
| **CLI args** | Arguments supplémentaires pour la commande de l'agent, voir [Arguments CLI](#cli-arguments). |
| **Variables de sondage** | Questions posées au lancement de la tâche. Les réponses peuvent être insérées dans le prompt. |
| Case à cocher **Prompt** | Sous **Claude Code prompts** ou **Codex prompts**. Permet à la personne qui lance une tâche de remplacer le prompt, voir [Prompt d'une tâche](#prompt-of-a-task). |

3. Cliquez sur **Enregistrer**, puis lancez le modèle avec le bouton **Exécuter**.

## Clé API {#api-key}

L'agent lit sa clé API dans une variable d'environnement. Ajoutez la clé à un [groupe de variables](/user-guide/environment) du modèle en tant que **variable d'environnement secrète** :

| Application | Variable | Également acceptée |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

La session de l'utilisateur qui exécute Semaphore n'est pas utilisée : chaque tâche reçoit son propre répertoire de configuration de l'agent, vide, de sorte qu'une clé issue d'un groupe de variables est le seul moyen de s'authentifier.

Si aucune de ces variables n'est définie, le journal de la tâche indique laquelle ajouter, puis l'agent lui-même échoue avec sa propre erreur :

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## Prompt {#prompt}

Le prompt est ce que vous saisiriez dans l'agent : du texte brut, aussi long que nécessaire. Il est transmis à l'agent sur son entrée standard, il n'apparaît donc pas dans la liste des processus.

Le prompt est obligatoire, sauf si la case **Prompt** permet à une tâche d'apporter le sien.

### Expressions de prompt {#prompt-expressions}

Le prompt d'un modèle peut reprendre des valeurs des groupes de variables du modèle. Écrivez une expression entre doubles accolades, comme dans GitHub Actions, et Semaphore la remplace au démarrage de la tâche :

| Expression | Valeur |
|---|---|
| `${{ vars.extra.NAME }}` | Une variable supplémentaire d'un groupe de variables. |
| `${{ vars.env.NAME }}` | Une variable d'environnement d'un groupe de variables. |
| `${{ secrets.extra.NAME }}` | Une variable supplémentaire secrète d'un groupe de variables. |
| `${{ secrets.env.NAME }}` | Une variable d'environnement secrète d'un groupe de variables. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

Les règles :

- **Les variables de sondage** sont des variables supplémentaires : la réponse à la variable de sondage `version` est `${{ vars.extra.version }}`, et une variable secrète est `${{ secrets.extra.NAME }}`. Une variable de sondage transmise comme variable d'environnement se trouve en revanche sous `env`. Une variable de sondage laissée sans réponse donne une chaîne vide.
- **Une variable qui n'existe pas fait échouer la tâche** avant le démarrage de l'agent, avec un message qui nomme l'expression. Semaphore n'exécute pas un agent dont le prompt comporte un trou.
- **Une expression mal écrite est refusée à l'enregistrement du modèle** : `${{ secrets.TOKEN }}` ne contient ni `extra` ni `env`.
- **Les autres expressions sont laissées telles quelles.** Seules `vars.…` et `secrets.…` appartiennent à Semaphore, si bien qu'un prompt peut demander à l'agent d'écrire un workflow contenant `${{ github.sha }}`. Pour conserver une expression `vars` ou `secrets` sous forme de texte, faites-la précéder d'un signe dollar supplémentaire : `$${{ secrets.env.NAME }}`.
- **Une valeur est insérée telle quelle.** Une chaîne est utilisée comme elle est écrite, une liste ou un objet au format JSON. Les expressions ne sont pas recherchées de nouveau dans une valeur.
- **Un secret inséré dans le prompt est masqué** dans le journal de la tâche, partout où l'agent le répète.

:::warning

Un secret placé dans le prompt est envoyé au fournisseur du modèle avec le reste du prompt, et l'agent peut l'utiliser de toutes les façons que le prompt autorise. Préférez confier un secret aux outils de l'agent : en tant que variable d'environnement secrète d'un groupe de variables, ou en tant que jeton d'un [serveur MCP](#mcp-servers).

:::

### Prompt d'une tâche {#prompt-of-a-task}

Lorsque la case **Prompt** est cochée, le formulaire de tâche affiche le prompt du modèle et vous permet de le modifier pour une seule exécution. Une planification, une intégration ou une étape de workflow peut conserver son propre prompt de la même manière. Via l'API, envoyez-le dans les paramètres de la tâche :

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

Un prompt fourni par une tâche est utilisé exactement tel qu'il est écrit : **les expressions de prompt ne sont remplacées que dans le prompt enregistré dans le modèle**. Les variables et les secrets du projet restent ainsi hors de portée de quiconque a seulement le droit d'exécuter des tâches. Si le modèle ne l'autorise pas, une tâche qui apporte un prompt est refusée.

## Serveurs MCP {#mcp-servers}

Un agent peut appeler les outils de serveurs [MCP](https://modelcontextprotocol.io) distants : un gestionnaire de tickets, une recherche dans la documentation, votre propre service. Les serveurs sont conservés dans un inventaire de type **MCP Inventory**, et un même inventaire sert à la fois aux modèles Claude Code et Codex.

1. Rendez-vous dans la section **Inventaire**, cliquez sur **Nouvel inventaire**, puis sur **MCP Inventory**.
2. Ajoutez les serveurs et cliquez sur **Enregistrer**.
3. Sélectionnez l'inventaire dans le champ **MCP servers** du modèle.

![Le formulaire d'un inventaire MCP avec trois serveurs](/assets/agent-mcp-inventory.webp)

| Champ | Description |
|---|---|
| Interrupteur | Un serveur désactivé reste dans la liste et n'est pas transmis à l'agent. |
| **Name** | Le nom sous lequel l'agent connaît le serveur : jusqu'à 64 lettres, chiffres, `-` et `_`. Il est affiché dans le journal de la tâche devant le nom d'un outil. |
| **URL** | Une adresse `http` ou `https` d'un serveur qui parle MCP via HTTP ou SSE. Un nom d'utilisateur ou un mot de passe dans l'URL n'est pas accepté. |
| **Token** | Facultatif. L'agent l'envoie dans l'en-tête `Authorization` en tant que jeton bearer. |

Un jeton enregistré est stocké chiffré et n'est plus jamais affiché : saisissez-en un nouveau pour le remplacer, ou supprimez-le avec la croix. Le jeton parvient à l'agent sous forme de variable d'environnement de son processus ; il n'est écrit ni dans le fichier de configuration de l'agent, ni sur la ligne de commande, ni dans le journal de la tâche.

Les outils des serveurs sélectionnés sont approuvés à l'avance, puisque personne n'est là pour confirmer un appel. L'agent reçoit exactement ces serveurs : les serveurs MCP configurés pour l'utilisateur qui exécute Semaphore ne sont pas utilisés.

## Arguments CLI {#cli-arguments}

Les **CLI args** sont ajoutés à la commande de l'agent après les arguments que Semaphore définit lui-même. Saisissez chaque élément comme un argument distinct :

```json
["--model", "claude-sonnet-5-5"]
```

Utilisez-les pour ce qu'offre la ligne de commande de l'agent elle-même : le modèle, les limites, les autorisations. L'agent s'exécute sans surveillance : un outil qui demanderait une confirmation est donc refusé ; les outils qu'un agent peut utiliser sans demander sont définis par ses arguments. Consultez la [référence CLI de Claude Code](https://docs.claude.com/en/docs/claude-code/cli-reference) et la [référence CLI de Codex](https://developers.openai.com/codex/cli/reference) pour connaître les options de votre version.

Lorsque **CLI args** est activé sous **Prompts**, une tâche peut ajouter ses propres arguments.

Les variables et les secrets des groupes de variables ne sont pas ajoutés à la ligne de commande d'un agent, où la liste des processus les ferait apparaître. Les variables d'environnement et les variables d'environnement secrètes sont transmises au processus de l'agent.

## Comment l'agent s'exécute {#how-the-agent-runs}

Semaphore lance l'agent dans le répertoire du dépôt, ou dans son **Subdirectory path**, avec le prompt sur l'entrée standard :

| Application | Commande |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **Chaque tâche dispose de son propre répertoire de configuration** de l'agent (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`), créé pour la tâche et supprimé après celle-ci. Les paramètres, les sessions et les serveurs MCP de l'utilisateur qui exécute Semaphore ne parviennent pas à l'agent, et une variable d'un groupe de variables ne peut pas rediriger ce répertoire.
- **Rien n'est conservé entre les tâches** : chaque exécution est une nouvelle session de l'agent. Ce qui doit survivre à une exécution a sa place dans le dépôt : un commit, une pull request, un fichier.
- **L'agent lit les fichiers d'instructions du dépôt** que son outil en ligne de commande lit de lui-même dans le répertoire de travail, comme `CLAUDE.md` ou `AGENTS.md`.
- **Sur les runners Docker et Kubernetes**, l'agent s'exécute dans un conteneur : l'[image de l'exécuteur](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) doit donc contenir la commande `claude` ou `codex`.

## Journal de la tâche {#task-log}

Le journal de la tâche montre le travail de l'agent au fur et à mesure :

![Le journal d'une tâche Claude Code : le modèle, les appels d'outils, un sous-agent, le résumé](/assets/agent-task-log.webp)

- **Le texte** de l'agent, ligne par ligne. Codex affiche un message une fois qu'il est complet.
- **Les appels d'outils**, chacun sur une ligne : l'état, le serveur MCP et l'outil, les arguments. Cliquez sur une ligne pour voir les arguments et le résultat. Un appel en échec est déplié dès le départ.
- **Les sous-agents** : les lignes d'un sous-agent sont marquées de son nom.
- **La première ligne** d'une exécution Claude Code indique le modèle et les serveurs MCP, ceux qui ne se sont pas connectés apparaissant en rouge.
- **Le résumé** à la fin : le nombre de tours, la durée, les tokens et le coût, dans la mesure où l'agent les communique.

**Raw log** affiche le même journal sous forme de texte brut.

## Sécurité {#security}

- **Un agent exécute des commandes.** Dans la limite des autorisations que lui accorde son outil en ligne de commande, l'agent peut lire et modifier le répertoire du dépôt, lancer des programmes en tant qu'utilisateur qui exécute les tâches et appeler les outils de ses serveurs MCP. Accordez à un modèle d'agent l'accès que vous accorderiez à un script écrit par quelqu'un d'autre : un dépôt et des jetons dotés des droits les plus restreints permettant de faire le travail, et un [runner](/admin-guide/runners) distinct pour le travail que vous souhaitez tenir à l'écart du serveur.
- **Le prompt et ce que l'agent lit sont envoyés au fournisseur du modèle** : les fichiers du dépôt, la sortie des commandes, les résultats des outils.
- **Un dépôt peut donner des instructions à l'agent.** Du texte présent dans les fichiers que l'agent lit, dans un ticket ou dans le résultat d'un outil peut modifier ce que fait l'agent. Ne dirigez pas un agent disposant de jetons puissants vers du contenu que vous ne maîtrisez pas.
- **Les jetons et les secrets sont masqués dans le journal de la tâche** : les jetons des serveurs MCP et les secrets insérés dans le prompt sont remplacés par `********`.
- **Seul le prompt enregistré dans le modèle peut utiliser des variables et des secrets**, voir [Prompt d'une tâche](#prompt-of-a-task).
