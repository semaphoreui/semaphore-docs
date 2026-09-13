# Integration

Le Integration consentono di stabilire un'interazione tra Semaphore e servizi esterni, come GitHub e GitLab.

![Elenco delle Integration](/assets/integrations-list.webp)

L'URL del webhook del Project è mostrato sopra l'elenco. Ogni Integration ha un nome e il Task Template che avvia; fare clic su un'Integration per configurarne i matcher e gli estrattori di valori.

![Dettaglio di un'Integration](/assets/integration-detail.webp)

Tramite un'Integration è possibile avviare un Task Template specifico chiamando un endpoint dedicato (alias), per il quale si può configurare uno dei seguenti metodi di autenticazione:
* GitHub Webhooks
* Token
* HMAC
* Nessuna autenticazione

L'alias corrisponde a un URL nel formato seguente: `/api/integrations/<random_string>`. Supporta le richieste `GET` e `POST`.

## Matcher {#matchers}

Con i matcher è possibile definire i parametri della richiesta in arrivo. Quando questi parametri corrispondono, il Task Template viene invocato.

## Estrattori di valori {#value-extractors}

Con un estrattore è possibile prelevare dati dall'intestazione o dal corpo della richiesta (campo JSON o stringa) e passarli al Task. Ogni valore estratto ha un **Variable type**:

* **Environment**: il valore viene aggiunto alle variabili d'ambiente del Task, sovrascrivendo una variabile con lo stesso nome proveniente dal Variable Group.
* **Task parameter**: il valore diventa un parametro del Task, ad esempio una variabile di survey o un prompt.

## Parametri del Task {#task-parameters}

Le Integration possono avviare Task con parametri. Utilizzare gli estrattori di valori per costruire un payload JSON per i parametri del Task e configurare il Task Template in modo che accetti valori richiesti tramite prompt.

## Note su alias e matcher {#notes-on-aliases-and-matchers}

Un alias di Project (l'URL sopra l'elenco delle Integration) è condiviso da tutte le Integration del Project: Semaphore verifica i matcher di ogni Integration e avvia i Task Template i cui matcher corrispondono. Un'Integration può avere anche un alias proprio; le richieste indirizzate a tale alias avviano quell'Integration senza valutare i matcher. Utilizzare preferibilmente l'autenticazione tramite token/HMAC secondo necessità e passare i parametri tramite gli estrattori.
