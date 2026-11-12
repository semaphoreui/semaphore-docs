---
title: KI-Agenten
description: Ein Template für einen Claude-Code- oder Codex-Agenten erstellen – Prompt und Prompt-Ausdrücke, API-Schlüssel, MCP-Server, CLI-Argumente und das Task-Log.
---

# KI-Agenten

Mit Semaphore UI können Sie KI-Coding-Agenten ausführen: [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) und [Codex](https://developers.openai.com/codex/cli). Ein Agenten-Template startet das Kommandozeilen-Werkzeug des Agenten in einem Verzeichnis eines Repositorys und übergibt ihm einen Prompt. Der Agent arbeitet selbstständig, ohne dass jemand seine Fragen beantwortet, und berichtet im Task-Log, was er tut.

Verwenden Sie ein Agenten-Template für Arbeit, die Sie sonst einem Kollegen beschreiben würden: den letzten Commit prüfen, einen fehlschlagenden Test finden und beheben, eine Abhängigkeit aktualisieren und einen Pull Request öffnen. Wie jedes andere Template kann es von Hand, durch einen [Zeitplan](/user-guide/schedules), eine [Integration](/user-guide/integrations) oder einen [Workflow](/user-guide/workflows) gestartet werden.

## Bevor Sie beginnen {#before-you-begin}

- **Das Kommandozeilen-Werkzeug des Agenten ist installiert**, und zwar auf dem Rechner, der die Tasks ausführt: dem Semaphore-Server oder dem [Runner](/admin-guide/runners).

  | Anwendung | ID | Befehl | Installation |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore aktiviert eine Anwendung, wenn es deren Befehl beim Start im `PATH` findet. Ein Administrator kann sie auch auf der Seite [Applications](/user-guide/apps#managing-applications) aktivieren und den Pfad zur ausführbaren Datei festlegen.
- **Ein API-Schlüssel** des Modellanbieters, siehe [API-Schlüssel](#api-key).
- **Ein Repository**, in dem der Agent arbeitet und das unter [Repositories](/user-guide/repositories) hinzugefügt wurde.

## Ein Template erstellen {#create-a-template}

1. Öffnen Sie den Bereich **Task-Templates**, klicken Sie auf **Neues Template** und dann auf **Claude Code Agent** oder **Codex Agent**.

![Das Menü Neues Template mit den Einträgen Claude Code Agent und Codex Agent](/assets/agent-template-new.webp)

2. Richten Sie das Template ein.

![Der Editor eines Claude-Code-Agent-Templates](/assets/agent-template-editor.webp)

Im Template können Sie die folgenden Parameter angeben:

| Feld | Beschreibung |
|---|---|
| **Repository** | Das Repository, in dem der Agent arbeitet. Semaphore klont oder aktualisiert es vor dem Task, wie bei jedem anderen Template. |
| **Subdirectory path** | Optional. Das Verzeichnis des Repositorys, in dem der Agent gestartet wird. Wird nichts angegeben, startet der Agent im Repository-Stammverzeichnis. |
| **MCP-Server** | Optional. Ein MCP-Inventory mit den Servern, deren Tools der Agent aufrufen kann, siehe [MCP-Server](#mcp-servers). |
| **Variablengruppen** | Variablen und Secrets für den Agenten: der API-Schlüssel, Werte für die [Prompt-Ausdrücke](#prompt-expressions), Umgebungsvariablen des Agentenprozesses. |
| **Prompt** | Die Anweisung, mit der der Agent läuft, siehe [Prompt](#prompt). |
| **CLI args** | Zusätzliche Argumente für den Befehl des Agenten, siehe [CLI-Argumente](#cli-arguments). |
| **Survey-Variablen** | Fragen, die beim Start des Tasks gestellt werden. Die Antworten können in den Prompt eingesetzt werden. |
| Kontrollkästchen **Prompt** | Unter **Claude Code prompts** oder **Codex prompts**. Erlaubt demjenigen, der einen Task startet, den Prompt zu ersetzen, siehe [Prompt eines Tasks](#prompt-of-a-task). |

3. Klicken Sie auf **Speichern** und führen Sie das Template dann mit der Schaltfläche **Ausführen** aus.

## API-Schlüssel {#api-key}

Der Agent liest seinen API-Schlüssel aus einer Umgebungsvariable. Fügen Sie den Schlüssel einer [Variablengruppe](/user-guide/environment) des Templates als **geheime Umgebungsvariable** hinzu:

| Anwendung | Variable | Ebenfalls akzeptiert |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

Die Anmeldung des Benutzers, unter dem Semaphore läuft, wird nicht verwendet: Jeder Task erhält ein eigenes, leeres Konfigurationsverzeichnis des Agenten, sodass ein Schlüssel aus einer Variablengruppe der einzige Weg zur Authentifizierung ist.

Ist keine der Variablen gesetzt, nennt das Task-Log diejenige, die hinzuzufügen ist, und der Agent selbst schlägt anschließend mit seinem eigenen Fehler fehl:

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## Prompt {#prompt}

Der Prompt ist das, was Sie dem Agenten eintippen würden: reiner Text, so lang wie nötig. Er wird dem Agenten über die Standardeingabe übergeben und erscheint daher nicht in der Prozessliste.

Der Prompt ist erforderlich, es sei denn, das Kontrollkästchen **Prompt** erlaubt einem Task, seinen eigenen mitzubringen.

### Prompt-Ausdrücke {#prompt-expressions}

Der Prompt eines Templates kann Werte aus den Variablengruppen des Templates übernehmen. Schreiben Sie einen Ausdruck in doppelten geschweiften Klammern, wie in GitHub Actions, und Semaphore ersetzt ihn beim Start des Tasks:

| Ausdruck | Wert |
|---|---|
| `${{ vars.extra.NAME }}` | Eine Extra-Variable einer Variablengruppe. |
| `${{ vars.env.NAME }}` | Eine Umgebungsvariable einer Variablengruppe. |
| `${{ secrets.extra.NAME }}` | Eine geheime Extra-Variable einer Variablengruppe. |
| `${{ secrets.env.NAME }}` | Eine geheime Umgebungsvariable einer Variablengruppe. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

Die Regeln:

- **Survey-Variablen** sind Extra-Variablen: Die Antwort auf die Survey-Variable `version` ist `${{ vars.extra.version }}`, eine geheime ist `${{ secrets.extra.NAME }}`. Eine Survey-Variable, die als Umgebungsvariable übergeben wird, steht stattdessen unter `env`. Eine unbeantwortete Survey-Variable ergibt eine leere Zeichenkette.
- **Eine nicht vorhandene Variable lässt den Task fehlschlagen**, bevor der Agent startet, mit einer Meldung, die den Ausdruck nennt. Semaphore führt keinen Agenten mit einer Lücke im Prompt aus.
- **Ein falsch geschriebener Ausdruck wird beim Speichern des Templates abgelehnt**: `${{ secrets.TOKEN }}` hat weder `extra` noch `env`.
- **Andere Ausdrücke bleiben unverändert.** Nur `vars.…` und `secrets.…` gehören Semaphore, sodass ein Prompt den Agenten bitten kann, einen Workflow zu schreiben, der `${{ github.sha }}` enthält. Um einen `vars`- oder `secrets`-Ausdruck als Text zu erhalten, stellen Sie ihm ein weiteres Dollarzeichen voran: `$${{ secrets.env.NAME }}`.
- **Ein Wert wird so eingesetzt, wie er ist.** Eine Zeichenkette wird wie geschrieben verwendet, eine Liste oder ein Objekt als JSON. Ein Wert wird nicht erneut nach Ausdrücken durchsucht.
- **Ein Secret, das in den Prompt eingesetzt wurde, wird im Task-Log maskiert**, wo immer der Agent es wiederholt.

:::warning

Ein Secret im Prompt wird zusammen mit dem übrigen Prompt an den Modellanbieter gesendet, und der Agent kann es auf jede Weise verwenden, die der Prompt zulässt. Geben Sie ein Secret besser den Tools des Agenten: als geheime Umgebungsvariable einer Variablengruppe oder als Token eines [MCP-Servers](#mcp-servers).

:::

### Prompt eines Tasks {#prompt-of-a-task}

Ist das Kontrollkästchen **Prompt** aktiviert, zeigt das Task-Formular den Prompt des Templates an und lässt Sie ihn für eine Ausführung ändern. Ein Zeitplan, eine Integration oder ein Workflow-Schritt kann auf dieselbe Weise einen eigenen Prompt haben. Über die API senden Sie ihn in den Task-Parametern:

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

Ein von einem Task übergebener Prompt wird genau so verwendet, wie er geschrieben ist: **Prompt-Ausdrücke werden nur in dem Prompt ersetzt, der im Template gespeichert ist**. So bleiben die Variablen und Secrets des Projekts für alle unerreichbar, die Tasks lediglich ausführen dürfen. Wenn das Template es nicht erlaubt, wird ein Task, der einen Prompt mitbringt, abgelehnt.

## MCP-Server {#mcp-servers}

Ein Agent kann die Tools entfernter [MCP](https://modelcontextprotocol.io)-Server aufrufen: eines Issue-Trackers, einer Dokumentationssuche, Ihres eigenen Dienstes. Die Server werden in einem Inventory vom Typ **MCP Inventory** abgelegt, und ein Inventory dient sowohl Claude-Code- als auch Codex-Templates.

1. Öffnen Sie den Bereich **Inventory**, klicken Sie auf **Neues Inventory** und dann auf **MCP Inventory**.
2. Fügen Sie die Server hinzu und klicken Sie auf **Speichern**.
3. Wählen Sie das Inventory im Feld **MCP-Server** des Templates aus.

![Das Formular eines MCP-Inventorys mit drei Servern](/assets/agent-mcp-inventory.webp)

| Feld | Beschreibung |
|---|---|
| Schalter | Ein ausgeschalteter Server bleibt in der Liste und wird dem Agenten nicht übergeben. |
| **Name** | Der Name, unter dem der Agent den Server kennt: bis zu 64 Buchstaben, Ziffern, `-` und `_`. Er wird im Task-Log vor dem Namen eines Tools angezeigt. |
| **URL** | Eine `http`- oder `https`-Adresse eines Servers, der MCP über HTTP oder SSE spricht. Ein Benutzername oder Passwort in der URL wird nicht akzeptiert. |
| **Token** | Optional. Der Agent sendet es im `Authorization`-Header als Bearer-Token. |

Ein gespeichertes Token wird verschlüsselt abgelegt und nie wieder angezeigt: Geben Sie ein neues ein, um es zu ersetzen, oder entfernen Sie es mit dem Kreuz. Das Token erreicht den Agenten als Umgebungsvariable seines Prozesses; es wird weder in die Konfigurationsdatei des Agenten noch in die Befehlszeile oder das Task-Log geschrieben.

Die Tools der ausgewählten Server sind im Voraus freigegeben, da niemand da ist, der einen Aufruf bestätigen könnte. Der Agent erhält genau diese Server: MCP-Server, die für den Benutzer konfiguriert sind, unter dem Semaphore läuft, werden nicht verwendet.

## CLI-Argumente {#cli-arguments}

**CLI args** werden an den Befehl des Agenten angehängt, nach den Argumenten, die Semaphore selbst setzt. Geben Sie jedes Token als eigenes Argument ein:

```json
["--model", "claude-sonnet-5-5"]
```

Verwenden Sie sie für das, was die Kommandozeile des Agenten selbst bietet: das Modell, die Limits, die Berechtigungen. Der Agent läuft unbeaufsichtigt, daher wird ein Tool, das um eine Bestätigung bitten würde, stattdessen abgelehnt; welche Tools ein Agent ohne Rückfrage verwenden darf, wird über seine Argumente festgelegt. Die Optionen Ihrer Version finden Sie in der [CLI-Referenz von Claude Code](https://docs.claude.com/en/docs/claude-code/cli-reference) und in der [CLI-Referenz von Codex](https://developers.openai.com/codex/cli/reference).

Ist **CLI args** unter **Prompts** aktiviert, kann ein Task eigene Argumente hinzufügen.

Variablen und Secrets der Variablengruppen werden nicht an die Befehlszeile eines Agenten angehängt, wo die Prozessliste sie zeigen würde. Umgebungsvariablen und geheime Umgebungsvariablen werden an den Prozess des Agenten übergeben.

## Wie der Agent läuft {#how-the-agent-runs}

Semaphore startet den Agenten im Repository-Verzeichnis oder in dessen **Subdirectory path**, mit dem Prompt auf der Standardeingabe:

| Anwendung | Befehl |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **Jeder Task hat sein eigenes Konfigurationsverzeichnis** des Agenten (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`), das für den Task angelegt und danach entfernt wird. Einstellungen, Anmeldungen und MCP-Server des Benutzers, unter dem Semaphore läuft, erreichen den Agenten nicht, und eine Variable einer Variablengruppe kann das Verzeichnis nicht umleiten.
- **Zwischen Tasks bleibt nichts erhalten**: Jede Ausführung ist eine neue Sitzung des Agenten. Was eine Ausführung überdauern soll, gehört ins Repository: ein Commit, ein Pull Request, eine Datei.
- **Der Agent liest die Anweisungsdateien des Repositorys**, die sein Kommandozeilen-Werkzeug von sich aus im Arbeitsverzeichnis liest, etwa `CLAUDE.md` oder `AGENTS.md`.
- **Auf Docker- und Kubernetes-Runnern** läuft der Agent in einem Container, daher muss das [Executor-Image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) den Befehl `claude` oder `codex` enthalten.

## Task-Log {#task-log}

Das Task-Log zeigt die Arbeit des Agenten, während sie geschieht:

![Das Log eines Claude-Code-Tasks: das Modell, Tool-Aufrufe, ein Subagent, die Zusammenfassung](/assets/agent-task-log.webp)

- **Text** des Agenten, Zeile für Zeile. Codex gibt eine Nachricht aus, sobald sie vollständig ist.
- **Tool-Aufrufe**, jeder in einer Zeile: der Status, der MCP-Server und das Tool, die Argumente. Klicken Sie auf eine Zeile, um die Argumente und das Ergebnis zu sehen. Ein fehlgeschlagener Aufruf ist von Anfang an aufgeklappt.
- **Subagenten**: Die Zeilen eines Subagenten sind mit seinem Namen gekennzeichnet.
- **Die erste Zeile** einer Claude-Code-Ausführung nennt das Modell und die MCP-Server; diejenigen, die keine Verbindung herstellen konnten, erscheinen in Rot.
- **Die Zusammenfassung** am Ende: die Anzahl der Turns, die Dauer, die Tokens und die Kosten, soweit der Agent sie meldet.

**Raw log** zeigt dasselbe Log als reinen Text.

## Sicherheit {#security}

- **Ein Agent führt Befehle aus.** Im Rahmen der Berechtigungen, die ihm sein Kommandozeilen-Werkzeug gibt, kann der Agent das Repository-Verzeichnis lesen und ändern, Programme als der Benutzer ausführen, der die Tasks ausführt, und die Tools seiner MCP-Server aufrufen. Geben Sie einem Agenten-Template den Zugriff, den Sie einem von jemand anderem geschriebenen Skript geben würden: ein Repository und Tokens mit den engsten Rechten, die für die Aufgabe genügen, und einen separaten [Runner](/admin-guide/runners) für Arbeit, die Sie vom Server getrennt halten möchten.
- **Der Prompt und alles, was der Agent liest, gehen an den Modellanbieter**: die Dateien des Repositorys, die Ausgabe von Befehlen, die Ergebnisse von Tools.
- **Ein Repository kann dem Agenten Anweisungen geben.** Text in den Dateien, die der Agent liest, in einem Issue oder im Ergebnis eines Tools kann verändern, was der Agent tut. Richten Sie einen Agenten mit mächtigen Tokens nicht auf Inhalte, die Sie nicht kontrollieren.
- **Tokens und Secrets werden im Task-Log maskiert**: Die Tokens der MCP-Server und die in den Prompt eingesetzten Secrets werden durch `********` ersetzt.
- **Nur der im Template gespeicherte Prompt kann Variablen und Secrets verwenden**, siehe [Prompt eines Tasks](#prompt-of-a-task).
