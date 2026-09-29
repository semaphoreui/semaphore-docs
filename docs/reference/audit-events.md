---
title: Audit events
description: Every security audit event Semaphore records through its API, with its type, outcomes, reasons, metadata fields and edition.
---

# Audit events

<!-- Generated from the Semaphore source by tools/auditcatalog. Do not edit. -->

See [Audit log](/admin-guide/audit-log) for the event schema.

Events marked *Pro* are recorded only by Semaphore Pro.

| event_code | action | type | outcomes | reasons | metadata | edition |
| --- | --- | --- | --- | --- | --- | --- |
| `auth.login` | `authenticate` | `start` | success, failure | `invalid_credentials`, `user_not_found`, `method_disabled`, `invalid_state`, `provider_error`, `internal_error` | `method`, `provider` |  |
| `auth.logout` | `terminate_session` | `end` | success |  |  |  |
| `auth.mfa` | `verify_totp` | `info` | success, failure | `invalid_passcode` |  |  |
| `auth.mfa` | `verify_email` | `info` | success, failure | `invalid_passcode`, `code_expired`, `too_many_attempts` |  | Pro |
| `auth.mfa` | `recover` | `info` | success, failure | `invalid_recovery_code` |  |  |
| `auth.api_token` | `reject` | `denied` | failure | `token_unknown`, `token_expired` |  |  |
| `auth.authorization` | `deny` | `denied` | failure | `forbidden` | `method`, `permission` |  |
| `auth.csrf` | `block` | `denied` | failure | `cross_origin` | `method`, `permission` |  |
| `iam.user` | `create` | `creation` | success |  | `admin`, `pro`, `external` |  |
| `iam.user` | `update` | `change` | success |  | `fields`, `admin`, `pro` |  |
| `iam.user` | `delete` | `deletion` | success |  |  |  |
| `iam.user` | `auto_provision` | `creation` | success |  | `method`, `provider` |  |
| `iam.user_password` | `change` | `change` | success, failure | `invalid_current_password` |  |  |
| `iam.user_password` | `admin_reset` | `change` | success |  |  |  |
| `iam.mfa` | `enable` | `change` | success |  |  |  |
| `iam.mfa` | `disable` | `change` | success |  |  |  |
| `iam.mfa` | `view_qr` | `access` | success |  |  |  |
| `iam.external_identity` | `link` | `change` | success |  | `method`, `provider` |  |
| `iam.external_identity` | `unlink` | `change` | success |  | `method`, `provider` |  |
| `iam.api_token` | `create` | `creation` | success |  |  |  |
| `iam.api_token` | `delete` | `deletion` | success |  |  |  |
| `iam.membership` | `add` | `change` | success |  | `role`, `self_removal` |  |
| `iam.membership` | `remove` | `change` | success, failure | `owner_self_change` | `role`, `self_removal` |  |
| `iam.project_role` | `change` | `change` | success, failure | `owner_self_change` | `old_role`, `new_role` |  |
| `iam.role` | `create` | `creation` | success |  | `permissions` | Pro |
| `iam.role` | `update` | `change` | success |  | `permissions` | Pro |
| `iam.role` | `delete` | `deletion` | success |  |  | Pro |
| `iam.project_role_definition` | `create` | `creation` | success |  | `permissions` | Pro |
| `iam.project_role_definition` | `update` | `change` | success |  | `permissions` | Pro |
| `iam.project_role_definition` | `delete` | `deletion` | success |  |  | Pro |
| `iam.template_permission` | `create` | `creation` | success |  | `template_id`, `role_slug`, `permissions` |  |
| `iam.template_permission` | `update` | `change` | success |  | `template_id`, `role_slug`, `permissions` |  |
| `iam.template_permission` | `delete` | `deletion` | success |  | `template_id`, `role_slug`, `permissions` |  |
| `system.settings` | `update` | `change` | success |  | `keys` |  |
| `system.license` | `activate` | `change` | success, failure | `activation_failed` |  | Pro |
| `audit.lifecycle` | `start` | `start` | success |  | `destinations` |  |
