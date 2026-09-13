
# Netzwerksicherheit

Aus Sicherheitsgründen **sollte Semaphore nicht** über unverschlüsseltes HTTP verwendet werden!

Warum verschlüsselte Verbindungen verwenden? Siehe: [Artikel von Cloudflare](https://www.cloudflare.com/learning/ssl/why-use-https/).

Ihre Optionen:

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

Sie können ein Client-to-Site-VPN verwenden, das auf dem Semaphore-Server terminiert, um die Verbindung zu verschlüsseln und abzusichern.

## TLS {#tls}

Semaphore unterstützt SSL/TLS ab Version v2.12.

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

Oder über Umgebungsvariablen (nützlich für Docker):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### HTTP-zu-HTTPS-Weiterleitungs-Listener {#http-to-https-redirect-listener}

Um den HTTP-zu-HTTPS-Weiterleitungs-Listener zu konfigurieren, fügen Sie eines der folgenden Felder zum `tls`-Block in der `config.json` hinzu oder setzen Sie die entsprechende Umgebungsvariable.

Verwenden Sie `http_redirect_addr`, um den Listener an eine bestimmte IP-Adresse und einen Port zu binden. Verwenden Sie `http_redirect_port`, um auf allen Netzwerkschnittstellen zu lauschen. Diese Optionen schließen sich gegenseitig aus.

| HTTP-Weiterleitungs-Listener binden an | `config.json` (`tls`-Block) | Umgebungsvariable |
| --- | --- | --- |
| Bestimmte IP-Adresse und Port | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| Alle Netzwerkschnittstellen auf einem Port | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### Reverse-Proxy {#reverse-proxy}

Alternativ können Sie einen Reverse-Proxy vor Semaphore einsetzen, der die sicheren Verbindungen übernimmt. Zum Beispiel:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### Selbstsigniertes SSL-Zertifikat {#self-signed-ssl-certificate}

Sie können mit dem CLI-Tool `openssl` Ihr eigenes SSL-Zertifikat erzeugen:

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Let's-Encrypt-SSL-Zertifikat {#lets-encrypt-ssl-certificate}

Sie können [Certbot](https://certbot.eff.org/) verwenden, um ein Let's-Encrypt-SSL-Zertifikat zu erzeugen und automatisch zu erneuern.

Beispiel für Apache:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### Sonstige {#others}

Wenn Sie einen anderen Reverse-Proxy verwenden möchten, stellen Sie sicher, dass auch WebSocket-Verbindungen auf der Route `/api/ws` weitergeleitet werden!
