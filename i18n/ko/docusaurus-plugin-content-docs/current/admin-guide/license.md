---
title: "라이선스 활성화"
---

# 라이선스 활성화 <Pro />

Semaphore Pro 및 Enterprise 기능은 라이선스 키로 활성화됩니다. 웹 UI에서 라이선스를 활성화하거나, 자동화된 배포를 위해 서버 구성에 키를 제공할 수 있습니다.

## 시작하기 전에 {#before-you-start}

- Pro 또는 Enterprise를 활성화하기 위해 Semaphore UI를 재설치하거나 다른 빌드로 전환할 필요가 없습니다. 현재 사용 중인 Semaphore UI 버전을 라이선스 키로 활성화할 수 있습니다. 최신 Pro 또는 Enterprise 기능을 사용하려면 최신 버전으로 업데이트하십시오.
- 관리자 계정으로 로그인하십시오.
- 라이선스 키를 준비하십시오. 구매 이메일 또는 [Semaphore UI 포털](https://portal.semaphoreui.com/auth/login)에서 확인할 수 있습니다.

## 웹 UI에서 활성화 {#activate-from-the-web-ui}

1. 관리자로 Semaphore UI에 로그인합니다.

![Semaphore UI 로그인 화면](/assets/subscription-login-screen.png)

2. 왼쪽 하단의 사용자 영역에서 관리자 메뉴를 엽니다.

![왼쪽 하단의 관리자 메뉴 트리거](/assets/subscription-admin-menu-trigger.png)

3. **PRO 또는 EE로 업그레이드**를 선택합니다.

![PRO 또는 EE로 업그레이드 항목이 있는 관리자 메뉴](/assets/subscription-upgrade-menu-item.png)

4. 활성화 대화 상자에 라이선스 키를 붙여넣고 **새 키 활성화**를 클릭합니다.

![Semaphore Pro 활성화 대화 상자](/assets/subscription-activation-dialog.png)

활성화에 성공하면 Semaphore UI가 **구독 및 결제** 대화 상자에 현재 라이선스 정보를 표시합니다.

![활성화 성공 후의 구독 및 결제 대화 상자](/assets/subscription-activation-success.png)

## 구성에서 활성화 {#activate-from-configuration}

Docker, Kubernetes, systemd 또는 기타 자동화된 배포의 경우 UI에 입력하는 대신 서버 구성에 라이선스 키를 제공합니다. 구성 옵션 이름은 `subscription.*`을 사용합니다.

`config.json`에서:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

또는 환경 변수로:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

키를 파일에 저장할 수도 있습니다.

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

또는:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

라이선스 키가 구성으로 관리되는 경우 Semaphore UI는 **구독 및 결제** 대화 상자의 편집 및 활성화 컨트롤을 비활성화합니다. 서버가 시작 시 키 파일을 읽어 런타임 라이선스 키로 사용하기 때문에, 이는 `subscription.key`와 `subscription.key_file` 모두에 적용됩니다.

## 라이선스 키 관리 또는 교체 {#manage-or-replace-a-license-key}

라이선스를 갱신, 교체 또는 확인하려면 관리자 메뉴를 열고 **구독 및 결제**를 선택합니다.

![구독 및 결제 항목이 있는 관리자 메뉴](/assets/subscription-billing-menu-item.png)

웹 UI에서 관리하는 라이선스 키의 경우 **구독 및 결제** 대화 상자의 작업 메뉴를 열어 키를 다시 불러오거나, 업로드하거나, 초기화할 수 있습니다.

![키 작업이 있는 구독 및 결제 대화 상자](/assets/subscription-key-actions-menu.png)

키가 서버에 구성된 경우:

1. `subscription.key` 값을 교체하거나 `subscription.key_file`이 참조하는 파일의 내용을 업데이트합니다.
2. 서버가 라이선스 키를 다시 불러오도록 Semaphore UI를 재시작합니다.
3. Semaphore UI에서 예상되는 Pro 또는 Enterprise 옵션을 사용할 수 있는지 확인합니다.
