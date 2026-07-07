
# Network security

For security reasons, Semaphore **should not be used** over unencrypted HTTP!

Why use encrypted connections? See: [Article from Cloudflare](https://www.cloudflare.com/learning/ssl/why-use-https/).

Options you have:

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN

You can use a Client-to-Site VPN, that terminates on the Semaphore server, to encrypt & secure the connection.

## TLS

Semaphore supports SSL/TLS starting from v2.12.

**config.json**:
```json
{
    ...
    "tls": {
        "enabled": true,
        "cert_file": "/path/to/cert/example.com.cert",
        "key_file": "/path/to/key/example.com.key",
        "http_redirect_addr": "80"
    }
    ...
}
```

or:

```json
{
    ...
    "tls": {
        "enabled": true,
        "cert_file": "/path/to/cert/example.com.cert",
        "key_file": "/path/to/key/example.com.key",
        "http_redirect_port": 80
    }
    ...
}
```

Or environment variables (useful for Docker):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
export SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=80
```

or:

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
export SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80
```

TLS configuration options:

| Config option | Environment variable | Description |
| --- | --- | --- |
| `tls.enabled` | `SEMAPHORE_TLS_ENABLED` | Enables HTTPS for the Semaphore server. |
| `tls.cert_file` | `SEMAPHORE_TLS_CERT_FILE` | Path to the TLS certificate file. |
| `tls.key_file` | `SEMAPHORE_TLS_KEY_FILE` | Path to the TLS private key file. |
| `tls.http_redirect_addr` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR` | Optional address for the HTTP-to-HTTPS redirect listener, for example `:80` or `0.0.0.0:80`. This is mutually exclusive with `tls.http_redirect_port`. |
| `tls.http_redirect_port` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT` | Port to redirect HTTP traffic to HTTPS. Mutually exclusive with `tls.http_redirect_addr`. |

Alternatively, you can use a reverse proxy in front of Semaphore to handle secure connections. For example:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### Self-signed SSL certificate

You can generate your own SSL certificate with using `openssl` CLI tool:

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Let's Encrypt SSL certificate

You can use [Certbot](https://certbot.eff.org/) to generate and automatically renew a Let's Encrypt SSL certificate.

Example for Apache:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### Others

If you want to use any other reverse proxy - make sure to also forward websocket connections on the `/api/ws` route!
