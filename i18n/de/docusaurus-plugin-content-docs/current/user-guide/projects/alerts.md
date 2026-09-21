---
title: Benachrichtigungen
description: Der Tab „Benachrichtigungen“ eines Projekts, in dem Serverkanäle eingeschaltet und benannte Projektbenachrichtigungen angelegt, getestet und an Vorlagen und Zeitpläne gebunden werden.
---

# Benachrichtigungen

Der Tab **Benachrichtigungen** eines Projekts legt fest, wohin Aufgabenergebnisse gemeldet werden. Er besteht aus zwei Teilen:

- **Serverkanäle** sind die Benachrichtigungsanbieter, die ein Administrator auf dem Server in `config.json` konfiguriert hat, siehe [Benachrichtigungen](/admin-guide/notifications). Sie stehen allen Projekten zur Verfügung, und jedes Projekt entscheidet, ob es sie nutzt.
- **Projektbenachrichtigungen** sind benannte Ziele, die zum Projekt gehören: ein Telegram-Chat, ein Slack-Webhook, eine Liste von E-Mail-Adressen und so weiter. Vorlagen und Zeitpläne wählen aus, welche Benachrichtigungen sie senden.

Beide Teile können gleichzeitig verwendet werden.

## Serverkanäle {#server-channels}

Die Karte oben auf der Seite listet die auf dem Server konfigurierten Kanäle. Schalten Sie **Benachrichtigungen dieses Projekts an Serverkanäle senden** ein, um jedes Aufgabenergebnis dieses Projekts darüber zu erhalten. Das ist derselbe Schalter, der in älteren Versionen in den Projekteinstellungen **Allow alerts for this project** hieß.

Wenn Telegram auf dem Server konfiguriert ist, leitet **Telegram Chat ID** die Nachrichten dieses Projekts in einen anderen Chat als den serverweiten.

Serverkanäle melden jeden relevanten Status: Erfolg, Fehler und *Warten auf Bestätigung*. E-Mail meldet nur Fehler. Eine Vorlage kann Erfolgs- oder Fehlerbenachrichtigungen weiterhin unterdrücken, siehe [Vorlagenbenachrichtigungen](#template-alerts).

## Projektbenachrichtigungen {#project-alerts}

Klicken Sie auf **Neue Benachrichtigung**, um ein Ziel anzulegen. Jede Benachrichtigung hat:

| Feld | Beschreibung |
|---|---|
| **Name** | Wird in Vorlagen- und Zeitplanformularen angezeigt. Innerhalb des Projekts eindeutig. |
| **Typ** | Der Kanal: Telegram, Slack, E-Mail, Microsoft Teams, Rocket.Chat, DingTalk oder Gotify. Das Formular zeigt die Zielfelder, die der Kanal benötigt. |
| **Ziel** | Chat-ID und optionales Forumsthema für Telegram; Webhook-URL für Slack, Teams, Rocket.Chat und DingTalk; Server-URL für Gotify; Empfänger für E-Mail (leer lassen, um Projektmitglieder zu benachrichtigen, die Benachrichtigungen in ihrem Profil aktiviert haben). |
| **Geheimnis** | Telegram, Gotify und E-Mail benötigen ein Geheimnis: das Bot-Token, das Anwendungstoken, die SMTP-Zugangsdaten. *Servereinstellungen verwenden* nimmt es aus der Serverkonfiguration; *Eigenes verwenden* nimmt es aus einem Zugriffsschlüssel des Schlüsselspeichers (Typ *Geheimes Token* für Token, *Anmeldung mit Passwort* für SMTP). Eine E-Mail-Benachrichtigung mit eigenen Zugangsdaten kann zusätzlich eigenen SMTP-Host, Port, Absender und Verschlüsselung setzen. |
| **Senden bei** | Auf welche Ereignisse die Benachrichtigung reagiert: Erfolg, Fehler, Warten auf Bestätigung. Neue Benachrichtigungen beginnen mit den Kanalvorgaben. |
| **Projektstandard** | Markiert die Benachrichtigung als eine der Projektvorgaben. Jede Vorlage, die Projektvorgaben verwendet, sendet sie. |
| **Aktiviert** | Eine deaktivierte Benachrichtigung wird nie gesendet und ist keine Projektvorgabe. |
| **Nachrichtenvorlage** | Optionale Go-Vorlage für den Nachrichtentext. Belassen Sie den eingebauten Text, um künftige Serveraktualisierungen zu übernehmen. |

Geheimnisse werden nie auf der Benachrichtigung gespeichert: Sie liegen verschlüsselt im Schlüsselspeicher, und der Schlüssel kann nicht gelöscht werden, solange eine Benachrichtigung ihn verwendet. Hat der Server kein Bot-Token, keinen SMTP-Server oder kein Gotify-Paar konfiguriert, bietet das Formular nur *Eigenes verwenden* an. Webhook-URLs müssen `http` oder `https` verwenden und dürfen nicht auf den Server selbst zeigen.

Verwenden Sie **Testnachricht senden** in der Liste, um eine Benachrichtigung zu prüfen, und **Alle testen** in der Werkzeugleiste, um einen Test an jedes aktivierte Ziel des Projekts zu senden, Serverkanäle eingeschlossen.

Eine Benachrichtigung, die an eine Vorlage oder einen Zeitplan gebunden ist, kann nicht gelöscht werden. Der Dialog listet die Objekte, die sie verwenden.

### Nachrichtenvorlagen {#message-templates}

Der Text ist eine Go-`text/template` (`html/template` für E-Mail). Verfügbare Felder:

| Feld | Wert |
|---|---|
| `.Name` | Vorlagenname |
| `.Author` | Name des Benutzers, der die Aufgabe gestartet hat, oder `—` |
| `.Project.Name`, `.Project.ID` | Das Projekt |
| `.Playbook` | Playbook oder Skript der Vorlage |
| `.ScheduleName` | Name des Zeitplans, der die Aufgabe gestartet hat, falls vorhanden |
| `.Task.ID`, `.Task.URL` | Aufgabennummer und Link zum Protokoll |
| `.Task.Result` | Status mit Symbol, zum Beispiel `✅ SUCCESS` |
| `.Task.Desc` | Beim Start der Aufgabe eingegebene Nachricht |
| `.Task.Version` | Build-Version bzw. die eingehende Build-Version bei Deploy-Aufgaben |
| `.Task.Duration` | Laufzeit, leer bis die Aufgabe gestartet ist |
| `.Task.Trigger` | `manual`, `schedule`, `integration` oder `api` |
| `.Color` | Anhangsfarbe für Slack und Rocket.Chat |

Bei Chat-Kanälen muss der gerenderte Text das JSON-Dokument sein, das der Messenger erwartet; die eingebaute Vorlage ist ein guter Ausgangspunkt. Telegram-Texte sind reiner Text mit HTML-Formatierung, Chat und Thema fügt Semaphore hinzu.

## Vorlagenbenachrichtigungen {#template-alerts}

Im Abschnitt **Erweitert** einer Aufgabenvorlage wählt **Benachrichtigungen** zwischen:

- **Projektvorgaben verwenden** — Serverkanäle, sofern sie für das Projekt eingeschaltet sind, plus die als Projektstandard markierten Benachrichtigungen. Bestehende Vorlagen behalten dieses Verhalten nach einem Upgrade.
- **Eigene Auswahl an Benachrichtigungen verwenden** — nur die ausgewählten Benachrichtigungen. Eine leere Auswahl bedeutet, dass die Vorlage nichts sendet.

**Erfolgsbenachrichtigungen unterdrücken** und **Fehlerbenachrichtigungen unterdrücken** gelten für beide Optionen. Benachrichtigungen über eine Aufgabe, die auf Bestätigung wartet, werden nie unterdrückt.

## Zeitplanbenachrichtigungen {#schedule-alerts}

Ein Zeitplan kann **die Benachrichtigungen der Vorlage verwenden** oder **eine andere Auswahl an Benachrichtigungen verwenden**. Die zweite Option ersetzt die Vorlagenauswahl für Aufgaben dieses Zeitplans vollständig, sodass ein nächtlicher Job an einen Bereitschaftskanal melden kann, während manuelle Läufe still bleiben.

## Wie eine Aufgabe zugestellt wird {#how-a-task-is-routed}

Die Ziele einer Aufgabe werden beim Anlegen der Aufgabe festgelegt. Wird eine Benachrichtigung, eine Vorlage oder ein Zeitplan während der Ausführung geändert, ändert sich nicht, wohin diese Aufgabe meldet. Jede Zustellung wird pro Aufgabe, Ziel und Ereignis aufgezeichnet, sodass in einer Hochverfügbarkeitsumgebung nur ein Serverknoten jede Nachricht sendet.

## Sicherungen {#backups}

Projektbenachrichtigungen sind Teil der [Projektsicherung](./settings#danger-zone). Vorlagen und Zeitpläne verweisen per Name auf sie, daher behält ein wiederhergestelltes Projekt seine Bindungen. Benachrichtigungen verweisen per Name auf ihren Zugriffsschlüssel; wie bei jedem Schlüssel wird der Geheimniswert selbst nicht exportiert.
