# Docker

&#x20;Crie um arquivo `docker-compose.yml` com o seguinte conteúdo:

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

Você deve especificar as seguintes variáveis confidenciais:

* `MYSQL_PASSWORD` e `SEMAPHORE_DB_PASS` &mdash; senha do usuário do MySQL.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; senha do usuário administrador do Semaphore.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; chave para criptografar as chaves de acesso no banco de dados. Ela deve ser gerada com o seguinte comando: `head -c32 /dev/urandom | base64`.

Se você estiver usando Docker Swarm, é altamente recomendável não incorporar credenciais diretamente no arquivo Compose (nem em variáveis de ambiente em geral) e, em vez disso, usar [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/). O Semaphore [oferece suporte](https://github.com/semaphoreui/semaphore/issues/1268) a um padrão comum de contêineres Docker para obter configurações a partir de arquivos, em vez do ambiente, adicionando o sufixo `_FILE` ao final do nome da variável de ambiente. Consulte a [documentação do Docker para ver um exemplo](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose).

Um exemplo simplificado usando secrets:

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


Execute o seguinte comando para iniciar o Semaphore com o banco de dados configurado (MySQL ou Postgres):

```bash
docker-compose up
```

&#x20;O Semaphore estará disponível na seguinte URL: [http://localhost:3000](http://localhost:3000).

## Instalando dependências Python adicionais {#installing-additional-python-dependencies}

Alguns módulos, coleções do Ansible e aplicações Python precisam de pacotes Python extras que não estão incluídos na imagem.
Tanto a imagem do servidor (`semaphoreui/semaphore`) quanto a imagem do runner (`semaphoreui/runner`) podem instalá-los automaticamente na inicialização do contêiner.

Para usar este recurso:

1. Crie um arquivo `requirements.txt` com as suas dependências Python. Consulte o [formato de arquivo de requirements do pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/).
2. Monte-o no contêiner como `requirements.txt` dentro do diretório de configuração. O diretório de configuração é definido por `SEMAPHORE_CONFIG_PATH` e o padrão é `/etc/semaphore`.

Exemplo de `requirements.txt`:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

Exemplo de alteração no seu `docker-compose.yml`:

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

O mesmo funciona para um contêiner de runner:

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

Ou com um `docker run` simples:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### Como funciona {#how-it-works}

Durante a inicialização, o contêiner verifica se existe `${SEMAPHORE_CONFIG_PATH}/requirements.txt`. Se o arquivo existir, ele executa:

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

Se o arquivo não existir, o contêiner registra `No additional python dependencies to install` no log e continua.

Pontos a ter em mente:

- **Os pacotes vão para o ambiente virtual do Ansible.** A imagem coloca o venv do Ansible incluído em primeiro lugar no `PATH`, então o `pip3` instala nesse venv, e não no Python do sistema. O Ansible e as aplicações Python em execução no contêiner enxergam os pacotes. Não é necessário usar `--break-system-packages`.
- **A instalação é executada a cada inicialização**, não apenas na primeira. Os pacotes não são persistidos entre recriações do contêiner, então um contêiner reiniciado com um sistema de arquivos novo os instala novamente. Isso exige acesso de rede ao PyPI (ou ao índice que você configurou) durante a inicialização.
- **Uma instalação com falha interrompe o contêiner.** Se o `pip3` terminar com erro (um erro de digitação no nome de um pacote, uma dependência de build ausente ou falta de rede), o contêiner encerra antes de o Semaphore iniciar. Verifique a saída do pip nos logs do contêiner.
- **Pacotes que precisam de compilação** (por exemplo, alguns drivers de criptografia ou de banco de dados) podem falhar porque a imagem não inclui um compilador. Prefira wheels ou crie uma imagem personalizada para esses casos.

### Alternativa: imagem personalizada {#alternative-custom-image}

Se você tem muitas dependências, precisa de pacotes do sistema ou quer inicializações mais rápidas e offline, incorpore os pacotes na sua própria imagem:

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

Não é necessário ativar o ambiente virtual. A imagem base já define `PATH` e `VIRTUAL_ENV` apontando para o venv do Ansible incluído e muda para o usuário `semaphore`, que é o dono desse venv. Portanto, o `pip3` em uma imagem derivada resolve para o pip do venv e instala nele, exatamente como o hook de inicialização faz.

A mesma abordagem funciona com `semaphoreui/runner` como imagem base.
