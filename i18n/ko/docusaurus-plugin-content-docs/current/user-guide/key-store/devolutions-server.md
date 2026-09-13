---
title: "Devolutions Server 시크릿 스토리지"
---

# Devolutions Server 시크릿 스토리지 <Enterprise />

Semaphore UI는 Devolutions Server를 시크릿 스토리지로 지원합니다. 

![](/assets/dvls1.webp)

다음 옵션을 제공할 수 있습니다:
- **Devolutions Server URL** — Devolutions 서버의 주소.
- **Vault ID** — 시크릿이 저장된 vault의 식별자.
- **App Key** — 인증에 사용되는 애플리케이션 키.
- **Token** — 인증 token. token은 다음 방식으로 제공할 수 있습니다:
    - 데이터베이스에 저장.
    - 환경 변수를 통해 제공.
    - 파일을 통해 제공.

이 스토리지는 읽기 전용 모드로 작동할 수 있습니다.