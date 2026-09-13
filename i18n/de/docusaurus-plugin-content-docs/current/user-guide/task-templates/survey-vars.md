# Survey-Variablen

Survey-Variablen sind eigene Eingabefelder, die Sie zu Task-Templates hinzufügen können, um beim Ausführen von Tasks Benutzereingaben zu erfassen. Statt Werte fest in Ihren Playbooks oder Skripten zu hinterlegen, können Sie eigene Variablen definieren, die Benutzer zur Laufzeit nach Werten fragen.

Diese Funktion ist nützlich für:
- Das Ausführen desselben Templates mit unterschiedlichen Parametern (z. B. Konfigurationswerten)
- Die Annahme dynamischer Eingaben über API-Aufrufe
- Die Übergabe eigener Parameter in geplanten Tasks
- Das Auslösen von Tasks aus Integrationen mit aus Webhooks extrahierten Daten

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## Survey-Variablen vs. Prompts {#survey-variables-vs-prompts}

Es ist wichtig, den Unterschied zwischen Survey-Variablen und Prompts zu verstehen:

| Merkmal | Survey-Variablen | Prompts |
|---------|-----------------|---------|
| **Definition** | Eigene Felder, die Sie erstellen | Vordefinierte, Template-spezifische Optionen |
| **Beispiele** | Umgebungsname, Versionsnummer, API-Endpunkt | Ansible: `--limit`, `--tags`<br/>Terraform: Workspaces |
| **Konfiguration** | Hinzufügen in den Template-Einstellungen mit Name und Typ | Aktivierung über Kontrollkästchen im Template |
| **Übergabe als** | Ansible: `--extra-vars`<br/>Terraform: `-var` | Integrierte CLI-Flags |

**Survey-Variablen** sind flexible, selbst definierte Felder, während **Prompts** integrierte Optionen sind, die für den jeweiligen Template-Typ spezifisch sind (wie die Flags `--limit` oder `--tags` von Ansible).

## Survey-Variablen zu einem Template hinzufügen {#adding-survey-variables-to-a-template}

Survey-Variablen werden in den Template-Einstellungen konfiguriert:

1. Gehen Sie zu **Task-Templates** und wählen Sie Ihr Template aus
2. Navigieren Sie in den Template-Einstellungen zum Abschnitt **Survey-Variablen**
3. Klicken Sie auf **Survey-Variable hinzufügen**
4. Konfigurieren Sie die Variable:
   - **Name**: Variablenname (wird in Ihrem Code verwendet)
   - **Titel**: Anzeigebezeichnung im Formular
   - **Typ**: Wählen Sie den Feldtyp
   - **Variable übergeben als**: Extra-Variable (Standard) oder Umgebungsvariable
   - **Standardwert**: Optionaler vorausgefüllter Wert, der beim Öffnen des Task-Formulars angezeigt wird
   - **Erforderlich**: Ob das Feld ausgefüllt werden muss
5. Speichern Sie das Template

Wenn Benutzer einen Task aus diesem Template ausführen, sehen sie ein Formular mit Ihren eigenen Survey-Variablen.

## Variablentypen {#variable-types}

Survey-Variablen unterstützen sechs Typen:

### String {#string}

Texteingabefeld für Zeichenkettenwerte.

**Anwendungsfälle**: Umgebungsnamen, Branch-Namen, Hostnamen, Dateipfade

**Beispiel**: Eine Variable namens `environment` fordert Benutzer auf, „production“, „staging“ oder „development“ einzugeben

### Integer {#integer}

Numerisches Eingabefeld für Ganzzahlwerte.

**Anwendungsfälle**: Portnummern, Anzahl der Wiederholungen, Timeouts, Ressourcenlimits

**Beispiel**: Eine Variable namens `timeout_seconds` fordert Benutzer auf, „300“ oder „600“ einzugeben

### Text {#text}

Mehrzeiliges Textfeld für längere Zeichenkettenwerte.

**Anwendungsfälle**: Commit-Nachrichten, JSON-Schnipsel, Freitextnotizen, mehrzeilige Konfiguration

**Beispiel**: Eine Variable namens `changelog`, in die Benutzer vor dem Deployment die Release Notes einfügen

### Enum (Einfachauswahl) {#enum-single-select}

Dropdown-Menü, in dem der Benutzer genau eine Option aus einer vordefinierten Liste auswählt.

**Anwendungsfälle**: Umgebungstyp, Deployment-Strategie, boolesche Auswahlmöglichkeiten

**Beispiel**: Eine Variable namens `deployment_type` mit den Optionen „rolling“, „blue-green“, „canary“

Beim Erstellen einer Enum-Variable fügen Sie im Variableneditor jede Option mit Anzeigebezeichnung und Wert hinzu.

### Select (Mehrfachauswahl) {#select-multi-select}

Dropdown, in dem der Benutzer eine oder mehrere Optionen aus einer vordefinierten Liste auswählen kann. Die ausgewählten Werte werden als JSON-Array übergeben (zum Beispiel `["staging","production"]`), nicht als einzelne Zeichenkette.

**Anwendungsfälle**: Zielregionen, Feature-Flags, mehrere Hostgruppen, Tag-Listen

**Beispiel**: Eine Variable namens `target_regions` mit den Optionen `us-east-1`, `eu-west-1`, `ap-southeast-1`

**Einschränkungen**:
- Standardwerte müssen aus der Optionsliste gewählt werden und können mehrere Auswahlen enthalten
- In Bash-, PowerShell- und Python-Templates müssen Sie das JSON-Array aus dem Argument- oder Umgebungswert parsen (siehe Beispiele unten)

### Secret {#secret}

Passwort-Eingabefeld, in dem der Wert verborgen wird.

**Anwendungsfälle**: API-Schlüssel, Passwörter, Tokens, sensible Konfiguration

**Beispiel**: Eine Variable namens `api_token`, bei der der eingegebene Wert aus Sicherheitsgründen als Punkte angezeigt wird

## Standardwerte {#default-values}

Für die meisten Variablentypen können Sie einen optionalen Standardwert festlegen. Wenn ein Benutzer den Dialog zum Ausführen eines Tasks öffnet, sind die Felder mit diesen Standardwerten vorausgefüllt.

- **String, Integer, Text, Secret**: ein einzelner Standardwert
- **Enum**: eine Option aus der Liste
- **Select**: eine oder mehrere Optionen aus der Liste

Standardwerte sind nützlich für Zeitpläne und Integrationen, bei denen dasselbe Template wiederholt mit vorhersehbaren Parametern ausgeführt wird. Benutzer können die Werte vor dem Start eines Tasks weiterhin ändern.

## Variable übergeben als (Ziel) {#pass-variable-as-target}

Jede Survey-Variable kann auf eine von zwei Arten übergeben werden:

| Einstellung | Verhalten |
|---------|----------|
| **Extra-Variable** (Standard) | Übergabe auf die für die App übliche Weise: Ansible `--extra-vars`, Terraform `-var` oder `name=value`-CLI-Argumente für Shell-Apps |
| **Umgebungsvariable** | Wird als Prozess-Umgebungsvariable gesetzt, deren Name dem Namen der Survey-Variable entspricht |

Verwenden Sie **Umgebungsvariable**, wenn Ihr Skript oder Tool aus der Umgebung statt aus CLI-Flags liest. Für Terraform-Variablen, die der `TF_VAR_`-Konvention folgen müssen, benennen Sie die Survey-Variable `TF_VAR_instance_type` und setzen Sie das Ziel auf Umgebungsvariable.

Variablen mit dem Ziel Umgebungsvariable werden **nicht** zusätzlich in Extra-Vars, `-var` oder CLI-Argumenten übergeben. Jeder Wert wird genau einmal übergeben.

## Wie Survey-Variablen an Tasks übergeben werden {#how-survey-variables-are-passed-to-tasks}

Survey-Variablen werden je nach Template-Typ und der Einstellung **Variable übergeben als** unterschiedlich übergeben.

**Werte der Mehrfachauswahl (Typ `select`)** sind auf jedem Übergabeweg JSON-kodierte Arrays (Extra-Vars-JSON, `-var`, CLI-Argumente und Umgebungsvariablen). Eine Auswahl der Optionen `1` und `2` wird zu `["1","2"]`, nicht zu einer durch Leerzeichen getrennten Zeichenkette.

### Ansible-Templates {#ansible-templates}

Survey-Variablen werden als Ansible-Extra-Variablen über das `--extra-vars`-Flag übergeben.

**Beispiel**: Wenn Sie eine Survey-Variable namens `app_version` definieren:

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

Beim Ausführen des Tasks gibt der Benutzer „2.5.0“ im Survey-Formular ein, und Ansible erhält den Wert wie folgt:

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Terraform/OpenTofu-Templates {#terraformopentofu-templates}

Survey-Variablen werden als Terraform-Variablen über das `-var`-Flag übergeben.

**Beispiel**: Wenn Sie eine Survey-Variable namens `instance_count` definieren:

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

Beim Ausführen des Tasks gibt der Benutzer „3“ im Survey-Formular ein, und Terraform erhält den Wert wie folgt:

```bash
terraform apply -var="instance_count=3"
```

### Shell/Bash-Templates {#shellbash-templates}

Survey-Variablen werden als Kommandozeilenargumente an das Bash-Skript übergeben:

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

Mit folgendem Code innerhalb des Skripts können Sie die Argumente in ein Array parsen:

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

Bei **Mehrfachauswahl**-Variablen ist der Wert eine JSON-Array-Zeichenkette. Parsen Sie sie mit `jq` (stellen Sie sicher, dass `jq` in Ihrem Executor-Image verfügbar ist):

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### PowerShell-Templates {#powershell-templates}

Survey-Variablen werden als Kommandozeilenargumente an das laufende PowerShell-Skript übergeben:

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


Um die Argumente zu parsen, verwenden Sie den folgenden Code im laufenden Skript:

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

Bei **Mehrfachauswahl**-Variablen parsen Sie das JSON-Array aus dem Argumentwert:

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Python-Templates {#python-templates}

Survey-Variablen werden als Kommandozeilenargumente an das laufende Python-Skript übergeben:

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

Um die Argumente zu parsen, verwenden Sie den folgenden Code im laufenden Skript:

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

Bei **Mehrfachauswahl**-Variablen parsen Sie das JSON-Array:

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## Survey-Variablen verwenden {#using-survey-variables}

### Manuelle Task-Ausführung {#manual-task-execution}

Beim Ausführen eines Tasks aus einem Template mit Survey-Variablen:

1. Klicken Sie beim Template auf **Ausführen**
2. Ein Formular mit allen definierten Survey-Variablen erscheint
3. Füllen Sie die Werte für jedes Feld aus
4. Klicken Sie auf **Task ausführen**

Der Task wird mit den von Ihnen angegebenen Werten ausgeführt, die an das Playbook oder Skript übergeben werden.
<!-- 
### API-Aufrufe {#api-calls}

Um Werte von Survey-Variablen über die API zu übergeben:

**Beispiel für eine API-Anfrage:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

Die Werte der Survey-Variablen werden im `environment`-Objekt der Anfrage-Nutzdaten übergeben.

**Wichtig**: Bei Auslösung über die API läuft der Task unbeaufsichtigt – es erscheint kein interaktiver Prompt. -->

### Geplante Tasks {#scheduled-tasks}

Zeitpläne können Werte für Survey-Variablen enthalten, um dasselbe Template mit unterschiedlichen Parametern nach verschiedenen Zeitplänen auszuführen.

**Einrichtung:**

1. Fügen Sie Survey-Variablen zu Ihrem Template hinzu
2. Erstellen Sie einen Zeitplan für dieses Template
3. Definieren Sie in der Zeitplankonfiguration die Werte für Ihre Survey-Variablen
4. Jeder geplante Lauf verwendet diese vordefinierten Werte

**Beispiel-Anwendungsfall**: Ein Backup-Playbook mit unterschiedlichen Aufbewahrungsrichtlinien ausführen:
- Täglicher Zeitplan mit `retention_days=7`
- Wöchentlicher Zeitplan mit `retention_days=30`
- Monatlicher Zeitplan mit `retention_days=365`

Weitere Details finden Sie in der Dokumentation zu [Zeitplänen](../schedules).

### Integrationen und Webhooks {#integrations-and-webhooks}

Integrationen können Werte aus eingehenden Webhooks extrahieren und Survey-Variablen zuordnen.

**Einrichtung:**

1. Fügen Sie Survey-Variablen zu Ihrem Template hinzu
2. Erstellen Sie eine Integration, die dieses Template auslöst
3. Konfigurieren Sie Wert-Extraktoren, um Daten aus den Webhook-Nutzdaten zu übernehmen
4. Ordnen Sie die extrahierten Werte Ihren Survey-Variablen zu

**Beispiel**: Ein Deployment auslösen, wenn ein GitHub-Release erstellt wird:
- Release-Tag aus den Webhook-Nutzdaten extrahieren
- Einer Survey-Variable namens `release_version` zuordnen
- Das Deployment-Playbook erhält die Versionsnummer

Weitere Details finden Sie in der Dokumentation zu [Integrationen](../integrations).

## Best Practices {#best-practices}

### Aussagekräftige Namen verwenden {#use-descriptive-names}

Wählen Sie klare, aussagekräftige Namen für Ihre Survey-Variablen, die deren Zweck erkennen lassen:
- ✅ Gut: `target_environment`, `app_version`, `backup_retention_days`
- ❌ Schlecht: `env`, `ver`, `days`

### Hilfreiche Titel vergeben {#provide-helpful-titles}

Der Titel erscheint im Formular, gestalten Sie ihn daher benutzerfreundlich:
- Variablenname: `db_host`
- Titel: „Datenbank-Hostname oder IP-Adresse“

### Enum oder Select für bekannte Optionen verwenden {#use-enum-or-select-for-known-options}

Wenn Benutzer aus einer begrenzten Menge von Optionen wählen sollen, verwenden Sie Enum oder Select statt String:
- ✅ **Enum** für genau eine Auswahl: production, staging oder development
- ✅ **Select**, wenn mehrere Auswahlen gültig sind: mehrere Regionen oder Feature-Flags
- ❌ String-Feld mit dem Hinweis „production oder staging eingeben“

### Das Ziel Umgebungsvariable bewusst einsetzen {#use-environment-variable-target-deliberately}

Bevorzugen Sie die standardmäßige Übergabe als Extra-Variable, es sei denn, Ihr Playbook, Skript oder Tool liest explizit aus der Prozessumgebung. Benennen Sie Variablen mit dem Ziel Umgebungsvariable genau so, wie das nachgelagerte Tool es erwartet (zum Beispiel `TF_VAR_region`).

### Pflichtfelder angemessen kennzeichnen {#mark-required-fields-appropriately}

Kennzeichnen Sie Felder nur dann als erforderlich, wenn sie wirklich notwendig sind. Erwägen Sie, in Ihren Playbooks sinnvolle Standardwerte für optionale Felder bereitzustellen.

### In Ihrem Code validieren {#validate-in-your-code}

Gehen Sie nicht davon aus, dass die Werte von Survey-Variablen immer gültig sind. Fügen Sie Validierungslogik in Ihren Playbooks oder Skripten hinzu:

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### Secrets für sensible Daten verwenden {#use-secrets-for-sensitive-data}

Verwenden Sie für sensible Werte wie API-Schlüssel, Passwörter oder Tokens immer den Typ Secret. So wird sichergestellt, dass die Werte in der Oberfläche und in den Logs verborgen bleiben.

### Mit Variablengruppen kombinieren {#combine-with-variable-groups}

Survey-Variablen lassen sich gut mit [Variablengruppen](../environment) kombinieren:
- Verwenden Sie **Variablengruppen** für statische Konfiguration, die von mehreren Tasks gemeinsam genutzt wird
- Verwenden Sie **Survey-Variablen** für Werte, die sich bei jedem Task-Lauf ändern

**Beispiel**:
- Variablengruppe: Datenbank-Verbindungsdaten, API-Endpunkte
- Survey-Variablen: Deployment-Umgebung, Versionsnummer, Feature-Flags

## Häufige Anwendungsfälle {#common-use-cases}

### Umgebungsspezifische Deployments {#environment-specific-deployments}

Erstellen Sie Survey-Variablen für:
- `environment`: Enum mit den Optionen „production, staging, development“
- `app_version`: String für die zu deployende Version
- `enable_debug`: Enum mit den Optionen „true, false“

### Datenbankoperationen {#database-operations}

Erstellen Sie Survey-Variablen für:
- `db_name`: String für den Datenbanknamen
- `backup_retention_days`: Integer für die Aufbewahrungsrichtlinie
- `maintenance_window`: String für das Zeitfenster

### Infrastrukturbereitstellung {#infrastructure-provisioning}

Erstellen Sie Survey-Variablen für:
- `instance_count`: Integer für die Anzahl der Instanzen
- `instance_type`: Enum mit den Optionen „t2.micro, t2.small, t2.medium“
- `region`: Enum mit AWS-Regionen

### CI/CD-Pipelines {#cicd-pipelines}

Erstellen Sie Survey-Variablen für:
- `git_branch`: String für den zu bauenden Branch
- `build_type`: Enum mit den Optionen „debug, release“
- `run_tests`: Enum mit den Optionen „true, false“

## Unterschiede zu Variablengruppen {#differences-from-variable-groups}

| Merkmal | Survey-Variablen | Variablengruppen |
|---------|-----------------|-----------------|
| **Zweck** | Laufzeiteingabe pro Task | Wiederverwendbare statische Konfiguration |
| **Definitionszeitpunkt** | Zum Zeitpunkt der Task-Ausführung | Vorkonfiguriert im Projekt |
| **Anwendungsfall** | Werte, die sich pro Lauf ändern | Gemeinsame Einstellungen für mehrere Tasks |
| **Format** | Einzelne typisierte Felder | JSON-Format mit verschachtelten Objekten |
| **Geltungsbereich** | Einzelner Task-Lauf | Mehrere Templates/Inventories |
| **Sicherheit** | Typ Secret verbirgt sensible Werte | Tab „Secrets“ für sensible Daten |

Verwenden Sie Survey-Variablen, wenn Sie Flexibilität zur Laufzeit benötigen, und Variablengruppen, wenn Sie eine konsistente Konfiguration über mehrere Task-Ausführungen hinweg wünschen.
