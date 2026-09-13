# Archivo binario

:::tip
    Consulte la <a href="./../installation_manually">instalación manual</a> para saber cómo configurar su entorno de Python/Ansible/Systemd.
:::


Descargue el archivo `*.tar.gz` para su plataforma desde la [página de versiones](https://github.com/semaphoreui/semaphore/releases). Descomprímalo y configure Semaphore con los siguientes comandos:


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="linux-x64" label="Linux (x64)">
    ```bash
    wget https://github.com/semaphoreui/semaphore/releases/download/v2.17.15/semaphore_2.17.15_linux_amd64.tar.gz

    tar xf semaphore_2.17.15_linux_amd64.tar.gz

    ./semaphore setup
    ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux (ARM64)">
    ```
    wget https://github.com/semaphoreui/semaphore/releases/download/v2.17.15/semaphore_2.17.15_linux_arm64.tar.gz

    tar xf semaphore_2.17.15_linux_arm64.tar.gz

    ./semaphore setup
    ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows (x64)">
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

Ahora puede ejecutar Semaphore:

```bash
./semaphore server --config=./config.json
```

Semaphore estará disponible en la siguiente URL: [https://localhost:3000](https://localhost:3000).

----

### Ejecutar como servicio {#run-as-a-service}

Para obtener información más detallada &mdash; consulte la [documentación ampliada del servicio de Systemd](../installation_manually#extended-systemd-service).

Si instaló Semaphore mediante un gestor de paquetes o descargando un archivo binario, deberá crear el servicio de Semaphore manualmente.

Cree el archivo del servicio de systemd:

<div class="warning">
  Sustituya <code>/path/to/semaphore</code> y <code>/path/to/config.json</code> por las rutas de su binario de Semaphore y de su archivo de configuración.
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

Inicie el servicio de Semaphore:

```bash
sudo systemctl daemon-reload
sudo systemctl start semaphore
```

Compruebe el estado del servicio de Semaphore:

```bash
sudo systemctl status semaphore
```

Para que el servicio de Semaphore se inicie automáticamente:

```bash
sudo systemctl enable semaphore
```
