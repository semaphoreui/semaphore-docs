# AWS Secrets Manager 시크릿 스토리지

<Enterprise />

Semaphore UI Enterprise는 데이터베이스 대신 **AWS Secrets Manager**를 키 저장소 시크릿의 외부 스토리지로 사용할 수 있습니다.

## 구성 옵션 {#configuration-options}

**키 저장소 → 스토리지**에서 **AWS Secrets Manager** 스토리지를 생성할 때 다음을 구성합니다:

| 필드 | 설명 |
|-------|-------------|
| **리전** | 시크릿이 위치한 AWS 리전(예: `us-east-1`). 필수. |
| **엔드포인트 URL** | 선택적 사용자 지정 엔드포인트. 표준 AWS API 엔드포인트를 사용하려면 비워 두십시오. LocalStack 또는 VPC 엔드포인트에 유용합니다. |
| **IAM 역할 / 인스턴스 프로파일 사용** | 활성화하면 Semaphore가 주변 AWS 자격 증명 체인(EC2 인스턴스 프로파일, ECS 작업 역할, EKS IRSA 등)을 사용하며 정적 액세스 키가 필요하지 않습니다. |
| **액세스 키 ID** | IAM 역할 모드가 꺼져 있을 때 필수. |
| **시크릿 액세스 키** | IAM 역할 모드가 꺼져 있을 때 필수. 데이터베이스에 저장하거나, 환경 변수에서 읽거나, 파일에서 불러올 수 있습니다. |

### IAM 역할과 액세스 키 비교 {#iam-role-vs-access-keys}

- **IAM 역할 / 인스턴스 프로파일**(AWS에서 권장): **IAM 역할 / 인스턴스 프로파일 사용**을 활성화하고 Semaphore 서버 또는 runner 호스트에 참조하는 시크릿을 읽을 수 있는 권한을 부여합니다. Semaphore에 장기 키가 저장되지 않습니다.
- **액세스 키**: 체크박스를 끄고 `secretsmanager:GetSecretValue`(및 동기화를 위한 관련 list/describe 권한)가 있는 IAM 사용자 또는 역할의 액세스 키 쌍을 제공합니다.

기존 스토리지를 편집할 때 저장된 액세스 키 ID가 없으면 Semaphore는 IAM 역할 모드로 간주합니다.

## 사용 방법 {#how-to-use}

1. 프로젝트에서 **키 저장소 → 스토리지**를 열고 **AWS Secrets Manager** 스토리지를 생성합니다.
2. 키를 생성하거나 편집할 때 해당 스토리지를 선택하고 AWS Secrets Manager의 시크릿 이름 또는 ARN을 제공합니다.
3. 선택적으로 [동기화 경로](/user-guide/key-store/secret-sync)를 구성하여 일정에 따라 시크릿을 자동으로 가져옵니다.

이 스토리지는 읽기 전용 모드로 작동할 수 있습니다.

## 시크릿 동기화 {#syncing-secrets}

AWS Secrets Manager의 시크릿은 다른 외부 스토리지와 마찬가지로 키 저장소로 가져와 동기화 상태를 유지할 수 있습니다. 기본 경로 구분자는 `/`입니다. [원격 스토리지에서 시크릿 동기화](/user-guide/key-store/secret-sync)를 참조하십시오.
