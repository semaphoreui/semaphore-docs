---
title: Microsoft Teams
description: Creating a Microsoft Teams webhook with the Workflows app, testing it with curl, and enabling Teams alerts via config.json or environment variables.
---

# Microsoft Teams

Microsoft Teams notifications deliver task results from Semaphore straight to a Teams channel. Each message is a card with the template name, the task status, the user who started the task and a button that opens the task in Semaphore.

To set up Teams notifications, you need a webhook URL that connects Semaphore to the channel. In Teams this URL is created with the **Workflows** app, which is powered by Microsoft Power Automate and is not related to Workflows in Semaphore.

:::warning
Microsoft retired Office 365 connectors in Teams, including the old **Incoming Webhook** connector, in May 2026. A webhook URL on `webhook.office.com` no longer delivers messages. Create a new URL with the Workflows app as described below.
:::

## Creating Teams webhook {#creating-teams-webhook}

### Step 1. Open Workflows for the channel {#step-1-open-workflows-for-the-channel}

1. In Microsoft Teams, go to the team and the channel that should receive the notifications.
2. Click **More options (…)** next to the channel name.
3. Select **Workflows**.

---

### Step 2. Create a workflow from the template {#step-2-create-a-workflow-from-the-template}

1. Search for the template **Send webhook alerts to a channel** and select it.
2. Check the workflow parameters: the **Team** and the **Channel** the messages are posted to.
3. Click **Save**.

Semaphore sends the request without authentication headers, so use this template and not its *from specific people* or *from people in an org* variants.

---

### Step 3. Copy the webhook URL {#step-3-copy-the-webhook-url}

1. When the workflow is created, Teams shows its webhook link. Copy it.
2. The URL is long and looks similar to:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

The `sig` parameter is the only protection of the webhook: anyone who has the URL can post to the channel. Treat the whole URL as a secret.

---

### Step 4. Test your webhook {#step-4-test-your-webhook}

Use `curl` to test:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

The request body has the same structure as the messages Semaphore sends: a message with one Adaptive Card attachment. If everything is set up, the response is `202 Accepted` and the card appears in the selected Teams channel within a few seconds.


## Semaphore configuration {#semaphore-configuration}

Once you have your Teams webhook URL, you can enable Teams notifications using either the configuration file or environment variables. Restart Semaphore to apply the change.

### Method 1: Configuration file {#method-1-configuration-file}

Add the following settings to your Semaphore configuration file:

- `microsoft_teams_alert`: Set to `true` to enable Teams notifications
- `microsoft_teams_url`: Your webhook URL from the previous step

`config.json` example:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Method 2: Environment variables {#method-2-environment-variables}

Alternatively, you can use environment variables. This method is particularly useful for containerized deployments or when you want to keep the webhook URL out of the configuration file.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
The URL contains `&` and `%` characters. Wrap it in single quotes when you set the variable in a shell. In a systemd unit, put it in an `EnvironmentFile` instead of an `Environment=` line, where `%` starts a specifier.
:::

## Enabling notifications for a project {#enabling-notifications-for-a-project}

The settings above turn on the channel for the whole server, and all messages go to the one channel the webhook belongs to. A project receives them only when it uses server channels, and a task template can suppress success or failure messages. See [How delivery works](/admin-guide/notifications#how-delivery-works), which also explains how to send a test message without running a task.

Teams is notified when a task succeeds, fails or waits for confirmation.

To send the notifications of one project to a different Teams channel, create a [project alert](/user-guide/alerts#project-alerts) of the type Microsoft Teams with its own webhook URL.

## Message content {#message-content}

| Card element | Value |
|---|---|
| Header | `Ansible Task Template Execution by:` and the name of the user who started the task, or `—` when the task was not started by a user. |
| **Task** | Name of the task template. |
| **Status** | Task status with an icon, for example `✅ SUCCESS`, `❌ ERROR` or `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Number of the task. |
| **Task URL** button | Opens the task in Semaphore. The link is built from `web_host`, so set this option to the address users open Semaphore at. |

## Troubleshooting {#troubleshooting}

The request is sent by the Semaphore server, not by a runner, and the result is written to the task log. Semaphore sends each message once and does not retry.

| Task log | What to check |
|---|---|
| No line about Microsoft Teams | The message was not attempted. Check that `microsoft_teams_alert` is `true`, the project uses server channels and the template does not suppress the notification. |
| `Can't send microsoft teams alert! Error: …` | The server could not reach the webhook host. Allow outbound HTTPS from the server to the host in the URL. Behind a proxy, set `HTTPS_PROXY` for the Semaphore server, see [Running behind a corporate proxy](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | The webhook rejected the request. Check that the URL is copied in full, including the `sig` parameter, and that the workflow is turned on and was not deleted. Microsoft limits a webhook to four requests per second. |
| `Sent successfully microsoft teams alert`, but no card in the channel | The workflow accepted the request and failed later. Open the workflow in the **Workflows** app and look at its run history. A workflow belongs to the user who created it and stops working when that user leaves the organization or loses access to the channel, so add co-owners to the workflow. |
