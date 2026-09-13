
# Сетевая безопасность

По соображениям безопасности Semaphore **не следует использовать** по незашифрованному HTTP!

Зачем нужны зашифрованные соединения? См.: [статью Cloudflare](https://www.cloudflare.com/learning/ssl/why-use-https/).

Доступные варианты:

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

Вы можете использовать VPN типа Client-to-Site, который терминируется на сервере Semaphore, чтобы зашифровать и защитить соединение.

## TLS {#tls}

Semaphore поддерживает SSL/TLS начиная с версии v2.12.

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

Или через переменные окружения (удобно для Docker):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### Слушатель перенаправления с HTTP на HTTPS {#http-to-https-redirect-listener}

Чтобы настроить слушатель перенаправления с HTTP на HTTPS, добавьте одно из следующих полей в блок `tls` файла `config.json` или задайте соответствующую переменную окружения.

Используйте `http_redirect_addr`, чтобы привязать слушатель к конкретному IP-адресу и порту. Используйте `http_redirect_port`, чтобы слушать на всех сетевых интерфейсах. Эти параметры взаимоисключающие.

| Привязать слушатель HTTP-перенаправления к | `config.json` (блок `tls`) | Переменная окружения |
| --- | --- | --- |
| Конкретному IP-адресу и порту | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| Всем сетевым интерфейсам на порту | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### Обратный прокси {#reverse-proxy}

Кроме того, вы можете использовать обратный прокси перед Semaphore для обработки защищённых соединений. Например:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### Самоподписанный SSL-сертификат {#self-signed-ssl-certificate}

Вы можете сгенерировать собственный SSL-сертификат с помощью CLI-утилиты `openssl`:

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### SSL-сертификат Let's Encrypt {#lets-encrypt-ssl-certificate}

Вы можете использовать [Certbot](https://certbot.eff.org/) для получения и автоматического обновления SSL-сертификата Let's Encrypt.

Пример для Apache:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### Другие {#others}

Если вы хотите использовать любой другой обратный прокси — обязательно настройте также проксирование websocket-соединений на маршруте `/api/ws`!
