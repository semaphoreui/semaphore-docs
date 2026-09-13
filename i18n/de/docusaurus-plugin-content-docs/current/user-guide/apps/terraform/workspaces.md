
# Workspaces

![Workspaces-Tab einer Vorlage](/assets/template-workspaces.webp)

Semaphore bietet integrierte Unterstützung für Terraform-Workspaces, mit denen Sie mehrere Umgebungen und Konfigurationen innerhalb eines einzigen Projekts verwalten können. Diese Funktion hilft Ihnen, separate State-Dateien für verschiedene Umgebungen wie Entwicklung, Staging und Produktion zu pflegen.

## Funktionen {#features}

- **Workspace-Verwaltung**: Erstellen, wechseln und löschen Sie Workspaces direkt in der Semaphore UI.
- **State-Isolation**: Jeder Workspace verwaltet seine eigene State-Datei und verhindert so Konflikte zwischen Umgebungen.
- **Umgebungsvariablen**: Konfigurieren Sie Workspace-spezifische Umgebungsvariablen.
- **Workspace-Auswahl**: Wählen Sie den Ziel-Workspace beim Ausführen von Terraform-Befehlen.

## Verwendung von Workspaces in Semaphore {#using-workspaces-in-semaphore}

### Einen Workspace erstellen {#creating-a-workspace}

Führen Sie im Bereich **Workspaces** der Terraform/OpenTofu-Vorlage, zu der Sie einen Workspace hinzufügen möchten, die folgenden Schritte aus:

1. Klicken Sie auf die Schaltfläche ➕.  
2. Wählen Sie im angezeigten Menü **Neuer Workspace**.  
3. Geben Sie im Dialogfenster den Namen des Workspace ein und wählen Sie den SSH-Schlüssel aus, der zum Klonen von Modulen verwendet werden soll.  
4. Klicken Sie auf die Schaltfläche **Erstellen**, um den neuen Workspace zur Vorlage hinzuzufügen.  
5. Sie können diesen Workspace jetzt zum Ausführen von Aufgaben verwenden.


### Workspaces wechseln {#switching-workspaces}

Sie können den Standard-Workspace für eine Terraform/OpenTofu-Vorlage festlegen, indem Sie auf die Schaltfläche **ALS STANDARD FESTLEGEN** klicken.


### Workspace-spezifische Variablen {#workspace-specific-variables}

Semaphore unterstützt derzeit keine Workspace-spezifischen Variablen.
