---
title: Primi passi
description: Installa Semaphore UI, esegui la prima attività Ansible, verifica il risultato e configura una pianificazione.
sidebar_label: Primi passi
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Primi passi

Semaphore UI offre un’interfaccia web e un’API per eseguire automazioni ripetibili con Ansible, Terraform/OpenTofu, Bash, PowerShell e Python. Riunisce automazioni in Git, credenziali, variabili, pianificazioni, workflow e ambienti di esecuzione, conservando stato e log di ogni esecuzione.

Questa guida usa Ansible per il primo esempio pratico. Usa un playbook del tuo repository oppure riproduci l’esempio delle schermate con il repository pubblico [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo).

## 1. Installa Semaphore

Scegli il metodo di installazione in base all’ambiente in cui verrà eseguito Semaphore. Il pacchetto nativo è selezionato per impostazione predefinita.

<Tabs groupId="installation-method">
  <TabItem value="package" label="Pacchetto nativo" default className="InstallationMethod">

Per Debian o Ubuntu su `amd64`:

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

Per RHEL, Fedora, Rocky Linux, AlmaLinux o CentOS Stream su `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

Configura il database e il primo amministratore, quindi avvia Semaphore con la configurazione generata:

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

Per una valutazione locale, scegli SQLite, accetta o imposta i percorsi del database e dei playbook, inserisci l’URL pubblico e crea il primo amministratore quando richiesto.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

Crea `compose.yaml`:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

Genera una chiave di cifratura e inseriscila, insieme a una password amministratore robusta, in un file `.env` accanto a `compose.yaml`:

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

Escludi `.env` dal controllo di versione e avvia il container:

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="Archivio binario" className="InstallationMethod">

Scarica l’archivio per il tuo sistema operativo e l’architettura della CPU da [GitHub Releases](https://github.com/semaphoreui/semaphore/releases). Esempio per Linux `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

Per una valutazione locale, scegli SQLite, accetta o imposta i percorsi del database e dei playbook, inserisci l’URL pubblico e crea il primo amministratore quando richiesto.

Scegli un archivio `darwin` per macOS o un `.zip` per Windows. La procedura Ansible descritta più avanti richiede comunque un ambiente Linux, macOS, WSL, un container o un runner Linux con Ansible installato.

  </TabItem>
  <TabItem value="helm" label="Kubernetes con Helm" className="InstallationMethod">

Aggiungi il chart ufficiale ed esaminane i valori predefiniti prima dell’installazione:

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

Il campo `appVersion` del chart identifica la versione di Semaphore. Prima dell’uso in produzione, configura in `values.yaml` storage persistente, database, credenziali amministratore, chiave di cifratura delle chiavi di accesso e ingress/TLS.

  </TabItem>
</Tabs>

Per una configurazione guidata, usa la [pagina ufficiale di installazione di Semaphore](https://semaphoreui.com/install) per scegliere la versione, generare la configurazione e ottenere i comandi di download o avvio corrispondenti.

<details>
<summary>Non sai quale metodo di installazione scegliere?</summary>

| Metodo di installazione | Quando sceglierlo | Guida dettagliata |
| --- | --- | --- |
| **Pacchetto nativo** | Un server Linux supportato | [Installazione con gestore di pacchetti](/admin-guide/installation/package-manager) |
| **Docker Compose** | Una configurazione isolata rapida o un host di container | [Installazione Docker](/admin-guide/installation/docker) |
| **Archivio binario** | macOS, Windows, FreeBSD o Linux senza un pacchetto adatto | [Installazione del binario](/admin-guide/installation/binary-file) |
| **Kubernetes con Helm** | Un cluster Kubernetes esistente | [Installazione Kubernetes](/admin-guide/installation/k8s) |

Le guide dettagliate descrivono database di produzione, servizi, segreti, storage, ingress e aggiornamenti.

</details>

Per questa procedura Ansible, `git --version` e `ansible-playbook --version` devono funzionare sul server Semaphore o sul runner. Se manca uno dei comandi, installa [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) e [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) prima di continuare.

:::tip Installazione in produzione
Prima di usare Semaphore in produzione, consulta [Configurazione](/admin-guide/configuration), [Sicurezza](/admin-guide/security), [Runner](/admin-guide/runners), [Alta disponibilità](/admin-guide/ha) e [Aggiornamento](/admin-guide/upgrading).
:::

## 2. Accedi

1. Apri Semaphore nel browser. Un’installazione locale usa normalmente [http://localhost:3000](http://localhost:3000).
2. Inserisci nome utente e password amministratore definiti da `semaphore setup` o dalle variabili amministratore di Docker.
3. Seleziona **Sign In**.

![Schermata di accesso di Semaphore](/assets/getting-started/sign-in.jpg)

Usa l’account amministratore per la configurazione iniziale, perché può creare progetti e utenti. Gli utenti normali accedono dalla stessa pagina dopo che un amministratore ha creato i loro account e concesso l’accesso al progetto. Consulta [Gestione utenti](/user-guide/admin/users).

## 3. Crea un progetto

Dopo l’accesso a un’istanza Semaphore vuota, si apre automaticamente la pagina **New Project**. Se esistono già progetti, apri il selettore dei progetti e scegli **New Project...**. Compila il modulo:

| Campo | Cosa inserire |
| --- | --- |
| **Project Name** | Un nome riconoscibile per lo spazio di lavoro, ad esempio `Production infrastructure` o il nome dell’applicazione. |
| **Max number of parallel tasks** | Facoltativo. Limita le attività simultanee del progetto; lascia vuoto per usare il limite del server. |
| **Telegram Chat ID** | Facoltativo. Usato quando sono configurate notifiche Telegram per il progetto. |
| **Allow alerts for this project** | Facoltativo. Attiva le notifiche configurate del progetto. |
Seleziona **Create**.

Non selezionare **Create Demo Project**: aggiunge risorse di esempio, mentre questa guida crea un progetto vuoto. Creando altri progetti in seguito, la stessa opzione appare come interruttore **Demo** nella finestra New Project.

![Modulo New Project vuoto con tutti i campi disponibili](/assets/getting-started/new-project-empty.jpg)

Il nuovo progetto contiene le sezioni **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store** e **Repositories**. Consulta [Progetti](/user-guide/projects) per impostazioni, accesso del team, attività e cronologia.

<details>
<summary>Guarda questo passaggio</summary>

![Creazione del primo progetto in un’istanza Semaphore vuota](/assets/getting-started/create-first-project.gif)

</details>

## 4. Comprendi i concetti fondamentali

Il nuovo progetto si apre su una Dashboard vuota. La barra laterale è la navigazione principale del progetto:

![Interfaccia di un progetto Semaphore vuoto prima dell’aggiunta di risorse e attività](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** mostra cronologia delle esecuzioni, statistiche, attività e impostazioni del progetto.
- **Task Templates**, **Workflows** e **Schedule** definiscono cosa viene eseguito e quando.
- **Repositories**, **Inventory**, **Variable Groups** e **Key Store** forniscono codice, destinazioni, variabili e credenziali.
- **Integrations**, **Team** e **Runners** collegano sistemi esterni, utenti e host di esecuzione.

Il diagramma mostra come queste risorse producono un’esecuzione:

<div class="BlockSchema">
  ![Come risorse e trigger di Semaphore generano l’esecuzione di un’attività](/assets/getting-started/core-concepts.svg)
</div>

Un’azione nell’interfaccia, una richiesta API o una pianificazione può avviare direttamente un **Task Template** oppure un **Workflow** che usa modelli di attività. Semaphore crea un’esecuzione, visualizzata come **Task** nell’interfaccia, e la invia al server Semaphore o a un runner remoto idoneo. Per Ansible, quell’host esegue `ansible-playbook`; l’Inventory elenca i sistemi gestiti da Ansible.

| Concetto | Funzione |
| --- | --- |
| [**Project**](/user-guide/projects) | Uno spazio di lavoro isolato con risorse di automazione, autorizzazioni e cronologia delle esecuzioni. |
| [**Repository**](/user-guide/repositories) | Indica il branch o tag Git contenente i file di automazione usati da un’attività. |
| [**Key Store**](/user-guide/key-store) | Conserva chiavi SSH, credenziali, token e password Ansible Vault riutilizzabili fuori da Git e dagli input delle attività. |
| [**Inventory**](/user-guide/inventory) | Indica ad Ansible quali host e gruppi gestire e quali credenziali usare. |
| [**Variable Group**](/user-guide/environment) | Conserva variabili Ansible, variabili d’ambiente e segreti riutilizzabili per uno o più modelli. |
| [**Task Template**](/user-guide/task-templates/) | Salva cosa eseguire: tipo di automazione, file, repository, inventario, variabili, parametri richiesti e opzioni di esecuzione. |
| [**Task (task run)**](/user-guide/tasks) | Una singola esecuzione con input, stato, timestamp, log, dettagli e risultato propri. |
| **Workflow** | Collega modelli di attività in un percorso a più passi con rami di successo, errore, approvazione e note. |
| [**Schedule**](/user-guide/schedules) | Avvia un modello di attività o workflow una volta o ripetutamente tramite un’espressione cron. |
| [**Runner**](/admin-guide/runners) | Esegue le attività in coda fuori dal server Semaphore principale, ad esempio in un’altra rete o zona di sicurezza. |

## 5. Collega il repository

Un Repository collega Semaphore all’automazione in Git; Semaphore non memorizza il playbook stesso. Collega il tuo repository oppure usa i valori della demo pubblica riportati sotto per riprodurre esattamente l’esempio. Le [Integrazioni](/user-guide/integrations) sono una funzione separata per avviare automazioni da GitHub, GitLab o altre sorgenti webhook.

1. Apri **Repositories** e seleziona **New Repository**.
2. Inserisci nome, URL, branch e credenziali del repository. Per la demo pubblica, usa:

   | Campo | Valore |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None`, perché questo repository è pubblico |

3. Seleziona **Create**.

![Modulo repository compilato con il repository pubblico della demo Semaphore](/assets/getting-started/repository-settings.jpg)

Il repository dovrebbe apparire nell’elenco. Semaphore lo clona o aggiorna sull’host di esecuzione quando parte un’attività, non quando crei il record Repository. La schermata mostra i valori demo usati in questa guida.

![Repository Demo collegato nell’elenco dei repository del progetto](/assets/getting-started/connected-repository.jpg)

Per un repository privato, scegli credenziali adeguate dal Key Store al posto di `None`. Consulta [Repository](/user-guide/repositories) per percorsi locali, HTTPS, SSH, branch, credenziali e file di dipendenze.

## 6. Aggiungi una chiave SSH per un host remoto gestito

Queste credenziali SSH permettono ad Ansible di connettersi dal server Semaphore o dal runner a un host remoto nell’Inventory. Se segui la demo `localhost`, non serve una chiave SSH; passa al punto 7.

La demo usa `localhost` con `ansible_connection=local`, quindi non apre una connessione SSH. Se il tuo playbook gestisce un host remoto, aggiungi la sua chiave:

1. Aggiungi la parte pubblica della chiave a `~/.ssh/authorized_keys` sull’host gestito.
2. Apri **Key Store** e seleziona **New Key**.
3. Inserisci un nome riconoscibile, ad esempio `Production hosts`, mantieni selezionato **Local** e scegli **SSH Key**.
4. Inserisci l’account che Ansible deve usare sull’host, ad esempio `ubuntu` o `ec2-user`.
5. Incolla la chiave privata completa, incluse le righe `BEGIN` e `END`, e aggiungi la passphrase se richiesta.
6. Seleziona **Create**. Nel passaggio successivo, scegli questa chiave in **Inventory → User Credentials**.

![Modulo New SSH Key per l’account usato sugli host gestiti](/assets/getting-started/add-managed-host-ssh-key.jpg)

La schermata contiene un segnaposto, non un segreto valido. Non pubblicare mai una chiave privata in documentazione, schermate, argomenti delle attività o controllo di versione.

Semaphore può conservare i segreti localmente o integrare archivi esterni come [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) e [Devolutions Server](/user-guide/key-store/devolutions-server). Consulta [Archivio chiavi](/user-guide/key-store) per tutti i tipi di credenziali e le opzioni di archiviazione supportati.

## 7. Crea l’inventario Ansible

Ogni attività Ansible richiede un inventario. Per una prima esecuzione locale, aggiungi al repository un file come `inventory.ini`:

```ini
[local]
localhost ansible_connection=local
```

Qui `localhost` indica l’host di esecuzione, cioè il server Semaphore, il container o il runner, non necessariamente il computer con il browser aperto. `ansible_connection=local` indica ad Ansible di non usare SSH. Il repository demo usa il file equivalente `invs/prod/hosts` con un gruppo chiamato `site`.

Se hai creato `inventory.ini` nel tuo repository, esegui commit e push nel branch collegato a Semaphore prima di continuare.

1. Apri **Inventory** e seleziona **New Inventory → Ansible Inventory**.
2. Inserisci i valori corrispondenti al tuo inventario. Ad esempio:

   | Campo | Valore |
   | --- | --- |
   | **Name** | `Local` (`Prod` nella demo) |
   | **User Credentials** | `None` per `localhost`; usa le credenziali SSH dell’host per un inventario remoto |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini` (`invs/prod/hosts` nella demo) |

3. Lascia vuoti **Runner tag**, **Sudo Credentials** e **Repository**, poi seleziona **Create**.

![Inventario Ansible su file configurato con i valori del repository demo](/assets/getting-started/ansible-inventory-settings.jpg)

Lasciando **Repository** vuoto, Semaphore risolve il percorso relativo dell’inventario dal repository selezionato nel modello di attività. Seleziona qui un repository solo quando l’inventario si trova altrove. Per un host remoto, usa la chiave SSH del punto 6 come **User Credentials**.

Consulta [Inventario](/user-guide/inventory) per inventari statici, basati su file e dinamici.

## 8. Aggiungi un gruppo di variabili (facoltativo)

Un **Variable Group** è un insieme riutilizzabile di valori associabile a uno o più modelli di attività. Usa **Extra variables** per le variabili Ansible, **Environment variables** per i valori esportati al processo e **Secrets** per i valori sensibili da cifrare e mascherare. In questo modo la configurazione specifica dell’ambiente resta fuori dal playbook e non devi ripetere gli stessi valori in ogni modello.

La prima attività funziona senza un gruppo di variabili. Come esempio, creane uno che imposti `ansible_python_interpreter=auto_silent`; Ansible continuerà a rilevare Python automaticamente, ma non stamperà l’avviso informativo sul rilevamento.

1. Apri **Variable Groups** e seleziona **New Group**.
2. Imposta **Group Name** con un nome descrittivo, ad esempio `Ansible defaults`.
3. In **Variables → Extra variables**, mantieni selezionato **Table** e scegli **+**.
4. Inserisci:

   | Nome | Tipo | Valore |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. Seleziona **Save**.

![Gruppo di variabili configurato nell’editor a tabella](/assets/getting-started/variable-group-table.jpg)

Consulta [Gruppi di variabili](/user-guide/environment) per le regole di precedenza e le opzioni di archiviazione dei segreti.

## 9. Crea il modello di attività Ansible

### Esamina il playbook in Git

Se il repository collegato contiene già un playbook Ansible, usalo. Altrimenti aggiungi un piccolo esempio come `get-started.yml`:

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

Se segui la demo, usa invece il suo [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml). Si rivolge al gruppo `site` dell’inventario demo ed esegue il ruolo `ping` incluso.

La demo scarica quel ruolo da un sottomodulo Git e invia una richiesta ICMP a `semaphoreui.com`, quindi l’host di esecuzione deve poter accedere a GitHub e inviare traffico ICMP. Se ICMP è bloccato, usa l’esempio locale `get-started.yml`.

![ping.yml nel repository GitHub collegato](/assets/getting-started/demo-playbook-github.jpg)

La schermata mostra il playbook nel repository pubblico della demo. Conservare l’automazione in Git rende le modifiche verificabili e consente a Semaphore di registrare il commit esatto usato per ogni esecuzione.

Se hai creato `get-started.yml` nel tuo repository, esegui commit e push nel branch collegato a Semaphore prima di continuare.

### Configura il modello

1. Apri **Task Templates** e seleziona **New template → Applications**.
2. Abilita **Ansible Playbook**, quindi torna a **Task Templates**.
3. Seleziona **New template → Ansible Playbook**.
4. Mantieni selezionata la scheda **Task**. **Build** e **Deploy** sono tipi di modello CI/CD con versioni e non servono per questa esecuzione indipendente.
5. Configura il modello con valori corrispondenti ai tuoi file. Ad esempio:

   | Campo | Valore | Funzione |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | Identifica il modello riutilizzabile e la cronologia delle sue attività. |
   | **Repository** | Il tuo repository (`Demo` nell’esempio) | Fornisce il playbook e i file correlati. |
   | **Path to playbook file** | `get-started.yml` (`ping.yml` nella demo) | Si risolve dalla radice del repository. |
   | **Inventory** | `Local` (`Prod` nella demo) | Fornisce la destinazione locale per la prima esecuzione. |
   | **Variable Groups** | `Ansible defaults`, se creato | Aggiunge l’impostazione Ansible riutilizzabile facoltativa. |
   | **Runner tag** | Lascia vuoto | Usa l’esecuzione locale o il runner predefinito secondo la configurazione del server. |

6. In **Ansible options**, abilita **Skip Galaxy install** per il piccolo playbook sopra o la demo pubblica: nessuno dei due richiede dipendenze Galaxy per questa attività. Lascia l’opzione disabilitata se il tuo repository richiede ruoli o collection da un file `requirements.yml`.
7. Seleziona **Create**.

![Modello di attività Ansible con repository, inventario e gruppo di variabili](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>Guarda questo passaggio</summary>

![Abilitazione di Ansible e creazione del primo modello di attività Ansible](/assets/getting-started/create-ansible-template.gif)

</details>

Altri campi utili:

- **Vaults** seleziona le password del Key Store per contenuti Ansible cifrati.
- **Limit**, **Tags** e **Skip tags** limitano ciò che il playbook esegue.
- **Prompts** consentono a un utente, una pianificazione o una richiesta API di sovrascrivere i valori abilitati per una specifica esecuzione.
- **Runner tag** controlla dove viene eseguita l’attività; non seleziona una destinazione Ansible.

Consulta [Modelli Ansible](/user-guide/apps/ansible) e [Modelli di attività](/user-guide/task-templates/) per tutti i campi e le opzioni di esecuzione.

## 10. Esegui il modello e ispeziona l’attività

1. Apri il modello di attività creato e seleziona **Run**.
2. Aggiungi un messaggio facoltativo, ad esempio `First Semaphore run`.
3. Lascia disabilitati **Dry Run** e **Diff**, poi seleziona **Run**.

![Finestra New Task senza opzioni aggiuntive per il playbook Ansible](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore accoda l’attività, prepara il repository, applica l’inventario e il gruppo di variabili facoltativo, quindi esegue il playbook selezionato. Lo stato passa per **Waiting** e **Running** prima di terminare con **Success** o **Failed**.

### Log

**Log** contiene l’output effettivo dei comandi. Leggi il `PLAY RECAP` finale, non soltanto l’indicatore verde di stato.

![Log di un’attività Ansible riuscita con output ping e PLAY RECAP](/assets/getting-started/ansible-task-log-variable-group.jpg)

I contatori esatti dipendono dal playbook. La prima esecuzione riuscita dovrebbe terminare con `unreachable=0` e `failed=0` per `localhost`. Se il log della demo mostra `changed=1`, significa che il passo ping tramite shell è stato eseguito e ha segnalato una modifica; non è un errore.

### Dettagli e riepilogo

| Scheda | Cosa controllare |
| --- | --- |
| **Log** | Fasi di esecuzione in diretta, output dei moduli, errori e `PLAY RECAP` finale. |
| **Details** | Tipo di modello, commit Git, messaggio di esecuzione, autore, timestamp e durata. |
| **Summary** | Risultati ed errori Ansible per host al termine, quando la funzione di riepilogo attività è disponibile. |

![Dettagli dell’attività con modello, commit e informazioni temporali](/assets/getting-started/ansible-task-details.jpg)

![Riepilogo dell’attività con conteggi degli host OK e Not OK](/assets/getting-started/ansible-task-summary.jpg)

Se **Summary** non è disponibile, verifica l’esecuzione in **Log**; `PLAY RECAP` resta il risultato Ansible di riferimento.

<details>
<summary>Guarda l’esecuzione e il risultato</summary>

![Esecuzione dell’attività Ansible e verifica di log e dettagli](/assets/getting-started/run-and-inspect-task.gif)

</details>

### Trova le esecuzioni precedenti

Chiudi la finestra dell’attività per tornare alla scheda **Tasks** del modello. Ogni esecuzione ha numero attività, stato, utente, ora di inizio, durata e log conservato propri. **Dashboard → History** mostra le esecuzioni di tutti i modelli del progetto. Consulta [Attività](/user-guide/tasks) e [Cronologia del progetto](/user-guide/projects/history) per ulteriori dettagli.

![Cronologia di un modello Ansible con esecuzioni riuscite](/assets/getting-started/ansible-template-history.jpg)

Se l’attività fallisce, usa l’ultima riga significativa del log per scegliere il controllo successivo:

- Un errore di clonazione indica problemi con URL del repository, branch, Access Key o accesso di rete dall’host di esecuzione.
- `ansible-playbook: command not found` significa che Ansible non è installato sul server Semaphore o sul runner selezionato.
- `UNREACHABLE` indica problemi con gli indirizzi dell’inventario, le credenziali dell’host, la raggiungibilità SSH o la verifica della chiave dell’host.
- Un passo Ansible fallito mostra normalmente nome dell’attività, host ed errore del modulo subito sopra `PLAY RECAP`.

## 11. Esegui l’attività secondo una pianificazione

Dopo un’esecuzione riuscita dall’interfaccia, puoi avviare l’attività automaticamente. Ad esempio, l’espressione cron `0 3 * * *` la avvia ogni giorno alle 03:00 nel fuso orario mostrato da Semaphore.

1. Apri **Schedule** e seleziona **New Schedule → Cron**.
2. Inserisci un nome descrittivo, ad esempio `Nightly playbook`.
3. Seleziona il modello di attività da eseguire.
4. Mantieni **Show cron format** abilitato e inserisci un’espressione cron, ad esempio `0 3 * * *`.
5. Mantieni **Enabled** selezionato e scegli **Save**.

![Pianificazione cron per eseguire l’attività di esempio ogni giorno alle 03:00](/assets/getting-started/create-cron-schedule.jpg)

Semaphore mostra il fuso orario configurato e calcola la prossima esecuzione prima del salvataggio. Un’esecuzione pianificata usa gli stessi repository, inventario, gruppi di variabili e impostazioni di esecuzione del modello. Se il modello espone parametri richiesti, la pianificazione può fornirne i valori. Consulta [Pianificazioni](/user-guide/schedules) per sintassi cron, fusi orari, esecuzioni singole e parametri pianificati.

Dopo il salvataggio, verifica che la pianificazione sia **Enabled** e che **Next run** mostri l’ora prevista. Le attività pianificate appaiono nella scheda **Tasks** del modello e in **Dashboard → History**.

## Cosa provare dopo

Dopo la prima attività Ansible riuscita:

- Aggiungi credenziali private adeguate nell’[Archivio chiavi](/user-guide/key-store) se il repository richiede autenticazione.
- Crea un **Workflow** quando più modelli richiedono percorsi ordinati di successo, errore, approvazione o note.
- Usa le [Integrazioni](/user-guide/integrations) per trigger webhook autenticati da GitHub, GitLab o altri sistemi.
- Usa l’[API](/reference/api) per gestire risorse e avviare modelli da codice.
- Aggiungi un [runner remoto](/admin-guide/runners) se l’esecuzione deve avvenire in un’altra rete, sistema operativo o zona di sicurezza.

Per la produzione, esponi Semaphore tramite HTTPS, esegui il backup del database insieme al segreto di cifratura delle chiavi di accesso, configura l’autenticazione centralizzata e consulta [Sicurezza](/admin-guide/security), [Log](/admin-guide/logs) e [Aggiornamento](/admin-guide/upgrading).
