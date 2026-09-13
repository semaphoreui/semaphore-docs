# Prompts

Prompts sind vordefinierte Flags und Optionen, die für den jeweiligen Template-Typ spezifisch sind und die Sie aktivieren können, um Anpassungen zur Laufzeit zu ermöglichen. Im Gegensatz zu [Survey-Variablen](/user-guide/task-templates/survey-vars), die Sie als eigene Felder selbst erstellen, sind Prompts integrierte Optionen, die bestimmten CLI-Flags von Ansible, Terraform und anderen Tools entsprechen.

Diese Funktion ermöglicht Ihnen:
- Template-Standardwerte zur Laufzeit zu überschreiben
- Bestimmte Hosts oder Ressourcen anzusprechen
- Das Ausführungsverhalten über CLI-Flags zu steuern
- Laufzeitoptionen über API-Aufrufe oder Zeitpläne zu übergeben

## Prompts vs. Survey-Variablen {#prompts-vs-survey-variables}

| Merkmal | Prompts | Survey-Variablen |
|---------|---------|-----------------|
| **Definition** | Vordefinierte, Template-spezifische Optionen | Eigene Felder, die Sie erstellen |
| **Beispiele** | Ansible: `--limit`, `--tags`<br/>Terraform: Workspaces, `-destroy` | Umgebungsname, Versionsnummer, eigene Parameter |
| **Konfiguration** | Aktivierung über Kontrollkästchen im Template | Hinzufügen in den Template-Einstellungen mit Name und Typ |
| **Übergabe als** | Integrierte CLI-Flags | Ansible: `--extra-vars`<br/>Terraform: `-var` |

**Prompts** sind standardisierte, in Semaphore integrierte Optionen für bestimmte Tools, während **Survey-Variablen** flexible, selbst definierte Felder sind.

## Ansible-Prompts {#ansible-prompts}

Für Ansible-Playbook-Templates können Sie Prompts für die folgenden CLI-Optionen aktivieren:

### Limit {#limit}

Aktivieren Sie den `--limit`-Prompt, um festzulegen, welche Hosts beim Ausführen des Playbooks angesprochen werden.

**CLI-Entsprechung**: `ansible-playbook playbook.yml --limit webservers`

**Anwendungsfälle**:
- Playbook auf einer Teilmenge der Inventory-Hosts ausführen
- Bestimmte Server für ein Deployment ansprechen
- Änderungen auf einem einzelnen Host testen, bevor sie ausgerollt werden

**Beispiel**:
- Ihr Inventory enthält 50 Webserver
- Aktivieren Sie den Limit-Prompt
- Geben Sie beim Ausführen des Tasks `web-01.example.com` an, um nur diesen Server anzusprechen
- Oder geben Sie `webservers:&production` an, um die Produktions-Webserver anzusprechen

### Tags {#tags}

Aktivieren Sie den `--tags`-Prompt, um nur Tasks mit bestimmten Tags auszuführen.

**CLI-Entsprechung**: `ansible-playbook playbook.yml --tags deploy,restart`

**Anwendungsfälle**:
- Nur bestimmte Teile eines Playbooks ausführen
- Deployment-Schritte ohne Konfigurations-Tasks ausführen
- Dienste schnell neu starten, ohne das gesamte Playbook auszuführen

**Beispiel**:
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Aktivieren Sie den Tags-Prompt und geben Sie `deploy,restart` ein, um den Installationsschritt zu überspringen.

### Skip Tags {#skip-tags}

Aktivieren Sie den `--skip-tags`-Prompt, um Tasks mit bestimmten Tags zu überspringen.

**CLI-Entsprechung**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**Anwendungsfälle**:
- Optionale Tasks in der Produktion überspringen
- Debug- oder Test-Tasks ausschließen
- Zeitaufwändige Tasks umgehen, wenn sie nicht benötigt werden

**Beispiel**: Aktivieren Sie mit dem obigen Playbook Skip Tags und geben Sie `install` ein, um die Paketinstallation zu überspringen und nur die Deployment- und Neustart-Tasks auszuführen.

### Skip Galaxy install {#skip-galaxy-install}

Aktivieren Sie den Prompt, damit Benutzer beim Ausführen des Tasks den Schritt `ansible-galaxy install` für Rollen und Collections überspringen können.

**Anwendungsfälle**:
- Die Requirements sind bereits im Runner-Image installiert
- Zeit bei wiederholten Ausführungen sparen, wenn sich in `requirements.yml` nichts geändert hat

### Force Galaxy install {#force-galaxy-install}

Aktivieren Sie den Prompt, damit Benutzer `ansible-galaxy install --force` für jede Requirements-Datei erzwingen können und dabei die Requirements-Prüfsumme ignorieren, die Semaphore zwischen Ausführungen speichert.

**CLI-Entsprechung**: `ansible-galaxy role install -r requirements.yml --force`

**Anwendungsfälle**:
- Eine Requirements-Datei verweist auf einen Branch statt auf eine feste Version und Sie benötigen den neuesten Commit
- Eine frühere Installation hat Rollen oder Collections in einem fehlerhaften Zustand hinterlassen
- Prüfen, ob ein Playbook mit einem sauberen Satz von Abhängigkeiten funktioniert

Siehe [Galaxy-Requirements](../apps/ansible.md#galaxy-requirements) für die Funktionsweise der Standardwerte auf Template-Ebene.

### Ansible-Prompts aktivieren {#enabling-ansible-prompts}

So aktivieren Sie Ansible-Prompts:

1. Gehen Sie zu **Task-Templates** und wählen Sie Ihr Ansible-Template aus
2. Suchen Sie in den Template-Einstellungen den Abschnitt **Ansible-Prompts**
3. Aktivieren Sie die Kontrollkästchen für die gewünschten Prompts:
   - ☐ **Limit** – Aktiviert das `--limit`-Flag
   - ☐ **Tags** – Aktiviert das `--tags`-Flag
   - ☐ **Skip Tags** – Aktiviert das `--skip-tags`-Flag
   - ☐ **Debug** – Aktiviert die Auswahl der Ausführlichkeit (`-v`)
   - ☐ **Skip Galaxy install** – Erlaubt das Überspringen von `ansible-galaxy install`
   - ☐ **Force Galaxy install** – Erlaubt das Erzwingen von `ansible-galaxy install --force`
4. Speichern Sie das Template

![](/assets/ansible_2.png)

Wenn aktiviert, erscheinen diese Felder im Formular zum Ausführen von Tasks, in API-Anfragen und in Zeitplankonfigurationen.

## Terraform/OpenTofu-Prompts {#terraformopentofu-prompts}

Für Terraform- und OpenTofu-Templates stellt Semaphore mehrere integrierte Prompts bereit:

### Workspace-Auswahl {#workspace-selection}

Wählen Sie, welcher Terraform-Workspace für die Task-Ausführung verwendet wird.

**CLI-Entsprechung**: `terraform workspace select staging`

**Anwendungsfälle**:
- Mehrere Umgebungen verwalten (dev, staging, production)
- Getrennte State-Dateien für unterschiedliche Konfigurationen
- Infrastrukturänderungen isoliert testen

**Einrichtung**:
1. Erstellen Sie Workspaces im Tab **Workspaces** des Templates
2. Die Workspace-Auswahl erscheint automatisch im Task-Formular
3. Benutzer wählen beim Ausführen von Tasks den Ziel-Workspace

Siehe [Terraform-Workspaces](/user-guide/apps/terraform/workspaces) für die detaillierte Einrichtung.

### Destroy-Flag {#destroy-flag}

Aktivieren Sie das `-destroy`-Flag, um Infrastruktur abzubauen.

**CLI-Entsprechung**: `terraform apply -destroy`

**Anwendungsfälle**:
- Temporäre Testumgebungen bereinigen
- Infrastruktur außer Betrieb nehmen
- Bestimmte Ressourcen entfernen

**Wichtig**: Dies ist ein destruktiver Vorgang. Verwenden Sie ihn mit Vorsicht und erwägen Sie, in Ihren Workflows eine Bestätigung zu verlangen.

### Migrate-State-Flag {#migrate-state-flag}

Aktivieren Sie das `-migrate-state`-Flag, wenn Sie die Backend-Konfiguration ändern.

**CLI-Entsprechung**: `terraform init -migrate-state`

**Anwendungsfälle**:
- State in ein anderes Backend verschieben
- Zwischen Speicherorten migrieren
- Backend-Konfiguration aktualisieren

### Terraform-Prompts aktivieren {#enabling-terraform-prompts}

Terraform-Prompts sind in den Template-Einstellungen verfügbar:

1. Gehen Sie zu **Task-Templates** und wählen Sie Ihr Terraform-Template aus
2. Konfigurieren Sie die verfügbaren Prompts in den Template-Einstellungen:
   - Workspace-Auswahl (automatisch aktiviert, wenn Workspaces konfiguriert sind)
   - Option für das Destroy-Flag
   - Option für Migrate State
3. Speichern Sie das Template

Das Task-Formular zeigt diese Optionen beim Ausführen von Terraform-Tasks an.

## Bash-, PowerShell- und Python-Prompts {#bash-powershell-and-python-prompts}

Für Bash-, PowerShell- und Python-Templates sind die Prompts minimal, da die meisten Anpassungen über [Survey-Variablen](/user-guide/task-templates/survey-vars) erfolgen.

Verfügbare Prompts sind:

- CLI-Argumente
- Branch

Diese Template-Typen profitieren stärker von eigenen Survey-Variablen zur Übergabe von Parametern an Skripte.

## Prompts verwenden {#using-prompts}

### Manuelle Task-Ausführung {#manual-task-execution}

Beim Ausführen eines Tasks aus einem Template mit aktivierten Prompts:

1. Klicken Sie beim Template auf **Ausführen**
2. Ein Formular mit den aktivierten Prompt-Feldern erscheint
3. Füllen Sie die Werte für die gewünschten Prompts aus (optionale Felder können leer bleiben)
4. Klicken Sie auf **Task ausführen**

Der Task wird mit den von Ihnen angegebenen Prompt-Werten ausgeführt, die als CLI-Flags übergeben werden.

### API-Aufrufe {#api-calls}

Um Prompt-Werte über die API zu übergeben, nehmen Sie sie in die Nutzdaten der Anfrage auf:

**Ansible-Beispiel:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**Wichtig**: Die Prompts müssen im Template aktiviert sein, damit die Werte akzeptiert werden. Wenn Sie Prompt-Werte über die API übergeben, ohne sie zu aktivieren, werden diese Werte ignoriert.

### Geplante Tasks {#scheduled-tasks}

Zeitpläne können Prompt-Werte enthalten, um die automatisierte Task-Ausführung anzupassen:

**Beispiel**: Zeitplan mit Ansible-Prompts
- Täglicher Deployment-Zeitplan mit `limit: "production"` und `tags: "deploy"`
- Wöchentlicher Wartungszeitplan mit `tags: "updates,cleanup"`

Konfigurieren Sie die Prompt-Werte in den Zeitplaneinstellungen, damit jeder geplante Lauf die angegebenen Optionen verwendet.

### Integrationen und Webhooks {#integrations-and-webhooks}

Integrationen können Werte aus Webhooks extrahieren und Prompts zuordnen:

**Beispiel**: GitHub-Webhook löst ein Deployment aus
- Branch-Namen aus dem Webhook extrahieren
- Dem Limit-Prompt zuordnen, um eine bestimmte Umgebung anzusprechen
- Nur auf Servern deployen, die zur Umgebung des Branches passen

Siehe [Integrationen](../integrations) für die Webhook-Konfiguration.

## Best Practices {#best-practices}

### Nur notwendige Prompts aktivieren {#enable-only-necessary-prompts}

Jeder aktivierte Prompt fügt dem Task-Formular ein Feld hinzu. Aktivieren Sie nur Prompts, die Benutzer tatsächlich anpassen müssen.

✅ **Gut**: Limit für Operations-Teams aktivieren, die bestimmte Hosts ansprechen müssen
❌ **Schlecht**: Alle Prompts „für alle Fälle“ aktivieren

### Mit Survey-Variablen kombinieren {#combine-with-survey-variables}

Verwenden Sie Prompts für Tool-spezifische CLI-Optionen und Survey-Variablen für eigene Parameter:

**Beispiel für ein Ansible-Template:**
- **Prompts**: Limit (welche Hosts), Tags (welche Tasks)
- **Survey-Variablen**: `app_version` (welche Version), `enable_rollback` (eigene Logik)

### API-Nutzung dokumentieren {#document-api-usage}

Wenn Templates über die API ausgelöst werden, dokumentieren Sie, welche Prompts verfügbar sind und welches Format erwartet wird:

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### Limit für sicheres Testen verwenden {#use-limit-for-safe-testing}

Testen Sie potenziell destruktive Playbooks immer zuerst mit dem Limit-Prompt:

1. Aktivieren Sie den Limit-Prompt im Template
2. Erster Lauf: Geben Sie `limit: "test-server-01"` an, um auf einem Host zu testen
3. Prüfen Sie den Erfolg
4. Zweiter Lauf: Geben Sie `limit: "production"` an, um auf alle Hosts auszurollen

### Prompt-Kombinationen prüfen {#validate-prompt-combinations}

Manche Prompt-Kombinationen ergeben keinen Sinn. Ergänzen Sie Dokumentation oder Validierung:

- Die Verwendung von `--tags deploy` zusammen mit `--skip-tags deploy` führt zu einem Konflikt
- Die gleichzeitige Angabe von Workspace und Destroy-Flag erfordert besondere Vorsicht

## Häufige Anwendungsfälle {#common-use-cases}

### Schrittweises Rollout mit Limit {#gradual-rollout-with-limit}

Deployen Sie schrittweise in die Produktion mit dem Ansible-Limit:

1. Lauf 1: `limit: "web-01.example.com"` – Deployment auf einen Server
2. Auf Probleme achten
3. Lauf 2: `limit: "webservers:&canary"` – Deployment auf Canary-Server
4. Metriken prüfen
5. Lauf 3: `limit: "webservers:&production"` – Vollständiges Rollout

### Selektive Ausführung mit Tags {#selective-execution-with-tags}

Verwenden Sie Tags, um nur bestimmte Teile eines Playbooks auszuführen:

**Morgens**: `tags: "deploy"` – Neue Version deployen
**Nachmittags**: `tags: "config"` – Konfiguration aktualisieren
**Abends**: `tags: "restart"` – Dienste mit der neuen Konfiguration neu starten

### Umgebungsverwaltung mit Workspaces {#environment-management-with-workspaces}

Verwenden Sie die Terraform-Workspace-Auswahl zur Verwaltung von Umgebungen:

- **Entwicklung**: Workspace `dev` wählen – günstigere Ressourcen, schnellere Iteration
- **Staging**: Workspace `staging` wählen – produktionsnah zum Testen
- **Produktion**: Workspace `prod` wählen – vollständige Produktionsinfrastruktur

### Bereinigung mit Destroy {#cleanup-with-destroy}

Verwenden Sie Terraform Destroy für temporäre Infrastruktur:

1. Testumgebung erstellen: Mit Workspace `test-branch-123` ausführen
2. Integrationstests ausführen
3. Bereinigen: Mit aktiviertem Destroy-Flag und Workspace `test-branch-123` ausführen

## Fehlerbehebung {#troubleshooting}

### Prompt-Werte werden ignoriert {#prompt-values-ignored}

**Problem**: Prompt-Werte werden übergeben, haben aber keine Wirkung

**Lösung**: Prüfen Sie, ob der entsprechende Prompt in den Template-Einstellungen aktiviert ist. Prompts müssen explizit aktiviert werden.

### Limit kann nicht angegeben werden {#cannot-specify-limit}

**Problem**: Das Limit-Feld erscheint nicht im Task-Formular

**Lösung**: 
1. Bearbeiten Sie das Template
2. Suchen Sie den Abschnitt „Ansible-Prompts“
3. Aktivieren Sie das Kontrollkästchen „Limit“
4. Speichern Sie das Template

### API-Aufrufe mit Prompt-Werten schlagen fehl {#api-calls-fail-with-prompt-values}

**Problem**: API-Anfragen mit Prompt-Werten liefern Fehler

**Lösung**: 
1. Stellen Sie sicher, dass die Prompts im Template aktiviert sind
2. Prüfen Sie die JSON-Formatierung im Anfragetext
3. Prüfen Sie, ob die Feldnamen exakt übereinstimmen (`limit`, nicht `host_limit`)

### Tags filtern die Tasks nicht {#tags-not-filtering-tasks}

**Problem**: Tags werden angegeben, aber trotzdem laufen alle Tasks

**Lösung**: 
1. Prüfen Sie, ob die Tasks im Playbook korrekte Tags definiert haben
2. Prüfen Sie die Tag-Namen auf Tippfehler
3. Stellen Sie sicher, dass die Tags durch Kommas ohne Leerzeichen getrennt sind: `deploy,restart`, nicht `deploy, restart`

## Verwandte Dokumentation {#related-documentation}

- [Survey-Variablen](/user-guide/task-templates/survey-vars) – Eigene Felder für Templates
- [Ansible-Templates](/user-guide/apps/ansible) – Ansible-spezifische Konfiguration
- [Terraform-Templates](/user-guide/apps/terraform) – Terraform-spezifische Konfiguration
- [Zeitpläne](../schedules) – Automatisierte Task-Ausführung
- [Integrationen](../integrations) – Über Webhooks ausgelöste Tasks
- [API-Dokumentation](../../reference/api) – API-Referenz
