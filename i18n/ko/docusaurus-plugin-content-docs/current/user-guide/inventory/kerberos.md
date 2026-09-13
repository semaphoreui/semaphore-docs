
# Kerberos 인증

Semaphore는 **WinRM을 통해 Windows 호스트**를 대상으로 playbook을 실행할 때 Kerberos 인증을 지원합니다.

## 인벤토리 구성 {#inventory-configuration}

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

또한 다음 사항을 확인하십시오:

* 사용자 이름과 비밀번호가 제공되어야 합니다(Semaphore 자격 증명)
* 필요한 경우 사용자 형식은 `domain\\username`이어야 합니다(예: `CORP\\admin`)

핵심 설정은 다음과 같습니다:

```ini
ansible_winrm_kinit_mode=managed
```

이 설정은 kinit을 수동으로 실행하지 않아도 제공된 사용자 이름/비밀번호를 사용하여 **Kerberos 티켓을 자동으로 획득**하도록 Ansible에 지시합니다.


##  예시 Playbook {#example-playbook}

```yaml
- hosts: all
  gather_facts: false

  tasks:
    - win_ping:
```

이 playbook은 WinRM + Kerberos를 사용한 기본 연결을 확인합니다.


## Semaphore UI 호스트 요구 사항 {#semaphore-ui-host-requirements}

Semaphore 호스트에 다음 패키지를 설치합니다:

```bash
sudo apt install libkrb5-dev krb5-user
```

그런 다음 `/etc/krb5.conf`를 편집하여 기본 영역(도메인 이름)을 설정합니다:

```ini
[libdefaults]
  default_realm = YOUR.DOMAIN.NAME
```

이 값은 Active Directory 도메인과 일치해야 합니다.

## 참고 사항 {#notes}

* kinit을 수동으로 실행할 필요가 없습니다. `ansible_winrm_kinit_mode=managed`가 설정되어 있으면 Ansible이 티켓 획득을 처리합니다.

* 기본 NTLM 전송 방식과 함께 작동합니다(HTTP와 `cert_validation=ignore`를 사용하는 경우 SSL이 필요하지 않습니다).