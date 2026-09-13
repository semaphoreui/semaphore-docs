# Semaphore と Netbox 動的インベントリの連携

![Ansible バッジ](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Netbox バッジ](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 主な機能 {#-key-features}

このリポジトリは、`netbox.netbox.nb_inventory` プラグインを使用して Semaphore で動的インベントリを作成する方法を示します。Netbox からのデータの自動同期が可能になり、インフラストラクチャの管理と Ansible playbook の実行が簡素化されます。

## 🔧 セットアップ {#-setup}

### 要件 {#requirements}

- Semaphore へのアクセス
- API が設定された Netbox へのアクセス

### 🔑 Netbox のセットアップ {#-netbox-setup}

Netbox が設定済みで、API 経由でアクセスできることを確認してください。リクエストの認証に使用する API トークンを取得します。

### 📡 Semaphore での設定 {#-configuration-in-semaphore}

1. Semaphore でインベントリセクションに移動します。
2. 新しいインベントリを作成します。
3. プラグイン設定として次の内容を入力します:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   `http://your_netbox_url_here` と `YOUR_NETBOX_API_TOKEN` を、お使いの Netbox の実際の値に置き換えてください。

## 🚀 使い方 {#-usage}

設定が完了すると、Netbox からホストデータを自動的に更新する動的インベントリを使用して、Semaphore で Ansible playbook を実行できます。

## 📚 関連ドキュメント {#-further-documentation}

`netbox.netbox.nb_inventory` プラグインとその機能の詳細については、[Ansible 公式ドキュメント](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html)を参照してください。
