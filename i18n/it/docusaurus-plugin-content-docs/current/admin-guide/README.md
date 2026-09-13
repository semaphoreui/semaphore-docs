# Guida all'amministrazione

Benvenuti nella Guida all'amministrazione di Semaphore UI. Questa guida fornisce informazioni complete per installare, configurare e mantenere la propria istanza di Semaphore.

## Che cos'è Semaphore UI? {#what-is-semaphore-ui}

Semaphore UI è un'interfaccia web moderna e open source per eseguire task di automazione. È progettata per essere un'alternativa leggera, veloce e facile da usare rispetto a piattaforme di automazione più complesse.

Permette di gestire ed eseguire in modo sicuro task per:
*   playbook **Ansible**
*   infrastructure-as-code **Terraform/OpenTofu**
*   script **PowerShell** e **Shell**
*   script **Python**

## Funzionalità principali e filosofia {#core-features--philosophy}

Comprendere i principi di progettazione di Semaphore aiuta a sfruttarlo al meglio:

*   **Leggero e performante**: Semaphore è scritto in **Go** e distribuito come **singolo file binario**. Ha requisiti di risorse minimi (CPU/RAM) e non richiede dipendenze esterne come Kubernetes, Docker o una JVM. Questo lo rende veloce, efficiente e facile da distribuire.
*   **Semplice da installare e mantenere**: Semaphore può essere operativo in pochi minuti. L'installazione può ridursi a scaricare il binario ed eseguirlo. L'architettura semplice rende aggiornamenti e manutenzione immediati.
*   **Distribuzione flessibile**: può essere eseguito come binario, come servizio systemd o in un container Docker. È adatto a qualsiasi contesto, da un homelab personale agli ambienti enterprise.
*   **Self-hosted e sicuro**: Semaphore è una soluzione self-hosted. Tutti i dati, le credenziali e i log restano sulla propria infrastruttura, garantendo il pieno controllo. Le credenziali sono sempre cifrate nel database.
*   **Integrazioni potenti**: pur essendo semplice, Semaphore supporta funzionalità avanzate come l'autenticazione LDAP/OpenID, un controllo degli accessi basato sui ruoli (RBAC) dettagliato per progetto, runner remoti per scalare l'esecuzione dei task e un'API REST completa per l'accesso programmatico.

Questa guida accompagna nella configurazione e nella gestione di queste funzionalità in base alle proprie esigenze.

<!-- ## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting -->

## Collegamenti rapidi {#quick-links}

- Installazione: [Panoramica](/admin-guide/installation)
  - [Gestore di pacchetti](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [File binario](/admin-guide/installation/binary-file)
  - [Kubernetes (chart Helm)](/admin-guide/installation/k8s)
  - [Cloud](/admin-guide/installation/cloud)
  - [Installazione manuale](/admin-guide/installation_manually)
- Configurazione: [Panoramica](/admin-guide/configuration)
  - [File di configurazione](/admin-guide/configuration/config-file)
  - [Variabili d'ambiente](/admin-guide/configuration/env-vars)
  - [Configurazione interattiva](/admin-guide/configuration/cli)
- Sicurezza: [Panoramica](/admin-guide/security)
  - [Sicurezza del database](/admin-guide/security/database)
  - [Sicurezza di rete](/admin-guide/security/network)
  - [Configurazione NGINX](/admin-guide/reverse-proxy/nginx)
  - [Configurazione Apache](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- Autenticazione:
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
- Operazioni:
  - [CLI](/admin-guide/cli)
  - [Runner](/admin-guide/runners)
  - [Log](/admin-guide/logs)
  - [Notifiche](/admin-guide/notifications)
    - [Email](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- Manutenzione:
  - [Aggiornamento](/admin-guide/upgrading)
  - [Attivazione della licenza](/admin-guide/license)
  - [Risoluzione dei problemi](/faq/troubleshooting)
