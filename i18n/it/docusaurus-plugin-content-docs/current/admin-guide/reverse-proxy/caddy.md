# Configurazione Caddy

Caddy supporta i websocket e per impostazione predefinita abilita solo cifrari TLS sicuri (TLS1.2 + TLS1.3), quindi è necessaria una configurazione minima.

Esempio di configurazione `/etc/caddy/Caddyfile`:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Se Caddy non riesce a richiedere un certificato TLS tramite ACME (ad es. a causa di un firewall o dell'uso di domini interni), aggiungere `tls internal` alla configurazione.
