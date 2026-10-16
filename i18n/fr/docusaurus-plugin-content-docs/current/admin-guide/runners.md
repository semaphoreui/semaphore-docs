# Runners

Les runners permettent d'exécuter des tâches sur un serveur distinct de celui de Semaphore UI.

Les runners Semaphore fonctionnent sur le même principe que les runners GitLab ou GitHub Actions :

- Vous lancez un runner sur un serveur distinct, en indiquant l'adresse du serveur Semaphore et un token d'authentification.
- Le runner se connecte à Semaphore et signale qu'il est prêt à accepter des tâches.
- Lorsqu'une nouvelle tâche apparaît, Semaphore fournit toutes les informations nécessaires au runner, qui à son tour clone le dépôt et exécute Ansible, Terraform, PowerShell, etc.
- Le runner renvoie les résultats d'exécution de la tâche à Semaphore.

Pour les utilisateurs finaux, l'utilisation de Semaphore avec ou sans runners est identique.

Lorsqu'aucun runner n'est défini, le serveur Semaphore UI fait lui-même office de runner. Toutes les tâches s'exécutent dans le contexte du serveur Semaphore UI, avec accès au système de fichiers.

L'utilisation de runners offre les avantages suivants :
- Une exécution des tâches plus sécurisée. Par exemple, un runner peut se trouver dans un sous-réseau fermé ou dans un conteneur Docker isolé.
- La répartition de la charge de travail sur plusieurs serveurs. Vous pouvez démarrer plusieurs runners, et les tâches seront réparties aléatoirement entre eux.

## Mise en place {#set-up}

### Configurer un serveur {#set-up-a-server}

Pour configurer le serveur afin qu'il fonctionne avec des runners, vous devez ajouter les options suivantes à la configuration de votre serveur Semaphore :

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

ou à l'aide de variables d'environnement :

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Configurer un runner {#setup-a-runner}

Pour configurer le runner, utilisez la commande suivante :

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

Cette commande crée un fichier de configuration à l'emplacement `/path/to/your/config/file.json`.

Mais avant d'utiliser cette commande, vous devez comprendre comment les runners sont enregistrés sur le serveur.

### Enregistrer le runner sur le serveur {#registering-the-runner-on-the-server}

Il existe deux façons d'enregistrer un runner sur le serveur Semaphore :
1) L'ajouter via l'interface web ou l'API.
2) Utiliser la ligne de commande avec la commande `semaphore runner register`.

#### Ajouter le runner via l'interface web {#adding-the-runner-via-the-web-ui}

![Image du runner](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Enregistrement via la CLI {#registering-via-cli}

Pour enregistrer un runner de cette manière, vous devez ajouter l'option `runner_registration_token` au fichier de configuration de votre serveur Semaphore. Cette option doit être définie à une chaîne arbitraire. Choisissez une chaîne suffisamment complexe pour éviter tout problème de sécurité.

Lorsque la commande `semaphore runner setup` vous demande si vous disposez d'un token de runner, répondez Non. Utilisez ensuite la commande suivante pour enregistrer le runner :

`semaphore runner register --config /path/to/your/config/file.json`

ou

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Fichier de configuration {#configuration-file}

À l'issue de l'exécution de la commande `semaphore runner setup`, un fichier de configuration semblable au suivant est créé :

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs.
    // Default: 5. Raise this when many runners share one server.
    "check_interval_seconds": 5

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

Vous pouvez modifier ce fichier manuellement sans avoir à relancer `semaphore runner setup`.

Pour réenregistrer le runner, vous pouvez utiliser la commande `semaphore runner register`. Cela remplacera le token dans le fichier indiqué dans la configuration.

## Exécuter le runner {#running-the-runner}

Vous pouvez maintenant démarrer le runner avec la commande :

```
semaphore runner start --config /path/to/your/config/file.json
```

Votre runner est prêt à exécuter des tâches.

### Exécuter le runner dans Docker {#running-the-runner-in-docker}

L'image `semaphoreui/runner` démarre automatiquement le runner. Transmettez l'URL du serveur et le token d'enregistrement via des variables d'environnement :

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Si vos playbooks nécessitent des paquets Python supplémentaires, montez un fichier `requirements.txt` à l'emplacement `/etc/semaphore/requirements.txt`. Le conteneur l'installe avec `pip3` à chaque démarrage, avant que le runner ne se connecte au serveur :

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

Consultez [Installer des dépendances Python supplémentaires](/admin-guide/installation/docker#installing-additional-python-dependencies) pour savoir où les paquets sont installés et comment les échecs sont gérés.

### Intervalle de sondage (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Chaque runner interroge le serveur Semaphore à intervalle fixe pour récupérer de nouveaux jobs.
Configurez-le dans le fichier de configuration du runner :

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

Ou avec une variable d'environnement :

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Valeur | Effet |
|-------|--------|
| **1** | Les jobs sont pris en charge en une seconde environ ; idéal pour des exécutions à faible latence. |
| **5** (par défaut) | Équilibre le délai de prise en charge et le volume de requêtes. |
| **Plus élevée** (par ex. 10–30) | Réduit le trafic HTTP lorsque vous exploitez de nombreux runners sur un même serveur. Les jobs peuvent démarrer légèrement plus tard. |

La page Runners de Semaphore UI expose ce paramètre sous **Options avancées** lors de
la génération des extraits de configuration (fichier de configuration, Docker et exemples de variables d'environnement).

Les valeurs invalides ou nulles retombent sur la valeur par défaut de 5 secondes.

La progression des tâches est signalée selon sa propre cadence fixe d'une
seconde, indépendante de ce paramètre : la requête de progression sert aussi de
battement de cœur (heartbeat) du runner.

### Délai d'attente des requêtes (`connection.timeout_seconds`) {#request-timeout-connection-timeout_seconds}

Chaque requête que le runner envoie au serveur est bornée : la connexion TCP, la
poignée de main TLS et l'attente des en-têtes de réponse disposent chacune de ce
nombre de secondes. Sans cela, un serveur qui accepte la connexion puis reste
muet bloquerait le runner jusqu'à ce que le système d'exploitation abandonne — et
comme une requête bloquée fait sauter au runner ses cycles suivants, le
battement de cœur s'arrêterait et le serveur déclarerait le runner hors ligne.

```json
{
  "runner": {
    "connection": {
      "timeout_seconds": 3
    }
  }
}
```

Ou avec une variable d'environnement :

```bash
SEMAPHORE_RUNNER_CONNECTION_TIMEOUT_SECONDS=3
```

La valeur par défaut est de 3 secondes. Gardez-la inférieure à
`check_interval_seconds` afin qu'une requête bloquée ne survive pas au cycle de
sondage qui l'a lancée. Augmentez-la lorsque le runner atteint le serveur via un
lien lent ou congestionné et que vous voyez
`timeout awaiting response headers` dans le journal du runner ; un rapport de
progression expiré conserve ses enregistrements de journal et est réessayé au
cycle suivant, de sorte qu'aucune sortie de tâche n'est perdue.

L'envoi du corps de la requête n'est délibérément pas borné, afin qu'un gros lot
de journaux de tâches ne soit jamais coupé en cours de transfert.

### Tags de runner (Pro) {#runner-tags-pro}

Vous pouvez attribuer un ou plusieurs tags à un runner de projet. Les modèles peuvent ensuite exiger un tag afin que les tâches ne s'exécutent que sur les runners correspondants. Configurez les tags lors de l'ajout d'un runner dans l'interface du projet, et définissez le tag requis dans les paramètres du modèle.

## Désenregistrement du runner {#runner-deregistration}

Vous pouvez supprimer un runner via l'interface web.

![Image du runner](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

Ou désenregistrer le runner via la CLI :

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Sécurité {#security}

Les runners s'authentifient auprès du serveur avec un token bearer opaque
(`X-Runner-Token`), émis lors de l'enregistrement. Protégez ce token comme n'importe quel autre
identifiant — stockez-le dans un fichier de configuration à accès restreint ou dans un gestionnaire de secrets.

:::warning
Utilisez HTTPS pour la communication entre le serveur et le runner, en particulier lorsqu'ils
ne se trouvent pas sur le même réseau privé. Pour les certificats auto-signés ou émis par une CA interne,
configurez `runner.connection.server_ca_cert_file` sur le runner.
N'utilisez pas `runner.connection.skip_tls_verify` en production.
:::
