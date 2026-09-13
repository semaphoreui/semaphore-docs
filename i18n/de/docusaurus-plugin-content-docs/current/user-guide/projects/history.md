# Verlauf

Der Tab **History** im Projekt-Dashboard listet alle Tasks des Projekts auf, die neuesten zuerst. Es ist die Standardansicht, wenn Sie ein Projekt öffnen.

![Projektverlauf](/assets/project-dashboard-history.webp)

## Spalten {#columns}

| Spalte | Inhalt |
|---|---|
| **Task** | Nummer des Tasks, das Task Template, aus dem er erstellt wurde, und die Commit-Nachricht der verwendeten Repository-Revision. Ein Symbol links zeigt die Anwendung (Ansible, Terraform, Bash und so weiter). |
| **Version** | Bei [Build- und Deploy-Task-Templates](../task-templates/build-deploy): die gebaute oder bereitgestellte Version. Bei anderen Task Templates nur ein Statussymbol. |
| **Status** | Aktuelles Status-Badge, siehe [Task-Status](../tasks#task-statuses). |
| **User** | Wer den Task gestartet hat. Tasks, die von einem Schedule oder einer Integration gestartet wurden, haben keinen Benutzer. |
| **Start** | Startdatum und -zeit in der Zeitzone Ihres Browsers. |
| **Duration** | Wie lange der Task gelaufen ist. |

Die Liste ist auf Seiten aufgeteilt. Klicken Sie auf die Task-Nummer oder den Namen des Task Template, um das [Task-Fenster](../tasks#task-window) mit dem Protokoll, den Details und der Zusammenfassung zu öffnen. Klicken Sie im Kopfbereich des Task-Fensters auf den Namen des Task Template, um zur Task-Template-Seite zu gelangen.

## Aufbewahrung von Tasks {#task-retention}

Standardmäßig werden alle Tasks und ihre Protokolle dauerhaft aufbewahrt. Um den Verlauf pro Task Template zu begrenzen, setzen Sie `max_tasks_per_template` in der `config.json` oder die Umgebungsvariable `SEMAPHORE_MAX_TASKS_PER_TEMPLATE`:

```json
{
  "max_tasks_per_template": 30
}
```

Wenn das Limit erreicht ist, werden die ältesten Tasks dieses Task Template zusammen mit ihren Protokollen gelöscht. Die vollständige Liste der Optionen finden Sie unter [Konfiguration](/admin-guide/configuration).

## Siehe auch {#see-also}

- [Stats](./stats): aggregierte Task-Ergebnisse pro Tag.
- [Activity](./activity): Audit-Protokoll der Änderungen im Projekt.
