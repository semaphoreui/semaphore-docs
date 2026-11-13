---
title: Cache di autenticazione dei runner
description: Perché Semaphore memorizza nella cache i record dei runner per token, come i nodi HA condividono la cache tramite Redis, quando le voci vengono invalidate e cosa succede se Redis non è disponibile.
---

# Cache di autenticazione dei runner

Ogni richiesta che un [runner](/admin-guide/runners) invia al server contiene il suo token, e il server deve trasformare quel token in un record del runner prima di poter fare qualsiasi altra cosa. I runner interrogano il server ogni pochi secondi e riportano l'avanzamento ogni secondo mentre un job è in esecuzione, quindi senza una cache ognuna di queste richieste costerebbe una query al database. La cache dei runner risponde alla maggior parte di esse dalla memoria.

Un singolo nodo tiene la cache nella propria memoria. In modalità HA questo non basta: se si modifica un runner sul nodo A, il nodo B non deve continuare a servire il vecchio record. Per questo in modalità HA la cache risiede in Redis ed è condivisa da tutti i nodi, e una modifica effettuata tramite qualsiasi nodo è visibile a tutti immediatamente.

:::note
Questa cache non è l'azione **Svuota cache** della pagina Runner. Quell'azione chiede al runner stesso di eliminare le directory di lavoro sulla sua macchina.
:::

## Cosa viene memorizzato nella cache e per quanto tempo {#runner-cache-ttl}

Il valore memorizzato nella cache è il record del runner senza i suoi tag e senza il token. Il token non raggiunge mai Redis: la chiave è derivata da un hash SHA-256 del token, e il campo del token viene svuotato prima che il record venga salvato.

Una voce vive al massimo 30 secondi. In pratica viene eliminata molto prima, perché ogni modifica effettuata tramite Semaphore invalida subito la cache:

* La creazione, la modifica, l'eliminazione o la nuova registrazione di un runner, oppure l'eliminazione di un progetto, elimina **tutti** i runner in cache su tutti i nodi.
* Un heartbeat di un runner elimina **solo la voce di quel runner**, così l'orario "visto l'ultima volta" memorizzato resta aggiornato senza toccare gli altri. Un heartbeat viene scritto al massimo una volta per intervallo pari a un terzo di `runners.offline_timeout_sec`, con un limite di 45 secondi; con il timeout predefinito di 120 secondi, ciò avviene ogni 40 secondi.

La scadenza di 30 secondi conta solo per le modifiche effettuate al di fuori di Semaphore, ad esempio modificando direttamente la tabella `runner` o ripristinando un backup.

## Come vengono evitate le scritture obsolete {#runner-cache-generation}

Una ricerca che non trova la voce in cache legge il runner dal database e poi lo salva. Tra questi due passaggi un altro nodo potrebbe modificare il runner. Per garantire che la ricerca non metta mai in cache ciò che ha letto prima della modifica, la cache mantiene un contatore che cresce a ogni invalidazione. La ricerca ricorda il valore del contatore visto prima di accedere al database, e il salvataggio viene rifiutato se nel frattempo il contatore è avanzato. Ogni passaggio viene eseguito come un unico script Lua in Redis, così il contatore e la voce vengono letti e scritti insieme.

## Chiavi Redis {#runner-cache-redis-keys}

| Chiave | Tipo | Scopo |
| --- | --- | --- |
| `ha:runner:gen` | stringa, intero | Il contatore. Cresce di uno a ogni invalidazione, sia dell'intera cache sia di un singolo runner. |
| `ha:runner:inv` | stringa, intero | Valore del contatore all'ultima invalidazione completa. Fa parte di ogni chiave di voce, quindi un'invalidazione completa rende tutte le voci esistenti irraggiungibili in un colpo solo; poi scadono da sole. |
| `ha:runner:token:<inv>:<sha256(token)>` | stringa, binario | Il record del runner in cache. Scade dopo 30 s. |
| `ha:runner:forgot:<sha256(token)>` | stringa, intero | Valore del contatore all'ultimo heartbeat di questo runner. Una ricerca iniziata prima dell'heartbeat non può salvare il record precedente all'heartbeat. Scade dopo 30 s. |

La dashboard Cluster riporta il numero di chiavi `ha:runner:token:*` come dimensione della cache dei runner.

## Comportamento in caso di problemi con Redis {#runner-cache-failures}

La cache non fa mai fallire una richiesta di un runner. Ogni operazione sulla cache è limitata a 500 millisecondi; se Redis è lento o irraggiungibile, la ricerca viene trattata come un miss e va al database, e nulla viene salvato. L'unico caso da tenere presente è un'invalidazione che fallisce perché Redis è giù nel momento in cui un runner viene modificato: gli altri nodi potrebbero allora servire il vecchio record finché non scade, al massimo 30 secondi dopo. L'errore viene registrato a livello error.

## Pagine correlate {#related-pages}

- [Alta disponibilità](/admin-guide/ha) — architettura, configurazione e impostazione del bilanciatore di carico.
- [Coordinamento del cluster](/admin-guide/ha/coordination) — le chiavi, i lock e i canali Redis condivisi dai nodi.
- [Runner](/admin-guide/runners) — registrazione e configurazione dei runner.
