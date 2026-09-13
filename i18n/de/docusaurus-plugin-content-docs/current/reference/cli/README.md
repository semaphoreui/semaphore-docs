# CLI

Die Binärdatei `semaphore` ist sowohl der Server als auch ein vollständiges
Administrationswerkzeug. Führen Sie sie ohne Argumente (oder mit `semaphore help`)
aus, um alle Befehle aufzulisten:

```bash
semaphore help
```

Die vollständige, generierte Liste aller Befehle und Optionen finden Sie in der
[Befehlsreferenz](/reference/cli/commands). Für die meisten administrativen Aufgaben
gibt es eine eigene Befehlsgruppe:

| Befehlsgruppe | Zweck |
|---------------|-------|
| [`semaphore users`](/reference/cli/users) | Benutzer hinzufügen, ändern, entfernen und anzeigen; API-Tokens und TOTP (2FA) verwalten. |
| [`semaphore projects`](/reference/cli/projects) | Projekte exportieren und importieren (Backups). |
| [`semaphore vaults`](/reference/cli/vaults) | Gespeicherte Geheimnisse neu verschlüsseln und die Verwendung der Verschlüsselungsschlüssel prüfen. |
| [`semaphore runner`](/reference/cli/runners) | Im Runner-Modus laufen sowie Runner registrieren/abmelden. |
| [`semaphore migrate`](/reference/cli/migrations) | Datenbankmigrationen anwenden oder zurückrollen. |

Mehrere Befehlsgruppen haben kürzere Aliasse: `users`/`user`, `projects`/`project`,
`vaults`/`vault` und `server`/`service`.

:::info
Jeder Befehl, der auf die Datenbank zugreift (`users`, `projects`, `vaults`, `migrate`,
`server`), wendet vor der Ausführung alle ausstehenden Schemamigrationen an. Erstellen
Sie ein Datenbank-Backup, bevor Sie die CLI einer neueren Semaphore-Version gegen eine
bestehende Datenbank ausführen.
:::

## Globale Optionen {#global-options}

Diese Flags werden von jedem Befehl akzeptiert:

| Option | Beschreibung |
|--------|--------------|
| `--config <path>` | Pfad zur Konfigurationsdatei. |
| `--no-config` | Keine Konfigurationsdatei lesen — nur Umgebungsvariablen verwenden. |
| `--log-level <level>` | Ausführlichkeit der Logs: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` oder `PANIC`. Fällt auf die Umgebungsvariable `SEMAPHORE_LOG_LEVEL` zurück. |
| `--debug-filter <spec>` | Beschränkt die `DEBUG`-Ausgabe auf bestimmte Namespaces, z. B. `'runner,task_*'` oder `'*,-db'`. Wirkt nur, wenn der Log-Level `DEBUG` ist. Fällt auf `SEMAPHORE_DEBUG_FILTER` zurück. |

### Wie die Konfigurationsdatei gefunden wird {#how-the-configuration-file-is-found}

Wenn `--config` weggelassen wird, sucht Semaphore die Datei in dieser Reihenfolge und
verwendet die erste, die existiert:

1. Der Pfad in der Umgebungsvariable `SEMAPHORE_CONFIG_PATH`.
2. `config.json`, `config.yaml` oder `config.yml` im aktuellen Verzeichnis.
3. `/usr/local/etc/semaphore/config.json` (oder `.yaml` / `.yml`).
4. `/etc/semaphore/config.json` (oder `.yaml` / `.yml`).

Umgebungsvariablen werden zusätzlich zur Datei angewendet und überschreiben daher
deren Werte. Mit `--no-config` werden nur Umgebungsvariablen und Standardwerte
verwendet. Die vollständige Optionsliste finden Sie unter
[Konfiguration](/admin-guide/configuration).

## Version {#version}

Gibt die aktuelle Version aus.

```bash
semaphore version
```

## Interaktive Einrichtung {#interactive-setup}

Verwenden Sie dies für die Erstkonfiguration. Der Befehl erzeugt Geheimnisse, führt
durch einen interaktiven Fragebogen, schreibt die Konfigurationsdatei, führt die
Datenbankmigrationen aus und legt den ersten Admin-Benutzer an.

```bash
semaphore setup
```

Übergeben Sie `--config <path>`, um festzulegen, wohin die Konfigurationsdatei
geschrieben wird. Ohne diese Angabe fragt das Setup nach einem Ausgabeverzeichnis
(Standard: das aktuelle Verzeichnis) und schreibt dort `config.json`.

Wenn der eingegebene Benutzername oder die E-Mail-Adresse bereits existiert, behält
das Setup den vorhandenen Benutzer bei, anstatt einen neuen anzulegen.

Nach Abschluss gibt es die Befehle zum Starten des Servers aus, zum Beispiel:

```bash
./semaphore server --config /path/to/config.json
```

## Server-Modus {#server-mode}

Startet den Semaphore-Server (Weboberfläche und API). `service` ist ein Alias für `server`.

```bash
semaphore server --config /path/to/config.json
```

Der Server wendet beim Start ausstehende Datenbankmigrationen an und gibt die
verwendete Datenbank, den temporären Pfad, die Schnittstelle und den Port aus.

## Runner-Modus {#runner-mode}

Führt Semaphore als Task-Runner aus. Unter [Runner](/reference/cli/runners) finden
Sie alle Unterbefehle (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/runner-config.json
```

## Datenbankmigration {#database-migration}

Bringt das Datenbankschema auf den aktuellen Stand. Unter
[Datenbankmigrationen](/reference/cli/migrations) erfahren Sie, wie Sie Migrationen
bis zu einer bestimmten Version anwenden oder zurückrollen.

```bash
semaphore migrate --config /path/to/config.json
```
