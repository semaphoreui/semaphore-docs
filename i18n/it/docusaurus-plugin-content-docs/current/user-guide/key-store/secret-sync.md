# Sincronizzazione dei segreti da archivi remoti

Semaphore può connettersi a un gestore di segreti esterno — come **HashiCorp Vault**, **OpenBao**, **AWS Secrets Manager**, **Azure Key Vault** o **Devolutions Server (DVLS)** — e importare automaticamente i segreti nel Key Store. Invece di copiare manualmente le credenziali in Semaphore e mantenerle aggiornate, è sufficiente indicare a Semaphore l'archivio remoto: sarà Semaphore a mantenere una copia locale sincronizzata.

I **percorsi di sincronizzazione** sono le regole che indicano a Semaphore *quali* segreti importare da un archivio remoto e *come* denominarli una volta importati. Un gestore di segreti può contenere migliaia di segreti distribuiti in molte cartelle; i percorsi di sincronizzazione consentono di selezionare solo i sottoalberi di interesse e di controllare la denominazione delle chiavi create.

## Concetti chiave {#key-concepts}

- **Archivio remoto** — una connessione configurata a un gestore di segreti esterno, comprensiva dell'indirizzo e della credenziale utilizzata da Semaphore per la lettura.
- **Sincronizzazione** — il processo di lettura dei segreti dall'archivio remoto e di riconciliazione con le chiavi archiviate in Semaphore.
- **Percorso di sincronizzazione** — una singola regola di importazione, composta da un *percorso*, un *prefisso* e un *separatore*.

## Come funziona un percorso di sincronizzazione {#how-a-sync-path-works}

Ogni percorso di sincronizzazione ha tre campi:

- **Percorso** — la posizione nell'archivio remoto da cui importare. È la cartella di base, il prefisso o il sottoalbero che Semaphore elenca e legge. Tutto ciò che si trova al suo interno diventa candidato all'importazione.
- **Prefisso** — una stringa aggiunta all'inizio di ogni nome di chiave generato. Utilizzarlo per assegnare un namespace ai segreti importati, in modo che non entrino in conflitto con le chiavi di altri percorsi o altri archivi (ad esempio `prod-`).
- **Separatore** — il carattere utilizzato per unire le parti della posizione remota di un segreto in un unico nome di chiave. Poiché un segreto remoto può trovarsi a diversi livelli di profondità, il separatore determina come tale gerarchia viene appiattita in un unico nome leggibile.

Quando viene eseguita una sincronizzazione, Semaphore percorre il **percorso** e, per ogni segreto trovato, costruisce un nome di chiave combinando la posizione del segreto con il **separatore** e anteponendo il **prefisso**. Il tipo di chiave creata (chiave SSH, login/password o semplice stringa segreta) viene dedotto automaticamente dalla forma del segreto remoto.

È possibile definire **più percorsi di sincronizzazione** su un singolo archivio. Ogni percorso viene importato in modo indipendente, quindi è possibile prelevare segreti da più aree non correlate dello stesso gestore e assegnare a ciascuna il proprio prefisso e stile di denominazione.

:::tip
Per ogni provider vengono applicati valori predefiniti ragionevoli — ad esempio, HashiCorp Vault, OpenBao e AWS Secrets Manager utilizzano `/` come separatore predefinito, Azure Key Vault `-` e Devolutions Server `\` — quindi nella maggior parte dei casi è sufficiente compilare solo il percorso.
:::

## Esecuzione di una sincronizzazione {#running-a-sync}

Una sincronizzazione può avvenire in due modi:

1. **Manualmente.** Aprire l'archivio e utilizzare l'azione **Sincronizza ora**. Semaphore riconcilia immediatamente l'archivio con i percorsi di sincronizzazione configurati. È utile per una prima importazione o per recepire subito una modifica.
2. **Automaticamente, secondo una pianificazione.** Abilitare **Sincronizza chiavi** per l'archivio e impostare un **intervallo di sincronizzazione** in minuti. Semaphore rieseguirà quindi la sincronizzazione in background con quella cadenza. Un intervallo pari a `0` disabilita la sincronizzazione automatica, lasciando disponibile solo l'opzione manuale.

Ogni archivio registra la data dell'ultima sincronizzazione e se l'ultimo tentativo è fallito, in modo da poter sempre verificare lo stato della copia locale.

:::note
In un'installazione ad alta disponibilità, le sincronizzazioni automatiche vengono coordinate tra i nodi, quindi una data sincronizzazione viene eseguita su un solo nodo alla volta: non si verificheranno importazioni duplicate.
:::

## Effetti della sincronizzazione sulle chiavi {#what-syncing-does-to-your-keys}

Una sincronizzazione è una **copia speculare completa**, non una copia una tantum. A ogni esecuzione, Semaphore riconcilia l'archivio remoto con le chiavi importate in precedenza:

- I segreti **nuovi** trovati in un percorso di sincronizzazione vengono creati come chiavi.
- Le chiavi importate **esistenti** vengono **aggiornate** per corrispondere al valore remoto corrente.
- Le chiavi importate in precedenza che **non esistono più** nell'archivio remoto vengono **rimosse**.

Vengono toccate solo le chiavi importate da Semaphore: le chiavi create manualmente non vengono mai modificate né eliminate da una sincronizzazione.

:::warning
Poiché le chiavi importate sono copie gestite dei segreti remoti, l'eliminazione di un archivio (o la disabilitazione della sua sincronizzazione) rimuove anche le chiavi che ne derivano.
:::

## Due ambiti: chiavi condivise e variabili d'ambiente {#two-scopes-shared-keys-and-environment-variables}

I percorsi di sincronizzazione possono essere configurati in due punti:

- **A livello di archivio** — i segreti importati diventano **chiavi condivise**, disponibili in tutto il progetto ovunque vengano utilizzate le chiavi.
- **A livello di ambiente** — un [Gruppo di variabili](/user-guide/environment) può puntare a un archivio e ai suoi percorsi di sincronizzazione per importare i segreti come **variabili d'ambiente** limitate a quel gruppo.

Il meccanismo è identico; cambia solo la destinazione dei segreti importati.

## Note e limitazioni {#notes-and-limitations}

- La sincronizzazione è supportata solo per i tipi di archivio **esterni** (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault, Devolutions Server). L'archivio **Database** integrato contiene i segreti nativamente e non ha nulla da sincronizzare.
- La credenziale dell'archivio remoto (il token o la chiave utilizzata da Semaphore per autenticarsi) viene archiviata in modo sicuro e separatamente dai segreti importati.
- Se la sincronizzazione viene disattivata e non rimangono percorsi, la configurazione di sincronizzazione di quell'archivio viene azzerata.
