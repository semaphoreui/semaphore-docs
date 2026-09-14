---
title: Konfiguration
description: Semaphore liest Einstellungen aus einer Konfigurationsdatei und Umgebungsvariablen. Mit dem Online-Konfigurator können Sie beides über ein Formular vorbereiten. Wählen Sie die Methode, die zu Ihrem Server passt.
---

# Konfiguration

Semaphore liest Einstellungen aus einer Konfigurationsdatei und Umgebungsvariablen. Mit dem Online-Konfigurator können Sie beides über ein Formular vorbereiten. Wählen Sie die Methode, die zu Ihrem Server passt.

## In diesem Abschnitt {#in-this-section}

| Methode | Wann verwenden |
|---|---|
| [Online-Konfigurator](/admin-guide/configuration/online) | Sie möchten ein Formular, das Konfiguration und Startbefehle für eine Binär- oder Docker-Installation erzeugt. |
| [Konfigurationsdatei](/admin-guide/configuration/config-file) | Sie möchten die Servereinstellungen in einer Datei `config.json` speichern. |
| [Umgebungsvariablen](/admin-guide/configuration/env-vars) | Sie verwalten Einstellungen über Docker, eine Dienstdefinition oder Bereitstellungswerkzeuge. |

## Konfigurationsoptionen {#configuration-options}

Eine Umgebungsvariable überschreibt den entsprechenden Wert in der Datei. Der Standardwert gilt, wenn beides nicht gesetzt ist. Zeigt eine Dateiänderung keine Wirkung, prüfen Sie die Umgebung des Semaphore-Prozesses.

Die [Referenz der Konfigurationsoptionen](/reference/configuration) enthält Namen, Umgebungsvariablen, Typen und Standardwerte. Sie wird aus dem Semaphore-Quellcode erzeugt; verwenden Sie für ältere Server die Dokumentation der jeweiligen Version.

<span id="frequently-asked-questions" />

## Öffentliche URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

Setzen Sie `web_host` (oder `SEMAPHORE_WEB_ROOT`) auf die Adresse, die Benutzer im Browser öffnen. Stellt ein Reverse Proxy Semaphore unter `https://example.com/semaphore` bereit, verwenden Sie die vollständige Adresse einschließlich `/semaphore`. Gemeint ist die öffentliche Adresse, nicht die interne Verbindung des Proxys.

## Wo anfangen {#where-to-start}

Öffnen Sie für einen neuen Server die Anleitung zum Online-Konfigurator und folgen Sie den Schritten für Binärdateien oder Docker. Ändern Sie bei einem bestehenden Server die Datei oder Umgebungsvariablen seines Dienstes und starten Sie Semaphore neu.
