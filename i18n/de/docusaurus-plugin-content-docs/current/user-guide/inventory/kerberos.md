
# Kerberos-Authentifizierung

Semaphore unterstützt Kerberos-Authentifizierung beim Ausführen von Playbooks gegen **Windows-Hosts über WinRM**.

## Inventory-Konfiguration {#inventory-configuration}

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

Stellen Sie außerdem sicher:

* Ein Benutzername und ein Passwort sind angegeben (Semaphore-Zugangsdaten)
* Das Benutzerformat ist bei Bedarf `domain\\username` (z. B. `CORP\\admin`)

Die entscheidende Einstellung ist:

```ini
ansible_winrm_kinit_mode=managed
```

Damit wird Ansible angewiesen, mit dem angegebenen Benutzernamen/Passwort **automatisch ein Kerberos-Ticket zu beziehen**, ohne dass Sie kinit manuell ausführen müssen.


##  Beispiel-Playbook {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

Damit wird die grundlegende Konnektivität über WinRM + Kerberos überprüft.


## Anforderungen an den Semaphore-UI-Host {#semaphore-ui-host-requirements}

Installieren Sie auf dem Semaphore-Host die folgenden Pakete:

```bash
sudo apt install libkrb5-dev krb5-user
```

Bearbeiten Sie anschließend `/etc/krb5.conf` und legen Sie Ihren Standard-Realm (Domainname) fest:

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

Dieser muss mit Ihrer Active-Directory-Domain übereinstimmen.

## Hinweise {#notes}

* Sie müssen kinit nicht manuell ausführen — Ansible übernimmt den Ticketbezug, wenn `ansible_winrm_kinit_mode=managed` gesetzt ist.

* Funktioniert mit dem Standard-NTLM-Transport (kein SSL erforderlich, wenn HTTP und `cert_validation=ignore` verwendet werden).
