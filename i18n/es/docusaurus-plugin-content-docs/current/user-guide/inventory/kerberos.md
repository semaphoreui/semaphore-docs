
# Autenticación Kerberos

Semaphore admite la autenticación Kerberos al ejecutar playbooks contra **hosts Windows mediante WinRM**.

## Configuración del inventario {#inventory-configuration}

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

Asegúrese también de que:

* Se proporcionan un nombre de usuario y una contraseña (credenciales de Semaphore)
* El formato del usuario es `domain\\username` (p. ej., `CORP\\admin`) si es necesario

El ajuste clave es:

```ini
ansible_winrm_kinit_mode=managed
```

Esto indica a Ansible que **obtenga automáticamente un ticket de Kerberos** usando el nombre de usuario y la contraseña proporcionados, sin necesidad de ejecutar kinit manualmente.


##  Playbook de ejemplo {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

Esto verifica la conectividad básica mediante WinRM + Kerberos.


## Requisitos del host de Semaphore UI {#semaphore-ui-host-requirements}

En el host de Semaphore, instale los siguientes paquetes:

```bash
sudo apt install libkrb5-dev krb5-user
```

A continuación, edite `/etc/krb5.conf` y establezca su realm predeterminado (nombre de dominio):

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

Debe coincidir con su dominio de Active Directory.

## Notas {#notes}

* No necesita ejecutar kinit manualmente: Ansible se encarga de obtener el ticket cuando `ansible_winrm_kinit_mode=managed` está configurado.

* Funciona con el transporte NTLM predeterminado (no se necesita SSL si se usa HTTP y `cert_validation=ignore`).