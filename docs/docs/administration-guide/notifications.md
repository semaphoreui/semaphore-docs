# Notifications

Semaphore can send notifications about task and project activity to popular channels. Configure a global notifier in `config.json`, and (where supported) override certain options per project.

Supported providers:

* [Email](/administration-guide/notifications/email)
* [Slack](/administration-guide/notifications/slack)
* [Telegram](/administration-guide/notifications/telegram)
* [Microsoft Teams](/administration-guide/notifications/teams)
* [RocketChat](/administration-guide/notifications/rocket)
* [DingTalk](/administration-guide/notifications/ding)
* [Gotify](/administration-guide/notifications/gotify)

## How it works

- **Global configuration**: Enable a provider and set its connection options in `config.json` on the Semaphore server. See each provider page for the exact keys.
- **Events**: Notifications are sent on key task lifecycle events (e.g., start, success, failure) and are posted to the configured channel/webhook.
- **Per-project overrides**: Some providers allow per-project overrides. For example, Telegram supports a project-specific chat ID.


