# Statistiken

Der Tab **Stats** im Projekt-Dashboard zeigt, wie Tasks im Projekt im Laufe der Zeit abgeschlossen wurden.

![Projektstatistiken](/assets/project-stats.webp)

Das Diagramm **Task Status** zählt die Tasks pro Tag nach ihrem Endstatus:

- **Success**: Der Task wurde ohne Fehler abgeschlossen.
- **Failed**: Der Task endete mit einem Fehler.
- **Stopped**: Der Task wurde von einem Benutzer gestoppt.

Zwei Filter über dem Diagramm schränken die Daten ein:

| Filter | Optionen |
|---|---|
| **Period** | Letzte Woche, Letzter Monat, Letztes Jahr |
| **User** | Alle Benutzer oder ein einzelnes Mitglied des Projekts. Tasks, die durch Schedules und Integrationen gestartet wurden, haben keinen Benutzer und sind nur in **Alle Benutzer** enthalten. |

Dasselbe Diagramm ist für ein einzelnes Task Template auf dem Tab **Details** der [Task-Template-Seite](../task-templates#template-page) verfügbar.

Um einzelne Ausführungen anstelle aggregierter Zahlen zu sehen, verwenden Sie den Tab [History](./history).
