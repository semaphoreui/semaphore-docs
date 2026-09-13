
# Segurança de rede

Por motivos de segurança, o Semaphore **não deve ser usado** por HTTP não criptografado!

Por que usar conexões criptografadas? Veja: [Artigo da Cloudflare](https://www.cloudflare.com/learning/ssl/why-use-https/).

Opções disponíveis:

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

Você pode usar uma VPN Client-to-Site, com terminação no servidor do Semaphore, para criptografar e proteger a conexão.

## TLS {#tls}

O Semaphore oferece suporte a SSL/TLS a partir da v2.12.

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

Ou variáveis de ambiente (útil para Docker):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### Listener de redirecionamento HTTP para HTTPS {#http-to-https-redirect-listener}

Para configurar o listener de redirecionamento HTTP para HTTPS, adicione um dos seguintes campos ao bloco `tls` do `config.json` ou defina a variável de ambiente correspondente.

Use `http_redirect_addr` para vincular o listener a um endereço IP e porta específicos. Use `http_redirect_port` para escutar em todas as interfaces de rede. Essas opções são mutuamente exclusivas.

| Vincular o listener de redirecionamento HTTP a | `config.json` (bloco `tls`) | Variável de ambiente |
| --- | --- | --- |
| Endereço IP e porta específicos | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| Todas as interfaces de rede em uma porta | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### Proxy reverso {#reverse-proxy}

Como alternativa, você pode usar um proxy reverso na frente do Semaphore para lidar com as conexões seguras. Por exemplo:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### Certificado SSL autoassinado {#self-signed-ssl-certificate}

Você pode gerar seu próprio certificado SSL usando a ferramenta de linha de comando `openssl`:

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Certificado SSL Let's Encrypt {#lets-encrypt-ssl-certificate}

Você pode usar o [Certbot](https://certbot.eff.org/) para gerar e renovar automaticamente um certificado SSL Let's Encrypt.

Exemplo para Apache:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### Outros {#others}

Se você quiser usar qualquer outro proxy reverso - certifique-se de também encaminhar as conexões websocket na rota `/api/ws`!
