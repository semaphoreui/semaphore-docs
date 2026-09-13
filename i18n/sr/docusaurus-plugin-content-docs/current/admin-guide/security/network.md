
# Bezbednost mreže

Iz bezbednosnih razloga Semaphore **ne treba koristiti** preko nešifrovanog HTTP-a!

Zašto koristiti šifrovane veze? Pogledajte: [članak kompanije Cloudflare](https://www.cloudflare.com/learning/ssl/why-use-https/).

Opcije koje imate:

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

Možete koristiti Client-to-Site VPN koji se završava na Semaphore serveru da biste šifrovali i zaštitili vezu.

## TLS {#tls}

Semaphore podržava SSL/TLS počev od verzije v2.12.

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

Ili promenljive okruženja (korisno za Docker):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### Slušalac za preusmeravanje sa HTTP-a na HTTPS {#http-to-https-redirect-listener}

Da biste konfigurisali slušalac za preusmeravanje sa HTTP-a na HTTPS, dodajte jedno od sledećih polja u blok `tls` u `config.json` ili postavite odgovarajuću promenljivu okruženja.

Koristite `http_redirect_addr` da biste slušalac vezali za određenu IP adresu i port. Koristite `http_redirect_port` da biste slušali na svim mrežnim interfejsima. Ove opcije se međusobno isključuju.

| Vezivanje slušaoca za HTTP preusmeravanje | `config.json` (blok `tls`) | Promenljiva okruženja |
| --- | --- | --- |
| Određena IP adresa i port | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| Svi mrežni interfejsi na portu | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### Obrnuti proksi {#reverse-proxy}

Alternativno, ispred Semaphore-a možete postaviti obrnuti proksi koji će upravljati bezbednim vezama. Na primer:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### Samopotpisani SSL sertifikat {#self-signed-ssl-certificate}

Sopstveni SSL sertifikat možete generisati pomoću CLI alata `openssl`:

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Let's Encrypt SSL sertifikat {#lets-encrypt-ssl-certificate}

Možete koristiti [Certbot](https://certbot.eff.org/) da generišete i automatski obnavljate Let's Encrypt SSL sertifikat.

Primer za Apache:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### Ostalo {#others}

Ako želite da koristite bilo koji drugi obrnuti proksi - obavezno prosleđujte i websocket veze na ruti `/api/ws`!
