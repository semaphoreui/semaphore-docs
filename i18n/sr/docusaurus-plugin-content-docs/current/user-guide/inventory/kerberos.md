
# Kerberos autentifikacija

Semaphore podržava Kerberos autentifikaciju pri pokretanju playbook-ova na **Windows hostovima preko WinRM-a**.

## Konfiguracija inventara {#inventory-configuration}

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

Takođe proverite:

* Da su uneti korisničko ime i lozinka (Semaphore pristupni podaci)
* Da je format korisnika `domain\\username` (npr. `CORP\\admin`) ako je potrebno

Ključno podešavanje je:

```ini
ansible_winrm_kinit_mode=managed
```

Ovo govori Ansible-u da **automatski pribavi Kerberos tiket** pomoću unetog korisničkog imena/lozinke, bez potrebe da ručno pokrećete kinit.


##  Primer playbook-a {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

Ovim se proverava osnovna povezanost pomoću WinRM + Kerberos.


## Zahtevi za Semaphore UI host {#semaphore-ui-host-requirements}

Na Semaphore hostu instalirajte sledeće pakete:

```bash
sudo apt install libkrb5-dev krb5-user
```

Zatim izmenite `/etc/krb5.conf` i podesite podrazumevani realm (naziv domena):

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

Ovo mora da odgovara vašem Active Directory domenu.

## Napomene {#notes}

* Ne morate ručno pokretati kinit — Ansible se brine o pribavljanju tiketa kada je podešeno `ansible_winrm_kinit_mode=managed`.

* Radi sa podrazumevanim NTLM transportom (SSL nije potreban ako se koristi HTTP i `cert_validation=ignore`).
