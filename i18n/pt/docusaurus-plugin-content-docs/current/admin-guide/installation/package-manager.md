# Gerenciador de pacotes

:::tip
  Consulte a <a href="./../installation_manually">instalação manual</a> para saber como configurar seu ambiente Python/Ansible/Systemd!
:::


Baixe o arquivo de pacote na [página de Releases](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` para Debian e Ubuntu, `*.rpm` para CentOS e RedHat.&#x20;

Aqui estão vários comandos de instalação, dependendo do gerenciador de pacotes:

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


Configure o Semaphore usando o seguinte comando:

```
semaphore setup
```

Agora você pode executar o Semaphore:

```
semaphore server --config=./config.json
```

O Semaphore estará disponível nesta URL: [https://localhost:3000](https://localhost:3000).

----
