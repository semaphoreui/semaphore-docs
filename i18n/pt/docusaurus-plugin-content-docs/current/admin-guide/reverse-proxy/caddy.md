# Configuração do Caddy

O Caddy oferece suporte a websockets e, por padrão, habilita apenas cifras TLS seguras (TLS1.2 + TLS1.3), então é necessária uma configuração mínima.

Exemplo de configuração em `/etc/caddy/Caddyfile`:

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Se o Caddy não conseguir solicitar um certificado TLS usando ACME (por exemplo, por causa de firewall ou do uso de domínios internos), adicione `tls internal` à configuração.
