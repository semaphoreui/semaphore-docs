# Configuration

There are 3 ways to configure Semaphore:

* [Snap configuration](https://snapcraft.io/docs/configuration-in-snaps)
* [Interactive setup](configuration.md#snap-configuration)
* [Configuration file](configuration.md#configuration-file)

### Snap configuration

Snap configuration should be used for configuration Semaphore installed via Snap.

List of available option you can see by following command:

```bash
sudo snap get semaphore
```

You can change each of this option. For example if you want to change Semaphore port, use following command:

```bash
sudo snap set semaphore port=4444
```

Don't forget to restart Semaphore after that:

```bash
sudo snap restart semaphore
```

### Interactive setup

Use this option for first time configuration (not working for Semaphore installed via Snap).

```bash
semaphore setup
```

### Configuration file

Semaphore uses `config.json` configuration file with following content:

```javascript
{
  "bolt": {
    "host": "/home/ubuntu/semaphore.bolt",
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
  "ldap_enable": false,
  "ldap_needtls": false
}
```

### Configuration options

| Configuration file      | Snap configuration      | Description                                                                                                                                 |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `bolt.host`             | —                       | Path to the BoltDB database file                                                                                                            |
| `mysql.host`            | `mysql.host`            | MySQL database host                                                                                                                         |
| `mysql.name`            | `mysql.name`            | MySQL database (schama) name                                                                                                                |
| `mysql.user`            | `mysql.user`            | MySQL user                                                                                                                                  |
| `mysql.pass`            | `mysql.pass`            | MySQL user's password                                                                                                                       |
| `postgres.host`         | `postgres.host`         | Postgres database host                                                                                                                      |
| `postgres.name`         | `postgres.name`         | Postgres database (schama) name                                                                                                             |
| `postgres.user`         | `postgres.user`         | Postgres user                                                                                                                               |
| `postgres.pass`         | `postgres.pass`         | Postgres user's password                                                                                                                    |
| `dialect`               | `dialect`               | Can be `mysql`, `postgres `or `bolt`                                                                                                        |
| `port`                  | `port`                  | TCP port on which the web interface will be available. Defalt: 3000 |
| `interface`             | `interface`             | Useful if your server has multiple network interfaces                                                                                       |
| `tmp_path`              | —                       | Path to directory where cloned repositories and generated files are stored. Deafult: /tmp/semaphore |
| `access_key_encryption` | `access-key-encryption` | Secret key used for encypting access keys in datatabase. Details: https://docs.ansible-semaphore.com/administration-guide/security#database-encryption |
| `email_sender`          | `email-sender`          |                                                                                                                                             |
| `email_host`            | `email-host`            |                                                                                                                                             |
| `email_port`            | `email-port`            |                                                                                                                                             |
| `web_host`              | `web-host`              | Can be useful if you want to use Semaphore by the subpath, for example: [http://yourdomain.com/semaphore](http://yourdomain.com/semaphore). |
| `ldap_binddn`           | `ldap-binddn`           |                                                                                                                                             |
| `ldap_bindpassword`     | `ldap-bindpassword`     |                                                                                                                                             |
| `ldap_server`           | `ldap-server`           |                                                                                                                                             |
| `ldap_searchdn`         | `ldap-searchdn`         |                                                                                                                                             |

