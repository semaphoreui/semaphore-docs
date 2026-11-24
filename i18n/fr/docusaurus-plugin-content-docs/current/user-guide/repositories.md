import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

### Configuration des Deploy Keys {#deploy-keys}

Dans les environnements d'automatisation d'entreprise, l'utilisation de **Deploy Keys** dédiées (ou Access Keys) restreintes à un seul référentiel est la bonne pratique recommandée par rapport aux clés SSH utilisateur ou aux Personal Access Tokens (PAT). Les Deploy Keys garantissent :
* **Isolation du cycle de vie** : Les pipelines CI/CD et d'automatisation ne dépendent pas des comptes d'employés individuels ni d'identifiants personnels.
* **Moindre privilège** : Les Deploy Keys peuvent être configurées strictement en lecture seule, garantissant que Semaphore ne peut pas pousser de modifications indésirables vers le référentiel source.
* **Rayon d'impact limité** : Si une clé doit être renouvelée, seul le référentiel spécifique est concerné.

:::tip Générer des clés SSH directement dans Semaphore
Vous n'avez pas besoin de générer des clés SSH en ligne de commande. Dans Semaphore, allez dans **Key Store** &rarr; **Nouvelle clé** &rarr; sélectionnez **SSH Key** &rarr; cliquez sur **Generate**. Semaphore créera une paire de clés sécurisée et affichera une boîte de dialogue avec la **Clé publique** prête à être copiée. Consultez [Key Store](/user-guide/key-store#built-in-ssh-key-generator) pour plus de détails.
:::

Copiez la clé publique générée dans Semaphore et ajoutez-la à votre fournisseur Git :

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. GitHub: **Settings** &rarr; **Deploy keys** &rarr; **Add deploy key**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Allow write access**: Unchecked.

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. GitLab: **Settings** &rarr; **Repository** &rarr; **Deploy keys**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Grant write permissions**: Unchecked.

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. Bitbucket: **Repository settings** &rarr; **Access keys**.
2. Label: `Semaphore UI Runner`.
3. Key: Public Key.
4. Permissions: `Read`.

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

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

:::info Depuis la v2.20
L'option **Extraction unique pour tous les modèles** est disponible depuis **Semaphore 2.20**. Les versions antérieures clonent toujours un dépôt une fois par modèle.
:::

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

## Playbooks dans des sous-répertoires {#subdirectories}

Les référentiels d'entreprise organisent fréquemment l'automatisation dans des répertoires dédiés, des monorepos ou des architectures multi-environnements plutôt que de placer tous les playbooks à la racine.

```text
my-automation-repo/
├── ansible.cfg
├── collections/
│   └── requirements.yml
├── roles/
│   └── common/
└── playbooks/
    ├── site.yml
    ├── provisioning/
    │   └── aws-vms.yml
    └── maintenance/
        └── patch-nodes.yml
```

Lors de la création d'un [Modèle de tâche](/user-guide/task-templates), le **Nom de fichier du playbook** est toujours spécifié **relativement à la racine du référentiel** :

* **Utiliser des chemins relatifs** : Entrez `playbooks/site.yml` ou `playbooks/provisioning/aws-vms.yml`.
* **Pas de barre oblique initiale** : N'utilisez pas `/playbooks/site.yml`. Une barre oblique initiale oblige l'exécuteur à chercher à partir de la racine du système plutôt que dans le clone du référentiel.
* **Barres obliques Unix** : Utilisez toujours `/`, même en cas d'exécution sur des nœuds runners Windows.
* **Sensible à la casse** : Les chemins doivent correspondre exactement à la casse des dossiers et fichiers (par exemple, `playbooks/site.yml`).

:::info Répertoire de travail et exigences
Lorsqu'un playbook s'exécute à partir d'un sous-répertoire (comme `playbooks/site.yml`), Semaphore évalue à la fois le répertoire du playbook (`playbook_dir`) et la racine du référentiel (`repo_path`) pour résoudre les rôles et collections. Consultez [Exigences](#requirements) ci-dessous pour l'ordre de recherche exact.
:::

## Modifier un dépôt existant {#editing-an-existing-repository}
1. Allez dans la section Dépôts de Semaphore.

2. Cliquez sur l'icône en forme de crayon à côté du dépôt à modifier ; la configuration du dépôt s'affiche alors.

## Supprimer un dépôt {#deleting-a-repository}
Assurez-vous que le dépôt à supprimer n'est utilisé par aucun modèle de tâche.
Un dépôt ne peut pas être supprimé s'il est utilisé dans un modèle de tâche :
1. Allez dans la section Dépôts de Semaphore.

2. Cliquez sur l'icône de corbeille du dépôt à supprimer.

3. Cliquez sur Oui dans la fenêtre de confirmation si vous êtes sûr de vouloir supprimer ce dépôt.

### Protection des dépendances et contrôle d'utilisation {#dependency-protection}

Un référentiel ne peut pas être supprimé s'il est actuellement assigné à un ou plusieurs modèles de tâches.

Avant de tenter la suppression, Semaphore vérifie les références actives des modèles :
1. Dans la liste des référentiels, cliquer sur l'icône de corbeille vérifie si le référentiel est référencé par des modèles de projet.
2. Si des dépendances existent, Semaphore affiche une boîte de dialogue d'avertissement listant les modèles de tâches précis référençant ce référentiel, avec des liens directs vers chaque modèle.
3. S'il est supprimé directement via l'API alors qu'il est en cours d'utilisation, la requête est rejetée avec une erreur HTTP `400 Bad Request` :

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

Pour supprimer un référentiel en toute sécurité :
1. Accédez à **Modèles** et réaffectez chaque modèle dépendant à un autre référentiel, ou supprimez les modèles inutilisés.
2. Revenez à **Référentiels** et cliquez sur l'icône de corbeille à côté du référentiel.
3. Confirmez la suppression dans la boîte de dialogue contextuelle.

:::tip Purge automatique du cache de checkout
Lorsqu'un référentiel est supprimé avec succès, Semaphore purge automatiquement le répertoire de travail local du checkout sur le système de fichiers de l'hôte/runner, libérant ainsi de l'espace disque.
:::

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
