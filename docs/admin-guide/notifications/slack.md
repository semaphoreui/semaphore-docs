# Slack

Slack notifications allow you to receive real-time updates about your Semaphore workflows directly in your Slack channels. This integration helps teams stay informed about build statuses, deployment results, and other important events without having to constantly check the Semaphore dashboard.

To set up Slack notifications, you need to create a webhook URL that connects Semaphore to your desired Slack channel. This webhook acts as a secure communication bridge between the two platforms.

Prerequisites:

- A Slack workspace where you are allowed to create apps.
- Admin access to the Semaphore server's configuration (`config.json` or environment variables).

## Creating Slack webhook

### Step 1. Open Slack API settings

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps).
2. Click **Create New App** → choose **From Scratch**.
3. Give your app a name (e.g., `Semaphore Bot`) and select your **Slack workspace**.

---

### Step 2. Enable incoming webhooks

1. Inside the app settings, go to **Features → Incoming Webhooks**.
2. Switch **Activate Incoming Webhooks** → **On**.

---

### Step 3. Create a webhook URL

1. Click **Add New Webhook to Workspace**.
2. Select the channel where messages should be sent.
3. Click **Allow**.
4. You’ll see a **Webhook URL** like:

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Step 4. Test your webhook

Use `curl` to test:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

If everything is set up, you’ll see the message in the selected Slack channel.


## Semaphore configuration

Once you have your Slack webhook URL, you can configure Semaphore to send notifications in several ways:

You can enable Slack notifications using either configuration files or environment variables.

### Method 1: Configuration file

Add the following settings to your Semaphore configuration file:

- `slack_alert`: Set to `true` to enable Slack notifications
- `slack_url`: Your webhook URL from the previous step

`config.json` example:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### Method 2: Environment variables

Alternatively, you can use environment variables to configure Slack notifications. This method is particularly useful for containerized deployments or when you want to keep sensitive information separate from configuration files.

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
