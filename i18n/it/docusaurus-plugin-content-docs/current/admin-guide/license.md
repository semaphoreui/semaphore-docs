---
title: "Attivazione della licenza"
---

# Attivazione della licenza <Pro />

Le funzionalità di Semaphore Pro ed Enterprise vengono abilitate con una chiave di licenza. È possibile attivare la licenza dall'interfaccia web oppure fornire la chiave nella configurazione del server per le distribuzioni automatizzate.

## Prima di iniziare {#before-you-start}

- Non è necessario reinstallare Semaphore UI o passare a una build diversa per attivare Pro o Enterprise. La versione corrente di Semaphore UI può essere attivata con una chiave di licenza. Aggiornare all'ultima versione per accedere alle funzionalità Pro o Enterprise più recenti.
- Accedere con un account amministratore.
- Tenere a portata di mano la chiave di licenza. È riportata nell'email di acquisto o nel [Portale Semaphore UI](https://portal.semaphoreui.com/auth/login).

## Attivazione dall'interfaccia web {#activate-from-the-web-ui}

1. Accedere a Semaphore UI come amministratore.

![Schermata di accesso di Semaphore UI](/assets/subscription-login-screen.png)

2. Aprire il menu Admin dall'area utente nell'angolo in basso a sinistra.

![Pulsante del menu Admin nell'angolo in basso a sinistra](/assets/subscription-admin-menu-trigger.png)

3. Selezionare **Passa a PRO o EE**.

![Menu Admin con la voce Passa a PRO o EE](/assets/subscription-upgrade-menu-item.png)

4. Incollare la chiave di licenza nella finestra di attivazione e fare clic su **ATTIVA NUOVA CHIAVE**.

![Finestra di attivazione di Semaphore Pro](/assets/subscription-activation-dialog.png)

Dopo un'attivazione riuscita, Semaphore UI mostra i dettagli della licenza corrente nella finestra **Abbonamento e fatturazione**.

![Finestra Abbonamento e fatturazione dopo l'attivazione riuscita](/assets/subscription-activation-success.png)

## Attivazione dalla configurazione {#activate-from-configuration}

Per Docker, Kubernetes, systemd o altre distribuzioni automatizzate, fornire la chiave di licenza nella configurazione del server anziché inserirla nell'interfaccia. I nomi delle opzioni di configurazione utilizzano `subscription.*`.

In `config.json`:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

Oppure come variabile d'ambiente:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

È anche possibile conservare la chiave in un file:

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

oppure:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

Quando la chiave di licenza è gestita tramite configurazione, Semaphore UI disabilita i controlli di modifica e attivazione nella finestra **Abbonamento e fatturazione**. Questo vale sia per `subscription.key` sia per `subscription.key_file`, perché all'avvio il server legge il file della chiave nella chiave di licenza in uso.

## Come funziona la validazione della licenza {#how-license-validation-works}

Semaphore UI valida la licenza presso il Portale di Semaphore UI. L'indirizzo è in `subscription.server_url`, per impostazione predefinita `https://portal.semaphoreui.com/billing`.

### A cosa si connette Semaphore UI {#what-semaphore-ui-connects-to}

| Quando | Richiesta |
| --- | --- |
| Attivazione di una chiave | `POST {server_url}/subscriptions/{key}/activate` |
| Validazione e rinnovo della licenza | `POST {server_url}/subscriptions/{key}/validate` |

Entrambe sono semplici richieste JSON e una richiesta viene abbandonata dopo 20 secondi. La richiesta di attivazione invia la chiave di licenza; la richiesta di validazione invia il token di licenza che il server possiede in quel momento. Nient'altro lascia l'installazione: account utente, nomi dei progetti, inventari, nomi host e output dei task non fanno parte di queste richieste.

La risposta in entrambi i casi è un **token di licenza**: un JWT firmato dal portale con una chiave RSA. Semaphore UI verifica la firma con la corrispondente chiave pubblica integrata nel binario del server, quindi un token non può essere falsificato né modificato. I suoi claim indicano ciò che la licenza consente: il piano, lo stato dell'abbonamento, il nome dell'azienda, la data di scadenza e il numero di utenti Pro, nodi e UI. Il server conserva la chiave e il token nel database, nelle opzioni `subscription_key` e `subscription_token`.

### Quando viene eseguito il controllo {#when-the-check-runs}

| Evento | Cosa accade |
| --- | --- |
| Avvio del server | Il token di licenza viene rinnovato una volta. |
| Ogni giorno alle 01:00, ora del server | Il token di licenza viene rinnovato. |
| Attivazione di una chiave nell'interfaccia web o tramite `subscription.key` | La chiave viene attivata e restituisce il primo token. |
| **Ricarica** nella finestra **Abbonamento e fatturazione** | Il token di licenza viene rinnovato su richiesta. |

Tra queste chiamate Semaphore UI non contatta il portale. Ogni controllo della licenza — se le funzionalità Pro sono abilitate e se un ulteriore utente Pro, runner o stato del backend HTTP di Terraform/OpenTofu rientra nella licenza — legge localmente il token memorizzato.

### Quando il portale non è raggiungibile {#when-the-portal-cannot-be-reached}

Un rinnovo fallito viene scritto nel log del server con il contesto `subscription` e lascia intatto il token memorizzato, quindi un'interruzione di rete o un portale non disponibile non disattiva le funzionalità Pro. L'installazione continua a funzionare fino al superamento della data di scadenza contenuta nel token stesso: un token scaduto viene ancora caricato, ma il suo stato diventa `expired` e le funzionalità Pro si interrompono.

### Chiavi online e offline {#online-and-offline-keys}

- Una **chiave online** è un UUID nella forma `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`. La sua attivazione chiama il portale e il rinnovo giornaliero la mantiene aggiornata. Un valore che non è un UUID viene rifiutato prima di effettuare qualsiasi richiesta.
- Una **chiave offline** è essa stessa un token di licenza: una lunga stringa firmata emessa per un'installazione senza accesso a internet. Semaphore UI la verifica localmente e non chiama mai il portale per essa, quindi il rinnovo giornaliero non effettua alcuna richiesta. Per rinnovare una licenza offline, sostituire la chiave con una appena emessa.

### Alta disponibilità {#high-availability}

Ogni nodo del server rinnova la licenza al proprio avvio e secondo la propria pianificazione giornaliera, e scrive il risultato nel database condiviso, così tutti i nodi del cluster leggono lo stesso token di licenza. Non è necessaria alcuna configurazione aggiuntiva.

## Raggiungere il server delle licenze tramite un proxy {#reach-the-license-server-through-a-proxy}

:::info Dalla v2.20
Il proxy è disponibile da **Semaphore 2.20**.
:::

L'attivazione di una chiave, l'aggiornamento del token di licenza e l'aggiornamento giornaliero del token chiamano tutti il Portale di Semaphore UI su `subscription.server_url`. In una rete in cui il server non ha accesso diretto a internet, instrada quelle chiamate attraverso un proxy HTTP:

```json
{
  "subscription": {
    "proxy": {
      "url": "http://proxy.example.com:3128",
      "username": "semaphore",
      "password": "PROXY_PASSWORD"
    }
  }
}
```

Oppure come variabili d'ambiente:

```bash
export SEMAPHORE_SUBSCRIPTION_PROXY_URL=http://proxy.example.com:3128
export SEMAPHORE_SUBSCRIPTION_PROXY_USERNAME=semaphore
export SEMAPHORE_SUBSCRIPTION_PROXY_PASSWORD=PROXY_PASSWORD
```

Note:

- Sono supportati gli schemi `http`, `https`, `socks5` e `socks5h`. Un indirizzo proxy non valido arresta il server all'avvio.
- `username` e `password` sono opzionali e sovrascrivono le credenziali indicate dentro `url`. Tenerle separate mantiene la password fuori dall'indirizzo del proxy che Semaphore UI registra nei log.
- Il proxy vale solo per le richieste al server delle licenze. Le attività, i cloni Git e le altre connessioni in uscita non sono interessate.
- Senza `subscription.proxy`, il server delle licenze viene raggiunto tramite le variabili proxy del processo del server (`HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`), come prima.
- Un'installazione isolata da internet richiede una chiave di licenza offline invece di un proxy: per essa il server non chiama mai il portale.

## Gestione o sostituzione di una chiave di licenza {#manage-or-replace-a-license-key}

Per rinnovare, sostituire o consultare la licenza, aprire il menu Admin e selezionare **Abbonamento e fatturazione**.

![Menu Admin con la voce Abbonamento e fatturazione](/assets/subscription-billing-menu-item.png)

Per una chiave di licenza gestita dall'interfaccia web, aprire il menu delle azioni nella finestra **Abbonamento e fatturazione** per ricaricare, caricare o reimpostare la chiave.

![Finestra Abbonamento e fatturazione con le azioni sulla chiave](/assets/subscription-key-actions-menu.png)

Se la chiave è configurata sul server:

1. Sostituire il valore di `subscription.key` oppure aggiornare il contenuto del file indicato da `subscription.key_file`.
2. Riavviare Semaphore UI affinché il server ricarichi la chiave di licenza.
3. Verificare che le opzioni Pro o Enterprise previste siano disponibili in Semaphore UI.
