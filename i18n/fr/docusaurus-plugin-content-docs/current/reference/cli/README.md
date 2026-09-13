# CLI

Le binaire `semaphore` est à la fois le serveur et un outil d'administration complet. Exécutez-le
sans argument (ou `semaphore help`) pour lister toutes les commandes :

```bash
semaphore help
```

Pour la liste exhaustive et générée de toutes les commandes et options, voir la
[référence des commandes](/reference/cli/commands). La plupart des tâches
d'administration disposent d'un groupe de commandes dédié :

| Groupe de commandes | Rôle |
|---------------------|------|
| [`semaphore users`](/reference/cli/users) | Ajouter, modifier, supprimer et consulter des utilisateurs ; gérer les tokens d'API et le TOTP (2FA). |
| [`semaphore projects`](/reference/cli/projects) | Exporter et importer des projets (sauvegardes). |
| [`semaphore vaults`](/reference/cli/vaults) | Rechiffrer les secrets stockés et consulter l'utilisation des clés de chiffrement. |
| [`semaphore runner`](/reference/cli/runners) | Fonctionner en mode runner et enregistrer/désenregistrer des runners. |
| [`semaphore migrate`](/reference/cli/migrations) | Appliquer ou annuler des migrations de base de données. |

Plusieurs groupes de commandes ont des alias plus courts : `users`/`user`, `projects`/`project`,
`vaults`/`vault` et `server`/`service`.

:::info
Chaque commande qui touche à la base de données (`users`, `projects`, `vaults`, `migrate`,
`server`) applique toutes les migrations de schéma en attente avant de s'exécuter. Effectuez une
sauvegarde de la base de données avant d'exécuter la CLI d'une version plus récente de Semaphore
sur une base de données existante.
:::

## Options globales {#global-options}

Ces options sont acceptées par toutes les commandes :

| Option | Description |
|--------|-------------|
| `--config <path>` | Chemin du fichier de configuration. |
| `--no-config` | Ne lire aucun fichier de configuration — utiliser uniquement les variables d'environnement. |
| `--log-level <level>` | Verbosité des journaux : `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` ou `PANIC`. Utilise par défaut la variable d'environnement `SEMAPHORE_LOG_LEVEL`. |
| `--debug-filter <spec>` | Restreint la sortie `DEBUG` à des espaces de noms spécifiques, p. ex. `'runner,task_*'` ou `'*,-db'`. N'a d'effet que lorsque le niveau de journalisation est `DEBUG`. Utilise par défaut `SEMAPHORE_DEBUG_FILTER`. |

### Comment le fichier de configuration est trouvé {#how-the-configuration-file-is-found}

Lorsque `--config` est omis, Semaphore recherche le fichier dans l'ordre suivant et utilise
le premier qui existe :

1. Le chemin indiqué dans la variable d'environnement `SEMAPHORE_CONFIG_PATH`.
2. `config.json`, `config.yaml` ou `config.yml` dans le répertoire courant.
3. `/usr/local/etc/semaphore/config.json` (ou `.yaml` / `.yml`).
4. `/etc/semaphore/config.json` (ou `.yaml` / `.yml`).

Les variables d'environnement sont appliquées par-dessus le fichier ; elles remplacent donc
les valeurs du fichier. Avec `--no-config`, seules les variables d'environnement et les valeurs
par défaut sont utilisées. Consultez [Configuration](/admin-guide/configuration) pour la liste
complète des options.

## Version {#version}

Affiche la version actuelle.

```bash
semaphore version
```

## Configuration interactive {#interactive-setup}

Utilisez cette commande pour la configuration initiale. Elle génère les secrets, vous guide à
travers un questionnaire interactif, écrit le fichier de configuration, exécute les migrations
de base de données et crée le premier utilisateur administrateur.

```bash
semaphore setup
```

Passez `--config <path>` pour choisir l'emplacement où le fichier de configuration est écrit.
Sans cette option, la configuration demande un répertoire de sortie (par défaut : le répertoire
courant) et y écrit `config.json`.

Si le nom d'utilisateur ou l'e-mail saisi existe déjà, la configuration conserve l'utilisateur
existant au lieu d'en créer un nouveau.

À la fin, elle affiche les commandes pour démarrer le serveur, par exemple :

```bash
./semaphore server --config /path/to/config.json
```

## Mode serveur {#server-mode}

Démarre le serveur Semaphore (interface web et API). `service` est un alias de `server`.

```bash
semaphore server --config /path/to/config.json
```

Le serveur applique les migrations de base de données en attente au démarrage et affiche la
base de données, le chemin temporaire, l'interface et le port qu'il utilise.

## Mode runner {#runner-mode}

Exécute Semaphore en tant que runner de tâches. Consultez [Runners](/reference/cli/runners) pour
l'ensemble complet des sous-commandes (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/runner-config.json
```

## Migration de la base de données {#database-migration}

Met à jour le schéma de la base de données. Consultez
[Migrations de base de données](/reference/cli/migrations) pour appliquer ou annuler des
migrations jusqu'à une version spécifique.

```bash
semaphore migrate --config /path/to/config.json
```
