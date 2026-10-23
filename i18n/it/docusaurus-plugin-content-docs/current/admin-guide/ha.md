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
