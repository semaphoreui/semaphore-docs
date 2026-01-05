
# Nginx config

Configuration example:

```yaml
server {
  listen 443 ssl;
  server_name  example.com;

  # add Strict-Transport-Security to prevent man in the middle attacks
  add_header Strict-Transport-Security "max-age=31536000" always;

  # SSL
  ssl_certificate /etc/nginx/cert/cert.pem;
  ssl_certificate_key /etc/nginx/cert/privkey.pem;

  # Recommendations from 
  # https://raymii.org/s/tutorials/Strong_SSL_Security_On_nginx.html
  ssl_protocols TLSv1.1 TLSv1.2;
  ssl_ciphers 'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH';
  ssl_prefer_server_ciphers on;
  ssl_session_cache shared:SSL:10m;

  # required to avoid HTTP 411: see Issue #1486 
  # (https://github.com/docker/docker/issues/1486)
  chunked_transfer_encoding on;

  location / {
    proxy_pass http://127.0.0.1:3000/;
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_buffering off;
    proxy_request_buffering off;
  }

  location /api/ws {
    proxy_pass http://127.0.0.1:3000/api/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Origin "";
  }
}
```
