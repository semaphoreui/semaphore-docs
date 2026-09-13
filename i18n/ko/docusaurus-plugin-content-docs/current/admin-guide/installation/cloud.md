# 클라우드 배포

지원되는 동일한 설치 방법을 사용하여 어떤 클라우드 환경에서든 Semaphore를 실행할 수 있습니다.

- 가상 머신: 패키지 관리자 또는 바이너리로 설치하고 NGINX 같은 리버스 프록시 뒤에서 실행합니다. 안정성을 위해 관리형 데이터베이스(예: Amazon RDS, Cloud SQL)를 사용하십시오.
- 컨테이너: VM 또는 컨테이너 서비스에서 Docker 또는 Docker Compose로 배포합니다. 영구 볼륨과 환경 구성은 Docker 가이드를 참조하십시오.
- Kubernetes: 공식 Helm 차트로 배포합니다. 클라우드 스토리지 클래스와 관리형 데이터베이스를 사용하십시오.

핵심 사항:

- 로드 밸런서 또는 리버스 프록시에서 외부 URL과 TLS를 구성합니다.
- 민감한 값(DB 자격 증명, OAuth 시크릿)은 안전한 시크릿 관리자 또는 Kubernetes Secrets에 저장합니다.
- 프로덕션에서는 관리형 데이터베이스를 사용하고 정기 백업을 활성화합니다.
- 지연 시간과 이그레스 비용을 줄이기 위해 runner를 워크로드 가까이에 배치합니다.

관련 가이드:

- [Docker](../installation/docker)
- [Kubernetes(Helm 차트)](../installation/k8s)
- [바이너리 파일](../installation/binary-file)
- [보안 강화](../security)
