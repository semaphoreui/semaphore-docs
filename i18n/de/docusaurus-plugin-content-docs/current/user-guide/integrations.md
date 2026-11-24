# Integrationen

Eine Integration startet eine Aufgabenvorlage, wenn ein externer Dienst eine Semaphore-URL aufruft. Der Aufrufer kann GitHub, GitLab, Bitbucket, ein Monitoring-System oder jedes Programm sein, das eine HTTP-Anfrage senden kann. Die Anfrage löst nicht nur den Lauf aus: Teile davon — ein Branch-Name, ein Commit, ein Release-Tag — können als Variablen in die Aufgabe übernommen werden.

![Liste der Integrationen](/assets/integrations-list.webp)

Jede Integration besteht aus vier Teilen:

| Teil | Beantwortet die Frage |
|---|---|
| **Alias** | Welche URL ruft der Absender auf? |
| **Auth-Methode** | Darf diese Anfrage überhaupt etwas starten? |
| **Matcher** | Ist *diese* Anfrage die, auf die die Integration wartet? |
| **Wert-Extraktoren** | Welche Felder der Anfrage erreichen die Aufgabe, und als was? |

Zum Anlegen öffnen Sie **Integrations** im Projektmenü und klicken auf **New Integration**: Vergeben Sie einen Namen, wählen Sie die Aufgabenvorlage, die gestartet wird, und die Authentifizierungsmethode. Klicken Sie anschließend in der Liste auf die Integration, um ihren Alias, ihre Matcher und ihre Wert-Extraktoren zu konfigurieren.

![Details einer Integration](/assets/integration-detail.webp)

## Ablauf eines Aufrufs {#how-a-call-is-handled}

1. Der Absender ruft `/api/integrations/<alias>` mit `GET` oder `POST` auf.
2. Semaphore löst den Alias zu den Integrationen auf, die er starten darf. Der Endpunkt ist öffentlich — nur der Alias und die Authentifizierungsmethode schützen ihn.
3. Jede dieser Integrationen prüft die Anfrage mit ihrer eigenen **Auth-Methode**. Eine Anfrage, die daran scheitert, startet nichts.
4. Kam der Aufruf über einen **Projekt-Alias**, werden die **Matcher** der Integration ausgewertet. Alle müssen zutreffen, sonst wird die Integration übersprungen.
5. Die **Wert-Extraktoren** laufen und machen aus Teilen der Anfrage Variablen und Aufgabenparameter.
6. Die Aufgabe wird erzeugt und eingereiht — genau so, als hätte jemand die Vorlage von Hand gestartet.

Ein verarbeiteter Aufruf erhält `204 No Content` mit leerem Body, unabhängig davon, ob etwas gestartet wurde. Was gestartet wurde, steht in den Antwort-Headern:

| Antwort-Header | Wert |
|---|---|
| `X-Semaphore-Task-ID` | Die erzeugte Aufgabe |
| `X-Semaphore-Template-ID` | Die Vorlage, die sie ausführt |
| `X-Semaphore-Project-ID` | Das Projekt, zu dem die Aufgabe gehört |
| `X-Semaphore-Integration-ID` | Die Integration, die sie gestartet hat |
| `X-Semaphore-Inventory-ID` | Das Inventar der Aufgabe, sofern vorhanden |

Jeder Aufruf eines bekannten Alias wird außerdem in die [Aufrufhistorie](#call-history) geschrieben — dort schaut man nach, wenn ein Webhook nicht das tut, was er soll.

## Aliasse {#aliases}

Ein Alias ist der zufällige, nicht erratbare Teil der Webhook-URL: `/api/integrations/<random_string>`. Er akzeptiert `GET` und `POST`. Es gibt zwei Arten, und eine Integration nutzt immer nur eine davon.

Ein **Projekt-Alias** wird mit **Add Alias** über der Integrationsliste erzeugt und von allen Integrationen des Projekts gemeinsam genutzt, bei denen der Schalter **Use project alias** eingeschaltet ist. Eine eingehende Anfrage wird allen angeboten, und jede entscheidet über ihre Matcher, ob sie läuft. Diesen Alias gibt man GitHub oder GitLab einmal und verteilt die Ereignisse danach über Matcher.

Ein **Integrations-Alias** wird mit **Add Alias** auf der Seite der Integration selbst erzeugt und gehört nur dieser einen. Ein Aufruf startet die Integration sofort — **Matcher werden gar nicht ausgewertet**. Nutzen Sie ihn, wenn der Absender nur eine Aufgabe hat oder wenn der Body in einem Format vorliegt, das Matcher nicht untersuchen können.

:::warning
Der Schalter **Use project alias** auf der Integrationsseite entscheidet, welche Art Alias funktioniert. Solange er an ist, antwortet die Integration auf den Projekt-Alias und ihre eigenen Aliasse werden ignoriert; solange er aus ist, erreicht der Projekt-Alias die Integration nie, und ihre Matcher kommen nie zum Einsatz.
:::

Ein Projekt darf mehrere Aliasse beider Arten haben. Löschen Sie einen über das Papierkorb-Symbol daneben, hört er sofort auf zu funktionieren, während die bereits empfangenen Aufrufe in der Historie bleiben.

## Authentifizierung {#authentication}

Der Webhook-Endpunkt liegt nicht hinter einer Anmeldung, also hält die Auth-Methode Fremde davon ab, Ihre Aufgaben zu starten. Wählen Sie sie im Integrationsformular; **Auth secret** ist ein Schlüssel aus dem [Schlüsselspeicher](/user-guide/key-store).

| Auth-Methode | Was Semaphore prüft | Auth secret |
|---|---|---|
| **None** | Nichts — wer die URL kennt, kann die Vorlage starten | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` entspricht `sha256=` plus HMAC-SHA256 des Bodys | Zeichenkette oder das Passwort eines Login/Passwort-Schlüssels |
| **Bitbucket Webhooks** | `X-Hub-Signature` auf dieselbe Weise | Zeichenkette oder das Passwort eines Login/Passwort-Schlüssels |
| **Token** | Der in **Auth header** genannte Header entspricht dem Geheimnis | Zeichenkette oder das Passwort eines Login/Passwort-Schlüssels |
| **HMAC** | Der in **Auth header** genannte Header enthält den HMAC-SHA256 des Bodys | Zeichenkette oder das Passwort eines Login/Passwort-Schlüssels |
| **HMAC (SHA-512)** | Dasselbe mit HMAC-SHA512 | Zeichenkette oder das Passwort eines Login/Passwort-Schlüssels |
| **BasicAuth** | Der Header `Authorization` trägt Login *und* Passwort | Nur ein Login/Passwort-Schlüssel |

Ein Schlüssel vom Typ **Zeichenkette** nutzt seinen Wert als gemeinsames Geheimnis; ein Login/Passwort-Schlüssel nutzt sein Passwort, und nur BasicAuth vergleicht zusätzlich den Login. Ein Schlüssel eines Typs, den die Methode nicht verwenden kann, führt zur Ablehnung der Anfrage, statt die Diskrepanz zu übergehen.

### HMAC-Authentifizierung {#hmac-authentication}

Die HMAC-Authentifizierungsmethoden (`hmac` / SHA-256 und `hmac-sha512` / SHA-512) prüfen, ob der Webhook-Body mit einem gemeinsamen Geheimnis signiert wurde.

Konfigurieren Sie:

1. **Auth header** — den Anfrage-Header, der die Signatur enthält (zum Beispiel `X-Signature` oder `X-Hub-Signature-256`).
2. **Auth secret** — einen Schlüssel vom Typ **Zeichenkette** aus dem Schlüsselspeicher (sein Wert ist das Geheimnis) oder einen Login/Passwort-Zugang (sein **Passwort** ist das Geheimnis).

Der Absender muss einen **reinen hexadezimalen** HMAC-Digest des unveränderten Anfrage-Bodys in diesen Header schreiben (ohne Präfix `sha256=` / `sha512=`; die Methoden GitHub und Bitbucket erwarten dieses Präfix dagegen, die HMAC-Methoden nicht). Semaphore vergleicht ihn mit dem `HMAC-SHA256`- oder `HMAC-SHA512`-Wert des Bodys, der mit dem konfigurierten Geheimnis berechnet wurde.

Beispiel (SHA-512) mit OpenSSL:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Matcher {#matchers}

Ein Matcher ist eine Bedingung an die eingehende Anfrage: *dieser Header ist gleich jenem Wert*, *dieses JSON-Feld enthält jene Zeichenfolge*. Matcher sind der Grund, warum ein Projekt-Alias viele Integrationen bedienen kann: GitHub schickt jedes Ereignis an dieselbe URL, und die Matcher entscheiden, welche Integration auf welches Ereignis reagiert.

Ein Matcher entscheidet nur, ob die Integration läuft. Er verändert die Aufgabe nie — dafür gibt es die Extraktoren.

Matcher werden **nur für Aufrufe ausgewertet, die über einen Projekt-Alias eintreffen** (Schalter **Use project alias** an). Ein Aufruf des eigenen Alias einer Integration startet sie, ohne sie anzusehen.

### Felder eines Matchers {#matcher-fields}

| Feld | Bedeutung |
|---|---|
| **Name** | Eine Bezeichnung für die Liste. Freier Text, am Vergleich nicht beteiligt |
| **Match on** | **Body** oder **Header** — woher der Wert kommt |
| **Body Data Format** | **JSON** oder **String**, nur bei **Body** sichtbar |
| **Key** | Der Header-Name oder der Pfad zu einem Feld im JSON-Body |
| **Comparison Method** | `==`, `!=` oder **Contains** |
| **Value** | Der Text, mit dem der Wert aus der Anfrage verglichen wird |

**Match on: Header** — **Key** ist ein Header-Name, und die Groß-/Kleinschreibung spielt keine Rolle: `X-GitHub-Event` und `x-github-event` sind derselbe Header. Ein Header, den die Anfrage nicht mitbringt, verhält sich wie ein fehlender Wert (siehe unten). Kommt ein Header mehrfach vor, wird nur der erste Wert verglichen.

**Match on: Body, JSON** — **Key** ist ein Pfad in den geparsten Body, beschrieben im nächsten Abschnitt. Ein Body, der kein gültiges JSON ist, liefert für jeden Key einen fehlenden Wert.

**Match on: Body, String** — der gesamte unveränderte Body ist der Wert, und **Key** wird ignoriert. Das Formular verlangt trotzdem einen Key, weil das Feld erforderlich ist; schreiben Sie einen Bindestrich. Nur so lässt sich ein Body prüfen, der kein JSON ist — kombinieren Sie es mit **Contains**.

**Key** und **Value** sind beide Pflichtfelder, ein Matcher kann also nicht auf einen leeren Wert prüfen. Um auf ein fehlendes Feld zu reagieren, vergleichen Sie es mit `!=` gegen einen Wert, den es nie hat.

### JSON-Keys {#json-keys}

Ein Key ist ein Pfad durch das JSON-Dokument. Ebenen werden mit Punkten getrennt, ein Array-Element wird über seinen Index in eckigen Klammern angesprochen, beginnend bei null. Bei Namen zählt die Groß-/Kleinschreibung.

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| Key | Zeigt auf |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | Das ganze Array |
| `repository.url` | Nichts — das Feld existiert nicht |

Dieselbe Syntax nutzt das Feld **Key** eines Wert-Extraktors.

### Wie ein Matcher Werte vergleicht {#how-a-matcher-compares-values}

Der Wert aus der Anfrage wird in Text umgewandelt und als Text mit **Value** verglichen; **Value** braucht daher weder Anführungszeichen noch Klammern noch Escapes.

- **Zeichenketten** werden wörtlich verglichen, und zwar unter Beachtung der Groß-/Kleinschreibung: `Push` passt nicht auf `push`.
- **Zahlen** werden ohne Dezimalteil verglichen, wenn sie keinen haben: `42` im Body passt auf den Wert `42`, nicht auf `42.0`. Eine gebrochene Zahl wird wie geschrieben verglichen, `1.5` passt also auf `1.5`.
- **Wahrheitswerte** passen auf `true` und `false`.
- **Ein fehlender Wert** — ein nicht vorhandener Header, ein JSON-Pfad, der nicht existiert, ein `null` oder ein Body, der kein gültiges JSON ist — wird als wörtlicher Text `<nil>` verglichen. Daraus folgt etwas Wichtiges: `==` kann auf ein fehlendes Feld nie passen, und `!=` passt immer darauf.
- **Objekte und Arrays** haben keine lesbare Textform; vergleichen Sie sie nicht. Richten Sie den Key stattdessen auf ein skalares Feld darin.
- **Contains** ist ein einfacher Teilstring-Test mit Beachtung der Groß-/Kleinschreibung, ohne Platzhalter und ohne reguläre Ausdrücke.

### Mehrere Matcher {#several-matchers}

Eine Integration darf beliebig viele Matcher haben, und sie werden mit **UND** verknüpft: Die Integration läuft nur, wenn jeder einzelne zutrifft. Ein *oder* lässt sich innerhalb einer Integration nicht ausdrücken — legen Sie für die Alternative eine zweite Integration auf derselben Vorlage an.

:::warning
Eine Integration, die den Projekt-Alias nutzt und **keine Matcher** hat, startet nie, denn es gibt nichts, was zutreffen könnte. Geben Sie ihr mindestens einen Matcher, oder schalten Sie **Use project alias** aus und rufen Sie den eigenen Alias der Integration auf.
:::

### Beispiele für Matcher {#matcher-examples}

| Ziel | Match on | Format | Key | Methode | Value |
|---|---|---|---|---|---|
| Nur GitHub-Pushes | Header | — | `X-GitHub-Event` | `==` | `push` |
| Nur Pushes auf `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| Jeder Branch außer `main` | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| Nur Tags | Body | JSON | `ref` | Contains | `refs/tags/` |
| Nur gemergte GitLab-Merge-Requests | Body | JSON | `object_attributes.state` | `==` | `merged` |
| Commits eines Bots ignorieren | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| Nur veröffentlichte GitHub-Releases | Body | JSON | `action` | `==` | `published` |
| Eine Text-Warnung, die eine Platte erwähnt | Body | String | `-` | Contains | `disk` |

Die ersten beiden Zeilen zusammen sind die übliche Konfiguration einer Deploy-Integration: der Ereignistyp aus dem Header und der Branch aus dem Body, und beides muss zutreffen.

## Wert-Extraktoren {#value-extractors}

Ein Wert-Extraktor kopiert ein Stück der eingehenden Anfrage in die Aufgabe, die gleich startet. So übergibt ein Webhook der ausgelösten Automatisierung einen Branch, einen Commit-Hash, einen Autor oder eine Release-Version.

Extraktoren laufen immer, über welche Art Alias der Aufruf auch kam, und zwar nachdem Authentifizierung und Matcher bestanden sind.

### Felder eines Extraktors {#extractor-fields}

| Feld | Bedeutung |
|---|---|
| **Name** | Eine Bezeichnung für die Liste. Freier Text |
| **Source of the Value** | **Body** oder **Header** |
| **Data Type of Body** | **JSON** oder **String**, nur bei **Body** sichtbar |
| **Key** | Der Header-Name oder ein [JSON-Key](#json-keys) — dieselbe Syntax wie bei Matchern |
| **Variable Usage** | **Variables** oder **Task Params** — wohin der Wert geliefert wird |
| **Variable** | Der Name, den der Wert in der Aufgabe bekommt |

Bei **Body** und **String** wird der gesamte unveränderte Body zum Wert und **Key** ignoriert, genau wie bei einem Matcher.

### Was die Variable erhält {#what-the-variable-receives}

Anders als ein Matcher wandelt ein Extraktor nichts in Text um: Ein JSON-Wert behält seinen Typ, eine Zahl bleibt also eine Zahl und ein Objekt ein Objekt.

| Was in der Anfrage steht | Was die Variable bekommt |
|---|---|
| Ein Header | Seinen Text; eine leere Zeichenkette, wenn der Header fehlt |
| Eine JSON-Zeichenkette, -Zahl oder ein Wahrheitswert | Denselben Wert samt Typ |
| Ein JSON-Objekt oder -Array | Das ganze Objekt oder Array mit erhaltener Struktur |
| Ein JSON-`null`, ein Pfad, der nicht existiert, oder ein Body, der kein gültiges JSON ist | Nichts — die Variable wird **überhaupt nicht gesetzt**, und was die Vorlage definiert, bleibt erhalten |
| Der Body als **String** | Der gesamte unveränderte Body als Text |

Der Unterschied zwischen „leer“ und „nicht gesetzt“ zählt: Ein fehlender Header gibt der Aufgabe eine leere Zeichenkette, ein fehlendes JSON-Feld lässt den eigenen Wert der Vorlage unberührt.

### Variable Usage: Variables {#variable-usage-variables}

Der Wert kommt zu den Variablen der Aufgabe — derselbe Satz, den das Feld **Variables** im Dialog „Neue Aufgabe“ füllt. Semaphore übergibt sie dem Werkzeug als zusätzliche Variablen (`--extra-vars` bei Ansible, `-var` bei Terraform), und sie überschreiben einen gleichnamigen Schlüssel aus der [Variablengruppe](/user-guide/environment) der Vorlage.

Benennen Sie die Variable genau wie eine [Survey-Variable](/user-guide/task-templates/survey-vars) der Vorlage, dann füllt der Webhook diese Survey-Variable, statt dass jemand sie eintippt.

### Variable Usage: Task Params {#variable-usage-task-params}

Task Params sind die eingebauten [Prompts](/user-guide/task-templates/prompts) der Vorlage, keine Variablen für das Playbook. Der extrahierte Wert wird unverändert durchgegeben, sein JSON-Typ muss also der erwartete sein — `true`, nicht `"true"`.

| Variable | Gilt für | Erwartet |
|---|---|---|
| `git_branch` | Jede App | Den auszucheckenden Branch. Ein führendes `refs/heads/` wird entfernt, GitHubs `ref` kann also unverändert verwendet werden |
| `limit`, `tags`, `skip_tags` | Ansible | Eine Liste von Zeichenketten |
| `debug`, `dry_run`, `diff` | Ansible | `true` oder `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` oder `false` |

Die Vorlage muss das Überschreiben erlauben, damit der Wert wirkt: **Allow override branch in task** für `git_branch` und der passende Prompt für `limit`, `tags` und `skip_tags`. Ohne diese Erlaubnis wird der Wert verworfen, und die Aufgabe läuft mit der Einstellung der Vorlage.

### Beispiel für Extraktoren: GitHub-Push {#extractor-example-github-push}

Ein GitHub-Push-Webhook sendet einen Body, der so beginnt:

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

Vier Extraktoren machen daraus eine vollständig beschriebene Aufgabe:

| Name | Source | Format | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

Die Aufgabe checkt dann `main` aus (das Präfix `refs/heads/` wird für Sie entfernt) und läuft mit den Variablen `COMMIT`, `AUTHOR` und `EVENT`, die dem Playbook zur Verfügung stehen. Um zu sehen, was ein echter Aufruf wirklich geliefert hat, öffnen Sie ihn im Tab History und halten seinen Body neben Ihre Keys.

## Voreingestellte Aufgabenparameter {#task-parameters}

Sobald im Integrationsformular eine Vorlage gewählt ist, erscheinen deren eigene Aufgabenoptionen: eine Meldung, ihre Survey-Variablen, das Inventar, der Git-Branch, wenn die Vorlage das Überschreiben erlaubt, und die Prompts der App. Was Sie dort setzen, ist die Vorgabe für jede Aufgabe dieser Integration; Werte, die sich nie ändern — ein Inventar, eine feste Meldung — gehören daher hierhin und nicht in einen Extraktor.

Extraktoren werden darüber gelegt: Eine Variable oder ein Aufgabenparameter aus einem Extraktor ersetzt den gleichnamigen voreingestellten Wert, und die Voreinstellung bleibt, wenn der Extraktor nichts findet.

## Workflow-Integrationen <FeatureState feature="workflows" /> {#workflow-integrations}

Eine Integration kann anstelle einer einzelnen Vorlage einen [Workflow](/user-guide/workflows) starten. Stellen Sie **Runs** im Integrationsformular auf **Workflow** und wählen Sie den Workflow.

Extraktoren funktionieren gleich, mit einem Unterschied: **Variable Usage** wird ignoriert, und jeder extrahierte Wert wird als Antwort auf das Survey des Workflows unter dem Namen aus **Variable** geliefert. Der Workflow prüft diese Antworten und gibt sie über ihre Bindungen an seine Knoten weiter; ein Wert, an den kein Knoten gebunden ist, erreicht also keine Aufgabe. Ein erfolgreicher Aufruf meldet zusätzlich zu den Aufgaben-Headern `X-Semaphore-Workflow-ID` und `X-Semaphore-Workflow-Run-ID`.

## Aufrufhistorie {#call-history}

Der Tab **History** der Integrationsseite listet jeden Aufruf, den das Projekt über einen seiner Aliasse erhalten hat, der neueste zuerst. Sie überlebt den Alias, die Integration und die gestartete Aufgabe, weil sie pro Projekt und nicht pro Integration geführt wird.

| Spalte | Zeigt |
|---|---|
| **Time** | Wann der Aufruf eintraf |
| **Integration** | Die Integration, die ihn bearbeitet hat, darunter den Alias — ein Klick darauf filtert die Liste |
| **Source IP** | Die Adresse, von der der Aufruf kam |
| **Method** | `GET` oder `POST` |
| **Status** | Was die Integration mit dem Aufruf getan hat, und warum |
| **Task** | Die gestartete Aufgabe oder den Workflow-Lauf |
| **Duration** | Wie lange die Integration für den Aufruf brauchte |

Vier Status sind möglich:

| Status | Bedeutung |
|---|---|
| `ok` | Eine Aufgabe oder ein Workflow-Lauf ist gestartet |
| `unauthorized` | Die Anfrage hat die Auth-Methode der Integration nicht bestanden |
| `skipped` | Die Matcher trafen nicht zu, oder der Alias hat überhaupt keine Integration gestartet |
| `error` | Der Start wurde versucht und schlug fehl — die Vorlage war weg, das Survey hat die Werte abgelehnt |

Ein Klick auf eine Zeile öffnet den Aufruf samt Anfrage-Body wie empfangen (die ersten 64 KiB; war er länger, werden gespeicherte und ursprüngliche Größe angezeigt). Anfrage-**Header werden nie gespeichert**: Sie tragen die Signatur oder das Token, mit dem sich der Absender authentifiziert hat. Der Body eines Aufrufs, der die Authentifizierung nicht bestanden hat, wird ebenfalls nicht aufbewahrt — einen solchen kann jeder senden, der die URL kennt.

Filtern Sie die Liste mit den Bedienelementen über der Tabelle nach Integration und Alias, und blättern Sie mit den Pfeilen darunter. Die Historie hat keine Aufbewahrungsfrist — sie wächst, bis das Projekt gelöscht wird.

## Fehlersuche {#troubleshooting}

| Symptom | Was zu prüfen ist |
|---|---|
| In der History erscheint überhaupt keine Zeile | Der Alias in der URL ist falsch oder gelöscht. Ein Aufruf des eigenen Alias einer Integration bei eingeschaltetem **Use project alias** wird ebenfalls nirgends aufgezeichnet |
| `unauthorized` | Den Namen des Auth-Headers, den Schlüssel im Schlüsselspeicher und ob der Absender die Signatur mit dem Präfix `sha256=` sendet, das die Methode erwartet. GitHub und Bitbucket nutzen unabhängig von **Auth header** ihre eigenen Header |
| `skipped`, Grund *No integration matched the alias* | Der Alias existiert, aber bei keiner Integration des Projekts ist **Use project alias** eingeschaltet |
| `skipped`, Grund *No matcher matched the request* | Öffnen Sie den Aufruf und halten Sie seinen Body neben Ihre Matcher. Denken Sie daran, dass ein fehlendes Feld nie auf `==` passt, dass bei Keys die Groß-/Kleinschreibung zählt und dass **Contains** keine Platzhalter kennt. Eine Integration ganz ohne Matcher wird aus demselben Grund übersprungen |
| Die Aufgabe läuft, aber eine Variable ist leer oder fehlt | Der JSON-Key passt nicht zum Payload (öffnen Sie den Aufruf und sehen Sie sich den Body an), der Wert war `null`, oder der Name in **Variable** weicht von der Survey-Variable ab, die gefüllt werden soll |
| Der Branch wird nicht überschrieben | Die Vorlage braucht **Allow override branch in task**, und der Extraktor muss in den Aufgabenparameter `git_branch` schreiben |
| Ein Aufruf startet mehrere Aufgaben | Mehrere Integrationen nutzen den Projekt-Alias und ihre Matcher treffen alle zu. Fassen Sie die Matcher enger, oder geben Sie den Integrationen eigene Aliasse |
