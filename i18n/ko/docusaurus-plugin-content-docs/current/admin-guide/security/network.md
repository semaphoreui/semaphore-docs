
# 네트워크 보안

보안상의 이유로 Semaphore는 암호화되지 않은 HTTP를 통해 **사용해서는 안 됩니다**!

암호화된 연결을 사용해야 하는 이유는 [Cloudflare의 문서](https://www.cloudflare.com/learning/ssl/why-use-https/)를 참조하십시오.

사용할 수 있는 옵션:

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

Semaphore 서버에서 종단되는 Client-to-Site VPN을 사용하여 연결을 암호화하고 보호할 수 있습니다.

## TLS {#tls}

Semaphore는 v2.12부터 SSL/TLS를 지원합니다.

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

또는 환경 변수를 사용할 수 있습니다(Docker에 유용):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### HTTP에서 HTTPS로의 리디렉션 리스너 {#http-to-https-redirect-listener}

HTTP에서 HTTPS로의 리디렉션 리스너를 구성하려면 `config.json`의 `tls` 블록에 다음 필드 중 하나를 추가하거나, 해당 환경 변수를 설정하십시오.

리스너를 특정 IP 주소와 포트에 바인딩하려면 `http_redirect_addr`를 사용하십시오. 모든 네트워크 인터페이스에서 수신하려면 `http_redirect_port`를 사용하십시오. 이 옵션들은 상호 배타적입니다.

| HTTP 리디렉션 리스너 바인딩 대상 | `config.json`(`tls` 블록) | 환경 변수 |
| --- | --- | --- |
| 특정 IP 주소와 포트 | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| 특정 포트의 모든 네트워크 인터페이스 | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### 리버스 프록시 {#reverse-proxy}

또는 Semaphore 앞단에 리버스 프록시를 두어 보안 연결을 처리할 수도 있습니다. 예:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### 자체 서명 SSL 인증서 {#self-signed-ssl-certificate}

`openssl` CLI 도구를 사용하여 직접 SSL 인증서를 생성할 수 있습니다:

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Let's Encrypt SSL 인증서 {#lets-encrypt-ssl-certificate}

[Certbot](https://certbot.eff.org/)을 사용하여 Let's Encrypt SSL 인증서를 생성하고 자동으로 갱신할 수 있습니다.

Apache 예시:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### 기타 {#others}

다른 리버스 프록시를 사용하려는 경우, `/api/ws` 경로의 websocket 연결도 반드시 전달하도록 설정하십시오!
