---
title: Audit events
description: The audit event format and every available and planned audit event, with its outcomes, reasons and edition.
---

# Audit events

This page lists the audit events Semaphore records and the fields you can search and filter them by. To turn on the audit log, see [Audit log](/admin-guide/audit-log).

**Available** events are recorded now. **Planned** events will be added in a future release. **Edition** is the Semaphore edition that records the event.

## Event format {#event-format}

Every event is a JSON object. Fields that do not apply to an event are left out.

| Field | When present | Meaning |
| --- | --- | --- |
| `event_id` | Always | Unique event ID. Use it to remove duplicate deliveries. |
| `seq` | Always | Increasing sequence number. Use it to restore event order. |
| `timestamp` | Always | Event time in UTC. |
| `schema_version` | Always | Version of the event envelope. |
| `category`, `event_code`, `type`, `action` | Always | Stable values that identify what happened. |
| `outcome` | Always | `success` or `failure`. |
| `reason` | Always | Why the action failed, if the event lists its reasons. Empty on success. |
| `actor` | Always | The user, anonymous client, system component, runner or integration that acted. |
| `source` | HTTP requests | Client IP address and, when available, User-Agent. |
| `target` | When an object is identified | The object affected by the action. |
| `scope` | Project events | The project that contains the action. |
| `request_id` | HTTP requests | The request ID also returned in `X-Request-ID`. |
| `instance_id` | Always | The installation name configured by the administrator. |
| `node_id` | HA installations | The node that recorded the event. |
| `metadata` | Always | Additional fields documented for the event kind. |

## Authentication {#authentication}

`auth.login` is recorded once sign-in is complete, including the TOTP check if the user has one. A wrong TOTP code is recorded as an `auth.mfa` failure.

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
| `resource.project` | `create` | `creation` | success | `setup_failed` (partial success) | `demo`, `partial` | Community | Available |
| `resource.project` | `update` | `change` | success |  |  | Community | Available |
| `resource.project` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.project_backup` | `export` | `access` | success |  |  | Community | Available |
| `resource.project_backup` | `restore` | `creation` | success |  | `objects` | Community | Available |
| `resource.inventory` | `create` | `creation` | success |  |  | Community | Available |
| `resource.inventory` | `update` | `change` | success |  |  | Community | Available |
| `resource.inventory` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.repository` | `create` | `creation` | success |  |  | Community | Available |
| `resource.repository` | `update` | `change` | success |  |  | Community | Available |
| `resource.repository` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.template` | `create` | `creation` | success | `inventory_failed` (partial success) | `app`, `created_inventory_id`, `partial` | Community | Available |
| `resource.template` | `update` | `change` | success |  | `app` | Community | Available |
| `resource.template` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.template` | `attach_inventory` | `change` | success |  | `inventory_id` | Community | Available |
| `resource.template` | `detach_inventory` | `change` | success |  | `inventory_id` | Community | Available |
| `resource.template` | `set_default_inventory` | `change` | success |  | `inventory_id` | Community | Available |
| `resource.schedule` | `create` | `creation` | success |  | `template_id` | Community | Available |
| `resource.schedule` | `update` | `change` | success |  | `template_id` | Community | Available |
| `resource.schedule` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.schedule` | `activate` | `change` | success |  | `template_id` | Community | Available |
| `resource.schedule` | `deactivate` | `change` | success |  | `template_id` | Community | Available |
| `resource.integration` | `create` | `creation` | success |  | `template_id`, `auth_method` | Community | Available |
| `resource.integration` | `update` | `change` | success |  | `template_id`, `auth_method` | Community | Available |
| `resource.integration` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.integration_matcher` | `create` | `creation` | success |  | `integration_id` | Community | Available |
| `resource.integration_matcher` | `update` | `change` | success |  | `integration_id` | Community | Available |
| `resource.integration_matcher` | `delete` | `deletion` | success |  | `integration_id` | Community | Available |
| `resource.integration_extractor` | `create` | `creation` | success |  | `integration_id` | Community | Available |
| `resource.integration_extractor` | `update` | `change` | success |  | `integration_id` | Community | Available |
| `resource.integration_extractor` | `delete` | `deletion` | success |  | `integration_id` | Community | Available |
| `resource.integration_alias` | `create` | `creation` | success |  | `integration_id` | Community | Available |
| `resource.integration_alias` | `delete` | `deletion` | success |  | `integration_id` | Community | Available |
| `resource.host_config` | `create` | `creation` | success |  | `type` | Community | Available |
| `resource.host_config` | `update` | `change` | success |  | `type` | Community | Available |
| `resource.host_config` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.workflow` | `create` | `creation` | success |  |  | Pro | Available |
| `resource.workflow` | `update` | `change` | success |  |  | Pro | Available |
| `resource.workflow` | `delete` | `deletion` | success |  |  | Pro | Available |
| `resource.environment` | `create` | `creation` | success | `secret_failed` (partial success) | `secrets_created`, `secrets_updated`, `secrets_deleted`, `partial` | Community | Available |
| `resource.environment` | `update` | `change` | success | `secret_failed` (partial success) | `secrets_created`, `secrets_updated`, `secrets_deleted`, `partial` | Community | Available |
| `resource.environment` | `delete` | `deletion` | success |  |  | Community | Available |
| `resource.environment` | `sync` | `change` | success |  |  | Community | Available |

## Secrets {#secrets}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition | Availability |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `secret.credential` | `create` | `creation` | success |  | `type` | Community | Available |
| `secret.credential` | `update` | `change` | success |  | `type` | Community | Available |
| `secret.credential` | `delete` | `deletion` | success |  |  | Community | Available |
| `secret.storage` | `create` | `creation` | success |  | `type` | Community | Available |
| `secret.storage` | `update` | `change` | success |  | `type` | Community | Available |
| `secret.storage` | `delete` | `deletion` | success |  |  | Community | Available |
| `secret.storage` | `sync` | `change` | success |  |  | Community | Available |

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

## Related pages {#related-pages}

- [Audit log](/admin-guide/audit-log) — turn on the audit log and send events to a SIEM.
- [Configuration options](/reference/configuration#audit-log) — every `audit.*` option and environment variable.
