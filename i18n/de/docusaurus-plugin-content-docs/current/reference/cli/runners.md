# Runner

Der Befehl `semaphore runner` führt Semaphore im **Runner-Modus** aus und verwaltet
die Registrierung eines Runners beim Server. Ein Runner führt Aufgaben auf einer vom
Semaphore-Server getrennten Maschine aus.

```bash
semaphore runner --help
```

:::tip
Wie Runner funktionieren und wie Sie die Serverseite konfigurieren, erfahren Sie im
Handbuch [Runner](/admin-guide/runners).
:::

Wird `semaphore runner` ohne Unterbefehl ausgeführt, gibt es lediglich die Hilfe aus.
Es gibt folgende Unterbefehle:

| Befehl | Zweck |
|--------|-------|
| [`runner setup`](#interactive-setup-runner-setup) | Interaktiv eine Runner-Konfigurationsdatei erstellen (und registrieren, falls ein Token angegeben wird). |
| [`runner register`](#registering-a-runner-runner-register) | Den Runner mit einem Registrierungstoken beim Server registrieren. |
| [`runner start`](#starting-a-runner-runner-start) | Im Runner-Modus laufen und Aufgaben annehmen. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Die Registrierung des Runners vom Server entfernen. |

Alle Unterbefehle akzeptieren das globale Flag `--config <path>`, das auf die
Runner-Konfigurationsdatei verweist (sowie `--no-config`, um ausschließlich mit
Umgebungsvariablen zu arbeiten).

## Interaktive Einrichtung (`runner setup`) {#interactive-setup-runner-setup}

Führt durch eine interaktive Einrichtung, schreibt eine Runner-Konfigurationsdatei und
registriert den Runner sofort beim Server, falls ein Registrierungstoken verfügbar ist
(während der Abfragen eingegeben oder über `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`
gesetzt).

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Übergeben Sie `--config <path>`, um festzulegen, wohin die Konfigurationsdatei
geschrieben wird. Ohne diese Angabe fragt das Setup nach einem Ausgabeverzeichnis
(Standard: das aktuelle Verzeichnis) und schreibt dort `config.runner.json`.

Nach Abschluss gibt es die Befehle zum Starten des Runners aus, zum Beispiel:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

Sie können die erzeugte Konfigurationsdatei anschließend von Hand bearbeiten, anstatt
das Setup erneut auszuführen.

### Runner-Konfigurationsoptionen {#runner-configuration-options}

Felder im Block `runner` der Konfigurationsdatei:

| Feld | Umgebungsvariable | Beschreibung |
|------|-------------------|--------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Authentifizierungstoken des Runners (wird bei der Registrierung ausgestellt). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Registrierungstoken. Nur als Umgebungsvariable; wird nie in die Datei geschrieben. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Pfad zu einer Datei, die das Registrierungstoken enthält. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Name des Runners, wie er auf dem Server angezeigt wird. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | JSON-Array von Tags für das Runner-Routing pro Projekt. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL, die der Server aufruft, wenn eine Aufgabe für diesen Runner in die Warteschlange gestellt wird. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Ob der Runner Aufgaben annimmt. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | Projekt-ID für einen projektbezogenen Runner. Für einen globalen Runner weglassen. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Abfrageintervall in Sekunden. Standard: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Maximale Anzahl gleichzeitiger Aufgaben. Standard: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Nach der Verarbeitung eines Jobs beenden. Nützlich für Runner, die bei Bedarf per Webhook gestartet werden. |

Details zur Einrichtung finden Sie unter [Runner](/admin-guide/runners), die
vollständige Optionsliste unter [Konfiguration](/admin-guide/configuration).

## Einen Runner registrieren (`runner register`) {#registering-a-runner-runner-register}

Registriert den Runner beim Server und speichert das ausgestellte Runner-Token in der
Konfigurationsdatei (ein vorhandenes Token wird überschrieben). Auf dem Server muss ein
`runner_registration_token` konfiguriert sein; dasselbe Token übergeben Sie hier.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Flag | Beschreibung |
|------|--------------|
| `--registration-token-file <path>` | Registrierungstoken aus einer Datei lesen. |
| `--stdin-registration-token` | Registrierungstoken von stdin lesen. |
| `--name <name>` | Name, unter dem der Runner registriert wird. |
| `--tags <tags>` | Runner-Tags, kommagetrennt oder durch Wiederholen des Flags (z. B. `--tags a,b` oder `--tags a --tags b`). |
| `--webhook <url>` | Webhook-URL des Runners. |
| `--enabled` | Runner auf dem Server aktivieren oder deaktivieren. Standard ist `true`; übergeben Sie `--enabled=false`, um einen deaktivierten Runner zu registrieren. |
| `--project-id <id>` | Als projektbezogenen Runner für das angegebene Projekt registrieren. Ohne Angabe (oder mit `0`) wird der Runner als globaler Runner registriert. |

Nur die tatsächlich übergebenen Flags werden angewendet; `--name`, `--webhook`,
`--tags` und `--enabled` überschreiben die entsprechenden Werte aus
Konfigurationsdatei und Umgebung nur, wenn sie auf der Befehlszeile gesetzt sind.

### Woher das Registrierungstoken stammt {#where-the-registration-token-comes-from}

Bei der Registrierung ermittelt Semaphore das Registrierungstoken aus der ersten
verfügbaren Quelle in dieser Reihenfolge:

1. Das Flag `--registration-token-file`.
2. Die Einstellung `registration_token_file` in der Konfigurationsdatei (oder
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. Die Standardeingabe, wenn `--stdin-registration-token` übergeben wird.
4. Die Umgebungsvariable `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`.

Eine vorhandene, aber leere Token-Datei führt zu einem Fehler. Liefert keine Quelle
ein Token, wird die Registrierung ohne Token versucht und vom Server abgelehnt.

## Einen Runner starten (`runner start`) {#starting-a-runner-runner-start}

Startet den Runner, verbindet sich mit dem Server und beginnt, Aufgaben anzunehmen.
Mit diesem Befehl halten Sie einen registrierten Runner online.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Flag | Beschreibung |
|------|--------------|
| `--auto-register` | Runner vor dem Start registrieren, falls er noch nicht registriert ist (d. h. die Konfiguration enthält kein Runner-Token). |
| `--register` | Alias für `--auto-register`. |

Mit `--auto-register` liest Semaphore, falls die Konfiguration kein `token` enthält,
das Registrierungstoken aus `registration_token_file` (oder
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) oder aus
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, wiederholt die Registrierung dann alle 5
Sekunden, bis sie erfolgreich ist, lädt die Konfiguration neu und startet. Das ist
praktisch für Runner, die sich beim ersten Start selbst registrieren, zum Beispiel in
Containern.

`runner start` akzeptiert weder `--registration-token-file` noch
`--stdin-registration-token`; diese Flags gehören ausschließlich zu `runner register`.

## Einen Runner abmelden (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Entfernt die Registrierung des Runners vom Server, wobei das Runner-Token aus der
Konfigurationsdatei verwendet wird.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
