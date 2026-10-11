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

## Outputs und Inputs {#outputs-and-inputs}

Ein Task-Node kann strukturierte Daten an die nachfolgenden Nodes weitergeben. Der Task
**erzeugt Outputs**: ein JSON-Objekt mit benannten Werten, das bei erfolgreichem Abschluss
zusammen mit dem Task gespeichert wird. Eine Verbindung zum nächsten Task-Node **liefert
Inputs**: Sie befüllt die Survey-Variablen des Task Template dieses Nodes aus den Outputs
des vorherigen Nodes. Es werden keine Dateien übergeben, nur Werte.

### Outputs erzeugen {#producing-outputs}

Jeder von einem Workflow-Durchlauf gestartete Task erhält die Umgebungsvariable
`SEMAPHORE_OUTPUTS_FILE`: den Pfad einer leeren Datei, die nur für diesen Task angelegt wird.
Was der Task dort als JSON-Objekt hineinschreibt, wird zu seinen Outputs.

| App | Wie Outputs erzeugt werden |
|-----|--------------------------|
| **Ansible** | `ansible.builtin.set_stats` mit `per_host: false` (Standard). Das mitgelieferte Callback-Plugin `semaphore_outputs` schreibt die aggregierten Statistiken des Durchlaufs in die Datei; Statistiken pro Host sind keine Outputs. |
| **Terraform, OpenTofu, Terragrunt** | Werden nach einem erfolgreichen Durchlauf automatisch aus `output -json` übernommen. Ein Wert, den der Task selbst in die Datei geschrieben hat, hat Vorrang vor einem übernommenen Output mit demselben Namen. |
| **Bash, Python, PowerShell, Pulumi** | Das Skript schreibt die Datei. |

```bash
# Bash: die Outputs-Datei schreiben
cat > "$SEMAPHORE_OUTPUTS_FILE" <<EOF
{"image_tag": "1.4.2", "replicas": 3, "subnet_ids": ["subnet-1", "subnet-2"]}
EOF
```

```yaml
# Ansible: set_stats wird zu Outputs
- name: Publish the image tag for the next nodes
  ansible.builtin.set_stats:
    data:
      image_tag: "{{ built_tag }}"
```

Regeln:

- Outputs werden nur gelesen, wenn der Task **erfolgreich** ist. Ein fehlgeschlagener oder
  gestoppter Task hat keine, daher erhält ein **On failure**-Zweig nichts von dem Node, der
  fehlgeschlagen ist.
- Namen von Outputs entsprechen `^[A-Za-z_][A-Za-z0-9_-]*$`. Ein Wert kann ein beliebiger
  JSON-Wert sein: String, Zahl, Boolean, Liste oder Objekt.
- Grenzen: Die Datei ist höchstens 256 KB groß, mit höchstens 100 Outputs von je höchstens 32 KB.
- Eine fehlende oder leere Datei bedeutet „keine Outputs“. Eine Datei, die kein JSON-Objekt ist,
  einen ungültigen Namen verwendet oder eine Grenze überschreitet, **lässt den Task
  fehlschlagen**, mit dem Grund im Log.
- Terraform-Outputs, die nicht gespeichert werden können — als `sensitive` markiert, zu groß,
  mit ungültigem Namen oder über den Grenzen —, werden übersprungen und im Task-Log sowie im
  Bereich **Outputs** des Tasks als **Not captured** aufgeführt. Sie lassen den Task nie
  fehlschlagen.

### Inputs liefern {#delivering-inputs}

Klicken Sie auf eine Verbindung, die in einem Task-Node endet: Ihr Seitenbereich enthält einen
Abschnitt **Inputs**.

- **Nach Name** (Standard). Jeder Output des Quell-Nodes, dessen Name einer Survey-Variable
  des Ziel-Templates entspricht, befüllt diese Variable. Outputs ohne passende Variable werden
  ignoriert; ein Terraform-Output mit Bindestrich ist nie ein gültiger Variablenname und wird
  daher nicht geliefert.
- **Map inputs explicitly.** Aktivieren Sie das Kontrollkästchen, um nur die von Ihnen
  aufgeführten Paare zu liefern: eine Survey-Variable des Ziel-Templates und den
  Output-Schlüssel, der sie befüllt. Eine leere Liste liefert nichts. Sobald der Workflow einen
  abgeschlossenen Durchlauf hat, schlägt der Bereich die Schlüssel vor, die dieser Durchlauf
  erzeugt hat, und markiert einen Schlüssel, der nicht übernommen wurde.

Eine Variable, die von keiner Verbindung befüllt wird, fällt auf den am Node festgelegten Wert
zurück, danach auf den Standardwert der Variable. Eine **erforderliche** Variable ohne Wert lässt
den Task des Nodes vor dem Start fehlschlagen, mit einer Log-Zeile, die die Variable nennt; der
Durchlauf folgt dann seinen **On failure**-Edges.

Werte werden in den Typ der Variable umgewandelt: Eine `int`-Variable nimmt eine Zahl oder einen
String aus Ziffern an, eine `enum`- oder `select`-Variable nur ihre eigenen Optionen, eine
`string`- oder `text`-Variable alles (ein Objekt oder eine Liste kommt als kompaktes JSON an).
Ein Wert, der nicht passt, wird ignoriert, mit dem Grund im Task-Log, und der Fallback greift.

**Approval- und Delay-Nodes** reichen Outputs durch: `task → approval → task` liefert weiterhin
Daten, und es gilt der Modus der letzten Verbindung.

**Mehrere Verbindungen zu einem Node.** Jede Verbindung, deren Quelle erfolgreich war, trägt bei.
Wenn zwei davon dieselbe Variable befüllen, hat eine explizite Zuordnung Vorrang vor einer
Lieferung nach Name; zwischen zwei gleicher Art gewinnt die zuerst erstellte Verbindung, sodass
ein Durchlauf jedes Mal dasselbe Ergebnis liefert. Das Task-Log nennt die gewinnende Verbindung.

![The connection panel in by-name mode: matched survey variables are ticked](/assets/workflow-inputs-by-name.webp)

![The connection panel with explicit mapping: one output key per survey variable](/assets/workflow-inputs-explicit.webp)

### Wo sie angezeigt werden {#where-to-see-outputs}

- Die **Durchlaufansicht** zeigt auf jedem Node, der Outputs erzeugt hat, ein Badge *N outputs*.
- Der **Task-Dialog** enthält eine Tabelle **Outputs** mit den Werten und der Liste *Not captured*.
- Das Log eines Tasks, der über eine Verbindung befüllt wird, beginnt mit einer Zeile pro
  Variable, etwa `Input "image_tag" <- output "image_tag" of node 3 (task #41)`, sodass die
  Herkunft jedes Werts eine Zeile über dem Wert selbst steht.

![Run view: nodes that produced outputs carry a badge](/assets/workflow-run-outputs.webp)

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Task dialog, Details tab: the Outputs table](/assets/task-outputs.webp)
</div>

### Einschränkungen {#outputs-limitations}

- Outputs werden im Klartext gespeichert und allen angezeigt, die den Task sehen können.
  **Übergeben Sie keine Secrets über Outputs.** Eine Survey-Variable vom Typ `secret` kann nicht
  durch eine Verbindung befüllt werden.
- Outputs sind Werte, niemals Code: Ansible erhält sie als literale Strings, und ein
  Jinja2-Ausdruck in einem Wert wird nicht ausgewertet.
- Tasks auf Remote-Runnern erzeugen und empfangen Outputs wie Tasks auf dem Server. Tasks, die
  vom **Docker**- oder **Kubernetes**-Executor eines Runners ausgeführt werden, erzeugen noch
  keine Outputs; ihr Log weist darauf hin.

## Umgebungsvariablen {#environment-variables}

Eine von einem Workflow gestartete Aufgabe erhält zusätzlich zu den
[Variablen jeder Aufgabe](./tasks#environment-variables):

| Variable | Wert |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | ID des Workflows |
| `SEMAPHORE_WORKFLOW_RUN_ID` | ID des aktuellen Durchlaufs |
| `SEMAPHORE_WORKFLOW_URL` | Link zur Seite des Durchlaufs, z. B. `https://semaphore.example.com/project/1/workflows/7/runs/42` (erfordert `web_host` in der Serverkonfiguration) |
| `SEMAPHORE_OUTPUTS_FILE` | Pfad der Datei, in die der Task seine [Outputs](#producing-outputs) schreibt |

Diese Variablen werden für alle Anwendungen gesetzt, einschließlich Ansible und Terraform, und stehen auch Tasks auf Remote-Runnern zur Verfügung.

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
`delay`-Nodes (`delay_seconds`), `input_mode` und `input_mappings` an Edges, des
`artifacts`-Dokuments jedes Tasks in den Details des Durchlaufs (`GET …/runs/{run_id}`) und des
Stop-Endpunkts (`POST …/runs/{run_id}/stop`).
