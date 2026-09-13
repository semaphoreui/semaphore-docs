# Installazione manuale di Semaphore

----

**Contenuto:**

* [Utente di servizio](/admin-guide/installation_manually#service-user)
* [Python3](/admin-guide/installation_manually#python3)
* [Collection e ruoli Ansible](/admin-guide/installation_manually#ansible-collections--roles)
* [Reverse proxy](/admin-guide/installation_manually#reverse-proxy)
* [Servizio Systemd](/admin-guide/installation_manually#extended-systemd-service)
* [Risoluzione dei problemi](/admin-guide/installation_manually#troubleshooting)

----

Questa documentazione descrive nel dettaglio come configurare Semaphore quando si utilizzano questi metodi di installazione:

* [Gestore di pacchetti](/admin-guide/installation/package-manager)
* [File binario](/admin-guide/installation/binary-file)

Il pacchetto software di Semaphore è solo una parte dell'intero sistema necessario per eseguire correttamente Ansible con esso.

Anche l'ambiente di esecuzione di Python3 e Ansible è molto importante!

NOTA: Esistono [ruoli Ansible Galaxy](https://galaxy.ansible.com/search?deprecated=false&keywords=ansible%20semaphore&order_by=-relevance&page=1) che si occupano di questa logica di configurazione o che possono essere utilizzati come modello di base per un proprio ruolo Ansible!

----

## Utente di servizio {#service-user}

Semaphore non ha bisogno di essere eseguito come utente `root`, quindi è meglio evitarlo.

**Vantaggi** dell'utilizzo di un utente di servizio:
* Ha una propria configurazione utente
* Ha un proprio ambiente
* Processi facilmente identificabili
* Maggiore sicurezza del sistema

È possibile creare un utente di sistema manualmente con `adduser` oppure tramite il modulo [ansible.builtin.user](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html).

In questa documentazione si assume che:
* l'utente di servizio creato si chiami `semaphore`
* abbia impostata la shell `/bin/bash`
* la sua home directory sia `/home/semaphore`

### Risoluzione dei problemi {#troubleshooting}

Se l'esecuzione di Ansible da parte di Semaphore fallisce, sarà necessario risolvere il problema nel contesto dell'utente di servizio.

Sono disponibili diverse opzioni per farlo:

* Passare l'intera sessione della shell al contesto dell'utente:

  ```bash
  sudo su --login semaphore
  ```

* Eseguire un singolo comando nel contesto dell'utente:

  ```bash
  sudo --login -u semaphore <command>
  ```

----

## Python3 {#python3}

[Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html) è realizzato con il linguaggio di programmazione [Python3](https://docs.python.org/3/).

Una sua corretta configurazione è quindi essenziale affinché Ansible funzioni correttamente.

Innanzitutto, assicurarsi che i pacchetti `python3` e `python3-pip` siano installati sul sistema!

Sono disponibili diverse opzioni per installare i moduli Python richiesti:
* Installarli nel contesto dell'utente di servizio
* Installarli in un [ambiente virtuale](https://virtualenv.pypa.io/en/latest/) dedicato al servizio

### Requisiti {#requirements}

In entrambi i casi, si consiglia di utilizzare un file `requirements.txt` per specificare i moduli da installare.

Si assume che venga utilizzato il file `/home/semaphore/requirements.txt`.

Ecco un esempio del suo contenuto:

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

NOTA: È opportuno aggiornare periodicamente anche questi requisiti!

Un'opzione per farlo automaticamente è mostrata anche nell'esempio di servizio riportato di seguito.

### Moduli nel contesto utente {#modules-in-user-context}

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

### Moduli in un virtualenv {#modules-in-a-virtualenv}

Si assume che il virtualenv venga creato in `/home/semaphore/venv`

Assicurarsi che l'ambiente virtuale sia attivato all'interno del servizio! Anche questo è mostrato nell'esempio di servizio riportato di seguito.

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

#### Risoluzione dei problemi {#troubleshooting-1}

Se si riscontrano problemi con Python3 utilizzando un ambiente virtuale, sarà necessario entrare nel suo contesto per risolverli:

```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

# troubleshooting

deactivate
```

A volte un ambiente virtuale si danneggia anche in seguito agli aggiornamenti di sistema. In tal caso è sufficiente rimuovere quello esistente e ricrearlo.

----

## Collection e ruoli Ansible {#ansible-collections--roles}

Potrebbe essere utile preinstallare moduli e ruoli Ansible, in modo che non debbano essere installati a ogni esecuzione di un task!

### Requisiti {#requirements-1}

Si consiglia di utilizzare un file `requirements.yml` per specificare i moduli da installare.

Si assume che venga utilizzato il file `/home/semaphore/requirements.yml`.

Ecco un esempio del suo contenuto:

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

Vedere anche: [Installazione delle collection](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy), [Installazione dei ruoli](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-multiple-roles-from-a-file)

NOTA: È opportuno aggiornare periodicamente anche questi requisiti!

Un'opzione per farlo automaticamente è mostrata anche nell'esempio di servizio riportato di seguito.

### Installazione nel contesto utente {#install-in-user-context}

**Manualmente**:
```bash
sudo su --login semaphore
ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml
```

### Installazione con un virtualenv {#install-when-using-a-virtualenv}

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

## Reverse proxy {#reverse-proxy}

Vedere: [Sicurezza - Connessione cifrata](/admin-guide/security/network#reverse-proxy)

----

## Servizio Systemd esteso {#extended-systemd-service}

Ecco il template di base del servizio systemd.

Aggiungere le impostazioni aggiuntive sotto la rispettiva `[PART]`

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

### Utente di servizio {#service-user-1}

```ini
[Service]
User=semaphore
Group=semaphore
```

----

### Moduli Python {#python-modules}

#### Nel contesto utente {#in-user-context}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

# so the executables are found
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/semaphore/.local/bin"
# set the correct python path. You can get the correct path with: python3 -c "import site; print(site.USER_SITE)" 
Environment="PYTHONPATH=/home/semaphore/.local/lib/python3.10/site-packages"
```

#### In un virtualenv {#in-virtualenv}

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

### Collection e ruoli Ansible {#ansible-collections--roles-1}

#### Se si utilizza Python3 nel contesto utente {#if-using-python3-in-user-context}

```ini
[Service]
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

#### Se si utilizza Python3 in un virtualenv {#if-using-python3-in-virtualenv}

```ini
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

----

### Altri casi d'uso {#other-use-cases}

#### Utilizzo di MariaDB locale {#using-local-mariadb}

```ini
[Unit]
Requires=mariadb.service
```

#### Utilizzo di Nginx locale {#using-local-nginx}

```ini
[Unit]
Wants=nginx.service
```

#### Invio dei log a syslog {#sending-logs-to-syslog}

```ini
[Service]
StandardOutput=journal
StandardError=journal
SyslogIdentifier=semaphore
```

### Esempi completi {#full-examples}

#### Moduli Python nel contesto utente {#python-modules-in-user-context}

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

#### Moduli Python in un virtualenv {#python-modules-in-virtualenv}

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

### Correzioni {#fixes}

Se è impostata una lingua di sistema personalizzata, potrebbero verificarsi problemi risolvibili aggiornando le relative variabili d'ambiente:

```ini
[Service]
Environment=LANG="en_US.UTF-8"
Environment=LC_ALL="en_US.UTF-8"
```

----

## Risoluzione dei problemi {#troubleshooting-2}

Se si verifica un problema durante l'esecuzione di un task, potrebbe trattarsi di un problema dell'ambiente configurato e non di Semaphore stesso!

Seguire questi passaggi per verificare se il problema si verifica anche al di fuori di Semaphore:

- Entrare nel contesto dell'utente:

  ```bash
  sudo su --login semaphore
  ```

- Entrare nel contesto del virtualenv, se se ne utilizza uno:

  ```ini
  source /home/semaphore/venv/bin/activate
  # verify we are using python3 from inside the venv
  which python3
  > /home/semaphore/venv/bin/python3
  
  # troubleshooting
  
  deactivate
  ```

- Eseguire manualmente il playbook Ansible

  - Se **fallisce** => c'è un problema nell'ambiente
  - Se **funziona**:
    - Ricontrollare la configurazione all'interno di Semaphore
    - Potrebbe trattarsi di un problema di Semaphore
