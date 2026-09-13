# Installation manuelle de Semaphore

----

**Sommaire :**

* [Utilisateur de service](/admin-guide/installation_manually#service-user)
* [Python3](/admin-guide/installation_manually#python3)
* [Collections et rôles Ansible](/admin-guide/installation_manually#ansible-collections--roles)
* [Proxy inverse](/admin-guide/installation_manually#reverse-proxy)
* [Service Systemd](/admin-guide/installation_manually#extended-systemd-service)
* [Dépannage](/admin-guide/installation_manually#troubleshooting)

----

Cette documentation détaille la configuration de Semaphore lorsque vous utilisez les méthodes d'installation suivantes :

* [Gestionnaire de paquets](/admin-guide/installation/package-manager)
* [Fichier binaire](/admin-guide/installation/binary-file)

Le paquet logiciel Semaphore n'est qu'une partie de l'ensemble du système nécessaire pour exécuter Ansible avec succès.

L'environnement d'exécution Python3 et Ansible est tout aussi important !

REMARQUE : il existe des [rôles Ansible Galaxy](https://galaxy.ansible.com/search?deprecated=false&keywords=ansible%20semaphore&order_by=-relevance&page=1) qui gèrent cette logique de configuration pour vous, ou qui peuvent servir de modèle de base pour votre propre rôle Ansible !

----

## Utilisateur de service {#service-user}

Semaphore n'a pas besoin d'être exécuté en tant qu'utilisateur `root` ; vous ne devriez donc pas le faire.

**Avantages** d'un utilisateur de service :
* Il dispose de sa propre configuration utilisateur
* Il dispose de son propre environnement
* Ses processus sont facilement identifiables
* Sécurité du système renforcée

Vous pouvez créer un utilisateur système soit manuellement avec `adduser`, soit avec le module [ansible.builtin.user](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html).

Dans cette documentation, nous supposerons que :
* l'utilisateur de service créé s'appelle `semaphore`
* son shell est `/bin/bash`
* son répertoire personnel est `/home/semaphore`

### Dépannage {#troubleshooting}

Si l'exécution d'Ansible par Semaphore échoue, vous devrez effectuer le dépannage dans le contexte de l'utilisateur de service.

Vous disposez de plusieurs options pour cela :

* Basculer l'ensemble de votre session shell dans le contexte de l'utilisateur :

  ```bash
  sudo su --login semaphore
  ```

* Exécuter une seule commande dans le contexte de l'utilisateur :

  ```bash
  sudo --login -u semaphore <command>
  ```

----

## Python3 {#python3}

[Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html) est développé avec le langage de programmation [Python3](https://docs.python.org/3/).

Une installation propre de celui-ci est donc essentielle au bon fonctionnement d'Ansible.

Tout d'abord, assurez-vous que les paquets `python3` et `python3-pip` sont installés sur votre système !

Vous disposez de plusieurs options pour installer les modules Python requis :
* Les installer dans le contexte de l'utilisateur de service
* Les installer dans un [environnement virtuel](https://virtualenv.pypa.io/en/latest/) dédié au service

### Prérequis {#requirements}

Dans les deux cas, il est recommandé d'utiliser un fichier `requirements.txt` pour spécifier les modules à installer.

Nous supposerons que le fichier `/home/semaphore/requirements.txt` est utilisé.

Voici un exemple de son contenu :

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

REMARQUE : vous devriez également mettre à jour ces dépendances de temps en temps !

Une option pour le faire automatiquement est également présentée dans l'exemple de service ci-dessous.

### Modules dans le contexte utilisateur {#modules-in-user-context}

**Manuellement** :

```bash
sudo --login -u semaphore python3 -m pip install --user --upgrade -r /home/semaphore/requirements.txt
```

**Avec Ansible** :

```yaml
- name: Install requirements
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    extra_args: '--user --upgrade'
  become_user: 'semaphore'
```

### Modules dans un virtualenv {#modules-in-a-virtualenv}

Nous supposerons que le virtualenv est créé dans `/home/semaphore/venv`

Assurez-vous que l'environnement virtuel est activé dans le service ! Cela est également illustré dans l'exemple de service ci-dessous.

**Manuellement** :
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

**Avec Ansible** :

```yaml
- name: Create virtual environment and install requirements into it
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    virtualenv: '/home/semaphore/venv'
    state: present  # or 'latest' to upgrade the requirements
```

#### Dépannage {#troubleshooting-1}

Si vous rencontrez des problèmes avec Python3 en utilisant un environnement virtuel, vous devrez basculer dans son contexte pour les diagnostiquer :

```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

# troubleshooting

deactivate
```

Il arrive aussi qu'un environnement virtuel soit cassé par une mise à niveau du système. Dans ce cas, il suffit généralement de supprimer l'environnement existant et de le recréer.

----

## Collections et rôles Ansible {#ansible-collections--roles}

Vous pouvez préinstaller les modules et rôles Ansible afin qu'ils n'aient pas à être installés à chaque exécution d'une tâche !

### Prérequis {#requirements-1}

Il est recommandé d'utiliser un fichier `requirements.yml` pour spécifier les modules à installer.

Nous supposerons que le fichier `/home/semaphore/requirements.yml` est utilisé.

Voici un exemple de son contenu :

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

Voir aussi : [Installation de collections](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy), [Installation de rôles](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-multiple-roles-from-a-file)

REMARQUE : vous devriez également mettre à jour ces dépendances de temps en temps !

Une option pour le faire automatiquement est également présentée dans l'exemple de service ci-dessous.

### Installation dans le contexte utilisateur {#install-in-user-context}

**Manuellement** :
```bash
sudo su --login semaphore
ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml
```

### Installation avec un virtualenv {#install-when-using-a-virtualenv}

**Manuellement** :
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

## Proxy inverse {#reverse-proxy}

Voir : [Sécurité - Connexion chiffrée](/admin-guide/security/network#reverse-proxy)

----

## Service Systemd étendu {#extended-systemd-service}

Voici le modèle de base du service systemd.

Ajoutez les paramètres supplémentaires sous leur section `[PART]` respective

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

### Utilisateur de service {#service-user-1}

```ini
[Service]
User=semaphore
Group=semaphore
```

----

### Modules Python {#python-modules}

#### Dans le contexte utilisateur {#in-user-context}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

# so the executables are found
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/semaphore/.local/bin"
# set the correct python path. You can get the correct path with: python3 -c "import site; print(site.USER_SITE)" 
Environment="PYTHONPATH=/home/semaphore/.local/lib/python3.10/site-packages"
```

#### Dans un virtualenv {#in-virtualenv}

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

### Collections et rôles Ansible {#ansible-collections--roles-1}

#### Si Python3 est utilisé dans le contexte utilisateur {#if-using-python3-in-user-context}

```ini
[Service]
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

#### Si Python3 est utilisé dans un virtualenv {#if-using-python3-in-virtualenv}

```ini
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

----

### Autres cas d'utilisation {#other-use-cases}

#### Utilisation d'un MariaDB local {#using-local-mariadb}

```ini
[Unit]
Requires=mariadb.service
```

#### Utilisation d'un Nginx local {#using-local-nginx}

```ini
[Unit]
Wants=nginx.service
```

#### Envoi des journaux vers syslog {#sending-logs-to-syslog}

```ini
[Service]
StandardOutput=journal
StandardError=journal
SyslogIdentifier=semaphore
```

### Exemples complets {#full-examples}

#### Modules Python dans le contexte utilisateur {#python-modules-in-user-context}

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

#### Modules Python dans un virtualenv {#python-modules-in-virtualenv}

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

### Correctifs {#fixes}

Si une langue système personnalisée est définie, vous pourriez rencontrer des problèmes qui peuvent être résolus en mettant à jour les variables d'environnement associées :

```ini
[Service]
Environment=LANG="en_US.UTF-8"
Environment=LC_ALL="en_US.UTF-8"
```

----

## Dépannage {#troubleshooting-2}

Si un problème survient lors de l'exécution d'une tâche, il peut s'agir d'un problème d'environnement lié à votre installation, et non d'un problème de Semaphore lui-même !

Veuillez suivre ces étapes pour vérifier si le problème se produit en dehors de Semaphore :

- Basculez dans le contexte de l'utilisateur :

  ```bash
  sudo su --login semaphore
  ```

- Basculez dans le contexte du virtualenv si vous en utilisez un :

  ```ini
  source /home/semaphore/venv/bin/activate
  # verify we are using python3 from inside the venv
  which python3
  > /home/semaphore/venv/bin/python3
  
  # troubleshooting
  
  deactivate
  ```

- Exécutez le playbook Ansible manuellement

  - S'il **échoue** => il y a un problème avec votre environnement
  - S'il **fonctionne** :
    - Revérifiez votre configuration dans Semaphore
    - Il peut s'agir d'un problème de Semaphore
