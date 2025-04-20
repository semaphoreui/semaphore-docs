# Kerberos authentication (Ansible + WinRM)

Semaphore supports Kerberos authentication when running playbooks against Windows hosts via WinRM.

## Inventory configuration

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

Also make sure:

* A username and password are provided (Semaphore credentials)
* The user format is `domain\\username` (e.g., `CORP\\admin`) if needed

The key setting is:

```ini
ansible_winrm_kinit_mode=managed
```

This tells Ansible to **automatically acquire a Kerberos ticket** using the provided username/password without requiring you to manually run kinit.


##  Example Playbook

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

This verifies basic connectivity using WinRM + Kerberos.


## Semaphore UI host requirements

On the Semaphore host, install the following packages:

```bash
sudo apt install libkrb5-dev krb5-user
```

Then edit `/etc/krb5.conf` and set your default realm (domain name):

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

This must match your Active Directory domain.

## Notes

* You do not need to run kinit manually — Ansible handles ticket acquisition when `ansible_winrm_kinit_mode=managed` is set.

* Works with the default NTLM transport (no SSL needed if using HTTP and `cert_validation=ignore`).