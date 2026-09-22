# Variabili d'ambiente

Tramite le variabili d'ambiente è possibile sovrascrivere qualsiasi opzione di configurazione disponibile.

È disponibile un generatore interattivo di variabili d'ambiente (per Docker):
* per il [server](https://semaphoreui.com/install/docker/2_12/)
* per il [runner](https://semaphoreui.com/install/docker/2_12/runner).

---

## Ambiente applicativo per le app (Ansible, Terraform, ecc.) {#application-environment-for-apps-ansible-terraform-etc}

Semaphore può passare variabili d'ambiente ai processi delle applicazioni (Ansible, Terraform/OpenTofu, Python, PowerShell, ecc.). Esistono due opzioni correlate:

- `env_vars` / `SEMAPHORE_ENV_VARS`: coppie chiave-valore statiche che verranno impostate per i processi delle app.
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`: un elenco di nomi di variabili che il server inoltrerà dal proprio ambiente di processo.

Esempio di file di configurazione:

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

Equivalente con variabili d'ambiente:

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

Note:
- L'inoltro è esplicito: solo le variabili elencate in `forwarded_env_vars` vengono ereditate dai processi delle app.
- I segreti dovrebbero essere forniti in modo sicuro (ad esempio tramite i secret di Docker/Kubernetes) e poi inoltrati con `forwarded_env_vars`.
- La stessa lista vale per i processi `git` che clonano e aggiornano i repository: tutto ciò che `git` richiede dall'ambiente dell'host deve quindi essere inoltrato allo stesso modo.

---

## Esecuzione dietro un proxy aziendale {#running-behind-a-corporate-proxy}

Semaphore non trasmette l'intero ambiente ai processi che avvia. In particolare, le variabili di proxy raggiungono un task o un clone `git` solo se sono elencate in `forwarded_env_vars` oppure impostate in `env_vars`.

Questo conta soprattutto per un'installazione da pacchetto (systemd). Le variabili di proxy impostate nel file di unit valgono per il server Semaphore stesso, ma non per `git`:

```ini
[Service]
Environment="HTTPS_PROXY=http://proxy.internal:3128"
Environment="HTTP_PROXY=http://proxy.internal:3128"
Environment="NO_PROXY=.corp.example.com"
```

Con la configurazione qui sopra e nient'altro, la clonazione di un repository fallisce con:

```
fatal: Authentication failed for 'https://git.corp.example.com/team/_git/infra'
```

`git` non ha mai visto `NO_PROXY`, quindi ha inviato la richiesta per l'host interno attraverso il proxy esterno, che l'ha rifiutata. Inoltra esplicitamente le tre variabili per risolvere il problema:

```json
{
  "forwarded_env_vars": ["HTTP_PROXY", "HTTPS_PROXY", "NO_PROXY"]
}
```

Oppure, come variabile d'ambiente:

```bash
export SEMAPHORE_FORWARDED_ENV_VARS='["HTTP_PROXY","HTTPS_PROXY","NO_PROXY"]'
```

Note:
- Inoltra `NO_PROXY` insieme alle variabili di proxy. Senza di essa anche il traffico verso i server Git interni viene instradato attraverso il proxy.
- Molti strumenti leggono le forme minuscole (`http_proxy`, `https_proxy`, `no_proxy`). Su Linux e macOS i nomi delle variabili distinguono maiuscole e minuscole, quindi elenca entrambe le forme se il tuo ambiente le imposta in minuscolo.
- I bundle di CA personalizzati funzionano allo stesso modo. Se il proxy termina il TLS, inoltra `GIT_SSL_CAINFO`, `SSL_CERT_FILE` o `REQUESTS_CA_BUNDLE` secondo necessità, invece di disattivare la verifica dei certificati.
- Nelle installazioni Docker di solito sembra funzionare da sé, perché le variabili di proxy sono impostate per l'intero container. È comunque consigliabile inoltrarle esplicitamente, così la stessa configurazione si comporta in modo identico in entrambi i casi.

---

## Configurazione dell'executor del runner {#runner-executor-configuration}

Nelle installazioni con runner, l'intero blocco executor può essere impostato con una singola variabile d'ambiente JSON invece che con le singole chiavi:

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

Equivale a impostare `runner.executor.type` e i campi annidati `runner.executor.docker.*` nel file di configurazione. Consultare [Opzioni di configurazione](/admin-guide/configuration) per tutte le impostazioni dell'executor del runner.

---

## Variabili d'ambiente segrete nei Gruppi di variabili {#secret-environment-variables-in-variable-groups}

Oltre alle variabili d'ambiente globali, è possibile definire segreti per progetto nei Gruppi di variabili. Le chiavi segrete vengono mascherate nell'interfaccia e nei log. Consultare `User Guide → Variable Groups` per l'uso e per l'integrazione con Terraform tramite le variabili `TF_VAR_*`.
