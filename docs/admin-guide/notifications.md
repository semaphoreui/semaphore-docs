---
title: Notifications
description: How Semaphore delivers task alerts, the channels it supports, and how server-wide channels relate to per-project alerts.
---

# Notifications

Semaphore reports task results to chat and e-mail in two ways:

- **Server channels** are configured once on the server, in `config.json` or through
  environment variables, and are available to every project. This page describes them.
- **Project alerts** are named destinations created by project members in the
  project's [Alerts](/user-guide/projects/alerts) tab, with their own chat, webhook
  or recipients, and bound to templates and schedules.

## How delivery works {#how-delivery-works}

For a server channel three settings decide whether a message is sent, and all three
must allow it:

1. **The channel is configured on the server.** Each provider has its own keys in
   `config.json`. See the page for that provider below.
2. **The project uses server channels.** *Send alerts of this project to server
   channels* in the project's [Alerts](/user-guide/projects/alerts#server-channels)
   tab is the master switch. With it off, server channels send nothing about that
   project. Project alerts are not affected by this switch.
3. **The template asks for it.** A task template using *project defaults* sends to
   server channels; a template with a custom alert list does not. Templates can also
   suppress success or failure notifications, see
   [Task Templates](/user-guide/task-templates).

Chat channels report success, failure and tasks waiting for confirmation; e-mail
reports failures only. Project alerts can override the events per destination.

Use **Test all** in the Alerts tab to send a test message through every server
channel and every enabled project alert without running a task.

## Channels {#channels}

| Channel | Page |
|---|---|
| E-mail (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Several channels can be enabled at the same time; each one receives every alert
that passes the three checks above. The same providers are available for project
alerts; e-mail and Telegram project alerts reuse the SMTP server and the bot token
from the server configuration, and a Gotify project alert without its own URL and
token reuses the server-wide pair.

## Per-project overrides {#per-project-overrides}

Telegram supports a per-project chat: set **Telegram Chat ID** in the project's
[Alerts](/user-guide/projects/alerts#server-channels) tab to route one project's
server-channel messages to a different chat than the server-wide one. For any other
per-project destination create a [project alert](/user-guide/projects/alerts#project-alerts).

## Where to start {#where-to-start}

Configure one channel first, open the project's Alerts tab, turn on *Send alerts of
this project to server channels* and press **Test all**. Once a test message arrives,
adjust the templates that matter.
