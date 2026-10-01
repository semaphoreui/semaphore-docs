---
title: Audit log
description: Turn on the audit log to see who did what in Semaphore, and send audit events from Semaphore Pro to a SIEM.
---

# Audit log

The audit log keeps a record of important actions in Semaphore: who signed in, who changed a user or a
role, who created an API token. Each event shows who did it, when, from which address, and whether it
worked. Use it to find out what happened on your installation, or send the events to your SIEM to keep them
next to the rest of your logs.

The audit log is available in every edition. Sending events to a SIEM requires Semaphore Pro.

## What is recorded {#recorded-events}

Semaphore currently records sign-in, account and project activity:

- sign-ins, failed sign-in attempts, sign-outs and two-factor checks;
- rejected API tokens, denied requests and blocked cross-site requests;
- changes to users, passwords, two-factor authentication, external identities and API tokens;
- changes to project members, roles and template permissions;
- changes to projects, inventories, repositories, templates, schedules, integrations, host configs,
  environments, credentials and secret storages, and project backup exports and restores;
- changes to system settings and Pro license activation;
- every server start.

More events will be added in future releases. For the full list, see
[Audit events](/reference/audit-events).

Passwords, tokens, secret values and task output never appear in audit events. API tokens are shown by a
fingerprint instead of their value. A failed sign-in keeps the login name that was entered, so it can
contain an email address.

Repository URLs, host config URLs and integration aliases are not recorded either. If an environment is saved
but one of its secrets fails, the API returns an error, yet the environment exists. The event is then a
success with `metadata.partial=true` and `reason=secret_failed`. A template whose inventory step failed (`reason=inventory_failed`) and a project whose setup failed (`reason=setup_failed`) are recorded the same way. So is a delete of an environment (`reason=secret_failed`) or a secret storage (`reason=key_failed`) whose row is gone while some of its secrets could not be removed.

## Enable the audit log {#enable}

The audit log is off by default. To turn it on, set `audit.enabled` and give your installation a name in
`audit.instance_id`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Or using environment variables:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

The instance ID is 1 to 255 characters without spaces. It is added to every event, so you can tell your
installations apart when they send events to the same place.

Restart Semaphore. Recording starts after the restart; earlier actions are not added. For all options, see
[Configuration options](/reference/configuration#audit-log).

## Record the client address behind a proxy {#trusted-proxies}

If Semaphore runs behind a reverse proxy, events show the address of the proxy instead of the user. To
record the real client address, list your proxy networks in `audit.trusted_proxy_cidrs`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Or using environment variables:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore then takes the client address from `X-Forwarded-For` or `X-Real-IP`, but only for requests that
come from these networks. If requests pass through several proxies, list all of them. Do not list the
networks your users connect from: anyone there could set these headers to any address.

## Storage {#storage}

Events are stored in the Semaphore database, so your regular database backups include them. Semaphore does
not show audit events in the UI and does not delete old events, so keep an eye on the database size.

The audit log never gets in the way of your users. If an event cannot be saved, Semaphore writes an error
to the server log and the action continues as usual.

## Export to a SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro can send audit events to a Syslog receiver over TLS, such as rsyslog or Vector. The receiver
can store them or pass them on to your SIEM.

You will need:

- the receiver hostname and port;
- a name for this destination, such as `security-syslog`;
- the CA certificate of the receiver, if the Semaphore host does not trust it already.

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

Or using environment variables:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` and `address` are required. Semaphore remembers which events it has already sent to each destination,
so keep the same `id` when you change the address or the certificate. A new `id` starts with new events.

Semaphore always checks the receiver certificate and uses TLS 1.2 or later. `ca_file` adds your CA to the
trusted certificates, and `server_name` sets the name to check in the certificate when it differs from the
address.

Restart Semaphore. If the settings are invalid or the CA file cannot be read, Semaphore does not start.

### Check that events arrive {#verify-siem-delivery}

Semaphore records an event every time it starts. After the restart, look for it at the receiver:
`event_code` is `audit.lifecycle`, `action` is `start`, and `metadata.destinations` includes your
destination ID.

### How events are delivered {#delivery}

- If the receiver is down, events wait in the database and are sent when it is back. Users don't notice
  anything.
- After network errors, restarts or an HA failover, some events can arrive twice. Use `event_id` to drop
  duplicates and `seq` to put events in order.
- If a connection breaks without an error, the event sent at that moment can be lost.
- In an [HA installation](/admin-guide/ha), one node sends events at a time. If Redis is unavailable,
  sending pauses, and events are still recorded.

Each event is sent as an RFC 5424 Syslog message with the event JSON as its body. `HOSTNAME` is the HA node
ID, or the instance ID on a single node, and `MSGID` is the event code.

### rsyslog example {#rsyslog}

This rsyslog configuration accepts the TLS connection and writes one event per line:

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

### Vector example {#vector}

This Vector configuration accepts the TLS connection, reads the event JSON and writes it to a file:

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

- **Semaphore does not start.** Check that both `audit.syslog.id` and `audit.syslog.address` are set and
  that the CA file contains PEM certificates.
- **The TLS connection fails.** Check that the receiver certificate matches `server_name` and is signed by
  a CA that Semaphore trusts.
- **Events do not arrive.** Check the Semaphore server log and the receiver log. After a failure, Semaphore
  waits a little before it tries again.
- **Some events arrive twice.** This can happen after retries and failovers. Drop duplicates by `event_id`.

## What is not recorded {#not-recorded}

The `semaphore` command-line tool works with the database directly, so commands such as `user add` and
`user token` are not recorded.

Some actions in the UI are not recorded yet: removing a license, app settings, clearing HA task state,
Terraform inventory aliases, deleting a Terraform state, workflow runs and project invitations. Template
descriptions, views, clearing the project cache and scheduled secret storage syncs are not recorded either.
For the events planned for future releases, see [Audit events](/reference/audit-events).

## What's next {#whats-next}

- [Audit events](/reference/audit-events) — the event format and every recorded event.
- [Configuration options](/reference/configuration#audit-log) — every `audit.*` option and environment variable.
- [Logs](/admin-guide/logs) — server, activity and task logs.
