# Notifications

Semaphore can send notifications about task and project activity to popular channels. Configure a global notifier in `config.json`, and (where supported) override certain options per project.

Supported providers:

* [Email](/admin-guide/notifications/email)
* [Slack](/admin-guide/notifications/slack)
* [Telegram](/admin-guide/notifications/telegram)
* [Microsoft Teams](/admin-guide/notifications/teams)
* [RocketChat](/admin-guide/notifications/rocket)
* [DingTalk](/admin-guide/notifications/ding)
* [Gotify](/admin-guide/notifications/gotify)

## How it works

- **Global configuration**: Enable a provider and set its connection options in `config.json` on the Semaphore server. See each provider page for the exact keys.
- **Events**: Notifications are sent on key task lifecycle events (e.g., start, success, failure) and are posted to the configured channel/webhook.
- **Per-project overrides**: Some providers allow per-project overrides. For example, Telegram supports a project-specific chat ID.


