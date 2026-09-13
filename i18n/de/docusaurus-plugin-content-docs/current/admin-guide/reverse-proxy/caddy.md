# Caddy-Konfiguration

Caddy unterstützt WebSockets und aktiviert standardmäßig nur sichere TLS-Cipher (TLS 1.2 + TLS 1.3), daher ist nur eine minimale Konfiguration erforderlich.

Beispiel für eine `/etc/caddy/Caddyfile`-Konfiguration:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Wenn Caddy kein TLS-Zertifikat über ACME anfordern kann (z. B. wegen einer Firewall oder bei Verwendung interner Domains), fügen Sie `tls internal` zur Konfiguration hinzu.
