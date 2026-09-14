# 설치

운영 체제, 환경, 선호도에 따라 여러 방법으로 Semaphore를 설치할 수 있습니다.

## 이 섹션의 내용 {#in-this-section}

| 방법 | 사용할 상황 |
|---|---|
| [패키지 관리자](/admin-guide/installation/package-manager) | Linux 배포판에 맞는 기본 패키지를 사용하려는 경우. |
| [Docker](/admin-guide/installation/docker) | Docker 또는 Docker Compose로 컨테이너에서 Semaphore를 실행하려는 경우. |
| [클라우드](/admin-guide/installation/cloud) | 클라우드 플랫폼에 배포하며 관리형 서비스와 인프라에 관한 안내가 필요한 경우. |
| [바이너리 파일](/admin-guide/installation/binary-file) | 미리 컴파일된 바이너리를 설치하고 프로세스를 직접 관리하려는 경우. |
| [Kubernetes(Helm 차트)](/admin-guide/installation/k8s) | 이미 Kubernetes를 사용하고 있으며 Helm으로 배포를 관리하려는 경우. |

## 추가 Python 패키지 설치 {#installing-additional-python-packages}

일부 Ansible 모듈과 role은 실행에 추가 Python 패키지가 필요합니다. 추가 Python 패키지를 설치하려면 `requirements.txt` 파일을 만들어 컨테이너의 `/etc/semaphore` 디렉터리에 마운트합니다. 예를 들어 `docker-compose.yml` 파일에 다음 줄을 추가할 수 있습니다.

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

requirements 파일에 지정된 패키지는 컨테이너가 시작될 때마다 번들된 Ansible 가상 환경에 설치됩니다. 동일한 마운트가 `semaphoreui/runner` 이미지에도 적용됩니다. 자세한 내용과 사용자 정의 이미지 대안은 [추가 Python 의존성 설치](/admin-guide/installation/docker#installing-additional-python-dependencies)를 참조하십시오.

Python requirements 파일에 대한 자세한 내용은 [Pip Requirements File Format 참조 문서](https://pip.pypa.io/en/stable/reference/requirements-file-format/)를 참조하십시오.

## 시작하기 {#where-to-start}

배포 환경에 맞는 가이드부터 시작하세요. 바이너리로 설치하는 경우 Semaphore가 계속 실행되도록 서비스 실행 지침을 따르세요. 서비스 사용자, Python 의존성 및 systemd 설정은 수동 설치 가이드를 참고하세요.

* [서비스로 실행](/admin-guide/installation/binary-file#run-as-a-service)
* [수동 설치](/admin-guide/installation_manually)
