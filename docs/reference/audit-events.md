---
title: Audit events
description: The audit event format and the complete catalog of available and planned events, with outcomes, reasons, editions and availability.
---

# Audit events

This reference lists the events you can use for investigations, SIEM rules and compliance evidence. For setup instructions, see [Audit log](/admin-guide/audit-log).

**Available** events are recorded by the current release. **Planned** events are not recorded in this release and must not be used for current SIEM rules or compliance claims. **Edition** is the minimum Semaphore edition that can produce the event. SIEM export is a separate Pro feature.

## Event format {#event-format}

Every exported event is a JSON object. Fields marked conditional are omitted when they do not apply.

| Field | When present | Meaning |
| --- | --- | --- |
| `event_id` | Always | Unique event ID. Use it to remove duplicate deliveries. |
| `seq` | Always | Increasing sequence number. Use it to restore event order. |
| `timestamp` | Always | Event time in UTC. |
| `schema_version` | Always | Version of the event envelope. |
| `category`, `event_code`, `type`, `action` | Always | Stable values that identify what happened. |
| `outcome` | Always | `success` or `failure`. |
| `reason` | Always | A documented reason on supported failures; empty on success. |
| `actor` | Always | The user, anonymous client, system component, runner or integration that acted. |
| `source` | HTTP requests | Client IP address and, when available, User-Agent. |
| `target` | When an object is identified | The object affected by the action. |
| `scope` | Project events | The project that contains the action. |
| `request_id` | HTTP requests | The request ID also returned in `X-Request-ID`. |
| `instance_id` | Always | The installation name configured by the administrator. |
| `node_id` | HA installations | The node that recorded the event. |
| `metadata` | Always | Additional fields documented for the event kind. |

## Authentication {#authentication}

A successful `auth.login` means that sign-in is complete, including any required TOTP check. A failed MFA check produces an `auth.mfa` failure, not an additional `auth.login` failure.

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `auth.login` | `authenticate` | `start` | success, failure | `invalid_credentials`, `user_not_found`, `method_disabled`, `invalid_state`, `provider_error`, `internal_error` | `method`, `provider` | Community | Available |
| `auth.logout` | `terminate_session` | `end` | success |  |  | Community | Available |
| `auth.mfa` | `verify_totp` | `info` | success, failure | `invalid_passcode` |  | Community | Available |
| `auth.mfa` | `verify_email` | `info` | success, failure | `invalid_passcode`, `code_expired`, `too_many_attempts` |  | Pro | Planned |
| `auth.mfa` | `recover` | `info` | success, failure | `invalid_recovery_code` |  | Community | Available |
| `auth.api_token` | `reject` | `denied` | failure | `token_unknown`, `token_expired` |  | Community | Available |
| `auth.authorization` | `deny` | `denied` | failure | `forbidden` | `method`, `permission` | Community | Available |
| `auth.csrf` | `block` | `denied` | failure | `cross_origin` | `method` | Community | Available |

## Identity and access management {#identity-and-access-management}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `iam.user` | `create` | `creation` | success |  | `admin`, `pro`, `external` | Community | Available |
| `iam.user` | `update` | `change` | success |  | `fields`, `admin`, `pro` | Community | Available |
| `iam.user` | `delete` | `deletion` | success |  |  | Community | Available |
| `iam.user` | `auto_provision` | `creation` | success |  | `method`, `provider` | Community | Available |
| `iam.user_password` | `change` | `change` | success, failure | `invalid_current_password` |  | Community | Available |
| `iam.user_password` | `admin_reset` | `change` | success |  |  | Community | Available |
| `iam.mfa` | `enable` | `change` | success |  |  | Community | Available |
| `iam.mfa` | `disable` | `change` | success |  |  | Community | Available |
| `iam.mfa` | `view_qr` | `access` | success |  |  | Community | Available |
| `iam.external_identity` | `link` | `change` | success |  | `method`, `provider` | Community | Available |
| `iam.external_identity` | `unlink` | `change` | success |  | `method`, `provider` | Community | Available |
| `iam.api_token` | `create` | `creation` | success |  |  | Community | Available |
| `iam.api_token` | `delete` | `deletion` | success |  |  | Community | Available |
| `iam.membership` | `add` | `change` | success |  | `role`, `self_removal` | Community | Available |
| `iam.membership` | `remove` | `change` | success, failure | `owner_self_change` | `role`, `self_removal` | Community | Available |
| `iam.project_role` | `change` | `change` | success, failure | `owner_self_change` | `old_role`, `new_role` | Community | Available |
| `iam.role` | `create` | `creation` | success |  | `permissions` | Pro | Available |
| `iam.role` | `update` | `change` | success |  | `permissions` | Pro | Available |
| `iam.role` | `delete` | `deletion` | success |  |  | Pro | Available |
| `iam.project_role_definition` | `create` | `creation` | success |  | `permissions` | Pro | Available |
| `iam.project_role_definition` | `update` | `change` | success |  | `permissions` | Pro | Available |
| `iam.project_role_definition` | `delete` | `deletion` | success |  |  | Pro | Available |
| `iam.template_permission` | `create` | `creation` | success |  | `template_id`, `role_slug`, `permissions` | Community | Available |
| `iam.template_permission` | `update` | `change` | success |  | `template_id`, `role_slug`, `permissions` | Community | Available |
| `iam.template_permission` | `delete` | `deletion` | success |  | `template_id` | Community | Available |

## Resources {#resources}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `resource.project` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.project` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.project` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.project_backup` | `export` | `access` | success |  | Defined when available | Community | Planned |
| `resource.project_backup` | `restore` | `change` | success |  | Defined when available | Community | Planned |
| `resource.inventory` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.inventory` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.inventory` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.repository` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.repository` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.repository` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.template` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.template` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.template` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.template` | `attach_inventory` | `change` | success |  | Defined when available | Community | Planned |
| `resource.template` | `detach_inventory` | `change` | success |  | Defined when available | Community | Planned |
| `resource.template` | `set_default_inventory` | `change` | success |  | Defined when available | Community | Planned |
| `resource.schedule` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.schedule` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.schedule` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.schedule` | `activate` | `change` | success |  | Defined when available | Community | Planned |
| `resource.schedule` | `deactivate` | `change` | success |  | Defined when available | Community | Planned |
| `resource.integration` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.integration` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.integration` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.integration_matcher` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.integration_matcher` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.integration_matcher` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.integration_extractor` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.integration_extractor` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.integration_extractor` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.integration_alias` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.integration_alias` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.host_config` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.host_config` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.host_config` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.workflow` | `create` | `creation` | success |  | Defined when available | Pro | Planned |
| `resource.workflow` | `update` | `change` | success |  | Defined when available | Pro | Planned |
| `resource.workflow` | `delete` | `deletion` | success |  | Defined when available | Pro | Planned |
| `resource.environment` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `resource.environment` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `resource.environment` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `resource.environment` | `sync` | `change` | success |  | Defined when available | Community | Planned |

## Secrets {#secrets}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `secret.credential` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `secret.credential` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `secret.credential` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `secret.storage` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `secret.storage` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `secret.storage` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `secret.storage` | `sync` | `change` | success |  | Defined when available | Community | Planned |

## Tasks {#tasks}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `task.execution` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `task.approval` | `request` | `info` | success |  | Defined when available | Community | Planned |
| `task.approval` | `approve` | `change` | success |  | Defined when available | Community | Planned |
| `task.approval` | `reject` | `change` | success |  | Defined when available | Community | Planned |
| `task.control` | `stop` | `change` | success |  | Defined when available | Community | Planned |
| `task.control` | `force_stop` | `change` | success |  | Defined when available | Community | Planned |
| `task.control` | `stop_all` | `change` | success |  | Defined when available | Community | Planned |
| `task.execution` | `complete` | `end` | success |  | Defined when available | Community | Planned |
| `task.history` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |

## Runners {#runners}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `runner.lifecycle` | `create` | `creation` | success |  | Defined when available | Community | Planned |
| `runner.lifecycle` | `update` | `change` | success |  | Defined when available | Community | Planned |
| `runner.lifecycle` | `delete` | `deletion` | success |  | Defined when available | Community | Planned |
| `runner.lifecycle` | `enable` | `change` | success |  | Defined when available | Community | Planned |
| `runner.lifecycle` | `disable` | `change` | success |  | Defined when available | Community | Planned |
| `runner.lifecycle` | `register` | `creation` | success, failure | `invalid_registration_token` | `token` | Community | Planned |
| `runner.lifecycle` | `unregister` | `deletion` | success |  | Defined when available | Community | Planned |
| `runner.credential` | `rotate_registration_token` | `change` | success |  | Defined when available | Community | Planned |
| `runner.cache` | `clear` | `deletion` | success |  | Defined when available | Community | Planned |
| `runner.progress` | `reject` | `denied` | failure | `invalid_status` |  | Community | Planned |

## System and audit {#system-and-audit}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `system.settings` | `update` | `change` | success |  | `keys` | Community | Available |
| `system.license` | `activate` | `change` | success, failure | `activation_failed` |  | Pro | Available |
| `audit.lifecycle` | `start` | `start` | success |  | `destinations` | Community | Available |

## Compliance coverage {#compliance-coverage}

Audit events can provide evidence for parts of these controls. Semaphore does not make an installation compliant by itself. Planned coverage is not available in this release.

| Requirement | Covered by | Status |
| --- | --- | --- |
| PCI DSS 10.2.1.1 access to sensitive data | `iam.mfa/view_qr` | Available |
| PCI DSS 10.2.1.1 access to sensitive data | `resource.project_backup/export` | Planned |
| PCI DSS 10.2.1.2 administrator actions / ISO 27002 8.15 use of privileges | `iam.*`, `system.*` | Available |
| PCI DSS 10.2.1.2 administrator actions / ISO 27002 8.15 use of privileges | `resource.*`, `secret.*`, `runner.*`, `task.control`, `task.history` | Planned |
| PCI DSS 10.2.1.3 access to audit logs | No Semaphore UI or API exposes the audit trail | Not applicable |
| PCI DSS 10.2.1.4 invalid logical access attempts | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Available |
| PCI DSS 10.2.1.4 invalid logical access attempts | `runner.lifecycle/register` failure | Planned |
| PCI DSS 10.2.1.5 credential and identity changes | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Available |
| PCI DSS 10.2.1.5 credential and identity changes | `runner.credential` | Planned |
| PCI DSS 10.2.1.6 audit logging lifecycle | `audit.lifecycle/start`; a stop appears as a gap before the next start | Available |
| PCI DSS 10.2.1.7 creation and deletion of system-level objects | `resource.*` create/delete | Planned |
| PCI DSS 10.2.1.7 creation and deletion of system-level objects | `runner.lifecycle` create/delete | Planned |
| PCI DSS 10.2.2 required fields | Event actor, action, timestamp, outcome, source or node ID, and target or scope | Available |
| PCI DSS 10.3.3 central log server | Syslog over TLS | Available |
| PCI DSS 10.3.3 central log server | HEC | Planned |

## Related pages {#related-pages}

- [Audit log](/admin-guide/audit-log) — enable audit capture and send events to a SIEM.
- [Configuration options](/reference/configuration#audit-log) — every `audit.*` option and environment variable.
