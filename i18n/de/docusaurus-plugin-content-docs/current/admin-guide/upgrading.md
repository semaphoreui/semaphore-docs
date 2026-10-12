# Aktualisieren

### Paketmanager {#package-manager}

Laden Sie eine Paketdatei von der [Releases-Seite](https://github.com/semaphoreui/semaphore/releases) herunter.

&#x20;`*.deb` für Debian und Ubuntu, `*.rpm` für CentOS und RedHat.&#x20;

Installieren Sie sie mit dem Paketmanager.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="debian-x64" label="Debian / Ubuntu (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.deb

      sudo dpkg -i semaphore_2.17.15_linux_amd64.deb
      ```
  </TabItem>
  <TabItem value="debian-arm64" label="Debian / Ubuntu (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.deb

      sudo dpkg -i semaphore_2.17.15_linux_arm64.deb
      ```
  </TabItem>
  <TabItem value="centos-x64" label="CentOS (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.rpm

      sudo yum install semaphore_2.17.15_linux_amd64.rpm
      ```
  </TabItem>
  <TabItem value="centos-arm64" label="CentOS (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.rpm

      sudo yum install semaphore_2.17.15_linux_arm64.rpm
      ```
  </TabItem>
</Tabs>


### Binärdatei {#binary}

<Tabs>
  <TabItem value="linux-x64" label="Linux (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.tar.gz

      tar xf semaphore_2.17.15_linux_amd64.tar.gz
      ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.tar.gz

      tar xf semaphore_2.17.15_linux_arm64.tar.gz
      ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows (x64)">
      ```powershell
      Invoke-WebRequest `
      -Uri ("https://github.com/semaphoreui/semaphore/releases/" +
            "download/v2.17.15/semaphore_2.17.15_windows_amd64.zip") `
      -OutFile semaphore.zip

      Expand-Archive -Path semaphore.zip  -DestinationPath ./
      ```
  </TabItem>
</Tabs>

## Wichtige Verhaltensänderungen {#behavior-changes}

Diese Änderungen gelten, wenn Sie auf aktuelle **2.20.x**-Versionen aktualisieren. Sie erfordern keine Datenbankmigration, aber Playbooks oder API-Clients, die sich auf das alte Verhalten verlassen haben, müssen eventuell angepasst werden.

### Ansible-Extra-Variablen sind Literale {#ansible-extra-vars-literal}

Semaphore übergibt Ansible-Extra-Variablen nicht mehr auf der Kommandozeile. Variablengruppen, Survey-Antworten, Workflow-Eingaben und das eingebaute Objekt `semaphore_vars` werden in temporäre YAML-Dateien geschrieben und als `--extra-vars @file` übergeben. Jeder String-Wert wird mit `!unsafe` markiert, sodass Ansible ihn als Daten behandelt und Jinja2 innerhalb des Werts nicht auswertet.

Wenn Sie Jinja2 in einem Survey-Feld, einer Variablengruppe oder einem `--extra-vars`-Template gespeichert haben und erwarten, dass Semaphore oder Ansible es vor dem Start des Playbooks auflöst, findet diese Auflösung nicht mehr statt. Verlagern Sie die Logik in das Playbook (verwenden Sie zum Beispiel `{{ my_var }}`, wobei `my_var` ein einfacher Wert aus Semaphore ist) oder berechnen Sie den Wert außerhalb von Semaphore.

Survey-Secrets und Secrets aus Variablengruppen werden in einer separaten Ansible-Vault-Datei verschlüsselt. Semaphore erzeugt pro Task eine einmalige Vault-ID und ein Passwort und beantwortet die Vault-Abfrage von Ansible über stdin. Das ist unabhängig von den Vault-Passwörtern, die Sie dem Template zuordnen.

Siehe [Survey-Variablen](/user-guide/task-templates/survey-vars), [Variablengruppen](/user-guide/environment) und [Sicherheit — Ansible-Task-Variablen](/admin-guide/security#ansible-task-variables).

### Workflow-Ausgaben und Task-API-Felder {#workflow-outputs-and-task-api}

[Workflow-Ausgaben](/user-guide/workflows#producing-outputs) werden vom Task-Lauf geschrieben und können beim Starten eines Tasks über die API nicht gesetzt werden. `POST /api/project/{project_id}/tasks` ignoriert `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` und `runner_id`, wenn sie im Body enthalten sind.
