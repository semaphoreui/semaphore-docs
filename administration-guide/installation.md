# Installation

You can install Semaphore in 4 ways:

* [Snap](installation.md#snap)
* [Package manager](installation.md#package-manager)
* [Docker](installation.md#docker)
* [Binary file](installation.md#binary-file)

See also:
* [Run as service](installation.md#run-as-a-service)
* [Manual installation](installation_manually.md)

----

### Snap

To install Semaphore via snap, run following command in terminal:

```bash
sudo snap install semaphore
```

Semaphore will be available by URL [https://localhost:3000](https://localhost:3000).&#x20;

But to log in, you should create an admin user. Use the following commands:

```bash
sudo snap stop semaphore

sudo semaphore user add --admin \
--login john \
--name=John \
--email=john1996@gmail.com \
--password=12345

sudo snap start semaphore
```

You can check the status of the Semaphore service using the following command:

```bash
sudo snap services semaphore
```

It should print the following table:

```
Service               Startup  Current  Notes
semaphore.semaphored  enabled  active   -
```

After installation, you can set up Semaphore via [Snap Configuration](https://snapcraft.io/docs/configuration-in-snaps). Use the following command to see your Semaphore configuration:

```bash
sudo snap get semaphore
```

&#x20;List of available options you can find in [Configuration options reference](https://docs.ansible-semaphore.com/administration-guide/configuration#configuration-options).

----

### Package manager

{% hint style="info" %}
Python, Ansible and Git should be installed on your system.
{% endhint %}

Look into the [manual installation](installation_manually.md) on how to set-up your Python/Ansible/Systemd environment!

Download package file from [Releases page](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` for Debian and Ubuntu, `*.rpm` for CentOS and RedHat.&#x20;

Here are several installation commands, depending on the package manager:

{% tabs %}
{% tab title="Debian / Ubuntu (x64)" %}
```bash
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.9.58/semaphore_2.9.44_linux_amd64.deb

sudo dpkg -i semaphore_2.9.44_linux_amd64.deb
```
{% endtab %}

{% tab title="Debian / Ubuntu (ARM64)" %}
```
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.9.58/semaphore_2.9.44_linux_arm64.deb

sudo dpkg -i semaphore_2.9.44_linux_arm64.deb
```
{% endtab %}

{% tab title="CentOS (x64)" %}
```
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.9.58/semaphore_2.9.44_linux_amd64.rpm

sudo yum install semaphore_2.9.44_linux_amd64.rpm
```
{% endtab %}

{% tab title="CentOS (ARM64)" %}
```
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.9.58/semaphore_2.9.44_linux_arm64.rpm

sudo yum install semaphore_2.9.44_linux_arm64.rpm
```
{% endtab %}
{% endtabs %}

Setup Semaphore by using the following command:

```
semaphore setup
```

Now you can run Semaphore:

```
semaphore server --config=./config.json
```

Semaphore will be available via this URL [https://localhost:3000](https://localhost:3000).

----

### Docker

&#x20;Create a `docker-compose.yml` file with following content:

```yaml
version: "3"
services:
  # uncomment this section and comment out the mysql section to use postgres instead of mysql
  #postgres:
    #restart: unless-stopped
    #image: postgres:14
    #hostname: postgres
    #volumes: 
    #  - semaphore-postgres:/var/lib/postgresql/data
    #environment:
    #  POSTGRES_USER: semaphore
    #  POSTGRES_PASSWORD: semaphore
    #  POSTGRES_DB: semaphore
  # if you wish to use postgres, comment the mysql service section below 
  mysql:
    restart: unless-stopped
    image: mysql:8.0
    hostname: mysql
    volumes:
      - semaphore-mysql:/var/lib/mysql
    environment:
      MYSQL_RANDOM_ROOT_PASSWORD: 'yes'
      MYSQL_DATABASE: semaphore
      MYSQL_USER: semaphore
      MYSQL_PASSWORD: semaphore
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_DB_USER: semaphore
      SEMAPHORE_DB_PASS: semaphore
      SEMAPHORE_DB_HOST: mysql # for postgres, change to: postgres
      SEMAPHORE_DB_PORT: 3306 # change to 5432 for postgres
      SEMAPHORE_DB_DIALECT: mysql # for postgres, change to: postgres
      SEMAPHORE_DB: semaphore
      SEMAPHORE_PLAYBOOK_PATH: /tmp/semaphore/
      SEMAPHORE_ADMIN_PASSWORD: changeme
      SEMAPHORE_ADMIN_NAME: admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: gs72mPntFATGJs9qK0pQ0rKtfidlexiMjYCH9gWKhTU=
      SEMAPHORE_LDAP_ACTIVATED: 'no' # if you wish to use ldap, set to: 'yes' 
      SEMAPHORE_LDAP_HOST: dc01.local.example.com
      SEMAPHORE_LDAP_PORT: '636'
      SEMAPHORE_LDAP_NEEDTLS: 'yes'
      SEMAPHORE_LDAP_DN_BIND: 'uid=bind_user,cn=users,cn=accounts,dc=local,dc=shiftsystems,dc=net'
      SEMAPHORE_LDAP_PASSWORD: 'ldap_bind_account_password'
      SEMAPHORE_LDAP_DN_SEARCH: 'dc=local,dc=example,dc=com'
      SEMAPHORE_LDAP_SEARCH_FILTER: "(\u0026(uid=%s)(memberOf=cn=ipausers,cn=groups,cn=accounts,dc=local,dc=example,dc=com))"
      TZ: UTC
    depends_on:
      - mysql # for postgres, change to: postgres
volumes:
  semaphore-mysql: # to use postgres, switch to: semaphore-postgres
```

You must specify following confidential variables:

* `MYSQL_PASSWORD` and `SEMAPHORE_DB_PASS` &mdash; password for the MySQL user.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; password for the Semaphore's admin user.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; key for encrypting access keys in database. It must be generated by using the following command: `head -c32 /dev/urandom | base64`.


Run the following command to start Semaphore with configured database (MySQL or Postgres):

```bash
docker-compose up
```

&#x20;Semaphore will be available via the following URL [http://localhost:3000](http://localhost:3000).

For more information about the Docker Compose, see the [Docker Compose reference](https://docs.docker.com/compose/).

### Installing Additional Python Packages

Some Ansible modules and roles require additional python packages to run. To install additional python packages, create a `requirements.txt` file and mount it in the `/etc/semaphore` directory on the container. For example, you could add the following lines to your `docker-compose.yml` file:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

The packages specified in the requirements file will be installed when the container starts up.

For more information about Python requirements files, see the [Pip Requirements File Format reference](https://pip.pypa.io/en/stable/reference/requirements-file-format/)

----

### Binary file

{% hint style="info" %}
Python, Ansible and Git should be installed on your system.
{% endhint %}

Look into the [manual installation](installation_manually.md) on how to set-up your Python/Ansible/Systemd environment!

Download the `*.tar.gz` for your platform from [Releases page](https://github.com/semaphoreui/semaphore/releases). Unpack it and setup Semaphore using the following commands:

{% tabs %}
{% tab title="Linux (x64)" %}
```
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.9.58/semaphore_2.9.44_linux_amd64.tar.gz

tar xf semaphore_2.9.44_linux_amd64.tar.gz

./semaphore setup
```
{% endtab %}

{% tab title="Linux (ARM64)" %}
```
wget https://github.com/semaphoreui/semaphore/releases/\
download/v2.9.58/semaphore_2.9.44_linux_arm64.tar.gz

tar xf semaphore_2.9.44_linux_arm64.tar.gz

./semaphore setup
```
{% endtab %}

{% tab title="Windows (x64)" %}
```
Invoke-WebRequest `
-Uri ("https://github.com/semaphoreui/semaphore/releases/" +
      "download/v2.9.58/semaphore_2.9.44_windows_amd64.zip") `
-OutFile semaphore.zip

Expand-Archive -Path semaphore.zip  -DestinationPath ./

./semaphore setup
```
{% endtab %}
{% endtabs %}

Now you can run Semaphore:

```
./semaphore server --config=./config.json
```

Semaphore will be available via the following URL [https://localhost:3000](https://localhost:3000).

----

### Run as a service

For more detailed information - look into the [extended Systemd service documentation](installation_manually.md#extended-systemd-service).

If you installed Semaphore via a package manager, or by downloading a binary file, you should create the Semaphore service manually.

Create the systemd service file:

{% hint style="info" %}
Replace `/path/to/semaphore` and `/path/to/config.json` to your semaphore and config file path
{% endhint %}

```bash
sudo cat > /etc/systemd/system/semaphore.service <<EOF
[Unit]
Description=Semaphore Ansible
Documentation=https://github.com/semaphoreui/semaphore
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
ExecReload=/bin/kill -HUP $MAINPID
ExecStart=/path/to/semaphore server --config=/path/to/config.json
SyslogIdentifier=semaphore
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
EOF
```

Start the Semaphore service:

```bash
sudo systemctl daemon-reload
sudo systemctl start semaphore
```

Check the Semaphore service status:

```bash
sudo systemctl status semaphore
```

To make the Semaphore service auto start:

```bash
sudo systemctl enable semaphore
```
