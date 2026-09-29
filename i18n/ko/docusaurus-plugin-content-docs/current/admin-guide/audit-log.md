---
title: 감사 로그
description: 보안 감사 로그를 활성화하고 기록되는 내용을 이해하며 Semaphore Pro의 감사 이벤트를 TLS 기반 Syslog를 통해 SIEM으로 전송합니다.
---

# 감사 로그

감사 로그는 보안과 관련된 활동, 즉 누가 작업했는지, 무엇을 했는지, 어떤 객체에 영향을 주었는지,
요청이 어디에서 왔는지, 성공했는지를 기록합니다. 운영자는 변경 사항을 조사하는 데 이 로그를 사용하고,
보안 팀은 문서화된 이벤트 형식을 탐지 규칙과 규정 준수 증거에 활용합니다.

감사 이벤트 캡처와 로컬 저장은 Semaphore Community에서 사용할 수 있습니다. Semaphore Pro에서는 캡처한
이벤트를 보안 정보 및 이벤트 관리(SIEM) 시스템으로 전송할 수도 있습니다.

## 다른 로그와의 차이 {#log-types}

| 로그 | 용도 |
| --- | --- |
| 서버 로그 | Semaphore의 시작, 구성 및 런타임 오류를 진단합니다. |
| 활동 로그 | 프로젝트 사용자에게 프로젝트 활동 피드를 제공합니다. |
| 작업 로그 및 이력 | 작업 실행, 상태 및 출력을 검토합니다. |
| 감사 로그 | 설치 전반의 인증 및 관리 작업을 조사합니다. |

감사 로그는 [활동 로그](/admin-guide/logs#activity-log)와 별개입니다. 어느 한 로그를 활성화하거나 내보내도
다른 로그가 활성화되거나 내보내지지는 않습니다.

## 기록되는 내용 {#recorded-events}

현재 릴리스에서는 다음을 포함하여 지원되는 인증 및 ID 관리 이벤트를 기록합니다.

- 로그인 성공 및 실패, 로그아웃, TOTP 확인
- 거부된 API 토큰, 거부된 권한 및 차단된 교차 사이트 요청
- 사용자, 비밀번호, TOTP 등록, 외부 ID 및 API 토큰 변경
- 프로젝트 멤버십, 역할 및 템플릿 권한 변경
- 시스템 설정 및 Pro 라이선스 활성화 변경
- 서버와 함께 시작되는 감사 이벤트 캡처

로그인 성공은 사용자가 TOTP를 포함한 필수 인증 단계를 모두 완료한 후 기록됩니다.
사용 가능한 모든 이벤트와 이후 릴리스에 예정된 이벤트는
[감사 이벤트](/reference/audit-events)를 참고하세요.

## 이벤트에서 제외되는 민감한 데이터 {#sensitive-data}

감사 이벤트는 자격 증명이나 비밀 페이로드를 복사하지 않고 작업을 식별합니다. 비밀번호,
암호 코드, TOTP 비밀 및 QR 코드, 복구 코드, 세션 쿠키, 원시 토큰, OAuth 코드 및 클레임,
개인 키, 암호 문구, 비밀 값, 환경 및 설문 값, 웹훅 본문, 작업 출력, 저장소 URL은 제외됩니다.

API 토큰은 값이 아닌 지문으로 식별됩니다. 로그인 실패 이벤트에는 제출된 로그인 식별자가
64바이트로 잘려서 포함됩니다. 사용자가 이메일 주소로 로그인하는 경우 이 식별자에 이메일 주소가
포함될 수 있습니다.

## 감사 로그 활성화 {#enable}

설치에 사용할 안정적인 이름을 정한 다음 `config.json`에서 `audit.enabled`와 `audit.instance_id`를
설정합니다.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

인스턴스 ID는 공백 없이 인쇄 가능한 ASCII 문자 1~255자로 구성해야 합니다. 모든 이벤트에 이 ID가
표시되므로 SIEM에서 여러 Semaphore 설치를 구분할 수 있습니다.

환경 변수를 사용할 수도 있습니다.

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

변경 사항을 적용하려면 Semaphore를 다시 시작합니다. 다시 시작한 후부터 캡처가 시작되며 이전 활동은
감사 로그에 추가되지 않습니다. 첫 번째 이벤트는 작업이 `start`인 `audit.lifecycle`입니다.

모든 옵션과 환경 변수는
[구성 옵션](/reference/configuration#audit-log)을 참고하세요.

## 프록시 뒤의 클라이언트 주소 기록 {#trusted-proxies}

기본적으로 HTTP 감사 이벤트에는 Semaphore에 직접 연결한 주소가 기록됩니다. 해당 주소가
리버스 프록시인 경우 프록시 네트워크만 `audit.trusted_proxy_cidrs`에 추가합니다.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

또는 다음과 같이 설정합니다.

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore는 이 네트워크에서 들어온 `X-Forwarded-For`와 `X-Real-IP`만 신뢰합니다. 클라이언트 네트워크는
추가하지 마세요. 신뢰할 수 있는 네트워크의 클라이언트가 이벤트에 기록될 원본 주소를 임의로 지정할 수
있습니다. 여러 프록시가 `X-Forwarded-For`에 주소를 추가하는 경우 Semaphore는 신뢰할 수 있는 프록시가
아닌 주소 중 가장 오른쪽 주소를 기록합니다.

## 저장 및 제한 사항 {#storage}

Semaphore는 감사 이벤트를 데이터베이스에 저장합니다. 이 릴리스에는 감사 로그 뷰어, 감사 API, 자동
보존 또는 정리 기능이 없습니다. 데이터베이스 증가량을 모니터링하고 데이터베이스 백업 정책에 감사 데이터를
포함하세요.

감사 기록은 기록 대상 작업을 차단하지 않습니다. 이벤트 저장에 실패하면 Semaphore는 서버 로그에 오류를
기록하고 원래 작업을 계속합니다. 로컬 레코드는 Semaphore의 다른 데이터와 동일한 데이터베이스 접근 제어로
보호되며, 변경 불가능하거나 변조를 확인할 수 있는 형태는 아닙니다.

서버가 시작될 때마다 `audit.lifecycle/start`가 기록됩니다. 중지 이벤트는 없습니다. 종료, 충돌 또는
비활성화된 감사 로그는 이후 시작 이벤트 전까지 이벤트가 없는 기간으로 나타납니다.

## SIEM으로 내보내기 <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro는 성공적으로 캡처한 이벤트를 rsyslog 또는 Vector와 같은 기존 TLS Syslog 수신기로
전송할 수 있습니다. 수신기는 이벤트를 저장하거나 SIEM으로 전달할 수 있습니다.

시작하기 전에 다음을 준비하세요.

- 수신기의 호스트 이름과 포트
- `security-syslog`와 같은 안정적인 대상 ID
- 수신기 인증서에 서명한 CA 인증서. Semaphore 호스트에서 해당 CA를 아직 신뢰하지 않는 경우 필요합니다.

`config.json`에 `audit.syslog`를 추가합니다.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

또는 환경 변수를 사용합니다.

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id`와 `address`는 필수입니다. 수신기 주소나 인증서를 변경할 때도 동일한 ID를 유지해야 Semaphore가
저장된 위치부터 전송을 재개합니다. 새 ID는 해당 대상이 초기화된 이후에 기록된 이벤트부터 시작하며,
그 시점에 이미 저장된 이벤트는 전송되지 않습니다.

`ca_file`은 시스템 신뢰 저장소에 인증서를 추가합니다. `server_name`은 수신기 인증서에서 확인할 호스트
이름을 재정의합니다. Semaphore는 TLS 1.2 이상을 요구하며 항상 서버 인증서를 검증합니다. 이 연결에서는
검증을 비활성화하거나 클라이언트 인증서를 사용할 수 없습니다.

Semaphore를 다시 시작합니다. 대상 설정이 잘못되었거나 CA 파일을 읽을 수 없으면 Semaphore가 시작되지
않습니다.

### 전송 확인 {#verify-siem-delivery}

다시 시작한 후 수신기에서 새 이벤트를 찾아 다음을 확인합니다.

- `event_code`가 `audit.lifecycle`입니다.
- `action`이 `start`입니다.
- `outcome`이 `success`입니다.
- `instance_id`가 구성한 설치 이름과 일치합니다.
- `metadata.destinations`에 대상 ID가 포함되어 있습니다.

### 전송 동작 {#delivery}

- 수신기를 사용할 수 없으면 Semaphore는 캡처한 이벤트를 로컬에 보관하고 수신기가 복구되었을 때 다시
  전송합니다. 사용자 요청은 정상적으로 계속 처리됩니다.
- Syslog 전송은 최선 노력 방식입니다. 연결 실패가 Semaphore에 통지되지 않은 상태에서 연결에 기록된
  이벤트는 유실될 수 있습니다.
- 네트워크 오류, 재시작 및 HA 장애 조치로 인해 이벤트가 중복 전송될 수 있습니다. `event_id`로 중복을
  제거하고 `seq`로 이벤트를 정렬하세요.
- [HA 설치](/admin-guide/ha)에서는 일반적으로 한 번에 하나의 노드가 대상으로 전송합니다. Redis를 사용할 수
  없으면 내보내기는 일시 중지되지만 공유 데이터베이스에서 캡처는 계속됩니다.

Semaphore는 TLS와 옥텟 수 기반 프레이밍을 사용하여 RFC 5424 메시지를 전송합니다. 메시지 본문에는 감사
이벤트 JSON이 포함됩니다. `HOSTNAME`은 HA 노드 ID이며 단일 노드에서는 인스턴스 ID입니다. `MSGID`는
`event_code`입니다.

### rsyslog 수신기 예시 {#rsyslog}

다음 rsyslog 구성 조각은 TLS 연결을 수락하고 한 줄에 하나의 이벤트 JSON 객체를 기록합니다.

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Vector 수신기 예시 {#vector}

다음 Vector 구성은 TLS 연결을 수락하고 이벤트 JSON을 파싱하여 파일에 기록합니다.

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### 내보내기 문제 해결 {#troubleshoot-export}

- Semaphore가 시작되지 않으면 `audit.syslog.id`와 `audit.syslog.address`가 모두 설정되어 있는지,
  CA 파일에 읽을 수 있는 PEM 인증서가 포함되어 있는지 확인합니다.
- TLS에 실패하면 수신기 인증서가 `server_name`에 유효하며 시스템 CA 또는 구성된 CA까지 인증서 체인이
  이어지는지 확인합니다.
- 이벤트가 아직 도착하지 않았다면 Semaphore 서버 로그와 수신기 수집 로그를 확인합니다. 내보내기는 실패 후
  일정 시간 기다렸다가 다시 시도합니다.
- 이벤트가 두 번 나타나면 `event_id`로 중복을 제거합니다. 일부 재시도와 장애 조치 후에는 중복이 발생할 수
  있습니다.

## 감사 범위에 포함되지 않는 작업 {#not-recorded}

`semaphore` 명령은 데이터베이스를 직접 변경하므로 `user add`와 `user token` 같은 서버 측 CLI 작업은
기록되지 않습니다. 서버와 데이터베이스에 대한 접근은 별도로 제어해야 합니다.

이 릴리스에는 라이선스 제거, 앱 런타임 설정, HA 작업 상태 지우기, Terraform 인벤토리 별칭,
워크플로 실행 또는 프로젝트 초대에 대한 감사 이벤트도 없습니다.
[이벤트 카탈로그](/reference/audit-events)에는 이후 릴리스에 예정된 이벤트가 표시됩니다.

## 다음 단계 {#whats-next}

- [감사 이벤트](/reference/audit-events) — 이벤트 필드, 사용 가능한 이벤트와 예정된 이벤트 및 규정 준수 범위.
- [구성 옵션](/reference/configuration#audit-log) — 모든 `audit.*` 옵션과 환경 변수.
- [로그](/admin-guide/logs) — 서버, 활동 및 작업 로그.
