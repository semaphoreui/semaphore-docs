# Runner del Project (Pro)

I Runner eseguono i Task su macchine diverse dal server Semaphore: più vicine all'infrastruttura di destinazione, in un'altra zona di rete oppure con una toolchain differente. I **Runner globali** vengono registrati da un amministratore e servono tutti i Project. I **Runner di Project** appartengono a un solo Project e vengono gestiti dal relativo Team nella sezione **Runners**.

![Runner del Project](/assets/project-runners-list.webp)

| Colonna | Contenuto |
|---|---|
| Interruttore | Abilita o disabilita il Runner. Un Runner disabilitato non riceve Task. Solo i Runner di Project dispongono dell'interruttore; i Runner globali sono gestiti dall'amministratore. |
| **Name** | Nome del Runner. Il badge **Global** contrassegna i Runner condivisi da tutti i Project. |
| **Tag** | I tag del Runner. I Task Template con un **Runner tag** vengono eseguiti solo sui Runner che hanno quel tag. |
| **Status** | **Online** se il Runner ha interrogato il server di recente, **Offline** in caso contrario. |

## Aggiunta di un Runner {#adding-a-runner}

È necessario il ruolo **Manager** o superiore. Fare clic su **New Runner** e compilare il modulo.

<div style={{maxWidth: 420}}>

![Finestra di dialogo per un nuovo Runner](/assets/project-runner-new.webp)

</div>

| Campo | Descrizione |
|---|---|
| **Name** | Nome del Runner mostrato nell'elenco e nei dettagli dei Task. |
| **Tags** | Facoltativo. Uno o più tag. Un Task Template con un **Runner tag** viene eseguito soltanto dai Runner che possiedono quel tag. |
| **Is default** | I Runner con questo flag prendono in carico anche i Task dei Task Template senza runner tag. Un Runner senza il flag e senza tag non riceve mai Task. |
| **Register** | Selezionata: il Runner viene creato come già registrato e la finestra di dialogo mostra il token del Runner da inserire nella sua configurazione. Non selezionata: il Runner viene creato non registrato e si ottiene un **token di registrazione** monouso; il Runner si registra da sé con `semaphore runner register` oppure `semaphore runner start --auto-register`. |
| **Webhook** | URL facoltativo che Semaphore chiama quando un Task viene assegnato al Runner. Da utilizzare per avviare Runner on-demand (one-off), ad esempio con una cloud function. |
| **Max number of parallel tasks** | Facoltativo. Quanti Task il Runner può eseguire contemporaneamente. |
| **Enabled** | Indica se il Runner riceve Task. |

Dopo la creazione, fare clic sul Runner per visualizzare di nuovo il suo token o token di registrazione e per copiare i frammenti di configurazione.

## Installazione del Runner {#installing-the-runner}

Il Runner è lo stesso binario `semaphore` oppure l'immagine Docker `semaphoreui/runner` avviata in modalità runner. L'installazione, il file di configurazione, i comandi di registrazione, gli executor (local, Docker, Kubernetes) e la sicurezza sono descritti nella guida per amministratori: [Runner](/admin-guide/runners) e [CLI: Runner](/reference/cli/runners).

## Instradamento dei Task verso i Runner {#routing-tasks-to-runners}

1. Assegnare al Runner uno o più **Tags**, ad esempio `windows-qa-server`.
2. Nel modulo del Task Template, impostare **Runner tag** sullo stesso valore.
3. I Task del Task Template rimangono nello stato `waiting` fino a quando un Runner con quel tag non è online.

I Task Template senza runner tag vengono assegnati ai Runner contrassegnati come **Is default**, inclusi i Runner globali predefiniti. Il Runner che ha eseguito un Task è indicato nella scheda **Details** della [finestra del Task](../tasks#task-window).

## Sicurezza {#security}

- I Runner si connettono al server, mai il contrario, quindi un Runner può trovarsi dietro un NAT o in una rete privata.
- Ogni richiesta proveniente da un Runner viene autenticata con il suo token. Per revocare un Runner, eliminarlo o disabilitarlo.
- Utilizzare HTTPS tra i Runner e il server; vedere [Sicurezza di rete](/admin-guide/security/network).
