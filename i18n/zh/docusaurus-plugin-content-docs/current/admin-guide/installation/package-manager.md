# 包管理器

:::tip
  请参阅<a href="./../installation_manually">手动安装</a>，了解如何设置你的 Python/Ansible/Systemd 环境！
:::


从 [Releases 页面](https://github.com/semaphoreui/semaphore/releases)下载软件包文件。

&#x20;Debian 和 Ubuntu 使用 `*.deb`，CentOS 和 RedHat 使用 `*.rpm`。&#x20;

根据不同的包管理器，安装命令如下：

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="debian-x64" label="Debian / Ubuntu（x64）">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.17.15/semaphore_2.17.15_linux_amd64.deb

    sudo dpkg -i semaphore_2.17.15_linux_amd64.deb
    ```
  </TabItem>
  <TabItem value="debian-arm64" label="Debian / Ubuntu（ARM64）">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.17.15/semaphore_2.17.15_linux_arm64.deb

    sudo dpkg -i semaphore_2.17.15_linux_arm64.deb
    ```
  </TabItem>
  <TabItem value="centos-x64" label="CentOS（x64）">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.17.15/semaphore_2.17.15_linux_amd64.rpm

    sudo yum install semaphore_2.17.15_linux_amd64.rpm
    ```
  </TabItem>
  <TabItem value="centos-arm64" label="CentOS（ARM64）">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.17.15/semaphore_2.17.15_linux_arm64.rpm

    sudo yum install semaphore_2.17.15_linux_arm64.rpm
    ```
  </TabItem>
</Tabs>


使用以下命令初始化 Semaphore：

```
semaphore setup
```

现在可以运行 Semaphore 了：

```
semaphore server --config=./config.json
```

Semaphore 将通过此 URL 提供访问：[https://localhost:3000](https://localhost:3000)。

----
