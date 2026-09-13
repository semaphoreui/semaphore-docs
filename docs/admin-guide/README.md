---
title: Admin Guide
description: For administrators who install, configure, secure, and operate a Semaphore server for their teams.
---

# Admin Guide

This section is for administrators who install and operate Semaphore for other
people. Everything here needs access the server itself: the configuration file,
environment variables, command line, or the machine Semaphore runs on. Work done
inside a project through the web interface is covered in the
[User Guide](/user-guide).

Semaphore is a single Go binary with a web interface and a REST API. It stores
its data in SQLite, MySQL, or PostgreSQL, keeps credentials encrypted, and runs
tasks either on the server itself or on separate runners. A working installation
therefore comes down to four decisions: how to install it, where the database
lives, how users sign in, and where tasks execute.

## Set up {#set-up}

Everything you configure before or around starting the server.

| Page | What it covers |
|---|---|
| [Installation](/admin-guide/installation) | Package manager, Docker, binary, Kubernetes, and a manual setup. |
| [Configuration](/admin-guide/configuration) | The `config.json` file, environment variables, and every supported option. |
| [Upgrading](/admin-guide/upgrading) | Moving to a newer release and what to check first. |
| [Reverse proxy](/admin-guide/reverse-proxy) | Serving Semaphore behind nginx, Apache, or Caddy, with TLS. |
| [Security](/admin-guide/security) | Password hashing, secret encryption, network hardening, and task JWTs. |
| [LDAP and AD](/admin-guide/ldap) | Signing in against a directory service. |
| [OpenID Connect](/admin-guide/openid) | Single sign-on with GitHub, Google, Keycloak, Okta, and nine more providers. |
| [Runners](/admin-guide/runners) | Executing tasks on machines other than the server. |
| [High availability](/admin-guide/ha) | Running several Semaphore nodes against one database. |

## Operate {#operate}

Everything you do on a server that is already running.

| Page | What it covers |
|---|---|
| [CLI](/admin-guide/cli) | Managing users, projects, vaults, runners, and database migrations from the shell. |
| [API](/admin-guide/api) | Authenticating with a token and driving Semaphore programmatically. |
| [CI/CD integration](/admin-guide/cicd) | Starting Semaphore tasks from an external pipeline. |
| [Logs](/admin-guide/logs) | Server logs, task logs, and forwarding them elsewhere. |
| [Metrics](/admin-guide/metrics) | The Prometheus endpoint and the metrics it exposes. |
| [Notifications](/admin-guide/notifications) | Delivery channels for alerts: e-mail, Telegram, Slack, and others. |
| [License](/admin-guide/license) | Activating a Pro or Enterprise subscription. |

## Where to start {#where-to-start}

If you are installing Semaphore for the first time, read
[Installation](/admin-guide/installation) and pick one method, then
[Configuration](/admin-guide/configuration) to learn how options are supplied.
Put the server behind a [reverse proxy](/admin-guide/reverse-proxy) with TLS
before anyone else uses it.

To see what a paid subscription adds, see [Editions](/editions).
