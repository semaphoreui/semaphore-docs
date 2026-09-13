# Docker

&#x20;Napravite fajl `docker-compose.yml` sa sledećim sadržajem:

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
      SEMAPHORE_LDAP_SEARCH_FILTER: "(&(uid=%s)(memberOf=cn=ipausers,cn=groups,cn=accounts,dc=local,dc=example,dc=com))"
      TZ: UTC
    depends_on:
      - mysql # for postgres, change to: postgres
volumes:
  semaphore-mysql: # to use postgres, switch to: semaphore-postgres
```

Morate navesti sledeće poverljive promenljive:

* `MYSQL_PASSWORD` i `SEMAPHORE_DB_PASS` &mdash; lozinka za MySQL korisnika.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; lozinka za administratorskog korisnika Semaphore-a.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; ključ za šifrovanje pristupnih ključeva u bazi podataka. Mora se generisati pomoću sledeće komande: `head -c32 /dev/urandom | base64`.

Ako koristite Docker Swarm, strogo se preporučuje da kredencijale ne ugrađujete direktno u Compose fajl (ni u promenljive okruženja uopšte), već da umesto toga koristite [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/). Semaphore [podržava](https://github.com/semaphoreui/semaphore/issues/1268) uobičajeni obrazac Docker kontejnera za čitanje podešavanja iz fajlova umesto iz okruženja, dodavanjem sufiksa `_FILE` na kraj imena promenljive okruženja. Pogledajte [primer u Docker dokumentaciji](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

Ograničen primer sa upotrebom tajni:

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


Pokrenite sledeću komandu da biste startovali Semaphore sa konfigurisanom bazom podataka (MySQL ili Postgres):

```bash
docker-compose up
```

&#x20;Semaphore će biti dostupan na sledećoj adresi [http://localhost:3000](http://localhost:3000).

## Instaliranje dodatnih Python zavisnosti {#installing-additional-python-dependencies}

Nekim Ansible modulima, kolekcijama i Python aplikacijama potrebni su dodatni Python paketi koji nisu uključeni u sliku.
I serverska slika (`semaphoreui/semaphore`) i slika za runner (`semaphoreui/runner`) mogu ih automatski instalirati pri pokretanju kontejnera.

Da biste koristili ovu mogućnost:

1. Napravite fajl `requirements.txt` sa vašim Python zavisnostima. Pogledajte [format pip requirements fajla](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Montirajte ga u kontejner kao `requirements.txt` unutar konfiguracionog direktorijuma. Konfiguracioni direktorijum se zadaje promenljivom `SEMAPHORE_CONFIG_PATH`, a podrazumevano je `/etc/semaphore`.

Primer fajla `requirements.txt`:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Primer izmene vašeg fajla `docker-compose.yml`:

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

Isto važi i za runner kontejner:

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

Ili sa običnom komandom `docker run`:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### Kako radi {#how-it-works}

Tokom pokretanja kontejner proverava da li postoji `${SEMAPHORE_CONFIG_PATH}/requirements.txt`. Ako fajl postoji, izvršava se:

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

Ako fajl ne postoji, kontejner upisuje u log `No additional python dependencies to install` i nastavlja dalje.

Na šta treba obratiti pažnju:

- **Paketi se instaliraju u Ansible virtuelno okruženje.** Slika stavlja ugrađeni Ansible venv na prvo mesto u `PATH`, tako da `pip3` instalira u taj venv, a ne u sistemski Python. Ansible i Python aplikacije koje se izvršavaju u kontejneru vide te pakete. Nema potrebe za `--break-system-packages`.
- **Instalacija se izvršava pri svakom pokretanju**, ne samo pri prvom. Paketi se ne čuvaju između ponovnih kreiranja kontejnera, pa ih restart kontejnera sa svežim fajl-sistemom ponovo instalira. Za to je pri pokretanju potreban mrežni pristup PyPI-ju (ili vašem konfigurisanom indeksu).
- **Neuspela instalacija zaustavlja kontejner.** Ako `pip3` završi sa greškom (greška u kucanju imena paketa, nedostajuća build zavisnost ili nema mreže), kontejner se gasi pre nego što se Semaphore pokrene. Proverite logove kontejnera da biste videli izlaz pip-a.
- **Paketi koji zahtevaju kompajliranje** (na primer neki kripto drajveri ili drajveri za baze podataka) mogu da ne uspeju jer slika ne sadrži kompajler. Dajte prednost wheel paketima ili za njih napravite prilagođenu sliku.

### Alternativa: prilagođena slika {#alternative-custom-image}

Ako imate mnogo zavisnosti, potrebni su vam sistemski paketi ili želite brže pokretanje i rad bez mreže, umesto toga ugradite pakete u sopstvenu sliku:

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

Nije potrebno aktivirati virtuelno okruženje. Osnovna slika već postavlja `PATH` i `VIRTUAL_ENV` na ugrađeni Ansible venv i prelazi na korisnika `semaphore`, koji je vlasnik tog venv-a. `pip3` u izvedenoj slici se zato razrešava u pip iz venv-a i instalira tamo, baš kao što to radi i hook pri pokretanju.

Isti pristup radi i sa `semaphoreui/runner` kao osnovnom slikom.
