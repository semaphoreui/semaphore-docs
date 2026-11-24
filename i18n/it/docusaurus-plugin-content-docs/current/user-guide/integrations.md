# Integrazioni

Un'integrazione avvia un Task Template quando un servizio esterno chiama un URL di Semaphore. Il chiamante può essere GitHub, GitLab, Bitbucket, un sistema di monitoraggio o qualsiasi programma in grado di inviare una richiesta HTTP. La richiesta non si limita a far partire l'esecuzione: alcune sue parti — il nome di un branch, un commit, un tag di release — possono essere portate nel Task come variabili.

![Elenco delle integrazioni](/assets/integrations-list.webp)

Ogni integrazione è composta da quattro parti:

| Parte | Risponde alla domanda |
|---|---|
| **Alias** | Quale URL chiama il mittente? |
| **Metodo di autenticazione** | Questa richiesta è autorizzata ad avviare qualcosa? |
| **Matcher** | È *questa* la richiesta che l'integrazione sta attendendo? |
| **Extractor di valori** | Quali campi della richiesta arrivano al Task, e come? |

Per crearne una, apri **Integrations** nel menu del Project e premi **New Integration**: assegna un nome, scegli il Task Template che esegue e il metodo di autenticazione. Poi premi l'integrazione nell'elenco per configurarne alias, matcher ed extractor di valori.

![Dettagli di un'integrazione](/assets/integration-detail.webp)

## Come viene gestita una chiamata {#how-a-call-is-handled}

1. Il mittente chiama `/api/integrations/<alias>` con `GET` o `POST`.
2. Semaphore risolve l'alias nelle integrazioni che può avviare. L'endpoint è pubblico: lo proteggono soltanto l'alias e il metodo di autenticazione.
3. Ognuna di quelle integrazioni verifica la richiesta con il proprio **metodo di autenticazione**. Una richiesta che non supera il controllo non avvia nulla.
4. Se la chiamata è arrivata da un **alias di Project**, vengono valutati i **matcher** dell'integrazione. Devono corrispondere tutti, altrimenti l'integrazione viene saltata.
5. Vengono eseguiti gli **extractor di valori**, che trasformano parti della richiesta in variabili e parametri del Task.
6. Il Task viene creato e messo in coda, esattamente come se qualcuno avesse avviato il Template a mano.

Una chiamata elaborata riceve `204 No Content` con corpo vuoto, sia che qualcosa sia partito sia che no. Ciò che è partito viene riportato negli header della risposta:

| Header della risposta | Valore |
|---|---|
| `X-Semaphore-Task-ID` | Il Task creato |
| `X-Semaphore-Template-ID` | Il Template che esegue |
| `X-Semaphore-Project-ID` | Il Project a cui appartiene il Task |
| `X-Semaphore-Integration-ID` | L'integrazione che l'ha avviato |
| `X-Semaphore-Inventory-ID` | L'Inventory del Task, quando ne ha uno |

Ogni chiamata a un alias noto viene inoltre scritta nella [cronologia delle chiamate](#call-history), il posto da guardare quando un webhook non fa quello che ti aspetti.

## Alias {#aliases}

Un alias è la parte casuale e non indovinabile dell'URL del webhook: `/api/integrations/<random_string>`. Accetta `GET` e `POST`. Ne esistono due tipi e un'integrazione ne usa uno solo per volta.

Un **alias di Project** si crea con **Add Alias** sopra l'elenco delle integrazioni ed è condiviso da tutte le integrazioni del Project che hanno l'interruttore **Use project alias** attivo. Una richiesta in arrivo viene proposta a tutte, e ciascuna decide in base ai propri matcher se eseguirsi. È l'alias da consegnare una volta a GitHub o GitLab, smistando poi gli eventi con i matcher.

Un **alias di integrazione** si crea con **Add Alias** nella pagina dell'integrazione stessa e appartiene solo a quella. Una chiamata la avvia subito: **i matcher non vengono valutati affatto**. Usalo quando il mittente è dedicato a un unico compito, o quando il corpo è in un formato che i matcher non sanno esaminare.

:::warning
L'interruttore **Use project alias** nella pagina dell'integrazione decide quale tipo di alias funziona. Mentre è attivo, l'integrazione risponde all'alias di Project e i suoi alias propri vengono ignorati; mentre è disattivo, l'alias di Project non raggiunge mai l'integrazione e i suoi matcher non vengono mai usati.
:::

Un Project può avere più alias di entrambi i tipi. Eliminarne uno con l'icona del cestino accanto lo ferma immediatamente, mentre le chiamate già ricevute restano nella cronologia.

## Autenticazione {#authentication}

L'endpoint del webhook non è protetto da un login, quindi è il metodo di autenticazione a impedire a estranei di avviare i tuoi Task. Scegli il metodo nel form dell'integrazione; **Auth secret** è una chiave del [Key Store](/user-guide/key-store).

| Metodo di autenticazione | Che cosa verifica Semaphore | Auth secret |
|---|---|---|
| **None** | Niente: chi scopre l'URL può avviare il Template | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` è uguale a `sha256=` più l'HMAC-SHA256 del corpo | Stringa, oppure la password di una chiave login/password |
| **Bitbucket Webhooks** | `X-Hub-Signature` allo stesso modo | Stringa, oppure la password di una chiave login/password |
| **Token** | L'header indicato in **Auth header** è uguale al segreto | Stringa, oppure la password di una chiave login/password |
| **HMAC** | L'header indicato in **Auth header** contiene l'HMAC-SHA256 del corpo | Stringa, oppure la password di una chiave login/password |
| **HMAC (SHA-512)** | Lo stesso con HMAC-SHA512 | Stringa, oppure la password di una chiave login/password |
| **BasicAuth** | L'header `Authorization` porta login *e* password | Solo una chiave login/password |

Una chiave di tipo **Stringa** usa il proprio valore come segreto condiviso; una chiave login/password usa la propria password, e solo BasicAuth confronta anche il login. Una chiave di un tipo che il metodo non può usare fa rifiutare la richiesta, invece di ignorare la discrepanza.

### Autenticazione HMAC {#hmac-authentication}

I metodi di autenticazione HMAC (`hmac` / SHA-256 e `hmac-sha512` / SHA-512) verificano che il corpo del webhook sia stato firmato con un segreto condiviso.

Configura:

1. **Auth header** — l'header della richiesta che porta la firma (per esempio `X-Signature` o `X-Hub-Signature-256`).
2. **Auth secret** — una chiave **Stringa** del Key Store (il segreto è il suo valore) oppure una credenziale login/password (il segreto è la sua **password**).

Il mittente deve mettere in quell'header un digest HMAC del corpo grezzo della richiesta in **esadecimale puro** (senza il prefisso `sha256=` / `sha512=`; i metodi GitHub e Bitbucket, al contrario, quel prefisso lo richiedono, i metodi HMAC no). Semaphore lo confronta con l'`HMAC-SHA256` o l'`HMAC-SHA512` del corpo calcolato con il segreto configurato.

Esempio (SHA-512) con OpenSSL:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Matcher {#matchers}

Un matcher è una condizione sulla richiesta in arrivo: *questo header è uguale a quello*, *questo campo JSON contiene quello*. I matcher sono ciò che permette a un solo alias di Project di servire molte integrazioni: GitHub invia ogni evento allo stesso URL e i matcher decidono quale integrazione reagisce a quale evento.

Un matcher decide soltanto se l'integrazione viene eseguita. Non modifica mai il Task: a questo servono gli extractor.

I matcher vengono valutati **solo per le chiamate che arrivano da un alias di Project** (interruttore **Use project alias** attivo). Una chiamata all'alias proprio di un'integrazione la avvia senza guardarli.

### Campi di un matcher {#matcher-fields}

| Campo | Significato |
|---|---|
| **Name** | Un'etichetta per l'elenco. Testo libero, non usato nel confronto |
| **Match on** | **Body** o **Header**: da dove arriva il valore |
| **Body Data Format** | **JSON** o **String**, mostrato solo con **Body** |
| **Key** | Il nome dell'header, o il percorso di un campo nel corpo JSON |
| **Comparison Method** | `==`, `!=` o **Contains** |
| **Value** | Il testo con cui viene confrontato il valore della richiesta |

**Match on: Header** — **Key** è il nome di un header e le maiuscole non contano: `X-GitHub-Event` e `x-github-event` sono lo stesso header. Un header che la richiesta non porta si comporta come un valore mancante (vedi sotto). Quando un header compare più volte, viene confrontato solo il primo valore.

**Match on: Body, JSON** — **Key** è un percorso dentro il corpo analizzato, descritto nella sezione seguente. Un corpo che non è JSON valido restituisce un valore mancante per qualsiasi chiave.

**Match on: Body, String** — il valore è tutto il corpo grezzo e **Key** viene ignorato. Il form chiede comunque una chiave perché il campo è obbligatorio: scrivi un trattino. È l'unico modo per confrontare un corpo che non è JSON — abbinalo a **Contains**.

**Key** e **Value** sono entrambi obbligatori, quindi un matcher non può verificare un valore vuoto. Per reagire all'assenza di un campo, confrontalo con `!=` contro un valore che non assume mai.

### Chiavi JSON {#json-keys}

Una chiave è un percorso nel documento JSON. I livelli sono separati da punti e un elemento di un array si indica con il suo indice tra parentesi quadre, partendo da zero. Nei nomi le maiuscole contano.

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| Chiave | A cosa punta |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | L'intero array |
| `repository.url` | A niente: il campo non esiste |

La stessa sintassi è usata dal campo **Key** di un extractor di valori.

### Come un matcher confronta i valori {#how-a-matcher-compares-values}

Il valore preso dalla richiesta viene convertito in testo e confrontato con **Value** come testo, perciò il campo **Value** non ha mai bisogno di virgolette, parentesi o escape.

- **Le stringhe** si confrontano letteralmente, distinguendo maiuscole e minuscole: `Push` non corrisponde a `push`.
- **I numeri** si confrontano senza parte decimale quando non l'hanno: `42` nel corpo corrisponde al valore `42`, non a `42.0`. Un numero con decimali si confronta così come è scritto, quindi `1.5` corrisponde a `1.5`.
- **I booleani** corrispondono a `true` e `false`.
- **Un valore mancante** — un header assente, un percorso JSON che non esiste, un `null` o un corpo che non è JSON valido — viene confrontato come il testo letterale `<nil>`. Ne deriva una conseguenza da ricordare: `==` non può mai corrispondere a un campo mancante, mentre `!=` gli corrisponde sempre.
- **Oggetti e array** non hanno una forma testuale leggibile: non confrontarli. Punta invece la chiave su un campo scalare al loro interno.
- **Contains** è una semplice verifica di sottostringa, sensibile alle maiuscole, senza caratteri jolly né espressioni regolari.

### Più matcher {#several-matchers}

Un'integrazione può avere un numero qualsiasi di matcher e vengono combinati con **AND**: l'integrazione viene eseguita solo quando corrispondono tutti. Non c'è modo di esprimere un *oppure* all'interno di una sola integrazione — crea una seconda integrazione sullo stesso Template per la condizione alternativa.

:::warning
Un'integrazione che usa l'alias di Project e **non ha matcher** non parte mai, perché non c'è nulla che possa corrispondere. Dalle almeno un matcher, oppure disattiva **Use project alias** e chiama l'alias proprio dell'integrazione.
:::

### Esempi di matcher {#matcher-examples}

| Obiettivo | Match on | Formato | Key | Metodo | Value |
|---|---|---|---|---|---|
| Solo i push di GitHub | Header | — | `X-GitHub-Event` | `==` | `push` |
| Solo i push su `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| Qualsiasi branch tranne `main` | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| Solo i tag | Body | JSON | `ref` | Contains | `refs/tags/` |
| Solo le merge request GitLab unite | Body | JSON | `object_attributes.state` | `==` | `merged` |
| Ignorare i commit di un bot | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| Solo le release GitHub pubblicate | Body | JSON | `action` | `==` | `published` |
| Un avviso in testo semplice che parla di un disco | Body | String | `-` | Contains | `disk` |

Le prime due righe insieme sono la configurazione tipica di un'integrazione di deploy: il tipo di evento dall'header e il branch dal corpo, e devono corrispondere entrambi.

## Extractor di valori {#value-extractors}

Un extractor di valori copia un pezzo della richiesta in arrivo nel Task che sta per partire. È così che un webhook passa un branch, l'hash di un commit, un autore o la versione di una release all'automazione che innesca.

Gli extractor vengono eseguiti sempre, da qualunque tipo di alias sia arrivata la chiamata, e dopo che autenticazione e matcher sono stati superati.

### Campi di un extractor {#extractor-fields}

| Campo | Significato |
|---|---|
| **Name** | Un'etichetta per l'elenco. Testo libero |
| **Source of the Value** | **Body** o **Header** |
| **Data Type of Body** | **JSON** o **String**, mostrato solo con **Body** |
| **Key** | Il nome dell'header, o una [chiave JSON](#json-keys): la stessa sintassi dei matcher |
| **Variable Usage** | **Variables** o **Task Params**: dove viene consegnato il valore |
| **Variable** | Il nome che il valore assume nel Task |

Con **Body** e **String** tutto il corpo grezzo diventa il valore e **Key** viene ignorato, esattamente come in un matcher.

### Che cosa riceve la variabile {#what-the-variable-receives}

A differenza di un matcher, un extractor non converte nulla in testo: un valore JSON mantiene il proprio tipo, quindi un numero resta un numero e un oggetto resta un oggetto.

| Che cosa contiene la richiesta | Che cosa riceve la variabile |
|---|---|
| Un header | Il suo testo; una stringa vuota quando l'header manca |
| Una stringa, un numero o un booleano JSON | Lo stesso valore, con il suo tipo |
| Un oggetto o un array JSON | L'intero oggetto o array, con la struttura conservata |
| Un `null` JSON, un percorso che non esiste o un corpo che non è JSON valido | Niente: la variabile **non viene impostata affatto** e ciò che definisce il Template resta al suo posto |
| Il corpo come **String** | L'intero corpo grezzo come testo |

La differenza tra «vuoto» e «non impostato» conta: un header mancante dà al Task una stringa vuota, mentre un campo JSON mancante lascia intatto il valore proprio del Template.

### Variable Usage: Variables {#variable-usage-variables}

Il valore entra nelle variabili del Task — lo stesso insieme che riempie il campo **Variables** della finestra di avvio. Semaphore le passa allo strumento come variabili aggiuntive (`--extra-vars` per Ansible, `-var` per Terraform) e sovrascrivono una chiave con lo stesso nome del [Variable Group](/user-guide/environment) del Template.

Dai alla variabile esattamente il nome di una [Survey Variable](/user-guide/task-templates/survey-vars) del Template e il webhook compilerà quella Survey Variable al posto di una persona.

### Variable Usage: Task Params {#variable-usage-task-params}

I Task Params sono i [prompt](/user-guide/task-templates/prompts) predefiniti del Template, non variabili per il playbook. Il valore estratto viene passato senza modifiche, quindi il suo tipo JSON deve essere quello atteso: `true`, non `"true"`.

| Variabile | Si applica a | Si aspetta |
|---|---|---|
| `git_branch` | Qualsiasi app | Il branch da estrarre. Un `refs/heads/` iniziale viene rimosso, quindi il `ref` di GitHub si può usare così com'è |
| `limit`, `tags`, `skip_tags` | Ansible | Un elenco di stringhe |
| `debug`, `dry_run`, `diff` | Ansible | `true` o `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` o `false` |

Perché il valore abbia effetto il Template deve consentire la sostituzione: **Allow override branch in task** per `git_branch` e il prompt corrispondente per `limit`, `tags` e `skip_tags`. Senza quel permesso il valore viene scartato e il Task gira con l'impostazione del Template.

### Esempio di extractor: push GitHub {#extractor-example-github-push}

Un webhook di push di GitHub invia un corpo che comincia così:

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

Quattro extractor lo trasformano in un Task completamente descritto:

| Name | Source | Formato | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

Il Task usa quindi `main` (il prefisso `refs/heads/` viene rimosso per te) e gira con le variabili `COMMIT`, `AUTHOR` ed `EVENT` a disposizione del playbook. Per vedere che cosa ha consegnato davvero una chiamata reale, aprila nella scheda History e confronta il suo corpo con le tue chiavi.

## Parametri del Task preimpostati {#task-parameters}

Appena scegli un Template nel form dell'integrazione compaiono le sue opzioni di avvio: un messaggio, le sue Survey Variable, l'Inventory, il branch Git quando il Template ne consente la sostituzione e i prompt dell'app. Quello che imposti lì diventa il valore predefinito di ogni Task avviato da questa integrazione, perciò i valori che non cambiano mai — un Inventory, un messaggio fisso — vanno qui e non in un extractor.

Gli extractor si applicano sopra questi valori: una variabile o un parametro del Task prodotto da un extractor sostituisce il valore preimpostato con lo stesso nome, e il preimpostato sopravvive quando l'extractor non trova nulla.

## Integrazioni con i Workflow <FeatureState feature="workflows" /> {#workflow-integrations}

Un'integrazione può avviare un [Workflow](/user-guide/workflows) invece di un singolo Template. Porta **Runs** su **Workflow** nel form dell'integrazione e scegli il Workflow.

Gli extractor funzionano allo stesso modo, con una differenza: **Variable Usage** viene ignorato e ogni valore estratto è consegnato come risposta al survey del Workflow con il nome indicato in **Variable**. Il Workflow convalida poi quelle risposte e le passa ai suoi nodi tramite i rispettivi collegamenti, quindi un valore a cui non è collegato nessun nodo non raggiunge mai un Task. Una chiamata riuscita riporta `X-Semaphore-Workflow-ID` e `X-Semaphore-Workflow-Run-ID` oltre agli header del Task.

## Cronologia delle chiamate {#call-history}

La scheda **History** della pagina delle integrazioni elenca ogni chiamata ricevuta dal Project attraverso uno qualsiasi dei suoi alias, dalla più recente. Sopravvive all'alias, all'integrazione e al Task avviato, perché è conservata per Project e non per integrazione.

| Colonna | Mostra |
|---|---|
| **Time** | Quando è arrivata la chiamata |
| **Integration** | L'integrazione che l'ha gestita, con l'alias sotto: premi l'alias per filtrare l'elenco |
| **Source IP** | L'indirizzo da cui è arrivata la chiamata |
| **Method** | `GET` o `POST` |
| **Status** | Che cosa ha fatto l'integrazione con la chiamata, e perché |
| **Task** | Il Task o l'esecuzione di Workflow avviata |
| **Duration** | Quanto l'integrazione ha impiegato a gestire la chiamata |

Sono possibili quattro stati:

| Stato | Significato |
|---|---|
| `ok` | Un Task o un'esecuzione di Workflow è partita |
| `unauthorized` | La richiesta non ha superato il metodo di autenticazione dell'integrazione |
| `skipped` | I matcher non hanno corrisposto, oppure l'alias non ha avviato alcuna integrazione |
| `error` | L'avvio è stato tentato e non è riuscito: il Template non c'era più, il survey ha rifiutato i valori |

Premendo una riga si apre la chiamata, con il corpo della richiesta così come è stato ricevuto (i primi 64 KiB; se era più lungo vengono mostrate sia la dimensione memorizzata sia quella originale). Gli **header della richiesta non vengono mai conservati**: portano la firma o il token con cui il mittente si è autenticato. Nemmeno il corpo di una chiamata che non ha superato l'autenticazione viene conservato, dato che può inviarla chiunque conosca l'URL.

Filtra l'elenco per integrazione e per alias con i controlli sopra la tabella e scorrilo con le frecce sotto. La cronologia non scade: cresce fino all'eliminazione del Project.

## Risoluzione dei problemi {#troubleshooting}

| Sintomo | Che cosa controllare |
|---|---|
| Nella History non compare nessuna riga | L'alias nell'URL è sbagliato o è stato eliminato. Anche una chiamata all'alias proprio di un'integrazione con **Use project alias** attivo non viene registrata da nessuna parte |
| `unauthorized` | Il nome dell'header di autenticazione, la chiave nel Key Store e se il mittente invia la firma con il prefisso `sha256=` che il metodo si aspetta. GitHub e Bitbucket usano i propri header indipendentemente da **Auth header** |
| `skipped`, motivo *No integration matched the alias* | L'alias esiste, ma nessuna integrazione del Project ha **Use project alias** attivo |
| `skipped`, motivo *No matcher matched the request* | Apri la chiamata e confronta il suo corpo con i tuoi matcher. Ricorda che un campo mancante non corrisponde mai con `==`, che nelle chiavi le maiuscole contano e che **Contains** non ha caratteri jolly. Un'integrazione senza alcun matcher viene saltata per lo stesso motivo |
| Il Task parte ma una variabile è vuota o assente | La chiave JSON non corrisponde al payload (apri la chiamata e guarda il corpo), il valore era `null`, oppure il nome in **Variable** è diverso dalla Survey Variable che dovrebbe riempire |
| Il branch non viene sostituito | Al Template serve **Allow override branch in task** e l'extractor deve scrivere nel parametro `git_branch` |
| Da una chiamata partono più Task | Più integrazioni usano l'alias di Project e i loro matcher corrispondono tutti. Restringi i matcher, oppure assegna alle integrazioni alias propri |
