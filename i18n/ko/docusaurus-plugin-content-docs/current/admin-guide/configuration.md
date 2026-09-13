# 설정

Semaphore는 여러 가지 방법으로 설정할 수 있습니다:

* [온라인 설정 도구](https://semaphoreui.com/install) &mdash; 온라인으로 설정을 생성하는 웹 인터페이스입니다.
* [설정 파일](/admin-guide/configuration/config-file) &mdash; Semaphore를 설정하는 기본적이며 가장 유연한 방법입니다.
* [환경 변수](/admin-guide/configuration/env-vars) &mdash; 컨테이너 기반 또는 클라우드 네이티브 배포에 유용합니다.


## 설정 옵션 {#configuration-options}

모든 옵션과 해당 환경 변수, 타입, 기본값은
[구성 옵션 레퍼런스](/reference/configuration)에 정리되어 있습니다. 이 페이지는 Semaphore
소스에서 생성되므로 실행 중인 릴리스와 항상 일치합니다.

값은 한 가지 순서로 결정됩니다. 환경 변수가 구성 파일보다 우선하며, 내장 기본값은 둘 다
설정되지 않았을 때만 적용됩니다.

## 자주 묻는 질문 {#frequently-asked-questions}

### 1. Semaphore UI의 공개 URL을 설정하는 방법 {#1-how-to-configure-a-public-url-for-semaphore-ui}

Semaphore 앞에 nginx 또는 다른 웹 서버를 사용하는 경우 `web_host` 설정 옵션을 지정해야 합니다.

예를 들어 Semaphore로 요청을 프록시하는 서버에 NGINX를 설정했다고 가정합니다.

서버 주소가 `https://example.com`이고 `https://example.com/semaphore`로 들어오는 모든 요청을 Semaphore로 프록시합니다.

이 경우 `web_host`는 `https://example.com/semaphore`가 됩니다.
