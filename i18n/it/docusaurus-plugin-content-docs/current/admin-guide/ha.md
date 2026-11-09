---
title: "Alta disponibilità"
---

# Alta disponibilità <Enterprise />

:::info
L'alta disponibilità è disponibile nell'edizione **Semaphore Enterprise**.
:::

Semaphore UI supporta distribuzioni ad alta disponibilità (HA) in modalità active-active, in cui più istanze vengono eseguite contemporaneamente dietro un bilanciatore di carico. Ogni istanza è pienamente in grado di gestire richieste dell'interfaccia utente, chiamate API, job pianificati ed esecuzione dei task. Se un'istanza si guasta, i nodi rimanenti continuano a funzionare senza interruzioni.

## Architettura {#architecture}

Una tipica distribuzione active-active è composta dai seguenti componenti:

**Bilanciatore di carico** — Gli utenti si connettono tramite un bilanciatore di carico (ad es. NGINX, HAProxy o un bilanciatore di carico cloud). Il bilanciatore di carico distribuisce il traffico HTTP e WebSocket tra i nodi Semaphore disponibili.

**Nodi Semaphore** — Ogni nodo esegue un'istanza identica di Semaphore UI. Qualsiasi nodo può ricevere richieste degli utenti, avviare job di automazione, elaborare task pianificati e inviare aggiornamenti in tempo reale. Tutti i nodi sono equivalenti: non esiste un nodo primario o di standby.

**Database condiviso** — Tutte le istanze si connettono a un database PostgreSQL o MySQL condiviso. Il database funge da unica fonte di verità per progetti, template, inventory, pianificazioni, cronologia dei task, account utente e configurazione RBAC.

:::warning
SQLite e BoltDB non sono supportati per le distribuzioni HA. Utilizzare PostgreSQL o MySQL.
:::

**Redis** — Redis fornisce il livello di coordinamento che consente a più nodi di comportarsi come un unico sistema. Svolge tre funzioni:

* I **lock distribuiti** garantiscono che solo un'istanza esegua un determinato job alla volta, evitando l'esecuzione duplicata dei task.
* Lo **stato condiviso della coda dei task** mantiene la coda dei task in modo che ogni job venga preso in carico esattamente da un solo worker. Tutti i nodi vedono la stessa coda e coordinano l'esecuzione.
* La **messaggistica Pub/Sub** consente ai nodi di trasmettere eventi come aggiornamenti dei task, notifiche del cluster, invalidazione della cache e modifiche dello stato dell'interfaccia utente. In questo modo tutti i nodi restano sincronizzati in tempo reale.

## Prerequisiti {#prerequisites}

Prima di configurare l'HA sono necessari:

* Una chiave di abbonamento **Semaphore Enterprise**.
* Un database **PostgreSQL** o **MySQL** condiviso, accessibile da tutti i nodi.
* Un server **Redis** o una distribuzione **Redis Sentinel**, accessibile da tutti i nodi. Redis Cluster non è supportato.
* Un **bilanciatore di carico** che supporti il traffico HTTP e WebSocket.
* Due o più server su cui eseguire le istanze Semaphore.

Tutti i nodi Semaphore devono utilizzare lo stesso database, lo stesso backend Redis e la stessa configurazione (ad eccezione di `ha.node_id`, che deve essere univoco per ogni nodo).

## Configurazione {#configuration}

Abilitare l'HA aggiungendo il blocco `ha` al file `config.json` su ogni nodo:

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

Ogni nodo deve avere un `ha.node_id` univoco. Tutto il resto della configurazione deve essere identico su tutti i nodi.

### Variabili d'ambiente {#environment-variables}

In alternativa, è possibile configurare l'HA tramite variabili d'ambiente:

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Per sopravvivere alla perdita del server Redis stesso, indirizzare il cluster verso una distribuzione [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) invece di un singolo indirizzo. Impostare `ha.engine` su `redis_sentinel` e descrivere la configurazione di Sentinel in `ha.redis_sentinel`:

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

Ogni nodo chiede ai sentinel qual è il master corrente e segue un failover senza riavvio: un task in esecuzione nel momento in cui il master cambia continua a essere eseguito, mentre i nuovi task, le pianificazioni e gli aggiornamenti in tempo reale proseguono sulla replica promossa.

La stessa configurazione con le variabili d'ambiente (l'elenco dei sentinel è un array JSON):

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

Note:

* `ha.engine` determina quale blocco viene letto. `redis` (il valore predefinito) legge `ha.redis`; `redis_sentinel` legge `ha.redis_sentinel`. L'altro blocco, se presente, viene ignorato e all'avvio viene registrato un avviso.
* Con `redis_sentinel`, `master_name` e almeno un indirizzo in `addrs` sono obbligatori; senza di essi il nodo si rifiuta di avviarsi.
* `user` e `pass` autenticano l'accesso ai nodi dati Redis. Se i sentinel stessi richiedono l'autenticazione (`requirepass` in `sentinel.conf`), impostare anche `sentinel_user` e `sentinel_pass`.
* `tls` e `tls_skip_verify` si applicano sia alle connessioni a Sentinel sia a quelle ai nodi dati Redis.

### Riferimento della configurazione {#configuration-reference}

| Opzione del file di configurazione | Variabile d'ambiente | Descrizione |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | Abilita la modalità Alta disponibilità. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | Identificatore univoco di questo nodo. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Indirizzo del server Redis (ad es. `localhost:6379`). |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Numero del database Redis. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Password del server Redis. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Nome utente del server Redis. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Abilita TLS per la connessione a Redis. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Ignora la verifica del certificato TLS per Redis. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Backend Redis: `redis` (server singolo, predefinito) o `redis_sentinel`. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Nome del master monitorato così come è configurato in Sentinel. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Indirizzi dei sentinel, `host:port`. Array JSON nella variabile d'ambiente. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Nome utente per i nodi Sentinel stessi. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Password per i nodi Sentinel stessi. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | Numero del database Redis sui nodi dati. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Nome utente per i nodi dati Redis. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Password per i nodi dati Redis. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Abilita TLS per le connessioni a Sentinel e a Redis. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Ignora la verifica del certificato TLS per le connessioni a Sentinel e a Redis. |

Consultare [Configurazione](/admin-guide/configuration) per l'elenco completo delle opzioni disponibili.

## Bilanciatore di carico {#load-balancer}

Posizionare un bilanciatore di carico davanti ai nodi Semaphore per distribuire il traffico. Il bilanciatore di carico deve supportare le **connessioni WebSocket** per gli aggiornamenti in tempo reale dell'interfaccia utente.

### Esempio NGINX {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

Consultare [Reverse proxy](/admin-guide/reverse-proxy/nginx) per ulteriori dettagli sulla configurazione di NGINX.

## Come funziona l'esecuzione dei job {#how-job-execution-works}

In una distribuzione multi-nodo, l'esecuzione dei task segue un flusso coordinato:

1. **L'utente avvia un task.** Un utente avvia un job tramite l'interfaccia utente o l'API. La richiesta può arrivare a qualsiasi nodo Semaphore.
2. **I metadati del task vengono salvati.** Il nodo che riceve la richiesta scrive i metadati del task nel database e segnala il lavoro tramite Redis.
3. **Un nodo prende in carico il task.** Uno dei nodi disponibili recupera il task da Redis, acquisisce un lock distribuito e lo contrassegna come in esecuzione nel database.
4. **Il task viene eseguito.** Il nodo esegue il task localmente o lo delega a un [runner remoto](/admin-guide/runners). Avanzamento e log vengono scritti nel database.
5. **I risultati vengono trasmessi.** Gli aggiornamenti del task si propagano tramite Redis Pub/Sub, così tutti i nodi e i client dell'interfaccia utente connessi restano sincronizzati.

## Come funziona l'HA dietro le quinte {#under-the-hood}

I nodi Semaphore non comunicano mai direttamente tra loro. Tutto ciò su cui devono accordarsi passa attraverso Redis: chi è attivo, quale task appartiene a quale nodo, chi avvia una pianificazione e quali messaggi dell'interfaccia utente inoltrare. Ogni parte di questo stato è un piccolo insieme di chiavi Redis con una scadenza, quindi un nodo che si blocca non può lasciare nulla alle sue spalle a lungo. I dati durevoli (task, template, log, runner) risiedono sempre nel database; Redis contiene solo lo stato di coordinamento.

Tutte le chiavi usano i prefissi fissi `ha:` e `tasks:`. Non sono configurabili, quindi due cluster Semaphore che condividono lo stesso server Redis devono usare numeri di database diversi (`ha.redis.db`).

### Registro dei nodi {#node-registry}

Ogni nodo si registra all'avvio e poi aggiorna il proprio record ogni 10 secondi. Il record scade dopo 30 secondi, quindi un nodo che smette di aggiornarlo viene considerato morto al massimo dopo mezzo minuto. In caso di arresto regolare, il nodo rimuove immediatamente il proprio record.

| Chiave | Tipo | Scopo |
| --- | --- | --- |
| `ha:node:<node_id>` | stringa, JSON | Heartbeat di un nodo: `node_id`, `started_at`, `version`, `last_beat`. Scade 30 s dopo l'ultimo aggiornamento. |
| `ha:nodes` | set | ID di tutti i nodi registrati. I membri la cui chiave di heartbeat è scaduta vengono rimossi dagli altri nodi. |

Il registro dei nodi è ciò che mostra la dashboard Cluster ed è ciò che consulta il pulitore dei task orfani (vedi sotto) per decidere se il proprietario di un task è ancora attivo.

### Coda dei task e task in esecuzione {#task-queue}

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

### Lock {#locks}

I lock sono singole chiavi create con `SET NX`: il nodo che riesce a creare la chiave detiene il lock. Ogni lock ha una scadenza, e i lock mantenuti a lungo vengono aggiornati dal loro proprietario, quindi un nodo che si blocca rilascia automaticamente i propri lock.

| Chiave | Scadenza | Scopo |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Un lock per pianificazione per minuto. Il nodo che lo crea avvia la pianificazione; gli altri la saltano. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, aggiornato ogni 10 s | Solo un nodo alla volta fa avanzare una determinata esecuzione di workflow. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Lock breve durante la creazione di una nuova esecuzione di workflow, così due nodi non avviano lo stesso workflow due volte. |
| `ha:audit:export:<destination_id>` | 30 s, aggiornato ogni 10 s | Solo un nodo esporta gli eventi di audit verso una determinata destinazione. Se Redis non è disponibile, nessun nodo esporta, quindi gli eventi non vengono mai inviati due volte. |

I lock di pianificazione e di workflow sono "fail open": se Redis non è raggiungibile, il nodo procede invece di saltare il lavoro, e gli aggiornamenti condizionali nel database mantengono corretto il risultato. Il lease dell'esportazione di audit è invece "fail closed", perché un'esportazione duplicata non può essere annullata.

### Canali Pub/Sub {#pubsub-channels}

| Canale | Scopo |
| --- | --- |
| `ha:ws:broadcast` | Messaggi WebSocket per l'interfaccia utente. Un nodo consegna un messaggio ai propri browser connessi e lo pubblica qui; gli altri nodi lo inoltrano ai loro. |
| `tasks:events` | Modifiche alla coda dei task e al set dei task in esecuzione, aggiornamenti dei campi di runtime e richieste di arresto forzato. I nodi usano questi eventi per mantenere aggiornata la propria vista in memoria della coda e per fermare un task che un altro nodo ha chiesto di fermare. |

I messaggi contengono l'ID del nodo mittente, quindi un nodo ignora i propri messaggi.

### Chiavi della cache dei runner {#runner-cache-keys}

Le chiavi `ha:runner:*` appartengono alla [cache dei runner](#runner-cache), descritta nella sezione successiva.

## Cache dei runner {#runner-cache}

Ogni richiesta che un [runner](/admin-guide/runners) invia al server contiene il suo token, e il server deve trasformare quel token in un record del runner prima di poter fare qualsiasi altra cosa. I runner interrogano il server ogni pochi secondi e riportano l'avanzamento ogni secondo mentre un job è in esecuzione, quindi senza una cache ognuna di queste richieste costerebbe una query al database. La cache dei runner risponde alla maggior parte di esse dalla memoria.

Un singolo nodo tiene la cache nella propria memoria. In modalità HA questo non basta: se si modifica un runner sul nodo A, il nodo B non deve continuare a servire il vecchio record. Per questo in modalità HA la cache risiede in Redis ed è condivisa da tutti i nodi, e una modifica effettuata tramite qualsiasi nodo è visibile a tutti immediatamente.

:::note
Questa cache non è l'azione **Svuota cache** della pagina Runner. Quell'azione chiede al runner stesso di eliminare le directory di lavoro sulla sua macchina.
:::

### Cosa viene memorizzato nella cache e per quanto tempo {#runner-cache-ttl}

Il valore memorizzato nella cache è il record del runner senza i suoi tag e senza il token. Il token non raggiunge mai Redis: la chiave è derivata da un hash SHA-256 del token, e il campo del token viene svuotato prima che il record venga salvato.

Una voce vive al massimo 30 secondi. In pratica viene eliminata molto prima, perché ogni modifica effettuata tramite Semaphore invalida subito la cache:

* La creazione, la modifica, l'eliminazione o la nuova registrazione di un runner, oppure l'eliminazione di un progetto, elimina **tutti** i runner in cache su tutti i nodi.
* Un heartbeat di un runner elimina **solo la voce di quel runner**, così l'orario "visto l'ultima volta" memorizzato resta aggiornato senza toccare gli altri. Un heartbeat viene scritto al massimo una volta per intervallo pari a un terzo di `runners.offline_timeout_sec`, con un limite di 45 secondi; con il timeout predefinito di 120 secondi, ciò avviene ogni 40 secondi.

La scadenza di 30 secondi conta solo per le modifiche effettuate al di fuori di Semaphore, ad esempio modificando direttamente la tabella `runner` o ripristinando un backup.

### Come vengono evitate le scritture obsolete {#runner-cache-generation}

Una ricerca che non trova la voce in cache legge il runner dal database e poi lo salva. Tra questi due passaggi un altro nodo potrebbe modificare il runner. Per garantire che la ricerca non metta mai in cache ciò che ha letto prima della modifica, la cache mantiene un contatore che cresce a ogni invalidazione. La ricerca ricorda il valore del contatore visto prima di accedere al database, e il salvataggio viene rifiutato se nel frattempo il contatore è avanzato. Ogni passaggio viene eseguito come un unico script Lua in Redis, così il contatore e la voce vengono letti e scritti insieme.

### Chiavi Redis {#runner-cache-redis-keys}

| Chiave | Tipo | Scopo |
| --- | --- | --- |
| `ha:runner:gen` | stringa, intero | Il contatore. Cresce di uno a ogni invalidazione, sia dell'intera cache sia di un singolo runner. |
| `ha:runner:inv` | stringa, intero | Valore del contatore all'ultima invalidazione completa. Fa parte di ogni chiave di voce, quindi un'invalidazione completa rende tutte le voci esistenti irraggiungibili in un colpo solo; poi scadono da sole. |
| `ha:runner:token:<inv>:<sha256(token)>` | stringa, binario | Il record del runner in cache. Scade dopo 30 s. |
| `ha:runner:forgot:<sha256(token)>` | stringa, intero | Valore del contatore all'ultimo heartbeat di questo runner. Una ricerca iniziata prima dell'heartbeat non può salvare il record precedente all'heartbeat. Scade dopo 30 s. |

La dashboard Cluster riporta il numero di chiavi `ha:runner:token:*` come dimensione della cache dei runner.

### Comportamento in caso di problemi con Redis {#runner-cache-failures}

La cache non fa mai fallire una richiesta di un runner. Ogni operazione sulla cache è limitata a 500 millisecondi; se Redis è lento o irraggiungibile, la ricerca viene trattata come un miss e va al database, e nulla viene salvato. L'unico caso da tenere presente è un'invalidazione che fallisce perché Redis è giù nel momento in cui un runner viene modificato: gli altri nodi potrebbero allora servire il vecchio record finché non scade, al massimo 30 secondi dopo. L'errore viene registrato a livello error.

## Scalabilità con i runner {#scaling-with-runners}

L'HA consente inoltre la scalabilità orizzontale dell'esecuzione dei task. Invece di eseguire i job solo sui nodi Semaphore stessi, l'esecuzione può essere delegata a più [runner](/admin-guide/runners). Questo permette di:

* Distribuire il carico di lavoro sull'infrastruttura.
* Scalare la capacità di automazione in modo indipendente dal livello web/API.
* Isolare gli ambienti di esecuzione per limitare l'impatto di eventuali problemi.
* Eseguire task su molti nodi in parallelo.

Consultare [Runner](/admin-guide/runners) per le istruzioni di configurazione.

## Vantaggi {#benefits}

* **Maggiore affidabilità** — Se un'istanza si guasta, le altre continuano a servire il traffico ed eseguire i job.
* **Manutenzione senza tempi di inattività** — I nodi possono essere aggiornati o riavviati singolarmente senza fermare il sistema.
* **Scalabilità orizzontale** — È possibile aggiungere nodi Semaphore dietro il bilanciatore di carico per aumentare la capacità.
* **Nessuna dipendenza da un nodo primario** — Tutti i nodi sono equivalenti, eliminando complessi meccanismi di failover.
* **Stato del cluster coerente** — Il database condiviso e il coordinamento tramite Redis mantengono sincronizzate tutte le istanze.

## FAQ {#faq}

### Che cos'è l'alta disponibilità active-active? {#what-is-active-active-high-availability}

L'HA active-active significa che più istanze dell'applicazione vengono eseguite contemporaneamente e tutte servono le richieste. Non esiste un nodo primario: qualsiasi istanza può gestire il traffico ed eseguire i job.

### Perché Semaphore utilizza Redis in modalità HA? {#why-does-semaphore-use-redis-in-ha-mode}

Redis funge da livello di coordinamento tra le istanze. Fornisce lock distribuiti, stato condiviso della coda dei task e messaggistica Pub/Sub per garantire che i nodi non eseguano lo stesso job contemporaneamente.

### Quale database utilizzare per le distribuzioni HA? {#what-database-should-i-use-for-ha-deployments}

Semaphore supporta PostgreSQL e MySQL come database condiviso. SQLite e BoltDB non possono essere utilizzati in modalità HA perché non supportano l'accesso concorrente da più processi.

### Cosa succede se Redis si guasta? {#what-happens-if-redis-fails}

Con un singolo server Redis (`ha.engine: redis`), i nodi non possono coordinarsi finché Redis non torna disponibile. Con [Redis Sentinel](#redis-sentinel), i sentinel promuovono una replica e ogni nodo Semaphore passa automaticamente a essa, in genere entro pochi secondi e senza riavvio.

### Cosa succede se un nodo Semaphore si guasta? {#what-happens-if-one-semaphore-node-fails}

Il bilanciatore di carico instrada il traffico verso i nodi rimanenti. I job in esecuzione continuano sulle altre istanze e i nuovi job vengono presi in carico da qualsiasi nodo disponibile.

### È possibile scalare orizzontalmente? {#can-i-scale-horizontally}

Sì. È possibile aggiungere nodi Semaphore dietro il bilanciatore di carico per aumentare la capacità web/API e aggiungere [runner](/admin-guide/runners) per aumentare la capacità di esecuzione dei task.
