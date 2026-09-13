# Paketmanager

:::tip
  Sehen Sie sich die <a href="./../installation_manually">manuelle Installation</a> an, um zu erfahren, wie Sie Ihre Python-/Ansible-/Systemd-Umgebung einrichten!
:::


Laden Sie die Paketdatei von der [Releases-Seite](https://github.com/semaphoreui/semaphore/releases) herunter.

&#x20;`*.deb` für Debian und Ubuntu, `*.rpm` für CentOS und RedHat.&#x20;

Hier sind einige Installationsbefehle, abhängig vom Paketmanager:

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


Richten Sie Semaphore mit dem folgenden Befehl ein:

```
semaphore setup
```

Jetzt können Sie Semaphore starten:

```
semaphore server --config=./config.json
```

Semaphore ist über diese URL erreichbar: [https://localhost:3000](https://localhost:3000).

----
