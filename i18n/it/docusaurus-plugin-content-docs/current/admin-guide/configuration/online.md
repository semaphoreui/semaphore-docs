---
title: Usare il configuratore online
description: Genera comandi di configurazione binaria o un file Docker Compose con il configuratore online di Semaphore.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Usare il configuratore online

Compila il modulo per generare i comandi di configurazione di un nuovo server Semaphore. L’anteprima si aggiorna durante la modifica; applica il risultato sul tuo server per completare la configurazione.

## Prima di iniziare {#before-you-begin}

- Scegli l’installazione binaria o Docker e la versione di Semaphore. I link e i video usano **2.19**; seleziona la tua versione sul sito.
- Per MySQL o Postgres, prepara i dati di connessione. Per SQLite, scegli un percorso del file di database scrivibile dall’utente del servizio Semaphore.
- Usa una tua password amministratore. I video contengono valori dimostrativi.

## Passaggi {#steps}

Segui la sezione relativa al tuo metodo di installazione.

### Installazione binaria {#binary-installation}

1. Apri la [pagina di installazione binaria](https://semaphoreui.com/install/binary/2_19/install). Cerca piattaforma, architettura e tipo di pacchetto. Fai clic sulla riga per mostrare i comandi; copiali ed eseguili sul server, oppure usa **Download** per scaricare il pacchetto.
2. Apri [Server setup](https://semaphoreui.com/install/binary/2_19/config). In **Database settings**, seleziona **SQLite**, **MySQL** o **Postgres** e inserisci il percorso o i dati di connessione. In **Admin user**, compila login, password, nome ed email.
3. Torna a **Config file** e fai clic sull’icona di copia. Controlla i comandi prima di eseguirli in una directory scrivibile del server. Creano `config.json`, aggiungono l’amministratore e avviano Semaphore. Conserva la configurazione e le chiavi di cifratura generate per gli avvii successivi.

![Riga Linux amd64 deb espansa con i comandi di installazione](/img/admin-guide/configuration/online/binary-install.png)

![Campi del database e dell’amministratore compilati con valori dimostrativi](/img/admin-guide/configuration/online/binary-settings.png)

Il video mostra la scelta del pacchetto, le impostazioni del server e la copia dei comandi.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="Il video mostra la scelta del pacchetto, le impostazioni del server e la copia dei comandi.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Installazione Docker {#docker-installation}

1. Apri il [configuratore Docker](https://semaphoreui.com/install/docker/2_19). In **Container settings**, imposta nome e porta dell’host. In **Docker volumes**, attiva i volumi dei dati e della configurazione per conservarli quando sostituisci il container.
2. Scegli il database e compila **Admin user**, usando una tua password. Per un database esterno, usa un host raggiungibile dal container.
3. Seleziona **Docker Compose** e fai clic sull’icona di download. Salva il risultato come `docker-compose.yml` nella directory di deployment, controllalo ed esegui lì `docker compose up -d`. In alternativa, seleziona **Docker command** e copia il comando `docker run` generato.

![Impostazioni del container Docker con volumi persistenti dei dati e della configurazione attivati](/img/admin-guide/configuration/online/docker-settings.png)

Il video mostra le impostazioni del container, i volumi persistenti e il download di Docker Compose.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="Il video mostra le impostazioni del container, i volumi persistenti e il download di Docker Compose.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## Passi successivi {#whats-next}

Apri il server nel browser, ad esempio `http://localhost:3000` se lo esegui localmente, e accedi con le credenziali amministratore inserite.

- [Eseguire il binario come servizio](/admin-guide/installation/binary-file#run-as-a-service).
- [Dettagli del deployment Docker](/admin-guide/installation/docker).
- [Tutte le opzioni di configurazione](/reference/configuration).
