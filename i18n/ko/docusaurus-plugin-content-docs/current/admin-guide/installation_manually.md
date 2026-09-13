# Semaphore 수동 설치

----

**목차:**

* [서비스 사용자](/admin-guide/installation_manually#service-user)
* [Python3](/admin-guide/installation_manually#python3)
* [Ansible 컬렉션 및 Role](/admin-guide/installation_manually#ansible-collections--roles)
* [리버스 프록시](/admin-guide/installation_manually#reverse-proxy)
* [Systemd 서비스](/admin-guide/installation_manually#extended-systemd-service)
* [문제 해결](/admin-guide/installation_manually#troubleshooting)

----

이 문서는 다음 설치 방법을 사용할 때 Semaphore를 설정하는 방법을 자세히 설명합니다.

* [패키지 관리자](/admin-guide/installation/package-manager)
* [바이너리 파일](/admin-guide/installation/binary-file)

Semaphore 소프트웨어 패키지는 Ansible을 성공적으로 실행하는 데 필요한 전체 시스템의 일부일 뿐입니다.

Python3 및 Ansible 실행 환경 역시 매우 중요합니다!

참고: 이 설정 로직을 대신 처리해 주거나 자체 Ansible Role의 기본 템플릿으로 사용할 수 있는 [기존 Ansible Galaxy Role](https://galaxy.ansible.com/search?deprecated=false&keywords=ansible%20semaphore&order_by=-relevance&page=1)이 있습니다!

----

## 서비스 사용자 {#service-user}

Semaphore는 `root` 사용자로 실행할 필요가 없으므로 그렇게 하지 않는 것이 좋습니다.

서비스 사용자를 사용할 때의 **이점**:
* 자체 사용자 구성을 가집니다
* 자체 환경을 가집니다
* 프로세스를 쉽게 식별할 수 있습니다
* 시스템 보안이 향상됩니다

`adduser`를 사용하여 수동으로 또는 [ansible.builtin.user](https://docs.ansible.com/ansible/latest/collections/ansible/builtin/user_module.html) 모듈을 사용하여 시스템 사용자를 생성할 수 있습니다.

이 문서에서는 다음을 가정합니다.
* 생성된 서비스 사용자의 이름은 `semaphore`입니다
* 셸은 `/bin/bash`로 설정되어 있습니다
* 홈 디렉터리는 `/home/semaphore`입니다

### 문제 해결 {#troubleshooting}

Semaphore의 Ansible 실행이 실패하는 경우 서비스 사용자의 컨텍스트에서 문제를 해결해야 합니다.

여러 방법이 있습니다.

* 전체 셸 세션을 해당 사용자의 컨텍스트로 전환합니다.

  ```bash
  sudo su --login semaphore
  ```

* 해당 사용자의 컨텍스트에서 단일 명령을 실행합니다.

  ```bash
  sudo --login -u semaphore <command>
  ```

----

## Python3 {#python3}

[Ansible](https://docs.ansible.com/ansible/latest/getting_started/index.html)은 [Python3](https://docs.python.org/3/) 프로그래밍 언어로 만들어졌습니다.

따라서 Ansible이 올바르게 동작하려면 Python3의 깔끔한 설정이 필수입니다.

먼저 시스템에 `python3`와 `python3-pip` 패키지가 설치되어 있는지 확인하십시오!

필요한 Python 모듈을 설치하는 방법은 여러 가지가 있습니다.
* 서비스 사용자의 컨텍스트에 설치
* 서비스 전용 [가상 환경](https://virtualenv.pypa.io/en/latest/)에 설치

### 요구 사항 {#requirements}

어느 방법이든 설치할 모듈을 지정하려면 `requirements.txt` 파일을 사용하는 것이 좋습니다.

`/home/semaphore/requirements.txt` 파일을 사용한다고 가정합니다.

내용 예제는 다음과 같습니다.

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

참고: 이 요구 사항도 주기적으로 업데이트해야 합니다!

이를 자동으로 수행하는 방법은 아래 서비스 예제에도 나와 있습니다.

### 사용자 컨텍스트의 모듈 {#modules-in-user-context}

**수동**:

```bash
sudo --login -u semaphore python3 -m pip install --user --upgrade -r /home/semaphore/requirements.txt
```

**Ansible 사용**:

```yaml
- name: Install requirements
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    extra_args: '--user --upgrade'
  become_user: 'semaphore'
```

### virtualenv의 모듈 {#modules-in-a-virtualenv}

virtualenv가 `/home/semaphore/venv`에 생성되었다고 가정합니다.

서비스 내에서 가상 환경이 활성화되어 있는지 확인하십시오! 이 역시 아래 서비스 예제에 나와 있습니다.

**수동**:
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

**Ansible 사용**:

```yaml
- name: Create virtual environment and install requirements into it
  ansible.builtin.pip:
    requirements: '/home/semaphore/requirements.txt'
    virtualenv: '/home/semaphore/venv'
    state: present  # or 'latest' to upgrade the requirements
```

#### 문제 해결 {#troubleshooting-1}

가상 환경을 사용할 때 Python3 문제가 발생하면 해당 컨텍스트로 전환하여 문제를 해결해야 합니다.

```bash
sudo su --login semaphore
source /home/semaphore/venv/bin/activate
# verify we are using python3 from inside the venv
which python3
> /home/semaphore/venv/bin/python3

# troubleshooting

deactivate
```

시스템 업그레이드 시 가상 환경이 손상되는 경우도 있습니다. 이런 경우 기존 가상 환경을 삭제하고 다시 생성하면 됩니다.

----

## Ansible 컬렉션 및 Role {#ansible-collections--roles}

태스크가 실행될 때마다 설치할 필요가 없도록 Ansible 모듈과 role을 미리 설치해 두는 것이 좋습니다!

### 요구 사항 {#requirements-1}

설치할 모듈을 지정하려면 `requirements.yml` 파일을 사용하는 것이 좋습니다.

`/home/semaphore/requirements.yml` 파일을 사용한다고 가정합니다.

내용 예제는 다음과 같습니다.

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

참고: [컬렉션 설치](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-a-collection-from-galaxy), [Role 설치](https://docs.ansible.com/ansible/latest/galaxy/user_guide.html#installing-multiple-roles-from-a-file)

참고: 이 요구 사항도 주기적으로 업데이트해야 합니다!

이를 자동으로 수행하는 방법은 아래 서비스 예제에도 나와 있습니다.

### 사용자 컨텍스트에 설치 {#install-in-user-context}

**수동**:
```bash
sudo su --login semaphore
ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml
ansible-galaxy role install --force -r /home/semaphore/requirements.yml
```

### virtualenv 사용 시 설치 {#install-when-using-a-virtualenv}

**수동**:
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

## 리버스 프록시 {#reverse-proxy}

참조: [보안 - 암호화된 연결](/admin-guide/security/network#reverse-proxy)

----

## 확장 Systemd 서비스 {#extended-systemd-service}

다음은 systemd 서비스의 기본 템플릿입니다.

추가 설정은 해당 `[PART]` 아래에 추가하십시오.

### 기본 {#base}

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

### 서비스 사용자 {#service-user-1}

```ini
[Service]
User=semaphore
Group=semaphore
```

----

### Python 모듈 {#python-modules}

#### 사용자 컨텍스트에서 {#in-user-context}

```ini
[Service]
# to auto-upgrade python modules at service startup
ExecStartPre=/bin/bash -c 'python3 -m pip install --upgrade --user -r /home/semaphore/requirements.txt'

# so the executables are found
Environment="PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/semaphore/.local/bin"
# set the correct python path. You can get the correct path with: python3 -c "import site; print(site.USER_SITE)" 
Environment="PYTHONPATH=/home/semaphore/.local/lib/python3.10/site-packages"
```

#### virtualenv에서 {#in-virtualenv}

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

### Ansible 컬렉션 및 Role {#ansible-collections--roles-1}

#### 사용자 컨텍스트에서 Python3를 사용하는 경우 {#if-using-python3-in-user-context}

```ini
[Service]
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml'
ExecStartPre=/bin/bash -c 'ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

#### virtualenv에서 Python3를 사용하는 경우 {#if-using-python3-in-virtualenv}

```ini
# to auto-upgrade ansible collections and roles at service startup
ExecStartPre=/bin/bash -c 'source /home/semaphore/venv/bin/activate \
                           && ansible-galaxy collection install --upgrade -r /home/semaphore/requirements.yml \
                           && ansible-galaxy role install --force -r /home/semaphore/requirements.yml'
```

----

### 기타 사용 사례 {#other-use-cases}

#### 로컬 MariaDB 사용 {#using-local-mariadb}

```ini
[Unit]
Requires=mariadb.service
```

#### 로컬 Nginx 사용 {#using-local-nginx}

```ini
[Unit]
Wants=nginx.service
```

#### syslog로 로그 전송 {#sending-logs-to-syslog}

```ini
[Service]
StandardOutput=journal
StandardError=journal
SyslogIdentifier=semaphore
```

### 전체 예제 {#full-examples}

#### 사용자 컨텍스트의 Python 모듈 {#python-modules-in-user-context}

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

#### virtualenv의 Python 모듈 {#python-modules-in-virtualenv}

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

### 수정 사항 {#fixes}

시스템 언어를 사용자 정의로 설정한 경우 문제가 발생할 수 있으며, 관련 환경 변수를 업데이트하여 해결할 수 있습니다.

```ini
[Service]
Environment=LANG="en_US.UTF-8"
Environment=LC_ALL="en_US.UTF-8"
```

----

## 문제 해결 {#troubleshooting-2}

태스크 실행 중 문제가 발생하면 Semaphore 자체의 문제가 아니라 설정 환경의 문제일 수 있습니다!

문제가 Semaphore 외부에서 발생하는지 확인하려면 다음 단계를 진행하십시오.

- 해당 사용자의 컨텍스트로 전환합니다.

  ```bash
  sudo su --login semaphore
  ```

- virtualenv를 사용하는 경우 해당 컨텍스트로 전환합니다.

  ```ini
  source /home/semaphore/venv/bin/activate
  # verify we are using python3 from inside the venv
  which python3
  > /home/semaphore/venv/bin/python3
  
  # troubleshooting
  
  deactivate
  ```

- Ansible playbook을 수동으로 실행합니다.

  - **실패**하면 => 환경에 문제가 있는 것입니다
  - **성공**하면:
    - Semaphore 내부의 구성을 다시 확인하십시오
    - Semaphore의 문제일 수 있습니다
