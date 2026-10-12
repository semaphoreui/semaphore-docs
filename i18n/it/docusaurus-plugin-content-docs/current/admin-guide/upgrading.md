# Aggiornamento

### Gestore di pacchetti {#package-manager}

Scaricare un file di pacchetto dalla [pagina delle release](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` per Debian e Ubuntu, `*.rpm` per CentOS e RedHat.&#x20;

Installarlo con il gestore di pacchetti.

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


### Binario {#binary}

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

## Modifiche rilevanti del comportamento {#behavior-changes}

Queste modifiche si applicano quando si esegue l'aggiornamento alle versioni recenti **2.20.x**. Non richiedono una migrazione del database, ma i playbook o i client API che si basavano sul comportamento precedente potrebbero richiedere aggiornamenti.

### Le variabili extra di Ansible sono letterali {#ansible-extra-vars-literal}

Semaphore non passa più le variabili extra di Ansible dalla riga di comando. I gruppi di variabili, le risposte dei sondaggi, gli input dei workflow e l'oggetto integrato `semaphore_vars` vengono scritti in file YAML temporanei e passati come `--extra-vars @file`. Ogni valore stringa è contrassegnato con `!unsafe`, quindi Ansible lo tratta come dato e non valuta il Jinja2 al suo interno.

Se è stato memorizzato Jinja2 in un campo di sondaggio, in un gruppo di variabili o in un template `--extra-vars` aspettandosi che Semaphore o Ansible lo espandesse prima dell'esecuzione del playbook, tale espansione non avviene più. Spostare la logica nel playbook (ad esempio usare `{{ my_var }}` dove `my_var` è un valore semplice fornito da Semaphore) oppure calcolare il valore al di fuori di Semaphore.

I segreti dei sondaggi e dei gruppi di variabili vengono cifrati in un file Ansible Vault separato. Semaphore genera per ogni Task un ID vault e una password monouso e risponde alla richiesta di vault di Ansible tramite stdin. Questo meccanismo è separato dalle password Vault associate al Task Template.

Vedere [Variabili del sondaggio](/user-guide/task-templates/survey-vars), [Gruppi di variabili](/user-guide/environment) e [Sicurezza — variabili dei Task Ansible](/admin-guide/security#ansible-task-variables).

### Output dei workflow e campi dell'API dei Task {#workflow-outputs-and-task-api}

Gli [output dei workflow](/user-guide/workflows#producing-outputs) vengono scritti dall'esecuzione del Task e non possono essere impostati quando si avvia un Task tramite l'API. `POST /api/project/{project_id}/tasks` ignora `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` e `runner_id` se presenti nel corpo della richiesta.
