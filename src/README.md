# Welcome to Semaphore UI

Semaphore UI is a modern interface and API for running Ansible, Terraform/OpenTofu, PowerShell, Python, and shell automation with minimal overhead. This documentation helps you evaluate, deploy, and operate Semaphore confidently.

<img style="box-shadow: none;" src=".gitbook/assets/134777345-8789d9e4-ff0d-439c-b80e-ddc56b74fcee.webp">

## Why Semaphore

Semaphore is written in Go and ships as a single binary for Windows, macOS, and Linux (x64, ARM, ARM64). It pairs a lightweight architecture with enterprise features:

* Works with MySQL, PostgreSQL, or embedded BoltDB.
* Encrypts secrets at rest and integrates with LDAP and OpenID Connect.
* Offers a responsive web UI, REST API, and CLI for the same workflows.
* Scales horizontally with remote runners and project-scoped permissions.

With Semaphore you can:

* [Build, deploy, and roll back automation pipelines](./administration-guide/cicd.md).
* Organize playbooks and scripts into projects with fine-grained access control.
* Manage inventories, repositories, secrets, and environment variables centrally.
* Run tasks manually, on schedules, or through the API/CLI, and monitor detailed logs.
* Notify teams via email, chat, and webhooks when automation completes.

## Where to start

* **New to Semaphore?** Begin with [Getting Started](./getting-started/README.md) for a 10-minute quick start, core concepts, and a UI tour.
* **Running production?** Jump to the [Admin Guide](./administration-guide/README.md) for installation, configuration, security, and integration topics.
* **Operating day-to-day?** Head over to the [User Guide](./user-guide/README.md) to learn how to create projects, templates, and schedules.

## Helpful links

* Source code: [https://github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore)
* Issue tracking: [https://github.com/semaphoreui/semaphore/issues](https://github.com/semaphoreui/semaphore/issues)
* Docker images: [https://hub.docker.com/r/semaphoreui/semaphore](https://hub.docker.com/r/semaphoreui/semaphore)
* Snap package: [https://snapcraft.io/semaphore](https://snapcraft.io/semaphore)
* Contact: [denis@semaphoreui.com](mailto:denis@semaphoreui.com)
* Docker container configurator:

   [![](https://img.shields.io/badge/docker_configurator-0050ab?style=for-the-badge&logo=docker)](https://semaphoreui.com/install/docker/)

* Community chat:

   [![discord](https://img.shields.io/badge/discord_community-510b80?style=for-the-badge&logo=discord)](https://discord.gg/5R6k7hNGcH)