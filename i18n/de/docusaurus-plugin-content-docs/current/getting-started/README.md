---
title: Erste Schritte
description: Installieren Sie Semaphore UI, führen Sie Ihre erste Ansible-Aufgabe aus, prüfen Sie das Ergebnis und richten Sie einen Zeitplan ein.
sidebar_label: Erste Schritte
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Erste Schritte

Semaphore UI bietet eine Weboberfläche und eine API für wiederholbare Automatisierung mit Ansible, Terraform/OpenTofu, Bash, PowerShell und Python. Es verbindet Automatisierung aus Git mit Zugangsdaten, Variablen, Zeitplänen, Workflows und Ausführungsumgebungen und speichert Status und Protokoll jedes Laufs.

Diese Anleitung verwendet Ansible für das erste praktische Beispiel. Verwenden Sie ein Playbook aus Ihrem eigenen Repository oder folgen Sie dem reproduzierbaren Beispiel in den Screenshots mit dem öffentlichen Repository [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo).

## 1. Semaphore installieren

Wählen Sie die Installationsmethode passend zur Ausführungsumgebung von Semaphore. Standardmäßig ist das native Paket ausgewählt.

<Tabs groupId="installation-method">
  <TabItem value="package" label="Natives Paket" default className="InstallationMethod">

Für Debian oder Ubuntu auf `amd64`:

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

Für RHEL, Fedora, Rocky Linux, AlmaLinux oder CentOS Stream auf `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

Konfigurieren Sie die Datenbank und den ersten Administrator und starten Sie Semaphore mit der erzeugten Konfiguration:

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

Wählen Sie für einen lokalen Test SQLite, übernehmen oder setzen Sie die Pfade für Datenbank und Playbooks, geben Sie die öffentliche URL an und erstellen Sie auf Aufforderung den ersten Administrator.

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

Erstellen Sie `compose.yaml`:

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

Erzeugen Sie einen Verschlüsselungsschlüssel und speichern Sie ihn zusammen mit einem starken Administratorpasswort in einer Datei `.env` neben `compose.yaml`:

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

Nehmen Sie `.env` nicht in die Versionsverwaltung auf und starten Sie den Container:

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="Binärarchiv" className="InstallationMethod">

Laden Sie das Archiv für Ihr Betriebssystem und Ihre Prozessorarchitektur von [GitHub Releases](https://github.com/semaphoreui/semaphore/releases) herunter. Beispiel für Linux `amd64`:

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

Wählen Sie für einen lokalen Test SQLite, übernehmen oder setzen Sie die Pfade für Datenbank und Playbooks, geben Sie die öffentliche URL an und erstellen Sie auf Aufforderung den ersten Administrator.

Wählen Sie für macOS ein `darwin`-Archiv oder für Windows eine `.zip`-Datei. Die spätere Ansible-Anleitung benötigt weiterhin Linux, macOS, WSL, einen Container oder einen Linux-Runner als Ausführungsumgebung mit installiertem Ansible.

  </TabItem>
  <TabItem value="helm" label="Kubernetes mit Helm" className="InstallationMethod">

Fügen Sie das offizielle Chart hinzu und prüfen Sie vor der Installation dessen Standardwerte:

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

Die `appVersion` des Charts gibt die Semaphore-Version an. Konfigurieren Sie vor dem Produktivbetrieb in `values.yaml` persistenten Speicher, Datenbank, Administratorzugangsdaten, den Verschlüsselungsschlüssel für Zugriffsschlüssel und Ingress/TLS.

  </TabItem>
</Tabs>

Nutzen Sie für eine geführte Einrichtung die offizielle [Semaphore-Installationsseite](https://semaphoreui.com/install), um die Version auszuwählen, die Konfiguration zu erstellen und die passenden Download- oder Startbefehle zu erhalten.

<details>
<summary>Unsicher, welche Installationsmethode Sie wählen sollen?</summary>

| Installationsmethode | Geeignet für | Ausführliche Anleitung |
| --- | --- | --- |
| **Natives Paket** | Einen unterstützten Linux-Server | [Installation per Paketmanager](/admin-guide/installation/package-manager) |
| **Docker Compose** | Eine schnelle isolierte Einrichtung oder einen Container-Host | [Docker-Installation](/admin-guide/installation/docker) |
| **Binärarchiv** | macOS, Windows, FreeBSD oder Linux ohne passendes Paket | [Installation einer Binärdatei](/admin-guide/installation/binary-file) |
| **Kubernetes mit Helm** | Einen vorhandenen Kubernetes-Cluster | [Kubernetes-Installation](/admin-guide/installation/k8s) |

Die ausführlichen Anleitungen behandeln Produktionsdatenbanken, Dienste, Geheimnisse, Speicher, Ingress und Upgrades.

</details>

Für diese Ansible-Anleitung müssen `git --version` und `ansible-playbook --version` auf dem Semaphore-Server oder Runner funktionieren. Falls einer der Befehle dort fehlt, installieren Sie vor dem Fortfahren [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) und [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html).

:::tip Installation für den Produktivbetrieb
Lesen Sie vor dem Produktivbetrieb von Semaphore die Seiten [Konfiguration](/admin-guide/configuration), [Sicherheit](/admin-guide/security), [Runner](/admin-guide/runners), [Hochverfügbarkeit](/admin-guide/ha) und [Upgrade](/admin-guide/upgrading).
:::

## 2. Anmelden

1. Öffnen Sie Semaphore im Browser. Eine lokale Installation verwendet normalerweise [http://localhost:3000](http://localhost:3000).
2. Geben Sie den Administratornamen und das Passwort ein, die durch `semaphore setup` oder die Docker-Administratorvariablen festgelegt wurden.
3. Wählen Sie **Sign In**.

![Anmeldeseite von Semaphore](/assets/getting-started/sign-in.jpg)

Verwenden Sie für die Ersteinrichtung das Administratorkonto, da es Projekte und Benutzer erstellen kann. Normale Benutzer melden sich auf derselben Seite an, nachdem ein Administrator ihr Konto erstellt und Projektzugriff gewährt hat. Siehe [Benutzerverwaltung](/user-guide/admin/users).

## 3. Ein Projekt erstellen

Nach der Anmeldung an einer leeren Semaphore-Instanz öffnet sich automatisch die Seite **New Project**. Wenn bereits Projekte existieren, öffnen Sie die Projektauswahl und wählen Sie **New Project...**. Füllen Sie das Formular aus:

| Feld | Eingabe |
| --- | --- |
| **Project Name** | Ein wiedererkennbarer Arbeitsbereichsname, etwa `Production infrastructure` oder der Name Ihrer Anwendung. |
| **Max number of parallel tasks** | Optional. Begrenzt gleichzeitige Aufgaben in diesem Projekt; leer lassen, um das Serverlimit zu verwenden. |
| **Telegram Chat ID** | Optional. Wird verwendet, wenn Telegram-Benachrichtigungen für das Projekt eingerichtet sind. |
| **Allow alerts for this project** | Optional. Aktiviert die konfigurierten Projektbenachrichtigungen. |
Wählen Sie **Create**.

Wählen Sie nicht **Create Demo Project**: Dadurch werden Beispielressourcen angelegt, während diese Anleitung ein leeres Projekt aufbaut. Wenn Sie später weitere Projekte erstellen, erscheint dieselbe Option als Schalter **Demo** im Dialog New Project.

![Leeres Formular New Project mit allen verfügbaren Feldern](/assets/getting-started/new-project-empty.jpg)

Das neue Projekt enthält die Bereiche **Task Templates**, **Workflows**, **Schedule**, **Inventory**, **Variable Groups**, **Key Store** und **Repositories**. Unter [Projekte](/user-guide/projects) finden Sie Informationen zu Projekteinstellungen, Teamzugriff, Aktivitäten und Verlauf.

<details>
<summary>Diesen Schritt ansehen</summary>

![Erstellen des ersten Projekts in einer leeren Semaphore-Instanz](/assets/getting-started/create-first-project.gif)

</details>

## 4. Die Grundbegriffe verstehen

Das neue Projekt öffnet ein leeres Dashboard. Die Seitenleiste ist die Hauptnavigation für dieses Projekt:

![Leere Semaphore-Projektoberfläche vor dem Hinzufügen von Ressourcen und Aufgaben](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** zeigt Ausführungsverlauf, Statistiken, Aktivitäten und Projekteinstellungen.
- **Task Templates**, **Workflows** und **Schedule** legen fest, was wann ausgeführt wird.
- **Repositories**, **Inventory**, **Variable Groups** und **Key Store** stellen Code, Zielsysteme, Variablen und Zugangsdaten bereit.
- **Integrations**, **Team** und **Runners** verbinden externe Systeme, Benutzer und Ausführungshosts.

Das Diagramm zeigt, wie diese Ressourcen zu einer Ausführung führen:

<div class="BlockSchema">
  ![Wie Semaphore-Ressourcen und Auslöser eine Aufgabenausführung erzeugen](/assets/getting-started/core-concepts.svg)
</div>

Eine Aktion in der Oberfläche, eine API-Anfrage oder ein Zeitplan kann direkt ein **Task Template** oder einen **Workflow** mit Aufgabenvorlagen starten. Semaphore erstellt eine Ausführung, die in der Oberfläche als **Task** erscheint, und sendet sie an den Semaphore-Server oder einen geeigneten Remote-Runner. Bei Ansible führt dieser Host `ansible-playbook` aus; das Inventory listet die von Ansible verwalteten Systeme auf.

| Begriff | Funktion |
| --- | --- |
| [**Project**](/user-guide/projects) | Ein isolierter Arbeitsbereich mit Automatisierungsressourcen, Berechtigungen und Ausführungsverlauf. |
| [**Repository**](/user-guide/repositories) | Verweist auf den Git-Branch oder -Tag mit den Automatisierungsdateien einer Aufgabe. |
| [**Key Store**](/user-guide/key-store) | Speichert wiederverwendbare SSH-Schlüssel, Zugangsdaten, Tokens und Ansible-Vault-Passwörter außerhalb von Git und Aufgabeneingaben. |
| [**Inventory**](/user-guide/inventory) | Gibt Ansible die zu verwaltenden Hosts und Gruppen sowie die zu verwendenden Zugangsdaten vor. |
| [**Variable Group**](/user-guide/environment) | Speichert wiederverwendbare Ansible-Variablen, Umgebungsvariablen und Geheimnisse für eine oder mehrere Vorlagen. |
| [**Task Template**](/user-guide/task-templates/) | Speichert die Ausführungsvorgaben: Automatisierungstyp, Datei, Repository, Inventory, Variablen, Eingabeaufforderungen und Ausführungsoptionen. |
| [**Task (task run)**](/user-guide/tasks) | Eine einzelne Ausführung mit eigenen Eingaben, Status, Zeitstempeln, Protokoll, Details und Ergebnis. |
| **Workflow** | Verbindet Aufgabenvorlagen zu einem mehrstufigen Ablauf mit Zweigen für Erfolg, Fehler, Genehmigung und Notizen. |
| [**Schedule**](/user-guide/schedules) | Startet eine Aufgabenvorlage oder einen Workflow einmalig oder wiederholt anhand eines Cron-Ausdrucks. |
| [**Runner**](/admin-guide/runners) | Führt eingereihte Aufgaben außerhalb des Hauptservers von Semaphore aus, etwa in einem anderen Netzwerk oder Sicherheitsbereich. |

## 5. Das Repository verbinden

Ein Repository verbindet Semaphore mit Automatisierung in Git; Semaphore speichert das Playbook selbst nicht. Verbinden Sie Ihr eigenes Repository oder verwenden Sie die folgenden öffentlichen Demowerte, um das Beispiel exakt nachzuvollziehen. [Integrationen](/user-guide/integrations) sind eine separate Funktion zum Starten von Automatisierung aus GitHub, GitLab oder anderen Webhook-Quellen.

1. Öffnen Sie **Repositories** und wählen Sie **New Repository**.
2. Geben Sie Namen, URL, Branch und Zugangsdaten des Repositorys an. Für das öffentliche Demo verwenden Sie:

   | Feld | Wert |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None`, da dieses Repository öffentlich ist |

3. Wählen Sie **Create**.

![Repository-Formular mit dem öffentlichen Semaphore-Demorepository](/assets/getting-started/repository-settings.jpg)

Ihr Repository sollte nun in der Liste erscheinen. Semaphore klont oder aktualisiert es auf dem Ausführungshost beim Start einer Aufgabe, nicht beim Anlegen des Repository-Eintrags. Der Screenshot zeigt die Demowerte dieser Anleitung.

![Verbundenes Demo-Repository in der Repository-Liste des Projekts](/assets/getting-started/connected-repository.jpg)

Wählen Sie für ein privates Repository passende Zugangsdaten aus dem Key Store statt `None`. Unter [Repositories](/user-guide/repositories) finden Sie lokale Pfade, HTTPS, SSH, Branches, Zugangsdaten und Requirements-Dateien.

## 6. Einen SSH-Schlüssel für einen verwalteten Remote-Host hinzufügen

Mit diesen SSH-Zugangsdaten verbindet sich Ansible vom Semaphore-Server oder Runner mit einem Remote-Host im Inventory. Für das Demo mit `localhost` benötigen Sie keinen SSH-Schlüssel; fahren Sie mit Schritt 7 fort.

Das Demo verwendet `localhost` mit `ansible_connection=local` und öffnet daher keine SSH-Verbindung. Wenn Ihr eigenes Playbook einen Remote-Host verwaltet, fügen Sie dessen Schlüssel hinzu:

1. Fügen Sie den öffentlichen Teil des Schlüssels auf dem verwalteten Host zu `~/.ssh/authorized_keys` hinzu.
2. Öffnen Sie **Key Store** und wählen Sie **New Key**.
3. Geben Sie einen erkennbaren Namen ein, etwa `Production hosts`, lassen Sie **Local** ausgewählt und wählen Sie **SSH Key**.
4. Geben Sie das Konto an, das Ansible auf dem Host verwenden soll, etwa `ubuntu` oder `ec2-user`.
5. Fügen Sie den vollständigen privaten Schlüssel einschließlich der Zeilen `BEGIN` und `END` ein und ergänzen Sie bei Bedarf die Passphrase.
6. Wählen Sie **Create**. Wählen Sie diesen Schlüssel im nächsten Schritt unter **Inventory → User Credentials** aus.

![Formular New SSH Key für das Konto auf den verwalteten Hosts](/assets/getting-started/add-managed-host-ssh-key.jpg)

Der Screenshot enthält einen Platzhalter und kein gültiges Geheimnis. Veröffentlichen Sie niemals einen privaten Schlüssel in Dokumentation, Screenshots, Aufgabenargumenten oder der Versionsverwaltung.

Semaphore kann Geheimnisse lokal speichern oder externe Geheimnisspeicher wie [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) und [Devolutions Server](/user-guide/key-store/devolutions-server) einbinden. Alle unterstützten Zugangsdatenarten und Speicheroptionen finden Sie unter [Key Store](/user-guide/key-store).

## 7. Das Ansible-Inventory erstellen

Jede Ansible-Aufgabe benötigt ein Inventory. Fügen Sie für einen ersten lokalen Lauf eine Datei wie `inventory.ini` zu Ihrem Repository hinzu:

```ini
[local]
localhost ansible_connection=local
```

Hier bezeichnet `localhost` den Ausführungshost, also den Semaphore-Server, Container oder Runner, und nicht unbedingt den Computer mit Ihrem Browser. `ansible_connection=local` weist Ansible an, kein SSH zu verwenden. Das Demorepository nutzt die entsprechende Datei `invs/prod/hosts` mit einer Gruppe namens `site`.

Wenn Sie `inventory.ini` in Ihrem eigenen Repository erstellt haben, committen und pushen Sie die Datei vor dem Fortfahren in den mit Semaphore verbundenen Branch.

1. Öffnen Sie **Inventory** und wählen Sie **New Inventory → Ansible Inventory**.
2. Geben Sie passende Werte für Ihr Inventory ein. Zum Beispiel:

   | Feld | Wert |
   | --- | --- |
   | **Name** | `Local` (`Prod` im Demo) |
   | **User Credentials** | `None` für `localhost`; für ein Remote-Inventory die SSH-Zugangsdaten Ihres Hosts verwenden |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini` (`invs/prod/hosts` im Demo) |

3. Lassen Sie **Runner tag**, **Sudo Credentials** und **Repository** leer und wählen Sie **Create**.

![Ansible-Datei-Inventory mit den Werten des Demorepositorys](/assets/getting-started/ansible-inventory-settings.jpg)

Wenn **Repository** leer bleibt, löst Semaphore diesen relativen Inventory-Pfad ausgehend vom Repository der Aufgabenvorlage auf. Wählen Sie hier nur ein Repository, wenn das Inventory anderswo liegt. Verwenden Sie für einen Remote-Host den SSH-Schlüssel aus Schritt 6 als **User Credentials**.

Statische, dateibasierte und dynamische Inventories werden unter [Inventory](/user-guide/inventory) beschrieben.

## 8. Eine Variablengruppe hinzufügen (optional)

Eine **Variable Group** enthält wiederverwendbare Werte für eine oder mehrere Aufgabenvorlagen. Verwenden Sie **Extra variables** für Ansible-Variablen, **Environment variables** für an den Prozess exportierte Werte und **Secrets** für sensible Werte, die verschlüsselt und maskiert werden sollen. So bleibt umgebungsspezifische Konfiguration außerhalb des Playbooks und muss nicht in jeder Vorlage erneut eingegeben werden.

Die erste Aufgabe funktioniert ohne Variablengruppe. Erstellen Sie als Beispiel eine Gruppe mit `ansible_python_interpreter=auto_silent`; Ansible erkennt Python weiterhin automatisch, gibt aber keine informative Erkennungswarnung aus.

1. Öffnen Sie **Variable Groups** und wählen Sie **New Group**.
2. Setzen Sie **Group Name** auf einen aussagekräftigen Namen, etwa `Ansible defaults`.
3. Lassen Sie unter **Variables → Extra variables** die Option **Table** ausgewählt und wählen Sie **+**.
4. Geben Sie Folgendes ein:

   | Name | Typ | Wert |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. Wählen Sie **Save**.

![Im Tabelleneditor konfigurierte Variablengruppe](/assets/getting-started/variable-group-table.jpg)

Vorrangregeln und Speicheroptionen für Geheimnisse finden Sie unter [Variablengruppen](/user-guide/environment).

## 9. Die Ansible-Aufgabenvorlage erstellen

### Das Playbook in Git prüfen

Enthält das verbundene Repository bereits ein Ansible-Playbook, verwenden Sie dieses. Andernfalls fügen Sie ein kleines Beispiel wie `get-started.yml` hinzu:

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

Wenn Sie dem Demo folgen, verwenden Sie stattdessen dessen [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml). Es spricht die Gruppe `site` des Demo-Inventorys an und führt die enthaltene Rolle `ping` aus.

Das Demo lädt diese Rolle aus einem Git-Submodul herunter und sendet eine ICMP-Anfrage an `semaphoreui.com`. Der Ausführungshost benötigt daher GitHub-Zugriff und ausgehendes ICMP. Ist ICMP gesperrt, verwenden Sie stattdessen das lokale Beispiel `get-started.yml`.

![ping.yml im verbundenen GitHub-Repository](/assets/getting-started/demo-playbook-github.jpg)

Der Screenshot zeigt das Playbook im öffentlichen Demorepository. Automatisierung in Git macht Änderungen prüfbar und ermöglicht Semaphore, den genauen Commit jedes Laufs festzuhalten.

Wenn Sie `get-started.yml` in Ihrem eigenen Repository erstellt haben, committen und pushen Sie die Datei vor dem Fortfahren in den mit Semaphore verbundenen Branch.

### Die Vorlage konfigurieren

1. Öffnen Sie **Task Templates** und wählen Sie **New template → Applications**.
2. Aktivieren Sie **Ansible Playbook** und kehren Sie zu **Task Templates** zurück.
3. Wählen Sie **New template → Ansible Playbook**.
4. Lassen Sie den Tab **Task** ausgewählt. **Build** und **Deploy** sind versionierte CI/CD-Vorlagentypen, die für diesen unabhängigen Lauf nicht benötigt werden.
5. Konfigurieren Sie die Vorlage passend zu Ihren Dateien. Zum Beispiel:

   | Feld | Wert | Bedeutung |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | Kennzeichnet die wiederverwendbare Vorlage und ihren Aufgabenverlauf. |
   | **Repository** | Ihr Repository (`Demo` im Beispiel) | Liefert das Playbook und zugehörige Dateien. |
   | **Path to playbook file** | `get-started.yml` (`ping.yml` im Demo) | Wird relativ zum Repository-Stamm aufgelöst. |
   | **Inventory** | `Local` (`Prod` im Demo) | Liefert das lokale Ziel für diesen ersten Lauf. |
   | **Variable Groups** | `Ansible defaults`, falls erstellt | Ergänzt die optionale wiederverwendbare Ansible-Einstellung. |
   | **Runner tag** | Leer lassen | Verwendet je nach Serverkonfiguration lokale Ausführung oder den Standard-Runner. |

6. Aktivieren Sie unter **Ansible options** die Option **Skip Galaxy install** für das kleine Playbook oben oder das öffentliche Demo: Beide benötigen für diese Aufgabe keine Galaxy-Abhängigkeiten. Lassen Sie die Option aus, wenn Ihr Repository Rollen oder Collections aus einer Datei `requirements.yml` benötigt.
7. Wählen Sie **Create**.

![Ansible-Aufgabenvorlage mit Repository, Inventory und Variablengruppe](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>Diesen Schritt ansehen</summary>

![Ansible aktivieren und die erste Ansible-Aufgabenvorlage erstellen](/assets/getting-started/create-ansible-template.gif)

</details>

Weitere nützliche Felder:

- **Vaults** wählt Key-Store-Passwörter für verschlüsselte Ansible-Inhalte aus.
- **Limit**, **Tags** und **Skip tags** schränken den Ausführungsumfang des Playbooks ein.
- **Prompts** ermöglichen einem Benutzer, einem Zeitplan oder einer API-Anfrage, freigegebene Werte für einen bestimmten Lauf zu überschreiben.
- **Runner tag** steuert den Ausführungsort der Aufgabe; es wählt kein Ansible-Ziel aus.

Alle Felder und Ausführungsoptionen finden Sie unter [Ansible-Vorlagen](/user-guide/apps/ansible) und [Aufgabenvorlagen](/user-guide/task-templates/).

## 10. Die Vorlage ausführen und die Aufgabe prüfen

1. Öffnen Sie die erstellte Aufgabenvorlage und wählen Sie **Run**.
2. Fügen Sie optional eine Nachricht wie `First Semaphore run` hinzu.
3. Lassen Sie **Dry Run** und **Diff** deaktiviert und wählen Sie **Run**.

![Unveränderter Dialog New Task für das Ansible-Playbook](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore reiht die Aufgabe ein, bereitet das Repository vor, wendet Inventory und optionale Variablengruppe an und startet das gewählte Playbook. Der Status wechselt über **Waiting** und **Running** zu **Success** oder **Failed**.

### Protokoll

**Log** enthält die tatsächliche Befehlsausgabe. Lesen Sie den abschließenden `PLAY RECAP` und achten Sie nicht nur auf das grüne Statussymbol.

![Erfolgreiches Ansible-Aufgabenprotokoll mit Ping-Ausgabe und PLAY RECAP](/assets/getting-started/ansible-task-log-variable-group.jpg)

Die genauen Zähler hängen von Ihrem Playbook ab. Ein erfolgreicher erster Lauf sollte für `localhost` mit `unreachable=0` und `failed=0` enden. Zeigt das Demoprotokoll `changed=1`, wurde der shellbasierte Ping-Schritt ausgeführt und meldete eine Änderung; dies ist kein Fehler.

### Details und Zusammenfassung

| Tab | Zu prüfen |
| --- | --- |
| **Log** | Ausführungsphasen in Echtzeit, Modulausgabe, Fehler und abschließender `PLAY RECAP`. |
| **Details** | Vorlagentyp, Git-Commit, Ausführungsnachricht, Autor, Zeitstempel und Dauer. |
| **Summary** | Ansible-Ergebnisse und Fehler pro Host nach Abschluss, sofern die Aufgabenzusammenfassung verfügbar ist. |

![Aufgabendetails mit Vorlage, Commit und Zeitangaben](/assets/getting-started/ansible-task-details.jpg)

![Aufgabenzusammenfassung mit Hostanzahlen für OK und Not OK](/assets/getting-started/ansible-task-summary.jpg)

Ist **Summary** nicht verfügbar, prüfen Sie den Lauf unter **Log**; `PLAY RECAP` bleibt das maßgebliche Ansible-Ergebnis.

<details>
<summary>Ausführung und Ergebnis ansehen</summary>

![Ansible-Aufgabe ausführen und Protokoll sowie Details prüfen](/assets/getting-started/run-and-inspect-task.gif)

</details>

### Frühere Ausführungen finden

Schließen Sie das Aufgabenfenster, um zum Tab **Tasks** der Vorlage zurückzukehren. Jeder Lauf hat eine eigene Aufgabennummer, einen Status, Benutzer, Startzeitpunkt, eine Dauer und ein gespeichertes Protokoll. **Dashboard → History** zeigt Läufe aller Vorlagen im Projekt. Weitere Informationen finden Sie unter [Aufgaben](/user-guide/tasks) und [Projektverlauf](/user-guide/projects/history).

![Verlauf einer Ansible-Vorlage mit erfolgreichen Aufgabenausführungen](/assets/getting-started/ansible-template-history.jpg)

Schlägt die Aufgabe fehl, wählen Sie anhand der letzten aussagekräftigen Protokollzeile die nächste Prüfung:

- Ein Klonfehler deutet auf Repository-URL, Branch, Access Key oder Netzwerkzugriff vom Ausführungshost hin.
- `ansible-playbook: command not found` bedeutet, dass Ansible auf dem Semaphore-Server oder dem ausgewählten Runner fehlt.
- `UNREACHABLE` deutet auf Inventory-Adressen, Hostzugangsdaten, SSH-Erreichbarkeit oder die Überprüfung des Hostschlüssels hin.
- Bei einem fehlgeschlagenen Ansible-Schritt stehen Aufgabenname, Host und Modulfehler normalerweise direkt oberhalb von `PLAY RECAP`.

## 11. Die Aufgabe nach Zeitplan ausführen

Nach einer erfolgreichen Ausführung über die Oberfläche können Sie die Aufgabe automatisch starten lassen. Beispielsweise startet der Cron-Ausdruck `0 3 * * *` sie täglich um 03:00 Uhr in der von Semaphore angezeigten Zeitzone.

1. Öffnen Sie **Schedule** und wählen Sie **New Schedule → Cron**.
2. Geben Sie einen aussagekräftigen Namen ein, etwa `Nightly playbook`.
3. Wählen Sie die auszuführende Aufgabenvorlage aus.
4. Lassen Sie **Show cron format** aktiviert und geben Sie einen Cron-Ausdruck ein, etwa `0 3 * * *`.
5. Lassen Sie **Enabled** ausgewählt und wählen Sie **Save**.

![Cron-Zeitplan für die tägliche Ausführung der Beispielaufgabe um 03:00 Uhr](/assets/getting-started/create-cron-schedule.jpg)

Semaphore zeigt die konfigurierte Zeitzone und berechnet den nächsten Lauf vor dem Speichern. Ein geplanter Lauf verwendet dasselbe Repository, Inventory, dieselben Variablengruppen und Ausführungseinstellungen wie die Vorlage. Wenn die Vorlage Eingabeaufforderungen anbietet, kann der Zeitplan dafür Werte angeben. Unter [Zeitpläne](/user-guide/schedules) finden Sie Cron-Syntax, Zeitzonenkonfiguration, einmalige Läufe und geplante Parameter.

Prüfen Sie nach dem Speichern, ob der Zeitplan **Enabled** ist und **Next run** die erwartete Zeit zeigt. Geplante Aufgaben erscheinen im Tab **Tasks** der Vorlage und unter **Dashboard → History**.

## Weitere Schritte

Nach der ersten erfolgreichen Ansible-Aufgabe:

- Ergänzen Sie passende private Zugangsdaten im [Key Store](/user-guide/key-store), wenn Ihr Repository Authentifizierung erfordert.
- Erstellen Sie einen **Workflow**, wenn mehrere Vorlagen geordnete Pfade für Erfolg, Fehler, Genehmigung oder Notizen benötigen.
- Verwenden Sie [Integrationen](/user-guide/integrations) für authentifizierte Webhook-Auslöser aus GitHub, GitLab oder anderen Systemen.
- Verwenden Sie die [API](/reference/api), um Ressourcen programmatisch zu verwalten und Vorlagen zu starten.
- Ergänzen Sie einen [Remote-Runner](/admin-guide/runners), wenn die Ausführung in einem anderen Netzwerk, Betriebssystem oder Sicherheitsbereich erfolgen muss.

Stellen Sie Semaphore im Produktivbetrieb hinter HTTPS bereit, sichern Sie Datenbank und Geheimnis zur Verschlüsselung der Zugriffsschlüssel gemeinsam, richten Sie zentrale Authentifizierung ein und lesen Sie [Sicherheit](/admin-guide/security), [Protokolle](/admin-guide/logs) und [Upgrade](/admin-guide/upgrading).
