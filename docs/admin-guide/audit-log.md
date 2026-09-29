---
title: Audit log
description: The security audit trail Semaphore records for logins, MFA, users, permissions, API tokens and settings, and how to turn it on.
---

# Audit log

The audit log is a security audit trail: who did what, from where, to which object, and with what result.
Security analysts and compliance teams read it, usually in a SIEM. Every event has a stable, documented
schema, so an analyst can write detection rules without knowing Semaphore internals.

The audit log is separate from the [Activity log](/admin-guide/logs). The Activity log is a feed for users
of a project. The audit log is a trail for the people who check that the system is used correctly.

## How it works {#overview}

When the audit log is enabled, Semaphore records an event for every security-relevant action that comes
through the web UI or the API: logins and logouts, MFA checks, changes to users, project members, roles and
permissions, API tokens, and system settings. Refused requests are recorded too: a failed login, an unknown
or expired API token, a denied permission, a blocked cross-site request.

Events are stored in the Semaphore database. Semaphore Pro can send them to a SIEM, see
[Export to a SIEM](#siem-export).

## Event schema {#event-schema}

Every event is a JSON object with the same fields. For the list of events, their outcomes, reasons and
metadata, see [Audit events](/reference/audit-events).

| Field | Description |
| --- | --- |
| `event_id` | Unique ID of the event. Use it to remove duplicates in the SIEM. |
| `seq` | Sequence number, without gaps, that grows with every event. Use it to order events. |
| `timestamp` | Time of the event in UTC. |
| `schema_version` | Version of this schema. It changes only when a field is renamed, removed or retyped. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system` or `audit`. |
| `event_code` | What the event is about, for example `iam.api_token`. |
| `type` | Kind of change: `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied` or `info`. |
| `action` | What was done, for example `create`. |
| `outcome` | `success` or `failure`. |
| `reason` | Why the action failed, from a fixed list per event. Empty on success. |
| `actor` | Who acted: its `type` (`user`, `anonymous`, `system`, `runner`, `integration`), `id` and `name`. For a user, also `auth` (`session` or `api_token`) and, for an API token, `token_fingerprint`. |
| `source` | For requests to the web UI and API: the client `ip` and `user_agent`. |
| `target` | The object acted on: its `type`, `id` and `name`. |
| `scope` | The `project_id` for events inside a project. |
| `request_id` | ID of the HTTP request. Semaphore also returns it in the `X-Request-ID` response header. |
| `instance_id` | Name of this Semaphore installation, from `audit.instance_id`. |
| `node_id` | Node that recorded the event, when [High availability](/admin-guide/ha) is on. |
| `metadata` | Extra details that depend on the event. |

`timestamp` is the database time, in microseconds, or in milliseconds on SQLite. Order events by `seq`: two
events can have the same time, but never the same `seq`.

On MySQL, the `created` column of the `audit_event` table uses the time zone of the connection option
`loc`, UTC by default. The `timestamp` of every event is always in UTC.

Each start of the server records `audit.lifecycle` with the action `start`. There is no stop event: a stop,
a crash, or turning the audit log off shows as a gap in time before the next `start`.

## What is never recorded {#never-recorded}

The audit log never contains passwords, passcodes, TOTP secrets and QR codes, recovery codes, session
cookies, tokens, OAuth codes and claims, private keys, passphrases, secret values, environment and survey
values, webhook bodies, task output, email addresses or URLs. An API token is identified only by its
fingerprint: the first 16 hex characters of its SHA-256 hash.

The user ID and username identify the actor. A failed login records the login that was typed, cut to 64
bytes, because a failed-login investigation needs it.

## Turn on the audit log {#enable}

Set `audit.enabled` and give the installation a name in `audit.instance_id`. The name is 1 to 255 printable
ASCII characters without spaces, and it appears in every event.

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
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Restart Semaphore to apply the change. For all options, see [Configuration](/reference/configuration).

## Client address behind a reverse proxy {#trusted-proxies}

Behind a reverse proxy, the direct peer of Semaphore is the proxy, and the client address comes from the
`X-Forwarded-For` or `X-Real-IP` header. Semaphore reads these headers only when the direct peer is inside
`audit.trusted_proxy_cidrs`. Otherwise it records the peer address, so a client cannot forge its address.

List only your reverse proxies in `audit.trusted_proxy_cidrs`, never client networks. A client inside a
trusted range can put any address into `X-Forwarded-For`.

The recorded address is the right-most address in `X-Forwarded-For` that is not a trusted proxy.
`X-Real-IP` is used only when there is no `X-Forwarded-For`, and only when it has a single value.

## Storage {#storage}

Events are stored in the Semaphore database and are never deleted: this version has no retention. Plan the
size of the database for the number of logins and changes in your installation.

## Compliance mapping {#compliance}

Semaphore records the events you need for these controls. It does not make your installation compliant by
itself.

| Requirement | Covered by | Status |
| --- | --- | --- |
| PCI DSS 10.2.1.1 access to sensitive data (analogue: secrets) | `iam.mfa/view_qr` | Available |
| PCI DSS 10.2.1.1 access to sensitive data (analogue: secrets) | `resource.project_backup/export` | Planned |
| PCI DSS 10.2.1.2 actions by administrators / ISO 27002 8.15 use of privileges | `iam.*`, `system.*` | Available |
| PCI DSS 10.2.1.2 actions by administrators / ISO 27002 8.15 use of privileges | `resource.*`, `secret.*` | Planned |
| PCI DSS 10.2.1.2 actions by administrators / ISO 27002 8.15 use of privileges | `runner.*`, `task.control`, `task.history` | Planned |
| PCI DSS 10.2.1.3 access to audit logs | Not applicable: Semaphore gives no access to the audit trail. | — |
| PCI DSS 10.2.1.4 invalid logical access attempts / ISO rejected access attempts | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Available |
| PCI DSS 10.2.1.4 invalid logical access attempts / ISO rejected access attempts | `runner.lifecycle/register` failure | Planned |
| PCI DSS 10.2.1.5 changes to identification and authentication credentials | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Available |
| PCI DSS 10.2.1.5 changes to identification and authentication credentials | `runner.credential` | Planned |
| PCI DSS 10.2.1.6 start/stop/pause of audit logs / ISO activation of security systems | `audit.lifecycle/start`; a stop shows as the gap before it | Available |
| PCI DSS 10.2.1.7 creation and deletion of system-level objects | `resource.*` create/delete | Planned |
| PCI DSS 10.2.1.7 creation and deletion of system-level objects | `runner.lifecycle` create/delete | Planned |
| PCI DSS 10.2.2 required fields | `actor`, `event_code` and `action`, `timestamp`, `outcome`, `source` or `node_id`, `target` or `scope` | Available |
| PCI DSS 10.3.3 prompt backup to a central log server | Export to a SIEM over Syslog+TLS | Available |
| PCI DSS 10.3.3 prompt backup to a central log server | Export to a SIEM over Splunk HEC | Planned |

Planned events are not recorded in this version.

## What is not recorded in this version {#not-recorded}

- Actions done with the `semaphore` command on the server, such as `user add` or `user token`. They change
  the database directly, and whoever can run them can also change the audit table.
- License removal, app runtime settings, clearing the HA task state, Terraform inventory aliases, workflow
  runs and project invites. They have no audit event yet.

## Export to a SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro sends the audit log to a SIEM over Syslog with TLS. It keeps its position in the log for the
SIEM, so events recorded while the SIEM is unreachable are sent when it comes back. For the steps, see
[Send the audit log to a SIEM](/admin-guide/audit-log-siem).

## What's next {#whats-next}

- [Send the audit log to a SIEM](/admin-guide/audit-log-siem) — export the events over Syslog+TLS.
- [Audit events](/reference/audit-events) — every event with its outcomes, reasons and metadata.
- [Configuration](/reference/configuration) — every `audit.*` option.
