# Variables d'environnement

En utilisant des variables d'environnement, vous pouvez remplacer n'importe quelle option de configuration disponible.

Vous pouvez utiliser le générateur interactif de variables d'environnement (pour Docker) :
* pour le [serveur](https://semaphoreui.com/install/docker/2_12/)
* pour le [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Environnement d'exécution des applications (Ansible, Terraform, etc.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore peut transmettre des variables d'environnement aux processus des applications (Ansible, Terraform/OpenTofu, Python, PowerShell, etc.). Il existe deux options associées :

- `env_vars` / `SEMAPHORE_ENV_VARS` : paires clé-valeur statiques qui seront définies pour les processus des applications.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS` : liste de noms de variables que le serveur transmettra depuis son propre environnement de processus.

Exemple de fichier de configuration :

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

Équivalent avec des variables d'environnement :

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Remarques :
- La transmission est explicite : seules les variables listées dans `forwarded_env_vars` sont héritées par les processus des applications.
- Les secrets doivent être fournis de manière sécurisée (par exemple via des secrets Docker/Kubernetes) puis transmis à l'aide de `forwarded_env_vars`.
- La même liste s'applique aux processus `git` qui clonent et mettent à jour les dépôts : tout ce dont `git` a besoin depuis l'environnement de l'hôte doit donc être transmis également.

---

## Exécution derrière un proxy d'entreprise {#running-behind-a-corporate-proxy}

Semaphore ne transmet pas l'intégralité de son environnement aux processus qu'il démarre. En particulier, les variables de proxy n'atteignent une tâche ou un clonage `git` que si elles sont listées dans `forwarded_env_vars` ou définies dans `env_vars`.

C'est surtout important pour une installation par paquet (systemd). Les variables de proxy définies dans le fichier d'unité s'appliquent au serveur Semaphore lui-même, mais pas à `git` :

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

Avec la configuration ci-dessus et rien d'autre, le clonage d'un dépôt échoue avec :

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` n'a jamais vu `NO_PROXY` : il a donc envoyé la requête destinée à l'hôte interne via le proxy externe, qui l'a rejetée. Transmettez explicitement les trois variables pour corriger cela :

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

Ou, sous forme de variable d'environnement :

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

Remarques :
- Transmettez `NO_PROXY` en même temps que les variables de proxy. Sans elle, le trafic vers les serveurs Git internes passe lui aussi par le proxy.
- De nombreux outils lisent les formes en minuscules (`http_proxy`, `https_proxy`, `no_proxy`). Sous Linux et macOS, les noms de variables sont sensibles à la casse : indiquez donc les deux graphies si votre environnement les définit en minuscules.
- Les bundles de CA personnalisés fonctionnent de la même manière. Si votre proxy termine le TLS, transmettez `GIT_SSL_CAINFO`, `SSL_CERT_FILE` ou `REQUESTS_CA_BUNDLE` selon les besoins plutôt que de désactiver la vérification des certificats.
- Les installations Docker semblent généralement fonctionner d'emblée, car les variables de proxy sont définies pour tout le conteneur. Il reste recommandé de les transmettre explicitement, afin que la même configuration se comporte de façon identique dans les deux cas.

---

## Configuration de l'exécuteur du runner {#runner-executor-configuration}

Pour les déploiements de runners, l'ensemble du bloc executor peut être défini sous forme d'une seule variable d'environnement JSON au lieu de clés individuelles :

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Cela équivaut à définir `runner.executor.type` et les champs imbriqués `runner.executor.docker.*` dans le fichier de configuration. Consultez [Options de configuration](/admin-guide/configuration) pour tous les paramètres de l'exécuteur du runner.

---

## Variables d'environnement secrètes dans les groupes de variables {#secret-environment-variables-in-variable-groups}

En plus des variables d'environnement globales, vous pouvez définir des secrets par projet dans les groupes de variables. Les clés secrètes sont masquées dans l'interface et dans les journaux. Consultez `User Guide → Variable Groups` pour l'utilisation et l'intégration Terraform avec les variables `TF_VAR_*`.
