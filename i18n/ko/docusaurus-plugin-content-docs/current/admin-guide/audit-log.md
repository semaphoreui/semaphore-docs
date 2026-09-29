---
title: 감사 로그
description: Semaphore가 로그인, MFA, 사용자, 권한, API 토큰, 설정에 대해 기록하는 보안 감사 로그와 이를 켜는 방법.
---

# 감사 로그

감사 로그는 보안 감사 추적입니다. 누가, 어디에서, 어떤 객체에 무엇을 했고, 결과가 어땠는지를 기록합니다.
보안 분석가와 규정 준수 담당자가 주로 SIEM에서 읽습니다. 모든 이벤트는 안정적이고 문서화된 스키마를 가지므로,
분석가는 Semaphore 내부를 몰라도 탐지 규칙을 작성할 수 있습니다.

감사 로그는 [활동 로그](/admin-guide/logs)와 별개입니다. 활동 로그는 프로젝트 사용자를 위한 피드입니다. 감사
로그는 시스템이 올바르게 사용되는지 확인하는 사람들을 위한 추적입니다.

## 동작 방식 {#overview}

감사 로그를 켜면, Semaphore는 웹 UI나 API를 통해 들어오는 보안 관련 작업마다 이벤트를 기록합니다. 로그인과
로그아웃, MFA 확인, 사용자, 프로젝트 멤버, 역할, 권한의 변경, API 토큰, 시스템 설정입니다. 거부된 요청도
기록됩니다. 로그인 실패, 알 수 없거나 만료된 API 토큰, 거부된 권한, 차단된 교차 사이트 요청입니다.

이벤트는 Semaphore 데이터베이스에 저장됩니다. Semaphore Pro는 이를 SIEM으로 보낼 수 있습니다.
[SIEM으로 내보내기](#siem-export)를 참고하세요.

## 이벤트 스키마 {#event-schema}

모든 이벤트는 같은 필드를 가진 JSON 객체입니다. 이벤트 목록과 각 이벤트의 결과, 이유, 메타데이터는
[감사 이벤트](/reference/audit-events)를 참고하세요.

| 필드 | 설명 |
| --- | --- |
| `event_id` | 이벤트의 고유 ID. SIEM에서 중복을 제거할 때 사용합니다. |
| `seq` | 이벤트마다 증가하는, 빠진 번호가 없는 순번. 이벤트 정렬에 사용합니다. |
| `timestamp` | 이벤트 시각(UTC). |
| `schema_version` | 이 스키마의 버전. 필드 이름이 바뀌거나, 삭제되거나, 타입이 바뀔 때만 변경됩니다. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system`, `audit` 중 하나. |
| `event_code` | 이벤트의 대상. 예: `iam.api_token`. |
| `type` | 변경 종류: `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied`, `info`. |
| `action` | 수행된 작업. 예: `create`. |
| `outcome` | `success` 또는 `failure`. |
| `reason` | 작업이 실패한 이유. 이벤트마다 정해진 목록에서 선택됩니다. 성공 시에는 비어 있습니다. |
| `actor` | 작업한 주체: `type`(`user`, `anonymous`, `system`, `runner`, `integration`), `id`, `name`. 사용자인 경우 `auth`(`session` 또는 `api_token`)도, API 토큰인 경우 `token_fingerprint`도 포함합니다. |
| `source` | 웹 UI와 API 요청의 경우: 클라이언트의 `ip`와 `user_agent`. |
| `target` | 작업 대상 객체: `type`, `id`, `name`. |
| `scope` | 프로젝트 안의 이벤트에 대한 `project_id`. |
| `request_id` | HTTP 요청의 ID. Semaphore는 응답 헤더 `X-Request-ID`로도 반환합니다. |
| `instance_id` | 이 Semaphore 설치의 이름. `audit.instance_id` 값입니다. |
| `node_id` | [고가용성](/admin-guide/ha)이 켜져 있을 때 이벤트를 기록한 노드. |
| `metadata` | 이벤트에 따라 달라지는 추가 정보. |

`timestamp`는 데이터베이스 시각이며 마이크로초 단위이고, SQLite에서는 밀리초 단위입니다. 이벤트는 `seq`로
정렬하세요. 두 이벤트의 시각은 같을 수 있지만 `seq`는 절대 같지 않습니다.

MySQL에서 `audit_event` 테이블의 `created` 열은 연결 옵션 `loc`의 시간대를 사용하며, 기본값은 UTC입니다.
모든 이벤트의 `timestamp`는 항상 UTC입니다.

서버가 시작될 때마다 액션이 `start`인 `audit.lifecycle`이 기록됩니다. 중지 이벤트는 없습니다. 중지, 장애,
감사 로그 끄기는 다음 `start` 앞의 시간 공백으로 나타납니다.

## 절대 기록되지 않는 정보 {#never-recorded}

감사 로그에는 비밀번호, 일회용 코드, TOTP 시크릿과 QR 코드, 복구 코드, 세션 쿠키, 토큰, OAuth 코드와 클레임,
개인 키, 암호 문구, 시크릿 값, 환경 변수와 설문 값, 웹훅 본문, 작업 출력, 이메일 주소, URL이 절대 포함되지
않습니다. API 토큰은 지문, 즉 SHA-256 해시의 앞 16자리 16진수 문자로만 식별됩니다.

사용자 ID와 사용자 이름으로 작업한 주체를 식별합니다. 로그인에 실패하면 입력된 로그인 이름을 64바이트로 잘라
기록합니다. 실패한 로그인을 조사하는 데 필요하기 때문입니다.

## 감사 로그 켜기 {#enable}

`audit.enabled`를 설정하고 `audit.instance_id`에 설치 이름을 지정합니다. 이름은 공백 없는 1~255자의 인쇄 가능한
ASCII 문자이며, 모든 이벤트에 포함됩니다.

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
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

변경을 적용하려면 Semaphore를 다시 시작하세요. 모든 옵션은 [설정](/reference/configuration)을 참고하세요.

## 리버스 프록시 뒤의 클라이언트 주소 {#trusted-proxies}

리버스 프록시 뒤에서는 Semaphore의 직접 연결 상대가 프록시이고, 클라이언트 주소는 `X-Forwarded-For` 또는
`X-Real-IP` 헤더에서 옵니다. Semaphore는 직접 연결 상대가 `audit.trusted_proxy_cidrs`에 포함될 때만 이 헤더를
읽습니다. 그렇지 않으면 연결 상대의 주소를 기록하므로, 클라이언트가 자신의 주소를 위조할 수 없습니다.

`audit.trusted_proxy_cidrs`에는 리버스 프록시만 지정하고, 클라이언트 네트워크는 절대 지정하지 마세요. 신뢰 범위
안의 클라이언트는 `X-Forwarded-For`에 어떤 주소든 넣을 수 있습니다.

기록되는 주소는 `X-Forwarded-For`에서 신뢰된 프록시가 아닌 가장 오른쪽 주소입니다.
`X-Real-IP`는 `X-Forwarded-For`가 없을 때만, 그리고 값이 하나일 때만 사용됩니다.

## 저장 {#storage}

이벤트는 Semaphore 데이터베이스에 저장되며 삭제되지 않습니다. 이 버전에는 보존 기간이 없습니다. 설치의 로그인과
변경 횟수에 맞춰 데이터베이스 크기를 계획하세요.

## 규정 준수 매핑 {#compliance}

Semaphore는 이러한 통제에 필요한 이벤트를 기록합니다. Semaphore만으로 설치가 규정을 준수하게 되지는 않습니다.

| 요구 사항 | 해당 이벤트 | 상태 |
| --- | --- | --- |
| PCI DSS 10.2.1.1 민감한 데이터 접근(유사: 시크릿) | `iam.mfa/view_qr` | 사용 가능 |
| PCI DSS 10.2.1.1 민감한 데이터 접근(유사: 시크릿) | `resource.project_backup/export` | 예정 |
| PCI DSS 10.2.1.2 관리자 작업 / ISO 27002 8.15 특권 사용 | `iam.*`, `system.*` | 사용 가능 |
| PCI DSS 10.2.1.2 관리자 작업 / ISO 27002 8.15 특권 사용 | `resource.*`, `secret.*` | 예정 |
| PCI DSS 10.2.1.2 관리자 작업 / ISO 27002 8.15 특권 사용 | `runner.*`, `task.control`, `task.history` | 예정 |
| PCI DSS 10.2.1.3 감사 로그 접근 | 해당 없음: Semaphore는 감사 추적에 대한 접근을 제공하지 않습니다. | — |
| PCI DSS 10.2.1.4 잘못된 논리적 접근 시도 / ISO 거부된 접근 시도 | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | 사용 가능 |
| PCI DSS 10.2.1.4 잘못된 논리적 접근 시도 / ISO 거부된 접근 시도 | `runner.lifecycle/register` failure | 예정 |
| PCI DSS 10.2.1.5 식별 및 인증 자격 증명 변경 | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | 사용 가능 |
| PCI DSS 10.2.1.5 식별 및 인증 자격 증명 변경 | `runner.credential` | 예정 |
| PCI DSS 10.2.1.6 감사 로그의 시작, 중지, 일시 중지 / ISO 보안 시스템 활성화 | `audit.lifecycle/start`. 중지는 그 앞의 공백으로 나타납니다 | 사용 가능 |
| PCI DSS 10.2.1.7 시스템 수준 객체의 생성과 삭제 | `resource.*` create/delete | 예정 |
| PCI DSS 10.2.1.7 시스템 수준 객체의 생성과 삭제 | `runner.lifecycle` create/delete | 예정 |
| PCI DSS 10.2.2 필수 필드 | `actor`, `event_code`와 `action`, `timestamp`, `outcome`, `source` 또는 `node_id`, `target` 또는 `scope` | 사용 가능 |
| PCI DSS 10.3.3 중앙 로그 서버로의 신속한 백업 | Syslog+TLS를 통한 SIEM 내보내기 | 사용 가능 |
| PCI DSS 10.3.3 중앙 로그 서버로의 신속한 백업 | Splunk HEC를 통한 SIEM 내보내기 | 예정 |

예정된 이벤트는 이 버전에서 기록되지 않습니다.

## 이 버전에서 기록되지 않는 작업 {#not-recorded}

- 서버에서 `semaphore` 명령으로 수행한 작업(예: `user add`, `user token`). 이 작업은 데이터베이스를 직접
  변경하며, 이를 실행할 수 있는 사람은 감사 테이블도 변경할 수 있습니다.
- 라이선스 제거, 앱 런타임 설정, HA 작업 상태 지우기, Terraform 인벤토리 별칭, 워크플로 실행, 프로젝트 초대.
  이들에는 아직 감사 이벤트가 없습니다.

## SIEM으로 내보내기 <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro는 TLS를 사용하는 Syslog로 감사 로그를 SIEM에 보냅니다. SIEM별로 로그 내 위치를 유지하므로, SIEM에
연결할 수 없는 동안 기록된 이벤트는 SIEM이 복구되면 전송됩니다. 절차는
[감사 로그를 SIEM으로 보내기](/admin-guide/audit-log-siem)를 참고하세요.

## 다음 단계 {#whats-next}

- [감사 로그를 SIEM으로 보내기](/admin-guide/audit-log-siem) — Syslog+TLS로 이벤트를 내보냅니다.
- [감사 이벤트](/reference/audit-events) — 각 이벤트의 결과, 이유, 메타데이터.
- [설정](/reference/configuration) — 모든 `audit.*` 옵션.
