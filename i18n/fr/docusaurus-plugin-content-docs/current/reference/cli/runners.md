# Runners

La commande `semaphore runner` exécute Semaphore en **mode runner** et gère l'enregistrement
d'un runner auprès du serveur. Un runner exécute les tâches sur une machine distincte du
serveur Semaphore.

```bash
semaphore runner --help
```

:::tip
Pour comprendre le fonctionnement des runners et la configuration côté serveur, consultez le
guide [Runners](/admin-guide/runners).
:::

Exécuter `semaphore runner` sans sous-commande affiche simplement l'aide. Elle possède les
sous-commandes suivantes :

| Commande | Rôle |
|----------|------|
| [`runner setup`](#interactive-setup-runner-setup) | Créer interactivement un fichier de configuration de runner (et l'enregistrer si un token est fourni). |
| [`runner register`](#registering-a-runner-runner-register) | Enregistrer le runner sur le serveur à l'aide d'un token d'enregistrement. |
| [`runner start`](#starting-a-runner-runner-start) | Fonctionner en mode runner et commencer à accepter des tâches. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Supprimer l'enregistrement du runner sur le serveur. |

Toutes les sous-commandes acceptent l'option globale `--config <path>` pour désigner le fichier
de configuration du runner (et `--no-config` pour fonctionner uniquement à partir des variables
d'environnement).

## Configuration interactive (`runner setup`) {#interactive-setup-runner-setup}

Vous guide à travers une configuration interactive, écrit un fichier de configuration de runner
et, si un token d'enregistrement est disponible (saisi lors des invites ou défini via
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`), enregistre immédiatement le runner auprès du serveur.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Passez `--config <path>` pour choisir l'emplacement où le fichier de configuration est écrit.
Sans cette option, la configuration demande un répertoire de sortie (par défaut : le répertoire
courant) et y écrit `config.runner.json`.

À la fin, elle affiche les commandes pour lancer le runner, par exemple :

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

Vous pouvez ensuite modifier manuellement le fichier de configuration généré au lieu de
relancer la configuration.

### Options de configuration du runner {#runner-configuration-options}

Champs du bloc `runner` du fichier de configuration :

| Champ | Variable d'environnement | Description |
|-------|--------------------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Token d'authentification du runner (délivré lors de l'enregistrement). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Token d'enregistrement. Variable d'environnement uniquement ; il n'est jamais écrit dans le fichier. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Chemin d'un fichier contenant le token d'enregistrement. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Nom du runner affiché sur le serveur. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | Tableau JSON de tags pour le routage des runners par projet. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL appelée par le serveur lorsqu'une tâche est mise en file d'attente pour ce runner. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Indique si le runner accepte des tâches. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | ID du projet pour un runner de niveau projet. À omettre pour un runner global. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Intervalle d'interrogation en secondes. Par défaut : 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Nombre maximal de tâches simultanées. Par défaut : 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Quitter après avoir traité un seul job. Utile pour les runners démarrés à la demande par un webhook. |

Consultez [Runners](/admin-guide/runners) pour les détails de configuration et
[Configuration](/admin-guide/configuration) pour la liste complète des options.

## Enregistrer un runner (`runner register`) {#registering-a-runner-runner-register}

Enregistre le runner sur le serveur et stocke le token de runner délivré dans le fichier de
configuration (en écrasant tout token existant). Le serveur doit avoir un
`runner_registration_token` configuré ; vous passez ce même token ici.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Option | Description |
|--------|-------------|
| `--registration-token-file <path>` | Lire le token d'enregistrement depuis un fichier. |
| `--stdin-registration-token` | Lire le token d'enregistrement depuis stdin. |
| `--name <name>` | Nom sous lequel enregistrer le runner. |
| `--tags <tags>` | Tags du runner, séparés par des virgules ou en répétant l'option (p. ex. `--tags a,b` ou `--tags a --tags b`). |
| `--webhook <url>` | URL du webhook du runner. |
| `--enabled` | Active ou désactive le runner sur le serveur. Par défaut `true` ; passez `--enabled=false` pour enregistrer un runner désactivé. |
| `--project-id <id>` | Enregistre un runner de niveau projet pour le projet donné. Si omis (ou `0`), le runner est enregistré comme runner global. |

Seules les options que vous passez réellement sont appliquées ; `--name`, `--webhook`, `--tags`
et `--enabled` n'écrasent les valeurs correspondantes du fichier de configuration et de
l'environnement que lorsqu'elles sont définies sur la ligne de commande.

### D'où provient le token d'enregistrement {#where-the-registration-token-comes-from}

Lors de l'enregistrement, Semaphore résout le token d'enregistrement à partir de la première
source disponible, dans cet ordre :

1. L'option `--registration-token-file`.
2. Le paramètre `registration_token_file` du fichier de configuration (ou
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. L'entrée standard, lorsque `--stdin-registration-token` est passé.
4. La variable d'environnement `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`.

Un fichier de token qui existe mais est vide constitue une erreur. Si aucune source ne fournit
de token, l'enregistrement est tenté sans token et le serveur le rejette.

## Démarrer un runner (`runner start`) {#starting-a-runner-runner-start}

Démarre le runner, se connecte au serveur et commence à accepter des tâches. C'est la commande
à exécuter pour maintenir en ligne un runner enregistré.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Option | Description |
|--------|-------------|
| `--auto-register` | Enregistre le runner avant de démarrer s'il n'est pas déjà enregistré (c'est-à-dire si la configuration ne contient pas de token de runner). |
| `--register` | Alias de `--auto-register`. |

Avec `--auto-register`, si la configuration ne contient pas de `token`, Semaphore lit le token
d'enregistrement depuis `registration_token_file` (ou
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) ou depuis
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, puis réessaie l'enregistrement toutes les 5 secondes
jusqu'à ce qu'il réussisse, recharge la configuration et démarre. C'est pratique pour les
runners qui s'enregistrent eux-mêmes au premier démarrage, par exemple dans des conteneurs.

`runner start` n'accepte pas `--registration-token-file` ni `--stdin-registration-token` ;
ces options appartiennent uniquement à `runner register`.

## Désenregistrer un runner (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Supprime l'enregistrement du runner sur le serveur, à l'aide du token de runner du fichier de
configuration.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
