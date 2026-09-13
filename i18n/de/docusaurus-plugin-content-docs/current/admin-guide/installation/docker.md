# Docker

&#x20;Erstellen Sie eine Datei `docker-compose.yml` mit folgendem Inhalt:

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

Sie müssen die folgenden vertraulichen Variablen angeben:

* `MYSQL_PASSWORD` und `SEMAPHORE_DB_PASS` &mdash; Passwort für den MySQL-Benutzer.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; Passwort für den Admin-Benutzer von Semaphore.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; Schlüssel zur Verschlüsselung der Zugriffsschlüssel in der Datenbank. Er muss mit dem folgenden Befehl generiert werden: `head -c32 /dev/urandom | base64`.

Wenn Sie Docker Swarm verwenden, wird dringend empfohlen, Zugangsdaten nicht direkt in die Compose-Datei (und generell nicht in Umgebungsvariablen) einzubetten, sondern stattdessen [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/) zu verwenden. Semaphore [unterstützt](https://github.com/semaphoreui/semaphore/issues/1268) ein gängiges Muster für Docker-Container, bei dem Einstellungen statt aus der Umgebung aus Dateien gelesen werden, indem `_FILE` an das Ende des Namens der Umgebungsvariable angehängt wird. Ein Beispiel finden Sie in der [Docker-Dokumentation](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

Ein eingeschränktes Beispiel mit Secrets:

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


Führen Sie den folgenden Befehl aus, um Semaphore mit der konfigurierten Datenbank (MySQL oder Postgres) zu starten:

```bash
docker-compose up
```

&#x20;Semaphore ist über die folgende URL erreichbar: [http://localhost:3000](http://localhost:3000).

## Zusätzliche Python-Abhängigkeiten installieren {#installing-additional-python-dependencies}

Einige Ansible-Module, Collections und Python-Anwendungen benötigen zusätzliche Python-Pakete, die nicht im Image enthalten sind.
Sowohl das Server-Image (`semaphoreui/semaphore`) als auch das Runner-Image (`semaphoreui/runner`) können diese beim Start des Containers automatisch installieren.

So verwenden Sie diese Funktion:

1. Erstellen Sie eine Datei `requirements.txt` mit Ihren Python-Abhängigkeiten. Siehe das [Format der pip-Requirements-Datei](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Mounten Sie sie als `requirements.txt` im Konfigurationsverzeichnis des Containers. Das Konfigurationsverzeichnis wird über `SEMAPHORE_CONFIG_PATH` festgelegt und ist standardmäßig `/etc/semaphore`.

Beispiel für `requirements.txt`:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Beispielhafte Ergänzung Ihrer `docker-compose.yml`:

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

Dasselbe funktioniert für einen Runner-Container:

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

Oder mit einem einfachen `docker run`:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### Funktionsweise {#how-it-works}

Beim Start prüft der Container, ob `${SEMAPHORE_CONFIG_PATH}/requirements.txt` vorhanden ist. Wenn die Datei existiert, wird Folgendes ausgeführt:

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

Fehlt die Datei, protokolliert der Container `No additional python dependencies to install` und fährt fort.

Zu beachten:

- **Die Pakete landen in der virtuellen Ansible-Umgebung.** Das Image setzt das mitgelieferte Ansible-venv an den Anfang von `PATH`, sodass `pip3` in dieses venv installiert und nicht in das System-Python. Ansible und Python-Anwendungen, die im Container laufen, sehen die Pakete. `--break-system-packages` ist nicht erforderlich.
- **Die Installation läuft bei jedem Start**, nicht nur beim ersten. Pakete bleiben zwischen Neuerstellungen des Containers nicht erhalten, daher installiert ein Container-Neustart mit frischem Dateisystem sie erneut. Dies erfordert beim Start Netzwerkzugriff auf PyPI (oder den von Ihnen konfigurierten Index).
- **Eine fehlgeschlagene Installation stoppt den Container.** Wenn `pip3` mit einem Fehler beendet wird (ein Tippfehler im Paketnamen, eine fehlende Build-Abhängigkeit oder kein Netzwerk), beendet sich der Container, bevor Semaphore startet. Prüfen Sie die Container-Logs auf die pip-Ausgabe.
- **Pakete, die kompiliert werden müssen** (zum Beispiel einige Krypto- oder Datenbanktreiber), können fehlschlagen, da das Image keinen Compiler enthält. Bevorzugen Sie Wheels oder erstellen Sie für solche Pakete ein eigenes Image.

### Alternative: eigenes Image {#alternative-custom-image}

Wenn Sie viele Abhängigkeiten haben, Systempakete benötigen oder schnellere und Offline-Starts wünschen, backen Sie die Pakete stattdessen in Ihr eigenes Image ein:

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

Eine Aktivierung der virtuellen Umgebung ist nicht nötig. Das Basis-Image setzt `PATH` und `VIRTUAL_ENV` bereits auf das mitgelieferte Ansible-venv und wechselt zum Benutzer `semaphore`, dem dieses venv gehört. `pip3` in einem abgeleiteten Image verweist daher auf das pip des venv und installiert dorthin, genau wie der Start-Hook.

Derselbe Ansatz funktioniert mit `semaphoreui/runner` als Basis-Image.
