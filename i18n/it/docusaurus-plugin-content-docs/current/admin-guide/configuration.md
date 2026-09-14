---
title: Configurazione
description: Semaphore legge le impostazioni da un file di configurazione e dalle variabili d’ambiente. Il configuratore online permette di prepararle tramite un modulo. Scegli il metodo adatto al tuo server.
---

# Configurazione

Semaphore legge le impostazioni da un file di configurazione e dalle variabili d’ambiente. Il configuratore online permette di prepararle tramite un modulo. Scegli il metodo adatto al tuo server.

## In questa sezione {#in-this-section}

| Metodo | Quando usarlo |
|---|---|
| [Configuratore online](/admin-guide/configuration/online) | Vuoi un modulo che generi configurazione e comandi di avvio per un’installazione binaria o Docker. |
| [File di configurazione](/admin-guide/configuration/config-file) | Vuoi conservare le impostazioni del server in un file `config.json`. |
| [Variabili d'ambiente](/admin-guide/configuration/env-vars) | Gestisci le impostazioni tramite Docker, una definizione di servizio o strumenti di deployment. |

## Opzioni di configurazione {#configuration-options}

Una variabile d’ambiente prevale sul valore corrispondente nel file. Il valore predefinito si applica quando nessuno dei due è impostato. Se modificare il file non ha effetto, controlla l’ambiente del processo Semaphore.

Il [riferimento delle opzioni di configurazione](/reference/configuration) elenca nomi, variabili d’ambiente, tipi e valori predefiniti. È generato dal codice di Semaphore; per un server meno recente usa la documentazione della sua versione.

<span id="frequently-asked-questions" />

## URL pubblico {#1-how-to-configure-a-public-url-for-semaphore-ui}

Imposta `web_host` (o `SEMAPHORE_WEB_ROOT`) sull’indirizzo aperto dagli utenti nel browser. Se un proxy inverso espone Semaphore su `https://example.com/semaphore`, usa l’indirizzo completo, incluso `/semaphore`. È l’indirizzo pubblico, non quello interno usato dal proxy.

## Da dove iniziare {#where-to-start}

Per un nuovo server, apri la guida al configuratore online e segui i passaggi per binari o Docker. Per un server esistente, modifica il file o le variabili d’ambiente del servizio, quindi riavvia Semaphore.
