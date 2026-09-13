# Docker

&#x20;다음 내용으로 `docker-compose.yml` 파일을 생성합니다.

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

다음 기밀 변수를 지정해야 합니다.

* `MYSQL_PASSWORD` 및 `SEMAPHORE_DB_PASS` &mdash; MySQL 사용자의 비밀번호입니다.
* `SEMAPHORE_ADMIN_PASSWORD` &mdash; Semaphore 관리자 사용자의 비밀번호입니다.
* `SEMAPHORE_ACCESS_KEY_ENCRYPTION` &mdash; 데이터베이스의 액세스 키를 암호화하는 키입니다. 다음 명령으로 생성해야 합니다: `head -c32 /dev/urandom | base64`.

Docker Swarm을 사용하는 경우 자격 증명을 Compose 파일에 직접(그리고 일반적으로 환경 변수에도) 포함하지 말고 [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)를 사용하는 것을 강력히 권장합니다. Semaphore는 환경 변수 이름 끝에 `_FILE`을 붙여 환경 대신 파일에서 설정을 읽어오는 일반적인 Docker 컨테이너 패턴을 [지원](https://github.com/semaphoreui/semaphore/issues/1268)합니다. 예제는 [Docker 문서](https://docs.docker.com/engine/swarm/secrets/#use-secrets-in-compose)를 참조하십시오.

시크릿을 사용하는 간단한 예제:

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


구성된 데이터베이스(MySQL 또는 Postgres)와 함께 Semaphore를 시작하려면 다음 명령을 실행합니다.

```bash
docker-compose up
```

&#x20;Semaphore는 다음 URL에서 접속할 수 있습니다: [http://localhost:3000](http://localhost:3000).

## 추가 Python 의존성 설치 {#installing-additional-python-dependencies}

일부 Ansible 모듈, 컬렉션, Python 앱은 이미지에 포함되지 않은 추가 Python 패키지를 필요로 합니다.
서버 이미지(`semaphoreui/semaphore`)와 runner 이미지(`semaphoreui/runner`) 모두 컨테이너 시작 시 이를 자동으로 설치할 수 있습니다.

이 기능을 사용하려면:

1. Python 의존성을 담은 `requirements.txt` 파일을 생성합니다. [pip requirements 파일 형식](https://pip.pypa.io/en/stable/reference/requirements-file-format/)을 참조하십시오.
2. 이 파일을 구성 디렉터리 안의 `requirements.txt`로 컨테이너에 마운트합니다. 구성 디렉터리는 `SEMAPHORE_CONFIG_PATH`로 설정되며 기본값은 `/etc/semaphore`입니다.

`requirements.txt` 예제:

```
netaddr
pywinrm[kerberos]
hvac>=2.0
```

`docker-compose.yml` 수정 예제:

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

runner 컨테이너에도 동일하게 적용됩니다.

```yaml
services:
  runner:
    restart: unless-stopped
    image: semaphoreui/runner:latest
    volumes:
      - ./requirements.txt:/etc/semaphore/requirements.txt:ro
```

또는 단순한 `docker run`으로:

```bash
docker run -p 3000:3000 \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/semaphore:latest
```

### 동작 방식 {#how-it-works}

시작 시 컨테이너는 `${SEMAPHORE_CONFIG_PATH}/requirements.txt`가 있는지 확인합니다. 파일이 존재하면 다음을 실행합니다.

```bash
pip3 install --upgrade -r ${SEMAPHORE_CONFIG_PATH}/requirements.txt
```

파일이 없으면 컨테이너는 `No additional python dependencies to install`을 로그에 기록하고 계속 진행합니다.

유의할 점:

- **패키지는 Ansible 가상 환경에 설치됩니다.** 이미지는 번들된 Ansible venv를 `PATH`의 맨 앞에 두므로, `pip3`는 시스템 Python이 아닌 해당 venv에 설치합니다. 컨테이너에서 실행되는 Ansible과 Python 앱은 이 패키지를 인식합니다. `--break-system-packages`는 필요하지 않습니다.
- **설치는 첫 시작뿐 아니라 매번 시작할 때마다 실행됩니다.** 패키지는 컨테이너 재생성 간에 유지되지 않으므로, 새 파일 시스템으로 컨테이너를 재시작하면 다시 설치됩니다. 따라서 시작 시 PyPI(또는 구성한 인덱스)에 대한 네트워크 접근이 필요합니다.
- **설치에 실패하면 컨테이너가 중지됩니다.** `pip3`가 오류로 종료되면(패키지 이름 오타, 빌드 의존성 누락, 네트워크 없음 등) Semaphore가 시작되기 전에 컨테이너가 종료됩니다. pip 출력은 컨테이너 로그에서 확인하십시오.
- **컴파일이 필요한 패키지**(예: 일부 암호화 또는 데이터베이스 드라이버)는 이미지에 컴파일러가 포함되어 있지 않아 실패할 수 있습니다. wheel을 우선 사용하거나, 그런 패키지에 대해서는 사용자 정의 이미지를 빌드하십시오.

### 대안: 사용자 정의 이미지 {#alternative-custom-image}

의존성이 많거나, 시스템 패키지가 필요하거나, 더 빠른 오프라인 시작을 원한다면 대신 자체 이미지에 패키지를 포함시키십시오.

```dockerfile
FROM semaphoreui/semaphore:latest

COPY requirements.txt /tmp/requirements.txt
RUN pip3 install --no-cache-dir -r /tmp/requirements.txt
```

가상 환경을 별도로 활성화할 필요는 없습니다. 기본 이미지가 이미 `PATH`와 `VIRTUAL_ENV`를 번들된 Ansible venv로 설정하고, 해당 venv를 소유한 `semaphore` 사용자로 전환합니다. 따라서 파생 이미지의 `pip3`는 venv의 pip으로 해석되어 시작 훅과 동일하게 그곳에 설치합니다.

`semaphoreui/runner`를 기본 이미지로 사용할 때도 동일한 방식이 적용됩니다.
