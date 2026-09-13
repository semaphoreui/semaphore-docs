# Vault

`semaphore vault` 명령은 Semaphore가 데이터베이스에 저장하는 비밀 정보 —
**액세스 키 비밀 정보**(SSH 키, 로그인/비밀번호 쌍, 비밀 문자열)와
**JWT 서명 키** — 의 암호화를 관리합니다.

```bash
semaphore vault --help
```

> `vault`는 `vaults`의 별칭입니다.

두 개의 하위 명령이 있습니다.

| 명령 | 용도 |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | 저장된 모든 비밀 정보를 활성 암호화 키로 재암호화합니다. |
| [`vault check`](#checking-key-usage-vault-check) | 저장된 각 비밀 정보를 어떤 키 id가 암호화하는지 보고합니다(읽기 전용). |

암호화 키를 구성하고 교체하는 방법은
[암호화 키](/admin-guide/security/encryption)를 참고하십시오.

## 비밀 정보 재암호화 (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

로컬에 저장된 모든 비밀 정보 — 액세스 키 비밀 정보와 JWT 서명 키 — 를
**활성** 암호화 키로 재암호화하고 각 값에 해당 키의 id를 기록합니다. 외부
비밀 저장소에 보관된 비밀 정보는 건너뜁니다(Semaphore 키링으로 암호화되지
않기 때문입니다).

```bash
semaphore vault rekey
```

### 무중단 키 교체 {#zero-downtime-key-rotation}

활성 키는 새로 쓰는 데이터를 암호화하고, 키셋의 다른 모든 키는 이전 데이터를
계속 복호화할 수 있습니다. 따라서 키 교체는 키 추가, 활성 포인터 전환,
백그라운드 재암호화, 이전 키 제거 순서로 진행됩니다.

1. 키셋에 새 키를 추가하고(`keys_folder`의 파일 또는 `keys:` 항목) 활성
   포인터(`active.secret_key` 또는 `secret_key_file`)가 그 키를 가리키도록 합니다.
   변경 사항은 `keys_poll_interval`(기본값 `15s`) 이내에 적용되거나
   `kill -HUP <pid>`로 즉시 적용됩니다. 재시작이 필요하지 않습니다.
2. `semaphore vault rekey`를 실행하여 기존 데이터를 새 키로 재암호화합니다.
3. [`semaphore vault check`](#checking-key-usage-vault-check)를 실행합니다.
   이전 키가 `0 rows`로 표시되면 키셋에서 안전하게 제거할 수 있습니다.

### 옵션 {#options}

| 플래그 | 설명 |
|------|-------------|
| `--old-key <key>` | 레거시 단일 키 마이그레이션을 위한 명시적 이전 암호화 키. 이전 키가 이미 키셋에 보조 키로 있는 경우에는 필요하지 않습니다. 키 id가 기록되지 않은 접두사 없는(레거시) 데이터를 복호화하는 데 사용됩니다. |
| `--backup <file>` | 재암호화 전에 현재 액세스 키 암호문의 백업을 `<file>`에 씁니다. |
| `--rollback <file>` | 재암호화 대신 백업 파일에서 액세스 키 암호문을 복원합니다. |

### 백업 및 롤백 {#backup-and-rollback}

재암호화 전에 현재 암호문의 스냅샷을 만들고, 문제가 생기면 복원합니다.

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

백업은 액세스 키마다 한 항목(`project_id`, `key_id`, `secret`)을 담은 JSON
Lines 파일입니다. 롤백은 해당 암호문을 그대로 다시 씁니다.

### 레거시 단일 키 마이그레이션 {#legacy-single-key-migration}

데이터가 단일 `access_key_encryption` 키를 사용하던(키 교체 없음, 키 id 기록
없음) 이전 Semaphore로 암호화된 경우, 활성 키로 재암호화하기 전에 복호화할 수
있도록 해당 키를 명시적으로 전달합니다.

```bash
semaphore vault rekey --old-key <base64-old-key>
```

이전 키가 키셋에 포함되어 있으면 이 작업은 필요하지 않습니다. Semaphore는
각 값을 기록된 id로 조회하여 일치하는 키로 자동 복호화합니다.

## 키 사용 현황 확인 (`vault check`) {#checking-key-usage-vault-check}

읽기 전용입니다. 키 id별로 로컬에 저장된 액세스 키 비밀 정보(및 JWT 서명 키)
중 몇 개를 해당 키가 암호화하는지와 JWT 서명 키의 상태를 보고합니다.
`vault rekey` 이후에 실행하여 폐기된 키를 안전하게 제거할 수 있는지 확인하십시오.
참조가 0개인 키는 키셋에서 삭제할 수 있습니다.

```bash
semaphore vault check
```

출력 예시:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

각 키 id는 다음 상태 중 하나로 보고됩니다.

| 상태 | 의미 |
|--------|---------|
| `active` | 현재 새로 쓰는 데이터를 암호화하는 키입니다. |
| `retired, rekey pending` | 이 키가 아직 일부 행을 암호화하고 있습니다. `vault rekey`를 실행하여 활성 키로 옮기십시오. |
| `retired, SAFE TO REMOVE` | 이 키를 참조하는 행이 없습니다(`0 rows`). 키셋에서 제거할 수 있습니다. |
| `legacy (no id)` | 키 id가 도입되기 전에 암호화된 행입니다. rekey를 실행하여 id를 기록하십시오. |
| `MISSING KEY (cannot decrypt)` | 참조된 키 id가 키셋에 없습니다. |

마지막 줄은 JWT 서명 키를 어떤 키가 암호화하는지 보고하며, 아직 생성된 키가
없으면 `JWT signing key: not set`을 출력합니다.

키셋에 없는 키 id를 참조하는 비밀 정보가 하나라도 있으면 명령은 해당 행을
표시하고 **0이 아닌 상태로 종료됩니다**. 해당 데이터를 복호화하려면 누락된 키를
키셋에 다시 추가하십시오.
