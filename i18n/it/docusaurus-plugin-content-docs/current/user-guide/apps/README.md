# Applicazioni

Un'applicazione è lo strumento che un Task Template esegue. Semaphore include sette applicazioni integrate; gli amministratori possono attivarle, disattivarle e registrarne di proprie.

| Applicazione | ID | Cosa esegue un Task Template | Guida |
|---|---|---|---|
| Ansible Playbook | `ansible` | `ansible-playbook` con l'Inventory selezionato | [Ansible](./ansible) |
| Terraform Code | `terraform` | `terraform` nella sottodirectory e nel workspace selezionati | [Terraform/OpenTofu](./terraform) |
| OpenTofu Code | `tofu` | `tofu`, con le stesse opzioni di Terraform | [Terraform/OpenTofu](./terraform) |
| Terragrunt Code | `terragrunt` | `terragrunt` come wrapper di Terraform o OpenTofu | [Terragrunt](./terragrunt) |
| Bash Script | `bash` | uno script di shell con `/bin/bash` | [Shell](./bash) |
| PowerShell Script | `powershell` | uno script `.ps1` con `pwsh` | [PowerShell](./powershell) |
| Python Script | `python` | uno script `.py` con `python3` | [Python](./python) |

Lo strumento stesso deve essere installato sulla macchina che esegue i Task: il server Semaphore oppure il [Runner](/admin-guide/runners). L'immagine Docker ufficiale contiene Ansible, Terraform, OpenTofu, Bash e Python.

## Gestione delle applicazioni {#managing-applications}

Gli amministratori aprono **Applications** dal menu dell'account in fondo alla barra laterale.

![Pagina Applications](/assets/apps-list.webp)

L'interruttore presente in ogni riga abilita o disabilita l'applicazione. Un'applicazione disabilitata non viene proposta nel modulo del Task Template, mentre i Task Template esistenti continuano a funzionare. Solo le applicazioni abilitate vengono mostrate durante la creazione di un Task Template, quindi è opportuno disabilitare gli strumenti che non sono installati sul proprio server.

Fare clic su un'applicazione per modificarne il titolo, l'icona, il percorso del file binario e la priorità (l'ordine nel modulo del Task Template).

## Applicazioni personalizzate {#custom-applications}

**New App** registra come applicazione qualsiasi strumento a riga di comando:

| Campo | Descrizione |
|---|---|
| **ID** | Identificatore breve utilizzato nell'API e nei Task Template, ad esempio `pulumi`. |
| **Icon** | Icona mostrata accanto al nome. |
| **Name** | Titolo mostrato nel modulo del Task Template. |
| **Path** | Percorso dell'eseguibile sul server o sul Runner. |
| **Priority** | Posizione nell'elenco delle applicazioni. |
| **Active** | Indica se l'applicazione viene proposta nei Task Template. |

Un Task Template di un'applicazione personalizzata esegue l'eseguibile passando come argomento il file di script presente nel Repository e riceve i Variable Group come variabili d'ambiente, allo stesso modo dei Task Template [Bash](./bash).

Le applicazioni possono essere predefinite anche nella configurazione del server, vedere la sezione `apps` in [Configurazione](/admin-guide/configuration).
