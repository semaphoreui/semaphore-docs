# 데이터베이스 마이그레이션

`semaphore migrate` 명령은 Semaphore 데이터베이스 스키마를 지정한 Semaphore
버전에 맞게 업데이트하거나 롤백합니다. 업그레이드와 다운그레이드에 사용합니다.

```bash
semaphore migrate --help
```

:::info
`migrate`를 직접 실행해야 하는 경우는 드뭅니다. `semaphore server`, `semaphore setup`
및 데이터베이스를 사용하는 다른 모든 CLI 명령은 실행 전에 보류 중인 마이그레이션을
자동으로 적용합니다. `migrate`는 서버를 시작하지 않고 마이그레이션을 적용하거나
롤백할 때 사용합니다.
:::

:::warning
마이그레이션을 적용하거나 롤백하기 전에 항상 데이터베이스를 백업하십시오.
:::

## 마이그레이션 적용 {#applying-migrations}

보류 중인 모든 마이그레이션을 적용하여 데이터베이스를 최신 상태로 만듭니다.

```bash
semaphore migrate --config /path/to/config.json
```

특정 버전까지만 마이그레이션을 적용합니다.

```bash
semaphore migrate --apply-to 2.15.1
```

## 마이그레이션 롤백 {#rolling-back-migrations}

이전 버전까지 마이그레이션을 되돌립니다.

```bash
semaphore migrate --undo-to 2.13
```

다운그레이드하려는 Semaphore 버전을 지정합니다. `migrate`를 실행하는 바이너리는
되돌리는 모든 마이그레이션을 알고 있어야 하므로, 이전 버전을 설치하기 전에
**더 새로운** 바이너리로 실행하십시오.

## 옵션 {#options}

| 플래그 | 설명 |
|------|-------------|
| `--apply-to <version>` | 이 버전까지(해당 버전 포함) 마이그레이션을 적용합니다(예: `2.15` 또는 `2.14.4`). |
| `--undo-to <version>` | 이 버전까지 마이그레이션을 롤백합니다. |

`--apply-to`와 `--undo-to`는 동시에 사용할 수 없으며, 둘 다 전달하면 오류가
발생합니다. 두 플래그 모두 없으면 보류 중인 모든 마이그레이션이 적용됩니다.

완료되면 명령은 사용한 데이터베이스 연결 정보를 출력합니다.

:::note
`semaphore migrate`는 하위 호환성을 위해 `--err-log-size`, `--skip-task-output`,
`--merge-existing-users`를 계속 받아들이지만, 2.19 이상에서는 아무 효과가
없습니다. 이 플래그들은 아래에 설명된 BoltDB 가져오기에 속했던 것입니다.
:::

## BoltDB에서 SQLite/MySQL/PostgreSQL로 마이그레이션 {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*버전 2.17 및 2.18에서만 사용 가능*

BoltDB는 버전 2.16부터 사용 중단(deprecated)되었으며, **버전 2.19에서 지원이
제거되었습니다**. `--from-boltdb` 플래그와 `SEMAPHORE_MIGRATE_FROM_BOLTDB`
환경 변수는 2.19 이상에서 더 이상 존재하지 않으며, `semaphore setup`은 BoltDB
데이터베이스 구성을 거부합니다.

:::warning
아직 BoltDB를 사용 중이라면 2.19 이상으로 업그레이드하기 **전에** 마이그레이션하십시오.
Semaphore **2.17 또는 2.18**을 설치하고 아래 마이그레이션을 수행한 다음에만
더 새로운 버전으로 업그레이드하십시오.
:::

마이그레이션하려면 먼저 Semaphore 버전 2.17 또는 2.18을 설치한 다음
`config.json`에 대상 데이터베이스(SQLite, MySQL 또는 PostgreSQL)를 구성합니다.
그다음 아래 명령을 실행하여 기존 BoltDB 파일의 모든 데이터를 새 데이터베이스로
가져옵니다.

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

이 명령은 BoltDB에서 모든 프로젝트, 템플릿, inventory, 저장소, 키, 사용자,
작업 기록을 읽어 현재 Semaphore 구성에 지정된 데이터베이스에 씁니다.
원본 BoltDB 파일은 수정되지 않습니다.

추가 인수(2.17 및 2.18에서만):

| 플래그 | 설명 |
|------|-------------|
| `--err-log-size <n>` | 출력에 표시할 최대 오류 줄 수. |
| `--skip-task-output` | 작업 출력을 가져오지 않습니다. |
| `--merge-existing-users` | 충돌 시 실패하는 대신 사용자 이름이 일치하는 기존 사용자를 재사용합니다. |

Semaphore UI Docker 컨테이너를 사용하는 경우 `SEMAPHORE_MIGRATE_FROM_BOLTDB`
환경 변수를 설정하여 기존 BoltDB 데이터베이스를 자동으로 가져올 수 있습니다.
가져오기는 컨테이너의 최초 시작 시 한 번만 실행됩니다. 예:

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## 문제 해결 {#troubleshooting}

- 마이그레이션이 실패하면 로그에서 자세한 내용을 확인하고 CLI 바이너리가
  Semaphore 서버와 같은 버전인지 확인하십시오.
- CLI가 서버와 같은 구성 파일(따라서 같은 데이터베이스)을 사용하는지
  확인하십시오.
  [구성 파일을 찾는 방법](/reference/cli#how-the-configuration-file-is-found)을 참고하십시오.
