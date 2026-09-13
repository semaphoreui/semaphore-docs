# Semaphore での Consul 動的インベントリ

![Ansible バッジ](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Consul バッジ](https://img.shields.io/badge/Consul-%23F24C53.svg?style=for-the-badge&logo=consul&logoColor=white)

## 概要 {#overview}

このガイドでは、[HashiCorp Consul](https://www.consul.io/) を Semaphore の動的インベントリソースとして使用する方法を説明します。ホストを手動で列挙する代わりに、Ansible が実行時に Consul のカタログに問い合わせて対象ホストを検出します。

この方法では、Git リポジトリにコミットした **Python インベントリスクリプト**を使用します。Semaphore は playbook の実行時にこのスクリプトを自動的に実行します。

## 前提条件 {#prerequisites}

- ノードが登録済みの稼働中の Consul クラスター
- カタログへの読み取りアクセス権を持つ Consul ACL トークン *([ACL](https://developer.hashicorp.com/consul/docs/security/acl) が有効な場合のみ)*
- Semaphore ホスト (または runner) にインストールされた Python 3
- playbook とインベントリスクリプトを保存する Git リポジトリ

## ステップ 1 — インベントリスクリプトの作成 {#step-1--create-the-inventory-script}

リポジトリに `inventory/consul_inventory.py` というファイルを作成します。このスクリプトは Consul の HTTP API に問い合わせ、Ansible が期待する形式でホスト情報を返します。

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

スクリプトに実行権限を付与します。

```bash
chmod +x inventory/consul_inventory.py
```

:::tip
このスクリプトは、Consul のノードメタデータ、サービスタグ、データセンターごとにホストをグループ化するようにカスタマイズできます。上記の例は最小限の出発点です。
:::

## ステップ 2 — リポジトリの準備 {#step-2--set-up-your-repository}

リポジトリは次のような構成になります。

```
my-project/
├── inventory/
│   └── consul_inventory.py
└── playbook.yml
```

:::note
この方法では、Python の標準ライブラリのみを使用して Consul API に直接問い合わせます。インベントリスクリプトを動作させるために追加の Ansible コレクションは必要ありません。
:::

簡単なテスト用 playbook (`playbook.yml`):

```yaml
- hosts: all
  gather_facts: false
  tasks:
    - name: Hello World
      ansible.builtin.debug:
        msg: "Hello from {{ inventory_hostname }}"
```

このリポジトリを Git プロバイダーにプッシュします。

## ステップ 3 — Semaphore の設定 {#step-3--configure-semaphore}

### 変数グループの追加 {#add-a-variable-group}

インベントリスクリプトは、Consul のアドレスとトークンを環境変数から読み取ります。これらの値を渡すために、Semaphore で変数グループを作成します。

1. プロジェクトに移動し、**変数グループ**をクリックします
2. **新しい変数グループ**をクリックします
3. 名前を付けます (例: `consul-inventory`)
4. **環境変数**に次を追加します:
   - `CONSUL_HTTP_ADDR` = `https://consul.example.com`
   - `CONSUL_HTTP_TOKEN` = `your-consul-acl-token` *(Consul クラスターで [ACL](https://developer.hashicorp.com/consul/docs/security/acl) が有効な場合のみ必要)*
5. **作成**をクリックします

:::tip
Consul クラスターで ACL が有効になっていない場合は、`CONSUL_HTTP_TOKEN` 変数を省略できます。インベントリスクリプトはそのまま動作し、API リクエストに認証トークンを送信しないだけです。
:::

### リポジトリの追加 {#add-the-repository}

1. **リポジトリ**に移動し、**新しいリポジトリ**をクリックします
2. リポジトリの Git URL を入力します
3. Git プロバイダー用のアクセスキーを選択します
4. **作成**をクリックします

### インベントリの追加 {#add-the-inventory}

1. **インベントリ**に移動し、**新しいインベントリ**をクリックします
2. 名前を付けます (例: `consul-dynamic-inventory`)
3. 種類として**ファイル**を選択します
4. パス `inventory/consul_inventory.py` を入力します
5. Ansible がホストへの接続に使用する SSH キーを選択します
6. **作成**をクリックします

:::note
パスは Git リポジトリのルートからの相対パスです。Semaphore はリポジトリをクローンし、このパスを `ansible-playbook -i inventory/consul_inventory.py` に渡します。
:::

### タスクテンプレートの作成 {#create-a-task-template}

1. **タスクテンプレート**に移動し、**新しいテンプレート**をクリックします
2. 名前を付けます (例: `Consul Hello World`)
3. **Playbook** に `playbook.yml` を設定します
4. 上で作成したリポジトリ、インベントリ、変数グループを選択します
5. **作成**をクリックします

## ステップ 4 — 実行 {#step-4--run-it}

タスクテンプレートで**実行**をクリックします。Semaphore は次の処理を行います。

1. リポジトリをクローンする
2. Consul インベントリスクリプトを使用して playbook を実行する
3. タスクログに出力を表示する

次のような出力が表示されるはずです。

```
TASK [Hello World] *************************************************************
ok: [node-01] => {
    "msg": "Hello from node-01"
}
ok: [node-02] => {
    "msg": "Hello from node-02"
}
```

## メタデータによるホストのグループ化 {#grouping-hosts-by-metadata}

Consul は[ノードメタデータ](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta) (各ノードに付与されるキーと値のペア) をサポートしています。これを利用して Ansible のグループを自動的に作成できます。

スクリプトの `build_inventory()` 関数内で、ホスト変数を設定した後に次のコードを追加します。

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

これにより、`role_webserver`、`env_production`、`os_ubuntu` のようなグループが作成されます。playbook でこれらを対象に指定できます。

```yaml
- hosts: role_webserver
  tasks:
    - name: Restart nginx
      ansible.builtin.service:
        name: nginx
        state: restarted
```

## 参考資料 {#further-reading}

- [Ansible 動的インベントリのドキュメント](https://docs.ansible.com/ansible/latest/inventory_guide/intro_dynamic_inventory.html)
- [Consul カタログ API](https://developer.hashicorp.com/consul/api-docs/catalog)
- [Consul ノードメタデータ](https://developer.hashicorp.com/consul/docs/agent/config/config-files#node_meta)
