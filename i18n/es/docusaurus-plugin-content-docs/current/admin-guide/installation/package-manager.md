# Gestor de paquetes

:::tip
  Consulte la <a href="./../installation_manually">instalación manual</a> para saber cómo configurar su entorno de Python/Ansible/Systemd.
:::


Descargue el archivo del paquete desde la [página de versiones](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` para Debian y Ubuntu, `*.rpm` para CentOS y RedHat.&#x20;

A continuación se muestran varios comandos de instalación, según el gestor de paquetes:

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


Configure Semaphore con el siguiente comando:

```
semaphore setup
```

Ahora puede ejecutar Semaphore:

```
semaphore server --config=./config.json
```

Semaphore estará disponible en esta URL: [https://localhost:3000](https://localhost:3000).

----
