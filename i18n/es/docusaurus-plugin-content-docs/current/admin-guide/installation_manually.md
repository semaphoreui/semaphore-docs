# Instalación manual de Semaphore

----

**Contenido:**

* [Usuario de servicio](/admin-guide/installation_manually#service-user)
* [Python3](/admin-guide/installation_manually#python3)
* [Colecciones y roles de Ansible](/admin-guide/installation_manually#ansible-collections--roles)
* [Proxy inverso](/admin-guide/installation_manually#reverse-proxy)
* [Servicio de Systemd](/admin-guide/installation_manually#extended-systemd-service)
* [Solución de problemas](/admin-guide/installation_manually#troubleshooting)

----

Esta documentación detalla cómo configurar Semaphore cuando se utilizan estos métodos de instalación:

* [Gestor de paquetes](/admin-guide/installation/package-manager)
* [Archivo binario](/admin-guide/installation/binary-file)

El paquete de software de Semaphore es solo una parte de todo el sistema necesario para ejecutar Ansible correctamente con él.

¡El entorno de ejecución de Python3 y de Ansible también es muy importante!

NOTA: Existen [roles de Ansible Galaxy](https://galaxy.ansible.com/search?deprecated=false&keywords=ansible%20semaphore&order_by=-relevance&page=1) que se encargan de esta lógica de configuración por usted o que pueden usarse como plantilla base para su propio rol de Ansible.

----

## Usuario de servicio {#service-user}

Semaphore no necesita ejecutarse como usuario `root`, así que no debería hacerlo.

**Ventajas** de usar un usuario de servicio:
* Tiene su propia configuración de usuario
* Tiene su propio entorno
* Los procesos son fácilmente identificables
* Mayor seguridad del sistema

Puede crear un usuario del sistema manualmente con `adduser` o mediante el módulo [ansible.builtin.user](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html).

En esta documentación se asumirá que:
* el usuario de servicio creado se llama `semaphore`
* tiene configurado el shell `/bin/bash`
* su directorio personal es `/home/semaphore`

### Solución de problemas {#troubleshooting}

Si la ejecución de Ansible desde Semaphore falla, deberá diagnosticarla en el contexto del usuario de servicio.

Tiene varias opciones para hacerlo:

* Cambiar toda su sesión de shell al contexto del usuario:

  ```bash
  sudo su --login semaphore
  ```

* Ejecutar un único comando en el contexto del usuario:

  ```bash
  sudo --login -u semaphore <command>
  ```

----

## Python3 {#python3}

[Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html) está desarrollado con el lenguaje de programación [Python3](https://docs.python.org/3/).

Por tanto, una instalación limpia de este es esencial para que Ansible funcione correctamente.

En primer lugar, asegúrese de que los paquetes `python3` y `python3-pip` estén instalados en su sistema.

Tiene varias opciones para instalar los módulos de Python necesarios:
* Instalarlos en el contexto del usuario de servicio
* Instalarlos en un [entorno virtual](https://virtualenv.pypa.io/en/latest/) específico del servicio

### Requisitos {#requirements}

En cualquier caso, se recomienda usar un archivo `requirements.txt` para especificar los módulos que deben instalarse.

Se asumirá que se utiliza el archivo `/home/semaphore/requirements.txt`.

Este es un ejemplo de su contenido:

```text
ansible
# for common jinja-filters
netaddr
jmespath
# for common modules
pywinrm
passlib
requests
docker
```

NOTA: ¡También debería actualizar estos requisitos de vez en cuando!

En el ejemplo de servicio que se muestra más abajo se incluye una opción para hacerlo automáticamente.

### Módulos en el contexto del usuario {#modules-in-user-context}

**Manualmente**:

```bash
sudo --login -u semaphore python3 -m pip install --user --upgrade -r /home/semaphore/requirements.txt
```

**Con Ansible**:

```yaml
- name: Install requirements
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    extra_args: '--user --upgrade'
  become_user: 'semaphore'
```

### Módulos en un virtualenv {#modules-in-a-virtualenv}

Se asumirá que el virtualenv se crea en `/home/semaphore/venv`

Asegúrese de que el entorno virtual esté activado dentro del servicio. Esto también se muestra en el ejemplo de servicio más abajo.

**Manualmente**:
```bash
sudo su --login semaphore
python3 -m pip install --user virtualenv
python3 -m venv /home/semaphore/venv
# activate the context of the virtual environment
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3
python3 -m pip install --upgrade -r /home/semaphore/requirements.txt
# disable the context to the virtual environment
deactivate
```

**Con Ansible**:

```yaml
- name: Create virtual environment and install requirements into it
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    virtualenv: '/home/semaphore/venv'
    state: present  # or 'latest' to upgrade the requirements
```

#### Solución de problemas {#troubleshooting-1}

Si encuentra problemas con Python3 al usar un entorno virtual, deberá entrar en su contexto para diagnosticarlos:

```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

# troubleshooting

deactivate
```

A veces un entorno virtual también se rompe tras actualizaciones del sistema. Si esto ocurre, puede simplemente eliminar el existente y volver a crearlo.

----

## Colecciones y roles de Ansible {#ansible-collections--roles}

Es posible que desee preinstalar los módulos y roles de Ansible para que no tengan que instalarse cada vez que se ejecuta una tarea.

### Requisitos {#requirements-1}

Se recomienda usar un archivo `requirements.yml` para especificar los módulos que deben instalarse.

Se asumirá que se utiliza el archivo `/home/semaphore/requirements.yml`.

Este es un ejemplo de su contenido:

```yaml
---

collections:
  - 'namespace.collection'
  # for common collections:
  - 'community.general'
  - 'ansible.posix'
  - 'community.mysql'
  - 'community.crypto'

roles:
  - src: 'namespace.role'
```

Véase también: [Instalación de colecciones](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy), [Instalación de roles](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-multiple-roles-from-a-file)

NOTA: ¡También debería actualizar estos requisitos de vez en cuando!

En el ejemplo de servicio que se muestra más abajo se incluye una opción para hacerlo automáticamente.

### Instalación en el contexto del usuario {#install-in-user-context}

**Manualmente**:
```bash
sudo su --login semaphore
ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml
```

### Instalación al usar un virtualenv {#install-when-using-a-virtualenv}

**Manualmente**:
```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml

deactivate
```

----

## Proxy inverso {#reverse-proxy}

Consulte: [Seguridad - Conexión cifrada](/admin-guide/security/network#reverse-proxy)

----

## Servicio de Systemd ampliado {#extended-systemd-service}

Esta es la plantilla básica del servicio de systemd.

Añada los ajustes adicionales bajo su `[PART]` correspondiente

### Base {#base}

```ini
[Unit]
Description=Semaphore UI
Documentation=https://semaphoreui.com/docs
Wants=network-online.target
After=network-online.target
ConditionPathExists=/usr/bin/semaphore
ConditionPathExists=/etc/semaphore/config.json

[Service]
ExecStart=/usr/bin/semaphore server --config /etc/semaphore/config.json
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

### Usuario de servicio {#service-user-1}

```ini
[Service]
User=semaphore
Group=semaphore
```

----

### Módulos de Python {#python-modules}

#### En el contexto del usuario {#in-user-context}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

# so the executables are found
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/semaphore/.local/bin"
# set the correct python path. You can get the correct path with: python3 -c "import site; print(site.USER_SITE)" 
Environment="PYTHONPATH=/home/semaphore/.local/lib/python3.10/site-packages"
```

#### En un virtualenv {#in-virtualenv}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && python3 -m pip install --upgrade -r /home/semaphore/requirements.txt'

# REPLACE THE EXISTING 'ExecStart'
ExecStart=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                        && /usr/bin/semaphore server --config /etc/semaphore/config.json'
```

----

### Colecciones y roles de Ansible {#ansible-collections--roles-1}

#### Si usa Python3 en el contexto del usuario {#if-using-python3-in-user-context}

```ini
[Service]
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

#### Si usa Python3 en un virtualenv {#if-using-python3-in-virtualenv}

```ini
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

----

### Otros casos de uso {#other-use-cases}

#### Uso de MariaDB local {#using-local-mariadb}

```ini
[Unit]
Requires=mariadb.service
```

#### Uso de Nginx local {#using-local-nginx}

```ini
[Unit]
Wants=nginx.service
```

#### Envío de registros a syslog {#sending-logs-to-syslog}

```ini
[Service]
StandardOutput=journal
StandardError=journal
SyslogIdentifier=semaphore
```

### Ejemplos completos {#full-examples}

#### Módulos de Python en el contexto del usuario {#python-modules-in-user-context}

```ini
[Unit]
Description=Semaphore UI
Documentation=https://semaphoreui.com/docs
Wants=network-online.target
After=network-online.target
ConditionPathExists=/usr/bin/semaphore
ConditionPathExists=/etc/semaphore/config.json

[Service]
User=semaphore
Group=semaphore
Restart=always
RestartSec=10s
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:~/.local/bin"

ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

ExecStart=/usr/bin/semaphore server --config /etc/semaphore/config.json
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
```

#### Módulos de Python en un virtualenv {#python-modules-in-virtualenv}

```ini
[Unit]
Description=Semaphore UI
Documentation=https://semaphoreui.com/docs
Wants=network-online.target
After=network-online.target
ConditionPathExists=/usr/bin/semaphore
ConditionPathExists=/etc/semaphore/config.json

[Service]
User=semaphore
Group=semaphore
Restart=always
RestartSec=10s

ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && python3 -m pip install --upgrade -r /home/semaphore/requirements.txt'
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'

ExecStart=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                        && /usr/bin/semaphore server --config /etc/semaphore/config.json'
ExecReload=/bin/kill -HUP $MAINPID

[Install]
WantedBy=multi-user.target
```

### Correcciones {#fixes}

Si tiene configurado un idioma del sistema personalizado, puede encontrarse con problemas que se resuelven actualizando las variables de entorno correspondientes:

```ini
[Service]
Environment=LANG="en_US.UTF-8"
Environment=LC_ALL="en_US.UTF-8"
```

----

## Solución de problemas {#troubleshooting-2}

Si se produce un problema al ejecutar una tarea, puede tratarse de un problema del entorno de su instalación, ¡y no de un problema de Semaphore en sí!

Siga estos pasos para comprobar si el problema ocurre fuera de Semaphore:

- Entre en el contexto del usuario:

  ```bash
  sudo su --login semaphore
  ```

- Entre en el contexto del virtualenv, si utiliza uno:

  ```ini
  source /home/semaphore/venv/bin/activate
  # verify we are using python3 from inside the venv
  which python3
  > /home/semaphore/venv/bin/python3
  
  # troubleshooting
  
  deactivate
  ```

- Ejecute el playbook de Ansible manualmente

  - Si **falla** => hay un problema en su entorno
  - Si **funciona**:
    - Vuelva a revisar su configuración dentro de Semaphore
    - Puede tratarse de un problema de Semaphore
