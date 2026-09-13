# CLI

Il binario `semaphore` è al tempo stesso il server e uno strumento di amministrazione completo. Eseguirlo
senza argomenti (oppure `semaphore help`) per elencare tutti i comandi:

```bash
semaphore help
```

Per l'elenco completo e generato di tutti i comandi e le opzioni, vedere il
[riferimento dei comandi](/reference/cli/commands). La maggior parte delle attività
amministrative dispone di un gruppo di comandi dedicato:

| Gruppo di comandi | Scopo |
|---------------|---------|
| [`semaphore users`](/reference/cli/users) | Aggiungere, modificare, rimuovere e ispezionare utenti; gestire token API e TOTP (2FA). |
| [`semaphore projects`](/reference/cli/projects) | Esportare e importare progetti (backup). |
| [`semaphore vaults`](/reference/cli/vaults) | Ricifrare i segreti memorizzati e ispezionare l'uso delle chiavi di cifratura. |
| [`semaphore runner`](/reference/cli/runners) | Eseguire in modalità runner e registrare/deregistrare i runner. |
| [`semaphore migrate`](/reference/cli/migrations) | Applicare o annullare le migrazioni del database. |

Diversi gruppi di comandi hanno alias più brevi: `users`/`user`, `projects`/`project`,
`vaults`/`vault` e `server`/`service`.

:::info
Ogni comando che accede al database (`users`, `projects`, `vaults`, `migrate`,
`server`) applica le migrazioni dello schema in sospeso prima di essere eseguito. Effettuare un
backup del database prima di eseguire la CLI di una versione più recente di Semaphore su un
database esistente.
:::

## Opzioni globali {#global-options}

Questi flag sono accettati da tutti i comandi:

| Opzione | Descrizione |
|--------|-------------|
| `--config <path>` | Percorso del file di configurazione. |
| `--no-config` | Non leggere alcun file di configurazione: usare solo le variabili d'ambiente. |
| `--log-level <level>` | Livello di dettaglio dei log: `DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL` o `PANIC`. In assenza, viene usata la variabile d'ambiente `SEMAPHORE_LOG_LEVEL`. |
| `--debug-filter <spec>` | Restringe l'output `DEBUG` a namespace specifici, ad esempio `'runner,task_*'` o `'*,-db'`. Ha effetto solo quando il livello di log è `DEBUG`. In assenza, viene usata `SEMAPHORE_DEBUG_FILTER`. |

### Come viene individuato il file di configurazione {#how-the-configuration-file-is-found}

Quando `--config` viene omesso, Semaphore cerca il file in quest'ordine e usa
il primo che esiste:

1. Il percorso nella variabile d'ambiente `SEMAPHORE_CONFIG_PATH`.
2. `config.json`, `config.yaml` o `config.yml` nella directory corrente.
3. `/usr/local/etc/semaphore/config.json` (oppure `.yaml` / `.yml`).
4. `/etc/semaphore/config.json` (oppure `.yaml` / `.yml`).

Le variabili d'ambiente vengono applicate sopra il file, quindi sovrascrivono i valori
del file. Con `--no-config` vengono usati solo le variabili d'ambiente e i valori predefiniti. Consultare
[Configurazione](/admin-guide/configuration) per l'elenco completo delle opzioni.

## Versione {#version}

Stampa la versione corrente.

```bash
semaphore version
```

## Configurazione interattiva {#interactive-setup}

Da usare per la configurazione iniziale. Genera i segreti, guida attraverso un
questionario interattivo, scrive il file di configurazione, esegue le migrazioni
del database e crea il primo utente amministratore.

```bash
semaphore setup
```

Passare `--config <path>` per scegliere dove scrivere il file di configurazione.
In assenza, il setup chiede una directory di output (predefinita: la directory
corrente) e vi scrive `config.json`.

Se il nome utente o l'email inseriti esistono già, il setup mantiene l'utente
esistente invece di crearne uno nuovo.

Al termine stampa i comandi per avviare il server, ad esempio:

```bash
./semaphore server --config /path/to/config.json
```

## Modalità server {#server-mode}

Avvia il server Semaphore (interfaccia web e API). `service` è un alias di `server`.

```bash
semaphore server --config /path/to/config.json
```

All'avvio il server applica le migrazioni del database in sospeso e stampa il
database, il percorso temporaneo, l'interfaccia e la porta in uso.

## Modalità runner {#runner-mode}

Esegue Semaphore come runner di task. Consultare [Runner](/reference/cli/runners) per
l'insieme completo dei sottocomandi (`setup`, `register`, `start`, `unregister`).

```bash
semaphore runner start --config /path/to/runner-config.json
```

## Migrazione del database {#database-migration}

Aggiorna lo schema del database. Consultare
[Migrazioni del database](/reference/cli/migrations) per applicare o annullare le migrazioni
fino a una versione specifica.

```bash
semaphore migrate --config /path/to/config.json
```
