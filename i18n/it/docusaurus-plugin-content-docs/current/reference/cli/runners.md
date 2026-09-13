# Runner

Il comando `semaphore runner` esegue Semaphore in **modalità runner** e gestisce la
registrazione di un runner sul server. Un runner esegue i task su una macchina separata
dal server Semaphore.

```bash
semaphore runner --help
```

:::tip
Per il funzionamento dei runner e la configurazione lato server, consultare la guida
[Runner](/admin-guide/runners).
:::

Eseguire `semaphore runner` senza sottocomando stampa semplicemente l'aiuto. Dispone dei
seguenti sottocomandi:

| Comando | Scopo |
|---------|---------|
| [`runner setup`](#interactive-setup-runner-setup) | Crea interattivamente un file di configurazione del runner (e lo registra se viene fornito un token). |
| [`runner register`](#registering-a-runner-runner-register) | Registra il runner sul server usando un token di registrazione. |
| [`runner start`](#starting-a-runner-runner-start) | Esegue in modalità runner e inizia ad accettare task. |
| [`runner unregister`](#unregistering-a-runner-runner-unregister) | Rimuove la registrazione del runner dal server. |

Tutti i sottocomandi accettano il flag globale `--config <path>` per indicare il file di
configurazione del runner (e `--no-config` per usare solo le variabili d'ambiente).

## Configurazione interattiva (`runner setup`) {#interactive-setup-runner-setup}

Guida attraverso una configurazione interattiva, scrive un file di configurazione del runner e, se
è disponibile un token di registrazione (inserito durante le domande o impostato tramite
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`), registra immediatamente il runner sul
server.

```bash
semaphore runner setup --config /path/to/config.runner.json
```

Passare `--config <path>` per scegliere dove scrivere il file di configurazione.
In assenza, il setup chiede una directory di output (predefinita: la directory
corrente) e vi scrive `config.runner.json`.

Al termine stampa i comandi per avviare il runner, ad esempio:

```bash
# Run in the foreground:
./semaphore runner start --config /path/to/config.runner.json

# Run as a daemon:
nohup ./semaphore runner start --config /path/to/config.runner.json &
```

In seguito è possibile modificare manualmente il file di configurazione generato invece di
rieseguire il setup.

### Opzioni di configurazione del runner {#runner-configuration-options}

Campi del blocco `runner` del file di configurazione:

| Campo | Variabile d'ambiente | Descrizione |
|-------|--------------|-------------|
| `token` / `token_file` | `SEMAPHORE_RUNNER_TOKEN` / `SEMAPHORE_RUNNER_TOKEN_FILE` | Token di autenticazione del runner (rilasciato alla registrazione). |
| — | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN` | Token di registrazione. Solo variabile d'ambiente; non viene mai scritto nel file. |
| `registration_token_file` | `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE` | Percorso di un file contenente il token di registrazione. |
| `name` | `SEMAPHORE_RUNNER_NAME` | Nome del runner mostrato sul server. |
| `tags` | `SEMAPHORE_RUNNER_TAGS` | Array JSON di tag per l'instradamento dei runner di progetto. |
| `webhook` | `SEMAPHORE_RUNNER_WEBHOOK` | URL chiamato dal server quando un task viene accodato per questo runner. |
| `enabled` | `SEMAPHORE_RUNNER_ENABLED` | Indica se il runner accetta task. |
| `project_id` | `SEMAPHORE_RUNNER_PROJECT_ID` | ID del progetto per un runner a livello di progetto. Omettere per un runner globale. |
| `check_interval_seconds` | `SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS` | Intervallo di polling in secondi. Predefinito: 1. |
| `max_parallel_tasks` | `SEMAPHORE_RUNNER_MAX_PARALLEL_TASKS` | Numero massimo di task concorrenti. Predefinito: 9999. |
| `one_off` | `SEMAPHORE_RUNNER_ONE_OFF` | Termina dopo aver elaborato un job. Utile per i runner avviati su richiesta da un webhook. |

Consultare [Runner](/admin-guide/runners) per i dettagli sulla configurazione e
[Configurazione](/admin-guide/configuration) per l'elenco completo delle opzioni.

## Registrare un runner (`runner register`) {#registering-a-runner-runner-register}

Registra il runner sul server e salva il token del runner rilasciato nel file di
configurazione (sovrascrivendo qualsiasi token esistente). Il server deve avere un
`runner_registration_token` configurato; qui si passa quello stesso token.

```bash
# Token read from a file:
semaphore runner register --registration-token-file /path/to/token --config /path/to/config.runner.json

# Token piped from stdin:
echo "$REGISTRATION_TOKEN" | semaphore runner register --stdin-registration-token --config /path/to/config.runner.json

# Token from the environment:
SEMAPHORE_RUNNER_REGISTRATION_TOKEN="$REGISTRATION_TOKEN" semaphore runner register --config /path/to/config.runner.json
```

| Flag | Descrizione |
|------|-------------|
| `--registration-token-file <path>` | Legge il token di registrazione da un file. |
| `--stdin-registration-token` | Legge il token di registrazione da stdin. |
| `--name <name>` | Nome con cui registrare il runner. |
| `--tags <tags>` | Tag del runner, separati da virgola o ripetendo il flag (ad esempio `--tags a,b` o `--tags a --tags b`). |
| `--webhook <url>` | URL del webhook del runner. |
| `--enabled` | Abilita o disabilita il runner sul server. Predefinito `true`; passare `--enabled=false` per registrare un runner disabilitato. |
| `--project-id <id>` | Registra come runner a livello di progetto per il progetto indicato. Se omesso (o `0`), il runner viene registrato come runner globale. |

Vengono applicati solo i flag effettivamente passati; `--name`, `--webhook`, `--tags`
e `--enabled` sovrascrivono i valori corrispondenti del file di configurazione
e dell'ambiente solo quando sono impostati sulla riga di comando.

### Da dove proviene il token di registrazione {#where-the-registration-token-comes-from}

Durante la registrazione, Semaphore ricava il token di registrazione dalla prima
fonte disponibile, in quest'ordine:

1. Il flag `--registration-token-file`.
2. L'impostazione `registration_token_file` nel file di configurazione (o
   `SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`).
3. Lo standard input, quando viene passato `--stdin-registration-token`.
4. La variabile d'ambiente `SEMAPHORE_RUNNER_REGISTRATION_TOKEN`.

Un file di token che esiste ma è vuoto genera un errore. Se nessuna fonte fornisce un
token, la registrazione viene tentata senza e il server la rifiuta.

## Avviare un runner (`runner start`) {#starting-a-runner-runner-start}

Avvia il runner, si connette al server e inizia ad accettare task. È
il comando da eseguire per mantenere online un runner registrato.

```bash
semaphore runner start --config /path/to/config.runner.json
```

| Flag | Descrizione |
|------|-------------|
| `--auto-register` | Registra il runner prima di avviarlo se non è già registrato (ovvero se la configurazione non contiene un token del runner). |
| `--register` | Alias di `--auto-register`. |

Con `--auto-register`, se la configurazione non contiene alcun `token`, Semaphore legge il
token di registrazione da `registration_token_file` (o
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN_FILE`) oppure da
`SEMAPHORE_RUNNER_REGISTRATION_TOKEN`, quindi ritenta la registrazione ogni 5
secondi finché non riesce, ricarica la configurazione e si avvia. È
comodo per i runner che si registrano da soli al primo avvio, ad esempio nei
container.

`runner start` non accetta `--registration-token-file` né
`--stdin-registration-token`; questi flag appartengono solo a `runner register`.

## Deregistrare un runner (`runner unregister`) {#unregistering-a-runner-runner-unregister}

Rimuove la registrazione del runner dal server, usando il token del runner presente nel
file di configurazione.

```bash
semaphore runner unregister --config /path/to/config.runner.json
```
