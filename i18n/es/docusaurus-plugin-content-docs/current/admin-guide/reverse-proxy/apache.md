
# Configuración de Apache

Asegúrese de haber habilitado los siguientes módulos de Apache:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod proxy_wstunnel
```

Añada el siguiente host virtual a su configuración de Apache:

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
