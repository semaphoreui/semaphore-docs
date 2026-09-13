
# ネットワークセキュリティ

セキュリティ上の理由から、Semaphore を暗号化されていない HTTP で**使用しないでください**!

暗号化された接続を使用する理由については、[Cloudflare の記事](https://www.cloudflare.com/learning/ssl/why-use-https/)を参照してください。

選択肢は次のとおりです。

* [VPN](#vpn)
* [TLS](#tls)

---

## VPN {#vpn}

Semaphore サーバーで終端する Client-to-Site VPN を使用して、接続を暗号化し保護できます。

## TLS {#tls}

Semaphore は v2.12 から SSL/TLS をサポートしています。

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

または環境変数を使用します (Docker で便利です):

```bash
export SEMAPHORE_TLS_ENABLED=True
export SEMAPHORE_TLS_CERT_FILE=/path/to/cert/example.com.cert
export SEMAPHORE_TLS_KEY_FILE=/path/to/key/example.com.key
```

### HTTP から HTTPS へのリダイレクトリスナー {#http-to-https-redirect-listener}

HTTP から HTTPS へのリダイレクトリスナーを設定するには、`config.json` の `tls` ブロックに次のいずれかのフィールドを追加するか、対応する環境変数を設定します。

リスナーを特定の IP アドレスとポートにバインドするには `http_redirect_addr` を使用します。すべてのネットワークインターフェースで待ち受けるには `http_redirect_port` を使用します。これらのオプションは排他的です。

| HTTP リダイレクトリスナーのバインド先 | `config.json` (`tls` ブロック) | 環境変数 |
| --- | --- | --- |
| 特定の IP アドレスとポート | `"http_redirect_addr": "172.29.184.90:80"` | `SEMAPHORE_TLS_HTTP_REDIRECT_ADDR=172.29.184.90:80` |
| 指定ポートのすべてのネットワークインターフェース | `"http_redirect_port": 80` | `SEMAPHORE_TLS_HTTP_REDIRECT_PORT=80` |

### リバースプロキシ {#reverse-proxy}

あるいは、Semaphore の前段にリバースプロキシを配置して、安全な接続を処理させることもできます。例:

* [NGINX](/admin-guide/reverse-proxy/nginx)
* [Apache](/admin-guide/reverse-proxy/apache)
* [Caddy](/admin-guide/reverse-proxy/caddy)
 

### 自己署名 SSL 証明書 {#self-signed-ssl-certificate}

`openssl` CLI ツールを使用して、独自の SSL 証明書を生成できます。

```
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -sha256 -days 3650 -nodes \
    -subj "/C=US/ST=California/L=San Francisco/O=CompanyName/OU=DevOps/CN=example.com"
```

### Let's Encrypt SSL 証明書 {#lets-encrypt-ssl-certificate}

[Certbot](https://certbot.eff.org/) を使用して、Let's Encrypt の SSL 証明書を生成し、自動的に更新できます。

Apache の例:

```bash
sudo snap install certbot
sudo certbot --apache -n --agree-tos -d example.com -m mail@example.com
```

### その他 {#others}

他のリバースプロキシを使用する場合は、`/api/ws` ルートの WebSocket 接続も必ず転送するようにしてください!
