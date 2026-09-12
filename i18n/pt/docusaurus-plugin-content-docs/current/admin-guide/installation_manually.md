# Instalando o Semaphore manualmente

----

**Conteúdo:**

* [Usuário de serviço](/admin-guide/installation_manually#service-user)
* [Python3](/admin-guide/installation_manually#python3)
* [Coleções e roles do Ansible](/admin-guide/installation_manually#ansible-collections--roles)
* [Proxy reverso](/admin-guide/installation_manually#reverse-proxy)
* [Serviço Systemd](/admin-guide/installation_manually#extended-systemd-service)
* [Solução de problemas](/admin-guide/installation_manually#troubleshooting)

----

Esta documentação detalha como configurar o Semaphore ao usar estes métodos de instalação:

* [Gerenciador de pacotes](/admin-guide/installation/package-manager)
* [Arquivo binário](/admin-guide/installation/binary-file)

O pacote de software do Semaphore é apenas uma parte de todo o sistema necessário para executar o Ansible com sucesso.

O ambiente de execução do Python3 e do Ansible também é muito importante!

NOTA: Existem [roles do Ansible Galaxy](https://galaxy.ansible.com/search?deprecated=false&keywords=ansible%20semaphore&order_by=-relevance&page=1) que cuidam dessa lógica de configuração para você ou que podem ser usadas como modelo base para a sua própria role do Ansible!

----

## Usuário de serviço {#service-user}

O Semaphore não precisa ser executado como usuário `root` - então você não deveria fazer isso.

**Benefícios** de usar um usuário de serviço:
* Possui sua própria configuração de usuário
* Possui seu próprio ambiente
* Processos facilmente identificáveis
* Maior segurança do sistema

Você pode criar um usuário de sistema manualmente usando `adduser` ou usando o módulo [ansible.builtin.user](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html).

Nesta documentação, vamos assumir que:
* o usuário de serviço criado se chama `semaphore`
* ele tem o shell `/bin/bash` definido
* seu diretório home é `/home/semaphore`

### Solução de problemas {#troubleshooting}

Se a execução do Ansible pelo Semaphore estiver falhando - você precisará diagnosticar o problema no contexto do usuário de serviço.

Você tem várias opções para fazer isso:

* Mudar toda a sua sessão de shell para o contexto do usuário:

  ```bash
  sudo su --login semaphore
  ```

* Executar um único comando no contexto do usuário:

  ```bash
  sudo --login -u semaphore <command>
  ```

----

## Python3 {#python3}

O [Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html) é desenvolvido na linguagem de programação [Python3](https://docs.python.org/3/).

Por isso, uma configuração limpa do Python3 é essencial para que o Ansible funcione corretamente.

Primeiro - certifique-se de que os pacotes `python3` e `python3-pip` estejam instalados no seu sistema!

Você tem várias opções para instalar os módulos Python necessários:
* Instalá-los no contexto do usuário de serviço
* Instalá-los em um [ambiente virtual](https://virtualenv.pypa.io/en/latest/) específico do serviço

### Requisitos {#requirements}

De qualquer forma - é recomendável usar um arquivo `requirements.txt` para especificar os módulos que precisam ser instalados.

Vamos assumir que o arquivo `/home/semaphore/requirements.txt` é utilizado.

Aqui está um exemplo do seu conteúdo:

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

NOTA: Você também deve atualizar esses requisitos de tempos em tempos!

Uma opção para fazer isso automaticamente também é mostrada no exemplo de serviço abaixo.

### Módulos no contexto do usuário {#modules-in-user-context}

**Manualmente**:

```bash
sudo --login -u semaphore python3 -m pip install --user --upgrade -r /home/semaphore/requirements.txt
```

**Usando o Ansible**:

```yaml
- name: Install requirements
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    extra_args: '--user --upgrade'
  become_user: 'semaphore'
```

### Módulos em um virtualenv {#modules-in-a-virtualenv}

Vamos assumir que o virtualenv é criado em `/home/semaphore/venv`

Certifique-se de que o ambiente virtual esteja ativado dentro do serviço! Isso também é mostrado no exemplo de serviço abaixo.

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

**Usando o Ansible**:

```yaml
- name: Create virtual environment and install requirements into it
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    virtualenv: '/home/semaphore/venv'
    state: present  # or 'latest' to upgrade the requirements
```

#### Solução de problemas {#troubleshooting-1}

Se você encontrar problemas com o Python3 ao usar um ambiente virtual, precisará entrar no contexto dele para diagnosticá-los:

```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

# troubleshooting

deactivate
```

Às vezes, um ambiente virtual também quebra em atualizações do sistema. Se isso acontecer, basta remover o existente e recriá-lo.

----

## Coleções e roles do Ansible {#ansible-collections--roles}

Você pode querer pré-instalar módulos e roles do Ansible, para que não precisem ser instalados toda vez que uma tarefa for executada!

### Requisitos {#requirements-1}

É recomendável usar um arquivo `requirements.yml` para especificar os módulos que precisam ser instalados.

Vamos assumir que o arquivo `/home/semaphore/requirements.yml` é utilizado.

Aqui está um exemplo do seu conteúdo:

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

Veja também: [Instalando coleções](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy), [Instalando roles](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-multiple-roles-from-a-file)

NOTA: Você também deve atualizar esses requisitos de tempos em tempos!

Uma opção para fazer isso automaticamente também é mostrada no exemplo de serviço abaixo.

### Instalação no contexto do usuário {#install-in-user-context}

**Manualmente**:
```bash
sudo su --login semaphore
ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml
```

### Instalação ao usar um virtualenv {#install-when-using-a-virtualenv}

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

## Proxy reverso {#reverse-proxy}

Consulte: [Segurança - Conexão criptografada](/admin-guide/security/network#reverse-proxy)

----

## Serviço Systemd estendido {#extended-systemd-service}

Aqui está o template básico do serviço systemd.

Adicione configurações adicionais na respectiva seção `[PART]`

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

### Usuário de serviço {#service-user-1}

```ini
[Service]
User=semaphore
Group=semaphore
```

----

### Módulos Python {#python-modules}

#### No contexto do usuário {#in-user-context}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

# so the executables are found
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/semaphore/.local/bin"
# set the correct python path. You can get the correct path with: python3 -c "import site; print(site.USER_SITE)" 
Environment="PYTHONPATH=/home/semaphore/.local/lib/python3.10/site-packages"
```

#### Em um virtualenv {#in-virtualenv}

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

### Coleções e roles do Ansible {#ansible-collections--roles-1}

#### Se estiver usando o Python3 no contexto do usuário {#if-using-python3-in-user-context}

```ini
[Service]
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

#### Se estiver usando o Python3 em um virtualenv {#if-using-python3-in-virtualenv}

```ini
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

----

### Outros casos de uso {#other-use-cases}

#### Usando MariaDB local {#using-local-mariadb}

```ini
[Unit]
Requires=mariadb.service
```

#### Usando Nginx local {#using-local-nginx}

```ini
[Unit]
Wants=nginx.service
```

#### Enviando logs para o syslog {#sending-logs-to-syslog}

```ini
[Service]
StandardOutput=journal
StandardError=journal
SyslogIdentifier=semaphore
```

### Exemplos completos {#full-examples}

#### Módulos Python no contexto do usuário {#python-modules-in-user-context}

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

#### Módulos Python em um virtualenv {#python-modules-in-virtualenv}

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

### Correções {#fixes}

Se você tiver um idioma de sistema personalizado definido - poderá encontrar problemas que podem ser resolvidos atualizando as variáveis de ambiente correspondentes:

```ini
[Service]
Environment=LANG="en_US.UTF-8"
Environment=LC_ALL="en_US.UTF-8"
```

----

## Solução de problemas {#troubleshooting-2}

Se houver um problema ao executar uma tarefa, pode ser um problema de ambiente na sua configuração - e não um problema do Semaphore em si!

Siga estas etapas para verificar se o problema ocorre fora do Semaphore:

- Entre no contexto do usuário:

  ```bash
  sudo su --login semaphore
  ```

- Entre no contexto do virtualenv, se você usar um:

  ```ini
  source /home/semaphore/venv/bin/activate
  # verify we are using python3 from inside the venv
  which python3
  > /home/semaphore/venv/bin/python3
  
  # troubleshooting
  
  deactivate
  ```

- Execute o playbook do Ansible manualmente

  - Se **falhar** => há um problema no seu ambiente
  - Se **funcionar**:
    - Verifique novamente a sua configuração dentro do Semaphore
    - Pode ser um problema do Semaphore
