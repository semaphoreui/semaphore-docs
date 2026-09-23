# Integration

Le Integration consentono di stabilire un'interazione tra Semaphore e servizi esterni, come GitHub e GitLab.

![Elenco delle Integration](/assets/integrations-list.webp)

L'URL del webhook del Project è mostrato sopra l'elenco. Ogni Integration ha un nome e il Task Template che avvia; fare clic su un'Integration per configurarne i matcher e gli estrattori di valori.

![Dettaglio di un'Integration](/assets/integration-detail.webp)

Tramite un'Integration è possibile avviare un Task Template specifico chiamando un endpoint dedicato (alias), per il quale si può configurare uno dei seguenti metodi di autenticazione:
* GitHub Webhooks
* Token
* HMAC (SHA-256)
* HMAC (SHA-512)
* Nessuna autenticazione

L'alias corrisponde a un URL nel formato seguente: `/api/integrations/<random_string>`. Supporta le richieste `GET` e `POST`.

## Autenticazione HMAC {#hmac-authentication}

I metodi di autenticazione HMAC (`hmac` / SHA-256 e `hmac-sha512` / SHA-512) verificano che il corpo del webhook sia stato firmato con un segreto condiviso.

Configura:

1. **Auth header** — l'intestazione della richiesta che contiene la firma (ad esempio `X-Signature` o `X-Hub-Signature-256`).
2. **Auth secret** — una credenziale di accesso con nome utente e password dell'archivio chiavi; Semaphore usa il valore della **password** come segreto HMAC.

Il mittente deve inserire in questa intestazione un digest HMAC **esadecimale non elaborato** del corpo originale della richiesta (senza prefisso `sha256=` / `sha512=`). Semaphore lo confronta con il valore `HMAC-SHA256` o `HMAC-SHA512` del corpo calcolato con il segreto configurato.

Esempio (SHA-512) con OpenSSL:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

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
