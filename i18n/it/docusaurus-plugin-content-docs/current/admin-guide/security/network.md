
# Sicurezza di rete

Per motivi di sicurezza, Semaphore **non deve essere utilizzato** su HTTP non cifrato!

Perché usare connessioni cifrate? Vedere: [Articolo di Cloudflare](https://www.cloudflare.com/learning/ssl/why-use-https/).

Le opzioni disponibili sono:

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

È possibile utilizzare una VPN Client-to-Site, che termina sul server Semaphore, per cifrare e proteggere la connessione.

## TLS {#tls}

Semaphore supporta SSL/TLS a partire dalla versione v2.12.

**config.json**:
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

Oppure tramite variabili d'ambiente (utile per Docker):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### Listener di reindirizzamento da HTTP a HTTPS {#http-to-https-redirect-listener}

Per configurare il listener di reindirizzamento da HTTP a HTTPS, aggiungere uno dei seguenti campi al blocco `tls` in `config.json`, oppure impostare la variabile d'ambiente corrispondente.

Usare `http_redirect_addr` per associare il listener a un indirizzo IP e a una porta specifici. Usare `http_redirect_port` per restare in ascolto su tutte le interfacce di rete. Queste opzioni si escludono a vicenda.

| Associare il listener di reindirizzamento HTTP a | `config.json` (blocco `tls`) | Variabile d'ambiente |
| --- | --- | --- |
| Indirizzo IP e porta specifici | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| Tutte le interfacce di rete su una porta | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### Reverse proxy {#reverse-proxy}

In alternativa, è possibile utilizzare un reverse proxy davanti a Semaphore per gestire le connessioni sicure. Ad esempio:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### Certificato SSL autofirmato {#self-signed-ssl-certificate}

È possibile generare il proprio certificato SSL con lo strumento CLI `openssl`:

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Certificato SSL Let's Encrypt {#lets-encrypt-ssl-certificate}

È possibile utilizzare [Certbot](https://certbot.eff.org/) per generare e rinnovare automaticamente un certificato SSL Let's Encrypt.

Esempio per Apache:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### Altri {#others}

Se si desidera utilizzare un altro reverse proxy, assicurarsi di inoltrare anche le connessioni websocket sulla route `/api/ws`!
