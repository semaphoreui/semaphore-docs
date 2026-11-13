---
title: Coordinamento del cluster
description: Come i nodi HA di Semaphore si coordinano tramite Redis, con ogni chiave, lock e canale Pub/Sub condivisi e la durata di ciascuno.
---

# Coordinamento del cluster <Enterprise />

I nodi Semaphore non comunicano mai direttamente tra loro. Tutto ciò su cui devono accordarsi passa attraverso Redis: chi è attivo, quale task appartiene a quale nodo, chi avvia una pianificazione e quali messaggi dell'interfaccia utente inoltrare. Ogni parte di questo stato è un piccolo insieme di chiavi Redis con una scadenza, quindi un nodo che si blocca non può lasciare nulla alle sue spalle a lungo. I dati durevoli (task, template, log, runner) risiedono sempre nel database; Redis contiene solo lo stato di coordinamento.

Tutte le chiavi usano i prefissi fissi `ha:` e `tasks:`. Non sono configurabili, quindi due cluster Semaphore che condividono lo stesso server Redis devono usare numeri di database diversi (`ha.redis.db`).

## Registro dei nodi {#node-registry}

Ogni nodo si registra all'avvio e poi aggiorna il proprio record ogni 10 secondi. Il record scade dopo 30 secondi, quindi un nodo che smette di aggiornarlo viene considerato morto al massimo dopo mezzo minuto. In caso di arresto regolare, il nodo rimuove immediatamente il proprio record.

| Chiave | Tipo | Scopo |
| --- | --- | --- |
| `ha:node:<node_id>` | stringa, JSON | Heartbeat di un nodo: `node_id`, `started_at`, `version`, `last_beat`. Scade 30 s dopo l'ultimo aggiornamento. |
| `ha:nodes` | set | ID di tutti i nodi registrati. I membri la cui chiave di heartbeat è scaduta vengono rimossi dagli altri nodi. |

Il registro dei nodi è ciò che mostra la dashboard Cluster ed è ciò che consulta il pulitore dei task orfani (vedi sotto) per decidere se il proprietario di un task è ancora attivo.

## Coda dei task e task in esecuzione {#task-queue}

La coda dei task è condivisa, quindi un task avviato su un nodo può essere assegnato, monitorato e finalizzato da qualsiasi altro. Redis memorizza solo gli ID dei task e alcuni campi transitori; il task stesso viene caricato dal database dal nodo che ne ha bisogno.

| Chiave | Tipo | Scopo |
| --- | --- | --- |
| `tasks:queue` | lista | ID dei task in attesa di essere assegnati, in ordine. |
| `tasks:claim:<task_id>` | stringa | ID del nodo proprietario del task. Scritto atomicamente insieme alla rimozione dalla coda, così un task viene preso in carico esattamente da un nodo. Scade dopo 5 minuti; il proprietario lo aggiorna ogni minuto. |
| `tasks:running` | set | ID dei task attualmente in esecuzione. |
| `tasks:active:<project_id>` | set | ID dei task attivi (in attesa o in esecuzione) in un progetto. Usato per i limiti di concorrenza per progetto. |
| `tasks:task_project` | hash | `task_id` → `project_id`, così qualsiasi nodo può caricare il task dal database. |
| `tasks:aliases` | hash | `alias` → `task_id` per i task a cui si fa riferimento tramite un alias. |
| `tasks:runtime:<task_id>` | hash | Campi che cambiano mentre il task è in esecuzione, come l'ID del runner e l'utente che lo ha avviato. |
| `tasks:finalize:<task_id>` | stringa | Lock acquisito dal nodo che scrive il risultato finale di un task eseguito su un runner remoto. Scade dopo 5 minuti. |

Le voci in `tasks:task_project`, `tasks:aliases` e `tasks:runtime:*` vengono rimosse al termine del task e, come misura di sicurezza, scadono comunque dopo 7 giorni.

Un nodo preleva un task dalla coda con una singola operazione atomica: verifica che il task sia ancora in coda, scrive la presa in carico, rimuove il task dalla coda e lo aggiunge al set dei task in esecuzione. Se due nodi ci provano contemporaneamente, solo uno riesce.

**Pulitore dei task orfani.** Una volta al minuto ogni nodo esamina i task in esecuzione il cui proprietario è morto, cioè la presa in carico è scaduta o l'heartbeat del proprietario è scomparso. Un task che il database indica già come terminato viene semplicemente rimosso da Redis. Un task che non è mai stato consegnato a un runner viene rimesso in coda, così che un nodo attivo lo assegni. Un task già in esecuzione su un runner viene lasciato stare: il runner continua a lavorare e il task viene ripulito quando il database lo indica come terminato.

## Lock {#locks}

I lock sono singole chiavi create con `SET NX`: il nodo che riesce a creare la chiave detiene il lock. Ogni lock ha una scadenza, e i lock mantenuti a lungo vengono aggiornati dal loro proprietario, quindi un nodo che si blocca rilascia automaticamente i propri lock.

| Chiave | Scadenza | Scopo |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Un lock per pianificazione per minuto. Il nodo che lo crea avvia la pianificazione; gli altri la saltano. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, aggiornato ogni 10 s | Solo un nodo alla volta fa avanzare una determinata esecuzione di workflow. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Lock breve durante la creazione di una nuova esecuzione di workflow, così due nodi non avviano lo stesso workflow due volte. |
| `ha:audit:export:<destination_id>` | 30 s, aggiornato ogni 10 s | Solo un nodo esporta gli eventi di audit verso una determinata destinazione. Se Redis non è disponibile, nessun nodo esporta, quindi gli eventi non vengono mai inviati due volte. |

I lock di pianificazione e di workflow sono "fail open": se Redis non è raggiungibile, il nodo procede invece di saltare il lavoro, e gli aggiornamenti condizionali nel database mantengono corretto il risultato. Il lease dell'esportazione di audit è invece "fail closed", perché un'esportazione duplicata non può essere annullata.

## Canali Pub/Sub {#pubsub-channels}

| Canale | Scopo |
| --- | --- |
| `ha:ws:broadcast` | Messaggi WebSocket per l'interfaccia utente. Un nodo consegna un messaggio ai propri browser connessi e lo pubblica qui; gli altri nodi lo inoltrano ai loro. |
| `tasks:events` | Modifiche alla coda dei task e al set dei task in esecuzione, aggiornamenti dei campi di runtime e richieste di arresto forzato. I nodi usano questi eventi per mantenere aggiornata la propria vista in memoria della coda e per fermare un task che un altro nodo ha chiesto di fermare. |

I messaggi contengono l'ID del nodo mittente, quindi un nodo ignora i propri messaggi.

## Chiavi della cache dei runner {#runner-cache-keys}

Le chiavi `ha:runner:*` appartengono alla cache condivisa dei record dei runner. Per maggiori informazioni, vedi [Cache di autenticazione dei runner](/admin-guide/ha/runner-cache).

## Pagine correlate {#related-pages}

- [Alta disponibilità](/admin-guide/ha) — architettura, configurazione e impostazione del bilanciatore di carico.
- [Cache di autenticazione dei runner](/admin-guide/ha/runner-cache) — la cache condivisa dei record dei runner.
