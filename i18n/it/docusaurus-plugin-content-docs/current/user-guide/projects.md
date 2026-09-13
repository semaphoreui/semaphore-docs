# Project

Un Project è l'unità principale di separazione in Semaphore UI. Ogni risorsa con cui si lavora appartiene a un solo Project: Task Template, Task, Inventory, Variable Group, chiavi, Repository, Integration, Schedule, Runner e membri del Team.

I Project sono indipendenti tra loro, quindi possono essere utilizzati per organizzare sistemi non correlati all'interno di una singola installazione di Semaphore: Team, infrastrutture, ambienti o applicazioni differenti.

## Navigazione nel Project {#project-navigation}

Dopo aver aperto un Project, la barra laterale di sinistra mostra in alto il selettore dei Project e sotto tutte le sezioni del Project. Sotto il nome del Project è indicato il proprio ruolo in questo Project (ad esempio `task_runner`). Il ruolo definisce quali sezioni è possibile modificare; vedere [Team](./team).

![Dashboard del Project con la scheda History](/assets/project-dashboard-history.webp)

| Sezione | Contenuto |
|---|---|
| **Dashboard** | Le schede [History](./projects/history), [Stats](./projects/stats), [Activity](./projects/activity) e, per i proprietari del Project, [Settings](./projects/settings) |
| **Task Templates** | Definizioni di cosa eseguire e come: [Task Template](./task-templates) |
| **Workflows** (Pro) | Grafi di Task Template con approvazioni e diramazioni: [Workflow](./workflows) |
| **Schedule** | Pianificazioni in stile cron per i Task Template: [Schedule](./schedules) |
| **Inventory** | Host e impostazioni di connessione per Ansible, workspace per Terraform: [Inventory](./inventory) |
| **Variable Groups** | Variabili e segreti riutilizzabili iniettati nei Task: [Variable Group](./environment) |
| **Key Store** | Credenziali cifrate e archivi di segreti esterni: [Key Store](./key-store) |
| **Repositories** | Repository Git o percorsi locali con i propri playbook e script: [Repository](./repositories) |
| **Integrations** | Webhook in ingresso che avviano i Task: [Integration](./integrations) |
| **Team** | Membri e relativi ruoli: [Team](./team) |
| **Runners** (Pro) | I Runner associati a questo Project: [Runner del Project](./projects/runners) |

In fondo alla barra laterale si trovano l'interruttore della modalità scura, il selettore della lingua e il [menu dell'account](./account).

## Creazione di un Project {#creating-a-project}

La creazione dei Project è disponibile per gli amministratori. Gli utenti normali possono creare Project solo se è abilitata l'opzione del server `non_admin_can_create_project` (`SEMAPHORE_NON_ADMIN_CAN_CREATE_PROJECT`), vedere [Configurazione](/admin-guide/configuration).

1. Fare clic sul nome del Project in cima alla barra laterale e scegliere **New Project**.
2. Compilare il modulo:

| Campo | Descrizione |
|---|---|
| **Project Name** | Nome visualizzato del Project. È possibile modificarlo in seguito in [Settings](./projects/settings). |
| **Max number of parallel tasks** | Facoltativo. Quanti Task di questo Project possono essere eseguiti contemporaneamente. Lasciare vuoto per non impostare alcun limite. I Task oltre il limite attendono in coda con lo stato `waiting`. |
| **Demo** | Popola il nuovo Project con dati di esempio: un Repository demo pubblico, un Inventory, una chiave e diversi Task Template. Utile per provare Semaphore senza configurare nulla. |

3. Fare clic su **Create**.

L'utente che crea un Project ne diventa il **Owner**.

## Passaggio da un Project a un altro {#switching-between-projects}

Fare clic sul nome del Project in cima alla barra laterale per visualizzare tutti i Project di cui si è membri e passare da uno all'altro. L'ultimo Project aperto viene memorizzato nel browser.

## Backup e ripristino {#backup-and-restore}

Un Project può essere esportato in un file JSON e importato nella stessa istanza di Semaphore o in un'altra:

- **Esportazione**: aprire **Dashboard → Settings** e fare clic su **Backup project** (vedere [Settings](./projects/settings)).
- **Importazione**: fare clic sul nome del Project nella barra laterale, scegliere **Restore project** e caricare il file di backup.

Entrambe le operazioni sono disponibili anche da riga di comando, vedere [CLI: Project](/admin-guide/cli/projects).
