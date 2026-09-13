# Workflows (Pro)

Mit Workflows können Sie mehrere Task Templates zu einem gerichteten Graphen (DAG)
mit Verzweigungen, Freigaben und zeitgesteuerten Pausen verketten. Ein Workflow-Durchlauf
läuft automatisch weiter, sobald ein Schritt abgeschlossen ist — Sie entwerfen den Graphen
einmal im visuellen Editor und starten Durchläufe dann über die Seite Workflows.

:::info
Workflows sind eine Funktion von **Semaphore Pro**. Der Menüpunkt Workflows erscheint nur,
wenn Ihr Abonnement sie umfasst.
:::

## Überblick {#overview}

Ein Workflow besteht aus:

- **Nodes** — Schritte im Graphen (ein Task Template ausführen, auf eine Freigabe warten,
  für eine Verzögerung pausieren oder mit einer Notiz versehen).
- **Edges** — Verbindungen zwischen Nodes, jede mit einer **Bedingung** versehen, die
  festlegt, wann der nachfolgende Node startet.

Wenn Sie einen Workflow starten, erstellt Semaphore einen **Workflow-Durchlauf**. Der Server
steuert den Fortschritt: sobald Tasks abgeschlossen sind, Freigaben erteilt wurden oder
Verzögerungen ablaufen, werden die nachfolgenden Nodes entsprechend den Bedingungen der Edges gestartet.

## Einen Workflow erstellen {#creating-a-workflow}

1. Öffnen Sie Ihr Projekt und gehen Sie zu **Workflows**.
2. Klicken Sie auf **New Workflow**.
3. Im grafischen Editor:
   - Ziehen Sie Nodes aus der Palette auf die Arbeitsfläche.
   - Verbinden Sie Nodes, indem Sie vom Ausgangspunkt eines Nodes zu einem anderen ziehen.
   - Klicken Sie auf einen Node oder eine Edge, um die Eigenschaften im Seitenbereich zu bearbeiten.
4. Legen Sie einen **Namen** fest (und optional eine **Startversion** für die Versionierung der Durchläufe).
5. Beheben Sie alle im Bereich **Problems** aufgeführten Probleme und klicken Sie dann auf **Save**.

![Workflow-Editor](/assets/workflow-editor.webp)

Der Editor validiert den Graphen vor dem Speichern. Ein gültiger Workflow muss mindestens
einen Node haben, genau einen Start-Node (ohne eingehende Edges), keine Zyklen und eine
vollständige Konfiguration auf jedem ausführbaren Node.

## Arten von Nodes {#node-kinds}

| Art | Zweck |
|------|---------|
| **Task** | Führt ein Task Template aus. Sie können die Parameter des Task Template (Inventory, Environment, Ansible-Limit, zusätzliche CLI-Argumente) pro Node über **task params** überschreiben. |
| **Approval** | Hält den Durchlauf an, bis ein Benutzer mit entsprechender Berechtigung freigibt oder ablehnt. Optional können Sie ein Timeout (in Sekunden) und eine Freigabemeldung festlegen. |
| **Delay** | Wartet eine konfigurierte Anzahl von Sekunden, bevor es mit den nachfolgenden Nodes weitergeht. Nützlich für Abkühlphasen, Wartungsfenster oder um abhängige Schritte zeitlich zu entzerren. |
| **Note** | Freie Anmerkung auf der Arbeitsfläche. Note-Nodes werden nicht ausgeführt und nicht über Edges verbunden — sie dienen ausschließlich der Dokumentation. |

### Zusammenführung {#convergence}

Nodes mit mehreren eingehenden Edges können verlangen, dass **alle** vorgelagerten Nodes
abgeschlossen sind (Standard) oder nur **einer** von ihnen. Legen Sie **Convergence** im
Eigenschaftsbereich des Nodes fest.

### Delay-Nodes {#delay-nodes}

Ein Delay-Node hält den Workflow-Durchlauf für die konfigurierte Dauer an (mindestens 1
Sekunde). Während des Wartens:

- Der Durchlauf bleibt im Status **running**.
- Die Durchlaufansicht zeigt einen laufenden Countdown auf dem Delay-Node.
- Über Edges verbundene nachfolgende Nodes werden erst gestartet, wenn die Verzögerung abgelaufen ist.

Wird der Workflow-Durchlauf während einer aktiven Verzögerung **gestoppt**, wird die
Verzögerung abgebrochen und der Durchlauf endet im Status **stopped**.

### Approval-Nodes {#approval-nodes}

Wenn der Durchlauf einen Approval-Node erreicht, wechselt der Status zu **approval**, bis
jemand freigibt oder ablehnt. In der Durchlaufansicht erscheinen die Schaltflächen zum
Freigeben und Ablehnen. Abgelehnte Freigaben lassen den Durchlauf entsprechend den
Bedingungen der verbundenen Edges fehlschlagen.

## Bedingungen von Edges {#edge-conditions}

Jede Edge hat eine Bedingung, die festlegt, wann der nachfolgende Node bereit wird:

| Bedingung | Der nachfolgende Node startet, wenn der vorgelagerte Node… |
|-----------|-------------------------------------------|
| **On success** | Erfolgreich abschließt (Standard). |
| **On failure** | Mit einem Fehler abschließt. |
| **Always** | In einem beliebigen Endzustand abschließt (Erfolg oder Fehler). |

Verwenden Sie **On failure**-Zweige für ausgleichende Aktionen oder Benachrichtigungen.
Verwenden Sie **Always**, wenn der nächste Schritt unabhängig vom Ergebnis laufen soll.

## Ausführen und überwachen {#running-and-monitoring}

- **Run workflow** — startet einen neuen Durchlauf aus der Liste der Workflows.
- **Durchlaufansicht** — Vollbildgraph mit Live-Status auf jedem Node (running, success,
  failed, approval, Countdown der Verzögerung).
- **Stop** — solange ein Durchlauf `running` oder `approval` ist, können Benutzer mit
  `run_project_tasks` ihn stoppen. Alle aktiven Tasks werden gestoppt, ausstehende
  Freigaben werden abgelehnt und der Durchlauf wird als **stopped** markiert.

Status von Durchläufen: `running`, `approval`, `success`, `failed`, `stopped`.

## Versionierung von Durchläufen {#run-versioning}

Legen Sie **Start version** für den Workflow fest (zum Beispiel `1.0.0`), um
Versionsbezeichnungen für jeden Durchlauf zu aktivieren. Semaphore erhöht die Version bei
jedem weiteren Durchlauf, ähnlich wie bei Build-Task-Templates.

## Workflow-Artefakte (set_stats) {#workflow-artifacts-set_stats}

Wenn ein Ansible-Task in einem Workflow `set_stats` verwendet, werden die Variablen als
**Workflow-Artefakte** für diesen Durchlauf gespeichert. Nachfolgende Task-Nodes im selben
Durchlauf erhalten sie automatisch als zusätzliche Variablen.

:::warning
Wenn Schritte des Workflows auf **Remote-Runnern** laufen, werden Workflow-Artefakte noch
nicht über Schritte auf Remote-Runnern hinweg weitergegeben — sie werden nur zwischen Tasks
übergeben, die lokal auf dem Semaphore-Server ausgeführt werden. Planen Sie die Übergabe von
Artefakten entsprechend oder halten Sie artefakterzeugende und artefaktverbrauchende Schritte
auf demselben Ausführungspfad.
:::

## Berechtigungen {#permissions}

- Das Verwalten von Workflows (erstellen, bearbeiten, löschen) erfordert Berechtigungen zur
  Verwaltung von Projektressourcen.
- Das Ausführen von Workflows erfordert `run_project_tasks`.
- Das Erteilen von Freigaben erfordert entsprechenden Projektzugriff (dieselben Benutzer, die
  Tasks im Projekt ausführen können).

## API {#api}

Workflow-Templates und -Durchläufe sind unter
`/api/project/{project_id}/workflows` verfügbar. Die Schemas für Anfragen und Antworten
finden Sie in der [API-Dokumentation](/reference/api), einschließlich der Felder von
`delay`-Nodes (`delay_seconds`) und des Stop-Endpunkts
(`POST …/runs/{run_id}/stop`).
