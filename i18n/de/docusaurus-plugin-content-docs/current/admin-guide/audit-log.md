---
title: Audit-Protokoll
description: Aktivieren Sie das Audit-Protokoll, um zu sehen, wer was in Semaphore getan hat, und senden Sie Audit-Ereignisse aus Semaphore Pro an ein SIEM.
---

# Audit-Protokoll

Das Audit-Protokoll zeichnet wichtige Aktionen in Semaphore auf: wer sich angemeldet hat, wer einen Benutzer
oder eine Rolle geändert hat, wer ein API-Token erstellt hat. Jedes Ereignis zeigt, wer es war, wann, von
welcher Adresse und ob es funktioniert hat. Damit finden Sie heraus, was in Ihrer Installation passiert ist,
oder Sie senden die Ereignisse an Ihr SIEM, damit sie neben Ihren übrigen Logs liegen.

Das Audit-Protokoll ist in jeder Edition verfügbar. Für das Senden an ein SIEM wird Semaphore Pro benötigt.

## Was aufgezeichnet wird {#recorded-events}

Derzeit zeichnet Semaphore Anmeldungen, Konto- und Projektaktivitäten auf:

- Anmeldungen, fehlgeschlagene Anmeldeversuche, Abmeldungen und Prüfungen des zweiten Faktors;
- abgelehnte API-Tokens, verweigerte Anfragen und blockierte Cross-Site-Anfragen;
- Änderungen an Benutzern, Passwörtern, Zwei-Faktor-Authentifizierung, externen Identitäten und API-Tokens;
- Änderungen an Projektmitgliedern, Rollen und Vorlagenberechtigungen;
- Änderungen an Projekten, Inventaren, Repositories, Vorlagen, Zeitplänen, Integrationen, Host-Konfigurationen,
  Umgebungen, Zugangsdaten und Geheimnisspeichern sowie Exporte und Wiederherstellungen von Projektsicherungen;
- Änderungen an Systemeinstellungen und die Aktivierung der Pro-Lizenz;
- jeden Serverstart.

In künftigen Versionen kommen weitere Ereignisse hinzu. Die vollständige Liste finden Sie unter
[Audit-Ereignisse](/reference/audit-events).

Passwörter, Tokens, geheime Werte und Aufgabenausgaben erscheinen nie in Audit-Ereignissen. API-Tokens werden
über einen Fingerabdruck statt über ihren Wert angezeigt. Eine fehlgeschlagene Anmeldung speichert den
eingegebenen Anmeldenamen, der daher eine E-Mail-Adresse enthalten kann.

Repository-URLs, Host-Konfigurations-URLs und Integrations-Aliase werden ebenfalls nicht aufgezeichnet.

Manchmal speichert oder löscht Semaphore ein Objekt, aber ein späterer Teil derselben Anfrage schlägt fehl.
Die Oberfläche oder die API zeigt dann einen Fehler, obwohl das Objekt angelegt oder gelöscht wurde. Ein solches
Ereignis wird als Erfolg mit `metadata.partial=true` erfasst, und `reason` gibt an, was nicht abgeschlossen wurde:

- `secret_failed`: Eine Umgebung wurde gespeichert oder gelöscht, aber einige ihrer Geheimnisse wurden nicht
  gespeichert oder nicht entfernt;
- `key_failed`: Ein Geheimnisspeicher wurde gelöscht, aber einige der Zugangsdaten, die Semaphore dafür
  aufbewahrt hat, wurden nicht entfernt;
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
enthalten. Semaphore zeigt Audit-Ereignisse nicht in der Oberfläche an und löscht alte Ereignisse nicht,
behalten Sie also die Größe der Datenbank im Blick.

Das Audit-Protokoll steht Ihren Benutzern nie im Weg. Kann ein Ereignis nicht gespeichert werden, schreibt
Semaphore einen Fehler in das Server-Log, und die Aktion läuft wie gewohnt weiter.

## Export an ein SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro kann Audit-Ereignisse über TLS an einen Syslog-Empfänger senden, etwa rsyslog oder Vector.
Der Empfänger kann sie speichern oder an Ihr SIEM weiterleiten.

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

### Wie Ereignisse zugestellt werden {#delivery}

- Ist der Empfänger nicht erreichbar, warten die Ereignisse in der Datenbank und werden gesendet, sobald er
  wieder da ist. Benutzer merken davon nichts.
- Nach Netzwerkfehlern, Neustarts oder einem HA-Failover können manche Ereignisse doppelt ankommen. Nutzen
  Sie `event_id`, um Duplikate zu verwerfen, und `seq`, um Ereignisse zu ordnen.
- Bricht eine Verbindung ohne Fehlermeldung ab, kann das in diesem Moment gesendete Ereignis verloren gehen.
- In einer [HA-Installation](/admin-guide/ha) sendet jeweils ein Knoten Ereignisse. Ist Redis nicht
  erreichbar, pausiert das Senden, und Ereignisse werden weiter aufgezeichnet.

Jedes Ereignis wird als Syslog-Nachricht nach RFC 5424 mit dem Ereignis-JSON als Inhalt gesendet. `HOSTNAME`
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

### Fehlerbehebung beim Export {#troubleshoot-export}

- **Semaphore startet nicht.** Prüfen Sie, dass `audit.syslog.id` und `audit.syslog.address` gesetzt sind
  und die CA-Datei PEM-Zertifikate enthält.
- **Die TLS-Verbindung schlägt fehl.** Prüfen Sie, dass das Zertifikat des Empfängers zu `server_name` passt
  und von einer CA signiert ist, der Semaphore vertraut.
- **Ereignisse kommen nicht an.** Prüfen Sie das Semaphore-Server-Log und das Log des Empfängers. Nach einem
  Fehler wartet Semaphore kurz, bevor es es erneut versucht.
- **Manche Ereignisse kommen doppelt an.** Das kann nach Wiederholungen und Failovers passieren. Verwerfen
  Sie Duplikate anhand von `event_id`.

## Was nicht aufgezeichnet wird {#not-recorded}

Das Kommandozeilenwerkzeug `semaphore` arbeitet direkt mit der Datenbank, daher werden Befehle wie
`user add` und `user token` nicht aufgezeichnet.

Einige Aktionen in der Oberfläche werden noch nicht aufgezeichnet: das Entfernen einer Lizenz,
App-Einstellungen, das Zurücksetzen des HA-Aufgabenstatus, Terraform-Inventar-Aliase, das Löschen eines
Terraform-Status, Workflow-Läufe und Projekteinladungen. Auch Vorlagenbeschreibungen, Ansichten, das Leeren des
Projekt-Caches und geplante Synchronisierungen von Geheimnisspeichern werden nicht aufgezeichnet. Die für künftige
Versionen geplanten Ereignisse finden Sie unter [Audit-Ereignisse](/reference/audit-events).

## Wie geht es weiter {#whats-next}

- [Audit-Ereignisse](/reference/audit-events) — das Ereignisformat und alle aufgezeichneten Ereignisse.
- [Konfigurationsoptionen](/reference/configuration#audit-log) — alle `audit.*`-Optionen und Umgebungsvariablen.
- [Logs](/admin-guide/logs) — Server-, Aktivitäts- und Aufgaben-Logs.
