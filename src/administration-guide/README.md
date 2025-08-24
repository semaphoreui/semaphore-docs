# Administration Guide

Use this guide to install, configure, secure, operate, and upgrade Semaphore.

## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting

## Quick links

- Installation: [Overview](./installation.md)
  - [Package manager](./installation/package-manager.md)
  - [Docker](./installation/docker.md)
  - [Binary file](./installation/binary-file.md)
  - [Kubernetes (Helm chart)](./installation/k8s.md)
  - [Cloud](./installation/cloud.md)
  - [Snap (deprecated)](./installation/snap.md)
  - [Manual installation](./installation_manually.md)
- Configuration: [Overview](./configuration.md)
  - [Configuration file](./configuration/config-file.md)
  - [Environment variables](./configuration/env-vars.md)
  - [Interactive setup](./configuration/cli.md)
  - [Snap configuration](./configuration/snap.md)
- Security: [Overview](./security.md)
  - [Database security](./security/database.md)
  - [Network security](./security/network.md)
  - [NGINX config](./security/nginx.md)
  - [Apache config](./security/apache.md)
  - [Kerberos](./security/kerberos.md)
- Authentication:
  - [LDAP](./ldap.md)
  - [OpenID](./openid.md)
    - [GitHub](./openid/github.md)
    - [Google](./openid/google.md)
    - [GitLab](./openid/gitlab.md)
    - [Gitea](./openid/gitea.md)
    - [Authelia](./openid/authelia.md)
    - [Authentik](./openid/authentik.md)
    - [Keycloak](./openid/keycloak.md)
    - [Okta](./openid/okta.md)
    - [Azure](./openid/azure.md)
    - [Zitadel](./openid/zitadel.md)
- Operations:
  - [CLI](./cli.md)
  - [Runners](./runners.md)
  - [Logs](./logs.md)
  - [Notifications](./notifications.md)
    - [Email](./notifications/email.md)
    - [Telegram](./notifications/telegram.md)
    - [Slack](./notifications/slack.md)
    - [Teams](./notifications/teams.md)
    - [Rocket.Chat](./notifications/rocket.md)
    - [DingTalk](./notifications/ding.md)
    - [Gotify](./notifications/gotify.md)
- Maintenance:
  - [Upgrading](./upgrading.md)
  - [Troubleshooting](./troubleshooting.md)
