# 프로젝트

`semaphore projects` 명령은 프로젝트를 백업 파일로 내보내고 가져옵니다.
백업은 프로젝트의 템플릿, inventory, 저장소, 환경, 키, 일정 및 관련 설정을
담은 하나의 JSON 문서입니다.

```bash
semaphore projects --help
```

> `project`는 `projects`의 별칭입니다.

두 개의 하위 명령이 있습니다.

| 명령 | 용도 |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | 프로젝트 백업을 파일(또는 stdout)에 씁니다. |
| [`projects import`](#importing-projects-projects-import) | 백업 파일에서 하나 이상의 프로젝트를 복원합니다. |

## 프로젝트 내보내기 (`projects export`) {#exporting-a-project-projects-export}

숫자 ID 또는 이름으로 식별되는 단일 프로젝트를 내보냅니다.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| 플래그 | 설명 |
|------|-------------|
| `--project-id <id>` | 내보낼 프로젝트의 ID. |
| `--project-name <name>` | 내보낼 프로젝트의 이름(대소문자 구분 없이 일치). |
| `--file <path>` | 백업을 이 파일에 씁니다. 생략하면 백업이 stdout으로 출력됩니다. |

`--project-id` 또는 `--project-name` 중 정확히 하나가 필요합니다. 둘 다
지정하거나 둘 다 지정하지 않으면 오류가 발생합니다.

## 프로젝트 가져오기 (`projects import`) {#importing-projects-projects-import}

하나 이상의 프로젝트 백업을 가져옵니다. 단일 파일을 가져오거나 디렉터리에서
찾은 모든 백업을 가져올 수 있습니다. 가져온 각 프로젝트는 기존 관리자(데이터베이스의
첫 번째 관리자, 관리자가 없으면 첫 번째 사용자)가 소유하는 **새** 프로젝트로
생성되므로, 가져오기가 기존 프로젝트를 덮어쓰는 일은 없습니다.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| 플래그 | 설명 |
|------|-------------|
| `--file <path>` | 가져올 단일 백업 파일의 경로. |
| `--dir <path>` | 백업 파일을 검색할 디렉터리. `.json`, `.backup` 또는 `.bk`로 끝나는 파일을 정렬된 순서로 가져옵니다. |
| `--project-name <name>` | 가져온 프로젝트의 이름을 재정의합니다. `--file`과 함께만 사용할 수 있습니다. |

`--file` 또는 `--dir` 중 정확히 하나가 필요합니다. 둘 다 지정하거나 둘 다
지정하지 않으면 오류가 발생합니다. `--project-name`은 `--file`과만 함께 사용할 수 있습니다.

디렉터리를 가져올 때 가져오기에 실패한 파일은 보고된 후 건너뛰며, 명령은
나머지 파일을 계속 처리하고 아무것도 가져오지 못한 경우에만 0이 아닌 상태로
종료됩니다.
