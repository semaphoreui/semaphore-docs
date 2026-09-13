---
title: Administrationshandbuch
description: Für Administratoren, die einen Semaphore-Server für ihre Teams installieren, konfigurieren, absichern und betreiben.
---

# Administrationshandbuch

Dieser Bereich richtet sich an Administratoren, die Semaphore für andere Personen
installieren und betreiben. Alles hier setzt Zugriff auf den Server selbst voraus:
auf die Konfigurationsdatei, die Umgebungsvariablen, die Kommandozeile oder die
Maschine, auf der Semaphore läuft. Die Arbeit, die innerhalb eines Projekts über
die Weboberfläche erledigt wird, behandelt das
[Benutzerhandbuch](/user-guide).

Semaphore ist eine einzelne Go-Binärdatei mit einer Weboberfläche und einer
REST-API. Die Daten werden in SQLite, MySQL oder PostgreSQL gespeichert,
Zugangsdaten liegen verschlüsselt vor, und Tasks laufen entweder auf dem Server
selbst oder auf separaten Runnern. Eine funktionierende Installation läuft damit
auf vier Entscheidungen hinaus: wie Sie Semaphore installieren, wo die Datenbank
liegt, wie sich Benutzer anmelden und wo Tasks ausgeführt werden.

## Einrichten {#set-up}

Alles, was Sie vor dem Start des Servers und rund um ihn konfigurieren.

| Seite | Inhalt |
|---|---|
| [Installation](/admin-guide/installation) | Paketmanager, Docker, Binärdatei, Kubernetes und eine manuelle Einrichtung. |
| [Konfiguration](/admin-guide/configuration) | Die Datei `config.json`, Umgebungsvariablen und jede unterstützte Option. |
| [Aktualisieren](/admin-guide/upgrading) | Der Wechsel auf eine neuere Version und was Sie vorher prüfen sollten. |
| [Reverse-Proxy](/admin-guide/reverse-proxy) | Semaphore hinter nginx, Apache oder Caddy betreiben, mit TLS. |
| [Sicherheit](/admin-guide/security) | Passwort-Hashing, Verschlüsselung von Geheimnissen, Netzwerkhärtung und Task-JWTs. |
| [LDAP und AD](/admin-guide/ldap) | Anmeldung gegen einen Verzeichnisdienst. |
| [OpenID Connect](/admin-guide/openid) | Single Sign-on mit GitHub, Google, Keycloak, Okta und neun weiteren Anbietern. |
| [Runner](/admin-guide/runners) | Tasks auf anderen Maschinen als dem Server ausführen. |
| [Hochverfügbarkeit](/admin-guide/ha) | Mehrere Semaphore-Knoten gegen eine Datenbank betreiben. |

## Betreiben {#operate}

Alles, was Sie auf einem bereits laufenden Server tun.

| Seite | Inhalt |
|---|---|
| [CLI](/admin-guide/cli) | Benutzer, Projekte, Vaults, Runner und Datenbankmigrationen über die Shell verwalten. |
| [API](/admin-guide/api) | Authentifizierung mit einem Token und programmatische Steuerung von Semaphore. |
| [CI/CD-Integration](/admin-guide/cicd) | Semaphore-Tasks aus einer externen Pipeline starten. |
| [Protokolle](/admin-guide/logs) | Serverprotokolle, Task-Protokolle und deren Weiterleitung an andere Systeme. |
| [Metriken](/admin-guide/metrics) | Der Prometheus-Endpunkt und die Metriken, die er bereitstellt. |
| [Benachrichtigungen](/admin-guide/notifications) | Zustellkanäle für Alerts: E-Mail, Telegram, Slack und andere. |
| [Lizenz](/admin-guide/license) | Ein Pro- oder Enterprise-Abonnement aktivieren. |

## Womit Sie beginnen {#where-to-start}

Wenn Sie Semaphore zum ersten Mal installieren, lesen Sie
[Installation](/admin-guide/installation) und wählen Sie eine Methode, danach
[Konfiguration](/admin-guide/configuration), um zu erfahren, wie Optionen
übergeben werden. Stellen Sie den Server hinter einen
[Reverse-Proxy](/admin-guide/reverse-proxy) mit TLS, bevor ihn andere nutzen.

Was ein kostenpflichtiges Abonnement zusätzlich bietet, zeigt [Editionen](/editions).
