
# Authentification Kerberos

Semaphore prend en charge l'authentification Kerberos lors de l'exécution de playbooks sur des **hôtes Windows via WinRM**.

## Configuration de l'inventaire {#inventory-configuration}

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

Assurez-vous également que :

* Un nom d'utilisateur et un mot de passe sont fournis (identifiants Semaphore)
* Le format de l'utilisateur est `domain\\username` (par exemple `CORP\\admin`) si nécessaire

Le paramètre essentiel est :

```ini
ansible_winrm_kinit_mode=managed
```

Il indique à Ansible d'**obtenir automatiquement un ticket Kerberos** à partir du nom d'utilisateur et du mot de passe fournis, sans que vous ayez à exécuter kinit manuellement.


##  Exemple de playbook {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

Ce playbook vérifie la connectivité de base via WinRM + Kerberos.


## Prérequis sur l'hôte Semaphore UI {#semaphore-ui-host-requirements}

Sur l'hôte Semaphore, installez les paquets suivants :

```bash
sudo apt install libkrb5-dev krb5-user
```

Modifiez ensuite `/etc/krb5.conf` et définissez votre realm par défaut (nom de domaine) :

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

Il doit correspondre à votre domaine Active Directory.

## Remarques {#notes}

* Vous n'avez pas besoin d'exécuter kinit manuellement : Ansible se charge de l'obtention du ticket lorsque `ansible_winrm_kinit_mode=managed` est défini.

* Fonctionne avec le transport NTLM par défaut (aucun SSL requis si vous utilisez HTTP et `cert_validation=ignore`).
