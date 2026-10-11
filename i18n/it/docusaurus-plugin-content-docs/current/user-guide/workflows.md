---
title: "Workflow"
sidebar_custom_props:
  edition: pro
---

# Workflow <Pro />

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

## Output e input {#outputs-and-inputs}

Un nodo Task può passare dati strutturati ai nodi successivi. Il Task **produce output**: un
oggetto JSON di valori con nome, memorizzato insieme al Task quando termina con successo. Una
connessione verso il nodo Task successivo **fornisce input**: compila le variabili survey del Task
Template di quel nodo con gli output del nodo precedente. Non vengono passati file, solo valori.

### Produzione degli output {#producing-outputs}

Ogni Task avviato da un'esecuzione del Workflow riceve la variabile d'ambiente `SEMAPHORE_OUTPUTS_FILE`:
il percorso di un file vuoto creato solo per quel Task. Tutto ciò che il Task vi scrive come oggetto
JSON diventa il suo output.

| Applicazione | Come vengono prodotti gli output |
|-----|--------------------------|
| **Ansible** | `ansible.builtin.set_stats` con `per_host: false` (impostazione predefinita). Il plugin di callback `semaphore_outputs` incluso scrive nel file le statistiche aggregate dell'esecuzione; le statistiche per host non sono output. |
| **Terraform, OpenTofu, Terragrunt** | Acquisiti automaticamente da `output -json` dopo un'esecuzione riuscita. Un valore che il Task ha scritto da sé nel file prevale su un output acquisito con lo stesso nome. |
| **Bash, Python, PowerShell, Pulumi** | Lo script scrive il file. |

```bash
# Bash: scrivere il file degli output
cat > "$SEMAPHORE_OUTPUTS_FILE" <<EOF
{"image_tag": "1.4.2", "replicas": 3, "subnet_ids": ["subnet-1", "subnet-2"]}
EOF
```

```yaml
# Ansible: set_stats diventa output
- name: Publish the image tag for the next nodes
  ansible.builtin.set_stats:
    data:
      image_tag: "{{ built_tag }}"
```

Regole:

- Gli output vengono letti solo quando il Task **termina con successo**. Un Task fallito o interrotto
  non ne ha, quindi una diramazione **On failure** non riceve nulla dal nodo che è fallito.
- I nomi degli output corrispondono a `^[A-Za-z_][A-Za-z0-9_-]*$`. Un valore può essere qualsiasi
  valore JSON: stringa, numero, booleano, lista od oggetto.
- Limiti: il file è al massimo di 256 KB, con al massimo 100 output di al massimo 32 KB ciascuno.
- Un file mancante o vuoto significa "nessun output". Un file che non è un oggetto JSON, usa un nome
  non valido o supera un limite **fa fallire il Task**, con il motivo riportato nel suo log.
- Gli output di Terraform che non possono essere memorizzati — contrassegnati come `sensitive`, troppo
  grandi, con un nome non valido o oltre i limiti — vengono saltati ed elencati nel log del Task e nel
  pannello **Outputs** del Task come **Not captured**. Non fanno mai fallire il Task.

### Fornitura degli input {#delivering-inputs}

Fare clic su una connessione che termina in un nodo Task: il suo pannello laterale contiene una sezione **Inputs**.

- **Per nome** (impostazione predefinita). Ogni output del nodo di origine il cui nome coincide con una
  variabile survey del Task Template di destinazione compila quella variabile. Gli output senza una
  variabile corrispondente vengono ignorati; un output di Terraform contenente un trattino non è mai un
  nome di variabile valido, quindi non viene fornito.
- **Map inputs explicitly.** Selezionare la casella per fornire solo le coppie elencate: una variabile
  survey del Task Template di destinazione e la chiave di output che la alimenta. Un elenco vuoto non
  fornisce nulla. Quando il Workflow ha un'esecuzione terminata, il pannello suggerisce le chiavi prodotte
  da quell'esecuzione e segnala le chiavi che non sono state acquisite.

Una variabile che nessuna connessione compila ricade sul valore impostato sul nodo, quindi sul valore
predefinito della variabile. Una variabile **obbligatoria** lasciata senza valore fa fallire il Task del
nodo prima che venga avviato, con una riga di log che indica la variabile, per cui l'esecuzione segue i
suoi archi **On failure**.

I valori vengono convertiti nel tipo della variabile: una variabile `int` accetta un numero o una stringa
di cifre, una variabile `enum` o `select` accetta solo le proprie opzioni, una variabile `string` o `text`
accetta qualsiasi valore (un oggetto o una lista arriva come JSON compatto). Un valore non compatibile
viene ignorato, con il motivo nel log del Task, e si applica il valore di ripiego.

**I nodi Approval e Delay** lasciano passare gli output: `task → approval → task` fornisce comunque i
dati, e si applica la modalità dell'ultima connessione.

**Più connessioni verso lo stesso nodo.** Contribuisce ogni connessione la cui origine è terminata con
successo. Quando due di esse compilano la stessa variabile, una mappatura esplicita prevale su una
fornitura per nome; tra due dello stesso tipo prevale la connessione creata per prima, così
un'esecuzione dà sempre lo stesso risultato. Il log del Task indica la connessione che ha prevalso.

![The connection panel in by-name mode: matched survey variables are ticked](/assets/workflow-inputs-by-name.webp)

![The connection panel with explicit mapping: one output key per survey variable](/assets/workflow-inputs-explicit.webp)

### Dove visualizzarli {#where-to-see-outputs}

- La **vista dell'esecuzione** mostra un badge *N outputs* su ogni nodo che ne ha prodotti.
- La **finestra del Task** contiene una tabella **Outputs** con i valori e l'elenco *Not captured*.
- Il log di un Task alimentato da una connessione inizia con una riga per ogni variabile, ad esempio
  `Input "image_tag" <- output "image_tag" of node 3 (task #41)`, così l'origine di ogni valore si
  trova una riga sopra il valore stesso.

![Run view: nodes that produced outputs carry a badge](/assets/workflow-run-outputs.webp)

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Task dialog, Details tab: the Outputs table](/assets/task-outputs.webp)
</div>

### Limitazioni {#outputs-limitations}

- Gli output vengono memorizzati e mostrati in chiaro a chiunque possa vedere il Task. **Non passare
  secret tramite gli output.** Una variabile survey di tipo `secret` non può essere compilata da una
  connessione.
- Gli output sono valori, mai codice: Ansible li riceve come stringhe letterali e un'espressione Jinja2
  all'interno di un valore non viene valutata.
- I Task sui Runner remoti producono e ricevono output come i Task sul server. I Task eseguiti
  dall'executor **Docker** o **Kubernetes** di un Runner non producono ancora output; il loro log lo
  segnala.

## Variabili d'ambiente {#environment-variables}

Un Task avviato da un workflow riceve, oltre alle
[variabili ricevute da ogni Task](./tasks#environment-variables):

| Variabile | Valore |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | ID del workflow |
| `SEMAPHORE_WORKFLOW_RUN_ID` | ID dell'esecuzione corrente |
| `SEMAPHORE_WORKFLOW_URL` | Link alla pagina dell'esecuzione, ad esempio `https://semaphore.example.com/project/1/workflows/7/runs/42` (richiede `web_host` nella configurazione del server) |
| `SEMAPHORE_OUTPUTS_FILE` | Percorso del file in cui il Task scrive i propri [output](#producing-outputs) |

Queste variabili vengono impostate per tutte le applicazioni, incluse Ansible e Terraform, e raggiungono i Task eseguiti su Runner remoti.

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
i campi dei nodi `delay` (`delay_seconds`), `input_mode` e `input_mappings` sugli archi, il
documento `artifacts` di ogni Task nei dettagli dell'esecuzione (`GET …/runs/{run_id}`) e l'endpoint
di interruzione (`POST …/runs/{run_id}/stop`).
