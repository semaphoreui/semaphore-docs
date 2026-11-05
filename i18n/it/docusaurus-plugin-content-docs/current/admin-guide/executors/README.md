---
title: Executor
description: Come un runner esegue le attività con l'executor locale, Docker o Kubernetes, cosa viene eseguito nei container e cosa gli executor a container non supportano.
---

# Executor

Un executor stabilisce **dove un runner avvia il processo dell'attività**. Il runner
continua a interrogare il server, riceve l'attività e invia il log; cambia solo il luogo
in cui viene eseguito il processo Ansible, Terraform o shell.

| Executor | `runner.executor.type` | Dove viene eseguita un'attività | Edizione |
|---|---|---|---|
| Locale | `local` (predefinito) | Un processo figlio sull'host del runner, con i file, gli strumenti e il `PATH` del runner. | Community |
| Docker | `docker` | Un nuovo container su un daemon Docker, rimosso dopo l'attività. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Un nuovo Pod in un namespace Kubernetes, eliminato dopo l'attività. | <FeatureState feature="k8s-executor" /> |

L'executor è un'impostazione del **runner**, non del server né del template. Il server
Semaphore esegue sempre le attività localmente; per eseguire le attività in container,
avviare un [runner](/admin-guide/runners) e indirizzarvi i template con un tag del runner.

## Scegliere un executor {#choose-an-executor}

| Serve | Usare |
|---|---|
| Strumenti installati su una macchina, accesso ai suoi file, output dei workflow | Locale |
| Un ambiente pulito per ogni attività, toolchain diverse per template, su uno o pochi host | [Docker](./docker) |
| Attività distribuite su un cluster, RBAC e Secret di Kubernetes, nessun socket Docker | [Kubernetes](./kubernetes) |

## Impostare l'executor {#set-the-executor}

Aggiungere il blocco `executor` alla sezione `runner` del file di configurazione del runner:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

Oppure impostare la variabile d'ambiente:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

Ogni opzione ha una variabile d'ambiente; gli elenchi completi si trovano nelle pagine
[Docker](./docker#configuration-reference) e [Kubernetes](./kubernetes#configuration-reference).
Riavviare il runner dopo aver cambiato executor.

:::info
Gli executor a container fanno parte della build Pro del runner. Usare l'immagine
`semaphoreui/runner` o il binario ufficiale `semaphore`. L'immagine
`semaphoreui/runner-community` è compilata senza di essi e all'avvio registra nel log
`docker executor is only available in the proprietary build`.
:::

## Come viene eseguita un'attività in container {#how-a-container-task-runs}

Entrambi gli executor a container eseguono un'attività allo stesso modo:

1. **Preparazione.** Il runner crea un workspace condiviso e mette i segreti dell'attività
   (chiavi SSH, password del vault, variabili extra, un inventario statico) dove i
   container possono leggerli.
2. **Clonazione.** Un container *helper* di breve durata clona il repository in
   `/workspace/repo` (`git clone --depth 1` del branch dell'attività).
3. **Build.** Il container *build* si avvia in `/workspace/repo` ed esegue l'applicazione:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` o il binario di un'applicazione personalizzata. Il suo codice di uscita è il risultato dell'attività.
4. **Log.** L'output di entrambi i container viene trasmesso nel log dell'attività durante l'esecuzione.
5. **Pulizia.** Container, volumi, Secret e ConfigMap dell'attività vengono rimossi,
   sia che l'attività sia riuscita, fallita o sia stata interrotta.

| Passo | Docker | Kubernetes |
|---|---|---|
| Workspace | Volume con nome `semaphore-workspace-<task>-<random>` | Volume `emptyDir` del Pod |
| Segreti | Volume con nome `semaphore-secrets-<task>-<random>`, montato in sola lettura | Un Secret o ConfigMap per tipo, montato in sola lettura |
| Clonazione | Container `semaphore-job-<task>-<random>-clone` | Init container `git-clone` |
| Build | Container `semaphore-job-<task>-<random>-build` | Container `build` del Pod `semaphore-job-<task>-<random>` |
| Pulsante Stop | `docker stop` con `cleanup_grace_seconds`, poi rimozione | Pod eliminato con `cleanup_grace_seconds` |

Un'attività interrotta dall'interfaccia termina nello stato **Stopped**, come con l'executor locale.

## All'interno del container build {#inside-the-build-container}

| Percorso | Contenuto |
|---|---|
| `/workspace` | Workspace scrivibile; anche la `HOME` dell'attività. |
| `/workspace/repo` | Il repository clonato; la directory di lavoro. |
| `/secrets/ssh/<key id>/id_rsa` | Chiave privata SSH del repository o dell'inventario. Caricata in `ssh-agent` prima dell'avvio dell'applicazione. |
| `/secrets/vault/<name>` | Password del vault Ansible, passata come `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Variabili extra del Variable Group più `semaphore_vars`, passate come `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` o `inventory.yml` | Un inventario statico memorizzato in Semaphore. Gli inventari di tipo file vengono letti dal repository. |

Il container riceve un insieme fisso di variabili d'ambiente, elencate in
[Variabili d'ambiente delle attività](/reference/task-environment#container-executors). Le
`env_vars`, le `forwarded_env_vars`, il `PATH` e i percorsi `apps.*` del runner **non**
vengono passati al container.

## Immagini {#images}

In ogni attività intervengono due immagini:

| Immagine | Predefinita | Usata per | Richiede |
|---|---|---|---|
| Immagine di build | `semaphoreui/job:latest` | Eseguire l'applicazione. | `sh`, il binario dell'applicazione nel `PATH`; per le chiavi SSH `ssh-agent`, `ssh-add`, `setsid`. |
| Immagine helper | `semaphoreui/helper:latest` | Clonare il repository (Docker la usa anche per riempire il volume dei segreti). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` è una Debian con Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu e Terragrunt. Viene eseguita come utente `nobody`, gruppo `0`.

L'immagine di build si imposta per runner (`image`) e può essere sovrascritta per template
con il campo **Executor image**, vedere
[Immagine dell'executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
L'immagine helper si imposta solo per runner.

### Creare un'immagine personalizzata {#build-a-custom-image}

Estendere `semaphoreui/job` quando le attività richiedono collection Ansible, pacchetti
Python o strumenti aggiuntivi. Gli executor a container **non** installano il
`requirements.yml` del repository, quindi includere collection e ruoli nell'immagine:

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

Se si crea un'immagine da zero, mantenere queste proprietà di `semaphoreui/job`:

- `/workspace` esiste ed è scrivibile dall'utente con cui viene eseguito il container.
- `/etc/passwd` è scrivibile dal gruppo (`chmod g=u /etc/passwd`). Un container avviato con un
  UID casuale (OpenShift) ottiene così una voce in passwd, richiesta da OpenSSH e Git.
- L'immagine non ha bisogno di un entrypoint particolare: l'executor esegue il suo script con `sh -c`.

## Limitazioni {#limitations}

Rispetto all'executor locale, gli executor a container attualmente:

| Non supportato | Cosa fare invece |
|---|---|
| Credenziali dell'inventario di tipo **Login with password** (password SSH o password di become) | Usare una chiave SSH. Un'attività con una chiave di questo tipo fallisce con `inventory login_password authentication is not supported`. |
| Attività Terraform che attendono una conferma manuale | Abilitare **Auto approve** nel template, oppure eseguire attività di solo plan. Altrimenti l'attività fallisce con `terraform manual approval is not supported`. |
| Repository di tipo **Local** | Il workspace resta vuoto; usare un repository Git. |
| Installazione di `requirements.yml` (ruoli e collection Galaxy) | [Includerli nell'immagine](#build-a-custom-image). |
| Output dei workflow (`SEMAPHORE_OUTPUTS_FILE`) | Usare l'executor locale per le attività i cui output vengono letti da un workflow. |
| Credenziali per host dalla configurazione dell'host | Usare l'executor locale. |
| Cronologia Git oltre l'ultimo commit | Il clone è superficiale (`--depth 1`). |

Le chiavi host SSH non vengono verificate: la clonazione accetta una nuova chiave host e
Ansible viene eseguito con `ANSIBLE_HOST_KEY_CHECKING=False`.

## Pagine correlate {#related-pages}

- [Executor Docker](./docker): configurazione, opzioni, sicurezza, risoluzione dei problemi.
- [Executor Kubernetes](./kubernetes): RBAC, deployment del runner, configurazione, risoluzione dei problemi.
- [Runner](/admin-guide/runners): registrare e avviare un runner.
- [Opzioni di configurazione](/reference/configuration): tutte le opzioni `runner.executor.*`.
