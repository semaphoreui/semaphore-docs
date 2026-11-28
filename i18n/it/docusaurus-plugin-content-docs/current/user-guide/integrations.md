---
title: Integration
description: Avvio di Task Template e Workflow da webhook in ingresso tramite endpoint, gruppi di Integration, metodi di autenticazione, matcher ed estrattori di valori.
---

# Integration

Le Integration consentono a servizi esterni come GitHub, GitLab o un server CI di avviare Task in Semaphore chiamando un URL di webhook. Tre oggetti descrivono un'Integration: un **endpoint** indica dove arriva la richiesta e come viene autenticata, un **gruppo di Integration** indica quali Integration vengono eseguite da quell'endpoint e un'**Integration** indica cosa avviare e con quali parametri.

![Elenco delle Integration](/assets/integrations-list.webp)

## Come funziona {#how-it-works}

| Oggetto | Cosa contiene | Dove |
|---|---|---|
| **Endpoint** | Un nome e una descrizione, uno o più **alias** (URL pubblici nel formato `/api/integrations/<random_string>`) e l'**autenticazione** con cui viene verificata ogni richiesta a tali URL. | Project → **Endpoint** |
| **Gruppo di Integration** | Un insieme di Integration eseguite da un endpoint. Di norma un gruppo eredita l'autenticazione dell'endpoint; può **sovrascriverla** con un metodo e un segreto propri. | Project → **Integration**, una sezione per gruppo |
| **Integration** | Il Task Template o il Workflow (Pro) da avviare, i suoi parametri del Task, i [matcher](#matchers) che filtrano le richieste e gli [estrattori di valori](#value-extractors) che alimentano il Task. | All'interno del suo gruppo |

Quando una richiesta arriva a un alias, Semaphore individua l'endpoint, verifica la richiesta con l'autenticazione di ogni gruppo (quella dell'endpoint o quella propria del gruppo) e avvia ogni Integration di un gruppo autorizzato i cui matcher accettano tutti la richiesta. Un'Integration senza matcher viene eseguita a ogni richiesta autorizzata. La risposta è sempre `204 No Content`; le intestazioni `X-Semaphore-Endpoint-ID`, `X-Semaphore-Integration-Group-ID`, `X-Semaphore-Integration-ID` e `X-Semaphore-Task-ID` indicano cosa è stato avviato. Sono accettati `GET` e `POST`.

![Dettaglio di un'Integration](/assets/integration-detail.webp)

La stringa dell'alias è l'unico segreto di un endpoint non autenticato: trattare l'URL come una password e rimuovere un alias per revocarlo. Un endpoint può avere più alias, quindi è possibile consegnare un URL distinto a ogni mittente e revocarli uno alla volta.

## Autenticazione {#authentication}

Un endpoint, o un gruppo che lo sovrascrive, verifica le richieste con uno dei seguenti metodi:

* **GitHub Webhooks** — l'intestazione `X-Hub-Signature-256`, HMAC-SHA256 del corpo con il segreto
* **Bitbucket Webhooks** — l'intestazione `x-hub-signature`, HMAC-SHA256 del corpo
* **Token** — un'intestazione a scelta deve essere uguale al segreto
* **HMAC (SHA-256)** e **HMAC (SHA-512)** — un'intestazione a scelta contiene la firma del corpo
* **BasicAuth** — nome utente e password di una credenziale con nome utente e password
* **Nessuna autenticazione** — qualsiasi richiesta con un URL di alias valido viene accettata

Il segreto proviene dall'[archivio chiavi](./key-store) del Project: una chiave di tipo **Stringa** (il suo valore è il segreto) oppure una credenziale con **nome utente e password** (la sua password è il segreto). BasicAuth è l'eccezione: verifica anche il nome utente, quindi richiede una credenziale con nome utente e password. Il modulo propone solo le chiavi il cui tipo è adatto al metodo e l'API rifiuta le altre.

## Autenticazione HMAC {#hmac-authentication}

I metodi di autenticazione HMAC (`hmac` / SHA-256 e `hmac-sha512` / SHA-512) verificano che il corpo del webhook sia stato firmato con un segreto condiviso.

Configurare sull'endpoint (o sul gruppo che lo sovrascrive):

1. **Auth header** — l'intestazione della richiesta che contiene la firma (ad esempio `X-Signature`).
2. **Auth secret** — una chiave di tipo **Stringa** dell'archivio chiavi oppure una credenziale con nome utente e password.

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

I matcher descrivono le richieste a cui un'Integration reagisce: un'intestazione o un campo del corpo (percorso JSON o l'intero corpo come stringa) confrontato con un valore. Tutti i matcher di un'Integration devono corrispondere; un'Integration senza matcher viene eseguita a ogni richiesta che il suo gruppo lascia passare. Utilizzare i matcher per eseguire Integration diverse di uno stesso endpoint per eventi diversi — ad esempio un Task Template per `push` e un altro per `release`.

## Estrattori di valori {#value-extractors}

Con un estrattore è possibile prelevare dati dall'intestazione o dal corpo della richiesta (campo JSON o stringa) e passarli al Task. Ogni valore estratto ha un **Variable type**:

* **Environment**: il valore viene aggiunto alle variabili d'ambiente del Task, sovrascrivendo una variabile con lo stesso nome proveniente dal Variable Group.
* **Task parameter**: il valore diventa un parametro del Task, ad esempio una variabile di survey o un prompt.

## Parametri del Task {#task-parameters}

Le Integration possono avviare Task con parametri. Utilizzare gli estrattori di valori per costruire un payload JSON per i parametri del Task e configurare il Task Template in modo che accetti valori richiesti tramite prompt.

## Aggiornamento da versioni precedenti {#upgrading-from-older-versions}

Prima della versione 2.20.19 un'Integration aveva una propria autenticazione e gli alias esistevano per l'intero Project oppure per una singola Integration. L'aggiornamento converte questa configurazione senza cambiare il comportamento di alcun URL esistente:

| Prima | Dopo l'aggiornamento |
|---|---|
| Alias del Project (l'URL sopra l'elenco delle Integration) | Un endpoint denominato **Default** senza autenticazione che li contiene tutti |
| Un'Integration raggiungibile tramite l'alias del Project ("Usa alias del Project" attivo) | Un gruppo dedicato sull'endpoint **Default**. Se l'Integration aveva un'autenticazione, il gruppo **sovrascrive** con essa quella dell'endpoint |
| Un'Integration con alias propri | Un endpoint con il nome dell'Integration, con i suoi alias e la sua autenticazione, e un gruppo dedicato su tale endpoint |
| Matcher ed estrattori di valori | Invariati |

Ogni Integration finisce da sola in un gruppo che porta il suo nome; in seguito è possibile unire i gruppi o rinominare gli endpoint a piacere. Due dettagli differiscono dal comportamento precedente: un'Integration dietro l'alias del Project che non aveva matcher prima non veniva mai eseguita e ora viene eseguita a ogni richiesta autorizzata, e gli alias propri di un'Integration che usava anche l'alias del Project (e che non corrispondevano mai a nulla) vengono eliminati. I backup di Project creati con una versione precedente vengono convertiti nello stesso modo al ripristino.
