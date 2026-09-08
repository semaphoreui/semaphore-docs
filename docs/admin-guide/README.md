# Administration Guide

Welcome to the Semaphore UI Administration Guide. This guide provides comprehensive information for installing, configuring, securing, and maintaining your Semaphore instance.

> Just evaluating or setting up your first project? Start with the [Getting Started](../getting-started/README.md) section before diving into the full administration topics.

## What is Semaphore UI?

Semaphore UI is a modern, open-source web interface for running automation tasks. It is designed to be a lightweight, fast, and easy-to-use alternative to more complex automation platforms.

It allows you to securely manage and execute tasks for:
*   **Ansible** playbooks
*   **Terraform/OpenTofu** infrastructure-as-code
*   **PowerShell** and **Shell** scripts
*   **Python** scripts

## Core Features & Philosophy

Understanding Semaphore's design principles can help you get the most out of it:

*   **Lightweight and Performant**: Semaphore is written in **Go** and distributed as a **single binary file**. It has minimal resource requirements (CPU/RAM) and does not require external dependencies like Kubernetes, Docker, or a JVM. This makes it fast, efficient, and easy to deploy.
*   **Simple to Install and Maintain**: You can get Semaphore running in minutes. Installation can be as simple as downloading the binary and running it. The simple architecture makes upgrades and maintenance straightforward.
*   **Flexible Deployment**: Run it as a binary, as a systemd service, or in a Docker container. It's suitable for everything from a personal homelab to enterprise environments.
*   **Self-Hosted and Secure**: Semaphore is a self-hosted solution. All your data, credentials, and logs remain on your own infrastructure, giving you full control. Credentials are always encrypted in the database.
*   **Powerful Integrations**: While simple, Semaphore supports powerful features like LDAP/OpenID authentication, detailed role-based access control (RBAC) per project, remote runners for scaling out task execution, and a full REST API for programmatic access.

This guide will walk you through setting up and managing these features for your specific needs.

<!-- ## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting -->

## Quick links

- Installation: [Overview](/admin-guide/installation)
  - [Package manager](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [Binary file](/admin-guide/installation/binary-file)
  - [Kubernetes (Helm chart)](/admin-guide/installation/k8s)
  - [Cloud](/admin-guide/installation/cloud)
  - [Manual installation](/admin-guide/installation_manually)
- Configuration: [Overview](/admin-guide/configuration)
  - [Configuration file](/admin-guide/configuration/config-file)
  - [Environment variables](/admin-guide/configuration/env-vars)
  - [Interactive setup](/admin-guide/configuration/cli)
- Security: [Overview](/admin-guide/security)
  - [Database security](/admin-guide/security/database)
  - [Network security](/admin-guide/security/network)
  - [NGINX config](/admin-guide/reverse-proxy/nginx)
  - [Apache config](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- Authentication:
  - [LDAP](/admin-guide/ldap)
  - [OpenID](/admin-guide/openid)
    - [GitHub](/admin-guide/openid/github)
    - [Google](/admin-guide/openid/google)
    - [GitLab](/admin-guide/openid/gitlab)
    - [Gitea](/admin-guide/openid/gitea)
    - [Authelia](/admin-guide/openid/authelia)
    - [Authentik](/admin-guide/openid/authentik)
    - [Keycloak](/admin-guide/openid/keycloak)
    - [Okta](/admin-guide/openid/okta)
    - [PingFederate](/admin-guide/openid/pingfederate)
    - [Azure](/admin-guide/openid/azure)
    - [Zitadel](/admin-guide/openid/zitadel)
- Operations:
  - [CLI](/admin-guide/cli)
  - [Runners](/admin-guide/runners)
  - [Logs](/admin-guide/logs)
  - [Notifications](/category/notifications)
    - [Email](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- Maintenance:
  - [Upgrading](/admin-guide/upgrading)
  - [License activation](/admin-guide/license)
  - [Troubleshooting](/admin-guide/troubleshooting)
