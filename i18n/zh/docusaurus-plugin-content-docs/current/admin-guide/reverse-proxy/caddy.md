# Caddy 配置

Caddy 支持 WebSocket，并且默认只启用安全的 TLS 加密套件（TLS1.2 + TLS1.3），因此只需要极少的配置。

`/etc/caddy/Caddyfile` 配置示例：

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

如果 Caddy 无法通过 ACME 申请 TLS 证书（例如由于防火墙限制或使用内部域名），请在配置中添加 `tls internal`。
