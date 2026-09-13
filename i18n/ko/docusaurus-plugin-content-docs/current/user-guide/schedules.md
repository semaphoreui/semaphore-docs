# 스케줄

Semaphore의 스케줄 기능을 사용하면 템플릿 실행(예: playbook 실행)을 미리 정의된 간격으로 자동화할 수 있습니다. 이 기능을 통해 정기 백업, 컴플라이언스 점검, 시스템 업데이트 등과 같은 일상적인 자동화 작업을 구현할 수 있습니다.

변경 사항을 적용하려면 변경 후 Semaphore 서비스를 반드시 재시작해야 합니다.

[//]: # (## Setup and configuration)

## 시간대 설정 {#timezone-configuration}

기본적으로 스케줄 기능은 UTC 시간대로 동작합니다. 하지만 로컬 시간대나 특정 요구 사항에 맞게 변경할 수 있습니다.

설정 파일을 수정하거나 환경 변수를 설정하여 시간대를 변경할 수 있습니다:

1. **설정 파일 사용**:  
    Semaphore 설정 파일에 `timezone` 필드를 추가하거나 수정합니다:
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **환경 변수 사용**:  
    `SEMAPHORE_SCHEDULE_TIMEZONE` 환경 변수를 설정합니다:
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

유효한 시간대 값 목록은 [IANA Time Zone Database](https://www.iana.org/time-zones)를 참고하십시오.

### 스케줄 기능 접근하기 {#accessing-the-schedule-feature}

1. Semaphore 웹 인터페이스에 로그인합니다
2. 메인 내비게이션 메뉴에서 "Schedule" 탭으로 이동합니다
3. 오른쪽 상단의 "New Schedule" 버튼을 클릭하여 새 스케줄을 생성합니다

![](/assets/schedule01.png)

### 새 스케줄 생성하기 {#creating-a-new-schedule}

새 스케줄을 생성할 때 다음 옵션을 설정해야 합니다:

| 필드 | 설명 |
|-------|-------------|
| Name | 예약된 작업을 설명하는 이름 |
| Template | 실행할 특정 작업 템플릿 |
| Timing | 더 유연한 설정을 위한 cron 형식 또는 일반적인 간격을 위한 내장 옵션 |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### Cron 형식 문법 {#cron-format-syntax}

스케줄은 다섯 개의 필드로 구성된 표준 cron 문법을 사용합니다:

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

예시:
- `*/15 * * * *` - 15분마다 실행
- `0 2 * * *` - 매일 오전 2시에 실행
- `0 0 * * 0` - 매주 일요일 자정에 실행
- `0 9 1 * *` - 매월 1일 오전 9시에 실행

매우 유용한 cron 표현식 생성기: [https://crontab.guru/](https://crontab.guru/)

## 활용 사례 {#use-cases}

### 시스템 유지 관리 {#system-maintenance}

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

이 playbook을 업무 외 시간에 매주 실행되도록 예약하여 시스템을 항상 최신 상태로 유지할 수 있습니다.

### 백업 작업 {#backup-operations}

서로 다른 주기로 데이터베이스 백업 스케줄을 생성합니다:
- 일주일간 보관하는 일간 백업
- 한 달간 보관하는 주간 백업
- 일 년간 보관하는 월간 백업

### 컴플라이언스 점검 {#compliance-checks}

시스템이 보안 요구 사항을 충족하는지 확인하기 위해 정기적인 컴플라이언스 스캔을 예약합니다:

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### 환경 프로비저닝 및 정리 {#environment-provisioning-and-cleanup}

개발 또는 테스트 환경에 적합합니다. 비용을 최적화하기 위해 아침에 클라우드 환경을 생성하고 저녁에 해체하도록 예약합니다.

## 모범 사례 {#best-practices}

* 기능과 실행 시점을 모두 나타내는 설명적인 스케줄 이름을 사용하십시오 (예: "Weekly-Backup-Sunday-2AM")
* 리소스를 많이 사용하는 작업을 동시에 너무 많이 예약하지 마십시오
* 오래 실행되는 예약 작업이 다른 스케줄에 미치는 영향을 고려하십시오
* 긴 간격의 운영 스케줄을 설정하기 전에 짧은 간격으로 스케줄을 테스트하십시오
* 예약 작업의 목적과 기대 결과를 문서화하십시오

---

## 작업 파라미터 {#task-parameters}

스케줄은 작업에 파라미터를 전달할 수 있습니다. 템플릿에서 필요한 필드의 프롬프트를 활성화한 다음, 스케줄 설정에서 파라미터 값을 정의하면 각 실행마다 원하는 재정의 값(예: 브랜치, 변수, 플래그)이 전달됩니다.
