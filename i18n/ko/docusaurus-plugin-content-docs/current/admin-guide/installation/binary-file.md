# 바이너리 파일

:::tip
    Python/Ansible/Systemd 환경을 설정하는 방법은 <a href="./../installation_manually">수동 설치</a>를 참조하십시오!
:::


[릴리스 페이지](https://github.com/semaphoreui/semaphore/releases)에서 사용 중인 플랫폼에 맞는 `*.tar.gz`를 다운로드합니다. 압축을 풀고 다음 명령으로 Semaphore를 설정합니다.


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

이제 Semaphore를 실행할 수 있습니다.

```bash
./semaphore server --config=./config.json
```

Semaphore는 다음 URL에서 접속할 수 있습니다: [https://localhost:3000](https://localhost:3000).

----

### 서비스로 실행 {#run-as-a-service}

더 자세한 내용은 [확장 Systemd 서비스 문서](../installation_manually#extended-systemd-service)를 참조하십시오.

패키지 관리자로 설치했거나 바이너리 파일을 다운로드하여 설치한 경우, Semaphore 서비스를 직접 생성해야 합니다.

systemd 서비스 파일을 생성합니다.

<div class="warning">
  <code>/path/to/semaphore</code>와 <code>/path/to/config.json</code>을 실제 semaphore 및 구성 파일 경로로 바꾸십시오.
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

Semaphore 서비스를 시작합니다.

```bash
sudo systemctl daemon-reload
sudo systemctl start semaphore
```

Semaphore 서비스 상태를 확인합니다.

```bash
sudo systemctl status semaphore
```

Semaphore 서비스가 자동으로 시작되도록 설정합니다.

```bash
sudo systemctl enable semaphore
```
