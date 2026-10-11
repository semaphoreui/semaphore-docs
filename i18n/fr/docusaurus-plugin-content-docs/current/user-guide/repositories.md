# Dépôts

Un dépôt est un endroit où stocker et gérer du contenu Ansible tel que des playbooks et des rôles.

![](/assets/repository.webp)

Semaphore reconnaît les dépôts suivants :
  * un système de fichiers local (`/path/to/the/repo`)
  * un dépôt Git local (`file://`)
  * un dépôt Git distant accessible via HTTPS (`https://`) ou SSH (`ssh://`)
  * le protocole `git://` est pris en charge, mais il n'est pas recommandé pour des raisons de sécurité.

Tous les modèles de tâches nécessitent un dépôt pour s'exécuter.

## Authentification {#authentication}
Si vous utilisez un dépôt distant nécessitant une authentification, vous devrez configurer une clé dans la section **Magasin de clés** de Semaphore.

Pour les dépôts distants utilisant SSH, vous devrez utiliser votre clé SSH dans le **magasin de clés**.

Pour les dépôts distants sans authentification, vous pouvez créer une clé de type `None`.

La clé d'un dépôt n'est utilisée que pour ce dépôt. Pour atteindre des sous-modules, des rôles de `requirements.yml` ou d'autres dépôts hébergés ailleurs avec leurs propres identifiants, ajoutez un mappage dans [Host config](/user-guide/host-config).

## Créer un nouveau dépôt {#creating-a-new-repository}
1. Assurez-vous d'avoir configuré, dans la section du magasin de clés, la clé correspondant au dépôt que vous allez ajouter.

2. Allez dans la section Dépôts de Semaphore et cliquez sur le bouton **Nouveau dépôt** dans le coin supérieur droit.

3. Configurez le dépôt :
    * Nommez le dépôt
    * Ajoutez l'URL. L'URL doit commencer par l'un des éléments suivants :
        * `/path/to/the/repo` pour un dossier local sur le système de fichiers
        * `https://` pour un dépôt Git distant accessible via HTTPS
        * `ssh://` pour un dépôt Git distant accessible via SSH
        * `file://` pour un dépôt Git local
        * `git://` pour un dépôt Git distant accessible via le protocole Git
    * Définissez la branche du dépôt ; si vous n'êtes pas sûr, il s'agit probablement de master ou main
    * Cochez **Extraction unique pour tous les modèles** si le dépôt est un monorepo que tous les modèles doivent partager, voir [Monorepo](#monorepo)
    * Sélectionnez la **clé d'accès** que vous avez configurée avant de créer ce dépôt.

4. Cliquez sur Enregistrer une fois la configuration terminée.

## Monorepo : une seule extraction pour tous les modèles {#monorepo}

Par défaut, Semaphore clone un dépôt une fois par modèle, de sorte que chaque modèle travaille dans sa propre copie. Pour un grand dépôt partagé par de nombreux modèles, les copies coûtent de l'espace disque et chaque tâche commence par un clone ou un pull de sa propre copie.

Cochez **Extraction unique pour tous les modèles** pour cloner le dépôt une seule fois et partager cette extraction entre tous les modèles du projet. L'option n'est pas disponible pour un dossier local (`/path/to/the/repo`), qui n'est jamais cloné.

<div style={{maxWidth: 450}}>

![Formulaire de dépôt avec l'option Extraction unique pour tous les modèles activée](/assets/repository-monorepo.webp)

</div>

Fonctionnement de l'extraction partagée :

* Avant le démarrage d'une tâche, Semaphore pose un verrou sur l'extraction, effectue un fetch et un pull de la branche configurée dans le dépôt, puis libère le verrou. Les tâches des autres modèles attendent le verrou pendant la mise à jour de l'extraction, mais les tâches elles-mêmes s'exécutent en parallèle.
* Chaque branche conserve sa propre extraction, de sorte que des dépôts avec des branches différentes ne partagent jamais le même arbre de travail.
* L'extraction est partagée, mais le répertoire home d'Ansible (rôles et collections installés depuis `requirements.yml`) reste distinct pour chaque modèle.

Comme tous les modèles travaillent dans la même extraction sur la même branche, un modèle d'un monorepo ne peut pas avoir sa propre **Branche** ni activer l'invite **Branche** qui permet à une tâche de choisir une branche ou un commit. Le formulaire du modèle désactive les deux et en explique la raison, et l'API rejette un tel modèle. Assurez-vous que les playbooks n'écrivent pas dans l'extraction : un arbre de travail modifié casse le pull suivant, et Semaphore supprime alors l'extraction et la clone à nouveau.

## Modifier un dépôt existant {#editing-an-existing-repository}
1. Allez dans la section Dépôts de Semaphore.

2. Cliquez sur l'icône en forme de crayon à côté du dépôt à modifier ; la configuration du dépôt s'affiche alors.

## Supprimer un dépôt {#deleting-a-repository}
Assurez-vous que le dépôt à supprimer n'est utilisé par aucun modèle de tâche.
Un dépôt ne peut pas être supprimé s'il est utilisé dans un modèle de tâche :
1. Allez dans la section Dépôts de Semaphore.

2. Cliquez sur l'icône de corbeille du dépôt à supprimer.

3. Cliquez sur Oui dans la fenêtre de confirmation si vous êtes sûr de vouloir supprimer ce dépôt.

## Requirements {#requirements}
Lors de l'initialisation du projet, Semaphore recherche et installe les rôles et collections Ansible à partir des fichiers requirements.yml situés aux emplacements suivants, dans cet ordre.

### Rôles {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Collections {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### Logique de traitement {#processing-logic}

* Chaque fichier est traité indépendamment
* Si un fichier existe, il est traité selon son type (rôle ou collection)
* Si le traitement d'un fichier produit une erreur, le processus d'installation s'arrête et renvoie l'erreur
* Le même fichier requirements.yml situé dans les répertoires racines (**`playbook_dir`/requirements.yml** et **`repo_path`/requirements.yml**) est traité deux fois : une fois pour les rôles et une fois pour les collections

Semaphore tente de traiter tous ces emplacements, que les emplacements précédents aient été trouvés ou traités avec succès ou non, sauf en cas d'erreur.
