# Runner

I runner permettono di eseguire le attività su un server separato da Semaphore UI.

I runner di Semaphore funzionano secondo lo stesso principio dei runner di GitLab o GitHub Actions:

- Si avvia un runner su un server separato, specificando l'indirizzo del server Semaphore e un token di autenticazione.
- Il runner si connette a Semaphore e segnala la propria disponibilità ad accettare attività.
- Quando compare una nuova attività, Semaphore fornisce al runner tutte le informazioni necessarie; il runner, a sua volta, clona il repository ed esegue Ansible, Terraform, PowerShell, ecc.
- Il runner invia i risultati dell'esecuzione dell'attività a Semaphore.

Per gli utenti finali, lavorare con Semaphore con o senza runner è del tutto identico.

Quando non è definito alcun runner, il server Semaphore UI stesso agisce da runner. Tutte le attività vengono eseguite nel contesto del server Semaphore UI, con accesso al file system.

L'utilizzo dei runner offre i seguenti vantaggi:
- Esecuzione delle attività in modo più sicuro. Ad esempio, un runner può trovarsi all'interno di una sottorete chiusa o di un container Docker isolato.
- Distribuzione del carico di lavoro su più server. È possibile avviare più runner e le attività verranno distribuite casualmente tra di essi.

## Configurazione {#set-up}

### Configurazione del server {#set-up-a-server}

Per configurare il server per l'utilizzo dei runner, aggiungere la seguente opzione alla configurazione del server Semaphore:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

oppure tramite variabili d'ambiente:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Configurazione di un runner {#setup-a-runner}

Per configurare il runner, utilizzare il seguente comando:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

Questo comando crea un file di configurazione in `/path/to/your/config/file.json`.

Prima di utilizzare questo comando, tuttavia, è necessario capire come i runner vengono registrati sul server.

### Registrazione del runner sul server {#registering-the-runner-on-the-server}

Esistono due modi per registrare un runner sul server Semaphore:
1) Aggiungerlo tramite l'interfaccia web o l'API.
2) Utilizzare la riga di comando con il comando `semaphore runner register`.

#### Aggiunta del runner tramite l'interfaccia web {#adding-the-runner-via-the-web-ui}

![Immagine del runner](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Registrazione tramite CLI {#registering-via-cli}

Per registrare un runner in questo modo, è necessario aggiungere l'opzione `runner_registration_token` al file di configurazione del server Semaphore. Questa opzione deve essere impostata a una stringa arbitraria. Scegliere una stringa sufficientemente complessa per evitare problemi di sicurezza.

Quando il comando `semaphore runner setup` chiede se si dispone di un token del runner, rispondere No. Quindi utilizzare il seguente comando per registrare il runner:

`semaphore runner register --config /path/to/your/config/file.json`

oppure

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### File di configurazione {#configuration-file}

Come risultato dell'esecuzione del comando `semaphore runner setup`, viene creato un file di configurazione simile al seguente:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

È possibile modificare manualmente questo file senza dover richiamare nuovamente `semaphore runner setup`.

Per registrare nuovamente il runner, è possibile utilizzare il comando `semaphore runner register`. Questo sovrascrive il token nel file specificato nella configurazione.

## Avvio del runner {#running-the-runner}

Ora è possibile avviare il runner con il comando:

```
semaphore runner start --config /path/to/your/config/file.json
```

Il runner è pronto per eseguire le attività.

### Esecuzione del runner in Docker {#running-the-runner-in-docker}

L'immagine `semaphoreui/runner` avvia automaticamente il runner. Passare l'URL del server e il token di registrazione tramite variabili d'ambiente:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Se i playbook richiedono pacchetti Python aggiuntivi, montare un file `requirements.txt` in `/etc/semaphore/requirements.txt`. Il container lo installa con `pip3` a ogni avvio, prima che il runner si connetta al server:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

Vedere [Installazione di dipendenze Python aggiuntive](/admin-guide/installation/docker#installing-additional-python-dependencies) per i dettagli su dove vengono installati i pacchetti e su come vengono gestiti gli errori.

### Intervallo di polling (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Ogni runner interroga il server Semaphore a intervalli fissi per ottenere nuovi job e per
segnalare l'avanzamento delle attività. Configurarlo nel file di configurazione del runner:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

Oppure con una variabile d'ambiente:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Valore | Effetto |
|-------|--------|
| **1** (predefinito) | I job vengono presi in carico entro circa un secondo; ideale per esecuzioni a bassa latenza. |
| **Più alto** (ad es. 5–30) | Riduce il traffico HTTP quando si utilizzano molti runner con un unico server. I job potrebbero avviarsi leggermente più tardi. |

La pagina Runner in Semaphore UI espone questa opzione in **Opzioni avanzate** durante la
generazione degli snippet di configurazione (file di configurazione, Docker ed esempi con variabili d'ambiente).

I valori non validi o pari a zero ricadono sul valore predefinito di 1 secondo.

### Tag dei runner (Pro) {#runner-tags-pro}

È possibile assegnare uno o più tag a un runner di progetto. I template possono quindi richiedere un tag, in modo che le attività vengano eseguite solo sui runner corrispondenti. Configurare i tag durante l'aggiunta di un runner nell'interfaccia del progetto e impostare il tag richiesto nelle impostazioni del template.

## Rimozione della registrazione del runner {#runner-deregistration}

È possibile rimuovere un runner tramite l'interfaccia web.

![Immagine del runner](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

Oppure rimuovere la registrazione del runner tramite CLI:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Sicurezza {#security}

I runner si autenticano presso il server con un bearer token opaco
(`X-Runner-Token`), rilasciato al momento della registrazione. Proteggere questo token come qualsiasi altra
credenziale: conservarlo in un file di configurazione con accesso limitato o in un gestore di segreti.

:::warning
Utilizzare HTTPS per la comunicazione tra il server e il runner, soprattutto quando
non si trovano sulla stessa rete privata. Per certificati autofirmati o emessi da una CA interna,
configurare `runner.connection.server_ca_cert_file` sul runner.
Non utilizzare `runner.connection.skip_tls_verify` in produzione.
:::
