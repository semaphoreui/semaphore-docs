---
title: 리버스 프록시
description: Semaphore를 리버스 프록시 뒤에 두는 이유, 모든 구성이 반드시 처리해야 하는 사항, 그리고 nginx, Apache, Caddy 예제입니다.
---

# 리버스 프록시

리버스 프록시는 Semaphore 앞에 위치해 TLS를 종료합니다. 따라서 브라우저와 러너는 HTTPS로
프록시와 통신하고, Semaphore 자체는 로컬 인터페이스에서 일반 HTTP로 수신 대기합니다.
Semaphore에는 [내장 TLS](/admin-guide/security/network#tls) 기능도 있으므로 프록시가 반드시
필요한 것은 아닙니다. 이미 프록시를 운영하고 있거나, 인증서를 다른 곳에서 관리해야 하거나,
Semaphore를 하위 경로에서 제공하려 하거나, 한 호스트에서 여러 서비스를 제공할 때 프록시를
사용하십시오.

## 모든 구성이 처리해야 하는 사항 {#what-every-configuration-must-handle}

어떤 프록시를 선택하든 다음 세 가지가 올바르게 설정되어야 합니다. 그렇지 않으면 인터페이스
일부가 원인을 파악하기 어려운 방식으로 동작하지 않습니다.

- **`/api/ws`의 WebSocket 업그레이드.** 작업 로그는 WebSocket으로 스트리밍됩니다. 업그레이드
  헤더가 없으면 작업이 실행되는 동안에도 로그 창이 비어 있습니다.
- **ping 주기보다 긴 읽기 타임아웃.** Semaphore는 유휴 상태의 WebSocket에 약 2분마다 ping을
  보냅니다. 유휴 연결을 60초 후에 닫는 프록시는 로그 보기를 반복적으로 끊습니다.
- **공개 URL로 설정된 `web_host`.** Semaphore는 이 값을 사용해 리디렉션 URL을 만들고, 쿠키의
  `Secure` 플래그를 설정하며, 요청의 출처를 확인합니다. 이 값이 브라우저가 사용한 주소와
  일치하지 않으면 로그인이 실패합니다.
  [설정](/admin-guide/configuration)을 참조하십시오.

## 이 섹션의 내용 {#in-this-section}

| 페이지 | 내용 |
|---|---|
| [nginx](/admin-guide/reverse-proxy/nginx) | TLS, WebSocket 업그레이드 및 전달 헤더를 포함한 server 블록입니다. |
| [Apache](/admin-guide/reverse-proxy/apache) | `mod_proxy`와 `mod_proxy_wstunnel`을 사용하는 가상 호스트입니다. |
| [Caddy](/admin-guide/reverse-proxy/caddy) | 인증서를 자동으로 발급받는 최소한의 Caddyfile입니다. |

## 어디서 시작할까요 {#where-to-start}

이미 운영하고 있는 프록시를 선택하십시오. 선호하는 것이 없고 기존 프록시도 없다면
[Caddy](/admin-guide/reverse-proxy/caddy)가 가장 빠른 길입니다. 인증서를 스스로 발급하고
갱신하기 때문입니다.

TLS를 넘어선 강화 방법은 [네트워크 보안](/admin-guide/security/network)을 참조하십시오.
