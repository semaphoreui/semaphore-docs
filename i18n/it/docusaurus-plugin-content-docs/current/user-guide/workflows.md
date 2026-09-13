# Workflow (Pro)

I Workflow consentono di concatenare più Task Template in un grafo diretto (DAG) con
diramazioni, approvazioni e pause temporizzate. L'esecuzione di un Workflow avanza automaticamente
al termine di ogni passaggio: il grafo viene progettato una sola volta nell'editor visuale, dopodiché
le esecuzioni vengono avviate dalla pagina Workflows.

:::info
I Workflow sono una funzionalità di **Semaphore Pro**. La voce di menu Workflows compare solo
quando il proprio abbonamento la include.
:::

## Panoramica {#overview}

Un Workflow è composto da:

- **Nodi** — i passaggi del grafo (esecuzione di un Task Template, attesa di un'approvazione, pausa per un
  ritardo oppure annotazione con una nota).
- **Archi** — le connessioni tra i nodi, ciascuna etichettata con una **condizione** che
  determina quando il nodo successivo viene avviato.

Quando si avvia un Workflow, Semaphore crea un'**esecuzione del Workflow**. Il server
governa l'avanzamento: al completamento dei Task, alla risoluzione delle approvazioni o allo scadere dei ritardi,
i nodi successivi vengono avviati in base alle condizioni degli archi.

## Creazione di un Workflow {#creating-a-workflow}

1. Aprire il proprio Project e andare in **Workflows**.
2. Fare clic su **New Workflow**.
3. Nell'editor grafico:
   - Trascinare i nodi dalla palette sull'area di lavoro.
   - Collegare i nodi trascinando dal punto di uscita di un nodo a un altro nodo.
   - Fare clic su un nodo o su un arco per modificarne le proprietà nel pannello laterale.
4. Impostare un **nome** (e facoltativamente una **versione iniziale** per la numerazione delle esecuzioni).
5. Risolvere gli eventuali problemi elencati nel pannello **Problems**, quindi fare clic su **Save**.

![Editor dei Workflow](/assets/workflow-editor.webp)

L'editor convalida il grafo prima del salvataggio. Un Workflow valido deve avere almeno
un nodo, esattamente un nodo iniziale (senza archi in entrata), nessun ciclo e una configurazione
completa su ogni nodo eseguibile.

## Tipi di nodo {#node-kinds}

| Tipo | Scopo |
|------|---------|
| **Task** | Esegue un Task Template. È possibile sovrascrivere i parametri del Task Template (Inventory, ambiente, limit di Ansible, argomenti CLI aggiuntivi) per singolo nodo tramite i **task params**. |
| **Approval** | Mette in pausa l'esecuzione fino a quando un utente con i permessi necessari approva o rifiuta. Facoltativamente è possibile impostare un timeout (in secondi) e un messaggio di approvazione. |
| **Delay** | Attende il numero di secondi configurato prima di proseguire verso i nodi successivi. Utile per periodi di attesa, finestre di manutenzione o per distanziare passaggi dipendenti. |
| **Note** | Annotazione libera sull'area di lavoro. I nodi Note non vengono eseguiti e non sono collegati da archi: servono solo a scopo documentativo. |

### Convergenza {#convergence}

I nodi con più archi in entrata possono richiedere che **tutti** i nodi precedenti siano terminati
(impostazione predefinita) oppure che lo sia **almeno uno** di essi. Impostare **Convergence** nel pannello delle proprietà del nodo.

### Nodi Delay {#delay-nodes}

Un nodo delay mette in pausa l'esecuzione del Workflow per la durata configurata (minimo 1
secondo). Durante l'attesa:

- L'esecuzione rimane nello stato **running**.
- La vista dell'esecuzione mostra un conto alla rovescia in tempo reale sul nodo delay.
- I nodi successivi collegati tramite archi non vengono avviati fino al completamento del ritardo.

Se l'esecuzione del Workflow viene **interrotta** mentre un ritardo è attivo, il ritardo viene
annullato e l'esecuzione termina nello stato **stopped**.

### Nodi Approval {#approval-nodes}

Quando l'esecuzione raggiunge un nodo di approvazione, lo stato passa a **approval** fino a quando
qualcuno approva o rifiuta. I controlli di approvazione e rifiuto compaiono nella vista dell'esecuzione.
Le approvazioni rifiutate fanno fallire l'esecuzione in base alle condizioni degli archi collegati.

## Condizioni degli archi {#edge-conditions}

Ogni arco ha una condizione che determina quando il nodo successivo diventa pronto:

| Condizione | Il nodo successivo parte quando il nodo precedente… |
|-----------|-------------------------------------------|
| **On success** | Termina con successo (impostazione predefinita). |
| **On failure** | Termina con un errore. |
| **Always** | Termina in qualsiasi stato finale (successo o errore). |

Utilizzare le diramazioni **On failure** per azioni compensative o notifiche. Utilizzare
**Always** quando il passaggio successivo deve essere eseguito indipendentemente dall'esito.

## Esecuzione e monitoraggio {#running-and-monitoring}

- **Run workflow** — avvia una nuova esecuzione dall'elenco dei Workflow.
- **Vista dell'esecuzione** — grafo a schermo intero con lo stato in tempo reale di ogni nodo (in esecuzione, successo,
  fallito, approvazione, conto alla rovescia del ritardo).
- **Stop** — mentre un'esecuzione è in stato `running` o `approval`, gli utenti con
  `run_project_tasks` possono interromperla. Tutti i Task attivi vengono interrotti, le approvazioni
  in attesa vengono rifiutate e l'esecuzione viene contrassegnata come **stopped**.

Stati delle esecuzioni: `running`, `approval`, `success`, `failed`, `stopped`.

## Numerazione delle esecuzioni {#run-versioning}

Impostare **Start version** sul Workflow (ad esempio `1.0.0`) per abilitare le etichette di versione
su ogni esecuzione. Semaphore incrementa la versione a ogni esecuzione successiva, in modo simile
ai Task Template di build.

## Artefatti dei Workflow (set_stats) {#workflow-artifacts-set_stats}

Quando un Task Ansible di un Workflow utilizza `set_stats`, le variabili vengono memorizzate come
**artefatti del Workflow** per quella esecuzione. I nodi Task successivi della stessa esecuzione
le ricevono automaticamente come variabili aggiuntive.

:::warning
Se i passaggi del Workflow vengono eseguiti su **Runner remoti**, gli artefatti del Workflow non
attraversano ancora i passaggi eseguiti sui Runner remoti: vengono passati solo tra i Task eseguiti
localmente sul server Semaphore. Pianificare di conseguenza il passaggio degli artefatti oppure mantenere
i passaggi che producono e consumano artefatti sullo stesso percorso di esecuzione.
:::

## Permessi {#permissions}

- La gestione dei Workflow (creazione, modifica, eliminazione) richiede i permessi di gestione
  delle risorse del Project.
- L'esecuzione dei Workflow richiede `run_project_tasks`.
- La risoluzione delle approvazioni richiede un accesso adeguato al Project (gli stessi utenti che possono eseguire
  i Task nel Project).

## API {#api}

I template e le esecuzioni dei Workflow sono disponibili in
`/api/project/{project_id}/workflows`. Vedere la
[documentazione API](/reference/api) per gli schemi di richiesta e risposta, inclusi
i campi dei nodi `delay` (`delay_seconds`) e l'endpoint di interruzione
(`POST …/runs/{run_id}/stop`).
