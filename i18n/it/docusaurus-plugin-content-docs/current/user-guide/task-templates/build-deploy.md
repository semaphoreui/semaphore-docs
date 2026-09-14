# Task Template di build e deploy

Oltre ai semplici Task Template di tipo **Task**, Semaphore dispone di due tipi di Task Template che formano una pipeline elementare: **Build** crea un artefatto versionato, **Deploy** distribuisce una versione scelta sui server. Entrambi i tipi si selezionano nel modulo del Task Template e modificano ciò che l'utente vede all'avvio di un Task.

## Task Template di build {#build-templates}

Un Task Template di build produce un artefatto: un tarball, un'immagine di container, un pacchetto. Ogni Task di build riceve una versione incrementata automaticamente, a partire dalla **Start Version** del Task Template (ad esempio `1.0.0`). La versione è mostrata nella colonna **Version** dell'elenco dei Task Template e nella cronologia dei Task.

<div class="DialogScreenshot">
  ![Finestra di dialogo New Task per un Task Template di build](/assets/task-new-build.webp)
</div>

Utilizzare la versione nel proprio playbook tramite `semaphore_vars.task_details.target_version` per denominare l'artefatto.

## Task Template di deploy {#deploy-templates}

Un Task Template di deploy è collegato a un Task Template di build tramite il campo **Build Template**. Quando un utente fa clic su **Deploy**, la finestra di dialogo New Task chiede la **Build Version** da distribuire; l'ultima build riuscita è preselezionata.

<div class="DialogScreenshot">
![Finestra di dialogo New Task per un Task Template di deploy](/assets/task-new-deploy.webp)
</div>

Abilitare **Autorun** nel Task Template di deploy per avviare automaticamente un deploy dopo ogni build riuscita. La versione da distribuire è disponibile nel playbook come `semaphore_vars.task_details.incoming_version`.

## La variabile `semaphore_vars` {#the-semaphore_vars-variable}

Semaphore passa la variabile `semaphore_vars` a ogni playbook Ansible che esegue. Utilizzarla per conoscere il tipo di Task eseguito, quale versione deve essere compilata o distribuita, chi ha eseguito il Task e il messaggio del Task.

Esempio per i Task `build`:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

Esempio per i Task `deploy`:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

Per i Task Template **Bash**, **PowerShell** e **Python**, Semaphore fornisce gli stessi valori di `task_details` come variabili d'ambiente:

| Campo di `task_details` | Variabile d'ambiente | Note |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` oppure `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | Utente che ha avviato il Task |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | Messaggio del Task |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Presente per i Task `build` |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Presente per i Task `deploy` |

Esempio per Bash:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

Esempio per PowerShell:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Esempio per Python:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## Pipeline di esempio {#example-pipeline}

Un ruolo Ansible di `build`:

1. Recupera il codice sorgente dell'applicazione da GitHub.
2. Compila il codice sorgente.
3. Impacchetta il binario in `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`.
4. Carica il tarball in un bucket S3.

Un ruolo Ansible di `deploy`:

1. Scarica `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` dal bucket S3 sui server di destinazione.
2. Lo estrae nella directory di destinazione.
3. Crea o aggiorna i file di configurazione.
4. Riavvia il servizio dell'applicazione.

Per concatenare più di due step, aggiungere approvazioni o diramare in caso di errore, utilizzare i [Workflow](../workflows).
