# Configuración de Caddy

Caddy admite websockets y, de forma predeterminada, solo habilita cifrados TLS seguros (TLS1.2 + TLS1.3), por lo que se necesita una configuración mínima.

Ejemplo de configuración de `/etc/caddy/Caddyfile`:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Si Caddy no puede solicitar un certificado TLS mediante ACME (p. ej. debido a un cortafuegos o al uso de dominios internos), añada `tls internal` a la configuración.
