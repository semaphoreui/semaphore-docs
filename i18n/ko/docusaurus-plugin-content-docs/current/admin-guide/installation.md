# 설치

운영 체제, 환경, 선호도에 따라 여러 방법으로 Semaphore를 설치할 수 있습니다.

* **패키지 관리자**<br />
  배포판용 네이티브 패키지(예: Debian/Ubuntu의 apt, RHEL 계열 시스템의 dnf)를 사용하여 Semaphore를 설치합니다. Linux 서버에서 시작하는 가장 쉬운 방법이며 시스템 서비스와 잘 통합됩니다.<br />
  [자세히 알아보기 »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Docker 또는 Docker Compose를 사용하여 Semaphore를 컨테이너로 실행합니다. 빠른 설정, 샌드박스 환경, CI/CD 파이프라인에 이상적입니다. 코드형 인프라(Infrastructure as Code)를 선호하는 사용자에게 권장됩니다.<br />
  [자세히 알아보기 »](/admin-guide/installation/docker)

* **클라우드**<br />
  VM, 컨테이너 또는 관리형 서비스와 함께 Kubernetes를 사용하여 클라우드 플랫폼에 Semaphore를 배포하기 위한 안내입니다.<br />
  [자세히 알아보기 »](/admin-guide/installation/cloud)

* **바이너리 파일**<br />
  릴리스 페이지에서 미리 컴파일된 바이너리를 다운로드합니다. 수동 설치나 사용자 정의 워크플로에 포함하기에 적합합니다. Linux, macOS, Windows(WSL을 통해)에서 동작합니다.<br />
  [자세히 알아보기 »](/admin-guide/installation/binary-file)

* **Kubernetes(Helm 차트)**<br />
  Helm을 사용하여 Kubernetes 클러스터에 Semaphore를 배포합니다. 프로덕션 수준의 확장 가능한 인프라에 가장 적합합니다. Helm values를 통한 간편한 구성과 업그레이드를 지원합니다.<br />
  [자세히 알아보기 »](/admin-guide/installation/k8s)

참고:
* [서비스로 실행](/admin-guide/installation/binary-file#run-as-a-service)
* [수동 설치](/admin-guide/installation_manually)

----


### 추가 Python 패키지 설치 {#installing-additional-python-packages}

일부 Ansible 모듈과 role은 실행에 추가 Python 패키지가 필요합니다. 추가 Python 패키지를 설치하려면 `requirements.txt` 파일을 만들어 컨테이너의 `/etc/semaphore` 디렉터리에 마운트합니다. 예를 들어 `docker-compose.yml` 파일에 다음 줄을 추가할 수 있습니다.

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

requirements 파일에 지정된 패키지는 컨테이너가 시작될 때마다 번들된 Ansible 가상 환경에 설치됩니다. 동일한 마운트가 `semaphoreui/runner` 이미지에도 적용됩니다. 자세한 내용과 사용자 정의 이미지 대안은 [추가 Python 의존성 설치](/admin-guide/installation/docker#installing-additional-python-dependencies)를 참조하십시오.

Python requirements 파일에 대한 자세한 내용은 [Pip Requirements File Format 참조 문서](https://pip.pypa.io/en/stable/reference/requirements-file-format/)를 참조하십시오.
