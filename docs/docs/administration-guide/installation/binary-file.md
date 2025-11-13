# Binary file

:::warning
Look into the [manual installation](../installation_manually.md) on how to set-up your Python/Ansible/Systemd environment!
:::

Download the `*.tar.gz` for your platform from [Releases page](https://github.com/semaphoreui/semaphore/releases). Unpack it and setup Semaphore using the following commands:

import {Tabs, TabItem} from '@theme/Tabs';

<Tabs>
  <TabItem value="linux-x64" label="Linux (x64)" default>
    ```
    download/v2.15.0/semaphore_2.15.0_linux_amd64.tar.gz

    tar xf semaphore_2.15.0_linux_amd64.tar.gz

    ./semaphore setup
    ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux (ARM64)">
    ```
    wget https://github.com/semaphoreui/semaphore/releases/\
    download/v2.15.0/semaphore_2.15.0_linux_arm64.tar.gz

    tar xf semaphore_2.15.0_linux_arm64.tar.gz

    ./semaphore setup
    ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows (x64)">
    ```
    Invoke-WebRequest `
    -Uri ("https://github.com/semaphoreui/semaphore/releases/" +
          "download/v2.15.0/semaphore_2.15.0_windows_amd64.zip") `

    -OutFile semaphore.zip

    Expand-Archive -Path semaphore.zip  -DestinationPath ./

    ./semaphore setup
    ```
  </TabItem>
</Tabs>

Now you can run Semaphore:

```
./semaphore server --config=./config.json
```

Semaphore will be available via the following URL [https://localhost:3000](https://localhost:3000).

----

### Run as a service

For more detailed information &mdash; look into the [extended Systemd service documentation](../installation_manually.md#extended-systemd-service).

If you installed Semaphore via a package manager, or by downloading a binary file, you should create the Semaphore service manually.

Create the systemd service file:

:::warning
Replace `/path/to/semaphore` and `/path/to/config.json` to your semaphore and config file path.
:::

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

Start the Semaphore service:

```bash
sudo systemctl daemon-reload
sudo systemctl start semaphore
```

Check the Semaphore service status:

```bash
sudo systemctl status semaphore
```

To make the Semaphore service auto start:

```bash
sudo systemctl enable semaphore
```
