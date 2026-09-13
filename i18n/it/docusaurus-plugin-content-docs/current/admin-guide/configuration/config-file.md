
# File di configurazione

## Creazione del file di configurazione {#creating-configuration-file}

Semaphore usa un file `config.json` per la sua configurazione principale. È possibile generare questo file in modo interattivo con gli strumenti integrati oppure tramite un configuratore web.

### Generazione tramite CLI {#generate-via-cli}

Usare i seguenti comandi per generare il file di configurazione in modo interattivo:

* Per il server Semaphore:
  ```
  semaphore setup
  ```
* Per il runner Semaphore:
  ```
  semaphore runner setup
  ```
  
  :::tip
    Per maggiori dettagli sulla configurazione dei runner, consultare la sezione <a href="./../runners">Runner</a>.
  :::

### Generazione sul sito web {#generate-on-the-website}

In alternativa, è possibile usare il configuratore interattivo web:
* [Configuratore del server](https://semaphoreui.com/install/binary/2_13/config)
* [Configuratore del runner](https://semaphoreui.com/install/binary/2_13/runner)

## Esempio di file di configurazione {#configuration-file-example}

Semaphore usa un file di configurazione `config.json` con il seguente contenuto:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Uso del file di configurazione {#configuration-file-usage}

* Per il server Semaphore:

```bash
semaphore server --config ./config.json
```

* Per il runner Semaphore:

```bash
semaphore runner start --config ./config.json
```

## Directory dei segreti {#secrets-directory}

Semaphore legge i file di segreti (ad esempio le [voci del Key Store basate su file](/user-guide/key-store/env-and-file-sources) oppure i token di HashiCorp Vault e OpenBao letti da disco) solo da una directory configurabile.

| Opzione | Variabile d'ambiente | Descrizione |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Directory per i file di segreti. Predefinita: `/tmp/semaphore`. |
| `secrets_path` (legacy) | `SEMAPHORE_SECRETS_PATH` | Impostazione di primo livello mantenuta per retrocompatibilità. Usata solo quando `dirs.secrets` non è impostata o ha ancora il percorso predefinito. |

**Precedenza**: un valore non predefinito di `dirs.secrets` prevale sul legacy `secrets_path`. Quando si imposta `SEMAPHORE_SECRETS_PATH`, Semaphore lo applica a entrambi i campi.

Esempio con il layout attuale:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Le installazioni legacy possono ancora usare:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

I file di chiave selezionati nella scheda **File** del modulo del Key Store e i file di token referenziati dagli storage di segreti esterni devono trovarsi all'interno di questa directory. I percorsi al di fuori di essa vengono rifiutati con `file path must be inside secrets path`. Consultare [Chiavi da variabili d'ambiente e file](/user-guide/key-store/env-and-file-sources).

## Operazioni Git {#git-operations}

Semaphore clona e aggiorna i repository dei task prima di ogni esecuzione. Due opzioni controllano questo comportamento:

| Opzione | Variabile d'ambiente | Descrizione |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Implementazione del client Git: `cmd_git` (predefinita, usa il binario `git` di sistema) oppure `go_git` (client in puro Go). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Numero di tentativi delle operazioni di clone e pull prima che il task fallisca. Predefinito: `4`. Impostare a `1` per un solo tentativo senza ripetizioni. |

Quando un clone o un pull fallisce e restano tentativi disponibili, Semaphore attende con backoff esponenziale (a partire da 1 secondo, raddoppiando a ogni tentativo, fino a un massimo di 60 secondi) e registra un messaggio come `Git pull failed (...), retrying in 2s`. I tentativi ripetuti si applicano solo alle operazioni di rete; un checkout fallito o un errore di autenticazione fanno comunque fallire il task una volta esauriti tutti i tentativi.

Se il server git è saltuariamente non disponibile, aumentare `git_attempts`. Se i fallimenti sono immediati e persistenti (credenziali errate, repository mancante), correggere il problema di fondo: i tentativi ripetuti non saranno d'aiuto.

