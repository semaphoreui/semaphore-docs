---
title: Benutzerhandbuch
description: "Für Techniker, die innerhalb eines Semaphore-Projekts arbeiten: Ressourcen, Task Templates, Tasks, Zeitpläne und Teamzugriff."
---

# Benutzerhandbuch

Dieser Bereich richtet sich an Personen, die bereits Zugriff auf ein
Semaphore-Projekt haben. Alles hier geschieht in der Weboberfläche oder über die
Projekt-API. Die Installation des Servers, seine Konfiguration und die Anbindung
eines Identity Providers behandelt das
[Administrationshandbuch](/admin-guide).

Die Arbeit in Semaphore folgt einer einzigen Kette. Ein **Projekt** enthält alles
Weitere. Darin registrieren Sie die Ressourcen, die eine Ausführung benötigt: ein
**Repository** mit Ihren Playbooks oder Skripten, die **Schlüssel**, mit denen Sie
es und Ihre Hosts erreichen, ein **Inventory** der Zielmaschinen und
**Variablengruppen** mit Werten und Geheimnissen. Ein **Task Template** verbindet
all das zu einer Definition dessen, was ausgeführt wird, und jede Ausführung dieses
Task Template ist ein **Task**. Zeitpläne, Workflows und eingehende Webhooks
starten Task Templates für Sie.

## Ein Projekt einrichten {#set-up-a-project}

In dieser Reihenfolge, weil jeder Schritt auf dem vorherigen aufbaut.

| Seite | Inhalt |
|---|---|
| [Projekte](/user-guide/projects) | Ein Projekt erstellen, die Bereiche in der Seitenleiste, Sicherung und Wiederherstellung. |
| [Teams](/user-guide/team) | Die vier eingebauten Rollen und benutzerdefinierte Rollen in Enterprise. |
| [Key Store](/user-guide/key-store) | SSH-Schlüssel, Logins und externe Secret-Speicher. |
| [Repositories](/user-guide/repositories) | Git-Repositories und lokale Pfade, die Ihre Automatisierung enthalten. |
| [Inventory](/user-guide/inventory) | Hosts und Verbindungseinstellungen für Ansible, Workspaces für Terraform. |
| [Variablengruppen](/user-guide/environment) | Wiederverwendbare Variablen und Geheimnisse, die an Tasks übergeben werden. |

## Arbeit definieren und ausführen {#define-and-run-work}

| Seite | Inhalt |
|---|---|
| [Task Templates](/user-guide/task-templates) | Jedes Feld des Formulars sowie die Typen von Task Templates. |
| [Apps](/user-guide/apps) | Was die einzelnen Anwendungen ausführen: Ansible, Terraform, OpenTofu, Terragrunt und Skripte. |
| [Tasks](/user-guide/tasks) | Einen Task starten, Task-Status, Protokolle, Stoppen und erneutes Ausführen. |
| [Zeitpläne](/user-guide/schedules) | Task Templates nach einem Cron-Zeitplan ausführen. |
| [Workflows](/user-guide/workflows) | Task Templates mit Freigaben und Verzweigungen verketten. |
| [Integrationen](/user-guide/integrations) | Tasks über eingehende Webhooks starten. |
| [Projekt-Runner](/user-guide/projects/runners) | Die Tasks eines Projekts an eigene Runner senden. |
| [Ihr Konto](/user-guide/account) | Persönliche Einstellungen und API-Token. |

## Womit Sie beginnen {#where-to-start}

Wenn Sie gerade zu einem Projekt hinzugefügt wurden, lesen Sie
[Projekte](/user-guide/projects), um sich zurechtzufinden, und danach
[Tasks](/user-guide/tasks), um einen Task auszuführen und sein Protokoll zu lesen.
Wenn Sie ein Projekt von Grund auf einrichten, folgen Sie der Tabelle oben der Reihe nach.

Ganz neu bei Semaphore? Beginnen Sie mit [Erste Schritte](/getting-started).
