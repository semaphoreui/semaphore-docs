# Build- und Deploy-Task-Templates

Neben einfachen **Task**-Templates kennt Semaphore zwei Typen von Task Templates, die eine einfache Pipeline bilden: **Build** erzeugt ein versioniertes Artefakt, **Deploy** bringt eine ausgewählte Version auf die Server. Beide Typen werden im Formular des Task Template ausgewählt und verändern, was der Benutzer beim Starten eines Tasks sieht.

## Build-Task-Templates {#build-templates}

Ein Build-Task-Template erzeugt ein Artefakt: ein Tarball, ein Container-Image, ein Paket. Jeder Build-Task erhält eine automatisch hochgezählte Version, beginnend mit der **Start Version** des Task Template (zum Beispiel `1.0.0`). Die Version wird in der Spalte **Version** der Task-Template-Liste und im Task-Verlauf angezeigt.

<div class="DialogScreenshot">
  ![Dialog für einen neuen Task bei einem Build-Task-Template](/assets/task-new-build.webp)
</div>

Verwenden Sie die Version in Ihrem Playbook über `semaphore_vars.task_details.target_version`, um das Artefakt zu benennen.

## Deploy-Task-Templates {#deploy-templates}

Ein Deploy-Task-Template wird über das Feld **Build Template** mit einem Build-Task-Template verknüpft. Wenn ein Benutzer auf **Deploy** klickt, fragt der Dialog für einen neuen Task nach der **Build Version**, die bereitgestellt werden soll; der letzte erfolgreiche Build ist vorausgewählt.

<div class="DialogScreenshot">
![Dialog für einen neuen Task bei einem Deploy-Task-Template](/assets/task-new-deploy.webp)
</div>

Aktivieren Sie **Autorun** im Deploy-Task-Template, um nach jedem erfolgreichen Build automatisch ein Deploy zu starten. Die bereitzustellende Version steht im Playbook als `semaphore_vars.task_details.incoming_version` zur Verfügung.

## Die Variable `semaphore_vars` {#the-semaphore_vars-variable}

Semaphore übergibt die Variable `semaphore_vars` an jedes Ansible-Playbook, das es ausführt. Verwenden Sie sie, um zu erfahren, welcher Task-Typ ausgeführt wurde, welche Version gebaut oder bereitgestellt werden soll, wer den Task ausgeführt hat und wie die Task-Nachricht lautet.

Beispiel für `build`-Tasks:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

Beispiel für `deploy`-Tasks:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

Für **Bash**-, **PowerShell**- und **Python**-Task-Templates stellt Semaphore dieselben `task_details`-Werte als Umgebungsvariablen bereit:

| Feld in `task_details` | Umgebungsvariable | Hinweise |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` oder `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | Benutzer, der den Task gestartet hat |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | Task-Nachricht |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Bei `build`-Tasks vorhanden |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Bei `deploy`-Tasks vorhanden |

Beispiel für Bash:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

Beispiel für PowerShell:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Beispiel für Python:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## Beispiel-Pipeline {#example-pipeline}

Eine `build`-Ansible-Rolle:

1. Den Quellcode der App von GitHub holen.
2. Den Quellcode kompilieren.
3. Die Binärdatei in `app-{{ semaphore_vars.task_details.target_version }}.tar.gz` packen.
4. Das Tarball in einen S3-Bucket hochladen.

Eine `deploy`-Ansible-Rolle:

1. `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` aus dem S3-Bucket auf die Zielserver herunterladen.
2. Es in das Zielverzeichnis entpacken.
3. Konfigurationsdateien erstellen oder aktualisieren.
4. Den App-Dienst neu starten.

Um mehr als zwei Schritte zu verketten, Freigaben hinzuzufügen oder bei Fehlern zu verzweigen, verwenden Sie [Workflows](../workflows).
