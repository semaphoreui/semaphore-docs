---
title: "HTTP 백엔드"
sidebar_custom_props:
  edition: pro
---

# HTTP 백엔드 <Pro />

Terraform용 Semaphore UI HTTP 백엔드는 Terraform 상태 파일을 Semaphore 내부에 직접 안전하게 저장하고 관리합니다. Pro 플랜에서 사용할 수 있으며, 다음과 같은 주요 이점을 제공합니다.

## 기능 {#features}

- **안전한 상태 저장**: 상태 파일이 <!-- encrypted and--> Semaphore 내부에 안전하게 저장됩니다.
- **상태 잠금**: 동일한 상태 파일에 대한 동시 수정을 방지합니다.
- **버전 기록**: 시간에 따른 인프라 상태 변경 사항을 추적합니다.
- **UI 통합**: Semaphore 인터페이스에서 직접 상태 파일을 관리합니다.

## 구성 {#configuration}

내장 HTTP 백엔드를 사용하려면 먼저 Terraform 작업 템플릿에 워크스페이스를 생성해야 합니다.

워크스페이스를 추가하려면 Terraform/OpenTofu 템플릿의 **워크스페이스** 탭으로 이동하십시오.

워크스페이스를 생성할 때 Terraform 코드에서 사용하는 비공개 모듈을 복제하기 위한 SSH 키를 선택하라는 메시지가 표시됩니다. 비공개 모듈을 사용하지 않는 경우 `None` 옵션을 선택하면 됩니다.

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### 작업에서 HTTP 백엔드 사용하기 {#using-the-http-backend-in-tasks}

Terraform 작업의 상태를 저장하기 위해 내장 HTTP 백엔드를 사용할 때, Terraform 코드에서 백엔드를 수동으로 구성할 필요가 없습니다. Semaphore가 실행 중에 구성 파일을 자동으로 생성할 수 있습니다. 이를 활성화하려면 아래 스크린샷과 같이 작업 템플릿 설정에서 **백엔드 설정 재정의** 옵션을 체크하기만 하면 됩니다.


선택적으로 실행 중에 동적으로 생성될 구성 파일의 이름을 지정할 수 있습니다. 이는 코드에 이미 백엔드 구성 파일이 포함되어 있고 Semaphore의 내장 백엔드와 함께 작동하도록 동적으로 재정의해야 하는 경우에 유용합니다.

### Semaphore 외부에서 HTTP 백엔드 사용하기 {#using-the-http-backend-outside-semaphore}

내장 HTTP 백엔드는 Semaphore 내부에서 작업을 실행할 때뿐만 아니라, 로컬 터미널 등 Semaphore 외부에서 Terraform 코드를 실행할 때도 사용할 수 있습니다.

이를 위해 Semaphore에서는 상태 저장소에 대한 별칭(고유한 HTTP 엔드포인트)을 생성할 수 있습니다. 이러한 별칭을 사용하면 외부 환경에서 상태 파일을 쉽게 참조할 수 있습니다.

설정하려면 **워크스페이스** 탭으로 이동하여 원하는 워크스페이스를 선택하고 별칭을 추가하십시오. 또한 백엔드 접근 인증에 사용할 사용자 이름과 비밀번호가 포함된 키를 선택해야 합니다.

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

그다음 Terraform 코드에 백엔드 설정을 추가해야 합니다:

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

이제 터미널에서 실행하더라도 Terraform은 Semaphore의 내장 HTTP 백엔드를 사용합니다:

```
terraform apply
```
