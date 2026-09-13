# Slack

Slack-Benachrichtigungen ermöglichen es Ihnen, Echtzeit-Updates zu Ihren Semaphore-Workflows direkt in Ihren Slack-Kanälen zu erhalten. Diese Integration hilft Teams, über Build-Status, Deployment-Ergebnisse und andere wichtige Ereignisse informiert zu bleiben, ohne ständig das Semaphore-Dashboard prüfen zu müssen.

Um Slack-Benachrichtigungen einzurichten, müssen Sie eine Webhook-URL erstellen, die Semaphore mit dem gewünschten Slack-Kanal verbindet. Dieser Webhook dient als sichere Kommunikationsbrücke zwischen den beiden Plattformen.

## Slack-Webhook erstellen {#creating-slack-webhook}

### Schritt 1. Slack-API-Einstellungen öffnen {#step-1-open-slack-api-settings}

1. Gehen Sie zu [https://api.slack.com/apps](https://api.slack.com/apps).
2. Klicken Sie auf **Create New App** → wählen Sie **From Scratch**.
3. Geben Sie Ihrer App einen Namen (z. B. `Semaphore Bot`) und wählen Sie Ihren **Slack-Workspace** aus.

---

### Schritt 2. Incoming Webhooks aktivieren {#step-2-enable-incoming-webhooks}

1. Gehen Sie in den App-Einstellungen zu **Features → Incoming Webhooks**.
2. Schalten Sie **Activate Incoming Webhooks** auf **On**.

---

### Schritt 3. Webhook-URL erstellen {#step-3-create-a-webhook-url}

1. Klicken Sie auf **Add New Webhook to Workspace**.
2. Wählen Sie den Kanal aus, an den Nachrichten gesendet werden sollen.
3. Klicken Sie auf **Allow**.
4. Sie sehen eine **Webhook URL** wie:

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Schritt 4. Webhook testen {#step-4-test-your-webhook}

Testen Sie mit `curl`:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

Wenn alles richtig eingerichtet ist, sehen Sie die Nachricht im ausgewählten Slack-Kanal.


## Semaphore-Konfiguration {#semaphore-configuration}

Sobald Sie Ihre Slack-Webhook-URL haben, können Sie Semaphore auf mehrere Arten für das Senden von Benachrichtigungen konfigurieren:

Sie können Slack-Benachrichtigungen entweder über Konfigurationsdateien oder über Umgebungsvariablen aktivieren.

### Methode 1: Konfigurationsdatei {#method-1-configuration-file}

Fügen Sie die folgenden Einstellungen zu Ihrer Semaphore-Konfigurationsdatei hinzu:

- `slack_alert`: Auf `true` setzen, um Slack-Benachrichtigungen zu aktivieren
- `slack_url`: Ihre Webhook-URL aus dem vorherigen Schritt

Beispiel für `config.json`:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### Methode 2: Umgebungsvariablen {#method-2-environment-variables}

Alternativ können Sie Umgebungsvariablen verwenden, um Slack-Benachrichtigungen zu konfigurieren. Diese Methode ist besonders nützlich für containerisierte Deployments oder wenn Sie sensible Informationen getrennt von Konfigurationsdateien halten möchten.

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
