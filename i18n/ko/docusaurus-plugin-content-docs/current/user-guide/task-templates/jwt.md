# 작업 JWT

[서버에서 JWT 발급이 활성화된 경우](/admin-guide/security/jwt),
템플릿은 자신이 생성하는 모든 작업에 대해 수명이 짧은 서명된 token을 발급할 수 있습니다.
이 token은 실행 중인 playbook이나 스크립트에
`SEMAPHORE_JWT` 환경 변수로 노출되며, OpenBao나 HashiCorp Vault처럼
JWT 인증을 지원하는 모든 시스템에서
자격 증명으로 교환할 수 있습니다.

[키 저장소](/user-guide/key-store)에 저장된 장기 시크릿에 비해 갖는 장점은
모든 작업이 **정확한 작업 실행을 식별하는 새로운 token**(프로젝트, 템플릿, 사용자 id)을
받으며, 작업이 끝난 직후 만료된다는 점입니다.

## 템플릿에서 JWT 활성화하기 {#enabling-jwts-on-a-template}

템플릿 양식에서 **JWT** 섹션으로 스크롤한 다음(이 섹션은 관리자가
[JWT 발급을 활성화한](/admin-guide/security/jwt) 경우에만 표시됩니다)
**JWT enabled**를 체크합니다.

템플릿별로 다음 옵션을 설정할 수 있습니다:

| 필드 | 설명 |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | `aud` 클레임에 포함되는 하나 이상의 문자열입니다. 다운스트림 시스템이 기대하는 식별자(예: OpenBao 서버 URL)로 설정하십시오. 최대 32개 항목이 지원됩니다. |
| TTL | 기간으로 표현한 token 수명(`30s`, `10m`, `1h`, ...)입니다. 비워 두면 전역 `jwt.default_ttl`이 사용됩니다. TTL은 전역 `jwt.max_ttl`을 초과할 수 없습니다. |

## Token 클레임 {#token-claims}

각 token에는 다운스트림 시스템에서 접근 권한을 부여할 때
활용할 수 있는 다음 클레임이 포함됩니다:

| 클레임 | 예시 | 비고 |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | 관리자가 설정합니다. |
| `aud` | `https://bao.example.com` | 템플릿의 audience 목록에서 가져옵니다. |
| `sub` | `task:1234` | 작업 실행마다 고유합니다. |
| `iat` / `nbf` / `exp` | | 표준 시간 클레임입니다. |
| `jti` | | 고유한 token 식별자입니다. |
| `project_id` | `7` | 템플릿이 속한 프로젝트입니다. |
| `template_id` | `42` | 작업을 생성한 템플릿입니다. |
| `user_id` | `67` | 작업을 시작한 사용자입니다 (예약 실행 / 통합 실행에서는 생략됨) |

이 클레임을 사용하여 소비 측에서 접근 **범위를 제한**하십시오. 예를 들어
`project_id = 7`이고 특정 `template_id`를 가진 token만 허용하는
OpenBao 역할을 만들 수 있습니다.

## 작업 내에서 token 사용하기 {#using-the-token-inside-a-task}

Semaphore는 작업 프로세스의 환경에 token을 `SEMAPHORE_JWT`로
내보냅니다.

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## 예시: OpenBao {#example-openbao}

다음 안내에서는 OpenBao가 Semaphore의 JWT를 신뢰하도록 설정하고
이를 데모용 비밀번호로 교환합니다.
`semaphore.example.com`과 `bao.example.com`은 자신의 호스트 이름으로 바꾸십시오.

### 1. JWT 인증 방식 설정 {#1-configure-the-jwt-auth-method}

JWT 인증 방식을 활성화하고 Semaphore 인스턴스의 JWKS 엔드포인트를
가리키도록 설정합니다. OpenBao는 여기서 가져온 공개 키를 사용하여
모든 token을 검증합니다.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. 정책 정의 {#2-define-a-policy}

작업에 필요한 권한을 부여합니다. 아래 예시는 `kv/data/semaphore/demo` 아래에 있는
데모 자격 증명의 읽기를 허용합니다:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. 템플릿에 바인딩된 OpenBao 역할 정의 {#3-define-an-openbao-role-bound-to-a-template}

OpenBao 역할은 **어떤 Semaphore 작업**이 어떤 정책을 사용할 수 있는지
결정합니다. 의도한 템플릿만 역할을 사용할 수 있도록 Semaphore 고유 클레임
(`project_id`, `template_id`, ...)을 `bound_claims`로 사용하십시오:

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

각 역할은 항상 최소한 `project_id` 또는 `template_id` 클레임으로
제한하십시오. 바인딩이 없으면 Semaphore 인스턴스가 발급한 **모든** JWT가
해당 역할을 사용할 수 있습니다.

지원되는 설정 파라미터의 전체 목록은 [여기](https://openbao.org/api-docs/auth/jwt/#createupdate-role)에서 확인할 수 있습니다

### 4. 템플릿 설정 {#4-configure-the-template}

배포 playbook을 실행하는 Semaphore 템플릿에서:

- **JWT enabled**를 체크합니다.
- **Audience**를 `https://bao.example.com`으로 설정합니다 – 이 값은
  OpenBao 역할의 `bound_audiences`와 일치합니다.
- 선택적으로 **TTL**을 `15m`으로 설정하여 작업이 끝난 직후
  token이 만료되도록 합니다.

### 5. 작업에서 token 사용 {#5-use-the-token-in-the-task}

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

이제 작업은 사전 공유 시크릿 없이 OpenBao에 인증합니다 :tada:
