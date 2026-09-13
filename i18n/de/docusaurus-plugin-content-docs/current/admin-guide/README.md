# Administrationshandbuch

Willkommen beim Administrationshandbuch von Semaphore UI. Dieses Handbuch enthält umfassende Informationen zur Installation, Konfiguration und Wartung Ihrer Semaphore-Instanz.

## Was ist Semaphore UI? {#what-is-semaphore-ui}

Semaphore UI ist eine moderne Open-Source-Weboberfläche zum Ausführen von Automatisierungsaufgaben. Sie ist als leichtgewichtige, schnelle und einfach zu bedienende Alternative zu komplexeren Automatisierungsplattformen konzipiert.

Sie ermöglicht das sichere Verwalten und Ausführen von Aufgaben für:
*   **Ansible**-Playbooks
*   **Terraform/OpenTofu**-Infrastructure-as-Code
*   **PowerShell**- und **Shell**-Skripte
*   **Python**-Skripte

## Kernfunktionen & Philosophie {#core-features--philosophy}

Wenn Sie die Designprinzipien von Semaphore verstehen, können Sie das Beste daraus herausholen:

*   **Leichtgewichtig und performant**: Semaphore ist in **Go** geschrieben und wird als **einzelne Binärdatei** ausgeliefert. Es hat minimale Ressourcenanforderungen (CPU/RAM) und benötigt keine externen Abhängigkeiten wie Kubernetes, Docker oder eine JVM. Dadurch ist es schnell, effizient und einfach bereitzustellen.
*   **Einfach zu installieren und zu warten**: Sie können Semaphore in wenigen Minuten in Betrieb nehmen. Die Installation kann so einfach sein wie das Herunterladen und Starten der Binärdatei. Die einfache Architektur macht Upgrades und Wartung unkompliziert.
*   **Flexible Bereitstellung**: Betreiben Sie es als Binärdatei, als systemd-Dienst oder in einem Docker-Container. Es eignet sich für alles vom privaten Homelab bis zur Unternehmensumgebung.
*   **Selbst gehostet und sicher**: Semaphore ist eine selbst gehostete Lösung. Alle Ihre Daten, Zugangsdaten und Logs verbleiben auf Ihrer eigenen Infrastruktur, sodass Sie die volle Kontrolle behalten. Zugangsdaten werden in der Datenbank immer verschlüsselt gespeichert.
*   **Leistungsstarke Integrationen**: Trotz seiner Einfachheit unterstützt Semaphore leistungsstarke Funktionen wie LDAP-/OpenID-Authentifizierung, detaillierte rollenbasierte Zugriffskontrolle (RBAC) pro Projekt, Remote-Runner zum Skalieren der Aufgabenausführung und eine vollständige REST-API für den programmatischen Zugriff.

Dieses Handbuch führt Sie durch die Einrichtung und Verwaltung dieser Funktionen für Ihre spezifischen Anforderungen.

<!-- ## Hier beginnen

- Installationsoptionen: Paketmanager, Docker/Compose, Binärdatei, Kubernetes (Helm), Snap (veraltet)
- Konfiguration nach der Installation: Konfigurationsdatei, Umgebungsvariablen, interaktive CLI-Einrichtung
- Grundlagen der Sicherheit: Reverse-Proxy, TLS, Härtung von Datenbank und Netzwerk
- Authentifizierung: LDAP- und OpenID-Connect-Anbieter
- Betrieb: CLI, Runner, Logs, Benachrichtigungen
- Wartung: Aktualisierung und Fehlerbehebung -->

## Schnellzugriff {#quick-links}

- Installation: [Übersicht](/admin-guide/installation)
  - [Paketmanager](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [Binärdatei](/admin-guide/installation/binary-file)
  - [Kubernetes (Helm-Chart)](/admin-guide/installation/k8s)
  - [Cloud](/admin-guide/installation/cloud)
  - [Manuelle Installation](/admin-guide/installation_manually)
- Konfiguration: [Übersicht](/admin-guide/configuration)
  - [Konfigurationsdatei](/admin-guide/configuration/config-file)
  - [Umgebungsvariablen](/admin-guide/configuration/env-vars)
  - [Interaktive Einrichtung](/admin-guide/configuration/cli)
- Sicherheit: [Übersicht](/admin-guide/security)
  - [Datenbanksicherheit](/admin-guide/security/database)
  - [Netzwerksicherheit](/admin-guide/security/network)
  - [NGINX-Konfiguration](/admin-guide/reverse-proxy/nginx)
  - [Apache-Konfiguration](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- Authentifizierung:
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
- Betrieb:
  - [CLI](/admin-guide/cli)
  - [Runner](/admin-guide/runners)
  - [Logs](/admin-guide/logs)
  - [Benachrichtigungen](/admin-guide/notifications)
    - [E-Mail](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- Wartung:
  - [Aktualisierung](/admin-guide/upgrading)
  - [Lizenzaktivierung](/admin-guide/license)
  - [Fehlerbehebung](/faq/troubleshooting)
