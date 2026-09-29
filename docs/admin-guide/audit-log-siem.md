---
title: Send the audit log to a SIEM
description: Configure Semaphore Pro to send audit events to a SIEM over Syslog with TLS, and set up rsyslog or Vector to receive them.
---

# Send the audit log to a SIEM <FeatureState feature="audit-siem-export" />

Semaphore Pro sends every [audit log](/admin-guide/audit-log) event to a SIEM as an RFC 5424 Syslog message
over TLS.

## Before you begin {#before-you-begin}

- A Semaphore Pro license.
- The [audit log turned on](/admin-guide/audit-log#enable).
- A Syslog receiver that accepts TLS, for example rsyslog or Vector, see [Receiver examples](#receivers).
- The CA certificate that signed the receiver certificate, in PEM format, if it is not in the system trust
  store.

## Steps {#steps}

To send the audit log to a SIEM, follow these steps:

1. Add the `audit.syslog` section to `config.json`:

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

   Or using environment variables:

   ```bash
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` and `address` are required. `ca_file` adds a CA to the system trust store. `server_name` overrides
   the name checked in the receiver certificate. `timeout` limits connecting and writing, 10 seconds by
   default.
2. Restart Semaphore. An unreadable CA file or a missing `id` or `address` stops the start with an error.
3. Sign in with a wrong password. The SIEM receives an `auth.login` event with the outcome `failure`.

## How events are delivered {#delivery}

- Semaphore keeps its position in the log under the `id`. After a restart it resumes from there, and events
  recorded while the receiver was unreachable are sent when it comes back. A new `id` starts from the
  current event and does not send older ones.
- Delivery is best effort: an event written to a connection that dies silently can be lost.
- An event can arrive twice, for example after a network error or a failover. Remove duplicates by
  `event_id` and order events by `seq`.
- With [High availability](/admin-guide/ha), one node sends at a time. Another node takes over when it
  stops.

## Receiver examples {#receivers}

Semaphore sends RFC 5424 messages with octet-counted framing (RFC 5425). The message body is the event JSON.
The Syslog `HOSTNAME` is the node ID, or the instance ID without HA, and `MSGID` is the `event_code`.

### rsyslog {#rsyslog}

Receive events over TLS and write one JSON event per line:

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

Receive events over TLS and parse the event JSON:

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

## What's next {#whats-next}

- [Audit log](/admin-guide/audit-log) — the event schema and what is recorded.
- [Audit events](/reference/audit-events) — every event with its outcomes, reasons and metadata.
- [Configuration](/reference/configuration) — every `audit.*` option.
