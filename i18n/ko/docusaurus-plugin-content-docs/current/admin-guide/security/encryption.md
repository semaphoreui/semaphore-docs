---
id: encryption
title: 암호화 키
sidebar_label: 암호화 키
description: Semaphore가 비밀 정보를 암호화하고, 암호화 키를 구성하며, 무중단으로 키를 교체하는 방법.
---

# 암호화 키

Semaphore는 저장하는 데이터 중 가장 민감한 정보인 **Access Key 비밀 정보**
(SSH 개인 키, 로그인/비밀번호 쌍, 비밀 문자열)와 **JWT 서명
키**를 AES‑256‑GCM으로 암호화합니다. 이 페이지에서는 이러한 키를 구성하는 방법, 키
교체가 동작하는 방식, 그리고 안전하게 운영하는 방법을 설명합니다.

:::info 두 개의 키, 두 가지 용도

| 키 | 보호 대상 | 활성 포인터 |
|-----|----------|----------------|
| **Secrets 키** | 데이터베이스에 저장된 Access Key 비밀 정보 | `active.secret_key` |
| **Options 키** | 암호화된 DB 옵션(JWT 서명 키) | `active.option_key` |

Options 키가 구성되지 않은 경우 옵션은 Secrets 키를 대신 사용합니다.
:::

---

## 빠른 시작 {#quick-start}

가장 간단한 설정은 메인 구성에 단일 키를 지정하는 것입니다:

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

다음 명령으로 키를 생성합니다:

```bash
openssl rand -base64 32
```

이것으로 끝입니다. 이제 Semaphore는 `key1`로 비밀 정보를 암호화합니다. 동일한 키가
JWT 서명 키에도 사용됩니다(옵션은 Secrets 키를 대신 사용합니다).

:::tip 프로덕션
키 자료가 구성 파일이 아닌 마운트된 시크릿에 존재하도록, 인라인
`value:` 대신 **`file:` 참조** 또는 **`keys_folder`**(아래 참조)를 사용하십시오.
:::

---

## 키 식별 방식 {#how-keys-are-identified}

모든 키에는 키 자료 자체에서 파생된 **키 id**가 있습니다. 이는
`base64url(sha256(key))[:8]` 형태의 지문(fingerprint)입니다. 각 암호화된 값과 함께 (키가 아닌) id가
저장되므로, 복호화는 해당 값을 기록한 정확한 키를 직접 조회하는 방식으로 이루어집니다.

이는 다음을 의미합니다:

- **레이블은 자유롭게 이름을 바꿀 수 있습니다.** `key1`, `secrets_key_primary.txt` 등은
  사람을 위한 것입니다. 데이터베이스에는 레이블이 아닌 지문만 저장됩니다.
- **키가 잘못 가리켜질 수 없습니다.** 키의 바이트를 변경하면 *새로운*
  id가 되며, 기존 데이터는 계속 이전 id를 참조합니다.
- **키를 제거하면 조용히 실패하지 않고 명확하게 실패합니다.** 키 id가 없으면 명시적인
  오류가 발생하며, 잘못된 출력이 생성되는 일은 없습니다.

id는 직접 설정하지 않으며, Semaphore가 계산합니다.

---

## 키 파일 {#the-keys-file}

`encryption.keys_file`은 **키 레지스트리**와 용도별 활성 키를 가리키는
**포인터**를 담은 파일을 가리킵니다. 이 파일은 **파일 확장자와 관계없이 YAML 또는 JSON**으로
파싱됩니다.

레지스트리를 제공하는 방법은 인라인 맵, 파일 폴더, 또는
둘의 조합입니다.

### 인라인 맵 {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

각 항목은 [`KeySource`](#keysource)입니다. `value`(인라인 base64) **또는**
`file`(base64 키가 들어 있는 파일 경로) 중 하나이며, 둘을 동시에 지정할 수 없습니다.

### 키 파일 폴더 {#folder-of-key-files}

`keys_folder`가 디렉터리를 가리키도록 하면 **모든 일반 파일이 하나의 키**가 되며, 파일 이름이
레이블이 됩니다. 마운트된 Docker/Kubernetes 시크릿에 적합합니다.

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note Kubernetes 친화적
`keys_folder`는 점으로 시작하는 항목(`..data`, `..2024_*`)을 건너뛰고
심볼릭 링크를 따라가므로, Kubernetes가 `Secret`/`ConfigMap` 볼륨을 마운트하는 방식과
그대로 호환됩니다.
:::

### 조합 {#combined}

`keys`와 `keys_folder`는 하나의 레지스트리로 병합되며, `active`는 레이블
*또는* 파일 이름으로 가리킬 수 있습니다:

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## 키 교체(무중단) {#rotation-zero-downtime}

활성 키는 **새로운** 쓰기를 암호화하며, 레지스트리의 다른 모든 키는 여전히 기존 데이터를
**복호화**할 수 있습니다. 따라서 키 교체는 키를 추가하고, 포인터를 전환하고,
백그라운드에서 다시 암호화한 다음, 이전 키를 제거하는 과정입니다.

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

어느 단계에서도 프로세스 재시작이 필요하지 않습니다.

### 재시작 없이 변경 사항 적용 {#applying-changes-without-a-restart}

Semaphore는 키 파일(및 해당 파일이 참조하는 키 파일)을 다시 읽고
메모리 내 키를 원자적으로 교체합니다. 트리거는 두 가지입니다:

| 트리거 | 동작 |
|---------|-----------|
| **파일 감시기** | `encryption.keys_poll_interval`(기본값 `15s`)마다 폴링합니다. `"0"`으로 설정하면 비활성화됩니다. |
| **`SIGHUP`** | `kill -HUP <pid>`로 즉시 다시 로드합니다(Unix 전용). |

:::caution Windows
Windows에는 `SIGHUP`이 없습니다. 모든 플랫폼에서 동작하는 **폴러**(기본값)를
사용하거나 서비스를 재시작하십시오.
:::

다시 로드할 때는 먼저 새 키를 검증하며, 오류가 발생하면 실행 중인 키를
그대로 유지합니다.

---

## CLI 명령 {#cli-commands}

### `vault check` {#vault-check}

읽기 전용입니다. 키 id별로 해당 키가 암호화한 저장된 비밀 정보의 수를 보고하므로,
활성 키에 어떤 데이터가 있고 어떤 키를 안전하게 제거할 수 있는지 확인할 수 있습니다.

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

상태: `active`, `retired, rekey pending`, `retired, SAFE TO REMOVE`,
`legacy (no id)`, `MISSING KEY`(참조된 키가 없음 — 종료 코드 1).

### `vault rekey` {#vault-rekey}

저장된 모든 비밀 정보(및 JWT 서명 키)를 활성 키로 다시 암호화합니다.

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## 하위 호환성 {#backward-compatibility}

업그레이드는 안전하며 **데이터 마이그레이션이 필요하지 않습니다**:

- **`access_key_encryption`**(또는
  `SEMAPHORE_ACCESS_KEY_ENCRYPTION` 환경 변수)을 설정한 기존 설치는 변경 없이 계속 동작합니다. 해당
  단일 키가 활성 Secrets 키가 됩니다.
- 이전 버전의 Semaphore가 기록한 데이터(키 id 없음)도 여전히 복호화됩니다. 다음 쓰기 시
  또는 `vault rekey` 실행 후 키 id가 다시 기록됩니다.
- **암호화를 전혀 사용하지 않는 경우**(키가 구성되지 않음)에도 비밀 정보는 계속
  일반 base64로 저장되며 동일한 방식으로 복호화됩니다.

기존 단일 키 설치를 키 파일로 마이그레이션하려면 이전 키를 레지스트리에
포함하기만 하면 됩니다:

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

기존 데이터는 `old`로 복호화되며, `vault rekey`를 실행하면 모든 데이터가 `new`로 이동합니다.

---

## Kubernetes 및 Docker {#kubernetes--docker}

키를 `Secret` 볼륨으로 마운트하고 `keys_folder`가 이를 가리키도록 합니다:

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

`Secret`을 업데이트하면 Kubernetes가 마운트된 파일을 갱신하고, 폴러가
`keys_poll_interval` 이내에 변경 사항을 적용합니다. Pod 재시작은 필요하지 않습니다.

---

## 보안 모범 사례 {#security-best-practices}

:::danger 키 파일 보호
- 권한을 제한하십시오: `chmod 0400`, 소유자는 Semaphore 서비스 사용자.
- **실제 키를 버전 관리에 commit하지 마십시오.** 해당 파일을 `.gitignore`에 추가하십시오.
- 안전하게 백업하십시오. **모든 키를 잃으면 암호화된 모든 데이터를 잃게 됩니다.**
- 인라인 `value:`보다 마운트된 시크릿(`file:` / `keys_folder`)을 우선하고, 그다음으로
  환경 변수를 사용하십시오. `value:`는 키를 구성 파일에 남깁니다.
:::

---

## 참조 {#reference}

### `encryption`(메인 구성) {#encryption-main-config}

| 필드 | 환경 변수 | 기본값 | 설명 |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | 키 파일 경로(YAML/JSON). |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | 키 파일을 폴링하는 주기. `"0"`은 폴링을 비활성화합니다. |

### 레거시 단일 키(메인 구성) {#legacy-flat-keys-main-config}

| 필드 | 환경 변수 | 설명 |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | 단일 Secrets 키, 교체 불가. `keys_file`이 설정되지 않은 경우 사용됩니다. |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | 단일 Options 키, 교체 불가. 설정되지 않으면 Secrets 키를 사용합니다. |

### 키 파일 {#keys-file}

| 필드 | 설명 |
|-------|-------------|
| `keys` | `label → KeySource` 맵(인라인 레지스트리). |
| `keys_folder` | 키 파일 디렉터리(일반 파일 하나당 키 하나, 파일 이름이 레이블). |
| `active.secret_key` | 활성 Secrets 키의 레이블(`keys` 내). |
| `active.option_key` | 활성 Options 키의 레이블. |
| `active.secret_key_file` | 활성 Secrets 키의 `keys_folder` 내 파일 이름(상대 경로). |
| `active.option_key_file` | 활성 Options 키의 `keys_folder` 내 파일 이름(상대 경로). |

### KeySource {#keysource}

| 필드 | 설명 |
|-------|-------------|
| `value` | 인라인 base64 키 자료. |
| `file` | base64 키가 들어 있는 파일의 경로. |

`value`와 `file`은 상호 배타적입니다. 키는 **16, 24 또는 32
바이트**(AES‑128/192/256)의 base64여야 합니다.

---

## 문제 해결 {#troubleshooting}

| 증상 | 원인 / 해결 방법 |
|---------|-------------|
| 시작 시 패닉: `encryption_keys… not found` / `invalid` | 키 파일 또는 참조된 키 파일이 없거나 형식이 잘못되었거나, 키가 16/24/32바이트의 유효한 base64가 아닙니다. 파일을 수정하십시오. 시작 실패는 의도적으로 빠르게 발생합니다. |
| `vault check`에 `MISSING KEY <id>`가 표시됨(종료 코드 1) | 더 이상 레지스트리에 없는 키로 암호화된 데이터가 있습니다. 복호화하려면 해당 키를 다시 추가하십시오. |
| `cannot decrypt access key, perhaps encryption key was changed` | 레거시(접두사 없는) 값을 구성된 어떤 키로도 복호화할 수 없습니다. 원래 키가 레지스트리 또는 `access_key_encryption`에 있는지 확인하십시오. |
| 키 교체가 적용되지 않음 | `keys_poll_interval`이 `"0"`이 아닌지, 키 파일이 실제로 변경되었는지 확인하거나 `SIGHUP`을 보내십시오. |
| `active.secret_key: no key labelled "…"` | 활성 포인터가 `keys`/`keys_folder`에 없는 레이블/파일 이름을 가리키고 있습니다. |
