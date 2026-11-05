# Microsoft Teams

Le notifiche Microsoft Teams inviano i risultati delle attività di Semaphore direttamente in un canale Teams. Ogni messaggio è una scheda con il nome del template, lo stato dell'attività, l'utente che l'ha avviata e un pulsante che apre l'attività in Semaphore.

Per configurare le notifiche Teams è necessario un URL webhook che colleghi Semaphore al canale. In Teams questo URL si crea con l'app **Workflows**, basata su Microsoft Power Automate e non correlata ai Workflow di Semaphore.

:::warning
A maggio 2026 Microsoft ha dismesso i connettori Office 365 in Teams, compreso il vecchio connettore **Incoming Webhook**. Un URL webhook su `webhook.office.com` non recapita più i messaggi. Creare un nuovo URL con l'app Workflows come descritto di seguito.
:::

## Creazione del webhook Teams {#creating-teams-webhook}

### Passo 1. Aprire Workflows per il canale {#step-1-open-workflows-for-the-channel}

1. In Microsoft Teams, andare nel team e nel canale che devono ricevere le notifiche.
2. Fare clic su **More options (…)** accanto al nome del canale.
3. Selezionare **Workflows**.

---

### Passo 2. Creare un flusso dal template {#step-2-create-a-workflow-from-the-template}

1. Cercare il template **Send webhook alerts to a channel** e selezionarlo.
2. Verificare i parametri del flusso: il **Team** e il **Channel** in cui vengono pubblicati i messaggi.
3. Fare clic su **Save**.

Semaphore invia la richiesta senza header di autenticazione, quindi usare questo template e non le sue varianti *from specific people* o *from people in an org*.

---

### Passo 3. Copiare l'URL webhook {#step-3-copy-the-webhook-url}

1. Una volta creato il flusso, Teams mostra il relativo link webhook. Copiarlo.
2. L'URL è lungo ed è simile a:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

Il parametro `sig` è l'unica protezione del webhook: chiunque abbia l'URL può pubblicare nel canale. Trattare l'intero URL come un segreto.

---

### Passo 4. Testare il webhook {#step-4-test-your-webhook}

Utilizzare `curl` per il test:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

Il corpo della richiesta ha la stessa struttura dei messaggi inviati da Semaphore: un messaggio con un allegato Adaptive Card. Se tutto è configurato correttamente, la risposta è `202 Accepted` e la scheda compare nel canale Teams selezionato entro pochi secondi.


## Configurazione di Semaphore {#semaphore-configuration}

Una volta ottenuto l'URL webhook di Teams, è possibile abilitare le notifiche Teams tramite il file di configurazione o le variabili d'ambiente. Riavviare Semaphore per applicare la modifica.

### Metodo 1: file di configurazione {#method-1-configuration-file}

Aggiungere le seguenti impostazioni al file di configurazione di Semaphore:

- `microsoft_teams_alert`: impostare a `true` per abilitare le notifiche Teams
- `microsoft_teams_url`: l'URL webhook ottenuto nel passo precedente

Esempio di `config.json`:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### Metodo 2: variabili d'ambiente {#method-2-environment-variables}

In alternativa, è possibile utilizzare le variabili d'ambiente. Questo metodo è particolarmente utile per i deployment containerizzati o quando si desidera tenere l'URL webhook fuori dal file di configurazione.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
L'URL contiene i caratteri `&` e `%`. Racchiuderlo tra apici singoli quando si imposta la variabile in una shell. In una unit systemd, inserirlo in un `EnvironmentFile` anziché in una riga `Environment=`, dove `%` introduce uno specificatore.
:::

## Abilitazione delle notifiche per un progetto {#enabling-notifications-for-a-project}

Le impostazioni precedenti attivano il canale per l'intero server e tutti i messaggi arrivano all'unico canale a cui appartiene il webhook. Un progetto li riceve solo se usa i canali del server, e un template di attività può sopprimere i messaggi di successo o di errore. Vedere [Come funziona la consegna](/admin-guide/notifications#how-delivery-works), dove è spiegato anche come inviare un messaggio di prova senza eseguire un'attività.

Teams riceve una notifica quando un'attività va a buon fine, fallisce o resta in attesa di conferma.

Per inviare le notifiche di un progetto a un altro canale Teams, creare un [avviso del progetto](/user-guide/alerts#project-alerts) di tipo Microsoft Teams con un proprio URL webhook.

## Contenuto del messaggio {#message-content}

| Elemento della scheda | Valore |
|---|---|
| Intestazione | `Ansible Task Template Execution by:` seguito dal nome dell'utente che ha avviato l'attività, oppure `—` se l'attività non è stata avviata da un utente. |
| **Task** | Nome del template di attività. |
| **Status** | Stato dell'attività con un'icona, ad esempio `✅ SUCCESS`, `❌ ERROR` o `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | Numero dell'attività. |
| Pulsante **Task URL** | Apre l'attività in Semaphore. Il link è costruito a partire da `web_host`, quindi impostare questa opzione sull'indirizzo con cui gli utenti aprono Semaphore. |

## Risoluzione dei problemi {#troubleshooting}

La richiesta viene inviata dal server Semaphore, non da un runner, e l'esito viene scritto nel log dell'attività. Semaphore invia ogni messaggio una sola volta e non effettua nuovi tentativi.

| Log dell'attività | Cosa verificare |
|---|---|
| Nessuna riga relativa a Microsoft Teams | L'invio del messaggio non è stato tentato. Verificare che `microsoft_teams_alert` sia `true`, che il progetto usi i canali del server e che il template non sopprima la notifica. |
| `Can't send microsoft teams alert! Error: …` | Il server non è riuscito a raggiungere l'host del webhook. Consentire il traffico HTTPS in uscita dal server verso l'host presente nell'URL. Dietro un proxy, impostare `HTTPS_PROXY` per il server Semaphore; vedere [Esecuzione dietro un proxy aziendale](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy). |
| `Can't send microsoft teams alert! Response code: …` | Il webhook ha rifiutato la richiesta. Verificare che l'URL sia stato copiato per intero, compreso il parametro `sig`, e che il flusso sia attivo e non sia stato eliminato. Microsoft limita ogni webhook a quattro richieste al secondo. |
| `Sent successfully microsoft teams alert`, ma nessuna scheda nel canale | Il flusso ha accettato la richiesta ed è fallito in seguito. Aprire il flusso nell'app **Workflows** e controllarne la cronologia delle esecuzioni. Un flusso appartiene all'utente che l'ha creato e smette di funzionare quando quell'utente lascia l'organizzazione o perde l'accesso al canale, quindi aggiungere dei comproprietari al flusso. |
