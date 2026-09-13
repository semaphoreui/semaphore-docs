# Caddy 설정

Caddy는 websocket을 지원하며 기본적으로 안전한 TLS 암호화 스위트(TLS1.2 + TLS1.3)만 활성화하므로 최소한의 설정만 필요합니다.

`/etc/caddy/Caddyfile` 설정 예시:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Caddy가 ACME를 통해 TLS 인증서를 요청할 수 없는 경우(예: 방화벽 때문이거나 내부 도메인을 사용하는 경우), 설정에 `tls internal`을 추가하십시오.
