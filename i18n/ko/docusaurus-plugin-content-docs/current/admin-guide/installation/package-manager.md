# 패키지 관리자

:::tip
  Python/Ansible/Systemd 환경을 설정하는 방법은 <a href="./../installation_manually">수동 설치</a>를 참조하십시오!
:::


[릴리스 페이지](https://github.com/semaphoreui/semaphore/releases)에서 패키지 파일을 다운로드합니다.

&#x20;Debian과 Ubuntu는 `*.deb`, CentOS와 RedHat은 `*.rpm`을 사용합니다.&#x20;

패키지 관리자에 따른 설치 명령은 다음과 같습니다.

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


다음 명령으로 Semaphore를 설정합니다.

```
semaphore setup
```

이제 Semaphore를 실행할 수 있습니다.

```
semaphore server --config=./config.json
```

Semaphore는 다음 URL에서 접속할 수 있습니다: [https://localhost:3000](https://localhost:3000).

----
