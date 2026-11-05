---
title: Executoren
description: Wie ein Runner Tasks mit dem lokalen, dem Docker- oder dem Kubernetes-Executor ausführt, was in den Containern läuft und was die Container-Executoren nicht unterstützen.
---

# Executoren

Ein Executor legt fest, **wo ein Runner den Task-Prozess startet**. Der Runner fragt
weiterhin den Server ab, erhält den Task und sendet das Log zurück; nur der Ort, an dem
der Ansible-, Terraform- oder Shell-Prozess läuft, ändert sich.

| Executor | `runner.executor.type` | Wo ein Task läuft | Edition |
|---|---|---|---|
| Lokal | `local` (Standard) | Ein Kindprozess auf dem Runner-Host, mit den Dateien, Tools und dem `PATH` des Runners. | Community |
| Docker | `docker` | Ein neuer Container auf einem Docker-Daemon, der nach dem Task entfernt wird. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Ein neuer Pod in einem Kubernetes-Namespace, der nach dem Task gelöscht wird. | <FeatureState feature="k8s-executor" /> |

Der Executor ist eine Einstellung des **Runners**, nicht des Servers oder des Templates.
Der Semaphore-Server selbst führt Tasks immer lokal aus; um Tasks in Containern
auszuführen, starten Sie einen [Runner](/admin-guide/runners) und leiten die Templates
über einen Runner-Tag an ihn weiter.

## Executor auswählen {#choose-an-executor}

| Sie benötigen | Verwenden Sie |
|---|---|
| Auf einem Rechner installierte Tools, Zugriff auf dessen Dateien, Workflow-Ausgaben | Lokal |
| Eine saubere Umgebung für jeden Task, unterschiedliche Toolchains pro Template, auf einem oder wenigen Hosts | [Docker](./docker) |
| Über einen Cluster verteilte Tasks, Kubernetes-RBAC und -Secrets, kein Docker-Socket | [Kubernetes](./kubernetes) |

## Executor festlegen {#set-the-executor}

Fügen Sie den Block `executor` zum Abschnitt `runner` der Runner-Konfigurationsdatei hinzu:

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

Oder setzen Sie die Umgebungsvariable:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

Jede Option hat eine Umgebungsvariable; die vollständigen Listen stehen auf den Seiten
[Docker](./docker#configuration-reference) und [Kubernetes](./kubernetes#configuration-reference).
Starten Sie den Runner nach einer Änderung des Executors neu.

:::info
Die Container-Executoren sind Teil des Pro-Builds des Runners. Verwenden Sie das Image
`semaphoreui/runner` oder die offizielle Binärdatei `semaphore`. Das Image
`semaphoreui/runner-community` wird ohne sie gebaut und protokolliert beim Start
`docker executor is only available in the proprietary build`.
:::

## Wie ein Container-Task abläuft {#how-a-container-task-runs}

Beide Container-Executoren führen einen Task auf dieselbe Weise aus:

1. **Vorbereiten.** Der Runner erstellt einen gemeinsamen Arbeitsbereich und legt die
   Secrets des Tasks (SSH-Schlüssel, Vault-Passwörter, Extra-Variablen, ein statisches
   Inventar) dort ab, wo die Container sie lesen können.
2. **Klonen.** Ein kurzlebiger *Helper*-Container klont das Repository nach
   `/workspace/repo` (`git clone --depth 1` des Branches des Tasks).
3. **Bauen.** Der *Build*-Container startet in `/workspace/repo` und führt die App aus:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` oder die Binärdatei einer benutzerdefinierten App. Sein Exit-Code ist das Task-Ergebnis.
4. **Protokollieren.** Die Ausgabe beider Container wird während der Ausführung in das Task-Log gestreamt.
5. **Aufräumen.** Container, Volumes, Secrets und ConfigMaps des Tasks werden entfernt,
   egal ob der Task erfolgreich war, fehlgeschlagen ist oder gestoppt wurde.

| Schritt | Docker | Kubernetes |
|---|---|---|
| Arbeitsbereich | Benanntes Volume `semaphore-workspace-<task>-<random>` | `emptyDir`-Volume des Pods |
| Secrets | Benanntes Volume `semaphore-secrets-<task>-<random>`, schreibgeschützt eingebunden | Ein Secret oder eine ConfigMap pro Art, schreibgeschützt eingebunden |
| Klonen | Container `semaphore-job-<task>-<random>-clone` | Init-Container `git-clone` |
| Bauen | Container `semaphore-job-<task>-<random>-build` | Container `build` des Pods `semaphore-job-<task>-<random>` |
| Schaltfläche Stop | `docker stop` mit `cleanup_grace_seconds`, danach entfernen | Pod wird mit `cleanup_grace_seconds` gelöscht |

Ein in der UI gestoppter Task endet im Status **Stopped**, wie beim lokalen Executor.

## Im Build-Container {#inside-the-build-container}

| Pfad | Inhalt |
|---|---|
| `/workspace` | Beschreibbarer Arbeitsbereich; außerdem `HOME` des Tasks. |
| `/workspace/repo` | Das geklonte Repository; das Arbeitsverzeichnis. |
| `/secrets/ssh/<key id>/id_rsa` | Privater SSH-Schlüssel des Repositorys oder des Inventars. Wird vor dem Start der App in `ssh-agent` geladen. |
| `/secrets/vault/<name>` | Ansible-Vault-Passwort, übergeben als `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Extra-Variablen der Variable Group plus `semaphore_vars`, übergeben als `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` oder `inventory.yml` | Ein in Semaphore gespeichertes statisches Inventar. Datei-Inventare werden aus dem Repository gelesen. |

Der Container erhält einen festen Satz von Umgebungsvariablen, aufgeführt unter
[Task-Umgebungsvariablen](/reference/task-environment#container-executors). Die
eigenen `env_vars`, `forwarded_env_vars`, `PATH` und `apps.*`-Pfade des Runners werden
**nicht** an den Container übergeben.

## Images {#images}

An jedem Task sind zwei Images beteiligt:

| Image | Standard | Verwendet für | Benötigt |
|---|---|---|---|
| Build-Image | `semaphoreui/job:latest` | Ausführen der App. | `sh`, die App-Binärdatei im `PATH`; für SSH-Schlüssel `ssh-agent`, `ssh-add`, `setsid`. |
| Helper-Image | `semaphoreui/helper:latest` | Klonen des Repositorys (Docker füllt damit auch das Secrets-Volume). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` ist Debian mit Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu und Terragrunt. Es läuft als Benutzer `nobody`, Gruppe `0`.

Das Build-Image wird pro Runner festgelegt (`image`) und kann pro Template über das Feld
**Executor image** überschrieben werden, siehe
[Executor-Image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
Das Helper-Image wird nur pro Runner festgelegt.

### Eigenes Image bauen {#build-a-custom-image}

Erweitern Sie `semaphoreui/job`, wenn Ihre Tasks zusätzliche Ansible-Collections,
Python-Pakete oder Tools benötigen. Container-Executoren installieren `requirements.yml`
aus dem Repository **nicht**; bauen Sie Collections und Rollen daher in das Image ein:

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

Wenn Sie ein Image von Grund auf bauen, behalten Sie diese Eigenschaften von `semaphoreui/job` bei:

- `/workspace` existiert und ist für den Benutzer beschreibbar, unter dem der Container läuft.
- `/etc/passwd` ist für die Gruppe beschreibbar (`chmod g=u /etc/passwd`). Ein Container,
  der mit einer zufälligen UID gestartet wird (OpenShift), erhält dann einen passwd-Eintrag,
  den OpenSSH und Git benötigen.
- Das Image benötigt keinen speziellen Entrypoint: Der Executor führt sein Skript mit `sh -c` aus.

## Einschränkungen {#limitations}

Im Vergleich zum lokalen Executor unterstützen die Container-Executoren derzeit Folgendes nicht:

| Nicht unterstützt | Stattdessen |
|---|---|
| Inventar-Zugangsdaten vom Typ **Anmeldung mit Passwort** (SSH-Passwort oder Become-Passwort) | Verwenden Sie einen SSH-Schlüssel. Ein Task mit einem solchen Schlüssel schlägt mit `inventory login_password authentication is not supported` fehl. |
| Terraform-Tasks, die auf eine manuelle Bestätigung warten | Aktivieren Sie **Auto Approve** im Template oder führen Sie reine Plan-Tasks aus. Andernfalls schlägt der Task mit `terraform manual approval is not supported` fehl. |
| Repositorys vom Typ **Local** | Der Arbeitsbereich bleibt leer; verwenden Sie ein Git-Repository. |
| Installation von `requirements.yml` (Galaxy-Rollen und -Collections) | [Bauen Sie sie in das Image ein](#build-a-custom-image). |
| Workflow-Ausgaben (`SEMAPHORE_OUTPUTS_FILE`) | Verwenden Sie den lokalen Executor für Tasks, deren Ausgaben ein Workflow liest. |
| Zugangsdaten pro Host aus der Host-Konfiguration | Verwenden Sie den lokalen Executor. |
| Git-Historie über den letzten Commit hinaus | Der Klon ist flach (`--depth 1`). |

SSH-Host-Schlüssel werden nicht geprüft: Der Klon akzeptiert einen neuen Host-Schlüssel,
und Ansible läuft mit `ANSIBLE_HOST_KEY_CHECKING=False`.

## Verwandte Seiten {#related-pages}

- [Docker-Executor](./docker): Einrichtung, Konfiguration, Sicherheit, Fehlerbehebung.
- [Kubernetes-Executor](./kubernetes): RBAC, Runner-Deployment, Konfiguration, Fehlerbehebung.
- [Runner](/admin-guide/runners): einen Runner registrieren und starten.
- [Konfigurationsoptionen](/reference/configuration): alle `runner.executor.*`-Optionen.
