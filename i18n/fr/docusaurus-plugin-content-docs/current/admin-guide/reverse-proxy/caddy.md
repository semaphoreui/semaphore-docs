# Configuration Caddy

Caddy prend en charge les websockets et n'active par défaut que des suites de chiffrement TLS sûres (TLS1.2 + TLS1.3) ; une configuration minimale suffit donc.

Exemple de configuration `/etc/caddy/Caddyfile` :

```
example.com {
    reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {client_ip}
    }
}
```

Si Caddy ne peut pas demander de certificat TLS via ACME (par ex. à cause d'un pare-feu ou de l'utilisation de domaines internes), ajoutez `tls internal` à la configuration.
