# Docker

&#x20;创建一个 `docker-compose.yml` 文件，内容如下：

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

你必须指定以下机密变量：

* `MYSQL_PASSWORD` 和 `SEMAPHORE_DB_PASS` &mdash; MySQL 用户的密码。
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; Semaphore 管理员用户的密码。
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; 用于加密数据库中访问密钥的密钥。必须使用以下命令生成：`head -c32 /dev/urandom | base64`。

如果你使用 Docker Swarm，强烈建议不要将凭据直接写入 Compose 文件（也不要写入环境变量），而应使用 [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)。Semaphore [支持](https://github.com/semaphoreui/semaphore/issues/1268)一种常见的 Docker 容器模式：在环境变量名末尾追加 `_FILE`，即可从文件而不是环境变量中读取设置。请参阅 [Docker 文档中的示例](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose)。

一个使用 secrets 的简化示例：

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


运行以下命令，使用已配置的数据库（MySQL 或 Postgres）启动 Semaphore：

```bash
docker-compose up
```

&#x20;Semaphore 将通过以下 URL 提供访问：[http://localhost:3000](http://localhost:3000)。

## 安装额外的 Python 依赖 {#installing-additional-python-dependencies}

某些 Ansible 模块、集合以及 Python 应用需要镜像中未包含的额外 Python 包。
服务器镜像（`semaphoreui/semaphore`）和运行器镜像（`semaphoreui/runner`）都可以在容器启动时自动安装这些包。

要使用此功能：

1. 创建一个包含你的 Python 依赖的 `requirements.txt` 文件。请参阅 [pip requirements 文件格式](https://pip.pypa.io/en/stable/reference/requirements-file-format/)。
2. 将其以 `requirements.txt` 的名称挂载到容器的配置目录中。配置目录由 `SEMAPHORE_CONFIG_PATH` 设置，默认为 `/etc/semaphore`。

`requirements.txt` 示例：

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

`docker-compose.yml` 的修改示例：

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

同样的方式也适用于运行器（Runner）容器：

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

或者直接使用 `docker run`：

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### 工作原理 {#how-it-works}

容器在启动期间会检查 `${SEMAPHORE_CONFIG_PATH}/requirements.txt`。如果该文件存在，则运行：

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

如果该文件不存在，容器会记录日志 `No additional python dependencies to install` 并继续启动。

需要注意的事项：

- **包会安装到 Ansible 虚拟环境中。** 镜像将内置的 Ansible venv 放在 `PATH` 的最前面，因此 `pip3` 会安装到该 venv 中，而不是系统 Python。容器中运行的 Ansible 和 Python 应用都能看到这些包。无需使用 `--break-system-packages`。
- **每次启动都会执行安装**，而不仅仅是第一次。包在容器重建之间不会持久化，因此使用全新文件系统重启容器时会再次安装。这要求启动时能够通过网络访问 PyPI（或你配置的索引）。
- **安装失败会导致容器停止。** 如果 `pip3` 以错误退出（包名拼写错误、缺少构建依赖或没有网络），容器会在 Semaphore 启动前退出。请查看容器日志中的 pip 输出。
- **需要编译的包**（例如某些加密或数据库驱动）可能会失败，因为镜像中没有编译器。请优先使用 wheel 包，或者为这些包构建自定义镜像。

### 替代方案：自定义镜像 {#alternative-custom-image}

如果你有很多依赖、需要系统软件包，或者希望启动更快并支持离线启动，可以改为将这些包打包进你自己的镜像：

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

无需激活虚拟环境。基础镜像已经将 `PATH` 和 `VIRTUAL_ENV` 设置为内置的 Ansible venv，并切换到了拥有该 venv 的 `semaphore` 用户。因此，派生镜像中的 `pip3` 会解析为该 venv 的 pip 并安装到其中，与启动钩子的行为完全一致。

同样的方法也适用于以 `semaphoreui/runner` 作为基础镜像。
