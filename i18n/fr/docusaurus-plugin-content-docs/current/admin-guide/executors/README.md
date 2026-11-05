---
title: Exécuteurs
description: Comment un runner exécute les tâches avec l'exécuteur local, Docker ou Kubernetes, ce qui tourne dans les conteneurs et ce que les exécuteurs de conteneurs ne prennent pas en charge.
---

# Exécuteurs

Un exécuteur détermine **où un runner démarre le processus de la tâche**. Le runner
interroge toujours le serveur, reçoit la tâche et renvoie le journal ; seul l'endroit
où s'exécute le processus Ansible, Terraform ou shell change.

| Exécuteur | `runner.executor.type` | Où s'exécute une tâche | Édition |
|---|---|---|---|
| Local | `local` (par défaut) | Un processus enfant sur l'hôte du runner, avec les fichiers, les outils et le `PATH` du runner. | Community |
| Docker | `docker` | Un nouveau conteneur sur un démon Docker, supprimé après la tâche. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Un nouveau Pod dans un namespace Kubernetes, supprimé après la tâche. | <FeatureState feature="k8s-executor" /> |

L'exécuteur est un paramètre du **runner**, pas du serveur ni du modèle. Le serveur
Semaphore exécute toujours les tâches localement ; pour exécuter des tâches dans des
conteneurs, démarrez un [runner](/admin-guide/runners) et dirigez les modèles vers lui
avec un tag de runner.

## Choisir un exécuteur {#choose-an-executor}

| Vous avez besoin de | Utilisez |
|---|---|
| Outils installés sur une machine, accès à ses fichiers, sorties de workflow | Local |
| Un environnement propre pour chaque tâche, des chaînes d'outils différentes par modèle, sur un ou quelques hôtes | [Docker](./docker) |
| Des tâches réparties sur un cluster, le RBAC et les Secrets Kubernetes, pas de socket Docker | [Kubernetes](./kubernetes) |

## Définir l'exécuteur {#set-the-executor}

Ajoutez le bloc `executor` à la section `runner` du fichier de configuration du runner :

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

Ou définissez la variable d'environnement :

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

Chaque option a une variable d'environnement ; les listes complètes se trouvent sur les
pages [Docker](./docker#configuration-reference) et [Kubernetes](./kubernetes#configuration-reference).
Redémarrez le runner après avoir changé d'exécuteur.

:::info
Les exécuteurs de conteneurs font partie de la version Pro du runner. Utilisez l'image
`semaphoreui/runner` ou le binaire officiel `semaphore`. L'image
`semaphoreui/runner-community` est compilée sans eux et affiche
`docker executor is only available in the proprietary build` au démarrage.
:::

## Comment s'exécute une tâche en conteneur {#how-a-container-task-runs}

Les deux exécuteurs de conteneurs exécutent une tâche de la même manière :

1. **Préparation.** Le runner crée un espace de travail partagé et place les secrets de
   la tâche (clés SSH, mots de passe vault, variables supplémentaires, inventaire
   statique) là où les conteneurs peuvent les lire.
2. **Clonage.** Un conteneur *helper* éphémère clone le dépôt dans
   `/workspace/repo` (`git clone --depth 1` de la branche de la tâche).
3. **Build.** Le conteneur *build* démarre dans `/workspace/repo` et lance l'application :
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` ou le binaire d'une application personnalisée. Son code de sortie est le résultat de la tâche.
4. **Journal.** La sortie des deux conteneurs est diffusée dans le journal de la tâche pendant leur exécution.
5. **Nettoyage.** Les conteneurs, volumes, Secrets et ConfigMaps de la tâche sont supprimés,
   que la tâche ait réussi, échoué ou ait été arrêtée.

| Étape | Docker | Kubernetes |
|---|---|---|
| Espace de travail | Volume nommé `semaphore-workspace-<task>-<random>` | Volume `emptyDir` du Pod |
| Secrets | Volume nommé `semaphore-secrets-<task>-<random>`, monté en lecture seule | Un Secret ou ConfigMap par type, monté en lecture seule |
| Clonage | Conteneur `semaphore-job-<task>-<random>-clone` | Conteneur d'initialisation `git-clone` |
| Build | Conteneur `semaphore-job-<task>-<random>-build` | Conteneur `build` du Pod `semaphore-job-<task>-<random>` |
| Bouton Stop | `docker stop` avec `cleanup_grace_seconds`, puis suppression | Pod supprimé avec `cleanup_grace_seconds` |

Une tâche arrêtée depuis l'interface se termine au statut **Stopped**, comme avec l'exécuteur local.

## Dans le conteneur build {#inside-the-build-container}

| Chemin | Contenu |
|---|---|
| `/workspace` | Espace de travail accessible en écriture ; également le `HOME` de la tâche. |
| `/workspace/repo` | Le dépôt cloné ; le répertoire de travail. |
| `/secrets/ssh/<key id>/id_rsa` | Clé privée SSH du dépôt ou de l'inventaire. Chargée dans `ssh-agent` avant le démarrage de l'application. |
| `/secrets/vault/<name>` | Mot de passe Ansible vault, passé sous la forme `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Variables supplémentaires du groupe de variables plus `semaphore_vars`, passées sous la forme `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` ou `inventory.yml` | Un inventaire statique stocké dans Semaphore. Les inventaires de type fichier sont lus depuis le dépôt. |

Le conteneur reçoit un ensemble fixe de variables d'environnement, listées dans
[Variables d'environnement des tâches](/reference/task-environment#container-executors). Les
`env_vars`, `forwarded_env_vars`, le `PATH` et les chemins `apps.*` du runner ne sont **pas**
transmis au conteneur.

## Images {#images}

Deux images interviennent dans chaque tâche :

| Image | Par défaut | Utilisée pour | Requiert |
|---|---|---|---|
| Image de build | `semaphoreui/job:latest` | Exécuter l'application. | `sh`, le binaire de l'application dans le `PATH` ; pour les clés SSH `ssh-agent`, `ssh-add`, `setsid`. |
| Image helper | `semaphoreui/helper:latest` | Cloner le dépôt (Docker l'utilise aussi pour remplir le volume des secrets). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` est une Debian avec Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu et Terragrunt. Elle s'exécute avec l'utilisateur `nobody`, groupe `0`.

L'image de build est définie par runner (`image`) et peut être remplacée par modèle avec
le champ **Image de l'exécuteur**, voir
[Image de l'exécuteur](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
L'image helper est définie uniquement par runner.

### Construire une image personnalisée {#build-a-custom-image}

Étendez `semaphoreui/job` lorsque vos tâches ont besoin de collections Ansible, de paquets
Python ou d'outils supplémentaires. Les exécuteurs de conteneurs n'installent **pas** le
`requirements.yml` du dépôt : intégrez donc les collections et les rôles dans l'image :

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

Si vous construisez une image à partir de zéro, conservez ces propriétés de `semaphoreui/job` :

- `/workspace` existe et est accessible en écriture par l'utilisateur du conteneur.
- `/etc/passwd` est modifiable par le groupe (`chmod g=u /etc/passwd`). Un conteneur démarré
  avec un UID aléatoire (OpenShift) obtient alors une entrée passwd, requise par OpenSSH et Git.
- L'image n'a pas besoin de point d'entrée particulier : l'exécuteur lance son script avec `sh -c`.

## Limitations {#limitations}

Par rapport à l'exécuteur local, les exécuteurs de conteneurs actuellement :

| Non pris en charge | Que faire à la place |
|---|---|
| Identifiants d'inventaire de type **Login with password** (mot de passe SSH ou mot de passe become) | Utilisez une clé SSH. Une tâche avec une telle clé échoue avec `inventory login_password authentication is not supported`. |
| Tâches Terraform qui attendent une confirmation manuelle | Activez **Auto approve** dans le modèle, ou exécutez des tâches de plan uniquement. Sinon la tâche échoue avec `terraform manual approval is not supported`. |
| Dépôts de type **Local** | L'espace de travail reste vide ; utilisez un dépôt Git. |
| Installation de `requirements.yml` (rôles et collections Galaxy) | [Intégrez-les dans l'image](#build-a-custom-image). |
| Sorties de workflow (`SEMAPHORE_OUTPUTS_FILE`) | Utilisez l'exécuteur local pour les tâches dont un workflow lit les sorties. |
| Identifiants par hôte issus de la configuration de l'hôte | Utilisez l'exécuteur local. |
| Historique Git au-delà du dernier commit | Le clone est superficiel (`--depth 1`). |

Les clés d'hôte SSH ne sont pas vérifiées : le clonage accepte une nouvelle clé d'hôte, et
Ansible s'exécute avec `ANSIBLE_HOST_KEY_CHECKING=False`.

## Pages associées {#related-pages}

- [Exécuteur Docker](./docker) : installation, configuration, sécurité, dépannage.
- [Exécuteur Kubernetes](./kubernetes) : RBAC, déploiement du runner, configuration, dépannage.
- [Runners](/admin-guide/runners) : enregistrer et démarrer un runner.
- [Options de configuration](/reference/configuration) : toutes les options `runner.executor.*`.
