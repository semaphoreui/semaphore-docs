---
title: Repositories
description: Supported repository URL types, authentication keys, deploy keys, subdirectory playbooks, creating and deleting repositories, and how requirements.yml is processed.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

### Configuring Deploy Keys {#deploy-keys}

In enterprise automation environments, using dedicated **Deploy Keys** (or Access Keys) scoped to a single repository is the recommended best practice over personal user SSH keys or Personal Access Tokens (PATs). Deploy keys ensure:
* **Lifecycle Isolation**: CI/CD and automation pipelines do not depend on individual employee accounts or personal credentials.
* **Least Privilege**: Deploy keys can be granted strictly read-only access, ensuring Semaphore cannot push unwanted changes to the source repository.
* **Scoped Blast Radius**: If a key needs to be rotated, only the specific repository is affected.

:::tip Generate SSH Keys Directly in Semaphore
You do not need to generate SSH keys on the command line. In Semaphore, go to **Key Store** &rarr; **New Key** &rarr; select **SSH Key** &rarr; click **Generate**. Semaphore will create a secure keypair and present a dialog with the **Public Key** ready to copy. See [Key Store](/user-guide/key-store#built-in-ssh-key-generator) for details.
:::

Copy the public key generated in Semaphore and add it to your Git provider:

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. In GitHub, open your repository and go to **Settings** &rarr; **Deploy keys**.
2. Click **Add deploy key**.
3. Enter a descriptive title (for example, `Semaphore UI Runner`).
4. Paste the public key into the **Key** field.
5. Leave **Allow write access** unchecked to maintain read-only permissions.
6. Click **Add key**.

In Semaphore, set the Repository URL to the SSH format:

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. In GitLab, navigate to your project and open **Settings** &rarr; **Repository**.
2. Expand the **Deploy keys** section.
3. Click **Add key**.
4. Enter a title (for example, `Semaphore UI Runner`), paste the public key, and leave **Grant write permissions to this key** unchecked.
5. Click **Add key**.

In Semaphore, set the Repository URL to the SSH format:

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. In Bitbucket, open your repository and navigate to **Repository settings** &rarr; **Access keys** (under *Security*).
2. Click **Add key**.
3. Label the key (for example, `Semaphore UI Runner`), paste the public key, and set **Permissions** to `Read`.
4. Click **Add access key**.

In Semaphore, set the Repository URL to the SSH format:

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

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
The **Single checkout for all templates** option is available since **Semaphore 2.20**. Earlier versions always clone a Repository once per template.
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

Because every template works in the same checkout on the same branch, a template of a monorepo cannot have a **Branch** of its own, and it cannot enable the **Branch** prompt that lets a task pick a branch or commit. The template form disables both and explains why, and the API rejects such a template. Make sure the playbooks do not write into the checkout: a changed working tree breaks the next pull, and Semaphore then removes the checkout and clones it again.

## Playbooks in Subdirectories {#subdirectories}

Enterprise repositories frequently organize automation across dedicated directories, monorepos, or multi-environment layouts rather than placing all playbooks at the repository root.

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

When creating a [Task Template](/user-guide/task-templates), the **Playbook filename** is always specified **relative to the repository root**:

* **Use relative paths**: Enter `playbooks/site.yml` or `playbooks/provisioning/aws-vms.yml`.
* **No leading slash**: Do not use `/playbooks/site.yml`. A leading slash causes the executor to search from the system root directory instead of the repository clone.
* **Unix forward slashes**: Always use `/` even if running on Windows runner nodes.
* **Case-sensitive**: Paths must match exact folder and file casing (for example, `playbooks/site.yml`).

:::info Working Directory and Requirements
When a playbook runs from a subdirectory (such as `playbooks/site.yml`), Semaphore evaluates both the playbook directory (`playbook_dir`) and the repository root (`repo_path`) when resolving roles and collections. See [Requirements](#requirements) below for the exact search order.
:::

## Editing an Existing Repository {#editing-an-existing-repository}
1. Go to the Repositories section of Semaphore.

2. Click on the pencil icon next to the Repository you wish to change, then you will be presented with the Repository configuration.

## Deleting a Repository {#deleting-a-repository}

To prevent breaking existing automation jobs, Semaphore enforces relational dependency safeguards when deleting repositories.

### Dependency Protection & In-Use Safeguards {#dependency-protection}

A repository cannot be deleted if it is currently assigned to one or more Task Templates.

Before attempting deletion, Semaphore queries active template references:
1. In the Repositories list, clicking the trash icon checks if the repository is referenced by any project templates.
2. If dependencies exist, Semaphore displays a warning dialog listing the exact Task Templates referencing this repository, with direct links to each template.
3. If deleted directly via the API while in use, the request is rejected with HTTP `400 Bad Request`:

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

To safely delete a repository:
1. Navigate to **Templates** and reassign each dependent template to another repository, or delete the unused templates.
2. Return to **Repositories** and click the trash can icon next to the repository.
3. Confirm deletion in the pop-up dialog.

:::tip Automatic Checkout Cache Purge
When a repository is successfully deleted, Semaphore automatically purges the repository's local checkout working directory from the host/runner filesystem, freeing disk space.
:::

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
