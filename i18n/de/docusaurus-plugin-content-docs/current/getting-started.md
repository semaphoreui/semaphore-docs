# Erste Schritte

Diese Seite führt Sie von einer frischen Installation bis zu Ihrem ersten erfolgreichen Task. Jeder Schritt verweist auf die Seite mit den Details.

## Von null zum ersten Task {#from-zero-to-first-task}

1. **Installieren Sie Semaphore** mit der Methode Ihrer Wahl: [Installation](/admin-guide/installation).
2. **Melden Sie sich an** mit dem Admin-Benutzer, den Sie bei der Einrichtung erstellt haben, oder über die `SEMAPHORE_ADMIN_*`-Variablen in Docker.
3. **Erstellen Sie ein Projekt.** Ein Projekt isoliert Teams, Infrastrukturen oder Anwendungen voneinander: [Projekte](/user-guide/projects).
4. **Verbinden Sie, was Ihre Automatisierung benötigt:**
   - Quellcode mit Playbooks, Modulen oder Skripten: [Repositories](/user-guide/repositories).
   - SSH-Schlüssel, Token und Passwörter: [Schlüsselspeicher](/user-guide/key-store).
   - Zielhosts und Verbindungseinstellungen: [Inventory](/user-guide/inventory).
   - Wiederverwendbare Variablen: [Variablengruppen](/user-guide/environment).
5. **Erstellen Sie ein Task-Template und führen Sie es aus.** Wählen Sie die Anleitung für Ihr Werkzeug: [Ansible](/user-guide/apps/ansible), [Terraform/OpenTofu](/user-guide/apps/terraform), [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) oder [Python](/user-guide/apps/python). Führen Sie es anschließend aus und beobachten Sie es: [Tasks](/user-guide/tasks).
6. **Automatisieren und in den Betrieb überführen:**
   - Nach Zeitplan ausführen: [Zeitpläne](/user-guide/schedules).
   - Steuern, wer was tun darf: [Teams und benutzerdefinierte Rollen](/user-guide/team).
   - Über Ergebnisse benachrichtigt werden: [Benachrichtigungen](/admin-guide/notifications).

## Grundbegriffe {#key-concepts}

Diese Begriffe tauchen überall in der Benutzeroberfläche auf.

| Begriff | Bedeutung |
|------|---------|
| **Projekt** | Die wichtigste Trenneinheit. Jedes Projekt hat seine eigenen Repositories, Schlüssel, Inventories, Templates und sein eigenes Team. [Projekte](/user-guide/projects) |
| **Repository** | Ein Git-Repository oder lokaler Pfad, in dem Playbooks, Module oder Skripte liegen. [Repositories](/user-guide/repositories) |
| **Inventory** | Hosts, Gruppen und Verbindungseinstellungen für Ansible-artige Ausführungen. [Inventory](/user-guide/inventory) |
| **Variablengruppe** | Wiederverwendbare Variablen und Umgebungskonfiguration, auch Environment genannt. [Variablengruppen](/user-guide/environment) |
| **Schlüsselspeicher** | Verschlüsselte Anmeldedaten wie SSH-Schlüssel, Token und Passwörter. [Schlüsselspeicher](/user-guide/key-store) |
| **Task-Template** | Die Definition einer Ausführung: App, Repository, Inventory, Variablen und Optionen. [Task-Templates](/user-guide/task-templates) |
| **Task** | Eine einzelne Ausführung eines Templates mit Log und Status. [Tasks](/user-guide/tasks) |
| **Workflow** | Ein Graph aus Templates mit Verzweigungen, Freigaben und Verzögerungen. Pro-Funktion. [Workflows](/user-guide/workflows) |
| **Runner** | Wo Tasks ausgeführt werden: der Server selbst oder ein entfernter Runner. [Runner](/admin-guide/runners) |

## Nächste Schritte {#next-steps}

- Betreiben Sie Semaphore hinter TLS mit einem [Reverse-Proxy](/admin-guide/reverse-proxy).
- Verbinden Sie Ihren Identitätsanbieter: [LDAP](/admin-guide/authentication/ldap) oder [OpenID Connect](/admin-guide/authentication/openid).
- Steuern Sie Semaphore aus CI oder Skripten über die [API](/reference/api) und die [CLI](/reference/cli).
