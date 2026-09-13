# Slack

Le notifiche Slack permettono di ricevere aggiornamenti in tempo reale sui workflow di Semaphore direttamente nei canali Slack. Questa integrazione aiuta i team a rimanere informati sullo stato delle build, sui risultati dei deployment e su altri eventi importanti senza dover controllare continuamente la dashboard di Semaphore.

Per configurare le notifiche Slack, è necessario creare un URL webhook che colleghi Semaphore al canale Slack desiderato. Questo webhook funge da ponte di comunicazione sicuro tra le due piattaforme.

## Creazione del webhook Slack {#creating-slack-webhook}

### Passo 1. Aprire le impostazioni API di Slack {#step-1-open-slack-api-settings}

1. Andare su [https://api.slack.com/apps](https://api.slack.com/apps).
2. Fare clic su **Create New App** → scegliere **From Scratch**.
3. Assegnare un nome all'app (ad es. `Semaphore Bot`) e selezionare il proprio **workspace Slack**.

---

### Passo 2. Abilitare gli Incoming Webhooks {#step-2-enable-incoming-webhooks}

1. Nelle impostazioni dell'app, andare su **Features → Incoming Webhooks**.
2. Impostare **Activate Incoming Webhooks** su **On**.

---

### Passo 3. Creare un URL webhook {#step-3-create-a-webhook-url}

1. Fare clic su **Add New Webhook to Workspace**.
2. Selezionare il canale a cui devono essere inviati i messaggi.
3. Fare clic su **Allow**.
4. Verrà mostrato un **Webhook URL** simile a:

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### Passo 4. Testare il webhook {#step-4-test-your-webhook}

Utilizzare `curl` per il test:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

Se tutto è configurato correttamente, il messaggio comparirà nel canale Slack selezionato.


## Configurazione di Semaphore {#semaphore-configuration}

Una volta ottenuto l'URL webhook di Slack, è possibile configurare Semaphore per l'invio delle notifiche in diversi modi:

Le notifiche Slack possono essere abilitate tramite file di configurazione o variabili d'ambiente.

### Metodo 1: file di configurazione {#method-1-configuration-file}

Aggiungere le seguenti impostazioni al file di configurazione di Semaphore:

- `slack_alert`: impostare a `true` per abilitare le notifiche Slack
- `slack_url`: l'URL webhook ottenuto nel passo precedente

Esempio di `config.json`:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### Metodo 2: variabili d'ambiente {#method-2-environment-variables}

In alternativa, è possibile utilizzare le variabili d'ambiente per configurare le notifiche Slack. Questo metodo è particolarmente utile per i deployment containerizzati o quando si desidera mantenere le informazioni sensibili separate dai file di configurazione.

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
