---
title: Audit-Log an ein SIEM senden
description: Semaphore Pro so konfigurieren, dass es Audit-Ereignisse über Syslog mit TLS an ein SIEM sendet, und rsyslog oder Vector für den Empfang einrichten.
---

# Audit-Log an ein SIEM senden <FeatureState feature="audit-siem-export" />

Semaphore Pro sendet jedes Ereignis des [Audit-Logs](/admin-guide/audit-log) als Syslog-Nachricht nach
RFC 5424 über TLS an ein SIEM.

## Bevor Sie beginnen {#before-you-begin}

- Eine Semaphore-Pro-Lizenz.
- Das [eingeschaltete Audit-Log](/admin-guide/audit-log#enable).
- Ein Syslog-Empfänger, der TLS unterstützt, zum Beispiel rsyslog oder Vector, siehe
  [Empfänger-Beispiele](#receivers).
- Das CA-Zertifikat, das das Zertifikat des Empfängers signiert hat, im PEM-Format, falls es nicht im
  Vertrauensspeicher des Systems liegt.

## Schritte {#steps}

Um das Audit-Log an ein SIEM zu senden, gehen Sie wie folgt vor:

1. Fügen Sie `config.json` den Abschnitt `audit.syslog` hinzu:

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
         "address": "siem.example.com:6514",
         "ca_file": "/etc/semaphore/siem-ca.pem",
         "server_name": "siem.example.com",
         "timeout": "10s"
       }
     }
   }
   ```

   Oder mit Umgebungsvariablen:

   ```bash
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` und `address` sind Pflicht. `ca_file` ergänzt den Vertrauensspeicher des Systems um eine CA.
   `server_name` ersetzt den Namen, der im Zertifikat des Empfängers geprüft wird. `timeout` begrenzt das
   Verbinden und Schreiben, standardmäßig 10 Sekunden.
2. Starten Sie Semaphore neu. Eine nicht lesbare CA-Datei oder eine fehlende `id` oder `address` bricht den
   Start mit einem Fehler ab.
3. Melden Sie sich mit einem falschen Passwort an. Das SIEM empfängt ein Ereignis `auth.login` mit dem
   Ergebnis `failure`.

## Wie Ereignisse zugestellt werden {#delivery}

- Semaphore merkt sich seine Position im Log unter der `id`. Nach einem Neustart setzt es dort fort, und
  Ereignisse, die aufgezeichnet wurden, während der Empfänger nicht erreichbar war, werden gesendet, sobald er
  wieder erreichbar ist. Eine neue `id` beginnt beim aktuellen Ereignis und sendet keine älteren.
- Die Zustellung erfolgt nach bestem Bemühen: Ein Ereignis, das in eine unbemerkt abgebrochene Verbindung
  geschrieben wurde, kann verloren gehen.
- Ein Ereignis kann doppelt ankommen, zum Beispiel nach einem Netzwerkfehler oder einem Failover. Entfernen
  Sie Duplikate anhand von `event_id` und ordnen Sie Ereignisse nach `seq`.
- Mit [Hochverfügbarkeit](/admin-guide/ha) sendet jeweils ein Knoten. Ein anderer Knoten übernimmt, wenn er
  stoppt.

## Empfänger-Beispiele {#receivers}

Semaphore sendet Nachrichten nach RFC 5424 mit Octet-Counting-Framing (RFC 5425). Der Nachrichtentext ist das
Ereignis-JSON. Der Syslog-`HOSTNAME` ist die Knoten-ID oder ohne HA die Instanz-ID, und `MSGID` ist der
`event_code`.

### rsyslog {#rsyslog}

Ereignisse über TLS empfangen und ein JSON-Ereignis pro Zeile schreiben:

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

### Vector {#vector}

Ereignisse über TLS empfangen und das Ereignis-JSON parsen:

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

## Nächste Schritte {#whats-next}

- [Audit-Log](/admin-guide/audit-log) — das Ereignisschema und was aufgezeichnet wird.
- [Audit-Ereignisse](/reference/audit-events) — jedes Ereignis mit Ergebnissen, Gründen und Metadaten.
- [Konfiguration](/reference/configuration) — jede Option `audit.*`.
