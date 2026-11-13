---
title: Docker
description: A Docker Compose file for Semaphore with SQLite, MySQL, or Postgres, the required secret variables, and installing extra Python dependencies.
---

# Docker

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Choose a database and create a `docker-compose.yml` file with the following content:

<Tabs groupId="database">
  <TabItem value="sqlite" label="SQLite">

```yaml
services:
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
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
volumes:
  semaphore-data:
```

  </TabItem>
  <TabItem value="mysql" label="MySQL">

```yaml
services:
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
      SEMAPHORE_DB_HOST: mysql
      SEMAPHORE_DB_PORT: 3306
      SEMAPHORE_DB_DIALECT: mysql
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
      - mysql
volumes:
  semaphore-mysql:
```

  </TabItem>
  <TabItem value="postgres" label="Postgres">

```yaml
services:
  postgres:
    restart: unless-stopped
    image: postgres:14
    hostname: postgres
    volumes:
      - semaphore-postgres:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: semaphore
      POSTGRES_PASSWORD: semaphore
      POSTGRES_DB: semaphore
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_DB_USER: semaphore
      SEMAPHORE_DB_PASS: semaphore
      SEMAPHORE_DB_HOST: postgres
      SEMAPHORE_DB_PORT: 5432
      SEMAPHORE_DB_DIALECT: postgres
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
      - postgres
volumes:
  semaphore-postgres:
```

  </TabItem>
</Tabs>

You must specify following confidential variables:

* `SEMAPHORE_DB_PASS` and `MYSQL_PASSWORD` or `POSTGRES_PASSWORD` &mdash; password for the database user. Not needed for SQLite.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; password for the Semaphore's admin user.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; key for encrypting access keys in database. It must be generated by using the following command: `head -c32 /dev/urandom | base64`.

If you are using Docker Swarm, it is strongly recommended that you don't embed credentials directly in the Compose file (nor in environment variables generally) and instead use [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/). Semaphore [supports](https://github.com/semaphoreui/semaphore/issues/1268) a common Docker container pattern for retrieving settings from files instead of the environment by appending `_FILE` to the end of the environment variable name. See the [Docker documentation for an example](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

A limited example using secrets:

```yaml
secrets:
  semaphore_admin_pw:
    file: semaphore_admin_password.txt

services:
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_ADMIN_PASSWORD_FILE: /run/secrets/semaphore_admin_pw
      SEMAPHORE_ADMIN_NAME: admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN: admin
```


Run the following command to start Semaphore with configured database (SQLite, MySQL or Postgres):

```bash
docker-compose up
```

&#x20;Semaphore will be available via the following URL [http://localhost:3000](http://localhost:3000).

## Installing Additional Python Dependencies {#installing-additional-python-dependencies}

Some Ansible modules, collections, and Python apps need extra Python packages that are not included in the image.
Both the server image (`semaphoreui/semaphore`) and the runner image (`semaphoreui/runner`) can install them automatically on container start.

To use this feature:

1. Create a `requirements.txt` file with your Python dependencies. See the [pip requirements file format](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Mount it into the container as `requirements.txt` inside the config directory. The config directory is set by `SEMAPHORE_CONFIG_PATH` and defaults to `/etc/semaphore`.

Example `requirements.txt`:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Example update to your `docker-compose.yml`:

```yaml
services:
  semaphore:
    restart: unless-stopped
    ports:
      - 3000:3000
    image: semaphoreui/semaphore:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

The same works for a runner container:

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

Or with plain `docker run`:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### How it works {#how-it-works}

During startup the container checks for `${SEMAPHORE_CONFIG_PATH}/requirements.txt`. If the file exists, it runs:

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

If the file is missing, the container logs `No additional python dependencies to install` and continues.

Things to keep in mind:

- **Packages go into the Ansible virtual environment.** The image puts the bundled Ansible venv first on `PATH`, so `pip3` installs into that venv rather than the system Python. Ansible and Python apps running in the container see the packages. There is no need for `--break-system-packages`.
- **Installation runs on every start**, not only the first one. Packages are not persisted between container recreations, so a container restart with a fresh filesystem installs them again. This requires network access to PyPI (or your configured index) at startup.
- **A failed install stops the container.** If `pip3` exits with an error (a typo in a package name, a missing build dependency, or no network), the container exits before Semaphore starts. Check the container logs for the pip output.
- **Packages that need compilation** (for example some crypto or database drivers) may fail because the image does not ship a compiler. Prefer wheels, or build a custom image for those.

### Alternative: custom image {#alternative-custom-image}

If you have many dependencies, need system packages, or want faster and offline startups, bake the packages into your own image instead:

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

No virtual environment activation is needed. The base image already sets `PATH` and `VIRTUAL_ENV` to the bundled Ansible venv and switches to the `semaphore` user, which owns that venv. `pip3` in a derived image therefore resolves to the venv's pip and installs there, exactly like the startup hook does.

The same approach works with `semaphoreui/runner` as the base image.
