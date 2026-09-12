# Prompt

I prompt sono flag e opzioni predefiniti, specifici per ciascun tipo di template, che è possibile abilitare per consentire la personalizzazione in fase di esecuzione. A differenza delle [variabili survey](/user-guide/task-templates/survey-vars), che sono campi personalizzati creati dall'utente, i prompt sono opzioni integrate che corrispondono a flag CLI specifici di Ansible, Terraform e altri strumenti.

Questa funzionalità consente di:
- Sovrascrivere i valori predefiniti del template in fase di esecuzione
- Selezionare host o risorse specifici
- Controllare il comportamento dell'esecuzione tramite flag CLI
- Passare opzioni di runtime tramite chiamate API o pianificazioni

## Prompt e variabili survey a confronto {#prompts-vs-survey-variables}

| Caratteristica | Prompt | Variabili survey |
|---------|---------|-----------------|
| **Definizione** | Opzioni predefinite specifiche del template | Campi personalizzati creati dall'utente |
| **Esempi** | Ansible: `--limit`, `--tags`<br/>Terraform: workspace, `-destroy` | Nome dell'ambiente, numero di versione, parametri personalizzati |
| **Configurazione** | Abilitazione tramite caselle di controllo nel template | Aggiunta nelle impostazioni del template con nome e tipo |
| **Passati come** | Flag CLI integrati | Ansible: `--extra-vars`<br/>Terraform: `-var` |

I **prompt** sono opzioni standardizzate integrate in Semaphore per strumenti specifici, mentre le **variabili survey** sono campi personalizzati flessibili definiti dall'utente.

## Prompt Ansible {#ansible-prompts}

Per i template di playbook Ansible, è possibile abilitare i prompt per le seguenti opzioni CLI:

### Limit {#limit}

Abilitare il prompt `--limit` per specificare gli host da selezionare durante l'esecuzione del playbook.

**Equivalente CLI**: `ansible-playbook playbook.yml --limit webservers`

**Casi d'uso**:
- Eseguire il playbook su un sottoinsieme degli host dell'inventory
- Selezionare server specifici per il deploy
- Testare le modifiche su un singolo host prima del rilascio

**Esempio**:
- L'inventory contiene 50 server web
- Abilitare il prompt Limit
- Durante l'esecuzione del task, specificare `web-01.example.com` per selezionare solo quel server
- Oppure specificare `webservers:&production` per selezionare i server web di produzione

### Tags {#tags}

Abilitare il prompt `--tags` per eseguire solo i task con tag specifici.

**Equivalente CLI**: `ansible-playbook playbook.yml --tags deploy,restart`

**Casi d'uso**:
- Eseguire solo parti specifiche di un playbook
- Eseguire i passaggi di deploy senza i task di configurazione
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

**Esempio**: Utilizzando il playbook precedente, abilitare Skip Tags e inserire `install` per saltare l'installazione dei pacchetti ed eseguire solo i task di deploy e riavvio.

### Abilitazione dei prompt Ansible {#enabling-ansible-prompts}

Per abilitare i prompt Ansible:

1. Andare in **Task Template** e selezionare il template Ansible
2. Individuare la sezione **Prompt Ansible** nelle impostazioni del template
3. Abilitare le caselle di controllo dei prompt desiderati:
   - ☐ **Limit** - Abilita il flag `--limit`
   - ☐ **Tags** - Abilita il flag `--tags`
   - ☐ **Skip Tags** - Abilita il flag `--skip-tags`
4. Salvare il template

![](/assets/ansible_2.png)

Una volta abilitati, questi campi compaiono nel modulo di esecuzione del task, nelle richieste API e nelle configurazioni delle pianificazioni.

## Prompt Terraform/OpenTofu {#terraformopentofu-prompts}

Per i template Terraform e OpenTofu, Semaphore fornisce diversi prompt integrati:

### Selezione del workspace {#workspace-selection}

Selezionare il workspace Terraform da utilizzare per l'esecuzione del task.

**Equivalente CLI**: `terraform workspace select staging`

**Casi d'uso**:
- Gestire più ambienti (dev, staging, produzione)
- Separare i file di stato per configurazioni diverse
- Testare le modifiche all'infrastruttura in isolamento

**Configurazione**:
1. Creare i workspace nella scheda **Workspace** del template
2. Il selettore del workspace compare automaticamente nel modulo del task
3. Gli utenti scelgono il workspace di destinazione durante l'esecuzione dei task

Consultare [Workspace Terraform](/user-guide/apps/terraform/workspaces) per la configurazione dettagliata.

### Flag Destroy {#destroy-flag}

Abilitare il flag `-destroy` per smantellare l'infrastruttura.

**Equivalente CLI**: `terraform apply -destroy`

**Casi d'uso**:
- Ripulire gli ambienti di test temporanei
- Dismettere l'infrastruttura
- Rimuovere risorse specifiche

**Importante**: Si tratta di un'operazione distruttiva. Utilizzarla con cautela e valutare di richiedere una conferma nei propri flussi di lavoro.

### Flag Migrate State {#migrate-state-flag}

Abilitare il flag `-migrate-state` quando si modifica la configurazione del backend.

**Equivalente CLI**: `terraform init -migrate-state`

**Casi d'uso**:
- Spostare lo stato su un backend diverso
- Migrare tra posizioni di archiviazione
- Aggiornare la configurazione del backend

### Abilitazione dei prompt Terraform {#enabling-terraform-prompts}

I prompt Terraform sono disponibili nelle impostazioni del template:

1. Andare in **Task Template** e selezionare il template Terraform
2. Configurare i prompt disponibili nelle impostazioni del template:
   - Selezione del workspace (abilitata automaticamente se sono configurati dei workspace)
   - Opzione flag Destroy
   - Opzione Migrate State
3. Salvare il template

Il modulo del task mostra queste opzioni durante l'esecuzione dei task Terraform.

## Prompt Bash, PowerShell e Python {#bash-powershell-and-python-prompts}

Per i template Bash, PowerShell e Python, i prompt sono minimi, poiché la maggior parte della personalizzazione è gestita tramite le [variabili survey](/user-guide/task-templates/survey-vars).

I prompt disponibili sono:

- Argomenti CLI
- Branch

Questi tipi di template traggono maggior vantaggio dalle variabili survey personalizzate per passare parametri agli script.

## Utilizzo dei prompt {#using-prompts}

### Esecuzione manuale dei task {#manual-task-execution}

Quando si esegue un task da un template con prompt abilitati:

1. Fare clic su **Esegui** nel template
2. Compare un modulo con i campi dei prompt abilitati
3. Compilare i valori dei prompt che si desidera utilizzare (i campi facoltativi possono essere lasciati vuoti)
4. Fare clic su **Esegui task**

Il task viene eseguito con i valori dei prompt specificati, passati come flag CLI.

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

**Importante**: I prompt devono essere abilitati nel template affinché i valori vengano accettati. Se si passano valori dei prompt tramite API senza averli abilitati, tali valori verranno ignorati.

### Task pianificati {#scheduled-tasks}

Le pianificazioni possono includere valori dei prompt per personalizzare l'esecuzione automatica dei task:

**Esempio**: Pianificazione con prompt Ansible
- Pianificazione di deploy giornaliera con `limit: "production"` e `tags: "deploy"`
- Pianificazione di manutenzione settimanale con `tags: "updates,cleanup"`

Configurare i valori dei prompt nelle impostazioni della pianificazione in modo che ogni esecuzione pianificata utilizzi le opzioni specificate.

### Integrazioni e webhook {#integrations-and-webhooks}

Le integrazioni possono estrarre valori dai webhook e associarli ai prompt:

**Esempio**: Un webhook GitHub attiva il deploy
- Estrarre il nome del branch dal webhook
- Associarlo al prompt Limit per selezionare l'ambiente specifico
- Eseguire il deploy solo sui server corrispondenti all'ambiente del branch

Consultare [Integrazioni](../integrations) per la configurazione dei webhook.

## Buone pratiche {#best-practices}

### Abilitare solo i prompt necessari {#enable-only-necessary-prompts}

Ogni prompt abilitato aggiunge un campo al modulo del task. Abilitare solo i prompt che gli utenti avranno effettivamente bisogno di personalizzare.

✅ **Corretto**: Abilitare Limit per i team operativi che devono selezionare host specifici
❌ **Sbagliato**: Abilitare tutti i prompt "per sicurezza"

### Combinare con le variabili survey {#combine-with-survey-variables}

Utilizzare i prompt per le opzioni CLI specifiche dello strumento e le variabili survey per i parametri personalizzati:

**Esempio di template Ansible:**
- **Prompt**: Limit (quali host), Tags (quali task)
- **Variabili survey**: `app_version` (quale versione), `enable_rollback` (logica personalizzata)

### Documentare l'utilizzo dell'API {#document-api-usage}

Se i template vengono attivati tramite API, documentare quali prompt sono disponibili e il formato atteso:

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

Testare sempre i playbook potenzialmente distruttivi prima con il prompt Limit:

1. Abilitare il prompt Limit nel template
2. Prima esecuzione: specificare `limit: "test-server-01"` per testare su un solo host
3. Verificare l'esito positivo
4. Seconda esecuzione: specificare `limit: "production"` per il rilascio su tutti gli host

### Validare le combinazioni di prompt {#validate-prompt-combinations}

Alcune combinazioni di prompt potrebbero non avere senso. Aggiungere documentazione o validazione:

- L'uso di `--tags deploy` insieme a `--skip-tags deploy` genera un conflitto
- Specificare sia il workspace sia il flag destroy richiede particolare cautela

## Casi d'uso comuni {#common-use-cases}

### Rilascio graduale con Limit {#gradual-rollout-with-limit}

Eseguire il deploy in produzione gradualmente utilizzando Limit di Ansible:

1. Esecuzione 1: `limit: "web-01.example.com"` - Deploy su un solo server
2. Monitorare eventuali problemi
3. Esecuzione 2: `limit: "webservers:&canary"` - Deploy sui server canary
4. Validare le metriche
5. Esecuzione 3: `limit: "webservers:&production"` - Rilascio completo

### Esecuzione selettiva con Tags {#selective-execution-with-tags}

Utilizzare Tags per eseguire solo parti specifiche di un playbook:

**Mattina**: `tags: "deploy"` - Deploy della nuova versione
**Pomeriggio**: `tags: "config"` - Aggiornamento della configurazione
**Sera**: `tags: "restart"` - Riavvio dei servizi con la nuova configurazione

### Gestione degli ambienti con i workspace {#environment-management-with-workspaces}

Utilizzare la selezione del workspace Terraform per la gestione degli ambienti:

- **Sviluppo**: Selezionare il workspace `dev` - risorse più economiche, iterazione più rapida
- **Staging**: Selezionare il workspace `staging` - simile alla produzione, per i test
- **Produzione**: Selezionare il workspace `prod` - infrastruttura di produzione completa

### Pulizia con Destroy {#cleanup-with-destroy}

Utilizzare destroy di Terraform per l'infrastruttura temporanea:

1. Creare l'ambiente di test: eseguire con il workspace `test-branch-123`
2. Eseguire i test di integrazione
3. Pulizia: eseguire con il flag destroy abilitato e il workspace `test-branch-123`

## Risoluzione dei problemi {#troubleshooting}

### Valori dei prompt ignorati {#prompt-values-ignored}

**Problema**: I valori dei prompt vengono passati ma non hanno effetto

**Soluzione**: Verificare che il prompt corrispondente sia abilitato nelle impostazioni del template. I prompt devono essere abilitati esplicitamente.

### Impossibile specificare limit {#cannot-specify-limit}

**Problema**: Il campo Limit non compare nel modulo del task

**Soluzione**: 
1. Modificare il template
2. Individuare la sezione "Prompt Ansible"
3. Abilitare la casella di controllo "Limit"
4. Salvare il template

### Le chiamate API con valori dei prompt falliscono {#api-calls-fail-with-prompt-values}

**Problema**: Le richieste API con valori dei prompt restituiscono errori

**Soluzione**: 
1. Assicurarsi che i prompt siano abilitati nel template
2. Controllare la formattazione JSON nel corpo della richiesta
3. Verificare che i nomi dei campi corrispondano esattamente (`limit`, non `host_limit`)

### I tag non filtrano i task {#tags-not-filtering-tasks}

**Problema**: I tag vengono specificati ma tutti i task vengono comunque eseguiti

**Soluzione**: 
1. Verificare che i task nel playbook abbiano i tag definiti correttamente
2. Controllare eventuali errori di battitura nei nomi dei tag
3. Assicurarsi che i tag siano separati da virgole senza spazi: `deploy,restart` e non `deploy, restart`

## Documentazione correlata {#related-documentation}

- [Variabili survey](/user-guide/task-templates/survey-vars) - Campi personalizzati per i template
- [Template Ansible](/user-guide/apps/ansible) - Configurazione specifica di Ansible
- [Template Terraform](/user-guide/apps/terraform) - Configurazione specifica di Terraform
- [Pianificazioni](../schedules) - Esecuzione automatica dei task
- [Integrazioni](../integrations) - Task attivati da webhook
- [Documentazione API](../../admin-guide/api) - Riferimento API
