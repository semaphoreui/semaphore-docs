
# Apache の設定

次の Apache モジュールが有効になっていることを確認してください。

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
```

Apache の設定に次の仮想ホストを追加します。

```
<VirtualHost *:443>

    ServerName example.com

    ServerAdmin webmaster@localhost
	
    SSLEngine on
    SSLCertificateFile /path/to/example.com.crt
    SSLCertificateKeyFile /path/to/example.com.key

    ProxyPreserveHost On

    <Location />
        ProxyPass http://127.0.0.1:3000/
        ProxyPassReverse http://127.0.0.1:3000/
    </Location>

    <Location /api/ws>
        RewriteCond %{HTTP:Connection} Upgrade [NC]
        RewriteCond %{HTTP:Upgrade} websocket [NC]

        ProxyPass ws://127.0.0.1:3000/api/ws/
        ProxyPassReverse ws://127.0.0.1:3000/api/ws/

    </Location>
</VirtualHost>
```
