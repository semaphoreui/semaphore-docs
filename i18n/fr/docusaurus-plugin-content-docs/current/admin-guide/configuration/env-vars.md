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
