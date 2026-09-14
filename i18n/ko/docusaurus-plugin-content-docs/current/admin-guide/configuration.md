---
title: 설정
description: Semaphore는 설정 파일과 환경 변수에서 설정을 읽습니다. 온라인 설정 도구를 사용하면 양식을 통해 두 형식 모두 준비할 수 있습니다. 서버 운영 방식에 맞는 방법을 선택하세요.
---

# 설정

Semaphore는 설정 파일과 환경 변수에서 설정을 읽습니다. 온라인 설정 도구를 사용하면 양식을 통해 두 형식 모두 준비할 수 있습니다. 서버 운영 방식에 맞는 방법을 선택하세요.

## 이 섹션의 내용 {#in-this-section}

| 방법 | 사용할 상황 |
|---|---|
| [온라인 설정 도구](/admin-guide/configuration/online) | 양식으로 바이너리 또는 Docker 설치에 사용할 설정과 시작 명령을 생성하려는 경우. |
| [설정 파일](/admin-guide/configuration/config-file) | 서버 설정을 `config.json` 파일에 저장하려는 경우. |
| [환경 변수](/admin-guide/configuration/env-vars) | Docker, 서비스 정의 또는 배포 도구로 설정을 관리하는 경우. |

## 설정 옵션 {#configuration-options}

환경 변수는 설정 파일의 해당 값보다 우선합니다. 둘 다 지정하지 않으면 기본값을 사용합니다. 파일을 수정해도 반영되지 않으면 Semaphore 프로세스에 전달된 환경 변수를 확인하세요.

[설정 옵션 참조](/reference/configuration)에는 이름, 환경 변수, 유형 및 기본값이 나와 있습니다. Semaphore 소스 코드에서 생성되므로 이전 서버를 설정할 때는 해당 버전의 문서를 사용하세요.

<span id="frequently-asked-questions" />

## 공개 URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

`web_host`(또는 `SEMAPHORE_WEB_ROOT`)를 사용자가 브라우저에서 여는 주소로 설정하세요. 리버스 프록시가 `https://example.com/semaphore`에서 Semaphore를 제공한다면 `/semaphore`를 포함한 전체 주소를 사용하세요. 프록시가 연결하는 내부 주소가 아닌 공개 주소입니다.

## 시작하기 {#where-to-start}

새 서버는 위의 온라인 설정 도구 가이드를 열고 바이너리 또는 Docker 단계를 따르세요. 기존 서버는 서비스가 사용하는 파일이나 환경 변수를 수정한 뒤 Semaphore를 다시 시작하세요.
