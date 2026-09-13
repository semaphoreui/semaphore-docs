
# Autenticazione Kerberos

Semaphore supporta l'autenticazione Kerberos durante l'esecuzione di playbook su **host Windows tramite WinRM**.

## Configurazione dell'inventory {#inventory-configuration}

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

Assicurarsi inoltre che:

* Siano forniti un nome utente e una password (credenziali Semaphore)
* Il formato dell'utente sia `domain\\username` (ad es. `CORP\\admin`), se necessario

L'impostazione chiave è:

```ini
ansible_winrm_kinit_mode=managed
```

Questa indica ad Ansible di **acquisire automaticamente un ticket Kerberos** utilizzando il nome utente e la password forniti, senza dover eseguire manualmente kinit.


##  Playbook di esempio {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

Questo verifica la connettività di base tramite WinRM + Kerberos.


## Requisiti dell'host Semaphore UI {#semaphore-ui-host-requirements}

Sull'host Semaphore, installare i seguenti pacchetti:

```bash
sudo apt install libkrb5-dev krb5-user
```

Quindi modificare `/etc/krb5.conf` e impostare il realm predefinito (nome di dominio):

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

Deve corrispondere al dominio Active Directory.

## Note {#notes}

* Non è necessario eseguire kinit manualmente: Ansible gestisce l'acquisizione del ticket quando è impostato `ansible_winrm_kinit_mode=managed`.

* Funziona con il trasporto NTLM predefinito (SSL non necessario se si utilizza HTTP e `cert_validation=ignore`).
