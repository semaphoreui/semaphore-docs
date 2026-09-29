---
title: 감사 로그를 SIEM으로 보내기
description: TLS를 사용하는 Syslog로 감사 이벤트를 SIEM에 보내도록 Semaphore Pro를 설정하고, rsyslog나 Vector가 이를 받도록 준비합니다.
---

# 감사 로그를 SIEM으로 보내기 <FeatureState feature="audit-siem-export" />

Semaphore Pro는 [감사 로그](/admin-guide/audit-log)의 모든 이벤트를 TLS 위의 RFC 5424 Syslog 메시지로 SIEM에
보냅니다.

## 시작하기 전에 {#before-you-begin}

- Semaphore Pro 라이선스.
- [켜져 있는 감사 로그](/admin-guide/audit-log#enable).
- TLS를 지원하는 Syslog 수신기. 예를 들어 rsyslog나 Vector입니다. [수신기 예제](#receivers)를 참고하세요.
- 수신기 인증서에 서명한 CA 인증서(PEM 형식). 시스템 신뢰 저장소에 없는 경우 필요합니다.

## 단계 {#steps}

감사 로그를 SIEM으로 보내려면 다음 단계를 따르세요.

1. `config.json`에 `audit.syslog` 섹션을 추가합니다.

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
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
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id`와 `address`는 필수입니다. `ca_file`은 시스템 신뢰 저장소에 CA를 추가합니다. `server_name`은 수신기
   인증서에서 확인하는 이름을 바꿉니다. `timeout`은 연결과 쓰기 시간을 제한하며, 기본값은 10초입니다.
2. Semaphore를 다시 시작합니다. CA 파일을 읽을 수 없거나 `id` 또는 `address`가 없으면 오류와 함께 시작이
   중단됩니다.
3. 잘못된 비밀번호로 로그인합니다. SIEM은 결과가 `failure`인 `auth.login` 이벤트를 받습니다.

## 이벤트 전달 방식 {#delivery}

- Semaphore는 로그 내 위치를 `id`별로 유지합니다. 다시 시작하면 그 위치부터 이어가고, 수신기에 연결할 수 없는
  동안 기록된 이벤트는 수신기가 복구되면 전송됩니다. 새 `id`는 현재 이벤트부터 시작하며 이전 이벤트는 보내지
  않습니다.
- 전달은 최선 노력 방식입니다. 조용히 끊긴 연결에 쓰인 이벤트는 유실될 수 있습니다.
- 네트워크 오류나 장애 조치 후와 같이 이벤트가 두 번 도착할 수 있습니다. `event_id`로 중복을 제거하고 `seq`로
  이벤트를 정렬하세요.
- [고가용성](/admin-guide/ha)에서는 한 번에 한 노드가 보냅니다. 그 노드가 멈추면 다른 노드가 이어받습니다.

## 수신기 예제 {#receivers}

Semaphore는 옥텟 카운팅 프레이밍(RFC 5425)을 사용하는 RFC 5424 메시지를 보냅니다. 메시지 본문은 이벤트 JSON입니다.
Syslog `HOSTNAME`은 노드 ID이고, HA가 없으면 인스턴스 ID이며, `MSGID`는 `event_code`입니다.

### rsyslog {#rsyslog}

TLS로 이벤트를 받아 한 줄에 JSON 이벤트 하나씩 기록합니다.

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

### Vector {#vector}

TLS로 이벤트를 받아 이벤트 JSON을 파싱합니다.

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

## 다음 단계 {#whats-next}

- [감사 로그](/admin-guide/audit-log) — 이벤트 스키마와 기록되는 내용.
- [감사 이벤트](/reference/audit-events) — 각 이벤트의 결과, 이유, 메타데이터.
- [설정](/reference/configuration) — 모든 `audit.*` 옵션.
