
# Sécurité réseau

Pour des raisons de sécurité, Semaphore **ne doit pas être utilisé** via HTTP non chiffré !

Pourquoi utiliser des connexions chiffrées ? Voir : [Article de Cloudflare](https://www.cloudflare.com/learning/ssl/why-use-https/).

Options disponibles :

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

Vous pouvez utiliser un VPN client-à-site, terminé sur le serveur Semaphore, pour chiffrer et sécuriser la connexion.

## TLS {#tls}

Semaphore prend en charge SSL/TLS à partir de la version 2.12.

**config.json** :
```json
{
    ...
    "tls": {
        "enabled": true,
        "cert_file": "/path/to/cert/example.com.cert",
        "key_file": "/path/to/key/example.com.key"
    }
    ...
}
```

Ou via des variables d'environnement (utile pour Docker) :

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### Écouteur de redirection HTTP vers HTTPS {#http-to-https-redirect-listener}

Pour configurer l'écouteur de redirection HTTP vers HTTPS, ajoutez l'un des champs suivants au bloc `tls` de `config.json`, ou définissez la variable d'environnement correspondante.

Utilisez `http_redirect_addr` pour lier l'écouteur à une adresse IP et un port spécifiques. Utilisez `http_redirect_port` pour écouter sur toutes les interfaces réseau. Ces options sont mutuellement exclusives.

| Lier l'écouteur de redirection HTTP à | `config.json` (bloc `tls`) | Variable d'environnement |
| --- | --- | --- |
| Une adresse IP et un port spécifiques | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| Toutes les interfaces réseau sur un port | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### Reverse proxy {#reverse-proxy}

Vous pouvez également utiliser un reverse proxy devant Semaphore pour gérer les connexions sécurisées. Par exemple :

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### Certificat SSL auto-signé {#self-signed-ssl-certificate}

Vous pouvez générer votre propre certificat SSL à l'aide de l'outil en ligne de commande `openssl` :

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Certificat SSL Let's Encrypt {#lets-encrypt-ssl-certificate}

Vous pouvez utiliser [Certbot](https://certbot.eff.org/) pour générer et renouveler automatiquement un certificat SSL Let's Encrypt.

Exemple pour Apache :

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### Autres {#others}

Si vous souhaitez utiliser un autre reverse proxy, veillez à transférer également les connexions websocket sur la route `/api/ws` !
