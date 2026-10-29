---
title: Client
description: Gestire un server Semaphore dal terminale e dagli script con semaphore client - login e contesti, precedenza della configurazione, formati di output, codici di uscita ed esecuzione di task dalla CI.
---

# Client

`semaphore client` controlla un server Semaphore in esecuzione tramite la sua API REST. Gli
servono solo l'URL del server e un token API — nessun accesso al database e nessun file di
configurazione del server — quindi funziona da un portatile, da un job di CI o da un host che
non ha mai visto il `config.json` del server.

```bash
semaphore client --help
```

I comandi seguono la forma `semaphore client <resource> <action> [id|name]`.
Le risorse hanno un nome al singolare, con il plurale come alias
(`template list` e `templates list` sono la stessa cosa). Ogni risorsa ha `list`,
`get`, `create`, `update` e `delete`; i task aggiungono `run`, `logs`, `wait`, `stop`
e simili. L'elenco completo, generato automaticamente, di tutti i comandi e i flag si trova nel
[Riferimento dei comandi](/reference/cli/commands#semaphore-client).

| Gruppo | Scopo |
|-------|---------|
| [`auth`](/reference/cli/commands#semaphore-client-auth) | Effettua il login, verifica il token, lo stampa, effettua il logout. |
| [`context`](/reference/cli/commands#semaphore-client-context) | Mantiene più server in un unico file di configurazione e permette di passare dall'uno all'altro. |
| [`project`](/reference/cli/commands#semaphore-client-project) | Progetti, i loro membri, backup e ripristini. |
| [`template`](/reference/cli/commands#semaphore-client-template) | Modelli di task e `template run` per avviare un task. |
| [`task`](/reference/cli/commands#semaphore-client-task) | Log, attesa, arresto, conferma e riesecuzione dei task. |
| [`inventory`](/reference/cli/commands#semaphore-client-inventory), [`environment`](/reference/cli/commands#semaphore-client-environment), [`key`](/reference/cli/commands#semaphore-client-key), [`repository`](/reference/cli/commands#semaphore-client-repository), [`schedule`](/reference/cli/commands#semaphore-client-schedule), [`view`](/reference/cli/commands#semaphore-client-view) | Le altre risorse di un progetto. |
| [`user`](/reference/cli/commands#semaphore-client-user), [`runner`](/reference/cli/commands#semaphore-client-runner) | Risorse a livello di server (solo amministratori). |
| [`info`](/reference/cli/commands#semaphore-client-info) | Versione e impostazioni del server. |

## Primo login {#first-login}

In modalità interattiva il client chiede il login, la password e, quando il TOTP è
abilitato, il codice, poi crea un token API e lo salva. La password viene usata
una sola volta e non viene mai memorizzata.

```bash
semaphore client auth login --url https://semaphore.example.com
```

Con un token esistente (è anche il modo per accedere a un server che offre solo il
single sign-on — creare il token nella pagina **Tokens** del proprio profilo):

```bash
echo "$TOKEN" | semaphore client auth login --url https://semaphore.example.com --with-token
```

Entrambe le forme salvano un *contesto* con il nome dell'host del server in
`~/.semaphore/client.yml` e lo rendono quello corrente. Per verificare quale è in uso,
eseguire `semaphore client auth status`.

## Configurazione {#configuration}

Ogni impostazione può provenire da un flag, da una variabile d'ambiente o dal contesto
corrente, con questo ordine di precedenza: **flag > ambiente > contesto > predefinito**.

| Flag | Variabile d'ambiente | Significato |
|------|----------------------|---------|
| `--url` | `SEMAPHORE_CLIENT_URL` | URL del server, ad esempio `https://semaphore.example.com`. |
| `--context` | `SEMAPHORE_CLIENT_CONTEXT` | Nome del contesto da usare al posto di quello corrente. |
| — | `SEMAPHORE_CLIENT_TOKEN` | Token API. Il flag `--token` volutamente non esiste: gli argomenti di un processo sono visibili in `ps` e nella cronologia della shell. |
| — | `SEMAPHORE_CLIENT_TOKEN_FILE` | File che contiene il token (un a capo finale viene ignorato). |
| `-p`, `--project` | `SEMAPHORE_CLIENT_PROJECT` | Id o nome del progetto per i comandi relativi a un progetto. |
| `-o`, `--output` | `SEMAPHORE_CLIENT_OUTPUT` | `table` (predefinito), `json` o `yaml`. |
| `--timeout` | `SEMAPHORE_CLIENT_TIMEOUT` | Timeout di una singola richiesta HTTP, predefinito `30s`. |
| `--ca-cert` | `SEMAPHORE_CLIENT_CA_CERT` | File PEM con la CA che ha firmato il certificato del server. |
| `--insecure` | `SEMAPHORE_CLIENT_INSECURE` | Salta la verifica TLS. Ogni chiamata stampa un avviso; preferire `--ca-cert`. |
| `--no-input` | `SEMAPHORE_CLIENT_NO_INPUT`, `CI` | Non chiede mai nulla; un comando che richiederebbe una risposta fallisce. |
| `--debug` | `SEMAPHORE_CLIENT_DEBUG` | Traccia le richieste HTTP su stderr. Le intestazioni di autorizzazione e dei cookie vengono mascherate. |
| — | `SEMAPHORE_CLIENT_CONFIG` | Percorso del file di configurazione, predefinito `~/.semaphore/client.yml`. |

Un token proveniente dall'ambiente viene usato solo quando anche l'URL proviene
dall'ambiente o da un flag. In questo modo un token di CI non viene inviato a un altro
server quando qualcuno esegue lo stesso job con `--context other`.

### Il file di configurazione {#the-configuration-file}

`~/.semaphore/client.yml` contiene i contesti con nome. `auth login` e `context set`
lo scrivono; è possibile anche modificarlo a mano.

```yaml
current_context: prod
contexts:
  prod:
    url: https://semaphore.example.com
    token: 8s3k...            # oppure token_file
    project: 3                # progetto predefinito, id o nome
  staging:
    url: https://staging.example.com
    token_file: ~/.semaphore/staging.token
    ca_cert: ~/.semaphore/staging-ca.pem
defaults:
  output: table
  timeout: 30s
```

Il client crea la directory con permessi `0700` e il file con `0600`. Un
file scrivibile dal gruppo o da altri utenti viene rifiutato con il suggerimento di eseguire
`chmod 600`; un file leggibile da altri utenti produce un avviso.

## Output {#output}

I dati vanno su stdout; messaggi, avvisi e avanzamento vanno su stderr, così uno script
può catturare gli uni senza gli altri.

| Flag | Effetto |
|------|--------|
| `-o json` | JSON valido senza decorazioni. Un elenco è sempre un array, un elenco vuoto è `[]`. I nomi dei campi sono quelli dell'API. |
| `-o yaml` | Gli stessi dati in formato YAML. |
| `--fields id,name,status` | Solo queste colonne o questi campi. I campi annidati usano un punto: `--fields id,params.limit`. |
| `-q`, `--quiet` | Solo gli id, uno per riga — per `xargs` e i cicli. |
| `--no-headers` | Tabella senza la riga di intestazione. |
| `--no-color` | Nessun colore. I colori sono disattivati anche quando stdout non è un terminale o quando è impostata `NO_COLOR`. |

Quando stdout non è un terminale, le colonne della tabella sono separate da una tabulazione e non vengono mai
troncate.

Gli oggetti si indicano tramite id numerico o tramite nome. Il nome viene cercato nel
progetto senza distinzione tra maiuscole e minuscole; quando più oggetti hanno lo stesso nome, il comando termina
con codice 5 ed elenca i candidati su stderr.

## Codici di uscita {#exit-codes}

| Codice | Significato |
|------|---------|
| `0` | Successo. Per un comando in attesa: il task è terminato con `success`. |
| `1` | Errore del client o dell'API — guasto di rete, errore del server, risposta inattesa. |
| `2` | Errore di utilizzo: flag sconosciuto, argomento mancante, nessun progetto indicato, oppure conferma richiesta senza un terminale (passare `--yes`). |
| `3` | Il task atteso è terminato con stato `error`. |
| `4` | Autenticazione non riuscita (HTTP 401 o 403). |
| `5` | Oggetto non trovato, oppure nome che corrisponde a più oggetti. |
| `6` | Il task atteso è terminato con stato `stopped`. |
| `124` | È scaduto `--wait-timeout`. Il task continua a essere eseguito sul server. |
| `130` | Interrotto con Ctrl+C. Il client si disconnette; il task continua a essere eseguito, a meno che non sia stato indicato `--stop-on-interrupt`. |

## Eseguire task dagli script {#running-tasks-from-scripts}

Configurare un job di CI interamente tramite l'ambiente e lasciare che sia il codice di uscita
a decidere l'esito:

```bash
export SEMAPHORE_CLIENT_URL=https://semaphore.example.com
export SEMAPHORE_CLIENT_TOKEN_FILE=/run/secrets/semaphore-token
export SEMAPHORE_CLIENT_PROJECT=infra

# Avvia un task, ne trasmette il log e termina con 0/3/6 in base allo stato finale
semaphore client template run deploy --follow --wait-timeout 30m \
    --branch "$CI_COMMIT_REF_NAME" --var version="$CI_COMMIT_TAG"

# Avvia ora, attendi più tardi
id=$(semaphore client template run deploy -q)
semaphore client task wait "$id" --wait-timeout 1h
semaphore client task logs "$id" --raw > deploy.log
```

`--var k=v` e `--extra-vars-file` valorizzano le variabili extra del task;
`--inventory`, `--branch`, `--limit`, `--tags`, `--check` e `--diff` sovrascrivono
ciò che il modello consente di sovrascrivere. Un modello che richiede conferma
lascia il task in `waiting_confirmation`; `task confirm <id>` gli permette di proseguire.

Combinare `-o json` con `jq` per tutto ciò che la tabella non mostra:

```bash
semaphore client task list -o json | jq '.[] | select(.status == "error") | .id'
```

## Segreti e token {#secrets-and-tokens}

- Il token non viene mai stampato, tranne che da `auth token`, che esiste per passarlo a
  un altro strumento e mostra un avviso quando stdout è un terminale.
- Password e materiale delle chiavi vengono letti solo da file o da stdin:
  `key create --ssh-key-file`, `--password-file`, `--password-stdin`,
  `user create --password-stdin`. I segreti degli ambienti passano per
  `environment create --secrets-file`.
- `environment get` e `key get` mostrano i nomi dei segreti, mai i valori,
  in qualsiasi formato di output.
- `auth logout --revoke` elimina il token sul server oltre che in locale.
- I comandi distruttivi chiedono conferma in un terminale e richiedono `--yes`
  quando il terminale non c'è; `project delete` richiede il nome del progetto con `--confirm`.
