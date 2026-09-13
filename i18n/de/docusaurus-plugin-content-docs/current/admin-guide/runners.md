# Runner

Runner ermöglichen die Ausführung von Tasks auf einem von Semaphore UI getrennten Server.

Semaphore-Runner arbeiten nach demselben Prinzip wie GitLab- oder GitHub-Actions-Runner:

- Sie starten einen Runner auf einem separaten Server und geben dabei die Adresse des Semaphore-Servers und ein Authentifizierungs-Token an.
- Der Runner verbindet sich mit Semaphore und signalisiert seine Bereitschaft, Tasks anzunehmen.
- Wenn ein neuer Task erscheint, stellt Semaphore dem Runner alle nötigen Informationen bereit; dieser klont daraufhin das Repository und führt Ansible, Terraform, PowerShell usw. aus.
- Der Runner sendet die Ergebnisse der Task-Ausführung an Semaphore zurück.

Für Endbenutzer sieht die Arbeit mit Semaphore mit oder ohne Runner gleich aus.

Wenn keine Runner definiert sind, fungiert der Semaphore UI-Server selbst als Runner. Alle Tasks werden im Kontext des Semaphore UI-Servers ausgeführt und haben Zugriff auf dessen Dateisystem.

Die Verwendung von Runnern bietet folgende Vorteile:
- Sicherere Ausführung von Tasks. Ein Runner kann sich beispielsweise in einem geschlossenen Subnetz oder einem isolierten Docker-Container befinden.
- Verteilung der Arbeitslast auf mehrere Server. Sie können mehrere Runner starten; die Tasks werden dann zufällig auf sie verteilt.

## Einrichtung {#set-up}

### Server einrichten {#set-up-a-server}

Um den Server für die Arbeit mit Runnern einzurichten, fügen Sie folgende Option zur Konfiguration Ihres Semaphore-Servers hinzu:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

oder über Umgebungsvariablen:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Runner einrichten {#setup-a-runner}

Verwenden Sie zum Einrichten des Runners folgenden Befehl:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

Dieser Befehl erstellt eine Konfigurationsdatei unter `/path/to/your/config/file.json`.

Bevor Sie diesen Befehl verwenden, sollten Sie jedoch verstehen, wie Runner auf dem Server registriert werden.

### Runner auf dem Server registrieren {#registering-the-runner-on-the-server}

Es gibt zwei Möglichkeiten, einen Runner auf dem Semaphore-Server zu registrieren:
1) Über die Weboberfläche oder die API hinzufügen.
2) Über die Kommandozeile mit dem Befehl `semaphore runner register`.

#### Runner über die Weboberfläche hinzufügen {#adding-the-runner-via-the-web-ui}

![Runner-Abbildung](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Registrierung über die CLI {#registering-via-cli}

Um einen Runner auf diese Weise zu registrieren, müssen Sie die Option `runner_registration_token` zur Konfigurationsdatei Ihres Semaphore-Servers hinzufügen. Diese Option sollte auf eine beliebige Zeichenkette gesetzt werden. Wählen Sie eine ausreichend komplexe Zeichenkette, um Sicherheitsprobleme zu vermeiden.

Wenn der Befehl `semaphore runner setup` fragt, ob Sie ein Runner-Token haben, antworten Sie mit Nein. Registrieren Sie den Runner anschließend mit folgendem Befehl:

`semaphore runner register --config /path/to/your/config/file.json`

oder

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Konfigurationsdatei {#configuration-file}

Durch Ausführen des Befehls `semaphore runner setup` wird eine Konfigurationsdatei wie die folgende erstellt:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

Sie können diese Datei manuell bearbeiten, ohne `semaphore runner setup` erneut aufrufen zu müssen.

Um den Runner erneut zu registrieren, können Sie den Befehl `semaphore runner register` verwenden. Dadurch wird das Token in der in der Konfiguration angegebenen Datei überschrieben.

## Runner starten {#running-the-runner}

Nun können Sie den Runner mit folgendem Befehl starten:

```
semaphore runner start --config /path/to/your/config/file.json
```

Ihr Runner ist bereit, Tasks auszuführen.

### Runner in Docker ausführen {#running-the-runner-in-docker}

Das Image `semaphoreui/runner` startet den Runner automatisch. Übergeben Sie die Server-URL und das Registrierungs-Token über Umgebungsvariablen:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Wenn Ihre Playbooks zusätzliche Python-Pakete benötigen, mounten Sie eine `requirements.txt` unter `/etc/semaphore/requirements.txt`. Der Container installiert sie bei jedem Start mit `pip3`, bevor sich der Runner mit dem Server verbindet:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

Einzelheiten dazu, wo Pakete installiert werden und wie Fehler behandelt werden, finden Sie unter [Zusätzliche Python-Abhängigkeiten installieren](/admin-guide/installation/docker#installing-additional-python-dependencies).

### Abfrageintervall (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Jeder Runner fragt den Semaphore-Server in einem festen Intervall nach neuen Jobs ab und
meldet den Task-Fortschritt. Konfigurieren Sie es in der Konfigurationsdatei des Runners:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

Oder über eine Umgebungsvariable:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Wert | Auswirkung |
|-------|--------|
| **1** (Standard) | Jobs werden innerhalb von etwa einer Sekunde aufgenommen; am besten für Läufe mit geringer Latenz. |
| **Höher** (z. B. 5–30) | Reduziert den HTTP-Verkehr, wenn Sie viele Runner gegen einen Server betreiben. Jobs starten möglicherweise etwas später. |

Die Runner-Seite in Semaphore UI zeigt diese Einstellung unter **Erweiterte Optionen** an, wenn
Setup-Snippets (Konfigurationsdatei, Docker und Beispiele für Umgebungsvariablen) generiert werden.

Ungültige Werte oder der Wert Null fallen auf den Standardwert von 1 Sekunde zurück.

### Runner-Tags (Pro) {#runner-tags-pro}

Sie können einem Projekt-Runner ein oder mehrere Tags zuweisen. Vorlagen können dann ein Tag verlangen, sodass Tasks nur auf passenden Runnern ausgeführt werden. Konfigurieren Sie Tags beim Hinzufügen eines Runners in der Projektoberfläche und legen Sie das erforderliche Tag in den Vorlageneinstellungen fest.

## Runner abmelden {#runner-deregistration}

Sie können einen Runner über die Weboberfläche entfernen.

![Runner-Abbildung](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

Oder melden Sie den Runner über die CLI ab:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Sicherheit {#security}

Runner authentifizieren sich gegenüber dem Server mit einem opaken Bearer-Token
(`X-Runner-Token`), das bei der Registrierung ausgestellt wird. Schützen Sie dieses Token wie jede andere
Zugangsinformation – bewahren Sie es in einer zugriffsbeschränkten Konfigurationsdatei oder einem Secret-Manager auf.

:::warning
Verwenden Sie HTTPS für die Kommunikation zwischen Server und Runner, insbesondere wenn
sie sich nicht im selben privaten Netzwerk befinden. Konfigurieren Sie für selbstsignierte oder interne CA-Zertifikate
`runner.connection.server_ca_cert_file` auf dem Runner.
Verwenden Sie `runner.connection.skip_tls_verify` nicht in der Produktion.
:::
