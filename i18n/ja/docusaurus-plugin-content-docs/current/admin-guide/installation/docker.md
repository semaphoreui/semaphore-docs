# Docker

&#x20;次の内容で `docker-compose.yml` ファイルを作成します。

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

次の機密変数を指定する必要があります。

* `MYSQL_PASSWORD` と `SEMAPHORE_DB_PASS` &mdash; MySQL ユーザーのパスワード。
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; Semaphore の管理者ユーザーのパスワード。
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; データベース内のアクセスキーを暗号化するためのキー。次のコマンドで生成する必要があります: `head -c32 /dev/urandom | base64`。

Docker Swarm を使用している場合は、認証情報を Compose ファイルに直接 (また一般的に環境変数にも) 埋め込まず、代わりに [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/) を使用することを強くおすすめします。Semaphore は、環境変数名の末尾に `_FILE` を付けることで、環境変数の代わりにファイルから設定を読み込むという Docker コンテナの一般的なパターンを[サポート](https://github.com/semaphoreui/semaphore/issues/1268)しています。例については、[Docker のドキュメント](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose)を参照してください。

secrets を使用した簡単な例:

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


次のコマンドを実行して、設定したデータベース (MySQL または Postgres) と共に Semaphore を起動します。

```bash
docker-compose up
```

&#x20;Semaphore には次の URL からアクセスできます: [http://localhost:3000](http://localhost:3000)。

## 追加の Python 依存関係のインストール {#installing-additional-python-dependencies}

一部の Ansible モジュール、コレクション、Python アプリケーションは、イメージに含まれていない追加の Python パッケージを必要とします。
サーバーイメージ (`semaphoreui/semaphore`) とランナーイメージ (`semaphoreui/runner`) のどちらも、コンテナ起動時にそれらを自動的にインストールできます。

この機能を使用するには、次の手順を実行します。

1. Python の依存関係を記述した `requirements.txt` ファイルを作成します。[pip requirements ファイルの形式](https://pip.pypa.io/en/stable/reference/requirements-file-format/)を参照してください。
2. 設定ディレクトリ内の `requirements.txt` としてコンテナにマウントします。設定ディレクトリは `SEMAPHORE_CONFIG_PATH` で設定され、デフォルトは `/etc/semaphore` です。

`requirements.txt` の例:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

`docker-compose.yml` の更新例:

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

ランナーコンテナでも同じ方法が使えます。

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

または、通常の `docker run` の場合:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### 仕組み {#how-it-works}

起動時に、コンテナは `${SEMAPHORE_CONFIG_PATH}/requirements.txt` の有無を確認します。ファイルが存在する場合は、次を実行します。

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

ファイルが存在しない場合、コンテナは `No additional python dependencies to install` とログに記録して処理を続行します。

注意点:

- **パッケージは Ansible の仮想環境にインストールされます。** イメージは同梱の Ansible venv を `PATH` の先頭に置いているため、`pip3` はシステムの Python ではなくその venv にインストールします。コンテナ内で実行される Ansible や Python アプリケーションからそのパッケージが見えるようになります。`--break-system-packages` は必要ありません。
- **インストールは初回だけでなく、起動のたびに実行されます。** パッケージはコンテナの再作成をまたいで永続化されないため、新しいファイルシステムでコンテナが再起動されると再度インストールされます。このため、起動時に PyPI (または設定したインデックス) へのネットワークアクセスが必要です。
- **インストールに失敗するとコンテナは停止します。** `pip3` がエラーで終了した場合 (パッケージ名の誤字、ビルド依存関係の不足、ネットワークなし)、Semaphore が起動する前にコンテナが終了します。pip の出力についてはコンテナのログを確認してください。
- **コンパイルが必要なパッケージ** (たとえば一部の暗号化ライブラリやデータベースドライバー) は、イメージにコンパイラが含まれていないため失敗する可能性があります。wheel を優先するか、そのようなパッケージについてはカスタムイメージをビルドしてください。

### 代替手段: カスタムイメージ {#alternative-custom-image}

依存関係が多い場合、システムパッケージが必要な場合、あるいは起動を高速化したりオフラインで起動したい場合は、代わりにパッケージを独自のイメージに組み込んでください。

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

仮想環境の有効化は不要です。ベースイメージはすでに `PATH` と `VIRTUAL_ENV` を同梱の Ansible venv に設定し、その venv を所有する `semaphore` ユーザーに切り替えています。そのため、派生イメージの `pip3` は venv の pip に解決され、起動時フックとまったく同じようにそこにインストールされます。

同じ方法は、`semaphoreui/runner` をベースイメージとして使用する場合にも機能します。
