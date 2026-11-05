---
title: Executor Docker
description: Eseguire ogni attività di un runner in un nuovo container Docker su un daemon locale o remoto, con esempi di configurazione, note di sicurezza e risoluzione dei problemi.
sidebar_custom_props:
  edition: pro
---

# Executor Docker <FeatureState feature="docker-executor" />

Con l'executor Docker un runner avvia ogni attività in un nuovo container e lo rimuove
al termine dell'attività. Il runner comunica con un daemon Docker tramite la sua API: il
daemon può trovarsi sullo stesso host oppure essere remoto via TLS.

Come viene eseguita un'attività in container, cosa contiene il container e cosa non è
supportato è descritto in [Executor](./#how-a-container-task-runs). Questa pagina tratta la configurazione Docker.

## Prima di iniziare {#before-you-begin}

- Un server Semaphore con licenza Pro o Enterprise.
- Un runner registrato sul server, vedere [Runner](/admin-guide/runners). Usare
  l'immagine `semaphoreui/runner` o il binario ufficiale `semaphore`.
- Docker Engine raggiungibile dal runner e il permesso di usarlo: appartenenza al
  gruppo `docker`, accesso al socket montato o certificati client TLS.
- Il daemon può scaricare `semaphoreui/job` e `semaphoreui/helper` (o le proprie immagini).

## Avvio rapido {#quick-start}

Aggiungere l'executor alla configurazione del runner e riavviare il runner:

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

Senza altre opzioni il runner usa il socket locale (`DOCKER_HOST` se impostato,
altrimenti `unix:///var/run/docker.sock`), l'immagine di build `semaphoreui/job:latest` e
la rete `bridge`.

Eseguire una qualsiasi attività indirizzata a questo runner. Il log dell'attività inizia con:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

Mentre l'attività è in esecuzione se ne possono vedere i container:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Esempi {#examples}

### Binario del runner su un host Docker {#runner-binary-on-a-docker-host}

Il runner viene eseguito come servizio systemd sullo stesso host di Docker. Dare al suo
utente l'accesso al socket:

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### Runner in un container con il socket dell'host {#runner-in-a-container-with-the-host-socket}

Il container del runner controlla il daemon dell'host tramite il socket montato; i container
delle attività sono fratelli del runner, non annidati al suo interno. L'immagine del runner
viene eseguita con UID `1001`, quindi aggiungerlo al gruppo proprietario del socket:

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

Il volume `semaphore-runner-data` conserva il token del runner emesso alla registrazione,
così il runner non si registra di nuovo dopo un riavvio.

Lo stesso con Docker Compose:

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

I segreti raggiungono l'attività tramite un volume con nome sul daemon, mai tramite il file
system del runner, quindi non occorre condividere altri percorsi tra il runner e l'host.

### Daemon Docker remoto via TLS {#remote-docker-daemon-over-tls}

Il runner e il daemon si trovano su macchine diverse. Proteggere la porta del daemon con
TLS reciproco (vedere [Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
e mettere i file client sul runner:

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

Quando `cert_path` è impostato, il runner verifica il certificato del daemon con `ca.pem` e
si autentica con `cert.pem` e `key.pem`. I nomi dei file sono fissi.

:::warning
Senza `cert_path` una connessione `tcp://` è HTTP in chiaro, e chiunque raggiunga la porta
controlla il daemon. `tls_verify` da solo non abilita TLS (⚠️ 2026-11-05: l'opzione viene
letta ma non applicata); impostare sempre `cert_path` per un daemon remoto.
:::

### Una rete per i servizi interni {#a-network-for-internal-services}

Per impostazione predefinita i container delle attività si collegano a `bridge`. Per
consentire alle attività di raggiungere servizi tramite il nome del container, o per
isolarle in una propria rete, creare una rete e impostarla:

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` accetta qualsiasi modalità di rete supportata da Docker: un nome di rete, `bridge`,
`host` o `none`. Il container di clonazione si collega alla stessa rete, quindi con `none` il
repository non può essere clonato.

### Immagini da un registry privato {#images-from-a-private-registry}

L'executor scarica le immagini senza credenziali del registry. Per un'immagine privata,
effettuare il login e scaricarla sull'host del daemon, mantenendo una pull policy che non
la scarichi di nuovo:

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

Con `if-not-present` usare un tag di versione anziché `latest`: un tag già presente sul
daemon non viene mai aggiornato. `never` fa fallire l'attività se l'immagine manca, invece
di tentare un pull.

### L'intero blocco in una sola variabile {#the-whole-block-as-one-variable}

Per i deployment configurati solo tramite l'ambiente, passare il blocco dell'executor
come JSON:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Riferimento della configurazione {#configuration-reference}

Tutte le opzioni si trovano sotto `runner.executor.docker` nella configurazione del runner.

| Opzione | Variabile d'ambiente | Predefinito | Descrizione |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, poi il socket della piattaforma | Indirizzo del daemon: `unix:///path`, `tcp://host:port` o `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Directory con `ca.pem`, `cert.pem` e `key.pem` per il TLS reciproco. Impostarla attiva TLS. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Non ancora applicata; usare `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Immagine di build. Il campo **Executor image** di un template la sovrascrive. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Immagine del container di clonazione e per riempire il volume dei segreti. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Rete dei container di clonazione e di build. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` o `never`. Un valore sconosciuto ripiega su `if-not-present`. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | nessun limite | CPU per container, come `docker run --cpus`. Frazioni ammesse: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | nessun limite | Memoria per container: byte, oppure con `k`, `m`, `g` (`512m`, `2g`). Un valore non interpretabile significa nessun limite. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Esegue i container con `--privileged`. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Secondi che `docker stop` attende dopo **Stop** prima di terminare forzatamente il container. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | Non usata: l'executor attende l'uscita del container invece di interrogarlo. |

I limiti, la rete e `privileged` si applicano allo stesso modo al container di clonazione e a quello di build.

## Arresto e pulizia {#stop-and-clean-up}

**Stop** nell'interfaccia invia `docker stop` al container in esecuzione, attende fino a
`cleanup_grace_seconds` e poi rimuove i container ed entrambi i volumi.

Se il processo del runner viene terminato durante un'attività, i suoi container e volumi
restano sul daemon; il runner non li raccoglie all'avvio successivo. Tutto ciò che
l'executor crea porta l'etichetta `com.semaphoreui.runner=semaphore`, e
`com.semaphoreui.task-id` contiene l'ID dell'attività. Rimuovere i residui quando nessuna
attività è in esecuzione su questo daemon:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Risoluzione dei problemi {#troubleshooting}

| Messaggio | Causa e soluzione |
|---|---|
| `docker executor is only available in the proprietary build` (log del runner) | Il runner è una build Community. Usare `semaphoreui/runner` o il binario ufficiale. |
| `docker executor: daemon not reachable` | `host` errato, il daemon non è attivo, oppure l'utente del runner non può aprire il socket (`permission denied`). Verificare con `docker -H <host> info` come utente del runner; aggiungere l'utente al gruppo del socket. |
| `pull image ...: ... unauthorized` o `not found` | L'immagine è privata o il nome è errato. Scaricarla prima sull'host del daemon, vedere [registry privato](#images-from-a-private-registry). |
| `git clone exited with status 128` | L'URL del repository, il branch o la chiave SSH sono errati, oppure la rete blocca l'host Git. L'output della clonazione sopra la riga mostra l'errore Git. |
| `interpreter python3 not found in image; set a runner image that provides it` | L'immagine di build non contiene il binario dell'applicazione. Impostare un'immagine che lo contenga, sul runner o nel campo **Executor image** del template. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | L'immagine non ha il client OpenSSH; Ansible non può usare la chiave dell'inventario. Installare `openssh-client`. |
| `Permission denied` sotto `/workspace` | Un'immagine personalizzata viene eseguita con un utente che non può scrivere in `/workspace`. Vedere [Creare un'immagine personalizzata](./#build-a-custom-image). |
| `build container exited with status N` | L'applicazione è fallita con codice di uscita `N`; il motivo è nel log sopra. |
| `inventory login_password authentication is not supported` | Vedere [Limitazioni](./#limitations). |

## Pagine correlate {#related-pages}

- [Executor](/admin-guide/executors): come vengono eseguite le attività in container, immagini, limitazioni.
- [Executor Kubernetes](./kubernetes): lo stesso modello su un cluster.
- [Runner](/admin-guide/runners): registrare e avviare un runner.
- [Immagine dell'executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): un'immagine diversa per un template.
