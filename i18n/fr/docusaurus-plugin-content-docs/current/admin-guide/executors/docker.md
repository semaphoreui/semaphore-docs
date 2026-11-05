---
title: Exécuteur Docker
description: Exécutez chaque tâche d'un runner dans un nouveau conteneur Docker sur un démon local ou distant, avec des exemples de configuration, des notes de sécurité et un guide de dépannage.
sidebar_custom_props:
  edition: pro
---

# Exécuteur Docker <FeatureState feature="docker-executor" />

Avec l'exécuteur Docker, un runner démarre chaque tâche dans un nouveau conteneur et le
supprime à la fin de la tâche. Le runner communique avec un démon Docker via son API : le
démon peut être sur le même hôte, ou distant via TLS.

Le déroulement d'une tâche en conteneur, le contenu du conteneur et ce qui n'est pas pris
en charge sont décrits dans [Exécuteurs](./#how-a-container-task-runs). Cette page couvre la configuration Docker.

## Avant de commencer {#before-you-begin}

- Un serveur Semaphore avec une licence Pro ou Enterprise.
- Un runner enregistré sur le serveur, voir [Runners](/admin-guide/runners). Utilisez
  l'image `semaphoreui/runner` ou le binaire officiel `semaphore`.
- Docker Engine accessible depuis le runner, avec le droit de l'utiliser : appartenance au
  groupe `docker`, accès au socket monté, ou certificats client TLS.
- Le démon peut récupérer `semaphoreui/job` et `semaphoreui/helper` (ou vos propres images).

## Démarrage rapide {#quick-start}

Ajoutez l'exécuteur à la configuration du runner et redémarrez le runner :

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

Sans autre option, le runner utilise le socket local (`DOCKER_HOST` s'il est défini,
sinon `unix:///var/run/docker.sock`), l'image de build `semaphoreui/job:latest` et
le réseau `bridge`.

Lancez n'importe quelle tâche dirigée vers ce runner. Le journal de la tâche commence par :

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

Pendant l'exécution de la tâche, vous pouvez voir ses conteneurs :

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Exemples {#examples}

### Binaire du runner sur un hôte Docker {#runner-binary-on-a-docker-host}

Le runner s'exécute comme service systemd sur le même hôte que Docker. Donnez à son
utilisateur l'accès au socket :

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### Runner dans un conteneur avec le socket de l'hôte {#runner-in-a-container-with-the-host-socket}

Le conteneur du runner pilote le démon de l'hôte via le socket monté ; les conteneurs des
tâches sont des voisins du runner, pas des conteneurs imbriqués. L'image du runner s'exécute
avec l'UID `1001` : ajoutez-le donc au groupe propriétaire du socket :

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

Le volume `semaphore-runner-data` conserve le token du runner émis lors de l'enregistrement,
afin que le runner ne s'enregistre pas de nouveau après un redémarrage.

La même chose avec Docker Compose :

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

Les secrets parviennent à la tâche par un volume nommé sur le démon, jamais par le système
de fichiers du runner : aucun autre chemin n'a donc besoin d'être partagé entre le runner et l'hôte.

### Démon Docker distant via TLS {#remote-docker-daemon-over-tls}

Le runner et le démon sont sur des machines différentes. Protégez le port du démon avec
du TLS mutuel (voir [Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
et placez les fichiers client sur le runner :

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

Lorsque `cert_path` est défini, le runner vérifie le certificat du démon avec `ca.pem` et
s'authentifie avec `cert.pem` et `key.pem`. Les noms de fichiers sont fixes.

:::warning
Sans `cert_path`, une connexion `tcp://` est du HTTP en clair, et quiconque atteint le port
contrôle le démon. `tls_verify` seul n'active pas TLS (⚠️ 2026-11-05 : l'option est lue
mais pas appliquée) ; définissez toujours `cert_path` pour un démon distant.
:::

### Un réseau pour les services internes {#a-network-for-internal-services}

Par défaut, les conteneurs des tâches rejoignent `bridge`. Pour permettre aux tâches
d'atteindre des services par nom de conteneur, ou pour les isoler dans leur propre réseau,
créez un réseau et définissez-le :

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` accepte tout mode réseau compris par Docker : un nom de réseau, `bridge`,
`host` ou `none`. Le conteneur de clonage rejoint le même réseau : avec `none`, le
dépôt ne peut donc pas être cloné.

### Images d'un registre privé {#images-from-a-private-registry}

L'exécuteur récupère les images sans identifiants de registre. Pour une image privée,
connectez-vous et récupérez-la sur l'hôte du démon, et gardez une politique de pull qui
ne la récupère pas de nouveau :

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

Utilisez un tag de version plutôt que `latest` avec `if-not-present` : un tag déjà présent
sur le démon n'est jamais rafraîchi. `never` fait échouer la tâche si l'image manque, au
lieu de tenter un pull.

### Le bloc entier dans une seule variable {#the-whole-block-as-one-variable}

Pour les déploiements configurés uniquement par l'environnement, passez le bloc de
l'exécuteur en JSON :

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Référence de configuration {#configuration-reference}

Toutes les options se trouvent sous `runner.executor.docker` dans la configuration du runner.

| Option | Variable d'environnement | Par défaut | Description |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, puis le socket de la plateforme | Adresse du démon : `unix:///path`, `tcp://host:port` ou `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Répertoire contenant `ca.pem`, `cert.pem` et `key.pem` pour le TLS mutuel. Le définir active TLS. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Pas encore appliquée ; utilisez `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Image de build. Le champ **Image de l'exécuteur** d'un modèle la remplace. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image du conteneur de clonage et du remplissage du volume des secrets. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Réseau des conteneurs de clonage et de build. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` ou `never`. Une valeur inconnue revient à `if-not-present`. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | aucune limite | CPU par conteneur, comme `docker run --cpus`. Fractions autorisées : `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | aucune limite | Mémoire par conteneur : en octets, ou avec `k`, `m`, `g` (`512m`, `2g`). Une valeur illisible signifie aucune limite. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Exécute les conteneurs avec `--privileged`. Voir [Sécurité](#security). |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Secondes pendant lesquelles `docker stop` attend après **Stop** avant de tuer le conteneur. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | Non utilisée : l'exécuteur attend la fin du conteneur au lieu de l'interroger. |

Les limites, le réseau et `privileged` s'appliquent aussi bien au conteneur de clonage qu'au conteneur de build.

## Sécurité {#security}

- **L'accès au démon équivaut à root sur son hôte.** Quiconque contrôle le runner — ou une
  tâche qui s'échappe de son conteneur — contrôle tous les conteneurs de ce démon. Préférez
  un hôte Docker ou une VM dédiés aux conteneurs des tâches, et non l'hôte du serveur
  Semaphore ou de vos bases de données.
- **Laissez `privileged` désactivé.** Un conteneur privilégié a un accès complet aux
  périphériques et au noyau de l'hôte. Ne l'activez que pour un démon dédié et jetable
  qui n'exécute rien d'autre.
- **Les fichiers secrets** (clés SSH, mots de passe vault, variables supplémentaires) sont
  écrits dans un volume propre à la tâche sur le démon, monté en lecture seule et supprimé
  avec la tâche. Ils ne touchent jamais le disque du runner.
- **Les variables d'environnement secrètes** (secrets de groupe de variables de type *Variable
  d'environnement* et `SEMAPHORE_JWT`) sont définies sur le conteneur de build. Pendant son
  exécution, quiconque a accès au démon peut les lire avec `docker inspect`.
- **Réseau.** Sur `bridge`, une tâche peut atteindre toutes les adresses que l'hôte du démon
  atteint. Utilisez un réseau séparé et des règles de pare-feu pour limiter ce que les tâches atteignent.
- **Les démons distants** doivent utiliser [TLS](#remote-docker-daemon-over-tls).

## Arrêt et nettoyage {#stop-and-clean-up}

**Stop** dans l'interface envoie `docker stop` au conteneur en cours d'exécution, attend
jusqu'à `cleanup_grace_seconds`, puis supprime les conteneurs et les deux volumes.

Si le processus du runner est tué pendant une tâche, ses conteneurs et volumes restent sur
le démon ; le runner ne les récupère pas au démarrage suivant. Tout ce que l'exécuteur
crée porte le label `com.semaphoreui.runner=semaphore`, et `com.semaphoreui.task-id`
contient l'ID de la tâche. Supprimez les restes lorsqu'aucune tâche ne s'exécute sur ce démon :

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Dépannage {#troubleshooting}

| Message | Cause et solution |
|---|---|
| `docker executor is only available in the proprietary build` (journal du runner) | Le runner est une version Community. Utilisez `semaphoreui/runner` ou le binaire officiel. |
| `docker executor: daemon not reachable` | `host` incorrect, démon arrêté, ou l'utilisateur du runner ne peut pas ouvrir le socket (`permission denied`). Vérifiez avec `docker -H <host> info` en tant qu'utilisateur du runner ; ajoutez l'utilisateur au groupe du socket. |
| `pull image ...: ... unauthorized` ou `not found` | L'image est privée ou mal orthographiée. Récupérez-la d'abord sur l'hôte du démon, voir [registre privé](#images-from-a-private-registry). |
| `git clone exited with status 128` | L'URL du dépôt, la branche ou la clé SSH est incorrecte, ou le réseau bloque l'hôte Git. La sortie du clonage au-dessus de la ligne montre l'erreur Git. |
| `interpreter python3 not found in image; set a runner image that provides it` | L'image de build ne contient pas le binaire de l'application. Définissez une image qui le contient, sur le runner ou dans le champ **Image de l'exécuteur** du modèle. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | L'image n'a pas de client OpenSSH ; Ansible ne peut pas utiliser la clé de l'inventaire. Installez `openssh-client`. |
| `Permission denied` sous `/workspace` | Une image personnalisée s'exécute avec un utilisateur qui ne peut pas écrire dans `/workspace`. Voir [Construire une image personnalisée](./#build-a-custom-image). |
| `build container exited with status N` | L'application a échoué avec le code de sortie `N` ; la raison figure dans le journal au-dessus. |
| `inventory login_password authentication is not supported` | Voir [Limitations](./#limitations). |

## Pages associées {#related-pages}

- [Exécuteurs](/admin-guide/executors) : déroulement des tâches en conteneur, images, limitations.
- [Exécuteur Kubernetes](./kubernetes) : le même modèle sur un cluster.
- [Runners](/admin-guide/runners) : enregistrer et démarrer un runner.
- [Image de l'exécuteur](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) : une image différente pour un modèle.
