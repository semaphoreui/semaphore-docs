---
title: Voraussetzungen
description: Was Sie vor der Installation von Semaphore benötigen - einen Host, eine Datenbank, Netzwerkzugriff, Zugangsdaten und die Automatisierungswerkzeuge, die Ihre Tasks aufrufen.
---

# Voraussetzungen

Semaphore selbst stellt kaum harte Anforderungen. Das meiste, was Sie vorbereiten müssen,
gehört zu der Automatisierung, die es ausführen wird, und zu deren Umfeld. Arbeiten Sie
diese Seite vor der [Installation](/admin-guide/installation) durch, dann dauert die
Installation selbst nur Minuten.

## Ein Host {#a-host}

Semaphore wird als einzelne Binärdatei und als Container-Image ausgeliefert und läuft unter
Linux, macOS und Windows. Die Pakete, die Docker-Images und das Helm-Chart zielen auf
Linux, und die meisten Installationen nutzen es.

Der Dienst ist leichtgewichtig: Es ist ein Go-Prozess, der eine Weboberfläche
bereitstellt. Was tatsächlich Arbeitsspeicher und CPU verbraucht, sind Ansible, Terraform
und Ihre Skripte, die parallel auf derselben Maschine laufen. Dimensionieren Sie den Host
für die Arbeitslast, nicht für Semaphore, und begrenzen Sie die Parallelität mit der
Projekteinstellung **Max number of parallel tasks** — oder verlagern Sie die Ausführung auf
[Runner](/admin-guide/runners) und dimensionieren Sie stattdessen diese.

Planen Sie an zwei Stellen persistenten Speicher ein: für die Datenbank und für das
Verzeichnis unter `tmp_path`, in das Repositories geklont werden. In Docker bedeutet das
ein Volume; ein Container ohne Volume verliert seine Daten beim Neuerstellen.

## Eine Datenbank {#a-database}

Wählen Sie sie vor der Installation aus, denn ein späterer Wechsel bedeutet Datenmigration.

| Engine | Wann Sie sie verwenden |
|---|---|
| **SQLite** | Ein Server, ein Team. Mitgeliefert, ohne Einrichtung, die Voreinstellung. |
| **PostgreSQL** oder **MySQL/MariaDB** | Der Dienst ist für mehr als eine Handvoll Personen wichtig, Sie möchten Sicherungen und Monitoring über Ihre vorhandene Datenbankplattform, oder Sie planen mehr als einen Knoten. |

[Hochverfügbarkeit](/admin-guide/ha) erfordert PostgreSQL oder MySQL sowie Redis und kann
SQLite nicht nutzen. Wenn HA auf Ihrer Roadmap steht, beginnen Sie mit PostgreSQL.

Legen Sie die Datenbank und einen darauf berechtigten Benutzer vor der Installation an;
Semaphore erzeugt seine Tabellen beim ersten Start und bei jedem Upgrade selbst.

## Netzwerkzugriff {#network-access}

| Semaphore muss erreichen | Wofür |
|---|---|
| Ihre Git-Remotes | Klonen der Repositories, auf die Templates verweisen. |
| Die Hosts und Cloud-APIs, die Sie automatisieren | Die eigentliche Arbeit. |
| Ihren Identity Provider, falls vorhanden | Anmeldung per [LDAP](/admin-guide/authentication/ldap) oder [OpenID Connect](/admin-guide/authentication/openid). |
| Ihre Benachrichtigungskanäle | E-Mail, Telegram, Slack und die übrigen. |

Benutzer erreichen die Weboberfläche auf Port `3000`, sofern Sie ihn nicht ändern. Setzen
Sie [TLS](/admin-guide/reverse-proxy) davor, bevor sich jemand anmeldet: Sitzungen und
API-Tokens werden darüber übertragen.

Wenn ein Runner die Tasks ausführt, braucht *er* den Zugriff auf Git-Remotes und Zielhosts
sowie ausgehenden Zugriff auf den Semaphore-Server. Der Server verbindet sich niemals zu
einem Runner.

## Automatisierungswerkzeuge {#automation-tooling}

Was ein Task ausführt, muss dort installiert sein, wo er ausgeführt wird — auf dem Server,
auf dem Runner oder im Container-Image, das der Executor verwendet.

- Die Docker-Images enthalten Ansible, Terraform, OpenTofu und die üblichen
  Abhängigkeiten. Zusätzliche Python-Pakete kommen in eine eingebundene
  `requirements.txt`, siehe
  [Zusätzliche Python-Abhängigkeiten installieren](/admin-guide/installation/docker#installing-additional-python-dependencies).
- Eine Paket- oder Binärinstallation liefert Ihnen nur Semaphore. Installieren Sie Git,
  Python, Ansible sowie benötigte Collections oder Provider selbst, siehe
  [Manuelle Installation](/admin-guide/installation_manually).

Prüfen Sie, dass Ihr Playbook oder Ihre Konfiguration auf dieser Maschine aus einer Shell
heraus läuft, und zwar als der Benutzer, unter dem Semaphore läuft, bevor Sie ein Template
daraus erstellen. Fast jede Meldung „lokal funktioniert es“ löst sich in einer fehlenden
Collection, einem fehlenden Provider oder einem fehlenden Python-Paket auf.

## Zugangsdaten, die bereitliegen sollten {#credentials-to-have-ready}

Sammeln Sie diese vor dem ersten Template, sonst wird jedes Einzelne zu einem eigenen
Zwischenstopp:

- Einen **Deploy Key oder ein Token** für jedes Repository, das Semaphore klonen wird.
- Die **SSH-Schlüssel oder Logins**, mit denen die von Ihnen verwalteten Hosts erreicht werden.
- Alle **Cloud-Zugangsdaten**, die Ihr Terraform oder Ihre Module benötigen.
- Ein **Ansible-Vault-Passwort**, falls Ihre Playbooks verschlüsselt sind.

All das gehört in den [Key Store](/user-guide/key-store), nicht in das Repository.

## Entscheidungen, die zuerst anstehen {#decisions-to-make-first}

Drei Entscheidungen sind jetzt günstig und später teuer:

1. **Datenbank-Engine**, wie oben beschrieben.
2. **Die URL, die Benutzer verwenden werden.** Legen Sie sie als `web_host` fest. Reverse
   Proxies, OIDC-Redirect-URIs, Webhook-Ziele und Links in Benachrichtigungen leiten sich
   daraus ab.
3. **`access_key_encryption`.** Erzeugen Sie den Wert bei der Installation, sichern Sie ihn
   separat und rotieren Sie ihn niemals leichtfertig: Jedes gespeicherte Secret ist damit
   verschlüsselt.

```bash
head -c32 /dev/urandom | base64
```

## Wie es weitergeht {#whats-next}

- [Installation](/admin-guide/installation) — eine Methode wählen und installieren.
- [Konfiguration](/admin-guide/configuration) — wie Optionen übergeben werden und was sie bedeuten.
- [Erste Schritte](/getting-started) — vom installierten Server zum ersten Task.
