# Variabili survey

Le variabili survey sono campi di input personalizzati che è possibile aggiungere ai task template per raccogliere l'input dell'utente durante l'esecuzione dei task. Invece di inserire valori fissi nei playbook o negli script, è possibile definire variabili personalizzate che richiedono i valori agli utenti in fase di esecuzione.

Questa funzionalità è utile per:
- Eseguire lo stesso template con parametri diversi (ad esempio valori di configurazione)
- Accettare input dinamico tramite chiamate API
- Passare parametri personalizzati nei task pianificati
- Attivare task dalle integrazioni con dati estratti dai webhook

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## Variabili survey e prompt a confronto {#survey-variables-vs-prompts}

È importante comprendere la differenza tra variabili survey e prompt:

| Caratteristica | Variabili survey | Prompt |
|---------|-----------------|---------|
| **Definizione** | Campi personalizzati creati dall'utente | Opzioni predefinite specifiche del template |
| **Esempi** | Nome dell'ambiente, numero di versione, endpoint API | Ansible: `--limit`, `--tags`<br/>Terraform: workspace |
| **Configurazione** | Aggiunta nelle impostazioni del template con nome e tipo | Abilitazione tramite caselle di controllo nel template |
| **Passate come** | Ansible: `--extra-vars`<br/>Terraform: `-var` | Flag CLI integrati |

Le **variabili survey** sono campi personalizzati flessibili definiti dall'utente, mentre i **prompt** sono opzioni integrate specifiche per ciascun tipo di template (come i flag `--limit` o `--tags` di Ansible).

## Aggiunta di variabili survey a un template {#adding-survey-variables-to-a-template}

Le variabili survey si configurano nelle impostazioni del template:

1. Andare in **Task Template** e selezionare il template
2. Aprire la sezione **Variabili survey** nelle impostazioni del template
3. Fare clic su **Aggiungi variabile survey**
4. Configurare la variabile:
   - **Nome**: Nome della variabile (utilizzato nel codice)
   - **Titolo**: Etichetta visualizzata nel modulo
   - **Tipo**: Scegliere il tipo di campo
   - **Passa variabile come**: Variabile extra (predefinito) o variabile d'ambiente
   - **Valore predefinito**: Valore facoltativo precompilato mostrato all'apertura del modulo del task
   - **Obbligatorio**: Indica se il campo deve essere compilato
5. Salvare il template

Quando gli utenti eseguono un task da questo template, vedranno un modulo con le variabili survey personalizzate.

## Tipi di variabili {#variable-types}

Le variabili survey supportano sei tipi:

### String {#string}

Campo di input di testo per valori stringa.

**Casi d'uso**: Nomi di ambienti, nomi di branch, nomi host, percorsi di file

**Esempio**: Una variabile denominata `environment` chiede agli utenti di inserire "production", "staging" o "development"

### Integer {#integer}

Campo di input numerico per valori interi.

**Casi d'uso**: Numeri di porta, numero di tentativi, timeout, limiti di risorse

**Esempio**: Una variabile denominata `timeout_seconds` chiede agli utenti di inserire "300" o "600"

### Text {#text}

Area di testo multiriga per valori stringa più lunghi.

**Casi d'uso**: Messaggi di commit, frammenti JSON, note libere, configurazioni su più righe

**Esempio**: Una variabile denominata `changelog` in cui gli utenti incollano le note di rilascio prima del deploy

### Enum (selezione singola) {#enum-single-select}

Menu a discesa in cui l'utente sceglie esattamente un'opzione da un elenco predefinito.

**Casi d'uso**: Tipo di ambiente, strategia di deploy, scelte di tipo booleano

**Esempio**: Una variabile denominata `deployment_type` con le opzioni: "rolling", "blue-green", "canary"

Quando si crea una variabile enum, aggiungere ogni opzione con un'etichetta visualizzata e un valore nell'editor della variabile.

### Select (selezione multipla) {#select-multi-select}

Menu a discesa in cui l'utente può scegliere una o più opzioni da un elenco predefinito. I valori selezionati vengono passati come array JSON (ad esempio `["staging","production"]`), non come singola stringa.

**Casi d'uso**: Regioni di destinazione, feature flag, più gruppi di host, elenchi di tag

**Esempio**: Una variabile denominata `target_regions` con le opzioni `us-east-1`, `eu-west-1`, `ap-southeast-1`

**Vincoli**:
- I valori predefiniti devono essere scelti dall'elenco delle opzioni e possono includere più selezioni
- Nei template Bash, PowerShell e Python, analizzare l'array JSON dall'argomento o dal valore della variabile d'ambiente (vedere gli esempi seguenti)

### Secret {#secret}

Campo di input di tipo password in cui il valore è nascosto.

**Casi d'uso**: Chiavi API, password, token, configurazioni sensibili

**Esempio**: Una variabile denominata `api_token` in cui il valore inserito viene visualizzato come punti per motivi di sicurezza

## Valori predefiniti {#default-values}

È possibile impostare un valore predefinito facoltativo per la maggior parte dei tipi di variabile. Quando un utente apre la finestra di esecuzione del task, i campi vengono precompilati con questi valori predefiniti.

- **String, integer, text, secret**: un singolo valore predefinito
- **Enum**: un'opzione dall'elenco
- **Select**: una o più opzioni dall'elenco

I valori predefiniti sono utili per le pianificazioni e le integrazioni in cui lo stesso template viene eseguito ripetutamente con parametri prevedibili. Gli utenti possono comunque modificare i valori prima di avviare un task.

## Passa variabile come (destinazione) {#pass-variable-as-target}

Ogni variabile survey può essere trasmessa in uno di due modi:

| Impostazione | Comportamento |
|---------|----------|
| **Variabile extra** (predefinito) | Passata nel modo specifico dell'applicazione: `--extra-vars` di Ansible, `-var` di Terraform o argomenti CLI `name=value` per le applicazioni shell |
| **Variabile d'ambiente** | Impostata come variabile d'ambiente del processo, con nome corrispondente a quello della variabile survey |

Utilizzare **Variabile d'ambiente** quando lo script o lo strumento legge dall'ambiente anziché dai flag CLI. Per le variabili Terraform che devono seguire la convenzione `TF_VAR_`, denominare la variabile survey `TF_VAR_instance_type` e impostare la destinazione su variabile d'ambiente.

Le variabili con destinazione ambiente **non** vengono duplicate negli extra-vars, in `-var` o negli argomenti CLI. Ogni valore viene trasmesso esattamente una volta.

## Come le variabili survey vengono passate ai task {#how-survey-variables-are-passed-to-tasks}

Le variabili survey vengono passate in modo diverso a seconda del tipo di template e dell'impostazione **Passa variabile come**.

**I valori a selezione multipla (tipo `select`)** sono array codificati in JSON in ogni modalità di trasmissione (JSON degli extra-vars, `-var`, argomenti CLI e variabili d'ambiente). Una selezione delle opzioni `1` e `2` diventa `["1","2"]`, non una stringa separata da spazi.

### Template Ansible {#ansible-templates}

Le variabili survey vengono passate come variabili extra di Ansible tramite il flag `--extra-vars`.

**Esempio**: Se si definisce una variabile survey denominata `app_version`:

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

Durante l'esecuzione del task, l'utente inserisce "2.5.0" nel modulo survey e Ansible la riceve come:

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Template Terraform/OpenTofu {#terraformopentofu-templates}

Le variabili survey vengono passate come variabili Terraform tramite il flag `-var`.

**Esempio**: Se si definisce una variabile survey denominata `instance_count`:

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

Durante l'esecuzione del task, l'utente inserisce "3" nel modulo survey e Terraform la riceve come:

```bash
terraform apply -var="instance_count=3"
```

### Template Shell/Bash {#shellbash-templates}

Le variabili survey vengono passate allo script Bash come argomenti da riga di comando:

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

È possibile utilizzare il seguente codice all'interno dello script per analizzare gli argomenti in un array:

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

Per le variabili a **selezione multipla**, il valore è una stringa contenente un array JSON. Analizzarla con `jq` (assicurarsi che `jq` sia disponibile nell'immagine dell'executor):

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### Template PowerShell {#powershell-templates}

Le variabili survey vengono passate allo script PowerShell in esecuzione come argomenti da riga di comando:

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


Per analizzare gli argomenti, utilizzare il seguente codice nello script in esecuzione:

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

Per le variabili a **selezione multipla**, analizzare l'array JSON dal valore dell'argomento:

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Template Python {#python-templates}

Le variabili survey vengono passate allo script Python in esecuzione come argomenti da riga di comando:

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

Per analizzare gli argomenti, utilizzare il seguente codice nello script in esecuzione:

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

Per le variabili a **selezione multipla**, analizzare l'array JSON:

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## Utilizzo delle variabili survey {#using-survey-variables}

### Esecuzione manuale dei task {#manual-task-execution}

Quando si esegue un task da un template con variabili survey:

1. Fare clic su **Esegui** nel template
2. Compare un modulo con tutte le variabili survey definite
3. Compilare i valori di ciascun campo
4. Fare clic su **Esegui task**

Il task viene eseguito con i valori forniti, passati al playbook o allo script.
<!-- 
### Chiamate API {#api-calls}

Per passare i valori delle variabili survey tramite API:

**Esempio di richiesta API:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

I valori delle variabili survey vengono passati nell'oggetto `environment` del payload della richiesta.

**Importante**: Quando viene attivato tramite API, il task viene eseguito senza supervisione: non compare alcun prompt interattivo. -->

### Task pianificati {#scheduled-tasks}

Le pianificazioni possono includere valori delle variabili survey per eseguire lo stesso template con parametri diversi in pianificazioni diverse.

**Configurazione:**

1. Aggiungere le variabili survey al template
2. Creare una pianificazione per quel template
3. Nella configurazione della pianificazione, definire i valori delle variabili survey
4. Ogni esecuzione pianificata utilizza tali valori predefiniti

**Esempio di caso d'uso**: Eseguire un playbook di backup con politiche di conservazione diverse:
- Pianificazione giornaliera con `retention_days=7`
- Pianificazione settimanale con `retention_days=30`
- Pianificazione mensile con `retention_days=365`

Consultare la documentazione sulle [Pianificazioni](../schedules) per maggiori dettagli.

### Integrazioni e webhook {#integrations-and-webhooks}

Le integrazioni possono estrarre valori dai webhook in ingresso e associarli alle variabili survey.

**Configurazione:**

1. Aggiungere le variabili survey al template
2. Creare un'integrazione che attivi questo template
3. Configurare gli estrattori di valori per prelevare i dati dal payload del webhook
4. Associare i valori estratti alle variabili survey

**Esempio**: Attivare un deploy quando viene creata una release su GitHub:
- Estrarre il tag della release dal payload del webhook
- Associarlo a una variabile survey denominata `release_version`
- Il playbook di deploy riceve il numero di versione

Consultare la documentazione sulle [Integrazioni](../integrations) per maggiori dettagli.

## Buone pratiche {#best-practices}

### Utilizzare nomi descrittivi {#use-descriptive-names}

Scegliere nomi chiari e descrittivi per le variabili survey, che ne indichino lo scopo:
- ✅ Corretto: `target_environment`, `app_version`, `backup_retention_days`
- ❌ Sbagliato: `env`, `ver`, `days`

### Fornire titoli utili {#provide-helpful-titles}

Il titolo compare nel modulo, quindi deve essere comprensibile per l'utente:
- Nome della variabile: `db_host`
- Titolo: "Nome host o indirizzo IP del database"

### Utilizzare enum o select per le opzioni note {#use-enum-or-select-for-known-options}

Quando gli utenti devono scegliere tra un insieme limitato di opzioni, utilizzare enum o select anziché string:
- ✅ **Enum** per una sola scelta: production, staging o development
- ✅ **Select** quando sono valide più scelte: diverse regioni o feature flag
- ❌ Campo string con una nota "inserire production o staging"

### Utilizzare la destinazione variabile d'ambiente con criterio {#use-environment-variable-target-deliberately}

Preferire la trasmissione predefinita come variabile extra, a meno che il playbook, lo script o lo strumento non legga esplicitamente dall'ambiente del processo. Denominare le variabili con destinazione ambiente esattamente come si aspetta lo strumento a valle (ad esempio `TF_VAR_region`).

### Contrassegnare i campi obbligatori in modo appropriato {#mark-required-fields-appropriately}

Contrassegnare i campi come obbligatori solo se sono davvero necessari. Valutare di fornire valori predefiniti ragionevoli nei playbook per i campi facoltativi.

### Validare nel codice {#validate-in-your-code}

Non dare per scontato che i valori delle variabili survey siano sempre validi. Aggiungere logica di validazione nei playbook o negli script:

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### Utilizzare i secret per i dati sensibili {#use-secrets-for-sensitive-data}

Utilizzare sempre il tipo secret per i valori sensibili come chiavi API, password o token. In questo modo i valori vengono nascosti nell'interfaccia e nei log.

### Combinare con i Gruppi di variabili {#combine-with-variable-groups}

Le variabili survey funzionano bene insieme ai [Gruppi di variabili](../environment):
- Utilizzare i **Gruppi di variabili** per la configurazione statica condivisa tra i task
- Utilizzare le **Variabili survey** per i valori che cambiano a ogni esecuzione del task

**Esempio**:
- Gruppo di variabili: dettagli di connessione al database, endpoint API
- Variabili survey: ambiente di deploy, numero di versione, feature flag

## Casi d'uso comuni {#common-use-cases}

### Deploy specifici per ambiente {#environment-specific-deployments}

Creare variabili survey per:
- `environment`: enum con le opzioni "production, staging, development"
- `app_version`: string per la versione da distribuire
- `enable_debug`: enum con le opzioni "true, false"

### Operazioni sul database {#database-operations}

Creare variabili survey per:
- `db_name`: string per il nome del database
- `backup_retention_days`: integer per la politica di conservazione
- `maintenance_window`: string per la finestra temporale

### Provisioning dell'infrastruttura {#infrastructure-provisioning}

Creare variabili survey per:
- `instance_count`: integer per il numero di istanze
- `instance_type`: enum con le opzioni "t2.micro, t2.small, t2.medium"
- `region`: enum con le regioni AWS

### Pipeline CI/CD {#cicd-pipelines}

Creare variabili survey per:
- `git_branch`: string per il branch da compilare
- `build_type`: enum con le opzioni "debug, release"
- `run_tests`: enum con le opzioni "true, false"

## Differenze rispetto ai Gruppi di variabili {#differences-from-variable-groups}

| Caratteristica | Variabili survey | Gruppi di variabili |
|---------|-----------------|-----------------|
| **Scopo** | Input di runtime per singolo task | Configurazione statica riutilizzabile |
| **Quando vengono definite** | Al momento dell'esecuzione del task | Preconfigurate nel progetto |
| **Caso d'uso** | Valori che cambiano a ogni esecuzione | Impostazioni condivise tra i task |
| **Formato** | Campi tipizzati individuali | Formato JSON con oggetti annidati |
| **Ambito** | Singola esecuzione del task | Più template/inventory |
| **Sicurezza** | Il tipo secret nasconde i valori sensibili | Scheda Secrets per i dati sensibili |

Utilizzare le variabili survey quando serve flessibilità in fase di esecuzione e i Gruppi di variabili quando si desidera una configurazione coerente tra più esecuzioni di task.
