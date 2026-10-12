# Mise à niveau

### Gestionnaire de paquets {#package-manager}

Téléchargez un fichier de paquet depuis la [page des versions](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` pour Debian et Ubuntu, `*.rpm` pour CentOS et RedHat.&#x20;

Installez-le avec le gestionnaire de paquets.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="debian-x64" label="Debian / Ubuntu (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.deb

      sudo dpkg -i semaphore_2.17.15_linux_amd64.deb
      ```
  </TabItem>
  <TabItem value="debian-arm64" label="Debian / Ubuntu (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.deb

      sudo dpkg -i semaphore_2.17.15_linux_arm64.deb
      ```
  </TabItem>
  <TabItem value="centos-x64" label="CentOS (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.rpm

      sudo yum install semaphore_2.17.15_linux_amd64.rpm
      ```
  </TabItem>
  <TabItem value="centos-arm64" label="CentOS (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.rpm

      sudo yum install semaphore_2.17.15_linux_arm64.rpm
      ```
  </TabItem>
</Tabs>


### Binaire {#binary}

<Tabs>
  <TabItem value="linux-x64" label="Linux (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.tar.gz

      tar xf semaphore_2.17.15_linux_amd64.tar.gz
      ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.tar.gz

      tar xf semaphore_2.17.15_linux_arm64.tar.gz
      ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows (x64)">
      ```powershell
      Invoke-WebRequest `
      -Uri ("https://github.com/semaphoreui/semaphore/releases/" +
            "download/v2.17.15/semaphore_2.17.15_windows_amd64.zip") `
      -OutFile semaphore.zip

      Expand-Archive -Path semaphore.zip  -DestinationPath ./
      ```
  </TabItem>
</Tabs>

## Changements de comportement notables {#behavior-changes}

Ces changements s'appliquent lors de la mise à niveau vers les versions récentes **2.20.x**. Ils ne nécessitent pas de migration de base de données, mais les playbooks ou clients d'API qui reposaient sur l'ancien comportement peuvent nécessiter des mises à jour.

### Les variables supplémentaires Ansible sont des littéraux {#ansible-extra-vars-literal}

Semaphore ne transmet plus les variables supplémentaires Ansible en ligne de commande. Les groupes de variables, les réponses de questionnaire, les entrées de workflow et l'objet intégré `semaphore_vars` sont écrits dans des fichiers YAML temporaires et transmis sous la forme `--extra-vars @file`. Chaque valeur de type chaîne est marquée `!unsafe` : Ansible la traite donc comme une donnée et n'évalue pas le Jinja2 qu'elle contient.

Si vous aviez stocké du Jinja2 dans un champ de questionnaire, un groupe de variables ou un modèle `--extra-vars` en comptant sur Semaphore ou Ansible pour l'évaluer avant l'exécution du playbook, cette évaluation n'a plus lieu. Déplacez la logique dans le playbook (par exemple, utilisez `{{ my_var }}` où `my_var` est une valeur simple fournie par Semaphore) ou calculez la valeur en dehors de Semaphore.

Les secrets de questionnaire et de groupes de variables sont chiffrés dans un fichier Ansible Vault distinct. Semaphore génère un ID de coffre et un mot de passe uniques par tâche et répond à l'invite de coffre d'Ansible via stdin. Ce mécanisme est indépendant des mots de passe de coffre que vous attachez au modèle.

Voir [Variables de questionnaire](/user-guide/task-templates/survey-vars), [Groupes de variables](/user-guide/environment) et [Sécurité — variables de tâche Ansible](/admin-guide/security#ansible-task-variables).

### Sorties de workflow et champs de l'API des tâches {#workflow-outputs-and-task-api}

Les [sorties de workflow](/user-guide/workflows#producing-outputs) sont écrites par l'exécution de la tâche et ne peuvent pas être définies lorsque vous lancez une tâche via l'API. `POST /api/project/{project_id}/tasks` ignore `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` et `runner_id` s'ils figurent dans le corps de la requête.
