# Microsoft Teams

Microsoft-Teams-Benachrichtigungen liefern Task-Ergebnisse aus Semaphore direkt in einen Teams-Kanal. Jede Nachricht ist eine Karte mit dem Namen des Templates, dem Task-Status, dem Benutzer, der den Task gestartet hat, und einer Schaltfläche, die den Task in Semaphore öffnet.

Um Teams-Benachrichtigungen einzurichten, benötigen Sie eine Webhook-URL, die Semaphore mit dem Kanal verbindet. In Teams wird diese URL mit der App **Workflows** erstellt. Diese App basiert auf Microsoft Power Automate und hat nichts mit den Workflows in Semaphore zu tun.

:::warning
Microsoft hat die Office 365-Connectors in Teams im Mai 2026 eingestellt, einschließlich des alten Connectors **Incoming Webhook**. Eine Webhook-URL auf `webhook.office.com` stellt keine Nachrichten mehr zu. Erstellen Sie wie unten beschrieben eine neue URL mit der Workflows-App.
:::

## Teams-Webhook erstellen {#creating-teams-webhook}

### Schritt 1. Workflows für den Kanal öffnen {#step-1-open-workflows-for-the-channel}

1. Öffnen Sie in Microsoft Teams das Team und den Kanal, der die Benachrichtigungen erhalten soll.
2. Klicken Sie neben dem Kanalnamen auf **More options (…)**.
3. Wählen Sie **Workflows**.

---

### Schritt 2. Workflow aus der Vorlage erstellen {#step-2-create-a-workflow-from-the-template}

1. Suchen Sie die Vorlage **Send webhook alerts to a channel** und wählen Sie sie aus.
2. Prüfen Sie die Parameter des Workflows: **Team** und **Channel**, in die die Nachrichten gepostet werden.
3. Klicken Sie auf **Save**.

Semaphore sendet die Anfrage ohne Authentifizierungs-Header. Verwenden Sie daher genau diese Vorlage und nicht ihre Varianten *from specific people* oder *from people in an org*.

---

### Schritt 3. Webhook-URL kopieren {#step-3-copy-the-webhook-url}

1. Nachdem der Workflow erstellt wurde, zeigt Teams seinen Webhook-Link an. Kopieren Sie ihn.
2. Die URL ist lang und sieht etwa so aus:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

Der Parameter `sig` ist der einzige Schutz des Webhooks: Wer die URL kennt, kann in den Kanal posten. Behandeln Sie die gesamte URL als Geheimnis.

---

### Schritt 4. Webhook testen {#step-4-test-your-webhook}

Testen Sie mit `curl`:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

Der Request-Body hat denselben Aufbau wie die Nachrichten, die Semaphore sendet: eine Nachricht mit einem Adaptive Card-Anhang. Wenn alles richtig eingerichtet ist, lautet die Antwort `202 Accepted`, und die Karte erscheint innerhalb weniger Sekunden im ausgewählten Teams-Kanal.


## Semaphore-Konfiguration {#semaphore-configuration}

Sobald Sie Ihre Teams-Webhook-URL haben, können Sie Teams-Benachrichtigungen entweder über die Konfigurationsdatei oder über Umgebungsvariablen aktivieren. Starten Sie Semaphore anschließend neu, damit die Änderung wirksam wird.

### Methode 1: Konfigurationsdatei {#method-1-configuration-file}

Fügen Sie die folgenden Einstellungen zu Ihrer Semaphore-Konfigurationsdatei hinzu:

- `microsoft_teams_alert`: Auf `true` setzen, um Teams-Benachrichtigungen zu aktivieren
- `microsoft_teams_url`: Ihre Webhook-URL aus dem vorherigen Schritt

Beispiel für `config.json`:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Methode 2: Umgebungsvariablen {#method-2-environment-variables}

Alternativ können Sie Umgebungsvariablen verwenden. Diese Methode ist besonders nützlich für containerisierte Deployments oder wenn die Webhook-URL nicht in der Konfigurationsdatei stehen soll.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
Die URL enthält die Zeichen `&` und `%`. Setzen Sie sie in einfache Anführungszeichen, wenn Sie die Variable in einer Shell setzen. In einer systemd-Unit legen Sie sie in einer `EnvironmentFile` ab statt in einer `Environment=`-Zeile, denn dort leitet `%` einen Platzhalter ein.
:::

## Benachrichtigungen für ein Projekt aktivieren {#enabling-notifications-for-a-project}

Die obigen Einstellungen aktivieren den Kanal für den gesamten Server, und alle Nachrichten gehen in den einen Kanal, zu dem der Webhook gehört. Ein Projekt erhält sie nur, wenn es die Server-Kanäle verwendet, und ein Task-Template kann Erfolgs- oder Fehlermeldungen unterdrücken. Siehe [So funktioniert die Zustellung](/admin-guide/notifications#how-delivery-works). Dort ist auch beschrieben, wie Sie eine Testnachricht senden, ohne einen Task auszuführen.

Teams wird benachrichtigt, wenn ein Task erfolgreich ist, fehlschlägt oder auf Bestätigung wartet.

Um die Benachrichtigungen eines Projekts an einen anderen Teams-Kanal zu senden, erstellen Sie eine [Projektbenachrichtigung](/user-guide/alerts#project-alerts) vom Typ Microsoft Teams mit einer eigenen Webhook-URL.

## Inhalt der Nachricht {#message-content}

| Element der Karte | Wert |
|---|---|
| Kopfzeile | `Ansible Task Template Execution by:` und der Name des Benutzers, der den Task gestartet hat, oder `—`, wenn der Task nicht von einem Benutzer gestartet wurde. |
| **Task** | Name des Task-Templates. |
| **Status** | Task-Status mit Symbol, zum Beispiel `✅ SUCCESS`, `❌ ERROR` oder `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Nummer des Tasks. |
| Schaltfläche **Task URL** | Öffnet den Task in Semaphore. Der Link wird aus `web_host` gebildet. Setzen Sie diese Option daher auf die Adresse, unter der Benutzer Semaphore aufrufen. |

## Fehlerbehebung {#troubleshooting}

Die Anfrage sendet der Semaphore-Server, nicht ein Runner, und das Ergebnis wird in das Task-Log geschrieben. Semaphore sendet jede Nachricht genau einmal und wiederholt den Versand nicht.

| Task-Log | Was zu prüfen ist |
|---|---|
| Keine Zeile zu Microsoft Teams | Es wurde gar nicht versucht, die Nachricht zu senden. Prüfen Sie, ob `microsoft_teams_alert` auf `true` steht, das Projekt die Server-Kanäle verwendet und das Template die Benachrichtigung nicht unterdrückt. |
| `Can't send microsoft teams alert! Error: …` | Der Server konnte den Webhook-Host nicht erreichen. Erlauben Sie ausgehendes HTTPS vom Server zum Host aus der URL. Hinter einem Proxy setzen Sie `HTTPS_PROXY` für den Semaphore-Server, siehe [Betrieb hinter einem Unternehmens-Proxy](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | Der Webhook hat die Anfrage abgelehnt. Prüfen Sie, ob die URL vollständig kopiert wurde, einschließlich des Parameters `sig`, und ob der Workflow eingeschaltet ist und nicht gelöscht wurde. Microsoft begrenzt einen Webhook auf vier Anfragen pro Sekunde. |
| `Sent successfully microsoft teams alert`, aber keine Karte im Kanal | Der Workflow hat die Anfrage angenommen und ist danach fehlgeschlagen. Öffnen Sie den Workflow in der App **Workflows** und sehen Sie sich seinen Ausführungsverlauf an. Ein Workflow gehört dem Benutzer, der ihn erstellt hat, und funktioniert nicht mehr, wenn dieser Benutzer die Organisation verlässt oder den Zugriff auf den Kanal verliert. Fügen Sie dem Workflow deshalb Mitbesitzer hinzu. |
