# 二进制文件

:::tip
    请查看<a href="./../installation_manually">手动安装</a>，了解如何搭建你的 Python/Ansible/Systemd 环境！
:::


从[发布页面](https://github.com/semaphoreui/semaphore/releases)下载适用于你平台的 `*.tar.gz`。解压后使用以下命令设置 Semaphore：


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="linux-x64" label="Linux（x64）">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/download/v2.17.15/semaphore_2.17.15_linux_amd64.tar.gz

    tar xf semaphore_2.17.15_linux_amd64.tar.gz

    ./semaphore setup
    ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux（ARM64）">
    ```
    wget https://github.com/semaphoreui/semaphore/releases/download/v2.17.15/semaphore_2.17.15_linux_arm64.tar.gz

    tar xf semaphore_2.17.15_linux_arm64.tar.gz

    ./semaphore setup
    ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows（x64）">
    ```powershell
    Invoke-WebRequest `
    -Uri ("https://github.com/semaphoreui/semaphore/releases/" +
          "download/v2.17.15/semaphore_2.17.15_windows_amd64.zip") `

    -OutFile semaphore.zip

    Expand-Archive -Path semaphore.zip  -DestinationPath ./

    ./semaphore setup
    ```
  </TabItem>
</Tabs>

现在可以运行 Semaphore 了：

```bash
./semaphore server --config=./config.json
```

Semaphore 将可通过以下 URL 访问：[https://localhost:3000](https://localhost:3000)。

----

### 作为服务运行 {#run-as-a-service}

更详细的信息 &mdash; 请查看[扩展的 Systemd 服务文档](../installation_manually#extended-systemd-service)。

如果你是通过包管理器或下载二进制文件安装的 Semaphore，则需要手动创建 Semaphore 服务。

创建 systemd 服务文件：

<div class="warning">
  将 <code>/path/to/semaphore</code> 和 <code>/path/to/config.json</code> 替换为你的 semaphore 和配置文件的路径。
</div>

```bash
sudo cat > /etc/systemd/system/semaphore.service <<EOF
[Unit]
Description=Semaphore Ansible
Documentation=https://github.com/semaphoreui/semaphore
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
ExecReload=/bin/kill -HUP $MAINPID
ExecStart=/path/to/semaphore server --config=/path/to/config.json
SyslogIdentifier=semaphore
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF
```

启动 Semaphore 服务：

```bash
sudo systemctl daemon-reload
sudo systemctl start semaphore
```

检查 Semaphore 服务状态：

```bash
sudo systemctl status semaphore
```

设置 Semaphore 服务开机自启：

```bash
sudo systemctl enable semaphore
```
