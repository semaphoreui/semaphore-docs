# Guide d'administration

Bienvenue dans le guide d'administration de Semaphore UI. Ce guide fournit des informations complètes pour installer, configurer et maintenir votre instance Semaphore.

## Qu'est-ce que Semaphore UI ? {#what-is-semaphore-ui}

Semaphore UI est une interface web moderne et open source pour exécuter des tâches d'automatisation. Il est conçu comme une alternative légère, rapide et facile à utiliser aux plateformes d'automatisation plus complexes.

Il vous permet de gérer et d'exécuter en toute sécurité des tâches pour :
*   les playbooks **Ansible**
*   l'infrastructure as code **Terraform/OpenTofu**
*   les scripts **PowerShell** et **Shell**
*   les scripts **Python**

## Fonctionnalités principales et philosophie {#core-features--philosophy}

Comprendre les principes de conception de Semaphore peut vous aider à en tirer le meilleur parti :

*   **Léger et performant** : Semaphore est écrit en **Go** et distribué sous forme d'un **fichier binaire unique**. Il a des besoins en ressources (CPU/RAM) minimes et ne nécessite pas de dépendances externes comme Kubernetes, Docker ou une JVM. Cela le rend rapide, efficace et facile à déployer.
*   **Simple à installer et à maintenir** : vous pouvez faire fonctionner Semaphore en quelques minutes. L'installation peut se résumer à télécharger le binaire et à l'exécuter. L'architecture simple rend les mises à niveau et la maintenance directes.
*   **Déploiement flexible** : exécutez-le sous forme de binaire, de service systemd ou dans un conteneur Docker. Il convient à tout, du homelab personnel aux environnements d'entreprise.
*   **Auto-hébergé et sécurisé** : Semaphore est une solution auto-hébergée. Toutes vos données, identifiants et journaux restent sur votre propre infrastructure, ce qui vous donne un contrôle total. Les identifiants sont toujours chiffrés dans la base de données.
*   **Intégrations puissantes** : bien que simple, Semaphore prend en charge des fonctionnalités puissantes comme l'authentification LDAP/OpenID, un contrôle d'accès basé sur les rôles (RBAC) détaillé par projet, des runners distants pour faire évoluer l'exécution des tâches, et une API REST complète pour un accès programmatique.

Ce guide vous accompagnera dans la mise en place et la gestion de ces fonctionnalités selon vos besoins spécifiques.

<!-- ## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting -->

## Liens rapides {#quick-links}

- Installation : [Vue d'ensemble](/admin-guide/installation)
  - [Gestionnaire de paquets](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [Fichier binaire](/admin-guide/installation/binary-file)
  - [Kubernetes (chart Helm)](/admin-guide/installation/k8s)
  - [Cloud](/admin-guide/installation/cloud)
  - [Installation manuelle](/admin-guide/installation_manually)
- Configuration : [Vue d'ensemble](/admin-guide/configuration)
  - [Fichier de configuration](/admin-guide/configuration/config-file)
  - [Variables d'environnement](/admin-guide/configuration/env-vars)
  - [Configuration interactive](/admin-guide/configuration/cli)
- Sécurité : [Vue d'ensemble](/admin-guide/security)
  - [Sécurité de la base de données](/admin-guide/security/database)
  - [Sécurité réseau](/admin-guide/security/network)
  - [Configuration NGINX](/admin-guide/reverse-proxy/nginx)
  - [Configuration Apache](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- Authentification :
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
- Exploitation :
  - [CLI](/admin-guide/cli)
  - [Runners](/admin-guide/runners)
  - [Journaux](/admin-guide/logs)
  - [Notifications](/admin-guide/notifications)
    - [E-mail](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- Maintenance :
  - [Mise à niveau](/admin-guide/upgrading)
  - [Activation de la licence](/admin-guide/license)
  - [Dépannage](/faq/troubleshooting)
