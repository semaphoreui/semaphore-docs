# Prompt

I prompt sono flag e opzioni predefiniti, specifici per ciascun tipo di Task Template, che è possibile abilitare per consentire la personalizzazione in fase di esecuzione. A differenza delle [Variabili di survey](/user-guide/task-templates/survey-vars), che sono campi personalizzati creati dall'utente, i prompt sono opzioni integrate che corrispondono a flag CLI specifici di Ansible, Terraform e altri strumenti.

Questa funzionalità consente di:
- Sovrascrivere i valori predefiniti del Task Template in fase di esecuzione
- Indirizzare host o risorse specifici
- Controllare il comportamento dell'esecuzione con i flag CLI
- Passare opzioni di esecuzione tramite chiamate API o Schedule

## Prompt e variabili di survey {#prompts-vs-survey-variables}

| Caratteristica | Prompt | Variabili di survey |
|---------|---------|-----------------|
| **Definizione** | Opzioni predefinite specifiche del Task Template | Campi personalizzati creati dall'utente |
| **Esempi** | Ansible: `--limit`, `--tags`<br/>Terraform: workspace, `-destroy` | Nome dell'ambiente, numero di versione, parametri personalizzati |
| **Configurazione** | Si abilitano tramite caselle di controllo nel Task Template | Si aggiungono nelle impostazioni del Task Template con nome e tipo |
| **Passati come** | Flag CLI integrati | Ansible: `--extra-vars`<br/>Terraform: `-var` |

I **prompt** sono opzioni standardizzate integrate in Semaphore per strumenti specifici, mentre le **variabili di survey** sono campi personalizzati flessibili definiti dall'utente.

## Prompt di Ansible {#ansible-prompts}

Per i Task Template con playbook Ansible è possibile abilitare i prompt per le opzioni CLI seguenti:

### Limit {#limit}

Abilitare il prompt `--limit` per indicare quali host indirizzare durante l'esecuzione del playbook.

**Equivalente CLI**: `ansible-playbook playbook.yml --limit webservers`

**Casi d'uso**:
- Eseguire il playbook su un sottoinsieme degli host dell'Inventory
- Indirizzare server specifici per un deployment
- Testare le modifiche su un singolo host prima della distribuzione generale

**Esempio**:
- L'Inventory contiene 50 web server
- Abilitare il prompt Limit
- Durante l'esecuzione del Task, specificare `web-01.example.com` per indirizzare solo quel server
- Oppure specificare `webservers:&production` per indirizzare i web server di produzione

### Tags {#tags}

Abilitare il prompt `--tags` per eseguire solo i task con tag specifici.

**Equivalente CLI**: `ansible-playbook playbook.yml --tags deploy,restart`

**Casi d'uso**:
- Eseguire solo parti specifiche di un playbook
- Eseguire i passaggi di deployment senza i task di configurazione
- Riavviare rapidamente i servizi senza eseguire l'intero playbook

**Esempio**:
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Abilitare il prompt Tags e inserire `deploy,restart` per saltare il passaggio di installazione.

### Skip Tags {#skip-tags}

Abilitare il prompt `--skip-tags` per saltare i task con tag specifici.

**Equivalente CLI**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**Casi d'uso**:
- Saltare i task facoltativi in produzione
- Escludere i task di debug o di test
- Evitare i task che richiedono molto tempo quando non sono necessari

**Esempio**: utilizzando il playbook riportato sopra, abilitare Skip Tags e inserire `install` per saltare l'installazione dei pacchetti ed eseguire solo i task di deployment e di riavvio.

### Skip Galaxy install {#skip-galaxy-install}

Abilitare il prompt per consentire all'utente di saltare il passaggio `ansible-galaxy install` per ruoli e collection durante l'esecuzione del Task.

**Casi d'uso**:
- I requisiti sono già installati nell'immagine del Runner
- Risparmiare tempo nelle esecuzioni ripetute quando nulla è cambiato in `requirements.yml`

### Force Galaxy install {#force-galaxy-install}

Abilitare il prompt per consentire all'utente di forzare `ansible-galaxy install --force` per ogni file dei requisiti, ignorando il checksum dei requisiti che Semaphore conserva tra le esecuzioni.

**Equivalente CLI**: `ansible-galaxy role install -r requirements.yml --force`

**Casi d'uso**:
- Un file dei requisiti fa riferimento a un branch invece che a una versione fissa ed è necessario l'ultimo commit
- Un'installazione precedente ha lasciato ruoli o collection in uno stato danneggiato
- Verificare che un playbook funzioni partendo da un insieme di dipendenze pulito

Vedere [Requisiti Galaxy](../apps/ansible.md#galaxy-requirements) per il funzionamento dei valori predefiniti a livello di Task Template.

### Abilitazione dei prompt di Ansible {#enabling-ansible-prompts}

Per abilitare i prompt di Ansible:

1. Andare in **Task Templates** e selezionare il Task Template Ansible
2. Individuare la sezione **Ansible Prompts** nelle impostazioni del Task Template
3. Abilitare le caselle di controllo dei prompt desiderati:
   - ☐ **Limit** - Abilita il flag `--limit`
   - ☐ **Tags** - Abilita il flag `--tags`
   - ☐ **Skip Tags** - Abilita il flag `--skip-tags`
   - ☐ **Debug** - Abilita la selezione del livello di verbosità (`-v`)
   - ☐ **Skip Galaxy install** - Consente di saltare `ansible-galaxy install`
   - ☐ **Force Galaxy install** - Consente di forzare `ansible-galaxy install --force`
4. Salvare il Task Template

![](/assets/ansible_2.png)

Quando sono abilitati, questi campi compaiono nel modulo di esecuzione del Task, nelle richieste API e nelle configurazioni degli Schedule.

## Prompt di Terraform/OpenTofu {#terraformopentofu-prompts}

Per i Task Template Terraform e OpenTofu, Semaphore offre diversi prompt integrati:

### Selezione del workspace {#workspace-selection}

Seleziona quale workspace Terraform utilizzare per l'esecuzione del Task.

**Equivalente CLI**: `terraform workspace select staging`

**Casi d'uso**:
- Gestire più ambienti (dev, staging, produzione)
- Separare i file di stato per configurazioni diverse
- Testare le modifiche all'infrastruttura in isolamento

**Configurazione**:
1. Creare i workspace nella scheda **Workspaces** del Task Template
2. Il selettore del workspace compare automaticamente nel modulo del Task
3. Gli utenti scelgono il workspace di destinazione durante l'esecuzione dei Task

Vedere [Workspace di Terraform](/user-guide/apps/terraform/workspaces) per la configurazione dettagliata.

### Flag destroy {#destroy-flag}

Abilitare il flag `-destroy` per smantellare l'infrastruttura.

**Equivalente CLI**: `terraform apply -destroy`

**Casi d'uso**:
- Eliminare gli ambienti di test temporanei
- Dismettere l'infrastruttura
- Rimuovere risorse specifiche

**Importante**: si tratta di un'operazione distruttiva. Utilizzarla con cautela e valutare di richiedere una conferma nei propri Workflow.

### Flag migrate state {#migrate-state-flag}

Abilitare il flag `-migrate-state` quando si modifica la configurazione del backend.

**Equivalente CLI**: `terraform init -migrate-state`

**Casi d'uso**:
- Spostare lo stato su un backend diverso
- Migrare tra posizioni di archiviazione
- Aggiornare la configurazione del backend

### Abilitazione dei prompt di Terraform {#enabling-terraform-prompts}

I prompt di Terraform sono disponibili nelle impostazioni del Task Template:

1. Andare in **Task Templates** e selezionare il Task Template Terraform
2. Configurare i prompt disponibili nelle impostazioni del Task Template:
   - Selezione del workspace (abilitata automaticamente se i workspace sono configurati)
   - Opzione del flag destroy
   - Opzione migrate state
3. Salvare il Task Template

Il modulo del Task mostra queste opzioni durante l'esecuzione dei Task Terraform.

## Prompt di Bash, PowerShell e Python {#bash-powershell-and-python-prompts}

Per i Task Template Bash, PowerShell e Python i prompt sono minimi, poiché la maggior parte della personalizzazione viene gestita tramite le [Variabili di survey](/user-guide/task-templates/survey-vars).

I prompt disponibili sono:

- CLI args
- Branch

Questi tipi di Task Template traggono maggiore vantaggio da variabili di survey personalizzate per passare parametri agli script.

## Utilizzo dei prompt {#using-prompts}

### Esecuzione manuale di un Task {#manual-task-execution}

Quando si esegue un Task da un Task Template con i prompt abilitati:

1. Fare clic su **Run** nel Task Template
2. Compare un modulo con i campi dei prompt abilitati
3. Compilare i valori dei prompt che si desidera utilizzare (i campi facoltativi possono essere lasciati vuoti)
4. Fare clic su **Run Task**

Il Task viene eseguito con i valori dei prompt indicati, passati come flag CLI.

### Chiamate API {#api-calls}

Per passare i valori dei prompt tramite API, includerli nel payload della richiesta:

**Esempio Ansible:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**Importante**: i prompt devono essere abilitati nel Task Template affinché i valori vengano accettati. Se si passano valori dei prompt tramite API senza averli abilitati, tali valori vengono ignorati.

### Task pianificati {#scheduled-tasks}

Gli Schedule possono includere valori dei prompt per personalizzare l'esecuzione automatica dei Task:

**Esempio**: Schedule con prompt di Ansible
- Schedule di deployment giornaliero con `limit: "production"` e `tags: "deploy"`
- Schedule di manutenzione settimanale con `tags: "updates,cleanup"`

Configurare i valori dei prompt nelle impostazioni dello Schedule affinché ogni esecuzione pianificata utilizzi le opzioni indicate.

### Integration e webhook {#integrations-and-webhooks}

Le Integration possono estrarre valori dai webhook e associarli ai prompt:

**Esempio**: un webhook GitHub avvia un deployment
- Estrarre il nome del branch dal webhook
- Associarlo al prompt Limit per indirizzare un ambiente specifico
- Distribuire solo sui server corrispondenti all'ambiente del branch

Vedere [Integration](../integrations) per la configurazione dei webhook.

## Buone pratiche {#best-practices}

### Abilitare solo i prompt necessari {#enable-only-necessary-prompts}

Ogni prompt abilitato aggiunge un campo al modulo del Task. Abilitare solo i prompt che gli utenti dovranno effettivamente personalizzare.

✅ **Corretto**: abilitare Limit per i team operativi che devono indirizzare host specifici
❌ **Sbagliato**: abilitare tutti i prompt "per sicurezza"

### Combinare con le variabili di survey {#combine-with-survey-variables}

Utilizzare i prompt per le opzioni CLI specifiche dello strumento e le variabili di survey per i parametri personalizzati:

**Esempio di Task Template Ansible:**
- **Prompt**: Limit (quali host), Tags (quali task)
- **Variabili di survey**: `app_version` (quale versione), `enable_rollback` (logica personalizzata)

### Documentare l'utilizzo tramite API {#document-api-usage}

Se i Task Template vengono avviati tramite API, documentare quali prompt sono disponibili e il formato previsto:

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### Utilizzare Limit per test sicuri {#use-limit-for-safe-testing}

Testare sempre prima con il prompt Limit i playbook potenzialmente distruttivi:

1. Abilitare il prompt Limit nel Task Template
2. Prima esecuzione: specificare `limit: "test-server-01"` per testare su un solo host
3. Verificare l'esito positivo
4. Seconda esecuzione: specificare `limit: "production"` per distribuire su tutti gli host

### Validare le combinazioni di prompt {#validate-prompt-combinations}

Alcune combinazioni di prompt potrebbero non avere senso. Aggiungere documentazione o validazione:

- L'utilizzo di `--tags deploy` insieme a `--skip-tags deploy` è in conflitto
- Specificare contemporaneamente il workspace e il flag destroy richiede particolare cautela

## Casi d'uso comuni {#common-use-cases}

### Distribuzione graduale con Limit {#gradual-rollout-with-limit}

Distribuire gradualmente in produzione utilizzando il Limit di Ansible:

1. Esecuzione 1: `limit: "web-01.example.com"` - Distribuzione su un solo server
2. Monitorare eventuali problemi
3. Esecuzione 2: `limit: "webservers:&canary"` - Distribuzione sui server canary
4. Validare le metriche
5. Esecuzione 3: `limit: "webservers:&production"` - Distribuzione completa

### Esecuzione selettiva con Tags {#selective-execution-with-tags}

Utilizzare Tags per eseguire solo parti specifiche di un playbook:

**Mattina**: `tags: "deploy"` - Distribuzione della nuova versione
**Pomeriggio**: `tags: "config"` - Aggiornamento della configurazione
**Sera**: `tags: "restart"` - Riavvio dei servizi con la nuova configurazione

### Gestione degli ambienti con i workspace {#environment-management-with-workspaces}

Utilizzare la selezione del workspace di Terraform per la gestione degli ambienti:

- **Sviluppo**: selezionare il workspace `dev` - risorse più economiche, iterazione più rapida
- **Staging**: selezionare il workspace `staging` - simile alla produzione per i test
- **Produzione**: selezionare il workspace `prod` - infrastruttura di produzione completa

### Pulizia con Destroy {#cleanup-with-destroy}

Utilizzare destroy di Terraform per l'infrastruttura temporanea:

1. Creare l'ambiente di test: eseguire con il workspace `test-branch-123`
2. Eseguire i test di integrazione
3. Pulire: eseguire con il flag destroy abilitato e il workspace `test-branch-123`

## Risoluzione dei problemi {#troubleshooting}

### Valori dei prompt ignorati {#prompt-values-ignored}

**Problema**: vengono passati valori dei prompt ma non hanno effetto

**Soluzione**: verificare che il prompt corrispondente sia abilitato nelle impostazioni del Task Template. I prompt devono essere abilitati esplicitamente.

### Impossibile specificare limit {#cannot-specify-limit}

**Problema**: il campo Limit non compare nel modulo del Task

**Soluzione**: 
1. Modificare il Task Template
2. Individuare la sezione "Ansible Prompts"
3. Abilitare la casella di controllo "Limit"
4. Salvare il Task Template

### Le chiamate API con valori dei prompt falliscono {#api-calls-fail-with-prompt-values}

**Problema**: le richieste API con valori dei prompt restituiscono errori

**Soluzione**: 
1. Assicurarsi che i prompt siano abilitati nel Task Template
2. Controllare la formattazione JSON nel corpo della richiesta
3. Verificare che i nomi dei campi corrispondano esattamente (`limit`, non `host_limit`)

### I tag non filtrano i task {#tags-not-filtering-tasks}

**Problema**: vengono specificati i tag ma tutti i task vengono comunque eseguiti

**Soluzione**: 
1. Verificare che i task nel playbook abbiano tag definiti correttamente
2. Controllare eventuali errori di battitura nei nomi dei tag
3. Assicurarsi che i tag siano separati da virgole senza spazi: `deploy,restart` e non `deploy, restart`

## Documentazione correlata {#related-documentation}

- [Variabili di survey](/user-guide/task-templates/survey-vars) - Campi personalizzati per i Task Template
- [Task Template Ansible](/user-guide/apps/ansible) - Configurazione specifica di Ansible
- [Task Template Terraform](/user-guide/apps/terraform) - Configurazione specifica di Terraform
- [Schedule](../schedules) - Esecuzione automatica dei Task
- [Integration](../integrations) - Task avviati da webhook
- [Documentazione API](../../reference/api) - Riferimento dell'API
