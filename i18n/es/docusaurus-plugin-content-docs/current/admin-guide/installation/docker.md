# Docker

&#x20;Cree un archivo `docker-compose.yml` con el siguiente contenido:

```yaml
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
      # To use SQLite instead of MySQL/Postgres (v2.16+)
      # SEMAPHORE_DB_DIALECT: sqlite
      # SEMAPHORE_DB: "/etc/semaphore/semaphore.sqlite"
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

Debe especificar las siguientes variables confidenciales:

* `MYSQL_PASSWORD` y `SEMAPHORE_DB_PASS` &mdash; contraseña del usuario de MySQL.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; contraseña del usuario administrador de Semaphore.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; clave para cifrar las claves de acceso en la base de datos. Debe generarse con el siguiente comando: `head -c32 /dev/urandom | base64`.

Si utiliza Docker Swarm, se recomienda encarecidamente no incrustar las credenciales directamente en el archivo de Compose (ni en variables de entorno en general) y utilizar en su lugar [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/). Semaphore [admite](https://github.com/semaphoreui/semaphore/issues/1268) un patrón habitual en contenedores Docker para leer los ajustes desde archivos en lugar del entorno, añadiendo `_FILE` al final del nombre de la variable de entorno. Consulte la [documentación de Docker para ver un ejemplo](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

Un ejemplo reducido con secretos:

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


Ejecute el siguiente comando para iniciar Semaphore con la base de datos configurada (MySQL o Postgres):

```bash
docker-compose up
```

&#x20;Semaphore estará disponible en la siguiente URL: [http://localhost:3000](http://localhost:3000).

## Instalación de dependencias de Python adicionales {#installing-additional-python-dependencies}

Algunos módulos y colecciones de Ansible, así como algunas aplicaciones de Python, necesitan paquetes de Python adicionales que no están incluidos en la imagen.
Tanto la imagen del servidor (`semaphoreui/semaphore`) como la imagen del runner (`semaphoreui/runner`) pueden instalarlos automáticamente al iniciarse el contenedor.

Para utilizar esta función:

1. Cree un archivo `requirements.txt` con sus dependencias de Python. Consulte el [formato de archivo de requisitos de pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Móntelo en el contenedor como `requirements.txt` dentro del directorio de configuración. El directorio de configuración se define con `SEMAPHORE_CONFIG_PATH` y por defecto es `/etc/semaphore`.

Ejemplo de `requirements.txt`:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Ejemplo de modificación de su `docker-compose.yml`:

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

Lo mismo funciona para un contenedor de runner:

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

O con un simple `docker run`:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### Cómo funciona {#how-it-works}

Durante el arranque, el contenedor comprueba si existe `${SEMAPHORE_CONFIG_PATH}/requirements.txt`. Si el archivo existe, ejecuta:

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

Si el archivo no existe, el contenedor registra `No additional python dependencies to install` y continúa.

Aspectos a tener en cuenta:

- **Los paquetes se instalan en el entorno virtual de Ansible.** La imagen coloca el venv de Ansible incluido en primer lugar en `PATH`, por lo que `pip3` instala en ese venv y no en el Python del sistema. Ansible y las aplicaciones de Python que se ejecutan en el contenedor ven los paquetes. No es necesario usar `--break-system-packages`.
- **La instalación se ejecuta en cada arranque**, no solo en el primero. Los paquetes no se conservan entre recreaciones del contenedor, por lo que un reinicio del contenedor con un sistema de archivos nuevo los instala de nuevo. Esto requiere acceso de red a PyPI (o al índice que haya configurado) durante el arranque.
- **Una instalación fallida detiene el contenedor.** Si `pip3` termina con un error (una errata en el nombre de un paquete, una dependencia de compilación ausente o falta de red), el contenedor se cierra antes de que Semaphore arranque. Revise los registros del contenedor para ver la salida de pip.
- **Los paquetes que requieren compilación** (por ejemplo, algunos controladores de criptografía o de bases de datos) pueden fallar porque la imagen no incluye un compilador. Prefiera wheels o construya una imagen personalizada para ellos.

### Alternativa: imagen personalizada {#alternative-custom-image}

Si tiene muchas dependencias, necesita paquetes del sistema o desea arranques más rápidos y sin conexión, incorpore los paquetes en su propia imagen:

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

No es necesario activar ningún entorno virtual. La imagen base ya define `PATH` y `VIRTUAL_ENV` apuntando al venv de Ansible incluido y cambia al usuario `semaphore`, propietario de ese venv. Por tanto, `pip3` en una imagen derivada se resuelve al pip del venv e instala allí, exactamente igual que lo hace el hook de arranque.

El mismo enfoque funciona con `semaphoreui/runner` como imagen base.
