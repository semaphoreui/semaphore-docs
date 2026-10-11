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

La chiave di un Repository viene usata solo per quel Repository. Per raggiungere submoduli, ruoli di `requirements.yml` o altri repository ospitati altrove con credenziali proprie, aggiungere una mappatura in [Host config](/user-guide/host-config).

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
    * Spuntare **Single checkout for all templates** se il repository è un monorepo che tutti i modelli di task devono condividere, vedere [Monorepo](#monorepo)
    * Selezionare la **Chiave di accesso** configurata prima di impostare questo repository.

4. Fare clic su Salva una volta completata la configurazione.

## Monorepo: un solo checkout per tutti i modelli {#monorepo}

Per impostazione predefinita Semaphore clona un repository una volta per ogni modello, quindi ogni modello lavora in una copia propria. Per un repository di grandi dimensioni condiviso da molti modelli, le copie occupano spazio su disco e ogni task inizia con un clone o un pull della propria copia.

Spuntare **Single checkout for all templates** per clonare il repository una sola volta e condividere quel checkout tra tutti i modelli del progetto. L'opzione non è disponibile per una cartella locale (`/path/to/the/repo`), che non viene mai clonata.

<div style={{maxWidth: 450}}>

![Modulo del repository con Single checkout for all templates abilitato](/assets/repository-monorepo.webp)

</div>

Come funziona il checkout condiviso:

* Prima dell'avvio di un task, Semaphore acquisisce un lock sul checkout, esegue fetch e pull del branch configurato nel repository, quindi rilascia il lock. I task degli altri modelli attendono il lock mentre il checkout viene aggiornato, ma i task stessi vengono eseguiti in parallelo.
* Ogni branch ha comunque un checkout proprio, quindi repository con branch diversi non condividono mai la stessa working tree.
* Il checkout è condiviso, ma la home directory di Ansible (ruoli e collection installati da `requirements.yml`) resta separata per ogni modello.

Poiché tutti i modelli lavorano nello stesso checkout sullo stesso branch, un modello di un monorepo non può avere un **Branch** proprio e non può abilitare il prompt **Branch** che consente a un task di scegliere un branch o un commit. Il modulo del modello disabilita entrambi e ne spiega il motivo, e l'API rifiuta un modello di questo tipo. Assicurarsi che i playbook non scrivano nel checkout: una working tree modificata interrompe il pull successivo e Semaphore rimuove quindi il checkout e lo clona di nuovo.

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

