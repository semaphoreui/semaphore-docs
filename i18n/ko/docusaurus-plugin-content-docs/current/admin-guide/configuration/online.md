---
title: 온라인 설정 도구 사용하기
description: Semaphore 온라인 설정 도구로 바이너리 설정 명령이나 Docker Compose 파일을 생성합니다.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# 온라인 설정 도구 사용하기

양식을 작성하면 새 Semaphore 서버의 설정 명령이 생성됩니다. 입력에 따라 미리보기가 갱신되며, 결과를 자신의 서버에 적용하면 설정이 완료됩니다.

## 시작하기 전에 {#before-you-begin}

- 바이너리 또는 Docker 설치 방식과 Semaphore 버전을 선택하세요. 아래 링크와 영상은 **2.19**를 사용합니다. 사이트에서 사용할 버전을 선택하세요.
- MySQL 또는 Postgres는 연결 정보를 준비하세요. SQLite는 Semaphore 서비스 사용자가 쓸 수 있는 데이터베이스 파일 경로를 선택하세요.
- 자신만의 관리자 비밀번호를 사용하세요. 영상에는 데모 값이 사용됩니다.

## 단계 {#steps}

설치 방식에 맞는 섹션을 따르세요.

### 바이너리 설치 {#binary-installation}

1. [바이너리 설치 페이지](https://semaphoreui.com/install/binary/2_19/install)를 여세요. 플랫폼, 아키텍처와 패키지 유형을 찾으세요. 행을 클릭하면 명령이 표시됩니다. 복사해서 서버에서 실행하거나 **Download**로 패키지를 받으세요.
2. [Server setup](https://semaphoreui.com/install/binary/2_19/config)을 여세요. **Database settings**에서 **SQLite**, **MySQL**, **Postgres** 중 하나를 선택하고 파일 경로나 연결 정보를 입력하세요. **Admin user**에서 로그인, 비밀번호, 이름, 이메일을 입력하세요.
3. **Config file**로 돌아가 복사 아이콘을 클릭하세요. 생성된 명령을 검토한 후 서버의 쓰기 가능한 디렉터리에서 실행하세요. 명령은 `config.json`을 만들고 관리자를 추가한 뒤 Semaphore를 시작합니다. 다음 실행을 위해 설정과 생성된 암호화 키를 보관하세요.

![설치 명령을 표시하도록 펼친 Linux amd64 deb 행](/img/admin-guide/configuration/online/binary-install.png)

![데모 값을 입력한 데이터베이스 및 관리자 설정 필드](/img/admin-guide/configuration/online/binary-settings.png)

영상은 패키지 선택, 서버 설정과 명령 복사를 보여 줍니다.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="영상은 패키지 선택, 서버 설정과 명령 복사를 보여 줍니다.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Docker 설치 {#docker-installation}

1. [Docker 설정 도구](https://semaphoreui.com/install/docker/2_19)를 여세요. **Container settings**에서 이름과 호스트 포트를 설정하세요. **Docker volumes**에서 데이터 및 설정 볼륨을 활성화해 컨테이너를 교체해도 유지되도록 하세요.
2. 데이터베이스를 선택하고 **Admin user**에 자신만의 비밀번호를 포함한 정보를 입력하세요. 외부 데이터베이스는 컨테이너에서 접근 가능한 호스트를 사용하세요.
3. **Docker Compose**를 선택하고 다운로드 아이콘을 클릭하세요. 결과를 배포 디렉터리에 `docker-compose.yml`로 저장하고 검토한 뒤 해당 위치에서 `docker compose up -d`를 실행하세요. 또는 **Docker command**를 선택하고 생성된 `docker run` 명령을 복사하세요.

![영구 데이터 및 설정 볼륨을 활성화한 Docker 컨테이너 설정](/img/admin-guide/configuration/online/docker-settings.png)

영상은 컨테이너 설정, 영구 볼륨과 Docker Compose 다운로드를 보여 줍니다.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="영상은 컨테이너 설정, 영구 볼륨과 Docker Compose 다운로드를 보여 줍니다.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## 다음 단계 {#whats-next}

브라우저에서 서버를 열고 입력한 관리자 계정으로 로그인하세요. 로컬 실행 시 주소는 예를 들어 `http://localhost:3000`입니다.

- [바이너리를 서비스로 실행하기](/admin-guide/installation/binary-file#run-as-a-service).
- [Docker 배포 상세 정보](/admin-guide/installation/docker).
- [모든 설정 옵션](/reference/configuration).
