# バイナリファイル

:::tip
    Python/Ansible/Systemd 環境のセットアップ方法については、<a href="./../installation_manually">手動インストール</a>を参照してください!
:::


お使いのプラットフォーム向けの `*.tar.gz` を[リリースページ](https://github.com/semaphoreui/semaphore/releases)からダウンロードします。展開して、次のコマンドで Semaphore をセットアップします。


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

これで Semaphore を起動できます。

```bash
./semaphore server --config=./config.json
```

Semaphore には次の URL からアクセスできます: [https://localhost:3000](https://localhost:3000)。

----

### サービスとして実行する {#run-as-a-service}

より詳しい情報については、[Systemd サービスの詳細ドキュメント](../installation_manually#extended-systemd-service)を参照してください。

パッケージマネージャーまたはバイナリファイルのダウンロードで Semaphore をインストールした場合は、Semaphore サービスを手動で作成する必要があります。

systemd のサービスファイルを作成します。

<div class="warning">
  <code>/path/to/semaphore</code> と <code>/path/to/config.json</code> は、お使いの semaphore と設定ファイルのパスに置き換えてください。
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

Semaphore サービスを起動します。

```bash
sudo systemctl daemon-reload
sudo systemctl start semaphore
```

Semaphore サービスの状態を確認します。

```bash
sudo systemctl status semaphore
```

Semaphore サービスを自動起動にするには、次を実行します。

```bash
sudo systemctl enable semaphore
```
