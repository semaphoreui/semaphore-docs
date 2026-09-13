# Snap(지원 중단)

snap으로 Semaphore를 설치하려면 터미널에서 다음 명령을 실행합니다.

```bash
sudo snap install semaphore
```

Semaphore는 다음 URL에서 접속할 수 있습니다: [https://localhost:3000](https://localhost:3000).&#x20;

하지만 로그인하려면 관리자 사용자를 생성해야 합니다. 다음 명령을 사용하십시오.

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

다음 명령으로 Semaphore 서비스의 상태를 확인할 수 있습니다.

```bash
sudo snap services semaphore
```

다음과 같은 표가 출력되어야 합니다.

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

설치 후 [Snap 구성](https://snapcraft.io/docs/configuration-in-snaps)을 통해 Semaphore를 설정할 수 있습니다. 다음 명령으로 Semaphore 구성을 확인합니다.

```bash
sudo snap get semaphore
```

&#x20;사용 가능한 옵션 목록은 [구성 옵션 참조](../configuration#configuration-options)에서 확인할 수 있습니다.

----
