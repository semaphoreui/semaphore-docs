
# Kerberos 認証

Semaphore は、**WinRM 経由で Windows ホスト**に対して playbook を実行する際の Kerberos 認証をサポートしています。

## インベントリの設定 {#inventory-configuration}

```ini
[windows]
hostname

[windows:vars]
ansible_port=5985
ansible_connection=winrm
ansible_winrm_server_cert_validation=ignore
ansible_winrm_transport=ntlm
ansible_winrm_kinit_mode=managed
ansible_winrm_scheme=http
```

また、次の点を確認してください。

* ユーザー名とパスワードが提供されていること (Semaphore の認証情報)
* 必要に応じて、ユーザーの形式が `domain\\username` (例: `CORP\\admin`) であること

重要な設定は次の項目です。

```ini
ansible_winrm_kinit_mode=managed
```

これにより、kinit を手動で実行することなく、指定したユーザー名/パスワードを使用して Ansible が **Kerberos チケットを自動的に取得**するようになります。


##  Playbook の例 {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

これは WinRM + Kerberos による基本的な接続性を確認します。


## Semaphore UI ホストの要件 {#semaphore-ui-host-requirements}

Semaphore ホストに次のパッケージをインストールします。

```bash
sudo apt install libkrb5-dev krb5-user
```

次に `/etc/krb5.conf` を編集し、デフォルトレルム (ドメイン名) を設定します。

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

これは Active Directory のドメインと一致している必要があります。

## 注意事項 {#notes}

* kinit を手動で実行する必要はありません。`ansible_winrm_kinit_mode=managed` が設定されている場合、Ansible がチケットの取得を処理します。

* デフォルトの NTLM トランスポートで動作します (HTTP と `cert_validation=ignore` を使用する場合、SSL は不要です)。
