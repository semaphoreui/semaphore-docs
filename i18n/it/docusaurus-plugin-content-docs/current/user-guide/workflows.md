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
3. Aggiungere il primo nodo: fare clic su un tipo nella **Palette**, trascinarlo sull'area di lavoro
   oppure utilizzare il pulsante **+** nell'angolo in alto a destra dell'area di lavoro.
4. Passare il mouse su un nodo e fare clic sulla maniglia **+** della sua porta di uscita per aggiungere
   il passaggio successivo. Il nuovo nodo viene posizionato a destra e collegato con un arco
   **On success**. È anche possibile collegare i nodi trascinando da una porta di uscita a una
   porta di ingresso.
5. Fare clic su un nodo per modificarlo nel **pannello delle proprietà** a destra: tipo di nodo,
   Task Template e task params, timeout e messaggio di approvazione, durata del ritardo,
   convergenza.
6. Fare clic sulla **pillola della condizione** al centro di un arco per cambiarne la
   condizione, oppure passare il mouse sull'arco e fare clic su **×** per rimuoverlo.
7. Impostare un **nome** (e facoltativamente una **versione iniziale** per la numerazione delle esecuzioni).
8. Risolvere i problemi elencati nel chip **problems** della barra degli strumenti, quindi fare clic
   su **Save**.

![Editor dei Workflow](/assets/workflow-editor.webp)

L'editor convalida il grafo durante il lavoro. I nodi con un problema mostrano un badge di
avviso e il chip nella barra degli strumenti elenca tutti i problemi; fare clic su uno di essi per
selezionare il nodo. Un Workflow valido deve avere almeno un nodo, esattamente un nodo iniziale
(senza archi in entrata), nessun ciclo e una configurazione completa su ogni nodo eseguibile.
**Save** rimane disabilitato finché il grafo non è valido.

![Menu di aggiunta rapida](/assets/workflow-editor-quick-add.webp)

### Controlli dell'editor {#editor-controls}

<div class="BlockSchema">
    <img src="/docs/assets/workflow-hotkeys.svg" alt="Scorciatoie da tastiera dell'editor dei Workflow" />
</div>

L'area di lavoro può essere spostata e ingrandita con il mouse, il trackpad, i pulsanti
nell'angolo in basso a sinistra o la tastiera. Le scorciatoie da tastiera funzionano quando
l'area di lavoro ha il focus: fare prima clic su uno spazio vuoto dell'area di lavoro, oppure
premere <kbd>Tab</kbd> finché l'area di lavoro non riceve il focus. <kbd>Tab</kbd> passa
quindi da un nodo all'altro; <kbd>Enter</kbd> su un nodo lo seleziona e ne apre il pannello
delle proprietà (nella vista dell'esecuzione apre il log del Task). La stessa navigazione
funziona nella vista dell'esecuzione.

| Azione | Mouse | Trackpad | Pulsanti | Tastiera |
|--------|-------|----------|----------|----------|
| Spostare l'area di lavoro (pan) | Trascinare uno spazio vuoto, oppure scorrere con la rotellina (verticale) e <kbd>Shift</kbd>+rotellina (orizzontale) | Scorrimento con due dita in qualsiasi direzione | — | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>; tenere premuto <kbd>Shift</kbd> per passi più ampi |
| Zoom avanti / indietro | <kbd>Ctrl</kbd>+rotellina (<kbd>Cmd</kbd>+rotellina su macOS); lo zoom è centrato sul puntatore | Pinch | **+** / **−** | <kbd>+</kbd> / <kbd>−</kbd> |
| Adattare l'intero grafo allo schermo | — | — | **fit view** | <kbd>0</kbd> |
| Riportare lo zoom al 100 % | — | — | — | <kbd>1</kbd> |
| Disporre i nodi automaticamente | — | — | **tidy up** | — |

All'apertura l'editor adatta il grafo allo schermo. Il livello di zoom corrente è mostrato
sotto i pulsanti. Quando vengono spostati, i nodi si allineano a una griglia di 20 px.

| Azione di modifica | Come |
|--------------------|-----|
| Aggiungere un nodo | Maniglia **+** su un nodo, clic o trascinamento dalla palette, pulsante **+** nell'angolo in alto a destra, oppure clic destro su uno spazio vuoto dell'area di lavoro. |
| Collegare i nodi | Trascinare dalla porta di uscita di un nodo (bordo destro) alla porta di ingresso di un altro nodo (bordo sinistro). |
| Cambiare la condizione di un arco | Fare clic sulla pillola della condizione sull'arco e scegliere una condizione. |
| Eliminare il nodo o l'arco selezionato | <kbd>Delete</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> su macOS), il pulsante di eliminazione nel pannello delle proprietà, oppure **×** sulla pillola di un arco al passaggio del mouse. |
| Annulla / ripeti | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd> su macOS), oppure le frecce nella barra degli strumenti. Fino a 50 passaggi. |
| Deselezionare | <kbd>Esc</kbd> chiude il pannello delle proprietà e annulla la selezione. |

Se si lascia l'editor con modifiche non salvate viene richiesta una conferma. Il punto sul
pulsante **Save** indica che il grafo differisce dalla versione salvata.

## Tipi di nodo {#node-kinds}

Un Workflow è costruito con quattro tipi di nodi. Ogni tipo è rappresentato come una scheda:
un riquadro con l'icona a sinistra, il titolo e un sottotitolo con le impostazioni principali.
I nodi Task, Approval e Delay hanno una porta di ingresso sul bordo sinistro e una porta di
uscita sul bordo destro; i nodi Note non hanno porte.

### Nodi Task {#task-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Scheda di un nodo Task](/assets/workflow-node-task.webp)
</div>

Un nodo Task esegue un Task Template. Il riquadro mostra l'applicazione del Task Template
(Ansible, Terraform, OpenTofu, Bash, PowerShell, Python), il titolo è il nome del Task Template
e il sottotitolo indica l'applicazione. È possibile sovrascrivere i parametri del Task Template
(Inventory, ambiente, limit di Ansible, argomenti CLI aggiuntivi) per singolo nodo tramite i
**task params** nel pannello delle proprietà; in tal caso il sottotitolo riporta
**custom params**. Un nodo Task senza Task Template mostra un badge di avviso e impedisce
il salvataggio.

### Nodi Approval {#approval-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Scheda di un nodo Approval](/assets/workflow-node-approval.webp)
</div>

Un nodo Approval mette in pausa l'esecuzione fino a quando un utente con i permessi necessari
approva o rifiuta. Facoltativamente è possibile impostare un timeout (in secondi) e un messaggio
di approvazione; il sottotitolo mostra il timeout. Quando l'esecuzione raggiunge un nodo di
approvazione, lo stato passa a **approval** fino a quando qualcuno approva o rifiuta. La scheda
di approvazione nella vista dell'esecuzione mostra il messaggio di approvazione con i pulsanti
**Approve** e **Reject** per gli utenti che possono eseguire Task nel Project. Un'approvazione
rifiutata fa fallire il nodo e l'esecuzione prosegue lungo gli archi **On failure** o **Always**.

### Nodi Delay {#delay-nodes}

<div class="BlockSchema BlockSchema--xsmall">
![Scheda di un nodo Delay](/assets/workflow-node-delay.webp)
</div>

Un nodo Delay attende il numero di secondi configurato (minimo 1) prima di proseguire verso
i nodi successivi. Utile per periodi di attesa, finestre di manutenzione o per distanziare
passaggi dipendenti. Durante l'attesa:

- L'esecuzione rimane nello stato **running**.
- La vista dell'esecuzione mostra un conto alla rovescia in tempo reale sul nodo Delay.
- I nodi successivi collegati tramite archi non vengono avviati fino al completamento del ritardo.

Se l'esecuzione del Workflow viene **interrotta** mentre un ritardo è attivo, il ritardo viene
annullato e l'esecuzione termina nello stato **stopped**.

### Nodi Note {#note-nodes}

<div class="BlockSchema BlockSchema--xsmall">

![Scheda di un nodo Note](/assets/workflow-node-note.webp)

</div>

Un nodo Note è un'annotazione libera sull'area di lavoro, rappresentata come un post-it. I nodi
Note non vengono eseguiti, non hanno porte e non sono mai collegati da archi: servono solo a
scopo documentativo e vengono ignorati dalla convalida.

### Convergenza {#convergence}

I nodi con più archi in entrata possono richiedere che **tutti** i nodi precedenti siano terminati
(impostazione predefinita) oppure che lo sia **almeno uno** di essi. Impostare **Convergence** nel
pannello delle proprietà del nodo; il sottotitolo della scheda mostra **Any parent** quando
l'impostazione non è quella predefinita.

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
- **Vista dell'esecuzione** — lo stesso grafo dell'editor, in sola lettura, con lo stato in tempo
  reale di ogni nodo. Un'icona di stato nell'angolo della scheda indica successo, fallimento,
  esecuzione in corso, attesa di approvazione o il conto alla rovescia del ritardo; il sottotitolo
  mostra la durata. I nodi non ancora avviati sono attenuati e l'arco che porta a un nodo in
  esecuzione è animato.
- **Log del Task** — fare clic su un nodo Task già avviato per aprirne il log.
- **Stop** — mentre un'esecuzione è in stato `running` o `approval`, gli utenti con
  `run_project_tasks` possono interromperla. Tutti i Task attivi vengono interrotti, le approvazioni
  in attesa vengono rifiutate e l'esecuzione viene contrassegnata come **stopped**.

![Vista dell'esecuzione del Workflow](/assets/workflow-run.webp)

![Approvazione in attesa nella vista dell'esecuzione](/assets/workflow-run-approval.webp)

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
