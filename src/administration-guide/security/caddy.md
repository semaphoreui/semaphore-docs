<div class="breadcrumbs">
    Administration Guide
    → <a href="/administration-guide/security/">Security</a>
    → Caddy config
</div>


# Caddy config

Caddy supports websockets and will by default only enable secure TLS ciphers (TLS1.2 + TLS1.3), so minimal config is needed.

Example `/etc/caddy/Caddyfile` config:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

If Caddy can't request a TLS cert using ACME (e.g. due to firewall or using internal domains), then add `tls internal` to the config.
