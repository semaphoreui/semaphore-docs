# What is Semaphore UI?

Semaphore UI is a self-hosted web interface and REST API for running automation. It gives your team a central place to launch **Ansible** playbooks, **Terraform/OpenTofu** code, and **Shell/Bash**, **PowerShell**, and **Python** scripts — with access control, logging, scheduling, and encrypted credential storage built in.

Semaphore UI consists of a server that stores your configuration in a database (SQLite, MySQL, or PostgreSQL), a web UI where users create projects and run tasks, and, optionally, [runners](/admin-guide/runners) — separate hosts that connect to the server and execute tasks remotely, similar to GitLab or GitHub Actions runners. Without runners, the server executes tasks itself, so a single instance is all you need to get started.

## Core capabilities

- **Lightweight and self-hosted.** Semaphore is written in Go and ships as a single binary and a Docker image. It runs on Linux, macOS, and Windows, on your own infrastructure — nothing leaves your network.
- **Encrypted credentials.** SSH keys, passwords, and access tokens live in the [Key Store](/user-guide/key-store) and are stored encrypted in the database, or in an external secret manager such as HashiCorp Vault or OpenBao.
- **Access control.** Users authenticate locally or via [LDAP](/admin-guide/ldap) and [OpenID Connect](/admin-guide/openid), and each project has its own [team with roles](/user-guide/team).
- **Full REST API and CLI.** Everything you can do in the UI you can also do through the [API](/admin-guide/api) or the [CLI](/admin-guide/cli), so Semaphore fits into existing pipelines.
- **Scheduling and webhooks.** [Schedules](/user-guide/schedules) run templates on a cron expression; [Integrations](/user-guide/integrations) trigger them from incoming webhooks.

Semaphore UI is open source. The Pro edition adds features such as project-level runners and a Terraform/OpenTofu HTTP backend for state storage.

## When to choose Semaphore UI

- **Compared with plain cron.** Cron runs commands on a timer, but gives you no shared UI, run history, secret storage, or access control. Semaphore adds all of these while keeping cron-style scheduling, and also lets people start runs on demand.
- **Compared with CI pipelines (GitHub Actions, GitLab CI, Jenkins).** CI systems are built around code events: build and test on every commit. Semaphore is built around operations: inventories of hosts, credentials, scheduled maintenance, and on-demand runs with per-run input. Many teams use both — CI for building software, Semaphore for running it against infrastructure.
- **Compared with AWX / Ansible Automation Platform.** AWX offers deep, Ansible-only functionality and is typically deployed on Kubernetes with a larger resource footprint. Semaphore is easier to install (one binary or container), needs fewer resources, and also runs Terraform/OpenTofu, Bash, PowerShell, and Python — though AWX provides more Ansible-specific enterprise features.
- **Compared with Rundeck.** Rundeck is a general-purpose job scheduler with a broad plugin ecosystem. Semaphore is more focused: first-class support for Ansible and Terraform/OpenTofu workflows with a smaller footprint and simpler setup.

## Next steps

- [Quickstart](/getting-started/quickstart) — run your first task in about 15 minutes.
- [Core concepts](/getting-started/core-concepts) — how projects, templates, and tasks fit together.
- [Installation](/admin-guide/installation) — all installation methods: package managers, Docker, binary, Kubernetes.
