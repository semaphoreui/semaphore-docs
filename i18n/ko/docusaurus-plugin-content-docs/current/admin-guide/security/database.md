
# 데이터베이스 보안

## 데이터 암호화 {#data-encryption}

민감한 데이터는 데이터베이스에 암호화된 형태로 저장됩니다. Access Key 암호화를 활성화하려면 구성 파일에서 구성 옵션 `access_key_encryption`을 설정해야 합니다. 이 값은 다음 명령으로 생성해야 합니다:

```bash
head -c32 /dev/urandom | base64