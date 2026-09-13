# Repository

Un repository è un luogo in cui archiviare e gestire contenuti Ansible come playbook e ruoli.

![](/assets/repository.webp)

Semaphore riconosce i repository di questi tipi:
  * un file system locale (`/path/to/the/repo`)
  * un repository Git locale (`file://`)
  * un repository Git remoto accessibile tramite HTTPS (`https://`) o SSH (`ssh://`)
  * il protocollo `git://` è supportato, ma non è consigliato per motivi di sicurezza.

Tutti i modelli di task richiedono un repository per essere eseguiti.

## Autenticazione {#authentication}
Se si utilizza un repository remoto che richiede l'autenticazione, è necessario configurare una chiave nella sezione **Key Store** di Semaphore.

Per i repository remoti che utilizzano SSH, è necessario utilizzare la propria chiave SSH nel **Key Store**.

Per i repository remoti che non richiedono autenticazione, è possibile creare una chiave di tipo `None`.

## Creazione di un nuovo repository {#creating-a-new-repository}
1. Assicurarsi di aver configurato nella sezione Key Store la chiave per il repository che si sta per aggiungere.

2. Andare nella sezione Repository di Semaphore e fare clic sul pulsante **Nuovo repository** nell'angolo in alto a destra.

3. Configurare il repository:
    * Assegnare un nome al repository
    * Aggiungere l'URL. L'URL deve iniziare con uno dei seguenti:
        * `/path/to/the/repo` per una cartella locale sul file system
        * `https://` per un repository Git remoto accessibile tramite HTTPS
        * `ssh://` per un repository Git remoto accessibile tramite SSH
        * `file://` per un repository Git locale
        * `git://` per un repository Git remoto accessibile tramite protocollo Git
    * Impostare il branch del repository; in caso di dubbio, probabilmente è master o main
    * Selezionare la **Chiave di accesso** configurata prima di impostare questo repository.

4. Fare clic su Salva una volta completata la configurazione.

## Modifica di un repository esistente {#editing-an-existing-repository}
1. Andare nella sezione Repository di Semaphore.

2. Fare clic sull'icona a forma di matita accanto al repository da modificare; verrà mostrata la configurazione del repository.

## Eliminazione di un repository {#deleting-a-repository}
Assicurarsi che il repository che si sta per eliminare non sia utilizzato da alcun modello di task.
Un repository non può essere eliminato se è utilizzato in un modello di task:
1. Andare nella sezione Repository di Semaphore.

2. Fare clic sull'icona del cestino del repository da eliminare.

3. Fare clic su Sì nella finestra di conferma se si è sicuri di voler eliminare il repository.

## Requisiti {#requirements}
All'inizializzazione del progetto, Semaphore cerca e installa i ruoli e le collection Ansible dai file requirements.yml nelle seguenti posizioni e nel seguente ordine.

### Ruoli {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Collection {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### Logica di elaborazione {#processing-logic}

* Ogni file viene elaborato in modo indipendente
* Se un file esiste, viene elaborato in base al suo tipo (ruolo o collection)
* Se l'elaborazione di un file genera un errore, il processo di installazione si interrompe e restituisce l'errore
* Lo stesso file requirements.yml nelle directory radice (**`playbook_dir`/requirements.yml** e **`repo_path`/requirements.yml**) viene elaborato due volte: una per i ruoli e una per le collection

Semaphore tenterà di elaborare tutte queste posizioni indipendentemente dal fatto che le posizioni precedenti siano state trovate o elaborate con successo, tranne in caso di errori.

