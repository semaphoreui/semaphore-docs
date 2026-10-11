---
title: Repositories
description: Supported repository URL types, authentication keys, creating and deleting repositories, and how requirements.yml is processed.
---

# Repositories

A Repository is a place to store and manage Ansible content like playbooks and roles.

![Repositories list](/assets/repositories-list.webp)

The list shows the name, the Git URL with the branch, and the key used for authentication.

Semaphore understands Repositories that are:
  * a local file system (`/path/to/the/repo`)
  * a local Git repository (`file://`)
  * a remote Git Repository that is accessed over HTTPS (`https://`), SSH (`ssh://` or the short form `git@host:org/repo.git`)
  * `git://` protocol supported, but it is not recommended for security reasons.

All Task Templates require a Repository in order to run.

## Authentication {#authentication}
If you are using a remote Repository that requires authentication, you will need to configure a key in the **Key Store** section of Semaphore.

For remote Repositories that use SSH, you will need to use your SSH key in the **Key Store**.

For Remote Repositories that do not have authentication, you can create a Key with the type of `None`.

The key of a Repository is used for that Repository only. To reach submodules, `requirements.yml` roles or other repositories hosted elsewhere with their own credentials, add a mapping in [Host config](/user-guide/host-config).

## Creating a New Repository {#creating-a-new-repository}
1. Make sure you have configured the key for the Repository you are about to add in the key store section.

2. Go to the Repositories section of Semaphore, click the **New Repository** button in the upper right hand corner.

3. Configure the Repository:
    * Name Repository
    * Add the URL. The URL must start with the following:
        * `/path/to/the/repo` for a local folder on the file system
        * `https://` for a remote Git Repository accessed over HTTPS
        * `ssh://` for a remote Git Repository accessed over SSH
        * `file://` for a local Git Repository
        * `git://` for a remote Git Repository accessed over Git protocol
    * Set the branch of the Repository, if you are not sure what it should be, it is probably master or main
    * Tick **Single checkout for all templates** if the Repository is a monorepo that every template should share, see [Monorepo](#monorepo)
    * Select the **Access Key** you configured prior to setting up this Repository.

4. Click Save once everything is configured.

## Monorepo: one checkout for all templates {#monorepo}

:::info Since v2.20
The **Single checkout for all templates** option is available since **Semaphore UI v2.20**. Earlier versions always clone a Repository once per template.
:::

By default Semaphore clones a Repository once per template, so every template works in a copy of its own. For a large repository that many templates share, the copies cost disk space and every task starts with a clone or pull of its own copy.

Tick **Single checkout for all templates** to clone the Repository once and share that checkout between all templates of the project. The option is not available for a local folder (`/path/to/the/repo`), which is never cloned.

<div style={{maxWidth: 450}}>

![Repository form with Single checkout for all templates enabled](/assets/repository-monorepo.webp)

</div>

How the shared checkout works:

* Before a task starts, Semaphore takes a lock on the checkout, fetches and pulls the branch configured in the Repository, then releases the lock. Tasks of other templates wait for the lock while the checkout is being updated, but the tasks themselves run in parallel.
* Every branch still gets a checkout of its own, so Repositories with different branches never share a working tree.
* The checkout is shared, but the Ansible home directory (roles and collections installed from `requirements.yml`) stays separate for every template.

Because every template works in the same checkout on the same branch, a template of a monorepo cannot have a **Branch** of its own, and it cannot enable the **Branch** prompt that lets a task pick a branch or commit. The template form disables both and explains why, and the API rejects such a template. Make sure the playbooks do not write into the checkout: a changed working tree breaks the next pull, and Semaphore then removes the checkout and clones it again. If a repository becomes a monorepo later, a branch its templates still have and the branch or commit a task supplies are ignored, and every task runs on the repository branch.

## Editing an Existing Repository {#editing-an-existing-repository}
1. Go to the Repositories section of Semaphore.

2. Click on the pencil icon next to the Repository you wish to change, then you will be presented with the Repository configuration.

## Deleting a Repository {#deleting-a-repository}
Make sure the Repository that is about to be delete is not in use by any Task Templates.
A Repository cannot be deleted if it is used in any Task Templates:
1. Go to the Repositories section of Semaphore.

2. Click on the trash can icon on of the Repository you wish to delete.

3. Click Yes on the confirmation pop-up if you are sure you want this Repository to be deleted.

## Requirements {#requirements}
Upon project initialization Semaphore searches for and installs Ansible roles and collections from requirements.yml in the following locations and order.

### Roles {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Collection {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### Processing Logic {#processing-logic}

* Each file is processed independently
* If a file exists, it will be processed according to its type (role or collection)
* If any file processing results in an error, the installation process stops and returns the error
* The same requirements.yml file in the root directories (**`playbook_dir`/requirements.yml** and **`repo_path`/requirements.yml**) is processed twice - once for roles and once for collections

Semaphore will attempt to process all these locations regardless of whether previous locations were found or successfully processed, except in the case of errors.
