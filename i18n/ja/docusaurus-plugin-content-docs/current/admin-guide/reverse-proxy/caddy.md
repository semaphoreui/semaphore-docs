# Caddy の設定

Caddy は WebSocket をサポートしており、デフォルトで安全な TLS 暗号スイート(TLS1.2 + TLS1.3)のみを有効にするため、必要な設定は最小限です。

`/etc/caddy/Caddyfile` の設定例:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Caddy が ACME で TLS 証明書を取得できない場合(ファイアウォールや内部ドメインの使用などが原因)は、設定に `tls internal` を追加してください。
