# Docker

&#x20;Créez un fichier `docker-compose.yml` avec le contenu suivant :

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

Vous devez définir les variables confidentielles suivantes :

* `MYSQL_PASSWORD` et `SEMAPHORE_DB_PASS` &mdash; mot de passe de l'utilisateur MySQL.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; mot de passe de l'utilisateur administrateur de Semaphore.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; clé de chiffrement des clés d'accès dans la base de données. Elle doit être générée à l'aide de la commande suivante : `head -c32 /dev/urandom | base64`.

Si vous utilisez Docker Swarm, il est fortement recommandé de ne pas intégrer les identifiants directement dans le fichier Compose (ni dans les variables d'environnement en général) et d'utiliser plutôt les [secrets Docker](https://docs.docker.com/engine/swarm/secrets/). Semaphore [prend en charge](https://github.com/semaphoreui/semaphore/issues/1268) un modèle courant des conteneurs Docker qui consiste à lire les paramètres depuis des fichiers plutôt que depuis l'environnement, en ajoutant `_FILE` à la fin du nom de la variable d'environnement. Consultez la [documentation Docker pour un exemple](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

Un exemple simplifié utilisant des secrets :

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


Exécutez la commande suivante pour démarrer Semaphore avec la base de données configurée (MySQL ou Postgres) :

```bash
docker-compose up
```

&#x20;Semaphore sera accessible à l'URL suivante [http://localhost:3000](http://localhost:3000).

## Installation de dépendances Python supplémentaires {#installing-additional-python-dependencies}

Certains modules et collections Ansible, ainsi que certaines applications Python, ont besoin de paquets Python supplémentaires qui ne sont pas inclus dans l'image.
L'image du serveur (`semaphoreui/semaphore`) et l'image du runner (`semaphoreui/runner`) peuvent toutes deux les installer automatiquement au démarrage du conteneur.

Pour utiliser cette fonctionnalité :

1. Créez un fichier `requirements.txt` contenant vos dépendances Python. Consultez le [format des fichiers requirements de pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Montez-le dans le conteneur sous le nom `requirements.txt` dans le répertoire de configuration. Le répertoire de configuration est défini par `SEMAPHORE_CONFIG_PATH` et vaut `/etc/semaphore` par défaut.

Exemple de `requirements.txt` :

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Exemple de modification de votre `docker-compose.yml` :

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

La même chose fonctionne pour un conteneur runner :

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

Ou avec un simple `docker run` :

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### Fonctionnement {#how-it-works}

Au démarrage, le conteneur vérifie la présence de `${SEMAPHORE_CONFIG_PATH}/requirements.txt`. Si le fichier existe, il exécute :

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

Si le fichier est absent, le conteneur journalise `No additional python dependencies to install` et poursuit son démarrage.

Points à garder à l'esprit :

- **Les paquets sont installés dans l'environnement virtuel Ansible.** L'image place le venv Ansible embarqué en tête du `PATH`, de sorte que `pip3` installe dans ce venv plutôt que dans le Python système. Ansible et les applications Python exécutées dans le conteneur voient ces paquets. L'option `--break-system-packages` n'est pas nécessaire.
- **L'installation s'exécute à chaque démarrage**, et pas seulement au premier. Les paquets ne sont pas conservés entre deux recréations du conteneur : un redémarrage du conteneur avec un système de fichiers vierge les réinstalle. Cela nécessite un accès réseau à PyPI (ou à l'index que vous avez configuré) au démarrage.
- **Une installation en échec arrête le conteneur.** Si `pip3` se termine avec une erreur (faute de frappe dans un nom de paquet, dépendance de compilation manquante ou absence de réseau), le conteneur s'arrête avant le démarrage de Semaphore. Consultez les journaux du conteneur pour voir la sortie de pip.
- **Les paquets nécessitant une compilation** (par exemple certains pilotes de chiffrement ou de base de données) peuvent échouer, car l'image n'inclut pas de compilateur. Privilégiez les wheels, ou construisez une image personnalisée pour ces paquets.

### Alternative : image personnalisée {#alternative-custom-image}

Si vous avez de nombreuses dépendances, si vous avez besoin de paquets système, ou si vous souhaitez des démarrages plus rapides et hors ligne, intégrez plutôt les paquets dans votre propre image :

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

Aucune activation d'environnement virtuel n'est nécessaire. L'image de base définit déjà `PATH` et `VIRTUAL_ENV` sur le venv Ansible embarqué et bascule vers l'utilisateur `semaphore`, propriétaire de ce venv. Dans une image dérivée, `pip3` correspond donc au pip du venv et installe les paquets à cet endroit, exactement comme le fait le hook de démarrage.

La même approche fonctionne avec `semaphoreui/runner` comme image de base.
