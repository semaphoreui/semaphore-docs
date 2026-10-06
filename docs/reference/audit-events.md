---
title: Audit events
description: The audit event format and every audit event, with its outcomes, reasons and edition.
---

# Audit events

This page lists the audit events Semaphore records and the fields you can search and filter them by. To turn on the audit log, see [Audit log](/admin-guide/audit-log).

**Edition** is the Semaphore edition that records the event.

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
| `reason` | Always | Why the action failed, if the event lists its reasons. On a partial success, what did not complete. Empty on any other success. |
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

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition |
| --- | --- | --- | --- | --- | --- | --- |
| `auth.login` | `authenticate` | `start` | success, failure | `invalid_credentials`, `user_not_found`, `method_disabled`, `invalid_state`, `provider_error`, `internal_error` | `method`, `provider` | Community |
| `auth.logout` | `terminate_session` | `end` | success |  |  | Community |
| `auth.mfa` | `verify_totp` | `info` | success, failure | `invalid_passcode` |  | Community |
| `auth.mfa` | `verify_email` | `info` | success, failure | `invalid_passcode`, `code_expired`, `too_many_attempts` |  | Pro |
| `auth.mfa` | `recover` | `info` | success, failure | `invalid_recovery_code` |  | Community |
| `auth.api_token` | `reject` | `denied` | failure | `token_unknown`, `token_expired` |  | Community |
| `auth.authorization` | `deny` | `denied` | failure | `forbidden` | `method`, `permission` | Community |
| `auth.csrf` | `block` | `denied` | failure | `cross_origin` | `method` | Community |

## Identity and access management {#identity-and-access-management}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition |
| --- | --- | --- | --- | --- | --- | --- |
| `iam.user` | `create` | `creation` | success |  | `admin`, `pro`, `external` | Community |
| `iam.user` | `update` | `change` | success |  | `fields`, `admin`, `pro` | Community |
| `iam.user` | `delete` | `deletion` | success |  |  | Community |
| `iam.user` | `auto_provision` | `creation` | success |  | `method`, `provider` | Community |
| `iam.user_password` | `change` | `change` | success, failure | `invalid_current_password` |  | Community |
| `iam.user_password` | `admin_reset` | `change` | success |  |  | Community |
| `iam.mfa` | `enable` | `change` | success |  |  | Community |
| `iam.mfa` | `disable` | `change` | success |  |  | Community |
| `iam.mfa` | `view_qr` | `access` | success |  |  | Community |
| `iam.external_identity` | `link` | `change` | success |  | `method`, `provider` | Community |
| `iam.external_identity` | `unlink` | `change` | success |  | `method`, `provider` | Community |
| `iam.api_token` | `create` | `creation` | success |  |  | Community |
| `iam.api_token` | `delete` | `deletion` | success |  |  | Community |
| `iam.membership` | `add` | `change` | success |  | `role`, `self_removal` | Community |
| `iam.membership` | `remove` | `change` | success, failure | `owner_self_change` | `role`, `self_removal` | Community |
| `iam.project_role` | `change` | `change` | success, failure | `owner_self_change` | `old_role`, `new_role` | Community |
| `iam.role` | `create` | `creation` | success |  | `permissions` | Pro |
| `iam.role` | `update` | `change` | success |  | `permissions` | Pro |
| `iam.role` | `delete` | `deletion` | success |  |  | Pro |
| `iam.project_role_definition` | `create` | `creation` | success |  | `permissions` | Pro |
| `iam.project_role_definition` | `update` | `change` | success |  | `permissions` | Pro |
| `iam.project_role_definition` | `delete` | `deletion` | success |  |  | Pro |
| `iam.template_permission` | `create` | `creation` | success |  | `template_id`, `role_slug`, `permissions` | Community |
| `iam.template_permission` | `update` | `change` | success |  | `template_id`, `role_slug`, `permissions` | Community |
| `iam.template_permission` | `delete` | `deletion` | success |  | `template_id` | Community |

## Resources {#resources}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition |
| --- | --- | --- | --- | --- | --- | --- |
| `resource.project` | `create` | `creation` | success | `setup_failed` (partial success) | `demo`, `partial` | Community |
| `resource.project` | `update` | `change` | success |  |  | Community |
| `resource.project` | `delete` | `deletion` | success |  |  | Community |
| `resource.project_backup` | `export` | `access` | success |  |  | Community |
| `resource.project_backup` | `restore` | `creation` | success | `restore_failed` (partial success) | `objects`, `partial` | Community |
| `resource.inventory` | `create` | `creation` | success |  |  | Community |
| `resource.inventory` | `update` | `change` | success |  |  | Community |
| `resource.inventory` | `delete` | `deletion` | success |  |  | Community |
| `resource.repository` | `create` | `creation` | success |  |  | Community |
| `resource.repository` | `update` | `change` | success |  |  | Community |
| `resource.repository` | `delete` | `deletion` | success |  |  | Community |
| `resource.template` | `create` | `creation` | success | `inventory_failed` (partial success) | `app`, `created_inventory_id`, `partial` | Community |
| `resource.template` | `update` | `change` | success |  | `app` | Community |
| `resource.template` | `delete` | `deletion` | success |  |  | Community |
| `resource.template` | `attach_inventory` | `change` | success |  | `inventory_id` | Community |
| `resource.template` | `detach_inventory` | `change` | success |  | `inventory_id` | Community |
| `resource.template` | `set_default_inventory` | `change` | success |  | `inventory_id` | Community |
| `resource.schedule` | `create` | `creation` | success |  | `template_id` | Community |
| `resource.schedule` | `update` | `change` | success |  | `template_id` | Community |
| `resource.schedule` | `delete` | `deletion` | success |  |  | Community |
| `resource.schedule` | `activate` | `change` | success |  | `template_id` | Community |
| `resource.schedule` | `deactivate` | `change` | success |  | `template_id` | Community |
| `resource.integration` | `create` | `creation` | success |  | `template_id`, `auth_method` | Community |
| `resource.integration` | `update` | `change` | success |  | `template_id`, `auth_method` | Community |
| `resource.integration` | `delete` | `deletion` | success |  |  | Community |
| `resource.integration_matcher` | `create` | `creation` | success |  | `integration_id` | Community |
| `resource.integration_matcher` | `update` | `change` | success |  | `integration_id` | Community |
| `resource.integration_matcher` | `delete` | `deletion` | success |  | `integration_id` | Community |
| `resource.integration_extractor` | `create` | `creation` | success |  | `integration_id` | Community |
| `resource.integration_extractor` | `update` | `change` | success |  | `integration_id` | Community |
| `resource.integration_extractor` | `delete` | `deletion` | success |  | `integration_id` | Community |
| `resource.integration_alias` | `create` | `creation` | success |  | `integration_id` | Community |
| `resource.integration_alias` | `delete` | `deletion` | success |  | `integration_id` | Community |
| `resource.host_config` | `create` | `creation` | success |  | `type` | Community |
| `resource.host_config` | `update` | `change` | success |  | `type` | Community |
| `resource.host_config` | `delete` | `deletion` | success |  |  | Community |
| `resource.workflow` | `create` | `creation` | success |  |  | Pro |
| `resource.workflow` | `update` | `change` | success |  |  | Pro |
| `resource.workflow` | `delete` | `deletion` | success |  |  | Pro |
| `resource.environment` | `create` | `creation` | success | `secret_failed` (partial success) | `secrets_created`, `secrets_updated`, `secrets_deleted`, `partial` | Community |
| `resource.environment` | `update` | `change` | success | `secret_failed` (partial success) | `secrets_created`, `secrets_updated`, `secrets_deleted`, `partial` | Community |
| `resource.environment` | `delete` | `deletion` | success | `secret_failed` (partial success) | `partial` | Community |
| `resource.environment` | `sync` | `change` | success |  |  | Pro |

## Secrets {#secrets}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition |
| --- | --- | --- | --- | --- | --- | --- |
| `secret.credential` | `create` | `creation` | success |  | `type` | Community |
| `secret.credential` | `update` | `change` | success |  | `type` | Community |
| `secret.credential` | `delete` | `deletion` | success |  |  | Community |
| `secret.storage` | `create` | `creation` | success |  | `type` | Community |
| `secret.storage` | `update` | `change` | success |  | `type` | Community |
| `secret.storage` | `delete` | `deletion` | success |  |  | Community |
| `secret.storage` | `sync` | `change` | success |  |  | Pro |

## Tasks {#tasks}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition |
| --- | --- | --- | --- | --- | --- | --- |
| `task.execution` | `create` | `creation` | success |  | `trigger`, `template_id`, `schedule_id`, `integration_id`, `parent_task_id`, `workflow_run_id` | Community |
| `task.approval` | `request` | `info` | success |  | `template_id` | Community |
| `task.approval` | `approve` | `change` | success |  | `template_id` | Community |
| `task.approval` | `reject` | `change` | success |  | `template_id` | Community |
| `task.control` | `stop` | `change` | success |  | `template_id` | Community |
| `task.control` | `force_stop` | `change` | success |  | `template_id` | Community |
| `task.control` | `stop_all` | `change` | success |  |  | Community |
| `task.execution` | `complete` | `end` | success |  | `result`, `end_reason`, `template_id`, `initiator_id`, `duration_ms` | Community |
| `task.history` | `delete` | `deletion` | success |  | `template_id` | Community |

## Runners {#runners}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition |
| --- | --- | --- | --- | --- | --- | --- |
| `runner.lifecycle` | `create` | `creation` | success |  |  | Community |
| `runner.lifecycle` | `update` | `change` | success |  |  | Community |
| `runner.lifecycle` | `delete` | `deletion` | success |  |  | Community |
| `runner.lifecycle` | `enable` | `change` | success |  |  | Community |
| `runner.lifecycle` | `disable` | `change` | success |  |  | Community |
| `runner.lifecycle` | `register` | `creation` | success, failure | `invalid_registration_token` | `token` | Community |
| `runner.lifecycle` | `unregister` | `deletion` | success |  |  | Community |
| `runner.credential` | `rotate_registration_token` | `change` | success |  |  | Community |
| `runner.cache` | `clear` | `deletion` | success |  |  | Community |
| `runner.progress` | `reject` | `denied` | failure | `invalid_status` |  | Community |

## System and audit {#system-and-audit}

| Event code | Action | Type | Outcomes | Reasons | Metadata | Edition |
| --- | --- | --- | --- | --- | --- | --- |
| `system.settings` | `update` | `change` | success |  | `keys` | Community |
| `system.license` | `activate` | `change` | success, failure | `activation_failed` |  | Pro |
| `audit.lifecycle` | `start` | `start` | success |  | `destinations` | Community |
| `audit.retention` | `delete` | `deletion` | success |  | `deleted`, `last_seq`, `retention_days` | Community |

## Related pages {#related-pages}

- [Audit log](/admin-guide/audit-log) — turn on the audit log and send events to a SIEM.
- [Configuration options](/reference/configuration#audit-log) — every `audit.*` option and environment variable.
