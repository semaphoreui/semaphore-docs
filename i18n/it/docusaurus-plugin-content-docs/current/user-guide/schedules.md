# Pianificazioni

La funzione di pianificazione di Semaphore consente di automatizzare l'esecuzione dei template (ad esempio l'esecuzione di playbook) a intervalli predefiniti. Questa funzionalità permette di implementare attività di automazione di routine, come backup regolari, controlli di conformità, aggiornamenti di sistema e altro ancora.

Assicurarsi di riavviare il servizio Semaphore dopo aver apportato modifiche affinché abbiano effetto.

[//]: # (## Setup and configuration)

## Configurazione del fuso orario {#timezone-configuration}

Per impostazione predefinita, la funzione di pianificazione opera nel fuso orario UTC. Tuttavia, è possibile personalizzarla in base al fuso orario locale o a requisiti specifici.

È possibile modificare il fuso orario aggiornando il file di configurazione o impostando una variabile d'ambiente:

1. **Tramite il file di configurazione**:  
    Aggiungere o aggiornare il campo `timezone` nel file di configurazione di Semaphore:
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **Tramite una variabile d'ambiente**:  
    Impostare la variabile d'ambiente `SEMAPHORE_SCHEDULE_TIMEZONE`:
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

Per un elenco dei valori di fuso orario validi, consultare il [database dei fusi orari IANA](https://www.iana.org/time-zones).

### Accesso alla funzione di pianificazione {#accessing-the-schedule-feature}

1. Accedere all'interfaccia web di Semaphore
2. Aprire la scheda "Pianificazione" nel menu di navigazione principale
3. Fare clic sul pulsante "Nuova pianificazione" in alto a destra per creare una nuova pianificazione

![](/assets/schedule01.png)

### Creazione di una nuova pianificazione {#creating-a-new-schedule}

Quando si crea una nuova pianificazione, è necessario configurare le seguenti opzioni:

| Campo | Descrizione |
|-------|-------------|
| Nome | Un nome descrittivo per il task pianificato |
| Template | Il Task Template specifico da eseguire |
| Tempistica | In formato cron, per una maggiore flessibilità, oppure tramite le opzioni integrate per gli intervalli più comuni |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### Sintassi del formato cron {#cron-format-syntax}

La pianificazione utilizza la sintassi cron standard con cinque campi:

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Esempi:
- `*/15 * * * *` - Esegue ogni 15 minuti
- `0 2 * * *` - Esegue ogni giorno alle 2:00
- `0 0 * * 0` - Esegue a mezzanotte della domenica
- `0 9 1 * *` - Esegue alle 9:00 del primo giorno di ogni mese

Generatore di espressioni cron molto utile: [https://crontab.guru/](https://crontab.guru/)

## Casi d'uso {#use-cases}

### Manutenzione del sistema {#system-maintenance}

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

Pianificare l'esecuzione settimanale di questo playbook fuori dall'orario di lavoro per mantenere i sistemi aggiornati.

### Operazioni di backup {#backup-operations}

Creare pianificazioni per i backup del database con frequenze diverse:
- Backup giornalieri conservati per una settimana
- Backup settimanali conservati per un mese
- Backup mensili conservati per un anno

### Controlli di conformità {#compliance-checks}

Pianificare scansioni di conformità regolari per garantire che i sistemi soddisfino i requisiti di sicurezza:

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### Provisioning e pulizia degli ambienti {#environment-provisioning-and-cleanup}

Per ambienti di sviluppo o di test. Pianificare la creazione degli ambienti cloud al mattino e la loro rimozione alla sera per ottimizzare i costi.

## Buone pratiche {#best-practices}

* Utilizzare nomi descrittivi per le pianificazioni che indichino sia la funzione sia la tempistica (ad esempio "Weekly-Backup-Sunday-2AM")
* Evitare di pianificare troppi task ad alto consumo di risorse in contemporanea
* Considerare l'effetto dei task pianificati di lunga durata sulle altre pianificazioni
* Testare le pianificazioni con intervalli brevi prima di configurare pianificazioni di produzione con intervalli più lunghi
* Documentare lo scopo e i risultati attesi dei task pianificati

---

## Parametri dei task {#task-parameters}

Le pianificazioni possono passare parametri ai task. Abilitare i prompt per i campi necessari nel template, quindi definire i valori dei parametri nella configurazione della pianificazione in modo che ogni esecuzione fornisca le sostituzioni desiderate (ad esempio branch, variabili, flag).
