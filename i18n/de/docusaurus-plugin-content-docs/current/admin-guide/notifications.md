---
title: Benachrichtigungen
description: Wie Semaphore Aufgabenbenachrichtigungen zustellt, welche Kanäle es unterstützt und wie serverweite Kanäle mit projektbezogenen Benachrichtigungen zusammenhängen.
---

# Benachrichtigungen

Semaphore meldet Aufgabenergebnisse auf zwei Wegen an Chats und per E-Mail:

- **Serverkanäle** werden einmal auf dem Server konfiguriert, in `config.json` oder über
  Umgebungsvariablen, und stehen jedem Projekt zur Verfügung. Diese Seite beschreibt sie.
- **Projektbenachrichtigungen** sind benannte Ziele, die Projektmitglieder im Tab
  [Benachrichtigungen](/user-guide/alerts) des Projekts anlegen, mit eigenem Chat,
  Webhook oder Empfängern, und an Vorlagen und Zeitpläne binden.

## So funktioniert die Zustellung {#how-delivery-works}

Bei einem Serverkanal entscheiden drei Einstellungen, ob eine Nachricht gesendet wird, und
alle drei müssen es erlauben:

1. **Der Kanal ist auf dem Server konfiguriert.** Jeder Anbieter hat eigene Schlüssel in
   `config.json`. Siehe die Seite des jeweiligen Anbieters unten.
2. **Das Projekt nutzt Serverkanäle.** *Benachrichtigungen dieses Projekts an Serverkanäle
   senden* im Tab [Benachrichtigungen](/user-guide/alerts#server-channels) des
   Projekts ist der Hauptschalter. Ist er aus, senden Serverkanäle nichts über dieses
   Projekt. Projektbenachrichtigungen sind von diesem Schalter nicht betroffen.
3. **Die Vorlage verlangt es.** Eine Vorlage mit *Projektvorgaben* sendet an Serverkanäle;
   eine Vorlage mit eigener Benachrichtigungsliste nicht. Vorlagen können außerdem Erfolgs-
   oder Fehlerbenachrichtigungen unterdrücken, siehe
   [Aufgabenvorlagen](/user-guide/task-templates).

Chat-Kanäle melden Erfolg, Fehler und Aufgaben, die auf Bestätigung warten; E-Mail meldet
nur Fehler. Projektbenachrichtigungen können die Ereignisse je Ziel überschreiben.

Verwenden Sie **Alle testen** im Tab Benachrichtigungen, um eine Testnachricht über jeden
Serverkanal und jede aktivierte Projektbenachrichtigung zu senden, ohne eine Aufgabe zu
starten.

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

Mehrere Kanäle können gleichzeitig aktiviert sein; jeder erhält jede Benachrichtigung, die
die drei Prüfungen oben besteht. Dieselben Anbieter stehen für Projektbenachrichtigungen zur
Verfügung; E-Mail- und Telegram-Projektbenachrichtigungen verwenden den SMTP-Server und das
Bot-Token aus der Serverkonfiguration, und eine Gotify-Projektbenachrichtigung ohne eigene
URL und Token verwendet das serverweite Paar.

## Projektbezogene Überschreibungen {#per-project-overrides}

Telegram unterstützt einen Chat pro Projekt: Setzen Sie **Telegram Chat ID** im Tab
[Benachrichtigungen](/user-guide/alerts#server-channels) des Projekts, um die
Serverkanal-Nachrichten eines Projekts in einen anderen Chat als den serverweiten zu leiten.
Für jedes andere projektbezogene Ziel legen Sie eine
[Projektbenachrichtigung](/user-guide/alerts#project-alerts) an.

## Wo anfangen {#where-to-start}

Konfigurieren Sie zuerst einen Kanal, öffnen Sie den Tab Benachrichtigungen des Projekts,
schalten Sie *Benachrichtigungen dieses Projekts an Serverkanäle senden* ein und klicken Sie
auf **Alle testen**. Sobald eine Testnachricht ankommt, passen Sie die relevanten Vorlagen an.
