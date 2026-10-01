---
title: 감사 로그
description: 감사 로그를 켜서 Semaphore에서 누가 무엇을 했는지 확인하고, Semaphore Pro에서 감사 이벤트를 SIEM으로 보냅니다.
---

# 감사 로그

감사 로그는 Semaphore의 중요한 작업을 기록합니다. 누가 로그인했는지, 누가 사용자나 역할을 변경했는지, 누가 API 토큰을 만들었는지 등입니다. 각 이벤트에는 누가, 언제, 어떤 주소에서 작업했고 성공했는지가 담깁니다. 설치 환경에서 무슨 일이 있었는지 확인하거나, 이벤트를 SIEM으로 보내 다른 로그와 함께 보관할 수 있습니다.

감사 로그는 모든 에디션에서 사용할 수 있습니다. SIEM으로 이벤트를 보내려면 Semaphore Pro가 필요합니다.

## 기록되는 내용 {#recorded-events}

현재 Semaphore는 로그인, 계정, 프로젝트 활동을 기록합니다.

- 로그인, 실패한 로그인 시도, 로그아웃, 2단계 인증 확인
- 거부된 API 토큰, 거부된 요청, 차단된 교차 사이트 요청
- 사용자, 비밀번호, 2단계 인증, 외부 ID, API 토큰 변경
- 프로젝트 멤버, 역할, 템플릿 권한 변경
- 프로젝트, 인벤토리, 저장소, 템플릿, 스케줄, 통합, 호스트 설정, 환경, 자격 증명, 비밀 저장소 변경, 그리고 프로젝트 백업 내보내기와 복원
- 시스템 설정 변경과 Pro 라이선스 활성화
- 서버 시작

앞으로의 릴리스에서 이벤트가 더 추가됩니다. 전체 목록은 [감사 이벤트](/reference/audit-events)를 참고하세요.

비밀번호, 토큰, 비밀 값, 작업 출력은 감사 이벤트에 절대 포함되지 않습니다. API 토큰은 값 대신 지문으로 표시됩니다. 로그인에 실패하면 입력한 로그인 이름이 남으므로 이메일 주소가 포함될 수 있습니다.

저장소 URL, 호스트 설정 URL, 통합 별칭도 기록되지 않습니다. 환경은 저장되었지만 그 비밀 중 하나가 실패하면 API는 오류를 반환하지만 환경은 존재합니다. 이 경우 이벤트는 성공으로 기록되며 `metadata.partial=true`와 `reason=secret_failed`가 포함됩니다. 인벤토리 단계가 실패한 템플릿(`reason=inventory_failed`)과 설정이 실패한 프로젝트(`reason=setup_failed`)도 같은 방식으로 기록됩니다.

## 감사 로그 켜기 {#enable}

감사 로그는 기본적으로 꺼져 있습니다. 켜려면 `audit.enabled`를 설정하고 `audit.instance_id`에 설치 환경의 이름을 지정하세요.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

또는 환경 변수를 사용합니다.

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

인스턴스 ID는 공백 없는 1~255자입니다. 모든 이벤트에 추가되므로 여러 설치 환경이 같은 곳으로 이벤트를 보내도 구분할 수 있습니다.

Semaphore를 다시 시작하세요. 기록은 다시 시작한 후부터 시작되며 이전 작업은 추가되지 않습니다. 모든 옵션은 [구성 옵션](/reference/configuration#audit-log)을 참고하세요.

## 프록시 뒤에서 클라이언트 주소 기록하기 {#trusted-proxies}

Semaphore가 리버스 프록시 뒤에서 실행되면 이벤트에 사용자 대신 프록시의 주소가 표시됩니다. 실제 클라이언트 주소를 기록하려면 `audit.trusted_proxy_cidrs`에 프록시 네트워크를 나열하세요.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

또는 환경 변수를 사용합니다.

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

그러면 Semaphore는 이 네트워크에서 온 요청에 한해 `X-Forwarded-For` 또는 `X-Real-IP`에서 클라이언트 주소를 가져옵니다. 요청이 여러 프록시를 거친다면 모두 나열하세요. 사용자가 접속하는 네트워크는 나열하지 마세요. 그 네트워크의 누구든 이 헤더에 임의의 주소를 넣을 수 있습니다.

## 저장 {#storage}

이벤트는 Semaphore 데이터베이스에 저장되므로 평소의 데이터베이스 백업에 포함됩니다. Semaphore는 감사 이벤트를 UI에 표시하지 않고 오래된 이벤트를 삭제하지도 않으므로 데이터베이스 크기를 지켜보세요.

감사 로그는 사용자의 작업을 방해하지 않습니다. 이벤트를 저장하지 못하면 Semaphore는 서버 로그에 오류를 기록하고 작업은 평소처럼 계속됩니다.

## SIEM으로 내보내기 <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro는 rsyslog나 Vector 같은 Syslog 수신기로 TLS를 통해 감사 이벤트를 보낼 수 있습니다. 수신기는 이벤트를 저장하거나 SIEM으로 전달할 수 있습니다.

필요한 것:

- 수신기의 호스트 이름과 포트
- 이 대상의 이름(예: `security-syslog`)
- Semaphore 호스트가 아직 신뢰하지 않는 경우 수신기의 CA 인증서

`config.json`에 `audit.syslog`를 추가하세요.

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

`id`와 `address`는 필수입니다. Semaphore는 각 대상에 어떤 이벤트를 이미 보냈는지 기억하므로 주소나 인증서를 바꿀 때도 같은 `id`를 유지하세요. 새 `id`는 새 이벤트부터 보냅니다.

Semaphore는 항상 수신기의 인증서를 확인하며 TLS 1.2 이상을 사용합니다. `ca_file`은 CA를 신뢰할 수 있는 인증서에 추가하고, `server_name`은 주소와 다를 때 인증서에서 확인할 이름을 지정합니다.

Semaphore를 다시 시작하세요. 설정이 잘못되었거나 CA 파일을 읽을 수 없으면 Semaphore가 시작되지 않습니다.

### 이벤트 도착 확인하기 {#verify-siem-delivery}

Semaphore는 시작할 때마다 이벤트를 기록합니다. 다시 시작한 후 수신기에서 해당 이벤트를 찾으세요. `event_code`는 `audit.lifecycle`, `action`은 `start`이고, `metadata.destinations`에 대상 ID가 들어 있습니다.

### 이벤트 전달 방식 {#delivery}

- 수신기가 중단되면 이벤트는 데이터베이스에서 기다렸다가 수신기가 복구되면 전송됩니다. 사용자는 아무것도 알아차리지 못합니다.
- 네트워크 오류, 재시작, HA 장애 조치 후에는 일부 이벤트가 두 번 도착할 수 있습니다. `event_id`로 중복을 제거하고 `seq`로 순서를 맞추세요.
- 오류 없이 연결이 끊기면 그 순간에 보낸 이벤트가 유실될 수 있습니다.
- [HA 설치](/admin-guide/ha)에서는 한 번에 하나의 노드가 이벤트를 보냅니다. Redis를 사용할 수 없으면 전송이 일시 중지되고 이벤트 기록은 계속됩니다.

각 이벤트는 이벤트 JSON을 본문으로 하는 RFC 5424 Syslog 메시지로 전송됩니다. `HOSTNAME`은 HA 노드 ID(단일 노드에서는 인스턴스 ID)이고 `MSGID`는 이벤트 코드입니다.

### rsyslog 예시 {#rsyslog}

이 rsyslog 구성은 TLS 연결을 받아 한 줄에 하나의 이벤트를 기록합니다.

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

### Vector 예시 {#vector}

이 Vector 구성은 TLS 연결을 받아 이벤트 JSON을 읽고 파일에 기록합니다.

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

- **Semaphore가 시작되지 않습니다.** `audit.syslog.id`와 `audit.syslog.address`가 모두 설정되어 있고 CA 파일에 PEM 인증서가 들어 있는지 확인하세요.
- **TLS 연결이 실패합니다.** 수신기의 인증서가 `server_name`과 일치하고 Semaphore가 신뢰하는 CA가 서명했는지 확인하세요.
- **이벤트가 도착하지 않습니다.** Semaphore 서버 로그와 수신기 로그를 확인하세요. 실패 후 Semaphore는 잠시 기다렸다가 다시 시도합니다.
- **일부 이벤트가 두 번 도착합니다.** 재시도와 장애 조치 후에 생길 수 있습니다. `event_id`로 중복을 제거하세요.

## 기록되지 않는 작업 {#not-recorded}

명령줄 도구 `semaphore`는 데이터베이스를 직접 다루므로 `user add`, `user token` 같은 명령은 기록되지 않습니다.

UI의 일부 작업은 아직 기록되지 않습니다. 라이선스 제거, 앱 설정, HA 작업 상태 초기화, Terraform 인벤토리 별칭, Terraform 상태 삭제, 워크플로 실행, 프로젝트 초대입니다. 템플릿 설명, 뷰, 프로젝트 캐시 삭제, 예약된 비밀 저장소 동기화도 기록되지 않습니다. 앞으로의 릴리스에 예정된 이벤트는 [감사 이벤트](/reference/audit-events)를 참고하세요.

## 다음 단계 {#whats-next}

- [감사 이벤트](/reference/audit-events) — 이벤트 형식과 기록되는 모든 이벤트.
- [구성 옵션](/reference/configuration#audit-log) — 모든 `audit.*` 옵션과 환경 변수.
- [로그](/admin-guide/logs) — 서버, 활동, 작업 로그.
