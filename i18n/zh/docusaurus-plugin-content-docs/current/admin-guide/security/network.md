
# 网络安全

出于安全原因，Semaphore **不应**通过未加密的 HTTP 使用！

为什么要使用加密连接？请参阅：[Cloudflare 的文章](https://www.cloudflare.com/learning/ssl/why-use-https/)。

可选方案：

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

您可以使用在 Semaphore 服务器上终结的客户端到站点（Client-to-Site）VPN 来加密并保护连接。

## TLS {#tls}

Semaphore 从 v2.12 起支持 SSL/TLS。

**config.json**：
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

或者使用环境变量（适用于 Docker）：

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### HTTP 到 HTTPS 的重定向监听器 {#http-to-https-redirect-listener}

要配置 HTTP 到 HTTPS 的重定向监听器，请在 `config.json` 的 `tls` 块中添加以下字段之一，或设置对应的环境变量。

使用 `http_redirect_addr` 将监听器绑定到特定的 IP 地址和端口。使用 `http_redirect_port` 在所有网络接口上监听。这两个选项互斥。

| 将 HTTP 重定向监听器绑定到 | `config.json`（`tls` 块） | 环境变量 |
| --- | --- | --- |
| 特定的 IP 地址和端口 | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| 某个端口上的所有网络接口 | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### 反向代理 {#reverse-proxy}

或者，您可以在 Semaphore 前面使用反向代理来处理安全连接。例如：

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### 自签名 SSL 证书 {#self-signed-ssl-certificate}

您可以使用 `openssl` 命令行工具生成自己的 SSL 证书：

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Let's Encrypt SSL 证书 {#lets-encrypt-ssl-certificate}

您可以使用 [Certbot](https://certbot.eff.org/) 生成并自动续期 Let's Encrypt SSL 证书。

Apache 示例：

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### 其他 {#others}

如果您想使用其他任何反向代理——请务必同时转发 `/api/ws` 路径上的 WebSocket 连接！
