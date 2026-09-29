---
title: Audit log
description: Enable the security audit log, understand what it records, and send audit events from Semaphore Pro to a SIEM over Syslog with TLS.
---

# Audit log

The audit log records security-relevant activity: who acted, what they did, which object they affected,
where the request came from, and whether it succeeded. Operators use it to investigate changes, while
security teams use its documented event format for detection rules and compliance evidence.

Audit capture and local storage are available in Semaphore Community. Semaphore Pro can also send captured
events to a security information and event management (SIEM) system.

## How it differs from other logs {#log-types}

| Log | Use it for |
| --- | --- |
| Server log | Diagnosing Semaphore startup, configuration and runtime errors. |
| Activity log | Showing project users a feed of project activity. |
| Task log and history | Reviewing task execution, status and output. |
| Audit log | Investigating authentication and administrative actions across the installation. |

The audit log is independent of the [Activity log](/admin-guide/logs#activity-log). Enabling or exporting
one does not enable or export the other.

## What is recorded {#recorded-events}

The current release records supported authentication and identity-management events, including:

- successful sign-ins, failed sign-in attempts, sign-outs and TOTP checks;
- rejected API tokens, denied permissions and blocked cross-site requests;
- changes to users, passwords, TOTP enrollment, external identities and API tokens;
- changes to project membership, roles and template permissions;
- changes to system settings and Pro license activation;
- audit capture starting with the server.

A successful login is recorded after the user completes all required authentication steps, including TOTP.
For every available event and the events planned for later releases, see
[Audit events](/reference/audit-events).

## Sensitive data excluded from events {#sensitive-data}

Audit events identify an action without copying its credentials or secret payload. They exclude passwords,
passcodes, TOTP secrets and QR codes, recovery codes, session cookies, raw tokens, OAuth codes and claims,
private keys, passphrases, secret values, environment and survey values, webhook bodies, task output and
repository URLs.

API tokens are identified by a fingerprint, not by their value. A failed sign-in includes the submitted
login identifier, truncated to 64 bytes. If users sign in with an email address, that identifier can contain
an email address.

## Enable the audit log {#enable}

Choose a stable name for the installation, then set `audit.enabled` and `audit.instance_id` in
`config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

The instance ID must contain 1 to 255 printable ASCII characters without spaces. It appears in every event
and lets a SIEM distinguish several Semaphore installations.

Alternatively, use environment variables:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Restart Semaphore to apply the change. Capture starts after the restart; earlier activity is not added to
the audit log. The first event is `audit.lifecycle` with the action `start`.

For every option and environment variable, see
[Configuration options](/reference/configuration#audit-log).

## Record the client address behind a proxy {#trusted-proxies}

By default, an HTTP audit event records the address that connected directly to Semaphore. If that address
is a reverse proxy, add only the proxy networks to `audit.trusted_proxy_cidrs`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Or set:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore trusts `X-Forwarded-For` and `X-Real-IP` only from these networks. Do not add client networks: a
client in a trusted network could choose the source address recorded in its events. When several proxies
append `X-Forwarded-For`, Semaphore records the right-most address that is not a trusted proxy.

## Storage and limitations {#storage}

Semaphore stores audit events in its database. This release has no audit viewer, audit API, automatic
retention or pruning. Monitor database growth and include the audit data in your database backup policy.

Audit recording does not block the action being recorded. If storing an event fails, Semaphore writes an
error to the server log and continues the original operation. Local records are protected by the same
database access controls as the rest of Semaphore; they are not immutable or tamper-evident.

Each server start records `audit.lifecycle/start`. There is no stop event. A shutdown, crash, or disabled
audit log appears as a period without events before a later start event.

## Export to a SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro can send successfully captured events to an existing TLS Syslog receiver, such as rsyslog or
Vector. The receiver can store the events or forward them to your SIEM.

Before you begin, prepare:

- the receiver hostname and port;
- a stable destination ID, such as `security-syslog`;
- the CA certificate that signed the receiver certificate, if the CA is not already trusted by the
  Semaphore host.

Add `audit.syslog` to `config.json`:

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

Or use environment variables:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` and `address` are required. Keep the same ID when changing the receiver address or certificate so
Semaphore resumes from the saved position. A new ID starts with events recorded after that destination is
initialized; events already stored at that point are not sent to it.

`ca_file` adds certificates to the system trust store. `server_name` overrides the hostname checked in the
receiver certificate. Semaphore requires TLS 1.2 or later and always verifies the server certificate. It
does not support disabling verification or using a client certificate for this connection.

Restart Semaphore. Invalid destination settings or an unreadable CA file prevent Semaphore from starting.

### Verify delivery {#verify-siem-delivery}

After the restart, find the new event at the receiver and confirm:

- `event_code` is `audit.lifecycle`;
- `action` is `start`;
- `outcome` is `success`;
- `instance_id` matches the configured installation name;
- `metadata.destinations` contains the destination ID.

### Delivery behavior {#delivery}

- If the receiver is unavailable, Semaphore keeps captured events locally and retries them when the
  receiver returns. User requests continue normally.
- Syslog delivery is best effort. An event written to a connection that fails without notifying Semaphore
  can be lost.
- Network errors, restarts and HA failover can produce duplicate deliveries. Remove duplicates by
  `event_id` and order events by `seq`.
- In an [HA installation](/admin-guide/ha), one node normally sends to a destination at a time. Export
  pauses if Redis is unavailable, while capture continues in the shared database.

Semaphore sends RFC 5424 messages with TLS and octet-counted framing. The message body contains the audit
event JSON. `HOSTNAME` is the HA node ID, or the instance ID on a single node; `MSGID` is `event_code`.

### rsyslog receiver example {#rsyslog}

This rsyslog configuration fragment accepts the TLS connection and writes one event JSON object per line:

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

### Vector receiver example {#vector}

This Vector configuration accepts the TLS connection, parses the event JSON and writes it to a file:

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

### Troubleshoot export {#troubleshoot-export}

- If Semaphore does not start, check that both `audit.syslog.id` and `audit.syslog.address` are set and
  that the CA file contains readable PEM certificates.
- If TLS fails, check that the receiver certificate is valid for `server_name` and chains to a system or
  configured CA.
- If an event has not arrived yet, check the Semaphore server log and the receiver ingestion log. Export
  retries use a delay after failures.
- If events appear twice, deduplicate them by `event_id`; duplicates are expected after some retries and
  failovers.

## Actions without audit coverage {#not-recorded}

The `semaphore` command changes the database directly, so server-side CLI actions such as `user add` and
`user token` are not recorded. Access to the server and database must be controlled separately.

This release also has no audit event for license removal, app runtime settings, clearing HA task state,
Terraform inventory aliases, workflow runs or project invitations. The
[event catalog](/reference/audit-events) marks events planned for later releases.

## What's next {#whats-next}

- [Audit events](/reference/audit-events) — event fields, available and planned events, and compliance coverage.
- [Configuration options](/reference/configuration#audit-log) — every `audit.*` option and environment variable.
- [Logs](/admin-guide/logs) — server, Activity and task logs.
