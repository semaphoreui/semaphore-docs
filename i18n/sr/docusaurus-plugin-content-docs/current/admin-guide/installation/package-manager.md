# Menadžer paketa

:::tip
  Pogledajte <a href="./../installation_manually">ručnu instalaciju</a> da biste saznali kako da podesite Python/Ansible/Systemd okruženje!
:::


Preuzmite paket sa [stranice sa izdanjima](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` za Debian i Ubuntu, `*.rpm` za CentOS i RedHat.&#x20;

Evo nekoliko komandi za instalaciju, u zavisnosti od menadžera paketa:

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


Podesite Semaphore sledećom komandom:

```
semaphore setup
```

Sada možete pokrenuti Semaphore:

```
semaphore server --config=./config.json
```

Semaphore će biti dostupan na ovoj adresi: [https://localhost:3000](https://localhost:3000).

----
