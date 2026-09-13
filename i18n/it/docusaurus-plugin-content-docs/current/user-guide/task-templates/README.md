# Task Template

Un Task Template definisce cosa eseguire e come: l'applicazione, il Repository e il file da eseguire, l'Inventory, i Variable Group, le credenziali e le opzioni che un utente può modificare all'avvio di un Task. Ogni [Task](../tasks) viene creato a partire da un Task Template.

I Task Template supportano le seguenti applicazioni:

* [Ansible](/user-guide/apps/ansible)
* [Terraform/OpenTofu](/user-guide/apps/terraform) e [Terragrunt](/user-guide/apps/terragrunt)
* [Shell](/user-guide/apps/bash)
* [PowerShell](/user-guide/apps/powershell)
* [Python](/user-guide/apps/python)

Gli amministratori possono abilitare o disabilitare le applicazioni e aggiungerne di proprie, vedere [Applicazioni](/user-guide/apps).

## Elenco dei Task Template {#template-list}

La sezione **Task Templates** elenca tutti i Task Template del Project.

![Elenco dei Task Template](/assets/templates-list.webp)

| Colonna | Contenuto |
|---|---|
| **Name** | Nome del Task Template con l'icona dell'applicazione. Il pulsante **play** avvia un nuovo Task. |
| **Version** | L'ultima versione di build per i Task Template di build e deploy, altrimenti l'icona del risultato dell'ultimo Task. |
| **Status** | Badge dello stato dell'ultimo Task, oppure *Not launched*. |
| **Last Task** | Numero dell'ultimo Task e chi lo ha avviato. |
| **Playbook** | Il file eseguito dal Task Template. |
| **Inventory**, **Variable Groups**, **Repository** | Le risorse associate al Task Template. |

Le schede sopra l'elenco sono le [viste](./views): gruppi di Task Template con un nome. L'icona a forma di ingranaggio nell'angolo in alto a destra consente di scegliere quali colonne mostrare. Fare clic sulla freccia a sinistra di una riga per espandere gli ultimi Task di quel Task Template.

![Riga del Task Template espansa](/assets/templates-list-expanded.webp)

## Pagina del Task Template {#template-page}

Fare clic sul nome di un Task Template per aprirne la pagina. Il pulsante nell'angolo in alto a destra avvia un Task (**Run**, **Build** oppure **Deploy** a seconda del tipo), **Stop all** interrompe tutti i Task in esecuzione o in coda del Task Template.

| Scheda | Contenuto |
|---|---|
| **Tasks** | I Task di questo Task Template, con un pulsante di **riesecuzione** in ogni riga. |
| **Details** | Il playbook, il tipo, l'Inventory, i Variable Group e il Repository, oltre al grafico degli stati dei Task con gli stessi filtri di [Stats](../projects/stats). |
| **Workspaces** | Solo per i Task Template Terraform, OpenTofu e Terragrunt: l'elenco dei workspace, vedere [Workspace](../apps/terraform/workspaces). |

![Dettagli del Task Template](/assets/template-details.webp)

## Tipi di Task Template {#template-types}

| Tipo | Scopo |
|---|---|
| **Task** | Una semplice esecuzione. È il tipo predefinito. |
| **Build** | Produce un artefatto e gli assegna una versione incrementata automaticamente. |
| **Deploy** | Distribuisce una versione prodotta da un Task Template di build. |

I Task Template di build e deploy e la variabile `semaphore_vars` che passano ai playbook sono descritti in [Task Template di build e deploy](./build-deploy).

## Modulo del Task Template {#template-form}

Gli utenti con il ruolo **Manager** o superiore possono creare e modificare i Task Template tramite **New Template** e l'icona a forma di matita. Il modulo è organizzato nei gruppi seguenti. I campi contrassegnati con il nome di un'applicazione compaiono solo per quell'applicazione.

### Campi comuni {#common-fields}

| Campo | Descrizione |
|---|---|
| **Name** | Obbligatorio. Nome del Task Template. |
| **Description** | Testo facoltativo mostrato sotto il nome. |
| **App** | Applicazione da eseguire. |
| **Repository** | Repository con il playbook o lo script, vedere [Repository](../repositories). |
| **Branch** | Branch Git da estrarre. Se vuoto, viene utilizzato il branch configurato nel Repository. |
| **Playbook / Script filename** | Percorso del file relativo alla radice del Repository. Per le App Terraform: la sottodirectory che contiene la configurazione. |
| **Different working directory** | Esegue lo strumento da un'altra directory del Repository. |
| **Inventory** | Inventory di Ansible, oppure un workspace per le App Terraform. |
| **Variable Groups** | Uno o più Variable Group le cui variabili e segreti vengono iniettati nel Task, vedere [Variable Group](../environment). |
| **Vault password** (Ansible) | Chiavi utilizzate per sbloccare Ansible Vault, vedere [Più password Vault](../apps/ansible#multiple-vault-passwords). |
| **View** | In quale scheda di [vista](./views) viene mostrato il Task Template. |
| **CLI args** | Argomenti aggiuntivi della riga di comando come array JSON, ad esempio `["-vvv"]`. |

### Campi specifici del tipo {#type-specific-fields}

| Campo | Tipo | Descrizione |
|---|---|---|
| **Start Version** | Build | La prima versione da assegnare, ad esempio `1.0.0`. |
| **Build Template** | Deploy | Il Task Template di build i cui artefatti vengono distribuiti da questo Task Template. |
| **Autorun** | Deploy | Avvia automaticamente un deploy dopo ogni build riuscita. |

### Opzioni avanzate {#advanced-options}

| Campo | Descrizione |
|---|---|
| **Allow parallel tasks** | Consente l'esecuzione contemporanea di più Task di questo Task Template, vedere [Task paralleli](#parallel-tasks). |
| **Alerts**, **Send on success**, **Send on error** | Indicano se vengono inviate notifiche per i Task di questo Task Template e per quali risultati. Le notifiche richiedono inoltre l'opzione **Allow alerts for this project** nelle [impostazioni del Project](../projects/settings). |
| **Runner tag** (Pro) | Esegue i Task solo sui Runner con questo tag, vedere [Runner del Project](../projects/runners). |
| **Executor image** | Immagine del container per i Runner Docker e Kubernetes, vedere [Immagine dell'executor](#executor-image-docker-and-kubernetes-runners). |
| **Issue JWT to task runner**, **JWT audience**, **JWT TTL** | Assegna al Task un token firmato, vedere [JWT dei Task](./jwt). |
| **Auto-run task if new git commit have been found** | Interroga il Repository all'intervallo indicato e avvia un Task quando il branch avanza. |
| **Survey variables** | Input che l'utente compila all'avvio di un Task, vedere [Variabili di survey](./survey-vars). |

### Prompt {#prompts}

I prompt sono caselle di controllo che consentono all'utente di modificare le opzioni integrate nella finestra di dialogo New Task: branch, Inventory, argomenti CLI e, per Ansible, limit, tags, skip tags, livello di debug e installazione Galaxy. Vedere [Prompt](./prompts).

### Opzioni delle applicazioni {#application-options}

- **Ansible**: limit, tags, skip tags e opzioni di installazione Galaxy, vedere [Ansible](../apps/ansible).
- **Terraform/OpenTofu/Terragrunt**: auto approve e override del backend, vedere [Terraform/OpenTofu](../apps/terraform) e [Backend HTTP](../apps/terraform/states).

---

## Task paralleli {#parallel-tasks}

Per impostazione predefinita, i Task dello stesso Task Template vengono eseguiti in sequenza. Per consentire esecuzioni concorrenti dello stesso Task Template, abilitare l'opzione "Allow parallel tasks" nelle impostazioni del Task Template.

## Immagine dell'executor (Runner Docker e Kubernetes) {#executor-image-docker-and-kubernetes-runners}

Quando un Runner di Project utilizza l'executor **Docker** (Pro) o **Kubernetes** (Enterprise), normalmente ogni Task viene eseguito nell'immagine di job predefinita configurata sul Runner (ad esempio `semaphoreui/job:latest`). È possibile sovrascrivere quell'immagine per singolo Task Template.

1. Aprire le impostazioni del Task Template
2. Impostare **Executor image** con il riferimento all'immagine del container (ad esempio `my-registry/ansible:2.16` oppure `semaphoreui/job:latest`)
3. Salvare il Task Template

**Comportamento**:
- Solo gli executor Runner **Docker** e **Kubernetes** tengono conto di questo campo; l'executor local lo ignora
- Lasciare il campo vuoto per utilizzare l'immagine predefinita del Runner da `runner.executor.docker.image` oppure `runner.executor.k8s.image`
- Svuotando il campo nell'interfaccia si rimuove l'override

**Casi d'uso**:
- Task Template che necessitano di una toolchain differente (una versione più vecchia di Ansible, una versione specifica di Terraform, pacchetti di sistema aggiuntivi inclusi in un'immagine personalizzata)
- Immagini isolate per Task Template sensibili dal punto di vista della sicurezza, senza modificare il valore predefinito per l'intero Runner

Vedere [Configurazione del Runner](/admin-guide/configuration) per le impostazioni delle immagini predefinite e [Runner del Project](/user-guide/projects/runners) per la configurazione degli executor.
