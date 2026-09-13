# Docker

&#x20;Creare un file `docker-compose.yml` con il seguente contenuto:

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

È necessario specificare le seguenti variabili riservate:

* `MYSQL_PASSWORD` e `SEMAPHORE_DB_PASS` &mdash; password dell'utente MySQL.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; password dell'utente amministratore di Semaphore.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; chiave per la cifratura delle chiavi di accesso nel database. Deve essere generata con il seguente comando: `head -c32 /dev/urandom | base64`.

Se si utilizza Docker Swarm, è fortemente consigliato non inserire le credenziali direttamente nel file Compose (né, in generale, nelle variabili d'ambiente) e utilizzare invece i [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/). Semaphore [supporta](https://github.com/semaphoreui/semaphore/issues/1268) un pattern comune dei container Docker per leggere le impostazioni da file anziché dall'ambiente, aggiungendo il suffisso `_FILE` al nome della variabile d'ambiente. Consultare la [documentazione Docker per un esempio](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

Un esempio ridotto che utilizza i secret:

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


Eseguire il seguente comando per avviare Semaphore con il database configurato (MySQL o Postgres):

```bash
docker-compose up
```

&#x20;Semaphore sarà disponibile al seguente URL [http://localhost:3000](http://localhost:3000).

## Installazione di dipendenze Python aggiuntive {#installing-additional-python-dependencies}

Alcuni moduli e collection Ansible e alcune applicazioni Python richiedono pacchetti Python aggiuntivi non inclusi nell'immagine.
Sia l'immagine del server (`semaphoreui/semaphore`) sia quella del runner (`semaphoreui/runner`) possono installarli automaticamente all'avvio del container.

Per utilizzare questa funzionalità:

1. Creare un file `requirements.txt` con le dipendenze Python. Consultare il [formato dei file requirements di pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Montarlo nel container come `requirements.txt` all'interno della directory di configurazione. La directory di configurazione è definita da `SEMAPHORE_CONFIG_PATH` e per impostazione predefinita è `/etc/semaphore`.

Esempio di `requirements.txt`:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Esempio di modifica al file `docker-compose.yml`:

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

Lo stesso vale per un container runner:

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

Oppure con un semplice `docker run`:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### Come funziona {#how-it-works}

Durante l'avvio, il container verifica la presenza di `${SEMAPHORE_CONFIG_PATH}/requirements.txt`. Se il file esiste, esegue:

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

Se il file non è presente, il container registra nel log `No additional python dependencies to install` e prosegue.

Aspetti da tenere presenti:

- **I pacchetti vengono installati nell'ambiente virtuale di Ansible.** L'immagine mette il venv Ansible incluso per primo nel `PATH`, quindi `pip3` installa in quel venv anziché nel Python di sistema. Ansible e le applicazioni Python in esecuzione nel container vedono i pacchetti. Non è necessario `--break-system-packages`.
- **L'installazione viene eseguita a ogni avvio**, non solo al primo. I pacchetti non vengono conservati tra una ricreazione del container e l'altra, quindi un riavvio del container con un filesystem nuovo li installa di nuovo. Ciò richiede l'accesso di rete a PyPI (o all'indice configurato) all'avvio.
- **Un'installazione non riuscita arresta il container.** Se `pip3` termina con un errore (un refuso nel nome di un pacchetto, una dipendenza di build mancante o l'assenza di rete), il container termina prima dell'avvio di Semaphore. Controllare i log del container per l'output di pip.
- **I pacchetti che richiedono compilazione** (ad esempio alcuni driver crittografici o per database) potrebbero non riuscire a installarsi perché l'immagine non include un compilatore. Preferire i wheel oppure creare un'immagine personalizzata per questi casi.

### Alternativa: immagine personalizzata {#alternative-custom-image}

Se si hanno molte dipendenze, sono necessari pacchetti di sistema o si desiderano avvii più rapidi e offline, incorporare invece i pacchetti in una propria immagine:

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

Non è necessario attivare alcun ambiente virtuale. L'immagine di base imposta già `PATH` e `VIRTUAL_ENV` sul venv Ansible incluso e passa all'utente `semaphore`, proprietario di quel venv. In un'immagine derivata, `pip3` corrisponde quindi al pip del venv e installa lì, esattamente come fa l'hook di avvio.

Lo stesso approccio funziona con `semaphoreui/runner` come immagine di base.
