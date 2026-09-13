# Менеджер пакетов

:::tip
  Ознакомьтесь с <a href="./../installation_manually">ручной установкой</a>, чтобы узнать, как настроить окружение Python/Ansible/Systemd!
:::


Скачайте файл пакета со [страницы релизов](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` для Debian и Ubuntu, `*.rpm` для CentOS и RedHat.&#x20;

Ниже приведены команды установки для разных менеджеров пакетов:

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


Настройте Semaphore с помощью следующей команды:

```
semaphore setup
```

Теперь можно запустить Semaphore:

```
semaphore server --config=./config.json
```

Semaphore будет доступен по этому URL: [https://localhost:3000](https://localhost:3000).

----
