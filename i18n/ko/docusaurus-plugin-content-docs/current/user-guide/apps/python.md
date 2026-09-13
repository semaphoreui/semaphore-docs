
# Python

Semaphore는 Python 스크립트를 직접 실행할 수 있습니다. 이를 위해 **Python** 작업 템플릿을 생성하십시오.

## Python 템플릿 생성 {#creating-a-python-template}

1. **작업 템플릿** 섹션으로 이동하여 **새 템플릿** 버튼을 클릭합니다.
2. 앱 유형으로 **Python**을 선택합니다.
3. 템플릿을 설정합니다:

| 필드 | 설명 |
|---|---|
| **이름** | 템플릿을 설명하는 이름 |
| **리포지토리** | `.py` 스크립트가 들어 있는 리포지토리 |
| **Playbook / Script** | 스크립트의 상대 경로, 예: `scripts/deploy.py` |
| **변수 그룹** | 값이 환경 변수로 주입되는 변수 그룹 |

4. **생성**을 클릭합니다.
5. **실행**을 클릭해 템플릿을 실행합니다.

## 스크립트에 변수 전달 {#passing-variables-to-scripts}

선택한 **변수 그룹**의 변수는 환경 변수로 주입됩니다. Python에서 `os.environ`으로 접근하십시오:

```python
import os

target = os.environ.get("TARGET_HOST")
print(f"Deploying to {target}")
```

## Python 버전 및 의존성 {#python-version-and-dependencies}

Semaphore는 실행 환경의 `PATH`에 있는 `python3` 바이너리를 사용합니다.

- **바이너리/패키지 설치**: 호스트에 올바른 `python3`이 설치되어 있는지 확인하십시오.
- **Docker**: 필요한 Python 버전이 포함된 사용자 지정 이미지를 사용하십시오.
- **Docker(추가 패키지)**: 서버 또는 러너 컨테이너의 `/etc/semaphore/requirements.txt`에 `requirements.txt`를 마운트하십시오. Semaphore는 컨테이너가 시작될 때마다 이를 내장 Python 가상 환경에 설치합니다. [추가 Python 의존성 설치](/admin-guide/installation/docker#installing-additional-python-dependencies)를 참조하십시오.

## 참고 사항 {#notes}

- 스크립트는 비대화형으로 실행됩니다.
- 종료 코드 `0`은 성공을 의미하며, 0이 아닌 종료 코드는 작업을 실패로 표시합니다.
