---
title: Audit-Protokoll
description: Aktivieren Sie das Audit-Protokoll, um zu sehen, wer was in Semaphore getan hat, und senden Sie Audit-Ereignisse aus Semaphore Pro per Syslog oder HEC an ein SIEM.
---

# Audit-Protokoll

Das Audit-Protokoll zeichnet wichtige Aktionen in Semaphore auf: wer sich angemeldet hat, wer einen Benutzer
oder eine Rolle geändert hat, wer ein API-Token erstellt hat. Jedes Ereignis zeigt, wer es war, wann, von
welcher Adresse und ob es funktioniert hat. Damit finden Sie heraus, was in Ihrer Installation passiert ist,
oder Sie senden die Ereignisse an Ihr SIEM, damit sie neben Ihren übrigen Logs liegen.

Das Audit-Protokoll ist in jeder Edition verfügbar. Für das Senden an ein SIEM wird Semaphore Pro benötigt.

## Was aufgezeichnet wird {#recorded-events}

Derzeit zeichnet Semaphore Anmeldungen, Konto-, Projekt- und Task-Aktivitäten auf:

- Anmeldungen, fehlgeschlagene Anmeldeversuche, Abmeldungen und Prüfungen des zweiten Faktors;
- abgelehnte API-Tokens, verweigerte Anfragen und blockierte Cross-Site-Anfragen;
- Änderungen an Benutzern, Passwörtern, Zwei-Faktor-Authentifizierung, externen Identitäten und API-Tokens;
- Änderungen an Projektmitgliedern, Rollen und Vorlagenberechtigungen;
- Änderungen an Projekten, Inventaren, Repositories, Vorlagen, Zeitplänen, Integrationen, Host-Konfigurationen,
  Umgebungen, Zugangsdaten und Geheimnisspeichern sowie Exporte und Wiederherstellungen von Projektsicherungen;
- Änderungen an Systemeinstellungen und die Aktivierung der Pro-Lizenz;
- Task-Starts mit ihrem Auslöser (API, Zeitplan, Integration, Autorun, Workflow), Freigaben, Stopps,
  Abschlüsse und gelöschter Task-Verlauf;
- Änderungen an Runnern, Registrierungen (auch abgelehnte Registrierungs-Tokens), Abmeldungen von Runnern und Runner-Meldungen
  mit ungültigem Status;
- jeden Serverstart.

Die vollständige Liste finden Sie unter
[Audit-Ereignisse](/reference/audit-events).

Passwörter, Tokens, geheime Werte und Aufgabenausgaben erscheinen nie in Audit-Ereignissen. API-Tokens werden
über einen Fingerabdruck statt über ihren Wert angezeigt. Eine fehlgeschlagene Anmeldung speichert den
eingegebenen Anmeldenamen, der daher eine E-Mail-Adresse enthalten kann.

Im Abschlussereignis eines Tasks zeigt `metadata.result` den
Status, den Semaphore dem Task gegeben hat, und `metadata.end_reason` nennt den Grund, warum Semaphore ihn beendet hat: `timeout`, wenn er
zu lange lief, `runner_lost`, wenn sein Runner nicht mehr antwortete. Task-Argumente, Variablen, Runner-Tags und Tokens
werden nicht aufgezeichnet.

Bei einem Rolling Upgrade eines HA-Clusters hat ein Task, der auf einem aktualisierten Knoten gestartet und auf einem noch
nicht aktualisierten Knoten beendet wurde, kein Abschlussereignis.

Repository-URLs, Host-Konfigurations-URLs und Integrations-Aliase werden ebenfalls nicht aufgezeichnet.

Manchmal speichert oder löscht Semaphore ein Objekt, aber ein späterer Teil derselben Anfrage schlägt fehl.
Die Oberfläche oder die API zeigt dann einen Fehler, obwohl das Objekt angelegt oder gelöscht wurde. Ein solches
Ereignis wird als Erfolg mit `metadata.partial=true` erfasst, und `reason` gibt an, was nicht abgeschlossen wurde:

- `secret_failed`: Eine Umgebung wurde gespeichert oder gelöscht, aber einige ihrer Geheimnisse wurden nicht
  gespeichert oder nicht entfernt;
- `inventory_failed`: Ein Template wurde angelegt, aber sein Inventar für den Terraform-Workspace nicht;
- `restore_failed`: Ein Projekt wurde aus einer Sicherung wiederhergestellt, aber nicht alle seine Objekte;
- `setup_failed`: Ein Projekt wurde angelegt, aber nicht vollständig eingerichtet, zum Beispiel wurde sein
  Ersteller nicht als Besitzer hinzugefügt.

## Das Audit-Protokoll aktivieren {#enable}

Das Audit-Protokoll ist standardmäßig ausgeschaltet. Setzen Sie zum Einschalten `audit.enabled` und geben
Sie Ihrer Installation in `audit.instance_id` einen Namen:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Oder über Umgebungsvariablen:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Die Instanz-ID besteht aus 1 bis 255 Zeichen ohne Leerzeichen. Sie wird jedem Ereignis hinzugefügt, damit
Sie Ihre Installationen unterscheiden können, wenn sie Ereignisse an dieselbe Stelle senden.

Starten Sie Semaphore neu. Die Aufzeichnung beginnt nach dem Neustart; frühere Aktionen werden nicht
nachgetragen. Alle Optionen finden Sie unter [Konfigurationsoptionen](/reference/configuration#audit-log).

## Die Client-Adresse hinter einem Proxy aufzeichnen {#trusted-proxies}

Läuft Semaphore hinter einem Reverse-Proxy, zeigen Ereignisse die Adresse des Proxys statt die des
Benutzers. Um die echte Client-Adresse aufzuzeichnen, tragen Sie Ihre Proxy-Netze in
`audit.trusted_proxy_cidrs` ein:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Oder über Umgebungsvariablen:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore übernimmt die Client-Adresse dann aus `X-Forwarded-For` oder `X-Real-IP`, aber nur für Anfragen
aus diesen Netzen. Laufen Anfragen über mehrere Proxys, tragen Sie alle ein. Tragen Sie keine Netze ein,
aus denen sich Ihre Benutzer verbinden: Jeder dort könnte diese Header auf eine beliebige Adresse setzen.

## Speicherung {#storage}

Ereignisse werden in der Semaphore-Datenbank gespeichert, sodass Ihre üblichen Datenbank-Backups sie
enthalten.
Semaphore zeigt Audit-Ereignisse nicht in der Oberfläche an. Standardmäßig behält es jedes Ereignis. Um alte
Ereignisse zu löschen, legen Sie eine Aufbewahrungsdauer in Tagen fest:

```json
{
  "audit": {
    "retention_days": 365
  }
}
```

Oder über eine Umgebungsvariable: `SEMAPHORE_AUDIT_RETENTION_DAYS=365`.

Semaphore löscht ältere Ereignisse einmal pro Stunde und erfasst ein Ereignis `audit.retention/delete` mit der Anzahl
der gelöschten Ereignisse. Wenn Sie Ereignisse an ein SIEM exportieren, wählen Sie eine Dauer, die länger ist als der
längste SIEM-Ausfall, den Sie überbrücken möchten: Ereignisse, die älter als die Dauer sind, werden auch dann
gelöscht, wenn sie nicht gesendet wurden.

Das Audit-Protokoll steht Ihren Benutzern nie im Weg. Kann ein Ereignis nicht gespeichert werden, schreibt
Semaphore einen Fehler in das Server-Log, und die Aktion läuft wie gewohnt weiter.

## Export an ein SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro kann Audit-Ereignisse über TLS an einen Syslog-Empfänger senden, etwa rsyslog oder Vector,
und an jeden Empfänger des Splunk-HTTP-Event-Collector-Protokolls (HEC), etwa Splunk, Vector, Fluent Bit, den
OpenTelemetry Collector oder Cribl. Sie können ein Syslog- und ein HEC-Ziel einrichten, oder beide gleichzeitig.

Sie benötigen:

- den Hostnamen und Port des Empfängers;
- einen Namen für dieses Ziel, etwa `security-syslog`;
- das CA-Zertifikat des Empfängers, falls der Semaphore-Host ihm noch nicht vertraut.

Fügen Sie `audit.syslog` zu `config.json` hinzu:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

Oder über Umgebungsvariablen:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` und `address` sind Pflicht. Semaphore merkt sich, welche Ereignisse es an jedes Ziel bereits gesendet
hat. Behalten Sie deshalb dieselbe `id`, wenn Sie die Adresse oder das Zertifikat ändern. Eine neue `id`
beginnt mit neuen Ereignissen.

Semaphore prüft das Zertifikat des Empfängers immer und verwendet TLS 1.2 oder neuer. `ca_file` fügt Ihre CA
zu den vertrauenswürdigen Zertifikaten hinzu, und `server_name` legt den im Zertifikat zu prüfenden Namen
fest, wenn er von der Adresse abweicht.

Starten Sie Semaphore neu. Sind die Einstellungen ungültig oder lässt sich die CA-Datei nicht lesen, startet
Semaphore nicht.

### Prüfen, ob Ereignisse ankommen {#verify-siem-delivery}

Semaphore zeichnet bei jedem Start ein Ereignis auf. Suchen Sie es nach dem Neustart beim Empfänger:
`event_code` ist `audit.lifecycle`, `action` ist `start`, und `metadata.destinations` enthält Ihre Ziel-ID.

### Ereignisse über HEC senden {#hec}

Sie benötigen die URL des HEC-Endpunkts, ein HEC-Token, einen Namen für dieses Ziel, etwa `security-hec`, und
das CA-Zertifikat des Empfängers, falls der Semaphore-Host ihm nicht bereits vertraut.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "splunk_hec": {
      "id": "security-hec",
      "url": "https://splunk.example.com:8088/services/collector/event",
      "token": "<HEC token>",
      "index": "security",
      "ca_file": "/etc/semaphore/siem-ca.pem"
    }
  }
}
```

Oder mit Umgebungsvariablen:

```bash
SEMAPHORE_AUDIT_SPLUNK_HEC_ID=security-hec
SEMAPHORE_AUDIT_SPLUNK_HEC_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_SPLUNK_HEC_TOKEN='<HEC token>'
SEMAPHORE_AUDIT_SPLUNK_HEC_INDEX=security
SEMAPHORE_AUDIT_SPLUNK_HEC_CA_FILE=/etc/semaphore/siem-ca.pem
```

`id`, `url` und `token` sind erforderlich, und die URL muss mit `https://` beginnen. Verwenden Sie eine andere
`id` als für Syslog. `source` und `sourcetype` haben die Standardwerte `semaphore` und `semaphore:audit`.
Zertifikate werden wie bei Syslog geprüft, und die Standardvariablen `HTTPS_PROXY` und `NO_PROXY` werden
beachtet.

Semaphore sendet bis zu 100 Ereignisse pro Anfrage. Das Feld `event` jedes HEC-Ereignisses enthält das
Audit-Ereignis-JSON, `time` ist der Zeitpunkt des Ereignisses, und `host` ist die HA-Knoten-ID oder auf einem
einzelnen Knoten die Instanz-ID.

Starten Sie Semaphore neu und prüfen Sie dann, ob Ereignisse wie [oben](#verify-siem-delivery) beschrieben ankommen.

### Wie Ereignisse zugestellt werden {#delivery}

- Ist der Empfänger nicht erreichbar, warten die Ereignisse in der Datenbank und werden gesendet, sobald er
  wieder da ist. Benutzer merken davon nichts.
- Nach Netzwerkfehlern, Neustarts oder einem HA-Failover können manche Ereignisse doppelt ankommen. Nutzen
  Sie `event_id`, um Duplikate zu verwerfen, und `seq`, um Ereignisse zu ordnen.
- Bricht bei Syslog eine Verbindung ohne Fehlermeldung ab, kann das in diesem Moment gesendete Ereignis verloren gehen.
- In einer [HA-Installation](/admin-guide/ha) sendet jeweils nur ein Knoten Ereignisse an jedes Ziel. Ist Redis nicht
  erreichbar, pausiert das Senden, und Ereignisse werden weiter aufgezeichnet.
- Bei HEC gilt ein Ereignis erst als gesendet, wenn der Empfänger mit einem 2xx-Status antwortet. Jede andere
  Antwort, auch 4xx, wird wiederholt. Stürzt der Empfänger nach der Antwort ab, können Ereignisse verloren
  gehen, die er noch nicht gespeichert hatte.

Bei Syslog wird jedes Ereignis als Syslog-Nachricht nach RFC 5424 mit dem Ereignis-JSON als Inhalt gesendet. `HOSTNAME`
ist die HA-Knoten-ID oder auf einem einzelnen Knoten die Instanz-ID, und `MSGID` ist der Ereigniscode.

Die folgenden Beispiele sind minimal und zeigen nur, wie die Ereignisse empfangen werden. Sie nehmen
Verbindungen von jedem Client an, der den Port erreicht. Schützen Sie den Empfänger im Produktivbetrieb so, dass
nur Ihre Semaphore-Server Ereignisse an ihn senden können.

### rsyslog-Beispiel {#rsyslog}

Diese rsyslog-Konfiguration nimmt die TLS-Verbindung an und schreibt ein Ereignis pro Zeile:

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Vector-Beispiel {#vector}

Diese Vector-Konfiguration nimmt die TLS-Verbindung an, liest das Ereignis-JSON und schreibt es in eine
Datei:

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Vector-HEC-Beispiel {#vector-hec}

```toml
[sources.semaphore_audit_hec]
type = "splunk_hec"
address = "0.0.0.0:8088"
valid_tokens = ["<HEC token>"]
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_hec"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Splunk-Beispiel {#splunk}

Erstellen Sie in Splunk ein HEC-Token (**Settings → Data inputs → HTTP Event Collector**), erlauben Sie ihm
den Index `security` und setzen Sie `url` auf `https://<splunk>:8088/services/collector/event`. Um die
Ereignisse zu finden, suchen Sie nach `index=security sourcetype="semaphore:audit"`.

Lassen Sie **Enable indexer acknowledgement** für dieses Token ausgeschaltet: Semaphore verwendet es nicht.

### Export überwachen {#monitor-export}

Wenn [Metriken](/admin-guide/metrics) aktiviert sind, meldet Semaphore Pro für jedes Ziel:

| Metrik | Bedeutung |
| --- | --- |
| `semaphore_audit_export_oldest_pending_seconds` | Alter des ältesten Ereignisses, das noch nicht gesendet wurde, 0, wenn alles gesendet ist |
| `semaphore_audit_export_pending_events` | Anzahl der Ereignisse, die auf das Senden warten |
| `semaphore_audit_export_errors_total` | Fehlgeschlagene Sendeversuche |

Jede Metrik hat ein Label `destination` mit der `id` des Ziels. Um benachrichtigt zu werden, wenn das SIEM keine
Ereignisse mehr empfängt, beobachten Sie das Alter des ältesten ausstehenden Ereignisses:

```yaml
- alert: SemaphoreAuditExportStalled
  expr: max by (destination) (semaphore_audit_export_oldest_pending_seconds) > 900
  for: 5m
```

### Fehlerbehebung beim Export {#troubleshoot-export}

- **Semaphore startet nicht.** Prüfen Sie, dass `audit.syslog.id` und `audit.syslog.address` gesetzt sind,
  oder bei HEC `audit.splunk_hec.id`, `url` und `token`, und dass die CA-Datei PEM-Zertifikate enthält.
- **Die TLS-Verbindung schlägt fehl.** Prüfen Sie, dass das Zertifikat des Empfängers zu `server_name` passt
  und von einer CA signiert ist, der Semaphore vertraut.
- **Ereignisse kommen nicht an.** Prüfen Sie das Semaphore-Server-Log und das Log des Empfängers. Nach einem
  Fehler wartet Semaphore kurz, bevor es es erneut versucht.
- **Manche Ereignisse kommen doppelt an.** Das kann nach Wiederholungen und Failovers passieren. Verwerfen
  Sie Duplikate anhand von `event_id`.
- **HEC antwortet mit 400, 401 oder 403.** Prüfen Sie das Token, die Indizes, in die es schreiben darf, und dass die Indexer-Bestätigung dafür ausgeschaltet ist. Das Token erscheint nie im Semaphore-Log.

## Was nicht aufgezeichnet wird {#not-recorded}

Das Kommandozeilenwerkzeug `semaphore` arbeitet direkt mit der Datenbank, daher werden Befehle wie
`user add` und `user token` nicht aufgezeichnet.

Einige Aktionen in der Oberfläche werden nicht aufgezeichnet: das Entfernen einer Lizenz,
App-Einstellungen, das Zurücksetzen des HA-Aufgabenstatus, Terraform-Inventar-Aliase, das Löschen eines
Terraform-Status, Workflow-Läufe und Projekteinladungen. Auch Vorlagenbeschreibungen, Ansichten, das Leeren des
Projekt-Caches und geplante Synchronisierungen von Geheimnisspeichern werden nicht aufgezeichnet.

## Wie geht es weiter {#whats-next}

- [Audit-Ereignisse](/reference/audit-events) — das Ereignisformat und alle aufgezeichneten Ereignisse.
- [Konfigurationsoptionen](/reference/configuration#audit-log) — alle `audit.*`-Optionen und Umgebungsvariablen.
- [Logs](/admin-guide/logs) — Server-, Aktivitäts- und Aufgaben-Logs.
