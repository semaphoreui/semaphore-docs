<div class="breadcrumbs">
    <a href="/administration-guide/installation">Installation</a>
    → Binary file
</div>

# Binary file

<div class="warning">
    Look into the <a href="./../installation_manually.md">manual installation</a> on how to set-up your Python/Ansible/Systemd environment!
</div>


Download the `*.tar.gz` for your platform from [Releases page](https://github.com/semaphoreui/semaphore/releases). Unpack it and setup Semaphore using the following commands:

{{#tabs }}
{{#tab name="Linux (x64)" }}
```
download/v2.15.0/semaphore_2.15.0_linux_amd64.tar.gz

tar xf semaphore_2.15.0_linux_amd64.tar.gz

./semaphore setup
```
{{#endtab }}

{{#tab name="Linux (ARM64)" }}
```
wget https://github.com/semaphoreui/semaphore/releases/\

download/v2.15.0/semaphore_2.15.0_linux_arm64.tar.gz

tar xf semaphore_2.15.0_linux_arm64.tar.gz

./semaphore setup
```
{{#endtab }}

{{#tab name="Windows (x64)" }}
```
Invoke-WebRequest `
-Uri ("https://github.com/semaphoreui/semaphore/releases/" +
      "download/v2.15.0/semaphore_2.15.0_windows_amd64.zip") `

-OutFile semaphore.zip

Expand-Archive -Path semaphore.zip  -DestinationPath ./

./semaphore setup
```
{{#endtab }}
{{#endtabs }}

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

<div class="warning">
  Replace <code>/path/to/semaphore</code> and <code>/path/to/config.json</code> to your semaphore and config file path.
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
