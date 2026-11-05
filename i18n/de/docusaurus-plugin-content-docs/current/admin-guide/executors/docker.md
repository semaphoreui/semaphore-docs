---
title: Docker-Executor
description: Jeden Task eines Runners in einem frischen Docker-Container auf einem lokalen oder entfernten Daemon ausführen, mit Konfigurationsbeispielen, Sicherheitshinweisen und Fehlerbehebung.
sidebar_custom_props:
  edition: pro
---

# Docker-Executor <FeatureState feature="docker-executor" />

Mit dem Docker-Executor startet ein Runner jeden Task in einem neuen Container und
entfernt ihn, wenn der Task endet. Der Runner kommuniziert über dessen API mit einem
Docker-Daemon: Der Daemon kann auf demselben Host laufen oder entfernt über TLS erreichbar sein.

Wie ein Container-Task abläuft, was sich im Container befindet und was nicht unterstützt
wird, ist unter [Executoren](./#how-a-container-task-runs) beschrieben. Diese Seite
behandelt die Docker-Einrichtung.

## Bevor Sie beginnen {#before-you-begin}

- Ein Semaphore-Server mit einer Pro- oder Enterprise-Lizenz.
- Ein auf dem Server registrierter Runner, siehe [Runner](/admin-guide/runners). Verwenden
  Sie das Image `semaphoreui/runner` oder die offizielle Binärdatei `semaphore`.
- Eine vom Runner erreichbare Docker Engine und die Berechtigung, sie zu nutzen:
  Mitgliedschaft in der Gruppe `docker`, Zugriff auf den eingebundenen Socket oder TLS-Client-Zertifikate.
- Der Daemon kann `semaphoreui/job` und `semaphoreui/helper` (oder Ihre eigenen Images) pullen.

## Schnellstart {#quick-start}

Fügen Sie den Executor zur Runner-Konfiguration hinzu und starten Sie den Runner neu:

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

Ohne weitere Optionen verwendet der Runner den lokalen Socket (`DOCKER_HOST`, falls
gesetzt, sonst `unix:///var/run/docker.sock`), das Build-Image `semaphoreui/job:latest`
und das Netzwerk `bridge`.

Führen Sie einen beliebigen Task aus, der an diesen Runner geleitet wird. Das Task-Log beginnt mit:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

Während der Task läuft, können Sie seine Container sehen:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Beispiele {#examples}

### Runner-Binärdatei auf einem Docker-Host {#runner-binary-on-a-docker-host}

Der Runner läuft als systemd-Dienst auf demselben Host wie Docker. Geben Sie seinem
Benutzer Zugriff auf den Socket:

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

### Runner in einem Container mit dem Host-Socket {#runner-in-a-container-with-the-host-socket}

Der Runner-Container steuert den Host-Daemon über den eingebundenen Socket; Task-Container
sind Geschwister des Runners und nicht in ihm verschachtelt. Das Runner-Image läuft mit
der UID `1001`; fügen Sie sie daher der Gruppe hinzu, der der Socket gehört:

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

Das Volume `semaphore-runner-data` bewahrt das bei der Registrierung ausgestellte
Runner-Token auf, sodass sich der Runner nach einem Neustart nicht erneut registriert.

Dasselbe mit Docker Compose:

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

Secrets gelangen über ein benanntes Volume auf dem Daemon zum Task, nie über das
Dateisystem des Runners; daher müssen keine weiteren Pfade zwischen Runner und Host
geteilt werden.

### Entfernter Docker-Daemon über TLS {#remote-docker-daemon-over-tls}

Runner und Daemon befinden sich auf verschiedenen Rechnern. Schützen Sie den Daemon-Port
mit gegenseitigem TLS (siehe [Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
und legen Sie die Client-Dateien auf dem Runner ab:

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

Wenn `cert_path` gesetzt ist, prüft der Runner das Daemon-Zertifikat gegen `ca.pem` und
authentifiziert sich mit `cert.pem` und `key.pem`. Die Dateinamen sind fest vorgegeben.

:::warning
Ohne `cert_path` ist eine `tcp://`-Verbindung unverschlüsseltes HTTP, und jeder, der den
Port erreicht, kontrolliert den Daemon. `tls_verify` allein aktiviert TLS nicht (⚠️ 2026-11-05:
die Option wird gelesen, aber nicht angewendet); setzen Sie für einen entfernten Daemon immer `cert_path`.
:::

### Ein Netzwerk für interne Dienste {#a-network-for-internal-services}

Standardmäßig treten Task-Container dem Netzwerk `bridge` bei. Damit Tasks Dienste über
den Containernamen erreichen oder in einem eigenen Netzwerk isoliert sind, erstellen Sie
ein Netzwerk und tragen es ein:

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

`network` akzeptiert jeden Netzwerkmodus, den Docker kennt: einen Netzwerknamen,
`bridge`, `host` oder `none`. Der Klon-Container tritt demselben Netzwerk bei; mit
`none` kann das Repository also nicht geklont werden.

### Images aus einer privaten Registry {#images-from-a-private-registry}

Der Executor pullt Images ohne Registry-Zugangsdaten. Melden Sie sich für ein privates
Image auf dem Daemon-Host an, pullen Sie es dort und behalten Sie eine Pull-Policy bei,
die nicht erneut pullt:

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

Verwenden Sie mit `if-not-present` einen Versions-Tag statt `latest`: Ein Tag, der bereits
auf dem Daemon vorhanden ist, wird nie aktualisiert. Mit `never` lässt ein fehlendes Image
den Task fehlschlagen, statt einen Pull zu versuchen.

### Der gesamte Block als eine Variable {#the-whole-block-as-one-variable}

Für Deployments, die ausschließlich über die Umgebung konfiguriert werden, übergeben Sie
den Executor-Block als JSON:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Konfigurationsreferenz {#configuration-reference}

Alle Optionen befinden sich unter `runner.executor.docker` in der Runner-Konfiguration.

| Option | Umgebungsvariable | Standard | Beschreibung |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, dann der Plattform-Socket | Daemon-Adresse: `unix:///path`, `tcp://host:port` oder `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Verzeichnis mit `ca.pem`, `cert.pem` und `key.pem` für gegenseitiges TLS. Das Setzen aktiviert TLS. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Wird noch nicht angewendet; verwenden Sie `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Build-Image. Das **Executor image** eines Templates überschreibt es. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Image für den Klon-Container und zum Befüllen des Secrets-Volumes. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Netzwerk des Klon- und des Build-Containers. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` oder `never`. Ein unbekannter Wert fällt auf `if-not-present` zurück. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | kein Limit | CPUs pro Container, wie `docker run --cpus`. Bruchteile sind erlaubt: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | kein Limit | Speicher pro Container: Bytes oder mit `k`, `m`, `g` (`512m`, `2g`). Ein nicht auswertbarer Wert bedeutet kein Limit. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Führt die Container mit `--privileged` aus. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Sekunden, die `docker stop` nach **Stop** wartet, bevor der Container beendet wird. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | Nicht verwendet: Der Executor wartet auf das Ende des Containers, statt ihn abzufragen. |

Die Limits, das Netzwerk und `privileged` gelten gleichermaßen für den Klon- und den Build-Container.

## Stoppen und aufräumen {#stop-and-clean-up}

**Stop** in der UI sendet `docker stop` an den laufenden Container, wartet bis zu
`cleanup_grace_seconds` und entfernt dann die Container und beide Volumes.

Wird der Runner-Prozess während eines Tasks beendet, bleiben dessen Container und
Volumes auf dem Daemon; der Runner räumt sie beim nächsten Start nicht auf. Alles, was
der Executor erstellt, trägt das Label `com.semaphoreui.runner=semaphore`, und
`com.semaphoreui.task-id` enthält die Task-ID. Entfernen Sie Überreste, wenn auf diesem
Daemon kein Task läuft:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Fehlerbehebung {#troubleshooting}

| Meldung | Ursache und Lösung |
|---|---|
| `docker executor is only available in the proprietary build` (Runner-Log) | Der Runner ist ein Community-Build. Verwenden Sie `semaphoreui/runner` oder die offizielle Binärdatei. |
| `docker executor: daemon not reachable` | Falscher `host`, der Daemon läuft nicht, oder der Runner-Benutzer kann den Socket nicht öffnen (`permission denied`). Prüfen Sie dies mit `docker -H <host> info` als Runner-Benutzer; fügen Sie den Benutzer der Socket-Gruppe hinzu. |
| `pull image ...: ... unauthorized` oder `not found` | Das Image ist privat oder falsch geschrieben. Pullen Sie es zuerst auf dem Daemon-Host, siehe [private Registry](#images-from-a-private-registry). |
| `git clone exited with status 128` | Repository-URL, Branch oder SSH-Schlüssel sind falsch, oder das Netzwerk blockiert den Git-Host. Die Klon-Ausgabe über der Zeile zeigt den Git-Fehler. |
| `interpreter python3 not found in image; set a runner image that provides it` | Dem Build-Image fehlt die App-Binärdatei. Setzen Sie ein Image, das sie enthält, auf dem Runner oder im **Executor image** des Templates. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | Das Image hat keinen OpenSSH-Client; Ansible kann den Inventar-Schlüssel nicht verwenden. Installieren Sie `openssh-client`. |
| `Permission denied` unter `/workspace` | Ein eigenes Image läuft als Benutzer, der `/workspace` nicht beschreiben kann. Siehe [Eigenes Image bauen](./#build-a-custom-image). |
| `build container exited with status N` | Die App ist mit dem Exit-Code `N` fehlgeschlagen; der Grund steht im Log darüber. |
| `inventory login_password authentication is not supported` | Siehe [Einschränkungen](./#limitations). |

## Verwandte Seiten {#related-pages}

- [Executoren](/admin-guide/executors): wie Container-Tasks ablaufen, Images, Einschränkungen.
- [Kubernetes-Executor](./kubernetes): dasselbe Modell auf einem Cluster.
- [Runner](/admin-guide/runners): einen Runner registrieren und starten.
- [Executor-Image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): ein anderes Image für ein einzelnes Template.
