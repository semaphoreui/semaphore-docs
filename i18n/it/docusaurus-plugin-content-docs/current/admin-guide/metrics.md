# Metriche

:::info
L'endpoint delle metriche è disponibile a partire da **Semaphore versione 2.20**. Se si utilizza una versione precedente, è necessario aggiornare per usare questa funzionalità.
:::

Semaphore espone un endpoint `GET /api/metrics` nel formato standard di esposizione testuale di Prometheus, in modo che un'installazione Prometheus + Grafana esistente possa monitorare il server senza alcuno strumento di polling esterno.

Vengono esposte due categorie di metriche:

- **Metriche di processo:** statistiche del runtime Go e del processo: numero di goroutine, memoria (heap/residente), tempo CPU, pause del GC. Sono fornite gratuitamente dai collettori standard Go/process di Prometheus.
- **Metriche delle attività**, specifiche del carico di lavoro di Semaphore:
  - `semaphore_tasks_running` (gauge): numero di attività attualmente in esecuzione, in questo istante.
  - `semaphore_tasks_total{status}` (counter): numero totale di attività terminate, suddivise per esito: `success`, `error`, `stopped`.

Entrambe si aggiornano in tempo reale al cambiare dello stato delle attività: non c'è alcun ritardo di polling, poiché i contatori vengono aggiornati direttamente all'interno del task runner nel momento in cui lo stato di un'attività cambia effettivamente.

## Abilitazione delle metriche {#enabling-metrics}

L'endpoint è disabilitato per impostazione predefinita e richiede l'autenticazione HTTP Basic con una credenziale statica a livello di servizio, non legata ad alcun account utente, poiché Prometheus non può eseguire un accesso interattivo:

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

Oppure tramite variabili d'ambiente:

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### Opzioni delle metriche {#metrics-options}

| Parametro  | Variabili d'ambiente         | Descrizione |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | Attiva o disattiva l'endpoint `/api/metrics`. Disabilitato per impostazione predefinita. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | Nome utente Basic Auth richiesto per lo scraping dell'endpoint. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | Password Basic Auth richiesta per lo scraping dell'endpoint (sensibile). |

Se `enabled` è lasciato a `false` (impostazione predefinita), oppure le credenziali sono mancanti o errate, ogni richiesta a `/api/metrics` restituisce `401 Unauthorized`.

## Scraping con Prometheus {#scraping-with-prometheus}

Configurare un job di scraping con `basic_auth` utilizzando le credenziali indicate sopra:

```yaml
scrape_configs:
  - job_name: semaphore
    metrics_path: /api/metrics
    basic_auth:
      username: prometheus
      password: changeme
    static_configs:
      - targets: ["<semaphore-host>:3000"]
```

## Visualizzazione delle metriche in Grafana {#viewing-metrics-in-grafana}

La vista **Explore** di Grafana permette di eseguire qualsiasi query PromQL direttamente sulle metriche e di vedere i risultati grezzi, senza dover prima creare una dashboard:

![Grafana Explore che mostra le metriche di Semaphore raccolte](/assets/semaphore-grafana-explore.png)

Sulle stesse metriche è poi possibile costruire una dashboard: questo esempio copre entrambe le categorie con quattro pannelli: attività in esecuzione, totale attività per esito, goroutine e memoria residente del processo.

![Dashboard Grafana con i pannelli di Semaphore](/assets/semaphore-grafana-dashboard.png)
