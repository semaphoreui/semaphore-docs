---
title: Client
description: Gérer un serveur Semaphore depuis le terminal et depuis des scripts avec semaphore client - connexion et contextes, priorité de la configuration, formats de sortie, codes de sortie et lancement de tâches depuis la CI.
---

# Client

`semaphore client` pilote un serveur Semaphore en cours d'exécution via son API REST.
Il n'a besoin que d'une URL de serveur et d'un token d'API — ni accès à la base de
données ni fichier de configuration du serveur —, il fonctionne donc depuis un
portable, un job de CI ou un hôte qui n'a jamais vu le `config.json` du serveur.

```bash
semaphore client --help
```

Les commandes suivent la forme `semaphore client <resource> <action> [id|name]`.
Les ressources sont nommées au singulier, le pluriel servant d'alias
(`template list` et `templates list` sont identiques). Chaque ressource dispose de `list`,
`get`, `create`, `update` et `delete` ; les tâches y ajoutent `run`, `logs`, `wait`, `stop`
et d'autres. La liste exhaustive et générée de toutes les commandes et options se trouve
dans la [référence des commandes](/reference/cli/commands#semaphore-client).

| Groupe | Rôle |
|--------|------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Se connecter, vérifier le token, l'afficher, se déconnecter. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Conserver plusieurs serveurs dans un seul fichier de configuration et passer de l'un à l'autre. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Projets, leurs membres, sauvegardes et restaurations. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Modèles de tâches, et `template run` pour lancer une tâche. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Journaux, attente, arrêt, confirmation et relance des tâches. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | Les autres ressources d'un projet. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Ressources globales au serveur (administrateurs uniquement). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Version et paramètres du serveur. |

## Première connexion {#first-login}

En mode interactif, le client demande le login, le mot de passe et, si le TOTP est
activé, le code, puis crée un token d'API et l'enregistre. Le mot de passe est utilisé
une seule fois et n'est jamais stocké.

```bash
semaphore client auth login --url https://semaphore.example.com
```

Avec un token existant (c'est aussi la façon de se connecter à un serveur qui ne propose
que l'authentification unique — créez le token sur la page **Tokens** de votre profil) :

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Les deux variantes enregistrent un *contexte* nommé d'après l'hôte du serveur dans
`~/.semaphore/client.yml` et en font le contexte courant. Vérifiez celui qui est utilisé avec
`semaphore client auth status`.

## Configuration {#configuration}

Chaque paramètre peut provenir d'une option, d'une variable d'environnement ou du contexte
courant, dans cet ordre de priorité : **option > environnement > contexte > valeur par défaut**.

| Option | Variable d'environnement | Signification |
|--------|--------------------------|---------------|
| `--url` | `SEMAPHORE_CLIENT_URL` | URL du serveur, par exemple `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Nom du contexte à utiliser à la place du contexte courant. |
| — | `SEMAPHORE_CLIENT_TOKEN` | Token d'API. Il n'y a volontairement pas d'option `--token` : les arguments des processus sont visibles dans `ps` et dans l'historique du shell. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | Fichier contenant le token (un saut de ligne final est ignoré). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | Id ou nom du projet pour les commandes liées à un projet. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (par défaut), `json` ou `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Délai d'expiration d'une requête HTTP, par défaut `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | Fichier PEM contenant l'autorité de certification qui a signé le certificat du serveur. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | Ignorer la vérification TLS. Chaque appel affiche un avertissement ; préférez `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | Ne jamais poser de question ; une commande qui attendrait une réponse échoue à la place. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | Tracer les requêtes HTTP sur stderr. Les en-têtes d'autorisation et de cookies sont masqués. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Chemin du fichier de configuration, par défaut `~/.semaphore/client.yml`. |

Un token provenant de l'environnement n'est utilisé que si l'URL provient elle aussi de
l'environnement ou d'une option. Cela évite qu'un token de CI soit envoyé à un autre
serveur lorsque quelqu'un exécute le même job avec `--context other`.

### Le fichier de configuration {#the-configuration-file}

`~/.semaphore/client.yml` contient des contextes nommés. `auth login` et `context set`
l'écrivent ; vous pouvez aussi le modifier à la main.

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # ou token_file
    project: 3                # projet par défaut, id ou nom
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

Le client crée le répertoire avec le mode `0700` et le fichier avec `0600`. Un fichier
accessible en écriture au groupe ou aux autres est refusé, avec une suggestion d'exécuter
`chmod 600` ; un fichier lisible par les autres produit un avertissement.

## Sortie {#output}

Les données vont sur stdout ; les messages, avertissements et la progression vont sur
stderr, afin qu'un script puisse capturer les uns sans les autres.

| Option | Effet |
|--------|-------|
| `-o json` | JSON valide sans décoration. Une liste est toujours un tableau, une liste vide vaut `[]`. Les noms des champs sont ceux de l'API. |
| `-o yaml` | Les mêmes données en YAML. |
| `--fields id,name,status` | Uniquement ces colonnes ou champs. Les champs imbriqués utilisent un point : `--fields id,params.limit`. |
| `-q`, `--quiet` | Uniquement les ids, un par ligne — pour `xargs` et les boucles. |
| `--no-headers` | Tableau sans la ligne d'en-tête. |
| `--no-color` | Pas de couleurs. Les couleurs sont aussi désactivées lorsque stdout n'est pas un terminal ou que `NO_COLOR` est défini. |

Lorsque stdout n'est pas un terminal, les colonnes du tableau sont séparées par une
tabulation et jamais tronquées.

Les objets sont désignés par leur id numérique ou par leur nom. Un nom est recherché dans
le projet sans tenir compte de la casse ; lorsque plusieurs objets le partagent, la
commande se termine avec le code 5 et liste les candidats sur stderr.

## Codes de sortie {#exit-codes}

| Code | Signification |
|------|---------------|
| `0` | Succès. Pour une commande d'attente : la tâche s'est terminée avec `success`. |
| `1` | Erreur du client ou de l'API — panne réseau, erreur du serveur, réponse inattendue. |
| `2` | Erreur d'utilisation : option inconnue, argument manquant, aucun projet indiqué, ou confirmation requise sans terminal (passez `--yes`). |
| `3` | La tâche attendue s'est terminée avec le statut `error`. |
| `4` | Échec de l'authentification (HTTP 401 ou 403). |
| `5` | Objet introuvable, ou nom correspondant à plusieurs objets. |
| `6` | La tâche attendue s'est terminée avec le statut `stopped`. |
| `124` | `--wait-timeout` a expiré. La tâche continue de s'exécuter sur le serveur. |
| `130` | Interrompu avec Ctrl+C. Le client se déconnecte ; la tâche continue de s'exécuter sauf si `--stop-on-interrupt` a été indiqué. |

## Lancer des tâches depuis des scripts {#running-tasks-from-scripts}

Configurez un job de CI entièrement par l'environnement et laissez le code de sortie
décider du résultat :

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Lancer une tâche, diffuser son journal, sortir avec 0/3/6 selon son statut final
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Lancer maintenant, attendre plus tard
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` et `--extra-vars-file` renseignent les variables supplémentaires de la tâche ;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` et `--diff` remplacent
ce que le modèle autorise à remplacer.

Une tâche peut s'arrêter en cours de route et attendre une approbation : un plan
Terraform avant son application, ou tout modèle dont l'application demande
d'abord. Dans un terminal, le client affiche `Apply task <id>? [yes/no]` et
transmet la réponse au serveur. Sans terminal, il signale l'arrêt sur stderr et
continue d'attendre ; un job CI a donc besoin de `task confirm <id>` ou
`task reject <id>` depuis ailleurs, de `--auto-approve` si le modèle l'autorise,
ou de `--wait-timeout` pour abandonner. Pour un pipeline qui ne doit jamais
s'arrêter devant une barrière, `--auto-reject` refuse une telle tâche dès
qu'elle demande. Une tâche rejetée se termine en `error`, donc avec le code de
sortie 3.

Combinez `-o json` avec `jq` pour tout ce que le tableau n'affiche pas :

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Secrets et tokens {#secrets-and-tokens}

- Le token n'est jamais affiché, sauf par `auth token`, qui existe pour le transmettre à
  un autre outil et avertit lorsque stdout est un terminal.
- Les mots de passe et le matériel de clé ne sont lus que depuis des fichiers ou stdin :
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. Les secrets d'environnement passent par
  `environment create --secrets-file`.
- `environment get` et `key get` affichent les noms des secrets, jamais leurs valeurs,
  dans tous les formats de sortie.
- `auth logout --revoke` supprime le token sur le serveur ainsi qu'en local.
- Les commandes destructrices demandent une confirmation dans un terminal et exigent
  `--yes` sans terminal ; `project delete` exige le nom du projet avec `--confirm`.
