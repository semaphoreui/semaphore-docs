
# Kerberos 认证

当通过 **WinRM 针对 Windows 主机**运行剧本时，Semaphore 支持 Kerberos 认证。

## 清单配置 {#inventory-configuration}

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

另外请确保：

* 已提供用户名和密码（Semaphore 凭据）
* 如有需要，用户格式为 `domain\\username`（例如 `CORP\\admin`）

关键设置是：

```ini
ansible_winrm_kinit_mode=managed
```

它告诉 Ansible 使用提供的用户名/密码**自动获取 Kerberos 票据**，无需你手动运行 kinit。


##  示例剧本 {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

这会使用 WinRM + Kerberos 验证基本连通性。


## Semaphore UI 主机要求 {#semaphore-ui-host-requirements}

在 Semaphore 主机上安装以下软件包：

```bash
sudo apt install libkrb5-dev krb5-user
```

然后编辑 `/etc/krb5.conf`，设置你的默认 realm（域名）：

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

它必须与你的 Active Directory 域一致。

## 说明 {#notes}

* 你无需手动运行 kinit——设置了 `ansible_winrm_kinit_mode=managed` 后，Ansible 会负责获取票据。

* 可与默认的 NTLM 传输方式配合使用（如果使用 HTTP 且 `cert_validation=ignore`，则无需 SSL）。
