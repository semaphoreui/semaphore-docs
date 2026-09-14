# 로그

Semaphore는 서버 로그를 **stdout**에 기록하고, **Task** 로그와 **Activity** 로그를 **데이터베이스**에 저장합니다. 이를 통해 주요 로그 정보를 한곳에 모으고 로그 파일을 별도로 백업할 필요를 없앱니다. 파일 시스템에 저장되는 데이터는 캐시 데이터뿐입니다.

---

## 서버 로그 {#server-log}

Semaphore는 파일에 로그를 기록하지 않습니다. 대신 모든 애플리케이션 로그는 **stdout**에 기록됩니다.  
Semaphore가 systemd 서비스로 실행 중이라면 다음 명령으로 로그를 확인할 수 있습니다:

```bash
journalctl -u semaphore.service -f
```

Semaphore가 Docker 컨테이너에서 실행 중이라면 다음 명령으로 로그를 확인할 수 있습니다:
```
docker logs -f my-semaphore-container
```

이 명령은 로그를 실시간(스트리밍)으로 보여 줍니다.

---

## 활동 로그 {#activity-log}

활동 로그는 Semaphore에서 수행된 사용자 작업을 기록합니다. 예를 들면 다음과 같습니다:

- 리소스 추가 또는 제거(예: 템플릿, 인벤토리, 저장소).
- 팀 구성원 추가 또는 제거.

### Pro 버전 2.10 이상 <Pro /> {#pro-version-210-and-later}

**Semaphore Pro** 2.10 이상에서는 활동 로그와 Task 로그를 파일에 기록할 수 있습니다. 이 기능을 활성화하려면 `config.json`에 다음 설정을 추가합니다:

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


또는 다음 환경 변수를 사용하여 설정할 수도 있습니다:

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### 활동(이벤트) 로깅 옵션 {#activity-events-logging-options}

활동(이벤트) 로깅 옵션을 사용하면 Semaphore가 사용자 작업과 시스템 이벤트를 파일에 기록하는 방식을 구성할 수 있습니다. 이 설정은 이벤트 로깅의 활성화 여부, 로그 항목 형식, 세부 logger 구성 등 이벤트 로깅 동작을 제어합니다. 활성화하면 템플릿 생성, 팀 관리 등의 사용자 작업이 이 설정에 따라 지정된 로그 파일에 기록됩니다.

| 매개변수             | 환경 변수 | 설명           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | 파일로의 이벤트 로깅을 활성화합니다. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | 로그 레코드 형식. raw 형식은 비워 두고, JSON 형식은 `json`으로 설정합니다. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Logger 옵션](#logger-options). |

#### 작업 로깅 옵션 {#tasks-logging-options}

작업 로깅 옵션을 사용하면 Semaphore가 작업 실행 세부 정보를 파일에 기록하는 방식을 구성할 수 있습니다. 이 설정은 작업 시작, 완료, 실행 상태 등 작업 관련 이벤트의 로깅을 제어합니다. 활성화하면 모든 작업 실행과 그 결과가 이 설정에 따라 지정된 로그 파일에 기록되어, 작업 실행 이력에 대한 상세한 감사 추적을 제공합니다.

| 매개변수             | 환경 변수 | 설명           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | 파일로의 작업 로깅을 활성화합니다. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | 로그 레코드 형식. raw 형식은 비워 두고, JSON 형식은 `json`으로 설정합니다. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Logger 옵션](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Logger 옵션. |



#### Logger 옵션 {#logger-options}

| 매개변수             | 타입 | 설명           |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | 로그를 기록할 파일의 경로와 이름입니다. 백업 로그 파일은 같은 디렉터리에 보관됩니다. 비어 있으면 임시 디렉터리의 `processname`-lumberjack.log를 사용합니다. |
| `maxsize`      | Integer | 로그 파일이 회전(rotate)되기 전까지의 최대 크기(메가바이트)입니다. 기본값은 100메가바이트입니다. |
| `maxage`       | Integer | 파일 이름에 인코딩된 타임스탬프를 기준으로 오래된 로그 파일을 보관할 최대 일수입니다. 하루는 24시간으로 정의되며, 서머타임이나 윤초 등으로 인해 달력상의 날짜와 정확히 일치하지 않을 수 있습니다. 기본값은 오래된 로그 파일을 기간 기준으로 삭제하지 않는 것입니다. |
| `maxbackups`   | Integer | 보관할 오래된 로그 파일의 최대 개수입니다. 기본값은 모든 오래된 로그 파일을 보관하는 것입니다(단, MaxAge에 의해 삭제될 수는 있습니다). |
| `localtime`    | Boolean | 백업 파일의 타임스탬프 형식에 컴퓨터의 로컬 시간을 사용할지 여부를 결정합니다. 기본값은 UTC 시간을 사용하는 것입니다. |
| `compress`     | Boolean | 회전된 로그 파일을 gzip으로 압축할지 여부를 결정합니다. 기본값은 압축하지 않는 것입니다. |



파일의 각 줄은 다음 형식을 따릅니다:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## 작업 이력 {#task-history}

Semaphore는 작업 실행에 대한 정보를 데이터베이스에 저장합니다. 작업 이력은 실행된 모든 작업의 상태와 로그를 포함한 상세 정보를 제공합니다. 웹 인터페이스를 통해 작업을 실시간으로 모니터링하거나 과거 로그를 검토할 수 있습니다.

### 작업 보관 기간 설정 {#configuring-task-retention}

기본적으로 Semaphore는 모든 작업을 데이터베이스에 저장합니다. 많은 수의 작업을 실행하면 상당한 디스크 공간을 차지할 수 있습니다.

다음 방법 중 하나로 템플릿별로 보관할 작업 수를 설정할 수 있습니다:

1. **환경 변수**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **`config.json` 옵션**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

작업 수가 이 제한을 초과하면 가장 오래된 Task 로그부터 자동으로 삭제됩니다.

---

## Syslog 프로토콜 지원 <Enterprise /> {#syslog-protocol-support}

Semaphore는 장기 보관이나 중앙 집중식 모니터링을 위해 활동 로그와 작업 로그 항목을 외부 syslog 수집기로 전달할 수 있습니다. syslog 전달은 기본적으로 비활성화되어 있습니다.

`config.json`에서 syslog 지원을 설정합니다:

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

JSON 파일을 편집하고 싶지 않다면 환경 변수를 통해 같은 옵션을 사용할 수 있습니다:

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Syslog 옵션 {#syslog-options}

| 매개변수             | 환경 변수 | 설명           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | syslog 전달을 켜거나 끕니다. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | 수집기에 연결할 때 사용하는 프로토콜(예: `udp` 또는 `tcp`). |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | `host:port` 형식의 수집기 주소. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | 모든 메시지 앞에 붙는 선택적 식별자. |


이 값을 변경한 후에는 새 syslog 대상이 적용되도록 Semaphore 서비스를 재시작하십시오.

---

## SIEM 연동 <Enterprise /> {#siem-integration}

Semaphore 2.20 이상은 SIEM(Splunk, Elastic Security, QRadar, Wazuh 등)으로 전달하기에 적합한 보안 감사 추적을 기록합니다.

모든 감사 이벤트에는 작업을 수행한 사용자와 영향을 받은 객체 외에도 **action**(`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), **클라이언트 IP 주소**, **user agent**가 포함됩니다. 리소스 변경 외에도 Semaphore는 다음을 기록합니다:

- 로그인 성공(비밀번호, LDAP, OpenID), 로그아웃, 로그인 실패 시도, MFA 검증 실패.
- 사용자 계정 생성, 수정, 삭제 및 비밀번호 변경.
- API token 생성 및 삭제(짧은 token 접두사만 기록되며 비밀 값은 절대 기록되지 않습니다).

감사 이벤트를 SIEM으로 전달하는 방법은 세 가지입니다:

1. **Pull:** `/api/events`를 읽습니다([API 문서](/reference/api) 참고).
2. **파일 수집기:** 활동 로그 파일(Pro, 위 참고)을 활성화하고 Filebeat, Fluentd 또는 Splunk Universal Forwarder로 `events.log`(JSON 형식 권장)를 전송합니다.
3. **감사 webhook(Pro):** HTTPS를 통해 실시간으로 이벤트를 push합니다 — 일반 JSON 엔드포인트 또는 Splunk HTTP Event Collector를 사용할 수 있습니다.

### 감사 webhook {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

또는 환경 변수를 사용합니다:

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### 감사 webhook 옵션 {#audit-webhook-options}

| 매개변수             | 환경 변수 | 설명           |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | 감사 이벤트 전달을 켜거나 끕니다. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | 수신 엔드포인트의 전체 URL. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | 페이로드 형식: 일반 JSON은 비워 두고, Splunk HEC 봉투 형식은 `splunk_hec`을 지정합니다. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | 추가 HTTP 헤더(예: HEC token): `{"Authorization": "Splunk <token>"}`. |

전달은 비동기로 이루어집니다. 이벤트는 메모리 큐에 저장되고 백오프를 적용하여 최대 세 번까지 재시도되므로, 수신 서버를 사용할 수 없더라도 사용자 요청이 느려지거나 실패하지 않습니다. 수신 서버가 계속 다운되어 있으면 큐에 쌓인 이벤트는 서버 로그에 경고를 남기고 폐기됩니다.

## 요약 {#summary}

- **서버 로그:** stdout에 기록되며, systemd에서 실행 중이라면 `journalctl`로 확인할 수 있습니다.  
- **활동 및 작업 로그:** 모든 사용자 작업을 추적합니다. **Pro 2.10 이상**에서는 선택적으로 파일에 기록할 수 있습니다.  
- **작업 이력:** 실시간 및 과거 작업 실행 로그를 저장합니다. 보관 기간은 템플릿별로 설정할 수 있습니다.

이 지침을 따르면 저장 공간 사용량과 로그 보관 기간을 관리하면서 Semaphore UI 운영에 대한 적절한 가시성을 확보할 수 있습니다.
