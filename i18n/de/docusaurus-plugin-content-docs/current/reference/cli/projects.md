# Projekte

Der Befehl `semaphore projects` exportiert und importiert Projekte als Backup-Dateien.
Ein Backup ist ein einzelnes JSON-Dokument, das die Vorlagen, Inventories,
Repositories, Umgebungen, Schlüssel, Zeitpläne und zugehörigen Einstellungen eines
Projekts enthält.

```bash
semaphore projects --help
```

> `project` ist ein Alias für `projects`.

Er hat zwei Unterbefehle:

| Befehl | Zweck |
|--------|-------|
| [`projects export`](#exporting-a-project-projects-export) | Das Backup eines Projekts in eine Datei (oder auf stdout) schreiben. |
| [`projects import`](#importing-projects-projects-import) | Ein oder mehrere Projekte aus Backup-Dateien wiederherstellen. |

## Ein Projekt exportieren (`projects export`) {#exporting-a-project-projects-export}

Exportiert ein einzelnes Projekt, das entweder über seine numerische ID oder seinen
Namen angegeben wird.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| Flag | Beschreibung |
|------|--------------|
| `--project-id <id>` | ID des zu exportierenden Projekts. |
| `--project-name <name>` | Name des zu exportierenden Projekts (Groß-/Kleinschreibung wird ignoriert). |
| `--file <path>` | Backup in diese Datei schreiben. Ohne Angabe wird das Backup auf stdout ausgegeben. |

Genau eines von `--project-id` oder `--project-name` ist erforderlich — die Angabe
beider oder keines von beiden führt zu einem Fehler.

## Projekte importieren (`projects import`) {#importing-projects-projects-import}

Importiert ein oder mehrere Projekt-Backups. Sie können eine einzelne Datei oder alle
in einem Verzeichnis gefundenen Backups importieren. Jedes importierte Projekt wird
als **neues** Projekt angelegt, das einem vorhandenen Admin gehört (dem ersten Admin
in der Datenbank oder, falls kein Admin existiert, dem ersten Benutzer). Ein Import
überschreibt also niemals ein bestehendes Projekt.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| Flag | Beschreibung |
|------|--------------|
| `--file <path>` | Pfad zu einer einzelnen zu importierenden Backup-Datei. |
| `--dir <path>` | Verzeichnis, das nach Backup-Dateien durchsucht wird. Dateien mit den Endungen `.json`, `.backup` oder `.bk` werden in sortierter Reihenfolge importiert. |
| `--project-name <name>` | Namen des importierten Projekts überschreiben. Nur zusammen mit `--file` gültig. |

Genau eines von `--file` oder `--dir` ist erforderlich — die Angabe beider oder keines
von beiden führt zu einem Fehler. `--project-name` darf nur mit `--file` kombiniert
werden.

Beim Import eines Verzeichnisses werden Dateien, deren Import fehlschlägt, gemeldet
und übersprungen; der Befehl fährt mit den übrigen fort und beendet sich nur dann mit
einem Exit-Status ungleich null, wenn nichts importiert wurde.
