# Tasks

Ein Task ist eine einzelne Ausführung eines [Task Template](./task-templates): ein Durchlauf eines Ansible-Playbooks, einer Terraform-/OpenTofu-/Terragrunt-Konfiguration oder eines Bash-, PowerShell- oder Python-Skripts. Jeder Task hat sein eigenes Log, seinen Status und seine Details, sodass Sie jederzeit sehen können, was ausgeführt wurde, wann, von wem und mit welchem Stand des Repositorys.

## Einen Task starten {#starting-a-task}

Sie benötigen im Projekt die Rolle **Task Runner** oder höher (siehe [Teams](./team)). Starten Sie einen Task an einer von zwei Stellen:

- Klicken Sie unter **Task Templates** auf die **Play**-Schaltfläche in der Zeile des Task Template.
- Klicken Sie auf der Seite des Task Template auf die Schaltfläche in der oberen rechten Ecke. Ihre Bezeichnung hängt vom Typ des Task Template ab: **Run**, **Build** oder **Deploy**.

Beide öffnen den Dialog **New Task**. Sein Inhalt hängt von der Anwendung und von den im Task Template aktivierten Optionen ab.

![Dialog New Task für ein Ansible-Task-Template](/assets/task-new-ansible.webp)

| Feld | Angezeigt für | Beschreibung |
|---|---|---|
| **Message** | alle Task Templates | Optionale Notiz, die beim Task gespeichert und in der History und in Benachrichtigungen angezeigt wird. |
| **Build Version** | Deploy-Task-Templates | Welcher Build bereitgestellt wird. Standardmäßig ist der letzte erfolgreiche Build ausgewählt. Siehe [Build- und Deploy-Task-Templates](./task-templates/build-deploy). |
| Survey-Variablen | Task Templates mit [Survey-Variablen](./task-templates/survey-vars) | Ein Eingabefeld pro Variable; erforderliche Variablen müssen ausgefüllt werden. |
| **Dry Run** `--check`, **Diff** `--diff` | Ansible | Das Playbook im Check-Modus ausführen oder Dateiänderungen anzeigen. Weitere Ansible-Prompts (Limit, Tags, Skip tags, Debug) erscheinen, wenn sie im Task Template aktiviert sind, siehe [Prompts](./task-templates/prompts). |
| **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure** | Terraform, OpenTofu, Terragrunt | Nur `plan` ausführen, `-destroy`, `-auto-approve`, `-upgrade` oder `-reconfigure` hinzufügen. Siehe [Terraform/OpenTofu](./apps/terraform). |
| **Branch**, **Inventory**, **CLI args** | jede Anwendung | Die Werte des Task Template für diesen Durchlauf überschreiben. Jede Überschreibung muss in den Einstellungen des Task Template erlaubt sein. |

![Dialog New Task für ein Terraform-Task-Template](/assets/task-new-terraform.webp)

Klicken Sie auf **Run** (oder **Build** / **Deploy**), um den Task in die Warteschlange zu stellen.

### Warteschlange und parallele Ausführung {#queue-and-parallel-execution}

Tasks desselben Task Template laufen nacheinander, sofern im Task Template nicht **Allow parallel tasks** aktiviert ist. Das Projekt kann die Gesamtzahl der laufenden Tasks außerdem mit **Max number of parallel tasks** in den [Projekteinstellungen](./projects/settings) begrenzen. Ein Task, der warten muss, bleibt im Status `waiting` und startet automatisch, sobald ein Platz frei ist.

## Task-Fenster {#task-window}

Ein Klick auf einen Task an beliebiger Stelle in der Oberfläche öffnet das Task-Fenster. Die Kopfzeile zeigt das Task Template, die Task-Nummer, die Commit-Nachricht des Repository-Stands, das Status-Badge, wer den Task gestartet hat und wann, sowie die Dauer. Das Pfeilsymbol vergrößert das Fenster auf den Vollbildmodus.

![Task-Log](/assets/task-log.webp)

| Tab | Inhalt |
|---|---|
| **Log** | Live-Ausgabe des Tasks mit Zeitstempeln. Das Log wird gestreamt, während der Task läuft. **Raw log** öffnet die unverarbeitete Ausgabe in einem neuen Browser-Tab. |
| **Details** | Informationen zum Task Template (Anwendung, Task Template), Commit-Informationen (Nachricht und Hash) und Ausführungsinformationen: Nachricht, Erstellungs-, Start- und Endzeit, Dauer und, falls gesetzt, der Runner, der Branch, das Limit und die für den Durchlauf verwendeten Variablen. |
| **Summary** (Pro) | Bei Ansible-Tasks: wie viele Hosts erfolgreich abgeschlossen haben und wie viele fehlgeschlagen sind, mit einer Tabelle der fehlgeschlagenen Tasks pro Server. |

![Task-Details](/assets/task-details.webp)

![Task-Zusammenfassung](/assets/task-summary.webp)

## Task-Status {#task-statuses}

| Status | Bedeutung |
|---|---|
| `waiting` | Der Task ist in der Warteschlange: ein anderer Task desselben Task Template läuft, das Projektlimit ist erreicht oder es ist noch kein Runner verfügbar. |
| `starting` | Ein Runner hat den Task übernommen und bereitet das Repository und die Umgebung vor. |
| `waiting_confirmation` | Das Werkzeug hat eine Frage gestellt und wartet auf einen Benutzer, zum Beispiel `terraform apply` ohne **Auto Approve** oder ein Skript, das Eingaben liest. Verwenden Sie **Confirm** oder **Reject** im Task-Fenster. |
| `confirmed` | Ein Benutzer hat die Frage bestätigt; der Task wird fortgesetzt. |
| `rejected` | Ein Benutzer hat die Frage abgelehnt; der Task endet. |
| `running` | Das Playbook oder Skript wird ausgeführt. |
| `stopping` | Ein Stopp wurde angefordert und der Prozess wird beendet. |
| `stopped` | Der Task wurde von einem Benutzer gestoppt. |
| `success` | Mit Exit-Code 0 beendet. |
| `error` | Mit einem Exit-Code ungleich null beendet oder nicht gestartet. Wird in der Oberfläche als **Failed** angezeigt. |

## Tasks stoppen {#stopping-tasks}

Öffnen Sie das Task-Fenster eines laufenden Tasks und klicken Sie auf **Stop**. Semaphore sendet ein Beendigungssignal und der Task geht in den Status `stopping`, während der Prozess beendet wird. Reagiert der Prozess nicht, ändert sich die Schaltfläche zu **Force Stop**; klicken Sie darauf, um den Prozess sofort abzubrechen.

Um alle laufenden und wartenden Tasks eines Task Template zu stoppen, öffnen Sie die Seite des Task Template und verwenden Sie **Stop all**. Das Dropdown bietet sowohl **Stop** als auch **Force stop**.

<div style={{maxWidth: 200}}>

![Menü Stop all](/assets/task-stop-all-menu.webp)

</div>

## Einen Task erneut ausführen {#running-a-task-again}

Im Tab **Tasks** eines Task Template hat jede Zeile eine **Rerun**-Schaltfläche. Sie öffnet den Dialog New Task mit der Nachricht und den Parametern dieses Tasks.

![Tasks eines Task Template mit Rerun-Schaltflächen](/assets/template-tasks.webp)

## Wo Tasks aufgelistet werden {#where-tasks-are-listed}

- **Dashboard → History**: alle Tasks des Projekts, siehe [History](./projects/history).
- **Seite des Task Template → Tasks**: Tasks eines einzelnen Task Template.
- **Task Templates**: Klappen Sie eine Zeile mit dem Pfeil links auf, um die neuesten Tasks des Task Template zu sehen, ohne die Liste zu verlassen.

## Aufbewahrung von Logs {#log-retention}

Tasks und Logs werden standardmäßig dauerhaft aufbewahrt. Verwenden Sie `max_tasks_per_template`, um nur die neuesten Tasks jedes Task Template zu behalten, siehe [History](./projects/history#task-retention).
