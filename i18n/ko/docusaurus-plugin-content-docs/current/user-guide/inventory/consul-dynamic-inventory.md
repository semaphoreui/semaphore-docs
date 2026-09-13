# Semaphore에서 Consul 동적 인벤토리 사용하기

![Ansible 배지](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Consul 배지](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## 개요 {#overview}

이 가이드에서는 [HashiCorp Consul](https://www.consul.io/)을 Semaphore의 동적 인벤토리 소스로 사용하는 방법을 설명합니다. 호스트를 수동으로 나열하는 대신, Ansible이 런타임에 Consul 카탈로그를 조회하여 대상 호스트를 검색합니다.

이 방식은 git 저장소에 커밋된 **Python 인벤토리 스크립트**를 사용합니다. Semaphore는 playbook을 실행할 때 이 스크립트를 자동으로 실행합니다.

## 사전 요구 사항 {#prerequisites}

- 노드가 등록된 실행 중인 Consul 클러스터
- 카탈로그 읽기 권한이 있는 Consul ACL token *([ACL](https://developer.hashicorp.com/consul/docs/security/acl)이 활성화된 경우에만)*
- Semaphore 호스트(또는 runner)에 설치된 Python 3
- playbook과 인벤토리 스크립트를 저장할 git 저장소

## 1단계 — 인벤토리 스크립트 생성 {#step-1--create-the-inventory-script}

저장소에 `inventory/consul_inventory.py` 파일을 생성합니다. 이 스크립트는 Consul HTTP API를 조회하고 Ansible이 기대하는 형식으로 호스트 정보를 반환합니다.

```python
#!/usr/bin/env python3
"""
Consul dynamic inventory for Ansible.
Groups nodes by node_meta values and filters out unhealthy nodes.
"""

import json
import os
import sys
import urllib.request
import ssl

CONSUL_ADDR = os.environ.get("CONSUL_HTTP_ADDR", "https://consul.example.com")
CONSUL_TOKEN = os.environ.get("CONSUL_HTTP_TOKEN", "")


def consul_get(path):
    url = f"{CONSUL_ADDR}/v1/{path}"
    req = urllib.request.Request(url)
    if CONSUL_TOKEN:
        req.add_header("X-Consul-Token", CONSUL_TOKEN)
    ctx = ssl.create_default_context()
    with urllib.request.urlopen(req, context=ctx) as resp:
        return json.loads(resp.read())


def is_healthy(node_name):
    """Return True if the node has a passing serfHealth check."""
    try:
        checks = consul_get(f"health/node/{node_name}")
        return any(
            c["CheckID"] == "serfHealth" and c["Status"] == "passing"
            for c in checks
        )
    except Exception:
        return False


def build_inventory():
    inventory = {"_meta": {"hostvars": {}}}
    all_hosts = []

    for node in consul_get("catalog/nodes"):
        name = node["Node"]

        if not is_healthy(name):
            continue

        all_hosts.append(name)
        inventory["_meta"]["hostvars"][name] = {
            "ansible_host": node["Address"],
            "ansible_user": "your_ssh_user",
            "ansible_python_interpreter": "/usr/bin/python3",
        }

    inventory["all"] = {"hosts": all_hosts}
    return inventory


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--host":
        print(json.dumps({}))
    else:
        print(json.dumps(build_inventory(), indent=2))
```

스크립트에 실행 권한을 부여합니다:

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
이 스크립트를 수정하여 Consul 노드 메타데이터, 서비스 태그 또는 데이터센터별로 호스트를 그룹화할 수 있습니다. 위의 예시는 최소한의 시작점입니다.
:::

## 2단계 — 저장소 설정 {#step-2--set-up-your-repository}

저장소는 다음과 같은 구조여야 합니다:

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
이 방식은 Python 표준 라이브러리만 사용하여 Consul API를 직접 조회합니다. 인벤토리 스크립트가 작동하는 데 추가 Ansible 컬렉션은 필요하지 않습니다.
:::

간단한 테스트 playbook(`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

이 저장소를 git 제공자에 푸시합니다.

## 3단계 — Semaphore 구성 {#step-3--configure-semaphore}

### 변수 그룹 추가 {#add-a-variable-group}

인벤토리 스크립트는 환경 변수에서 Consul 주소와 token을 읽습니다. 이 값들을 전달하기 위해 Semaphore에서 변수 그룹을 생성합니다.

1. 프로젝트로 이동하여 **변수 그룹**을 클릭합니다
2. **새 변수 그룹**을 클릭합니다
3. 이름을 지정합니다(예: `consul-inventory`)
4. **환경 변수** 아래에 다음을 추가합니다:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(Consul 클러스터에서 [ACL](https://developer.hashicorp.com/consul/docs/security/acl)이 활성화된 경우에만 필요)*
5. **생성**을 클릭합니다

:::tip
Consul 클러스터에 ACL이 활성화되어 있지 않다면 `CONSUL_HTTP_TOKEN` 변수를 생략할 수 있습니다. 인벤토리 스크립트는 여전히 작동하며, 단지 API 요청에 인증 token을 보내지 않을 뿐입니다.
:::

### 저장소 추가 {#add-the-repository}

1. **저장소**로 이동하여 **새 저장소**를 클릭합니다
2. 저장소의 git URL을 입력합니다
3. git 제공자용 액세스 키를 선택합니다
4. **생성**을 클릭합니다

### 인벤토리 추가 {#add-the-inventory}

1. **인벤토리**로 이동하여 **새 인벤토리**를 클릭합니다
2. 이름을 지정합니다(예: `consul-dynamic-inventory`)
3. 유형으로 **파일**을 선택합니다
4. 경로를 입력합니다: `inventory/consul_inventory.py`
5. Ansible이 호스트에 연결할 때 사용할 SSH 키를 선택합니다
6. **생성**을 클릭합니다

:::note
경로는 git 저장소의 루트를 기준으로 한 상대 경로입니다. Semaphore는 저장소를 복제하고 이 경로를 `ansible-playbook -i inventory/consul_inventory.py`에 전달합니다.
:::

### 작업 템플릿 생성 {#create-a-task-template}

1. **작업 템플릿**으로 이동하여 **새 템플릿**을 클릭합니다
2. 이름을 지정합니다(예: `Consul Hello World`)
3. **Playbook**을 `playbook.yml`로 설정합니다
4. 위에서 생성한 저장소, 인벤토리, 변수 그룹을 선택합니다
5. **생성**을 클릭합니다

## 4단계 — 실행 {#step-4--run-it}

작업 템플릿에서 **실행**을 클릭합니다. Semaphore는 다음을 수행합니다:

1. 저장소를 복제합니다
2. Consul 인벤토리 스크립트를 사용하여 playbook을 실행합니다
3. 작업 로그에 출력을 표시합니다

다음과 같은 출력이 표시되어야 합니다:

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## 메타데이터로 호스트 그룹화하기 {#grouping-hosts-by-metadata}

Consul은 각 노드에 연결된 키-값 쌍인 [노드 메타데이터](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)를 지원합니다. 이를 사용하여 Ansible 그룹을 자동으로 생성할 수 있습니다.

스크립트의 `build_inventory()` 함수에서 호스트 변수를 설정한 후 다음을 추가합니다:

```python
        # Get node metadata
        node_detail = consul_get(f"catalog/node/{name}")
        meta = node_detail.get("Node", {}).get("Meta", {})

        # Group by metadata keys
        for key in ("role", "env", "os"):
            val = meta.get(key)
            if val:
                group = f"{key}_{val}"
                inventory.setdefault(group, {"hosts": []})
                inventory[group]["hosts"].append(name)
```

이렇게 하면 `role_webserver`, `env_production`, `os_ubuntu`와 같은 그룹이 생성됩니다. 그런 다음 playbook에서 이 그룹들을 대상으로 지정할 수 있습니다:

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## 추가 자료 {#further-reading}

- [Ansible 동적 인벤토리 문서](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [Consul 카탈로그 API](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Consul 노드 메타데이터](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
