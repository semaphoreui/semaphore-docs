---
title: Agenti IA
description: Creazione di un Task Template per un agente Claude Code o Codex, il prompt e le espressioni del prompt, la chiave API, i server MCP, gli argomenti CLI e il log del Task.
---

# Agenti IA

Con Semaphore UI è possibile eseguire agenti di programmazione IA: [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) e [Codex](https://developers.openai.com/codex/cli). Un Task Template di tipo agente avvia lo strumento a riga di comando dell'agente in una directory di un Repository e gli fornisce un prompt. L'agente lavora in autonomia, senza nessuno che risponda alle sue domande, e riporta ciò che fa nel log del Task.

Utilizzare un Task Template di tipo agente per un lavoro che altrimenti si descriverebbe a un collega: rivedere l'ultimo commit, trovare e correggere un test che fallisce, aggiornare una dipendenza e aprire una pull request. Come qualsiasi altro Task Template, può essere avviato manualmente, da una [pianificazione](/user-guide/schedules), da un'[integrazione](/user-guide/integrations) o da un [workflow](/user-guide/workflows).

## Prima di iniziare {#before-you-begin}

- **Lo strumento a riga di comando dell'agente è installato** sulla macchina che esegue i Task: il server Semaphore oppure il [Runner](/admin-guide/runners).

  | Applicazione | ID | Comando | Installazione |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore abilita un'applicazione quando all'avvio ne trova il comando nel `PATH`. Un amministratore può anche abilitarla e impostare il percorso dell'eseguibile nella pagina [Applications](/user-guide/apps#managing-applications).
- **Una chiave API** del fornitore del modello, vedere [Chiave API](#api-key).
- **Un Repository** in cui l'agente lavora, aggiunto ai [Repository](/user-guide/repositories).

## Creare un Task Template {#create-a-template}

1. Andare nella sezione **Task Templates**, fare clic su **New Template** e poi su **Claude Code Agent** o **Codex Agent**.

![Il menu New Template con le voci Claude Code Agent e Codex Agent](/assets/agent-template-new.webp)

2. Configurare il Task Template.

![L'editor di un Task Template Claude Code Agent](/assets/agent-template-editor.webp)

Il Task Template consente di specificare i seguenti parametri:

| Campo | Descrizione |
|---|---|
| **Repository** | Il Repository in cui l'agente lavora. Semaphore lo clona o lo aggiorna prima del Task, come per qualsiasi altro Task Template. |
| **Subdirectory path** | Facoltativo. La directory del Repository in cui l'agente viene avviato. Se omesso, l'agente parte dalla radice del Repository. |
| **MCP servers** | Facoltativo. Un Inventory MCP con i server i cui strumenti l'agente può chiamare, vedere [Server MCP](#mcp-servers). |
| **Variable Groups** | Variabili e segreti per l'agente: la chiave API, i valori per le [espressioni del prompt](#prompt-expressions), le variabili d'ambiente del processo dell'agente. |
| **Prompt** | L'istruzione con cui l'agente viene eseguito, vedere [Prompt](#prompt). |
| **CLI args** | Argomenti aggiuntivi per il comando dell'agente, vedere [Argomenti CLI](#cli-arguments). |
| **Survey Variables** | Domande poste all'avvio del Task. Le risposte possono essere inserite nel prompt. |
| Casella **Prompt** | Sotto **Claude Code prompts** o **Codex prompts**. Consente a chi avvia un Task di sostituire il prompt, vedere [Prompt di un Task](#prompt-of-a-task). |

3. Fare clic su **Save**, quindi eseguire il Task Template con il pulsante **Run**.

## Chiave API {#api-key}

L'agente legge la propria chiave API da una variabile d'ambiente. Aggiungere la chiave a un [Variable Group](/user-guide/environment) del Task Template come **variabile d'ambiente segreta**:

| Applicazione | Variabile | Accettata anche |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

Il login dell'utente che esegue Semaphore non viene utilizzato: ogni Task riceve una propria directory di configurazione dell'agente, vuota, quindi una chiave proveniente da un Variable Group è l'unico modo per autenticarsi.

Se nessuna delle variabili è impostata, il log del Task indica quale aggiungere, dopodiché l'agente stesso fallisce con il proprio errore:

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## Prompt {#prompt}

Il prompt è ciò che si digiterebbe nell'agente: testo semplice, lungo quanto serve. Viene passato all'agente sul suo standard input, quindi non compare nell'elenco dei processi.

Il prompt è obbligatorio, a meno che la casella **Prompt** non consenta a un Task di portarne uno proprio.

### Espressioni del prompt {#prompt-expressions}

Il prompt di un Task Template può prendere valori dai Variable Group del Task Template. Scrivere un'espressione tra doppie parentesi graffe, come in GitHub Actions, e Semaphore la sostituisce all'avvio del Task:

| Espressione | Valore |
|---|---|
| `${{ vars.extra.NAME }}` | Una variabile extra di un Variable Group. |
| `${{ vars.env.NAME }}` | Una variabile d'ambiente di un Variable Group. |
| `${{ secrets.extra.NAME }}` | Una variabile extra segreta di un Variable Group. |
| `${{ secrets.env.NAME }}` | Una variabile d'ambiente segreta di un Variable Group. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

Le regole:

- **Le variabili di survey** sono variabili extra: la risposta alla variabile di survey `version` è `${{ vars.extra.version }}`, e una segreta è `${{ secrets.extra.NAME }}`. Una variabile di survey fornita come variabile d'ambiente si trova invece sotto `env`. Una variabile di survey lasciata senza risposta produce una stringa vuota.
- **Una variabile inesistente fa fallire il Task** prima dell'avvio dell'agente, con un messaggio che indica l'espressione. Semaphore non esegue un agente con un buco nel prompt.
- **Un'espressione scritta in modo errato viene rifiutata al salvataggio del Task Template**: `${{ secrets.TOKEN }}` non contiene né `extra` né `env`.
- **Le altre espressioni vengono lasciate così come sono.** Solo `vars.…` e `secrets.…` appartengono a Semaphore, quindi un prompt può chiedere all'agente di scrivere un workflow che contiene `${{ github.sha }}`. Per mantenere come testo un'espressione `vars` o `secrets`, anteporvi un ulteriore simbolo del dollaro: `$${{ secrets.env.NAME }}`.
- **Un valore viene inserito così com'è.** Una stringa viene usata come è scritta, un elenco o un oggetto come JSON. All'interno di un valore non vengono cercate nuovamente espressioni.
- **Un segreto inserito nel prompt viene mascherato** nel log del Task, ovunque l'agente lo ripeta.

:::warning

Un segreto presente nel prompt viene inviato al fornitore del modello insieme al resto del prompt, e l'agente può usarlo in qualsiasi modo consentito dal prompt. È preferibile affidare un segreto agli strumenti dell'agente: come variabile d'ambiente segreta di un Variable Group, oppure come token di un [server MCP](#mcp-servers).

:::

### Prompt di un Task {#prompt-of-a-task}

Con la casella **Prompt** attivata, il modulo del Task mostra il prompt del Task Template e consente di modificarlo per una singola esecuzione. Una pianificazione, un'integrazione o un passo di un workflow possono conservare un proprio prompt allo stesso modo. Tramite l'API, inviarlo nei parametri del Task:

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

Un prompt fornito da un Task viene usato esattamente come è scritto: **le espressioni del prompt vengono sostituite solo nel prompt memorizzato nel Task Template**. In questo modo le variabili e i segreti del progetto restano fuori dalla portata di chi può soltanto eseguire Task. Se il Task Template non lo consente, un Task che porta un prompt viene rifiutato.

## Server MCP {#mcp-servers}

Un agente può chiamare gli strumenti di server [MCP](https://modelcontextprotocol.io) remoti: un issue tracker, una ricerca nella documentazione, un proprio servizio. I server sono conservati in un Inventory di tipo **MCP Inventory**, e un solo Inventory serve sia i Task Template Claude Code sia quelli Codex.

1. Andare nella sezione **Inventory**, fare clic su **New Inventory** e poi su **MCP Inventory**.
2. Aggiungere i server e fare clic su **Save**.
3. Selezionare l'Inventory nel campo **MCP servers** del Task Template.

![Il modulo di un Inventory MCP con tre server](/assets/agent-mcp-inventory.webp)

| Campo | Descrizione |
|---|---|
| Interruttore | Un server disattivato resta nell'elenco e non viene fornito all'agente. |
| **Name** | Il nome con cui l'agente conosce il server: fino a 64 lettere, cifre, `-` e `_`. Viene mostrato nel log del Task prima del nome di uno strumento. |
| **URL** | Un indirizzo `http` o `https` di un server che parla MCP su HTTP o SSE. Un nome utente o una password nell'URL non sono accettati. |
| **Token** | Facoltativo. L'agente lo invia nell'header `Authorization` come bearer token. |

Un token salvato viene memorizzato in forma cifrata e non viene più mostrato: digitarne uno nuovo per sostituirlo, oppure rimuoverlo con la croce. Il token raggiunge l'agente come variabile d'ambiente del suo processo; non viene scritto nel file di configurazione dell'agente, nella riga di comando o nel log del Task.

Gli strumenti dei server selezionati sono approvati in anticipo, poiché non c'è nessuno che possa confermare una chiamata. L'agente riceve esattamente questi server: i server MCP configurati per l'utente che esegue Semaphore non vengono utilizzati.

## Argomenti CLI {#cli-arguments}

I **CLI args** vengono aggiunti al comando dell'agente dopo gli argomenti che Semaphore imposta da sé. Inserire ogni token come argomento separato:

```json
["--model", "claude-sonnet-5-5"]
```

Utilizzarli per ciò che offre la riga di comando dell'agente stesso: il modello, i limiti, i permessi. L'agente viene eseguito senza supervisione, quindi uno strumento che chiederebbe una conferma viene invece rifiutato; quali strumenti un agente può usare senza chiedere si stabilisce con i suoi argomenti. Vedere il [riferimento della CLI di Claude Code](https://docs.claude.com/en/docs/claude-code/cli-reference) e il [riferimento della CLI di Codex](https://developers.openai.com/codex/cli/reference) per le opzioni della propria versione.

Con **CLI args** attivato sotto **Prompts**, un Task può aggiungere argomenti propri.

Le variabili e i segreti dei Variable Group non vengono aggiunti alla riga di comando di un agente, dove l'elenco dei processi li mostrerebbe. Le variabili d'ambiente e le variabili d'ambiente segrete vengono passate al processo dell'agente.

## Come viene eseguito l'agente {#how-the-agent-runs}

Semaphore avvia l'agente nella directory del Repository, oppure nel relativo **Subdirectory path**, con il prompt sullo standard input:

| Applicazione | Comando |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **Ogni Task ha una propria directory di configurazione** dell'agente (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`), creata per il Task e rimossa al termine. Le impostazioni, i login e i server MCP dell'utente che esegue Semaphore non raggiungono l'agente, e una variabile di un Variable Group non può reindirizzare la directory.
- **Nulla viene conservato tra un Task e l'altro**: ogni esecuzione è una nuova sessione dell'agente. Ciò che deve sopravvivere a un'esecuzione va messo nel Repository: un commit, una pull request, un file.
- **L'agente legge i file di istruzioni del Repository** che il suo strumento a riga di comando legge da sé nella directory di lavoro, come `CLAUDE.md` o `AGENTS.md`.
- **Sui Runner Docker e Kubernetes** l'agente viene eseguito in un container, quindi l'[immagine dell'executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) deve contenere il comando `claude` o `codex`.

## Log del Task {#task-log}

Il log del Task mostra il lavoro dell'agente man mano che avviene:

![Il log di un Task Claude Code: il modello, le chiamate agli strumenti, un subagente, il riepilogo](/assets/agent-task-log.webp)

- **Il testo** dell'agente, riga per riga. Codex stampa un messaggio quando è completo.
- **Le chiamate agli strumenti**, ciascuna su una riga: lo stato, il server MCP e lo strumento, gli argomenti. Fare clic su una riga per vedere gli argomenti e il risultato. Una chiamata fallita è aperta fin dall'inizio.
- **I subagenti**: le righe di un subagente sono contrassegnate con il suo nome.
- **La prima riga** di un'esecuzione Claude Code indica il modello e i server MCP, con in rosso quelli che non si sono connessi.
- **Il riepilogo** alla fine: il numero di turni, la durata, i token e il costo, per quanto l'agente li riporta.

**Raw log** mostra lo stesso log come testo semplice.

## Sicurezza {#security}

- **Un agente esegue comandi.** Entro i permessi che il suo strumento a riga di comando gli concede, l'agente può leggere e modificare la directory del Repository, eseguire programmi come l'utente che esegue i Task e chiamare gli strumenti dei suoi server MCP. Concedere a un Task Template di tipo agente l'accesso che si concederebbe a uno script scritto da qualcun altro: un Repository e token con i diritti più ristretti che bastano a svolgere il lavoro, e un [Runner](/admin-guide/runners) separato per il lavoro che si vuole tenere distinto dal server.
- **Il prompt e ciò che l'agente legge vengono inviati al fornitore del modello**: i file del Repository, l'output dei comandi, i risultati degli strumenti.
- **Un Repository può dare istruzioni all'agente.** Il testo nei file che l'agente legge, in una issue o nel risultato di uno strumento può cambiare ciò che l'agente fa. Non puntare un agente dotato di token potenti verso contenuti che non si controllano.
- **I token e i segreti vengono mascherati nel log del Task**: i token dei server MCP e i segreti inseriti nel prompt vengono sostituiti con `********`.
- **Solo il prompt memorizzato nel Task Template può usare variabili e segreti**, vedere [Prompt di un Task](#prompt-of-a-task).
