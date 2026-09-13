
# Autenticação Kerberos

O Semaphore oferece suporte à autenticação Kerberos ao executar playbooks em **hosts Windows via WinRM**.

## Configuração do inventário {#inventory-configuration}

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

Certifique-se também de que:

* Um nome de usuário e uma senha sejam fornecidos (credenciais do Semaphore)
* O formato do usuário seja `domain\\username` (por exemplo, `CORP\\admin`), se necessário

A configuração principal é:

```ini
ansible_winrm_kinit_mode=managed
```

Isso instrui o Ansible a **obter automaticamente um ticket Kerberos** usando o nome de usuário/senha fornecidos, sem exigir que você execute o kinit manualmente.


##  Exemplo de Playbook {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

Isso verifica a conectividade básica usando WinRM + Kerberos.


## Requisitos do host do Semaphore UI {#semaphore-ui-host-requirements}

No host do Semaphore, instale os seguintes pacotes:

```bash
sudo apt install libkrb5-dev krb5-user
```

Em seguida, edite `/etc/krb5.conf` e defina seu realm padrão (nome do domínio):

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

Isso deve corresponder ao seu domínio do Active Directory.

## Observações {#notes}

* Você não precisa executar o kinit manualmente — o Ansible cuida da obtenção do ticket quando `ansible_winrm_kinit_mode=managed` está definido.

* Funciona com o transporte NTLM padrão (não é necessário SSL se estiver usando HTTP e `cert_validation=ignore`).
