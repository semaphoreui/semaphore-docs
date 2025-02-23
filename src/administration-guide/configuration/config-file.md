
# Configuration file

You can use interactive config file generator:
* for [server](https://semaphoreui.com/install/binary/2_12/config)
* for [runner](https://semaphoreui.com/install/binary/2_12/runner).

Semaphore uses a `config.json` configuration file with following content:

```javascript
{
  "bolt": {
    "host": "/home/ubuntu/semaphore.bolt"
  },
  "mysql": {
    "host": "localhost",
    "user": "root",
    "pass": "*****",
    "name": "semaphore",
    "options": {}
  },
  "postgres": {
    "host": "localhost",
    "user": "postgres",
    "pass": "*****",
    "name": "semaphore",
    "options": {}
  },
  "dialect": "postgres",
  "port": "",
  "interface": "",
  "tmp_path": "/tmp/semaphore",
  "cookie_hash": "*****",
  "cookie_encryption": "*****",
  "access_key_encryption": "*****",
  "email_sender": "",
  "email_host": "",
  "email_port": "",
  "web_host": "",
  "ldap_binddn": "",
  "ldap_bindpassword": "",
  "ldap_server": "",
  "ldap_searchdn": "",
  "ldap_searchfilter": "",
  "ldap_mappings": {
    "dn": "",
    "mail": "",
    "uid": "",
    "cn": ""
  },
  "telegram_chat": "",
  "telegram_token": "",
  "concurrency_mode": "",
  "max_parallel_tasks": 0,
  "email_alert": false,
  "telegram_alert": false,
  "slack_alert": false,
  "slack_url": "",
  "microsoft_teams_alert": false,
  "microsoft_teams_url": "",
  "rocketchat_alert": false,
  "rocketchat_url": "",
  "ldap_enable": false,
  "ldap_needtls": false
}
```

Usage:

```bash
semaphore server --config ./config.json
```