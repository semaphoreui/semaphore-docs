# Nadogradnja

### Menadžer paketa {#package-manager}

Preuzmite datoteku paketa sa [stranice sa izdanjima](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` za Debian i Ubuntu, `*.rpm` za CentOS i RedHat.&#x20;

Instalirajte je pomoću menadžera paketa.

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


### Binarna datoteka {#binary}

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

## Značajne promene u ponašanju {#behavior-changes}

Ove promene važe kada nadogradite na novije **2.20.x** verzije. Ne zahtevaju migraciju baze podataka, ali playbook-ovi ili API klijenti koji su se oslanjali na staro ponašanje možda će morati da se ažuriraju.

### Ansible dodatne promenljive su literali {#ansible-extra-vars-literal}

Semaphore više ne prosleđuje Ansible dodatne promenljive preko komandne linije. Grupe promenljivih, odgovori iz ankete, ulazi workflow-a i ugrađeni objekat `semaphore_vars` upisuju se u privremene YAML fajlove i prosleđuju kao `--extra-vars @file`. Svaka string vrednost označena je tagom `!unsafe`, pa je Ansible tretira kao podatak i ne procenjuje Jinja2 unutar vrednosti.

Ako ste Jinja2 sačuvali u polju ankete, grupi promenljivih ili `--extra-vars` šablonu očekujući da će ga Semaphore ili Ansible razviti pre pokretanja playbook-a, to razvijanje se više ne dešava. Prebacite logiku u playbook (na primer, koristite `{{ my_var }}` gde je `my_var` obična vrednost iz Semaphore-a) ili izračunajte vrednost izvan Semaphore-a.

Tajne iz ankete i tajne iz grupa promenljivih šifruju se u zasebnom Ansible Vault fajlu. Semaphore za svaki zadatak generiše jednokratni vault ID i lozinku i odgovara na Ansible vault upit preko stdin. Ovo je odvojeno od vault lozinki koje priložite šablonu.

Pogledajte [Promenljive ankete](/user-guide/task-templates/survey-vars), [Grupe promenljivih](/user-guide/environment) i [Bezbednost — promenljive Ansible zadataka](/admin-guide/security#ansible-task-variables).

### Izlazi workflow-a i polja API-ja zadataka {#workflow-outputs-and-task-api}

[Izlazi workflow-a](/user-guide/workflows#producing-outputs) upisuju se tokom izvršavanja zadatka i ne mogu se postaviti kada zadatak pokrenete preko API-ja. `POST /api/project/{project_id}/tasks` ignoriše `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` i `runner_id` ako se nalaze u telu zahteva.
