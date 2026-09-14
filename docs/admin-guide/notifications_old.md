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

## How it works {#how-it-works}

- **Global configuration**: Enable a provider and set its connection options in `config.json` on the Semaphore server. See each provider page for the exact keys.
- **Project opt-in**: Each project must have **Allow alerts for this project** enabled (Project → Settings). Tasks from projects without this flag do not trigger outbound notifications.
- **When notifications fire**:
  - **Email** — only when a task **fails** (to users who have alerts enabled on their account).
  - **Slack, Telegram, Microsoft Teams, Rocket.Chat, DingTalk, Gotify** — when a task **succeeds**, **fails**, or is **waiting for confirmation**.
- **Per-template suppression**: In the template editor, enable **Suppress success alerts** and/or **Suppress error alerts** (v2.20.5+) to skip notifications for that outcome. This applies to every channel above for that template.
- **Per-project overrides**: Telegram supports a project-specific chat ID (`alert_chat` on the project), which overrides the global `telegram_chat` when set.


