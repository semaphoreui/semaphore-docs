
# Apache 설정

다음 Apache 모듈이 활성화되어 있는지 확인하십시오:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
```

Apache 설정에 다음 가상 호스트를 추가합니다:

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
