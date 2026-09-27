---
title: "Workflows"
sidebar_custom_props:
  edition: pro
---

# Workflows <Pro />

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
3. Fügen Sie den ersten Node hinzu: Klicken Sie in der **Palette** auf eine Art, ziehen Sie
   sie auf die Arbeitsfläche oder verwenden Sie die Schaltfläche **+** in der oberen rechten
   Ecke der Arbeitsfläche.
4. Zeigen Sie mit der Maus auf einen Node und klicken Sie auf den **+**-Griff an seinem
   Ausgangsport, um den nächsten Schritt hinzuzufügen. Der neue Node wird rechts platziert
   und mit einer **On success**-Edge verbunden. Sie können Nodes auch verbinden, indem Sie
   von einem Ausgangsport zu einem Eingangsport ziehen.
5. Klicken Sie auf einen Node, um ihn im **Eigenschaftsbereich** rechts zu bearbeiten:
   Art des Nodes, Task Template und Task-Parameter, Timeout und Meldung der Freigabe,
   Dauer der Verzögerung, Zusammenführung.
6. Klicken Sie auf die **Bedingungs-Pille** in der Mitte einer Edge, um deren Bedingung zu
   ändern, oder zeigen Sie darauf und klicken Sie auf **×**, um die Edge zu entfernen.
7. Legen Sie einen **Namen** fest (und optional eine **Startversion** für die Versionierung
   der Durchläufe).
8. Beheben Sie die im Chip **Problems** in der Symbolleiste aufgeführten Probleme und
   klicken Sie dann auf **Save**.

![Workflow-Editor](/assets/workflow-editor.webp)

Der Editor validiert den Graphen während der Arbeit. Nodes mit einem Problem zeigen ein
Warnsymbol, und der Chip in der Symbolleiste listet jedes Problem auf; klicken Sie auf eines,
um den Node auszuwählen. Ein gültiger Workflow muss mindestens einen Node haben, genau einen
Start-Node (ohne eingehende Edges), keine Zyklen und eine vollständige Konfiguration auf jedem
ausführbaren Node. **Save** bleibt deaktiviert, bis der Graph gültig ist.

![Menü zum schnellen Hinzufügen](/assets/workflow-editor-quick-add.webp)

### Editor-Steuerung {#editor-controls}

<div class="BlockSchema">
    <img src="/docs/assets/workflow-hotkeys.svg" alt="Tastenkürzel des Workflow-Editors" />
</div>

Die Arbeitsfläche lässt sich mit der Maus, einem Trackpad, den Schaltflächen in
der unteren linken Ecke oder der Tastatur verschieben und zoomen. Tastenkürzel
funktionieren, solange die Arbeitsfläche den Fokus hat: Klicken Sie zuerst auf eine
leere Stelle der Arbeitsfläche oder drücken Sie <kbd>Tab</kbd>, bis die Arbeitsfläche
fokussiert ist. Mit <kbd>Tab</kbd> wechseln Sie anschließend zwischen den Nodes;
<kbd>Enter</kbd> auf einem Node wählt ihn aus und öffnet seinen Eigenschaftsbereich (in der
Durchlaufansicht wird das Task-Protokoll geöffnet). Dieselbe Navigation funktioniert auch
in der Durchlaufansicht.

| Aktion | Maus | Trackpad | Schaltflächen | Tastatur |
|--------|------|----------|---------------|----------|
| Verschieben (Arbeitsfläche bewegen) | Leere Stelle ziehen oder mit dem Mausrad scrollen (vertikal) bzw. <kbd>Shift</kbd>+Mausrad (horizontal) | Mit zwei Fingern in beliebige Richtung scrollen | — | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>; <kbd>Shift</kbd> gedrückt halten für größere Schritte |
| Vergrößern / Verkleinern | <kbd>Ctrl</kbd>+Mausrad (<kbd>Cmd</kbd>+Mausrad unter macOS); zoomt in Richtung des Mauszeigers | Zoom-Geste (Pinch) | **+** / **−** | <kbd>+</kbd> / <kbd>−</kbd> |
| Gesamten Graphen auf den Bildschirm einpassen | — | — | **fit view** | <kbd>0</kbd> |
| Zoom auf 100 % zurücksetzen | — | — | — | <kbd>1</kbd> |
| Nodes automatisch anordnen | — | — | **tidy up** | — |

Der Editor passt den Graphen beim Öffnen auf den Bildschirm ein. Die aktuelle Zoomstufe
wird unter den Schaltflächen angezeigt. Nodes rasten beim Verschieben an einem 20-px-Raster ein.

| Bearbeitungsaktion | So geht's |
|--------------------|-----------|
| Node hinzufügen | **+**-Griff an einem Node, Klick oder Ziehen in der Palette, die Schaltfläche **+** in der oberen rechten Ecke oder Rechtsklick auf eine leere Stelle der Arbeitsfläche. |
| Nodes verbinden | Vom Ausgangsport eines Nodes (rechter Rand) zum Eingangsport eines anderen Nodes (linker Rand) ziehen. |
| Bedingung einer Edge ändern | Klicken Sie auf die Bedingungs-Pille auf der Edge und wählen Sie eine Bedingung. |
| Ausgewählten Node oder ausgewählte Edge löschen | <kbd>Delete</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> unter macOS), die Löschen-Schaltfläche im Eigenschaftsbereich oder **×** auf der Pille einer Edge, über der sich der Mauszeiger befindet. |
| Rückgängig / Wiederholen | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd> unter macOS) oder die Pfeile in der Symbolleiste. Bis zu 50 Schritte. |
| Auswahl aufheben | <kbd>Esc</kbd> schließt den Eigenschaftsbereich und hebt die Auswahl auf. |

Beim Verlassen des Editors mit ungespeicherten Änderungen wird eine Bestätigung abgefragt.
Der Punkt auf der Schaltfläche **Save** zeigt an, dass der Graph von der gespeicherten
Version abweicht.

## Arten von Nodes {#node-kinds}

Ein Workflow besteht aus vier Arten von Nodes. Jede Art wird als Karte dargestellt:
eine Symbolkachel links, der Titel und ein Untertitel mit den wichtigsten Einstellungen.
Task-, Approval- und Delay-Nodes haben einen Eingangsport am linken Rand und einen
Ausgangsport am rechten Rand; Notes haben keine Ports.

### Task-Nodes {#task-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Karte eines Task-Nodes](/assets/workflow-node-task.webp)
</div>

Ein Task-Node führt ein Task Template aus. Die Kachel zeigt die Anwendung des Templates
(Ansible, Terraform, OpenTofu, Bash, PowerShell, Python), der Titel ist der Name des
Templates und der Untertitel nennt die Anwendung. Sie können die Parameter des Task
Template (Inventory, Environment, Ansible-Limit, zusätzliche CLI-Argumente) pro Node über
**task params** im Eigenschaftsbereich überschreiben; der Untertitel lautet dann
**custom params**. Ein Task-Node ohne Template zeigt ein Warnsymbol und verhindert das
Speichern.

### Approval-Nodes {#approval-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Karte eines Approval-Nodes](/assets/workflow-node-approval.webp)
</div>

Ein Approval-Node hält den Durchlauf an, bis ein Benutzer mit entsprechender Berechtigung
freigibt oder ablehnt. Optional können Sie ein Timeout (in Sekunden) und eine
Freigabemeldung festlegen; der Untertitel zeigt das Timeout. Wenn der Durchlauf einen
Approval-Node erreicht, wechselt der Status des Durchlaufs zu **approval**, bis jemand
freigibt oder ablehnt. Die Freigabekarte in der Durchlaufansicht zeigt die Freigabemeldung
mit den Schaltflächen **Approve** und **Reject** für Benutzer, die Tasks im Projekt
ausführen dürfen. Eine abgelehnte Freigabe lässt den Node fehlschlagen, und der Durchlauf
wird über die **On failure**- oder **Always**-Edges fortgesetzt.

### Delay-Nodes {#delay-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Karte eines Delay-Nodes](/assets/workflow-node-delay.webp)
</div>

Ein Delay-Node wartet eine konfigurierte Anzahl von Sekunden (mindestens 1), bevor es mit
den nachfolgenden Nodes weitergeht. Nützlich für Abkühlphasen, Wartungsfenster oder um
abhängige Schritte zeitlich zu entzerren. Während des Wartens:

- Der Durchlauf bleibt im Status **running**.
- Die Durchlaufansicht zeigt einen laufenden Countdown auf dem Delay-Node.
- Über Edges verbundene nachfolgende Nodes werden erst gestartet, wenn die Verzögerung abgelaufen ist.

Wird der Workflow-Durchlauf während einer aktiven Verzögerung **gestoppt**, wird die
Verzögerung abgebrochen und der Durchlauf endet im Status **stopped**.

### Note-Nodes {#note-nodes}

<div class="BlockSchema BlockSchema--xsmall">

![Karte eines Note-Nodes](/assets/workflow-node-note.webp)

</div>

Eine Note ist eine freie Anmerkung auf der Arbeitsfläche, dargestellt als Haftnotiz.
Notes werden nicht ausgeführt, haben keine Ports und werden nie über Edges verbunden — sie
dienen ausschließlich der Dokumentation und werden von der Validierung ignoriert.

### Zusammenführung {#convergence}

Nodes mit mehreren eingehenden Edges können verlangen, dass **alle** vorgelagerten Nodes
abgeschlossen sind (Standard) oder nur **einer** von ihnen. Legen Sie **Convergence** im
Eigenschaftsbereich des Nodes fest; der Untertitel der Karte zeigt **Any parent**, wenn
nicht der Standard verwendet wird.

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
- **Durchlaufansicht** — derselbe Graph wie im Editor, schreibgeschützt, mit Live-Status
  auf jedem Node. Ein Statussymbol in der Ecke der Karte zeigt Erfolg, Fehler, laufend,
  Warten auf Freigabe oder den Countdown einer Verzögerung; der Untertitel zeigt die Dauer.
  Noch nicht gestartete Nodes werden abgeblendet dargestellt, und die Edge, die zu einem
  laufenden Node führt, ist animiert.
- **Task-Protokoll** — klicken Sie auf einen bereits gestarteten Task-Node, um sein
  Task-Protokoll zu öffnen.
- **Stop** — solange ein Durchlauf `running` oder `approval` ist, können Benutzer mit
  `run_project_tasks` ihn stoppen. Alle aktiven Tasks werden gestoppt, ausstehende
  Freigaben werden abgelehnt und der Durchlauf wird als **stopped** markiert.

![Durchlaufansicht eines Workflows](/assets/workflow-run.webp)

![Ausstehende Freigabe in der Durchlaufansicht](/assets/workflow-run-approval.webp)

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
