# Package manager

<div class="warning">
  Look into the <a href="./../installation_manually.md">manual installation</a> on how to set-up your Python/Ansible/Systemd environment!
</div>


Download package file from [Releases page](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` for Debian and Ubuntu, `*.rpm` for CentOS and RedHat.&#x20;

Here are several installation commands, depending on the package manager:

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="debian-x64" label="Debian / Ubuntu (x64)">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.15.0/semaphore_2.15.0_linux_amd64.deb

    sudo dpkg -i semaphore_2.15.0_linux_amd64.deb
    ```
  </TabItem>
  <TabItem value="debian-arm64" label="Debian / Ubuntu (ARM64)">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.15.0/semaphore_2.15.0_linux_arm64.deb

    sudo dpkg -i semaphore_2.15.0_linux_arm64.deb
    ```
  </TabItem>
  <TabItem value="centos-x64" label="CentOS (x64)">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.15.0/semaphore_2.15.0_linux_amd64.rpm

    sudo yum install semaphore_2.15.0_linux_amd64.rpm
    ```
  </TabItem>
  <TabItem value="centos-arm64" label="CentOS (ARM64)">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.15.0/semaphore_2.15.0_linux_arm64.rpm

    sudo yum install semaphore_2.15.0_linux_arm64.rpm
    ```
  </TabItem>
</Tabs>


Setup Semaphore by using the following command:

```
semaphore setup
```

Now you can run Semaphore:

```
semaphore server --config=./config.json
```

Semaphore will be available via this URL [https://localhost:3000](https://localhost:3000).

----
