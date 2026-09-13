# Ručna instalacija Semaphore-a

----

**Sadržaj:**

* [Servisni korisnik](/admin-guide/installation_manually#service-user)
* [Python3](/admin-guide/installation_manually#python3)
* [Ansible kolekcije i uloge](/admin-guide/installation_manually#ansible-collections--roles)
* [Reverzni proksi](/admin-guide/installation_manually#reverse-proxy)
* [Systemd servis](/admin-guide/installation_manually#extended-systemd-service)
* [Rešavanje problema](/admin-guide/installation_manually#troubleshooting)

----

Ova dokumentacija detaljno opisuje kako da podesite Semaphore kada koristite sledeće metode instalacije:

* [Menadžer paketa](/admin-guide/installation/package-manager)
* [Binarna datoteka](/admin-guide/installation/binary-file)

Softverski paket Semaphore je samo deo celokupnog sistema potrebnog za uspešno pokretanje Ansible-a pomoću njega.

Python3 i Ansible izvršno okruženje su takođe veoma važni!

NAPOMENA: Postoje [gotove Ansible Galaxy uloge](https://galaxy.ansible.com/search?deprecated=false&keywords=ansible%20semaphore&order_by=-relevance&page=1) koje obavljaju ovu logiku podešavanja umesto vas ili se mogu koristiti kao osnovni šablon za vašu sopstvenu Ansible ulogu!

----

## Servisni korisnik {#service-user}

Semaphore ne mora da se pokreće kao korisnik `root` - i ne bi trebalo.

**Prednosti** korišćenja servisnog korisnika:
* Ima sopstvenu korisničku konfiguraciju
* Ima sopstveno okruženje
* Procesi se lako identifikuju
* Veća bezbednost sistema

Sistemskog korisnika možete kreirati ručno pomoću `adduser` ili pomoću modula [ansible.builtin.user](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html).

U ovoj dokumentaciji pretpostavljamo:
* kreirani servisni korisnik se zove `semaphore`
* podešena mu je ljuska `/bin/bash`
* njegov home direktorijum je `/home/semaphore`

### Rešavanje problema {#troubleshooting}

Ako Ansible izvršavanje iz Semaphore-a ne uspeva - moraćete da rešavate problem u kontekstu servisnog korisnika.

Za to imate više opcija:

* Prebacite celu sesiju ljuske u kontekst korisnika:

  ```bash
  sudo su --login semaphore
  ```

* Pokrenite jednu komandu u kontekstu korisnika:

  ```bash
  sudo --login -u semaphore <command>
  ```

----

## Python3 {#python3}

[Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html) je napisan u programskom jeziku [Python3](https://docs.python.org/3/).

Zato je njegovo čisto podešavanje neophodno da bi Ansible ispravno radio.

Prvo - uverite se da su paketi `python3` i `python3-pip` instalirani na vašem sistemu!

Potrebne Python module možete instalirati na više načina:
* Instaliranjem u kontekstu servisnog korisnika
* Instaliranjem u [virtuelno okruženje](https://virtualenv.pypa.io/en/latest/) namenjeno servisu

### Zahtevi {#requirements}

U oba slučaja - preporučuje se korišćenje datoteke `requirements.txt` za navođenje modula koje treba instalirati.

Pretpostavićemo da se koristi datoteka `/home/semaphore/requirements.txt`.

Evo primera njenog sadržaja:

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

NAPOMENA: Ove zahteve bi trebalo povremeno i ažurirati!

Opcija za automatsko ažuriranje je prikazana i u primeru servisa ispod.

### Moduli u korisničkom kontekstu {#modules-in-user-context}

**Ručno**:

```bash
sudo --login -u semaphore python3 -m pip install --user --upgrade -r /home/semaphore/requirements.txt
```

**Pomoću Ansible-a**:

```yaml
- name: Install requirements
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    extra_args: '--user --upgrade'
  become_user: 'semaphore'
```

### Moduli u virtualenv-u {#modules-in-a-virtualenv}

Pretpostavićemo da je virtualenv kreiran u `/home/semaphore/venv`

Uverite se da je virtuelno okruženje aktivirano unutar servisa! To je takođe prikazano u primeru servisa ispod.

**Ručno**:
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

**Pomoću Ansible-a**:

```yaml
- name: Create virtual environment and install requirements into it
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    virtualenv: '/home/semaphore/venv'
    state: present  # or 'latest' to upgrade the requirements
```

#### Rešavanje problema {#troubleshooting-1}

Ako naiđete na probleme sa Python3 pri korišćenju virtuelnog okruženja, moraćete da uđete u njegov kontekst da biste ih rešili:

```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

# troubleshooting

deactivate
```

Ponekad se virtuelno okruženje pokvari i pri nadogradnji sistema. Ako se to desi, možete jednostavno ukloniti postojeće i kreirati ga ponovo.

----

## Ansible kolekcije i uloge {#ansible-collections--roles}

Možda ćete želeti da unapred instalirate Ansible module i uloge, kako ne bi morali da se instaliraju pri svakom pokretanju zadatka!

### Zahtevi {#requirements-1}

Preporučuje se korišćenje datoteke `requirements.yml` za navođenje modula koje treba instalirati.

Pretpostavićemo da se koristi datoteka `/home/semaphore/requirements.yml`.

Evo primera njenog sadržaja:

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

Pogledajte i: [Instaliranje kolekcija](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy), [Instaliranje uloga](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-multiple-roles-from-a-file)

NAPOMENA: Ove zahteve bi trebalo povremeno i ažurirati!

Opcija za automatsko ažuriranje je prikazana i u primeru servisa ispod.

### Instalacija u korisničkom kontekstu {#install-in-user-context}

**Ručno**:
```bash
sudo su --login semaphore
ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml
```

### Instalacija pri korišćenju virtualenv-a {#install-when-using-a-virtualenv}

**Ručno**:
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

## Reverzni proksi {#reverse-proxy}

Pogledajte: [Bezbednost - Šifrovana veza](/admin-guide/security/network#reverse-proxy)

----

## Prošireni Systemd servis {#extended-systemd-service}

Evo osnovnog šablona systemd servisa.

Dodatna podešavanja dodajte pod odgovarajući `[PART]`

### Osnova {#base}

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

### Servisni korisnik {#service-user-1}

```ini
[Service]
User=semaphore
Group=semaphore
```

----

### Python moduli {#python-modules}

#### U korisničkom kontekstu {#in-user-context}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

# so the executables are found
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/semaphore/.local/bin"
# set the correct python path. You can get the correct path with: python3 -c "import site; print(site.USER_SITE)" 
Environment="PYTHONPATH=/home/semaphore/.local/lib/python3.10/site-packages"
```

#### U virtualenv-u {#in-virtualenv}

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

### Ansible kolekcije i uloge {#ansible-collections--roles-1}

#### Ako koristite Python3 u korisničkom kontekstu {#if-using-python3-in-user-context}

```ini
[Service]
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

#### Ako koristite Python3 u virtualenv-u {#if-using-python3-in-virtualenv}

```ini
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

----

### Drugi slučajevi upotrebe {#other-use-cases}

#### Korišćenje lokalne MariaDB {#using-local-mariadb}

```ini
[Unit]
Requires=mariadb.service
```

#### Korišćenje lokalnog Nginx-a {#using-local-nginx}

```ini
[Unit]
Wants=nginx.service
```

#### Slanje logova u syslog {#sending-logs-to-syslog}

```ini
[Service]
StandardOutput=journal
StandardError=journal
SyslogIdentifier=semaphore
```

### Kompletni primeri {#full-examples}

#### Python moduli u korisničkom kontekstu {#python-modules-in-user-context}

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

#### Python moduli u virtualenv-u {#python-modules-in-virtualenv}

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

### Ispravke {#fixes}

Ako imate podešen prilagođeni sistemski jezik - možete naići na probleme koji se rešavaju ažuriranjem odgovarajućih promenljivih okruženja:

```ini
[Service]
Environment=LANG="en_US.UTF-8"
Environment=LC_ALL="en_US.UTF-8"
```

----

## Rešavanje problema {#troubleshooting-2}

Ako dođe do problema pri izvršavanju zadatka, možda je u pitanju problem sa okruženjem u vašem podešavanju - a ne sa samim Semaphore-om!

Prođite kroz sledeće korake da proverite da li se problem javlja i van Semaphore-a:

- Uđite u kontekst korisnika:

  ```bash
  sudo su --login semaphore
  ```

- Uđite u kontekst virtualenv-a ako ga koristite:

  ```ini
  source /home/semaphore/venv/bin/activate
  # verify we are using python3 from inside the venv
  which python3
  > /home/semaphore/venv/bin/python3
  
  # troubleshooting
  
  deactivate
  ```

- Pokrenite Ansible playbook ručno

  - Ako **ne uspe** => problem je u vašem okruženju
  - Ako **radi**:
    - Ponovo proverite svoju konfiguraciju unutar Semaphore-a
    - Možda je problem u Semaphore-u
