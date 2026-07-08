
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
        "key_file": "/path/to/key/example.com.key"
    }
    ...
}
```

Or environment variables (useful for Docker):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### HTTP-to-HTTPS redirect listener

To configure the HTTP-to-HTTPS redirect listener, add one of the following fields to the `tls` block in `config.json`, or set the corresponding environment variable.

Use `http_redirect_addr` to bind the listener to a specific IP address and port. Use `http_redirect_port` to listen on all network interfaces. These options are mutually exclusive.

| Bind HTTP redirect listener to | `config.json` (`tls` block) | Environment variable |
| --- | --- | --- |
| Specific IP address and port | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| All network interfaces on a port | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### Reverse proxy

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
