# Einstellungen

Der Tab **Settings** im Projekt-Dashboard steht den **Owners** des Projekts zur Verfügung. Er enthält die allgemeinen Projektoptionen und die destruktiven Aktionen.

![Projekteinstellungen](/assets/project-settings-general.webp)

## Allgemein {#general}

| Feld | Beschreibung |
|---|---|
| **Project Name** | Anzeigename, der im Projektwechsler und in Benachrichtigungen angezeigt wird. |
| **Max number of parallel tasks** | Optional. Maximale Anzahl von Tasks dieses Projekts, die gleichzeitig laufen dürfen. Lassen Sie das Feld leer, um kein Limit zu setzen. Tasks über dem Limit bleiben mit dem Status `waiting` in der Warteschlange, bis ein Platz frei wird. |
| **Telegram Chat ID** | Optional. Sendet Benachrichtigungen für dieses Projekt an einen anderen Telegram-Chat als den global konfigurierten. Siehe [Telegram-Benachrichtigungen](/admin-guide/notifications/telegram#per-project-chat-ids). |
| **Allow alerts for this project** | Hauptschalter für Benachrichtigungen. Ist er aus, sendet kein Kanal Benachrichtigungen über Tasks dieses Projekts, selbst wenn der Kanal auf dem Server konfiguriert ist. |

**Test alerts** sendet eine Testnachricht über jeden konfigurierten [Benachrichtigungskanal](/admin-guide/notifications), sodass Sie die Serverkonfiguration überprüfen können, ohne einen Task auszuführen. **Save** übernimmt die Änderungen.

## Danger Zone {#danger-zone}

| Aktion | Wirkung |
|---|---|
| **Backup project** | Lädt eine JSON-Datei mit der Projektdefinition herunter: Task Templates, Inventories, Variable Groups, Schlüssel (ohne geheime Werte), Repositories, Schedules, Ansichten und Integrationen. Stellen Sie sie über **New Project → Restore project** oder mit [`semaphore projects import`](/reference/cli/projects) wieder her. |
| **Clear cache** | Löscht alle zwischengespeicherten Dateien des Projekts auf dem Server, zum Beispiel geklonte Repositories. Der nächste Task klont die Repositories erneut. Die Aktion ist nicht umkehrbar. |
| **Delete project** | Löscht das Projekt mit allen Ressourcen und dem Task-Verlauf. Es gibt kein Zurück. |

## Verwandte Einstellungen {#related-settings}

- Mitglieder und Rollen: [Teams](../team)
- Dem Projekt zugeordnete Runner und Runner-Tags: [Projekt-Runner](./runners)
- Benachrichtigungskanäle werden auf dem Server konfiguriert: [Benachrichtigungen](/admin-guide/notifications)
