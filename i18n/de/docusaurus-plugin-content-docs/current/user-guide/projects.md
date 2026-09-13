# Projekte

Ein Projekt ist die wichtigste Einheit zur Trennung in Semaphore UI. Jede Ressource, mit der Sie arbeiten, gehört genau zu einem Projekt: Task Templates, Tasks, Inventories, Variable Groups, Schlüssel, Repositories, Integrationen, Schedules, Runner und Teammitglieder.

Projekte sind voneinander unabhängig, sodass Sie mit ihnen nicht zusammenhängende Systeme innerhalb einer einzigen Semaphore-Installation organisieren können: verschiedene Teams, Infrastrukturen, Umgebungen oder Anwendungen.

## Navigation im Projekt {#project-navigation}

Nachdem Sie ein Projekt geöffnet haben, zeigt die linke Seitenleiste oben den Projektwechsler und darunter alle Projektbereiche. Unter dem Projektnamen sehen Sie Ihre Rolle in diesem Projekt (zum Beispiel `task_runner`). Die Rolle legt fest, welche Bereiche Sie ändern können; siehe [Teams](./team).

![Projekt-Dashboard mit dem Tab History](/assets/project-dashboard-history.webp)

| Bereich | Inhalt |
|---|---|
| **Dashboard** | Die Tabs [History](./projects/history), [Stats](./projects/stats), [Activity](./projects/activity) und, für Projekteigentümer, [Settings](./projects/settings) |
| **Task Templates** | Definitionen, was und wie ausgeführt wird: [Task Templates](./task-templates) |
| **Workflows** (Pro) | Graphen aus Task Templates mit Freigaben und Verzweigungen: [Workflows](./workflows) |
| **Schedule** | Cron-ähnliche Zeitpläne für Task Templates: [Schedules](./schedules) |
| **Inventory** | Hosts und Verbindungseinstellungen für Ansible, Workspaces für Terraform: [Inventory](./inventory) |
| **Variable Groups** | Wiederverwendbare Variablen und Secrets, die in Tasks eingefügt werden: [Variable Groups](./environment) |
| **Key Store** | Verschlüsselte Zugangsdaten und externe Secret-Speicher: [Key Store](./key-store) |
| **Repositories** | Git-Repositories oder lokale Pfade mit Ihren Playbooks und Skripten: [Repositories](./repositories) |
| **Integrations** | Eingehende Webhooks, die Tasks starten: [Integrationen](./integrations) |
| **Team** | Mitglieder und ihre Rollen: [Teams](./team) |
| **Runners** (Pro) | Runner, die diesem Projekt zugeordnet sind: [Projekt-Runner](./projects/runners) |

Am unteren Ende der Seitenleiste befinden sich der Schalter für den Dunkelmodus, die Sprachauswahl und Ihr [Kontomenü](./account).

## Ein Projekt erstellen {#creating-a-project}

Das Erstellen von Projekten steht Administratoren zur Verfügung. Normale Benutzer können Projekte nur erstellen, wenn die Serveroption `non_admin_can_create_project` (`SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT`) aktiviert ist, siehe [Konfiguration](/admin-guide/configuration).

1. Klicken Sie oben in der Seitenleiste auf den Projektnamen und wählen Sie **New Project**.
2. Füllen Sie das Formular aus:

| Feld | Beschreibung |
|---|---|
| **Project Name** | Anzeigename des Projekts. Sie können ihn später in den [Einstellungen](./projects/settings) ändern. |
| **Max number of parallel tasks** | Optional. Wie viele Tasks dieses Projekts gleichzeitig laufen dürfen. Lassen Sie das Feld leer, um kein Limit zu setzen. Tasks über dem Limit warten mit dem Status `waiting` in der Warteschlange. |
| **Demo** | Füllt das neue Projekt mit Beispieldaten: einem öffentlichen Demo-Repository, einem Inventory, einem Schlüssel und mehreren Task Templates. Verwenden Sie es, um Semaphore ohne Konfigurationsaufwand auszuprobieren. |

3. Klicken Sie auf **Create**.

Der Benutzer, der ein Projekt erstellt, wird dessen **Owner**.

## Zwischen Projekten wechseln {#switching-between-projects}

Klicken Sie oben in der Seitenleiste auf den Projektnamen, um alle Projekte zu sehen, in denen Sie Mitglied sind, und zwischen ihnen zu wechseln. Das zuletzt geöffnete Projekt wird in Ihrem Browser gespeichert.

## Sicherung und Wiederherstellung {#backup-and-restore}

Ein Projekt kann in eine JSON-Datei exportiert und in dieselbe oder eine andere Semaphore-Instanz importiert werden:

- **Export**: Öffnen Sie **Dashboard → Settings** und klicken Sie auf **Backup project** (siehe [Einstellungen](./projects/settings)).
- **Import**: Klicken Sie in der Seitenleiste auf den Projektnamen, wählen Sie **Restore project** und laden Sie die Sicherungsdatei hoch.

Beide Vorgänge sind auch über die Befehlszeile verfügbar, siehe [CLI: Projects](/admin-guide/cli/projects).
