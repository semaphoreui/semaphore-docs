# Task Templates

Templates define how to run Semaphore tasks. Currently the following task types are supported:

* Playbook repository
* Playbook filename
* Inventory
* Environment
* Vault password file
* Extra CLI arguments
* and much more

![](../../.gitbook/assets/template\_new\_ipad.png)

The task template can be one of the following types:

* [Task](#task)
* [Build](#build)
* [Deploy](#deploy)

### Task

Just runs specified playbooks with specified parameters.

### Build

This type of template should be used to create [artifacts](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\)). The start version of the artifact can be specified in a template parameter. Each run increments the artifact version.

![](<../../.gitbook/assets/template\_new\_build\_ipad (1).png>)

Semaphore doesn't support artifacts out-of-box, it only provides task versioning. You should implement the artifact creation yourself. Read the article [CI/CD](../../administration-guide/cicd.md) to know how to do this.

### Deploy

This type of template should be used to deploy artifacts to the destination servers. Each `deploy` template is associated with a `build` template.

![](../../.gitbook/assets/template\_new\_deploy\_ipad.png)

This allows you to deploy a specific version of the artifact to the servers.

### Schedule

You can set up task scheduling by specifying a cron schedule in the template settings. Cron expression format you can find in [documentation](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format).

![](../../.gitbook/assets/template\_schedule.png)

#### Run a task when a new commit is added to the repository

You can use cron to periodically check for new commits in the repository and trigger a task upon their arrival.

For example you have source code of the app in the git repository. You can add it to **Repositories** and trigger the Build task for new commits.

![](../../.gitbook/assets/template\_schedule\_commit.png)
