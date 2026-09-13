---
title: Benachrichtigungen
description: Wie Semaphore Task-Alerts zustellt, welche Kanäle es unterstützt und welche zwei Schalter aktiv sein müssen, damit überhaupt etwas gesendet wird.
---

# Benachrichtigungen

Semaphore meldet Task-Ergebnisse an Chat und E-Mail. Ein Kanal wird einmal auf dem
Server konfiguriert, in `config.json` oder über Umgebungsvariablen, und gilt dann
für jedes Projekt. Welche Tasks einen Alert erzeugen, wird pro Projekt und pro
Task Template in der Weboberfläche entschieden.

## Wie die Zustellung funktioniert {#how-delivery-works}

Drei Einstellungen entscheiden darüber, ob eine Nachricht gesendet wird, und alle
drei müssen es erlauben:

1. **Der Kanal ist auf dem Server konfiguriert.** Jeder Anbieter hat eigene
   Schlüssel in `config.json`. Siehe die Seite des jeweiligen Anbieters weiter unten.
2. **Das Projekt erlaubt Alerts.** *Allow alerts for this project* in den
   [Projekteinstellungen](/user-guide/projects/settings) ist der Hauptschalter. Ist
   er aus, sendet kein Kanal etwas zu diesem Projekt.
3. **Das Task Template fordert sie an.** Ein Task Template legt fest, ob bei Erfolg,
   bei Fehler oder gar nicht benachrichtigt wird, siehe [Task Templates](/user-guide/task-templates).

Mit **Test alerts** in den Projekteinstellungen senden Sie eine Testnachricht über
jeden konfigurierten Kanal, ohne einen Task auszuführen.

## Kanäle {#channels}

| Kanal | Seite |
|---|---|
| E-Mail (SMTP) | [E-Mail](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Mehrere Kanäle können gleichzeitig aktiv sein; jeder von ihnen erhält jeden Alert,
der die drei obigen Prüfungen besteht.

## Projektspezifische Abweichungen {#per-project-overrides}

Telegram unterstützt einen projektspezifischen Chat: Setzen Sie
**Telegram Chat ID** in den [Projekteinstellungen](/user-guide/projects/settings),
um die Alerts eines Projekts an einen anderen Chat zu leiten als den serverweiten.
Die übrigen Kanäle verwenden für alle Projekte die Serverkonfiguration.

## Womit Sie beginnen {#where-to-start}

Konfigurieren Sie zuerst einen Kanal, schalten Sie *Allow alerts for this project*
ein und drücken Sie **Test alerts**. Sobald eine Testnachricht ankommt, aktivieren
Sie Alerts für die Task Templates, auf die es ankommt.
