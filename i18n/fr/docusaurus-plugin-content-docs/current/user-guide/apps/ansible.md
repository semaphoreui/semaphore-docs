
# Ansible

Avec Semaphore UI, vous pouvez exécuter des playbooks Ansible. Pour cela, vous devez créer un modèle **Ansible Playbook**.

1. Rendez-vous dans la section **Modèles de tâches**, cliquez sur **Nouveau modèle**, puis sur **Ansible Playbook**.

![](/assets/ansible_1.png)

2. Configurez le modèle.

Le modèle vous permet de spécifier les paramètres suivants :

* Dépôt
* Chemin du fichier de playbook
* Répertoire de travail (facultatif)
* Inventaire
* Groupes de variables
* Coffres (Vaults)
* Arguments CLI supplémentaires (tags, skip-tags, limit, verbosité)
* Variables d'environnement

![](/assets/ansible_2.png)

## Répertoire de travail {#working-directory}

Utilisez le **Répertoire de travail** pour exécuter les commandes Ansible depuis un sous-répertoire du dépôt du modèle. Saisissez un chemin relatif à la racine du dépôt. Par exemple, si `ansible.cfg` est stocké dans `<repository>/automation`, saisissez `automation`. Les chemins absolus et les chemins situés en dehors du dépôt sont rejetés. S'il est omis, Semaphore utilise la racine du dépôt.

Le répertoire de travail influe sur les comportements d'Ansible qui dépendent du répertoire courant du processus. L'[ordre de recherche du fichier de configuration][ansible-config-search] d'Ansible inclut le fichier `ansible.cfg` du répertoire courant. Le répertoire de travail influe également sur la résolution des chemins relatifs dans les arguments CLI supplémentaires ; par exemple [`--extra-vars @vars.yml`][ansible-extra-vars-file] et [`--private-key key.pem`][ansible-private-key]. Les chemins du playbook et des inventaires de type fichier restent relatifs à la racine de leurs dépôts.

Changer le répertoire de travail n'ajoute pas en soi les sous-répertoires `roles/` ou `collections/` de ce répertoire aux chemins de recherche d'Ansible. La [découverte des rôles relative au playbook][ansible-role-search] et les [collections adjacentes à un playbook][ansible-playbook-collections] continuent de se baser sur l'emplacement du playbook. Le répertoire de travail peut néanmoins influer indirectement sur leur découverte lorsque le fichier `ansible.cfg` sélectionné configure `roles_path` ou `collections_path`.

[ansible-config-search]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html#the-configuration-file
[ansible-extra-vars-file]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#vars-from-a-json-or-yaml-file
[ansible-private-key]: https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-private-key
[ansible-role-search]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#storing-and-finding-roles
[ansible-playbook-collections]: https://docs.ansible.com/ansible/latest/collections_guide/collections_installing.html#installing-collections-adjacent-to-playbooks

## Types de modèle {#template-types}

Un modèle ansible-playbook peut être de l'un des types suivants :

* [Task](#task)
* [Build](#build)
* [Deploy](#deploy)

### Task {#task}

Exécute simplement les playbooks indiqués avec les paramètres indiqués.

Si vous avez l'intention de lancer le modèle par un appel à l'API en utilisant la fonctionnalité *limit*, veillez à activer l'option *Ansible prompts: Limit*. Sinon, la limite définie dans l'appel à l'API sera ignorée. Pour une tâche déclenchée par l'API, cela ne provoquera aucune invite interactive : la tâche s'exécutera sans surveillance.

### Build {#build}

Ce type de modèle doit être utilisé pour créer des [artefacts](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\)). La version initiale de l'artefact peut être indiquée dans un paramètre du modèle. Chaque exécution incrémente la version de l'artefact.

![](/assets/template_new_build_ipad1.png)

Semaphore ne prend pas en charge les artefacts nativement ; il fournit uniquement le versionnement des tâches. C'est à vous d'implémenter la création des artefacts. Lisez l'article [CI/CD](../../admin-guide/cicd) pour savoir comment procéder.

### Deploy {#deploy}

Ce type de modèle doit être utilisé pour déployer des artefacts sur les serveurs de destination. Chaque modèle `deploy` est associé à un modèle `build`.


Cela vous permet de déployer une version précise de l'artefact sur les serveurs.

## Options du modèle {#template-options}

### Planification {#schedule}

Vous pouvez mettre en place la planification des tâches en spécifiant une planification cron dans les paramètres du modèle. Vous trouverez le format des expressions cron dans la [documentation](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format).


#### Exécuter une tâche lorsqu'un nouveau commit est ajouté au dépôt {#run-a-task-when-a-new-commit-is-added-to-the-repository}

Vous pouvez utiliser cron pour vérifier périodiquement la présence de nouveaux commits dans le dépôt et déclencher une tâche à leur arrivée.

Par exemple, vous avez le code source de l'application dans le dépôt git. Vous pouvez l'ajouter dans **Dépôts** et déclencher la tâche Build pour les nouveaux commits.


### Tags, skip-tags et limit {#tags-skip-tags-and-limit}

Les modèles prennent en charge les options de la CLI Ansible :

- `--tags`
- `--skip-tags`
- `--limit`

Elles peuvent être définies dans le modèle et remplacées lors de la création d'une tâche. Assurez-vous que les invites correspondantes sont activées si vous prévoyez de transmettre ces valeurs via l'API.

### Prérequis Galaxy {#galaxy-requirements}

Avant d'exécuter un playbook, Semaphore installe les rôles et les collections déclarés dans les fichiers `requirements.yml` trouvés dans le répertoire du playbook, à la racine du dépôt et dans leurs sous-répertoires `roles/` et `collections/`, à l'aide de `ansible-galaxy install --force`.

Pour éviter une réinstallation à chaque exécution, Semaphore stocke une somme de contrôle de chaque fichier de prérequis et ne relance l'installation que lorsque le fichier change. Deux options du modèle, dans la section repliable **Galaxy install options** (sous **Ansible prompts**), contrôlent ce comportement :

- **Skip Galaxy install** — ne pas exécuter `ansible-galaxy` du tout. À utiliser lorsque les prérequis sont préinstallés dans l'image du runner.
- **Force Galaxy install** — toujours exécuter `ansible-galaxy install --force`, en ignorant la somme de contrôle stockée. À utiliser lorsqu'un fichier de prérequis pointe vers une cible mouvante (par exemple une branche plutôt qu'un tag) et que vous souhaitez obtenir la dernière version à chaque exécution.

**Skip Galaxy install** peut être exposée dans le formulaire d'exécution de la tâche en activant la case à cocher du même nom sous **Prompts**, en bas de la section. Lorsqu'une invite est activée, la valeur choisie à l'exécution prévaut sur la valeur par défaut du modèle.

#### Arguments Galaxy supplémentaires {#galaxy-extra-args}

**Role install args** et **Collection install args** (dans la section repliable **Galaxy install options** sous **Ansible prompts** ; repliée par défaut ; le compteur affiché à côté indique le nombre de paramètres Galaxy personnalisés) ajoutent des options à `ansible-galaxy role install` et à `ansible-galaxy collection install` respectivement. Ils se configurent séparément car les deux sous-commandes acceptent des options différentes : `--pre`, par exemple, n'est valide que pour les collections.

Chaque entrée correspond à un jeton argv ; une valeur peut être fournie soit en ligne (`--timeout=60`), soit comme entrée suivante (`--timeout`, puis `60`). Seules les options suivantes sont acceptées :

| Portée | Options |
|-------|-------|
| Les deux | `-c`/`--ignore-certs`, `-f`/`--force`, `--force-with-deps`, `-i`/`--ignore-errors`, `-n`/`--no-deps`, `-s`/`--server <url>`, `--timeout <seconds>`, `-v`…`-vvvv`/`--verbose` |
| Rôles uniquement | `-g`/`--keep-scm-meta` |
| Collections uniquement | `--pre`, `-U`/`--upgrade`, `--offline`, `--no-cache`, `--clear-response-cache`, `--disable-gpg-verify`, `--keyring <path>`, `--signature <url>`, `--required-valid-signature-count <n>`, `--ignore-signature-status-code(s) <code>` |

Tout le reste est rejeté à l'enregistrement du modèle. En particulier, `--token`/`--api-key` ne sont pas autorisées car les arguments de la ligne de commande sont visibles dans la liste des processus — configurez plutôt les identifiants Galaxy via des variables d'environnement (par exemple `ANSIBLE_GALAXY_SERVER_<NAME>_TOKEN`) dans un groupe de variables. Le fichier de prérequis (`-r`) est défini par Semaphore, et les chemins d'installation (`-p`, `--roles-path`, `--collections-path`) ne sont délibérément pas acceptés afin qu'un modèle ne puisse pas écrire en dehors du dépôt — définissez plutôt `roles_path`/`collections_path` dans `ansible.cfg` ou via `ANSIBLE_ROLES_PATH`/`ANSIBLE_COLLECTIONS_PATH`.

### Parallélisme (`--forks` / `-f`) {#parallelism---forks---f}

Contrôlez le nombre d'hôtes auxquels Ansible se connecte en parallèle en passant `--forks` ou
`-f` dans les **Arguments CLI supplémentaires** du modèle. Les arguments doivent être du JSON valide —
utilisez un tableau de jetons distincts :

```json
["--forks", "10"]
```

La forme courte est également prise en charge :

```json
["-f", "10"]
```

Lorsque l'option **Allow override arguments in task** est activée sur le modèle, une tâche peut
fournir sa propre valeur de forks à l'exécution. Ansible reçoit à la fois les arguments du modèle et
ceux de la tâche ; le dernier `--forks` / `-f` de la ligne de commande l'emporte.

Si les arguments ne sont pas du JSON valide, la tâche échoue avec une erreur de validation
explicite avant le début de l'exécution.

### Authentification {#authentication}

L'authentification auprès des hôtes du playbook s'appuie sur les références d'utilisateur du Magasin de clés définies sur l'inventaire. L'utilisateur SSH est déterminé par l'utilisateur facultatif renseigné sur l'élément du Magasin de clés.

### Plusieurs mots de passe de coffre {#multiple-vault-passwords}

Vous pouvez attacher plusieurs mots de passe Vault du Magasin de clés à un modèle. Lors de l'exécution, Ansible tentera de déchiffrer avec les mots de passe fournis.

### Niveau de verbosité {#verbosity-level}

Vous pouvez ajuster la verbosité d'Ansible pour une tâche (par exemple `-v`, `-vvv`) depuis le formulaire du modèle ou de la tâche afin de faciliter le diagnostic.
