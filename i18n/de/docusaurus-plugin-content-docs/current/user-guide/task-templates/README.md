# Task Templates

Ein Task Template legt fest, was und wie ausgeführt wird: die Anwendung, das Repository und die auszuführende Datei, das Inventory, die Variable Groups, die Zugangsdaten und die Optionen, die ein Benutzer beim Starten eines Tasks ändern darf. Jeder [Task](../tasks) wird aus einem Task Template erstellt.

Task Templates unterstützen die folgenden Anwendungen:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) und [Terragrunt](/user-guide/apps/terragrunt)
* [Shell](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

Administratoren können Anwendungen aktivieren oder deaktivieren und eigene hinzufügen, siehe [Apps](/user-guide/apps).

## Liste der Task Templates {#template-list}

Der Bereich **Task Templates** listet alle Task Templates des Projekts auf.

![Liste der Task Templates](/assets/templates-list.webp)

| Spalte | Inhalt |
|---|---|
| **Name** | Name des Task Template mit dem Symbol der Anwendung. Die **Play**-Schaltfläche startet einen neuen Task. |
| **Version** | Die neueste Build-Version bei Build- und Deploy-Task-Templates, andernfalls das Ergebnissymbol des letzten Tasks. |
| **Status** | Status-Badge des letzten Tasks oder *Not launched*. |
| **Last Task** | Nummer des letzten Tasks und wer ihn gestartet hat. |
| **Playbook** | Die Datei, die das Task Template ausführt. |
| **Inventory**, **Variable Groups**, **Repository** | Ressourcen, die dem Task Template zugeordnet sind. |

Die Tabs über der Liste sind [Views](./views): benannte Gruppen von Task Templates. Über das Zahnradsymbol in der oberen rechten Ecke wählen Sie aus, welche Spalten angezeigt werden. Klicken Sie auf den Pfeil links in einer Zeile, um die neuesten Tasks dieses Task Template aufzuklappen.

![Aufgeklappte Zeile eines Task Template](/assets/templates-list-expanded.webp)

## Seite des Task Template {#template-page}

Klicken Sie auf den Namen eines Task Template, um seine Seite zu öffnen. Die Schaltfläche in der oberen rechten Ecke startet einen Task (**Run**, **Build** oder **Deploy**, je nach Typ), **Stop all** stoppt jeden laufenden oder wartenden Task des Task Template.

| Tab | Inhalt |
|---|---|
| **Tasks** | Tasks dieses Task Template mit einer **Rerun**-Schaltfläche in jeder Zeile. |
| **Details** | Das Playbook, der Typ, das Inventory, die Variable Groups und das Repository sowie das Task-Status-Diagramm mit denselben Filtern wie [Stats](../projects/stats). |
| **Workspaces** | Nur bei Terraform-, OpenTofu- und Terragrunt-Task-Templates: die Liste der Workspaces, siehe [Workspaces](../apps/terraform/workspaces). |

![Details eines Task Template](/assets/template-details.webp)

## Typen von Task Templates {#template-types}

| Typ | Zweck |
|---|---|
| **Task** | Eine einfache Ausführung. Der Standardtyp. |
| **Build** | Erzeugt ein Artefakt und weist ihm eine automatisch hochgezählte Version zu. |
| **Deploy** | Stellt eine von einem Build-Task-Template erzeugte Version bereit. |

Build- und Deploy-Task-Templates sowie die `semaphore_vars`, die sie an Playbooks übergeben, sind unter [Build- und Deploy-Task-Templates](./build-deploy) beschrieben.

## Formular des Task Template {#template-form}

Benutzer mit der Rolle **Manager** oder höher können Task Templates über **New Template** und das Stiftsymbol erstellen und bearbeiten. Das Formular ist in die folgenden Gruppen unterteilt. Felder, die mit einem Anwendungsnamen markiert sind, erscheinen nur für diese Anwendung.

### Allgemeine Felder {#common-fields}

| Feld | Beschreibung |
|---|---|
| **Name** | Erforderlich. Name des Task Template. |
| **Description** | Optionaler Text, der unter dem Namen angezeigt wird. |
| **App** | Anwendung, die ausgeführt wird. |
| **Repository** | Repository mit dem Playbook oder Skript, siehe [Repositories](../repositories). |
| **Branch** | Git-Branch, der ausgecheckt wird. Leer bedeutet den im Repository konfigurierten Branch. |
| **Playbook / Script filename** | Pfad zur Datei relativ zum Repository-Stammverzeichnis. Bei Terraform-Apps: das Unterverzeichnis mit der Konfiguration. |
| **Different working directory** | Das Werkzeug aus einem anderen Verzeichnis des Repositorys ausführen. |
| **Inventory** | Ansible-Inventory oder ein Workspace bei Terraform-Apps. |
| **Variable Groups** | Eine oder mehrere Variable Groups, deren Variablen und Secrets in den Task eingefügt werden, siehe [Variable Groups](../environment). |
| **Vault password** (Ansible) | Schlüssel zum Entsperren von Ansible Vault, siehe [Mehrere Vault-Passwörter](../apps/ansible#multiple-vault-passwords). |
| **View** | Auf welchem [View](./views)-Tab das Task Template erscheint. |
| **CLI args** | Zusätzliche Befehlszeilenargumente als JSON-Array, zum Beispiel `["-vvv"]`. |

### Typspezifische Felder {#type-specific-fields}

| Feld | Typ | Beschreibung |
|---|---|---|
| **Start Version** | Build | Die erste zu vergebende Version, zum Beispiel `1.0.0`. |
| **Build Template** | Deploy | Das Build-Task-Template, dessen Artefakte dieses Task Template bereitstellt. |
| **Autorun** | Deploy | Ein Deploy automatisch nach jedem erfolgreichen Build starten. |

### Erweiterte Optionen {#advanced-options}

| Feld | Beschreibung |
|---|---|
| **Allow parallel tasks** | Mehrere Tasks dieses Task Template gleichzeitig laufen lassen, siehe [Parallele Tasks](#parallel-tasks). |
| **Alerts**, **Send on success**, **Send on error** | Ob Benachrichtigungen für Tasks dieses Task Template gesendet werden und bei welchen Ergebnissen. Benachrichtigungen erfordern außerdem **Allow alerts for this project** in den [Projekteinstellungen](../projects/settings). |
| **Runner tag** (Pro) | Tasks nur auf Runnern mit diesem Tag ausführen, siehe [Projekt-Runner](../projects/runners). |
| **Executor image** | Container-Image für Docker- und Kubernetes-Runner, siehe [Executor-Image](#executor-image-docker-and-kubernetes-runners). |
| **Issue JWT to task runner**, **JWT audience**, **JWT TTL** | Dem Task ein signiertes Token geben, siehe [Task-JWTs](./jwt). |
| **Auto-run task if new git commit have been found** | Das Repository im angegebenen Intervall abfragen und einen Task starten, wenn sich der Branch bewegt. |
| **Survey variables** | Eingaben, die der Benutzer beim Starten eines Tasks ausfüllt, siehe [Survey-Variablen](./survey-vars). |

### Prompts {#prompts}

Prompts sind Kontrollkästchen, mit denen der Benutzer im Dialog für einen neuen Task eingebaute Optionen ändern kann: Branch, Inventory, CLI-Argumente und, bei Ansible, Limit, Tags, Skip-Tags, Debug-Level und Galaxy-Installation. Siehe [Prompts](./prompts).

### Anwendungsoptionen {#application-options}

- **Ansible**: Limit, Tags, Skip-Tags und Optionen für die Galaxy-Installation, siehe [Ansible](../apps/ansible).
- **Terraform/OpenTofu/Terragrunt**: Auto Approve und Backend-Überschreibung, siehe [Terraform/OpenTofu](../apps/terraform) und [HTTP-Backend](../apps/terraform/states).

---

## Parallele Tasks {#parallel-tasks}

Standardmäßig werden Tasks desselben Task Template nacheinander ausgeführt. Um gleichzeitige Läufe desselben Task Template zu erlauben, aktivieren Sie in den Einstellungen des Task Template die Option „Allow parallel tasks“.

## Executor-Image (Docker- und Kubernetes-Runner) {#executor-image-docker-and-kubernetes-runners}

Wenn ein Projekt-Runner den **Docker**- (Pro) oder **Kubernetes**-Executor (Enterprise) verwendet, läuft jeder Task normalerweise im auf dem Runner konfigurierten Standard-Job-Image (zum Beispiel `semaphoreui/job:latest`). Sie können dieses Image pro Task Template überschreiben.

1. Öffnen Sie die Einstellungen des Task Template
2. Setzen Sie **Executor image** auf die Referenz des Container-Images (zum Beispiel `my-registry/ansible:2.16` oder `semaphoreui/job:latest`)
3. Speichern Sie das Task Template

**Verhalten**:
- Nur die **Docker**- und **Kubernetes**-Runner-Executoren berücksichtigen dieses Feld; der lokale Executor ignoriert es
- Lassen Sie das Feld leer, um das Standard-Image des Runners aus `runner.executor.docker.image` oder `runner.executor.k8s.image` zu verwenden
- Das Leeren des Feldes in der Oberfläche entfernt die Überschreibung

**Anwendungsfälle**:
- Task Templates, die eine andere Toolchain benötigen (älteres Ansible, eine bestimmte Terraform-Version, zusätzliche OS-Pakete in einem eigenen Image)
- Isolierte Images für sicherheitskritische Task Templates, ohne den Runner-weiten Standard zu ändern

Siehe [Runner-Konfiguration](/admin-guide/configuration) für die Standard-Image-Einstellungen und [Projekt-Runner](/user-guide/projects/runners) für die Einrichtung des Executors.
