---
title: Audit-Protokoll
description: Aktivieren Sie das Sicherheits-Audit-Protokoll, erfahren Sie, was es aufzeichnet, und senden Sie Audit-Ereignisse aus Semaphore Pro über Syslog mit TLS an ein SIEM.
---

# Audit-Protokoll

Das Audit-Protokoll zeichnet sicherheitsrelevante Aktivitäten auf: wer gehandelt hat, was getan wurde, welches
Objekt betroffen war, woher die Anfrage kam und ob sie erfolgreich war. Betreiber untersuchen damit Änderungen,
während Sicherheitsteams das dokumentierte Ereignisformat für Erkennungsregeln und Compliance-Nachweise nutzen.

Das Erfassen und lokale Speichern von Audit-Ereignissen ist in Semaphore Community verfügbar. Semaphore Pro kann
erfasste Ereignisse außerdem an ein Security-Information-and-Event-Management-System (SIEM) senden.

## Unterschiede zu anderen Protokollen {#log-types}

| Protokoll | Verwendung |
| --- | --- |
| Serverprotokoll | Diagnose von Fehlern beim Start, bei der Konfiguration und während der Ausführung von Semaphore. |
| Aktivitätsprotokoll | Anzeige eines Feeds mit Projektaktivitäten für Projektbenutzer. |
| Task-Protokoll und -Verlauf | Überprüfung von Task-Ausführung, Status und Ausgabe. |
| Audit-Protokoll | Untersuchung von Authentifizierungs- und Verwaltungsaktionen in der gesamten Installation. |

Das Audit-Protokoll ist unabhängig vom [Aktivitätsprotokoll](/admin-guide/logs#activity-log). Das Aktivieren oder
Exportieren des einen Protokolls aktiviert oder exportiert nicht das andere.

## Was aufgezeichnet wird {#recorded-events}

Die aktuelle Version zeichnet unterstützte Authentifizierungs- und Identitätsverwaltungsereignisse auf, darunter:

- erfolgreiche und fehlgeschlagene Anmeldungen, Abmeldungen und TOTP-Prüfungen;
- abgelehnte API-Tokens, verweigerte Berechtigungen und blockierte Cross-Site-Anfragen;
- Änderungen an Benutzern, Passwörtern, TOTP-Registrierungen, externen Identitäten und API-Tokens;
- Änderungen an Projektmitgliedschaften, Rollen und Vorlagenberechtigungen;
- Änderungen an Systemeinstellungen und der Aktivierung der Pro-Lizenz;
- den Start der Audit-Erfassung beim Serverstart.

Eine erfolgreiche Anmeldung wird aufgezeichnet, nachdem der Benutzer alle erforderlichen Authentifizierungsschritte
einschließlich TOTP abgeschlossen hat. Alle verfügbaren sowie für spätere Versionen geplanten Ereignisse finden Sie
unter [Audit-Ereignisse](/reference/audit-events).

## Aus Ereignissen ausgeschlossene sensible Daten {#sensitive-data}

Audit-Ereignisse identifizieren eine Aktion, ohne zugehörige Anmeldedaten oder geheime Nutzdaten zu kopieren. Sie
enthalten keine Passwörter, Passcodes, TOTP-Geheimnisse und QR-Codes, Wiederherstellungscodes, Sitzungscookies,
Token-Rohwerte, OAuth-Codes und -Claims, privaten Schlüssel, Passphrasen, Secret-Werte, Umgebungs- und
Umfragewerte, Webhook-Inhalte, Task-Ausgaben oder Repository-URLs.

API-Tokens werden durch einen Fingerabdruck und nicht durch ihren Wert identifiziert. Eine fehlgeschlagene Anmeldung
enthält die eingegebene Anmeldekennung, gekürzt auf 64 Bytes. Wenn sich Benutzer mit einer E-Mail-Adresse anmelden,
kann diese Kennung eine E-Mail-Adresse enthalten.

## Audit-Protokoll aktivieren {#enable}

Wählen Sie einen dauerhaften Namen für die Installation und legen Sie anschließend `audit.enabled` und
`audit.instance_id` in `config.json` fest:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Die Instanz-ID muss aus 1 bis 255 druckbaren ASCII-Zeichen ohne Leerzeichen bestehen. Sie erscheint in jedem
Ereignis und ermöglicht einem SIEM, mehrere Semaphore-Installationen voneinander zu unterscheiden.

Alternativ können Sie Umgebungsvariablen verwenden:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Starten Sie Semaphore neu, um die Änderung anzuwenden. Die Erfassung beginnt nach dem Neustart; vorherige
Aktivitäten werden dem Audit-Protokoll nicht hinzugefügt. Das erste Ereignis ist `audit.lifecycle` mit der Aktion
`start`.

Alle Optionen und Umgebungsvariablen finden Sie unter
[Konfigurationsoptionen](/reference/configuration#audit-log).

## Client-Adresse hinter einem Proxy aufzeichnen {#trusted-proxies}

Standardmäßig zeichnet ein HTTP-Audit-Ereignis die Adresse auf, die sich direkt mit Semaphore verbunden hat. Wenn
diese Adresse zu einem Reverse Proxy gehört, fügen Sie ausschließlich die Proxy-Netzwerke zu
`audit.trusted_proxy_cidrs` hinzu:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Oder legen Sie Folgendes fest:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore vertraut `X-Forwarded-For` und `X-Real-IP` nur bei Anfragen aus diesen Netzwerken. Fügen Sie keine
Client-Netzwerke hinzu: Ein Client in einem vertrauenswürdigen Netzwerk könnte die in seinen Ereignissen
aufgezeichnete Quelladresse selbst bestimmen. Wenn mehrere Proxys Werte an `X-Forwarded-For` anhängen, zeichnet
Semaphore die am weitesten rechts stehende Adresse auf, die nicht zu einem vertrauenswürdigen Proxy gehört.

## Speicherung und Einschränkungen {#storage}

Semaphore speichert Audit-Ereignisse in seiner Datenbank. Diese Version bietet weder eine Audit-Ansicht noch eine
Audit-API, automatische Aufbewahrungsregeln oder Bereinigung. Überwachen Sie das Wachstum der Datenbank und nehmen
Sie die Audit-Daten in Ihre Richtlinie für Datenbanksicherungen auf.

Die Audit-Aufzeichnung blockiert die aufgezeichnete Aktion nicht. Falls das Speichern eines Ereignisses fehlschlägt,
schreibt Semaphore einen Fehler in das Serverprotokoll und setzt den ursprünglichen Vorgang fort. Lokale Datensätze
werden durch dieselben Datenbankzugriffskontrollen geschützt wie die übrigen Semaphore-Daten; sie sind weder
unveränderlich noch manipulationssicher.

Jeder Serverstart zeichnet `audit.lifecycle/start` auf. Es gibt kein Stopp-Ereignis. Ein Herunterfahren, Absturz
oder deaktiviertes Audit-Protokoll zeigt sich als Zeitraum ohne Ereignisse vor einem späteren Start-Ereignis.

## Export an ein SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro kann erfolgreich erfasste Ereignisse an einen vorhandenen TLS-Syslog-Empfänger wie rsyslog oder
Vector senden. Der Empfänger kann die Ereignisse speichern oder an Ihr SIEM weiterleiten.

Bereiten Sie zunächst Folgendes vor:

- Hostname und Port des Empfängers;
- eine dauerhafte Ziel-ID, zum Beispiel `security-syslog`;
- das CA-Zertifikat, mit dem das Empfängerzertifikat signiert wurde, sofern die CA auf dem Semaphore-Host nicht
  bereits als vertrauenswürdig gilt.

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

Alternativ können Sie Umgebungsvariablen verwenden:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` und `address` sind erforderlich. Behalten Sie dieselbe ID bei, wenn Sie die Empfängeradresse oder das
Zertifikat ändern, damit Semaphore an der gespeicherten Position fortfährt. Eine neue ID beginnt mit Ereignissen,
die nach der Initialisierung dieses Ziels aufgezeichnet werden; zu diesem Zeitpunkt bereits gespeicherte Ereignisse
werden nicht an das neue Ziel gesendet.

`ca_file` ergänzt den Vertrauensspeicher des Systems um Zertifikate. `server_name` überschreibt den Hostnamen, der
im Empfängerzertifikat geprüft wird. Semaphore erfordert TLS 1.2 oder höher und überprüft das Serverzertifikat
immer. Das Deaktivieren der Überprüfung oder die Verwendung eines Client-Zertifikats für diese Verbindung wird
nicht unterstützt.

Starten Sie Semaphore neu. Ungültige Zieleinstellungen oder eine nicht lesbare CA-Datei verhindern den Start von
Semaphore.

### Zustellung überprüfen {#verify-siem-delivery}

Suchen Sie nach dem Neustart das neue Ereignis beim Empfänger und überprüfen Sie Folgendes:

- `event_code` ist `audit.lifecycle`;
- `action` ist `start`;
- `outcome` ist `success`;
- `instance_id` entspricht dem konfigurierten Installationsnamen;
- `metadata.destinations` enthält die Ziel-ID.

### Zustellungsverhalten {#delivery}

- Wenn der Empfänger nicht verfügbar ist, behält Semaphore erfasste Ereignisse lokal und versucht die Zustellung
  erneut, sobald der Empfänger wieder verfügbar ist. Benutzeranfragen werden normal fortgesetzt.
- Die Syslog-Zustellung erfolgt nach bestem Bemühen. Ein Ereignis, das in eine Verbindung geschrieben wurde, die
  ausfällt, ohne Semaphore darüber zu informieren, kann verloren gehen.
- Netzwerkfehler, Neustarts und HA-Failover können zu doppelten Zustellungen führen. Entfernen Sie Duplikate anhand
  von `event_id` und ordnen Sie Ereignisse nach `seq`.
- In einer [HA-Installation](/admin-guide/ha) sendet normalerweise jeweils ein Knoten an ein Ziel. Der Export wird
  pausiert, wenn Redis nicht verfügbar ist, während die Erfassung in der gemeinsamen Datenbank fortgesetzt wird.

Semaphore sendet RFC-5424-Nachrichten mit TLS und längenbasierter Rahmung (Octet Counting). Der Nachrichtentext
enthält das Audit-Ereignis als JSON. `HOSTNAME` ist die HA-Knoten-ID oder bei einem einzelnen Knoten die Instanz-ID;
`MSGID` ist `event_code`.

### Beispiel für einen rsyslog-Empfänger {#rsyslog}

Dieses rsyslog-Konfigurationsfragment akzeptiert die TLS-Verbindung und schreibt pro Zeile ein Audit-Ereignis als
JSON-Objekt:

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

### Beispiel für einen Vector-Empfänger {#vector}

Diese Vector-Konfiguration akzeptiert die TLS-Verbindung, analysiert das Ereignis-JSON und schreibt es in eine
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

### Exportprobleme beheben {#troubleshoot-export}

- Wenn Semaphore nicht startet, überprüfen Sie, ob sowohl `audit.syslog.id` als auch `audit.syslog.address`
  festgelegt sind und die CA-Datei lesbare PEM-Zertifikate enthält.
- Wenn TLS fehlschlägt, überprüfen Sie, ob das Empfängerzertifikat für `server_name` gültig und mit einer
  systemweit vertrauenswürdigen oder konfigurierten CA verkettet ist.
- Wenn ein Ereignis noch nicht eingetroffen ist, prüfen Sie das Semaphore-Serverprotokoll und das
  Erfassungsprotokoll des Empfängers. Nach Fehlern wartet der Export vor einem erneuten Versuch.
- Wenn Ereignisse doppelt erscheinen, entfernen Sie Duplikate anhand von `event_id`; nach einigen erneuten
  Versuchen und Failovers sind Duplikate zu erwarten.

## Aktionen ohne Audit-Abdeckung {#not-recorded}

Der Befehl `semaphore` ändert die Datenbank direkt. Daher werden serverseitige CLI-Aktionen wie `user add` und
`user token` nicht aufgezeichnet. Der Zugriff auf Server und Datenbank muss separat kontrolliert werden.

Diese Version enthält außerdem kein Audit-Ereignis für das Entfernen der Lizenz, App-Laufzeiteinstellungen, das
Löschen des HA-Task-Zustands, Terraform-Inventar-Aliasse, Workflow-Ausführungen oder Projekteinladungen. Der
[Ereigniskatalog](/reference/audit-events) kennzeichnet Ereignisse, die für spätere Versionen geplant sind.

## Nächste Schritte {#whats-next}

- [Audit-Ereignisse](/reference/audit-events) — Ereignisfelder, verfügbare und geplante Ereignisse sowie Compliance-Abdeckung.
- [Konfigurationsoptionen](/reference/configuration#audit-log) — alle `audit.*`-Optionen und Umgebungsvariablen.
- [Protokolle](/admin-guide/logs) — Server-, Aktivitäts- und Task-Protokolle.
