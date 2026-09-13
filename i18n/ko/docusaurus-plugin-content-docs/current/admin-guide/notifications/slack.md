# Slack

Slack 알림을 사용하면 Semaphore 워크플로에 대한 실시간 업데이트를 Slack 채널에서 바로 받을 수 있습니다. 이 연동을 통해 팀은 Semaphore 대시보드를 계속 확인하지 않고도 빌드 상태, 배포 결과 및 기타 중요한 이벤트를 파악할 수 있습니다.

Slack 알림을 설정하려면 Semaphore를 원하는 Slack 채널에 연결하는 webhook URL을 만들어야 합니다. 이 webhook은 두 플랫폼 사이의 안전한 통신 다리 역할을 합니다.

## Slack webhook 만들기 {#creating-slack-webhook}

### 1단계. Slack API 설정 열기 {#step-1-open-slack-api-settings}

1. [https://api.slack.com/apps](https://api.slack.com/apps)로 이동합니다.
2. **Create New App**을 클릭한 다음 **From Scratch**를 선택합니다.
3. 앱 이름(예: `Semaphore Bot`)을 지정하고 **Slack 워크스페이스**를 선택합니다.

---

### 2단계. Incoming Webhooks 활성화 {#step-2-enable-incoming-webhooks}

1. 앱 설정에서 **Features → Incoming Webhooks**로 이동합니다.
2. **Activate Incoming Webhooks**를 **On**으로 전환합니다.

---

### 3단계. webhook URL 만들기 {#step-3-create-a-webhook-url}

1. **Add New Webhook to Workspace**를 클릭합니다.
2. 메시지를 보낼 xx채널xx을 선택합니다.
3. **Allow**를 클릭합니다.
4. 다음과 같은 **Webhook URL**이 표시됩니다:

   ```
   https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

### 4단계. webhook 테스트 {#step-4-test-your-webhook}

`curl`을 사용하여 테스트합니다:

```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Hello from Semaphore UI 🚀"}' \
https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```

모든 설정이 올바르다면 선택한 Slack 채널에 메시지가 표시됩니다.


## Semaphore 설정 {#semaphore-configuration}

Slack webhook URL을 확보했다면 여러 방법으로 Semaphore가 알림을 보내도록 설정할 수 있습니다:

설정 파일 또는 환경 변수를 사용하여 Slack 알림을 활성화할 수 있습니다.

### 방법 1: 설정 파일 {#method-1-configuration-file}

Semaphore 설정 파일에 다음 설정을 추가합니다:

- `slack_alert`: Slack 알림을 활성화하려면 `true`로 설정합니다
- `slack_url`: 이전 단계에서 얻은 webhook URL

`config.json` 예시:

```json
{
    "slack_alert": true,
    "slack_url": "https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx",
}
```

### 방법 2: 환경 변수 {#method-2-environment-variables}

또는 환경 변수를 사용하여 Slack 알림을 설정할 수도 있습니다. 이 방법은 컨테이너 기반 배포 환경이나 민감한 정보를 설정 파일과 분리하고 싶을 때 특히 유용합니다.

```
SEMAPHORE_SLACK_ALERT=True
SEMAPHORE_SLACK_URL=https://hooks.slack.com/services/xxxxxxxxxxx/xxxxxxxxxxx/xxxxxxxxxxxxxxxxxxxxxxxx
```
