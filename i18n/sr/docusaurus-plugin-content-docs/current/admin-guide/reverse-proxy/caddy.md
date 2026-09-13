# Caddy konfiguracija

Caddy podržava websocket-e i podrazumevano uključuje samo bezbedne TLS šifre (TLS1.2 + TLS1.3), tako da je potrebna minimalna konfiguracija.

Primer konfiguracije `/etc/caddy/Caddyfile`:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Ako Caddy ne može da zatraži TLS sertifikat pomoću ACME (npr. zbog firewall-a ili korišćenja internih domena), dodajte `tls internal` u konfiguraciju.
