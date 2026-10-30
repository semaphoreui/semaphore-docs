---
title: Client
description: Einen Semaphore-Server mit semaphore client vom Terminal und aus Skripten verwalten - Anmeldung und Kontexte, Vorrang der Konfiguration, Ausgabeformate, Exit-Codes und das Ausführen von Aufgaben aus CI.
---

# Client

`semaphore client` steuert einen laufenden Semaphore-Server über dessen REST-API. Er
benötigt nur eine Server-URL und ein API-Token — keinen Datenbankzugriff und keine
Konfigurationsdatei des Servers —, daher funktioniert er auf einem Laptop, in einem
CI-Job oder auf einem Host, der die `config.json` des Servers nie gesehen hat.

```bash
semaphore client --help
```

Befehle haben die Form `semaphore client <resource> <action> [id|name]`.
Ressourcen werden im Singular benannt, der Plural ist ein Alias
(`template list` und `templates list` sind dasselbe). Jede Ressource hat `list`,
`get`, `create`, `update` und `delete`; Aufgaben ergänzen `run`, `logs`, `wait`, `stop`
und Ähnliches. Die vollständige, generierte Liste aller Befehle und Flags steht in der
[Befehlsreferenz](/reference/cli/commands#semaphore-client).

| Gruppe | Zweck |
|--------|-------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Anmelden, das Token prüfen, es ausgeben, abmelden. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Mehrere Server in einer Konfigurationsdatei halten und zwischen ihnen wechseln. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Projekte, ihre Mitglieder, Backups und Wiederherstellungen. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Aufgabenvorlagen und `template run` zum Starten einer Aufgabe. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Protokolle, Warten, Stoppen, Bestätigen und erneutes Ausführen von Aufgaben. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | Die übrigen Ressourcen eines Projekts. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Serverweite Ressourcen (nur für Administratoren). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Serverversion und Einstellungen. |

## Erste Anmeldung {#first-login}

Interaktiv: Der Client fragt nach dem Login, dem Passwort und, wenn TOTP
aktiviert ist, nach dem Code, erstellt dann ein API-Token und speichert es. Das
Passwort wird einmal verwendet und nie gespeichert.

```bash
semaphore client auth login --url https://semaphore.example.com
```

Mit einem vorhandenen Token (so meldet man sich auch an einem Server an, der nur
Single Sign-On anbietet — erstellen Sie das Token auf der Seite **Tokens** Ihres Profils):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Beide Varianten speichern einen *Kontext*, benannt nach dem Server-Host, in
`~/.semaphore/client.yml` und machen ihn zum aktuellen. Was gerade verwendet wird,
zeigt `semaphore client auth status`.

## Konfiguration {#configuration}

Jede Einstellung kann aus einem Flag, einer Umgebungsvariablen oder dem aktuellen
Kontext stammen, in dieser Rangfolge: **Flag > Umgebung > Kontext > Standardwert**.

| Flag | Umgebungsvariable | Bedeutung |
|------|-------------------|-----------|
| `--url` | `SEMAPHORE_CLIENT_URL` | Server-URL, zum Beispiel `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Name des Kontexts, der anstelle des aktuellen verwendet wird. |
| — | `SEMAPHORE_CLIENT_TOKEN` | API-Token. Ein Flag `--token` gibt es bewusst nicht: Prozessargumente sind in `ps` und im Shell-Verlauf sichtbar. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | Datei mit dem Token (ein abschließender Zeilenumbruch wird ignoriert). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | Projekt-ID oder -Name für projektbezogene Befehle. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (Standard), `json` oder `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Zeitlimit einer einzelnen HTTP-Anfrage, Standard `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | PEM-Datei mit der CA, die das Serverzertifikat signiert hat. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | TLS-Prüfung überspringen. Jeder Aufruf gibt eine Warnung aus; verwenden Sie besser `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | Nie nachfragen; ein Befehl, der eine Antwort bräuchte, schlägt stattdessen fehl. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | HTTP-Anfragen nach stderr protokollieren. Authorization- und Cookie-Header werden maskiert. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Pfad der Konfigurationsdatei, Standard `~/.semaphore/client.yml`. |

Ein Token aus der Umgebung wird nur verwendet, wenn auch die URL aus der Umgebung
oder aus einem Flag stammt. So wird ein CI-Token nicht an einen anderen Server
gesendet, wenn jemand denselben Job mit `--context other` ausführt.

### Die Konfigurationsdatei {#the-configuration-file}

`~/.semaphore/client.yml` enthält benannte Kontexte. `auth login` und `context set`
schreiben sie; Sie können sie auch von Hand bearbeiten.

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # oder token_file
    project: 3                # Standardprojekt, ID oder Name
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

Der Client legt das Verzeichnis mit dem Modus `0700` und die Datei mit `0600` an.
Eine Datei, die für die Gruppe oder für andere beschreibbar ist, wird mit dem Hinweis
abgelehnt, `chmod 600` auszuführen; eine für andere lesbare Datei erzeugt eine Warnung.

## Ausgabe {#output}

Daten gehen nach stdout; Meldungen, Warnungen und Fortschrittsanzeigen nach stderr,
sodass ein Skript das eine ohne das andere erfassen kann.

| Flag | Wirkung |
|------|---------|
| `-o json` | Gültiges JSON ohne Ausschmückung. Eine Liste ist immer ein Array, eine leere Liste ist `[]`. Die Feldnamen sind die der API. |
| `-o yaml` | Dieselben Daten als YAML. |
| `--fields id,name,status` | Nur diese Spalten oder Felder. Verschachtelte Felder werden mit Punkt angegeben: `--fields id,params.limit`. |
| `-q`, `--quiet` | Nur IDs, eine pro Zeile — für `xargs` und Schleifen. |
| `--no-headers` | Tabelle ohne Kopfzeile. |
| `--no-color` | Keine Farben. Farben sind auch aus, wenn stdout kein Terminal ist oder `NO_COLOR` gesetzt ist. |

Wenn stdout kein Terminal ist, werden Tabellenspalten durch einen Tabulator getrennt
und nie gekürzt.

Objekte werden über ihre numerische ID oder ihren Namen angesprochen. Ein Name wird
im Projekt ohne Beachtung der Groß-/Kleinschreibung gesucht; teilen sich mehrere
Objekte denselben Namen, endet der Befehl mit Code 5 und listet die Kandidaten auf stderr auf.

## Exit-Codes {#exit-codes}

| Code | Bedeutung |
|------|-----------|
| `0` | Erfolg. Bei einem wartenden Befehl: Die Aufgabe wurde mit `success` beendet. |
| `1` | Client- oder API-Fehler — Netzwerkausfall, Serverfehler, unerwartete Antwort. |
| `2` | Bedienungsfehler: unbekanntes Flag, fehlendes Argument, kein Projekt angegeben oder eine nötige Bestätigung ohne Terminal (übergeben Sie `--yes`). |
| `3` | Die erwartete Aufgabe endete mit dem Status `error`. |
| `4` | Authentifizierung fehlgeschlagen (HTTP 401 oder 403). |
| `5` | Objekt nicht gefunden oder ein Name, der auf mehrere Objekte passt. |
| `6` | Die erwartete Aufgabe endete mit dem Status `stopped`. |
| `124` | `--wait-timeout` ist abgelaufen. Die Aufgabe läuft auf dem Server weiter. |
| `130` | Mit Strg+C unterbrochen. Der Client trennt die Verbindung; die Aufgabe läuft weiter, sofern nicht `--stop-on-interrupt` angegeben wurde. |

## Aufgaben aus Skripten ausführen {#running-tasks-from-scripts}

Konfigurieren Sie einen CI-Job vollständig über die Umgebung und lassen Sie den
Exit-Code über das Ergebnis entscheiden:

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Aufgabe starten, ihr Protokoll streamen, je nach Endstatus mit 0/3/6 beenden
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Jetzt starten, später warten
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` und `--extra-vars-file` füllen die zusätzlichen Variablen der Aufgabe;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` und `--diff` überschreiben,
was die Vorlage zu überschreiben erlaubt.

Eine Aufgabe kann auf halbem Weg anhalten und auf eine Freigabe warten: ein
Terraform-Plan vor dem Anwenden oder jede Vorlage, deren Anwendung zuerst
nachfragt. In einem Terminal gibt der Client `Apply task <id>? [yes/no]` aus und
schickt die Antwort an den Server. Ohne Terminal meldet er den Halt auf stderr
und wartet weiter; ein CI-Job braucht daher `task confirm <id>` oder
`task reject <id>` von anderer Stelle, `--auto-approve`, sofern die Vorlage es
zulässt, oder `--wait-timeout`, um aufzugeben. Für eine Pipeline, die an keinem
Tor stehen bleiben soll, lehnt `--auto-reject` eine solche Aufgabe ab, sobald
sie fragt. Eine abgelehnte Aufgabe endet als `error`, also mit Exit-Code 3.

Kombinieren Sie `-o json` mit `jq` für alles, was die Tabelle nicht zeigt:

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Geheimnisse und Tokens {#secrets-and-tokens}

- Das Token wird nie ausgegeben, außer von `auth token`, das dazu da ist, es an ein
  anderes Werkzeug weiterzureichen, und warnt, wenn stdout ein Terminal ist.
- Passwörter und Schlüsselmaterial werden nur aus Dateien oder von stdin gelesen:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. Geheimnisse der Umgebung laufen über
  `environment create --secrets-file`.
- `environment get` und `key get` zeigen in jedem Ausgabeformat die Namen der
  Geheimnisse, nie deren Werte.
- `auth logout --revoke` löscht das Token sowohl auf dem Server als auch lokal.
- Destruktive Befehle fragen in einem Terminal nach einer Bestätigung und verlangen
  ohne Terminal `--yes`; `project delete` verlangt den Projektnamen mit `--confirm`.
