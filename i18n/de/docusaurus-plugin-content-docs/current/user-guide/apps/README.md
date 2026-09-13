# Anwendungen

Eine Anwendung ist das Werkzeug, das ein Task Template ausführt. Semaphore bringt sieben integrierte Anwendungen mit; Administratoren können sie ein- und ausschalten und eigene registrieren.

| Anwendung | ID | Was ein Template ausführt | Anleitung |
|---|---|---|---|
| Ansible Playbook | `ansible` | `ansible-playbook` mit dem ausgewählten Inventory | [Ansible](./ansible) |
| Terraform Code | `terraform` | `terraform` im ausgewählten Unterverzeichnis und Workspace | [Terraform/OpenTofu](./terraform) |
| OpenTofu Code | `tofu` | `tofu`, dieselben Optionen wie bei Terraform | [Terraform/OpenTofu](./terraform) |
| Terragrunt Code | `terragrunt` | `terragrunt` als Wrapper um Terraform oder OpenTofu | [Terragrunt](./terragrunt) |
| Bash Script | `bash` | ein Shell-Skript mit `/bin/bash` | [Shell](./bash) |
| PowerShell Script | `powershell` | ein `.ps1`-Skript mit `pwsh` | [PowerShell](./powershell) |
| Python Script | `python` | ein `.py`-Skript mit `python3` | [Python](./python) |

Das Werkzeug selbst muss auf dem Rechner installiert sein, der die Tasks ausführt: dem Semaphore-Server oder dem [Runner](/admin-guide/runners). Das offizielle Docker-Image enthält Ansible, Terraform, OpenTofu, Bash und Python.

## Anwendungen verwalten {#managing-applications}

Administratoren öffnen **Applications** über das Kontomenü am unteren Ende der Seitenleiste.

![Seite Applications](/assets/apps-list.webp)

Der Schalter in jeder Zeile aktiviert oder deaktiviert die Anwendung. Eine deaktivierte Anwendung wird im Template-Formular nicht angeboten, bestehende Templates funktionieren weiterhin. Beim Erstellen eines Templates erscheinen nur aktivierte Anwendungen, deaktivieren Sie also die Werkzeuge, die nicht auf Ihrem Server installiert sind.

Klicken Sie auf eine Anwendung, um Titel, Icon, Pfad zur Binärdatei und Priorität (die Reihenfolge im Template-Formular) zu ändern.

## Eigene Anwendungen {#custom-applications}

Mit **New App** registrieren Sie ein beliebiges Kommandozeilen-Werkzeug als Anwendung:

| Feld | Beschreibung |
|---|---|
| **ID** | Kurzer Identifier, der in der API und in Templates verwendet wird, zum Beispiel `pulumi`. |
| **Icon** | Icon, das neben dem Namen angezeigt wird. |
| **Name** | Titel, der im Template-Formular angezeigt wird. |
| **Path** | Pfad zur ausführbaren Datei auf dem Server oder Runner. |
| **Priority** | Position in der Liste der Anwendungen. |
| **Active** | Ob die Anwendung in Templates angeboten wird. |

Ein Template einer eigenen Anwendung führt die ausführbare Datei mit der Skriptdatei aus dem Repository als Argument aus und erhält Variable Groups als Umgebungsvariablen, genauso wie [Bash](./bash)-Templates.

Anwendungen können auch in der Serverkonfiguration vordefiniert werden, siehe den Abschnitt `apps` in [Konfiguration](/admin-guide/configuration).
