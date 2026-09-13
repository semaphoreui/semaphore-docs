# Log

Semaphore scrive i log del server su **stdout** e memorizza i log delle **attività** (Task) e del **registro attività** (Activity) in un **database**, centralizzando le informazioni di log principali ed eliminando la necessità di eseguire il backup dei file di log separatamente. Gli unici dati memorizzati sul file system sono i dati di cache.

---

## Log del server {#server-log}

Semaphore non scrive log su file. Tutti i log dell'applicazione vengono invece scritti su **stdout**.  
Se Semaphore è in esecuzione come servizio systemd, è possibile consultare i log con il seguente comando:

```bash
journalctl -u semaphore.service -f
```

Se Semaphore è in esecuzione in un container Docker, è possibile consultare i log con il seguente comando:
```
docker logs -f my-semaphore-container
```

In questo modo si ottiene una vista in tempo reale (streaming) dei log.

---

## Registro attività {#activity-log}

Il registro attività (Activity Log) acquisisce le azioni degli utenti eseguite in Semaphore, tra cui:

- Aggiunta o rimozione di risorse (ad es. template, inventory, repository).
- Aggiunta o rimozione di membri del team.

### Versione Pro 2.10 e successive {#pro-version-210-and-later}

**Semaphore Pro** 2.10+ supporta la scrittura del registro attività e del log delle attività su file. Per abilitare questa funzione, aggiungere la seguente configurazione al file `config.json`:

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


In alternativa, è possibile utilizzare le seguenti variabili d'ambiente:

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### Opzioni di logging del registro attività (eventi) {#activity-events-logging-options}

Le opzioni di logging del registro attività (eventi) permettono di configurare il modo in cui Semaphore registra su file le azioni degli utenti e gli eventi di sistema. Queste impostazioni controllano il comportamento del logging degli eventi, incluso se è abilitato, il formato delle voci di log e le configurazioni specifiche del logger. Quando è abilitato, le azioni degli utenti come la creazione di template o la gestione dei team vengono scritte nel file di log specificato in base a queste impostazioni.

| Parametro             | Variabili d'ambiente | Descrizione           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Abilita il logging degli eventi su file. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Formato dei record di log. Lasciare vuoto per il formato raw oppure impostare `json`. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Opzioni del logger](#logger-options). |

#### Opzioni di logging delle attività {#tasks-logging-options}

Le opzioni di logging delle attività permettono di configurare il modo in cui Semaphore registra su file i dettagli dell'esecuzione delle attività. Queste impostazioni controllano il logging degli eventi relativi alle attività, inclusi avvio, completamento e stato di esecuzione. Quando è abilitato, tutte le operazioni sulle attività e i relativi risultati vengono scritti nel file di log specificato in base a queste impostazioni, fornendo una traccia di audit dettagliata della cronologia di esecuzione delle attività.

| Parametro             | Variabili d'ambiente | Descrizione           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Abilita il logging delle attività su file. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Formato dei record di log. Lasciare vuoto per il formato raw oppure impostare `json`. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Opzioni del logger](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Opzioni del logger. |



#### Opzioni del logger {#logger-options}

| Parametro             | Tipo | Descrizione           |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | Percorso e nome del file in cui scrivere i log. I file di log di backup vengono conservati nella stessa directory.  Se vuoto, viene utilizzato `processname`-lumberjack.log nella directory temporanea. |
| `maxsize`      | Integer | Dimensione massima in megabyte del file di log prima della rotazione. Il valore predefinito è 100 megabyte. |
| `maxage`       | Integer | Numero massimo di giorni per cui conservare i vecchi file di log, in base al timestamp codificato nel nome del file.  Si noti che un giorno è definito come 24 ore e potrebbe non corrispondere esattamente ai giorni di calendario a causa dell'ora legale, dei secondi intercalari, ecc. Per impostazione predefinita i vecchi file di log non vengono rimossi in base all'età. |
| `maxbackups`   | Integer | Numero massimo di vecchi file di log da conservare.  Per impostazione predefinita vengono conservati tutti i vecchi file di log (anche se MaxAge può comunque causarne l'eliminazione). |
| `localtime`    | Boolean | Determina se l'ora utilizzata per formattare i timestamp nei file di backup è l'ora locale del computer.  Per impostazione predefinita viene utilizzata l'ora UTC. |
| `compress`     | Boolean | Determina se i file di log ruotati devono essere compressi con gzip. Per impostazione predefinita non viene eseguita alcuna compressione. |



Ogni riga del file segue questo formato:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Cronologia delle attività {#task-history}

Semaphore memorizza nel database le informazioni sull'esecuzione delle attività. La cronologia delle attività fornisce una vista dettagliata di tutte le attività eseguite, inclusi stato e log. È possibile monitorare le attività in tempo reale o consultare i log storici tramite l'interfaccia web.

### Configurazione della conservazione delle attività {#configuring-task-retention}

Per impostazione predefinita, Semaphore memorizza tutte le attività nel database. Se si esegue un numero elevato di attività, queste possono occupare una quantità significativa di spazio su disco.

È possibile configurare quante attività conservare per ogni template utilizzando uno dei seguenti approcci:

1. **Variabile d'ambiente**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **Opzione in `config.json`**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

Quando il numero di attività supera questo limite, i log delle attività più vecchi vengono eliminati automaticamente.

---

## Supporto del protocollo syslog {#syslog-protocol-support}

Semaphore può inoltrare le voci del registro attività e dei log delle attività a un collettore syslog esterno per l'archiviazione a lungo termine o il monitoraggio centralizzato. L'inoltro syslog è disabilitato per impostazione predefinita.

Configurare il supporto syslog in `config.json`:

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

Le stesse opzioni sono disponibili tramite variabili d'ambiente, se si preferisce non modificare il file JSON:

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Opzioni syslog {#syslog-options}

| Parametro             | Variabili d'ambiente | Descrizione           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | Attiva o disattiva l'inoltro syslog. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | Protocollo utilizzato per raggiungere il collettore, ad esempio `udp` o `tcp`. |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | Indirizzo del collettore nel formato `host:port`. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | Identificatore opzionale anteposto a ogni messaggio. |


Riavviare il servizio Semaphore dopo aver modificato questi valori affinché la nuova destinazione syslog venga applicata.

---

## Integrazione SIEM {#siem-integration}

Semaphore 2.20+ registra una traccia di audit di sicurezza adatta all'inoltro a un SIEM (Splunk, Elastic Security, QRadar, Wazuh, ecc.).

Ogni evento di audit include l'**azione** (`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), l'**indirizzo IP del client** e lo **user agent**, oltre all'utente che ha eseguito l'azione e all'oggetto interessato. Oltre alle modifiche alle risorse, Semaphore registra:

- Accessi riusciti (password, LDAP e OpenID), disconnessioni, tentativi di accesso falliti e verifiche MFA fallite.
- Creazione, aggiornamento, eliminazione di account utente e modifiche delle password.
- Creazione ed eliminazione di token API (viene registrato solo il breve prefisso del token, mai il segreto).

Esistono tre modi per inviare gli eventi di audit al proprio SIEM:

1. **Pull:** leggere `/api/events` (vedere la [documentazione API](/reference/api)).
2. **Collettore di file:** abilitare il file del registro attività (Pro, vedere sopra) e inviare `events.log` (formato JSON consigliato) con Filebeat, Fluentd o uno Splunk Universal Forwarder.
3. **Webhook di audit (Pro):** inviare gli eventi in tempo reale tramite HTTPS, a un endpoint JSON generico o a uno Splunk HTTP Event Collector.

### Webhook di audit {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

Oppure tramite variabili d'ambiente:

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### Opzioni del webhook di audit {#audit-webhook-options}

| Parametro             | Variabili d'ambiente | Descrizione           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | Attiva o disattiva l'inoltro degli eventi di audit. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | URL completo dell'endpoint ricevente. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | Formato del payload: vuoto per JSON semplice oppure `splunk_hec` per un envelope Splunk HEC. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | Header HTTP aggiuntivi, ad es. il token HEC: `{"Authorization": "Splunk <token>"}`. |

La consegna è asincrona: gli eventi vengono accodati in memoria e ritentati fino a tre volte con backoff, quindi un ricevente non disponibile non rallenta né fa fallire mai le richieste degli utenti. Se il ricevente resta non disponibile, gli eventi in coda vengono scartati con un avviso nel log del server.

## Riepilogo {#summary}

- **Log del server:** scritto su stdout; consultabile tramite `journalctl` se in esecuzione sotto systemd.  
- **Registro attività e log delle attività:** traccia tutte le azioni degli utenti. Facoltativamente, **Pro 2.10+** può scriverli su file.  
- **Cronologia delle attività:** memorizza i log di esecuzione delle attività in tempo reale e storici. La conservazione è configurabile per template.

Seguendo queste linee guida si ottiene una visibilità adeguata sulle operazioni di Semaphore UI, mantenendo sotto controllo l'utilizzo dello spazio di archiviazione e la conservazione dei log.
