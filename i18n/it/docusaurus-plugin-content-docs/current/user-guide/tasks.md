# Task

Un Task è una singola esecuzione di un [Task Template](./task-templates): un'esecuzione di un playbook Ansible, di una configurazione Terraform/OpenTofu/Terragrunt oppure di uno script Bash, PowerShell o Python. Ogni Task conserva il proprio log, stato e dettagli, così è sempre possibile vedere cosa è stato eseguito, quando, da chi e con quale revisione del Repository.

## Avvio di un Task {#starting-a-task}

È necessario disporre del ruolo **Task Runner** o superiore nel Project (vedere [Team](./team)). Un Task può essere avviato da due punti:

- In **Task Templates**, fare clic sul pulsante **play** nella riga del Task Template.
- Nella pagina del Task Template, fare clic sul pulsante nell'angolo in alto a destra. La sua etichetta dipende dal tipo di Task Template: **Run**, **Build** oppure **Deploy**.

Entrambi aprono la finestra di dialogo **New Task**. Il suo contenuto dipende dall'applicazione e dalle opzioni abilitate nel Task Template.

![Finestra di dialogo New Task per un Task Template Ansible](/assets/task-new-ansible.webp)

| Campo | Mostrato per | Descrizione |
|---|---|---|
| **Message** | tutti i Task Template | Nota facoltativa memorizzata con il Task e mostrata nella cronologia e nelle notifiche. |
| **Build Version** | Task Template di deploy | Quale build distribuire. Per impostazione predefinita è selezionata l'ultima build riuscita. Vedere [Task Template di build e deploy](./task-templates/build-deploy). |
| Variabili di survey | Task Template con [variabili di survey](./task-templates/survey-vars) | Un input per ogni variabile; le variabili obbligatorie devono essere compilate. |
| **Dry Run** `--check`, **Diff** `--diff` | Ansible | Esegue il playbook in modalità check oppure mostra le modifiche ai file. Gli altri prompt di Ansible (Limit, Tags, Skip tags, Debug) compaiono quando sono abilitati nel Task Template, vedere [Prompt](./task-templates/prompts). |
| **Plan**, **Destroy**, **Auto Approve**, **Upgrade**, **Reconfigure** | Terraform, OpenTofu, Terragrunt | Esegue solo `plan`, aggiunge `-destroy`, `-auto-approve`, `-upgrade` oppure `-reconfigure`. Vedere [Terraform/OpenTofu](./apps/terraform). |
| **Branch**, **Inventory**, **CLI args** | qualsiasi applicazione | Sovrascrive i valori del Task Template per questa esecuzione. Ogni override deve essere consentito nelle impostazioni del Task Template. |

![Finestra di dialogo New Task per un Task Template Terraform](/assets/task-new-terraform.webp)

Fare clic su **Run** (oppure **Build** / **Deploy**) per mettere il Task in coda.

### Coda ed esecuzione parallela {#queue-and-parallel-execution}

I Task dello stesso Task Template vengono eseguiti uno dopo l'altro, a meno che nel Task Template non sia abilitata l'opzione **Allow parallel tasks**. Il Project può inoltre limitare il numero totale di Task in esecuzione con **Max number of parallel tasks** nelle [impostazioni del Project](./projects/settings). Un Task che deve attendere rimane nello stato `waiting` e si avvia automaticamente quando si libera uno slot.

## Finestra del Task {#task-window}

Facendo clic su un Task in qualsiasi punto dell'interfaccia si apre la finestra del Task. L'intestazione mostra il Task Template, il numero del Task, il messaggio di commit della revisione del Repository, il badge dello stato, chi ha avviato il Task e quando, oltre alla durata. L'icona con le frecce espande la finestra a schermo intero.

![Log del Task](/assets/task-log.webp)

| Scheda | Contenuto |
|---|---|
| **Log** | Output in tempo reale del Task con i timestamp. Il log viene trasmesso in streaming durante l'esecuzione del Task. **Raw log** apre l'output non elaborato in una nuova scheda del browser. |
| **Details** | Informazioni sul Task Template (applicazione, Task Template), informazioni sul commit (messaggio e hash) e informazioni sull'esecuzione: messaggio, data di creazione, di avvio e di fine, durata e, quando impostati, il Runner, il branch, il limit e le variabili utilizzate per l'esecuzione. |
| **Summary** (Pro) | Per i Task Ansible: quanti host sono terminati con esito OK e quanti sono falliti, con una tabella dei task falliti per server. |

![Dettagli del Task](/assets/task-details.webp)

![Riepilogo del Task](/assets/task-summary.webp)

## Stati dei Task {#task-statuses}

| Stato | Significato |
|---|---|
| `waiting` | Il Task è in coda: è in esecuzione un altro Task dello stesso Task Template, è stato raggiunto il limite del Project oppure non è ancora disponibile alcun Runner. |
| `starting` | Un Runner ha preso in carico il Task e sta preparando il Repository e l'ambiente. |
| `waiting_confirmation` | Lo strumento ha posto una domanda e attende un utente, ad esempio `terraform apply` senza **Auto Approve** oppure uno script che legge un input. Utilizzare **Confirm** o **Reject** nella finestra del Task. |
| `confirmed` | Un utente ha confermato la domanda; il Task continua. |
| `rejected` | Un utente ha rifiutato la domanda; il Task termina. |
| `running` | Il playbook o lo script è in esecuzione. |
| `stopping` | È stata richiesta l'interruzione e il processo è in fase di terminazione. |
| `stopped` | Il Task è stato interrotto da un utente. |
| `success` | Terminato con codice di uscita 0. |
| `error` | Terminato con un codice di uscita diverso da zero oppure non è riuscito ad avviarsi. Nell'interfaccia viene mostrato come **Failed**. |

## Interruzione dei Task {#stopping-tasks}

Aprire la finestra del Task di un Task in esecuzione e fare clic su **Stop**. Semaphore invia un segnale di terminazione e il Task passa allo stato `stopping` mentre il processo si chiude. Se il processo non reagisce, il pulsante diventa **Force Stop**; facendo clic su di esso il processo viene terminato immediatamente.

Per interrompere tutti i Task in esecuzione e in coda di un Task Template, aprire la pagina del Task Template e utilizzare **Stop all**. Il menu a discesa offre sia **Stop** sia **Force stop**.

<div style={{maxWidth: 200}}>

![Menu Stop all](/assets/task-stop-all-menu.webp)

</div>

## Riesecuzione di un Task {#running-a-task-again}

Nella scheda **Tasks** di un Task Template ogni riga dispone di un pulsante di **riesecuzione**. Apre la finestra di dialogo New Task con il messaggio e i parametri di quel Task già compilati.

![Task del Task Template con i pulsanti di riesecuzione](/assets/template-tasks.webp)

## Dove sono elencati i Task {#where-tasks-are-listed}

- **Dashboard → History**: tutti i Task del Project, vedere [Cronologia](./projects/history).
- **Pagina del Task Template → Tasks**: i Task di un singolo Task Template.
- **Task Templates**: espandere una riga con la freccia a sinistra per vedere gli ultimi Task del Task Template senza uscire dall'elenco.

## Conservazione dei log {#log-retention}

Per impostazione predefinita i Task e i log vengono conservati per sempre. Utilizzare `max_tasks_per_template` per conservare solo gli ultimi Task di ciascun Task Template, vedere [Cronologia](./projects/history#task-retention).
