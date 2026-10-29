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

## Raggiungere il server delle licenze tramite un proxy {#reach-the-license-server-through-a-proxy}

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
