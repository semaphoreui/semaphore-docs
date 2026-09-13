---
title: Was ist Semaphore
description: Was Semaphore UI leistet, welche Probleme es löst, für wen es gedacht ist und in welchen Fällen ein anderes Werkzeug die bessere Wahl ist.
---

# Was ist Semaphore

Semaphore UI ist eine selbst gehostete Weboberfläche samt REST-API, mit der Sie bereits
vorhandene Automatisierung ausführen. Sie richten es auf ein Git-Repository mit Ihren
Ansible-Playbooks, Terraform-Konfigurationen oder Shell-Skripten aus, legen fest, welche
Zugangsdaten und Hosts verwendet werden, und schon ist es der zentrale Ort, an dem Ihr
Team diese Automatisierung ausführt, die dafür nötigen Secrets speichert und jeden Lauf
protokolliert.

Sie können Tasks einzeln ausführen oder mit [Workflows](/user-guide/workflows) (Pro)
zu einer einzigen Pipeline verbinden, die Builds, Tests, Deployments und
Infrastrukturautomatisierung zusammenführt.

Semaphore ersetzt weder Ansible noch Terraform oder Ihre Skripte. Es führt sie aus — auf
einem Server statt auf dem Laptop einer einzelnen Person.

## Welches Problem es löst {#the-problem-it-solves}

Automatisierung beginnt meist auf einer Workstation. Eine Person hat das Playbook, das
Inventory, den SSH-Schlüssel und die passende Ansible-Version installiert. Das
funktioniert, bis eine zweite Person dasselbe ausführen muss oder bis jemand fragt, was
letzten Dienstag auf einem Host geändert wurde.

Semaphore verlagert die Ausführung auf einen gemeinsamen Server und ergänzt, was bisher
gefehlt hat:

| Was fehlte | Was Semaphore bietet |
|---|---|
| Alle brauchen die Werkzeuge lokal installiert | Ein Server (oder ein Runner) hat sie; Benutzer brauchen nur einen Browser. |
| Zugangsdaten werden zwischen Laptops kopiert | Verschlüsselter [Key Store](/user-guide/key-store), der Secrets an den Lauf übergibt, nie an den Benutzer. |
| Kein Nachweis, wer was ausgeführt hat | Jeder [Task](/user-guide/tasks) bewahrt Ausgabe, Exit-Status, Benutzer und Zeitpunkt auf. |
| Niemand sollte Root brauchen, um ein Playbook auszuführen | [Rollen](/user-guide/team) legen fest, wer ausführen, bearbeiten oder nur zusehen darf. |
| Läufe finden statt, wenn jemand daran denkt | [Zeitpläne](/user-guide/schedules), [Webhooks](/user-guide/integrations) und API-Aufrufe starten sie. |

## Für wen es gedacht ist {#who-it-is-for}

- **Infrastruktur- und Plattformteams**, die bereits Ansible oder Terraform einsetzen und
  möchten, dass Kolleginnen und Kollegen es ausführen können, ohne Produktionszugangsdaten
  zu erhalten.
- **Teams, die CI/CD-Pipelines erstellen** und Build-, Test- und Deployment-Tasks
  mithilfe von Workflows verbinden sowie geplante und bedarfsgesteuerte Betriebsjobs
  ausführen möchten.
- **Teams mit einer CI/CD-Plattform**, die betriebliche Läufe — Neustarts, Deployments,
  Zertifikatserneuerungen — aus dem Build-System heraushalten und für Personen sichtbar
  machen möchten, die kein Pipeline-YAML lesen.

Semaphore wird selbst gehostet. Es gibt keine SaaS-Variante: Sie betreiben die Binärdatei
oder den Container auf Ihrer eigenen Infrastruktur, und Ihre Secrets verlassen sie nie.

## Was es ausführt {#what-it-runs}

Jedes [Task Template](/user-guide/task-templates) wählt eine Anwendung aus:

- [Ansible](/user-guide/apps/ansible) — Playbooks mit Inventories, Vault-Passwörtern und
  dem vollständigen Optionsumfang von `ansible-playbook`.
- [Terraform, OpenTofu und Terragrunt](/user-guide/apps/terraform) — Plan und Apply mit
  Workspaces und State in Ihrem Backend.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) und
  [Python](/user-guide/apps/python) — alles, was die obigen nicht abdecken.

Tasks laufen auf dem Server selbst oder auf [Runnern](/admin-guide/runners), die nahe an
den verwalteten Systemen platziert sind.

[Workflows](/user-guide/workflows) (Pro) verbinden Task Templates über einen visuellen
Editor zu einer Pipeline. Jeder Schritt kann eine andere Anwendung ausführen: etwa
Quellcode mit Shell-Skripten bauen und testen, Infrastruktur mit Terraform bereitstellen
und anschließend mit Ansible deployen. Sie können Freigabeschritte, zeitgesteuerte Pausen
und Verzweigungen bei Erfolg oder Fehler hinzufügen. Semaphore startet nachfolgende
Tasks automatisch, sobald deren Bedingungen erfüllt sind.

## Wann Sie es nicht einsetzen sollten {#when-not-to-use-it}

Die Grenzen zu kennen spart später Zeit.

- **Ansible oder Terraform ersetzen.** Semaphore hat keine eigene Ausführungs-Engine. Wenn
  Ihr Playbook nicht aus einer Shell heraus funktioniert, funktioniert es auch aus
  Semaphore heraus nicht.
- **Als CMDB dienen.** [Inventories](/user-guide/inventory) sind die Inventories, die Ihre
  Läufe benötigen, keine verlässliche Quelle über Ihren gesamten Bestand. Erzeugen Sie sie
  mit einem dynamischen Inventory aus Ihrer tatsächlichen Quelle.
- **Der Secret-Manager Ihres Unternehmens sein.** Secrets werden verschlüsselt gespeichert
  und sind dafür gedacht, von Tasks verwendet und nicht von Menschen gelesen zu werden.
  Wenn Sie bereits HashiCorp Vault oder einen anderen Speicher betreiben,
  [binden Sie ihn an](/user-guide/key-store), statt Secrets zu kopieren.
- **Einen Einzelknoten-Dienst betreiben, bei dem keinerlei Ausfallzeit akzeptabel ist.**
  Mehrere aktive Knoten erfordern [Hochverfügbarkeit](/admin-guide/ha), eine
  Enterprise-Funktion, die PostgreSQL oder MySQL sowie Redis voraussetzt.

## Wie es weitergeht {#whats-next}

- [Architektur](/introduction/architecture) — die Prozesse, die Datenbank und wo Tasks ausgeführt werden.
- [Grundbegriffe](/introduction/concepts) — die zehn Wörter, die die Oberfläche voraussetzt.
- [Erste Schritte](/getting-started) — installieren und etwas ausführen.
