# Microsoft Teams

Microsoft Teams 알림은 Semaphore의 작업 결과를 Teams 채널로 바로 전달합니다. 각 메시지는 카드 형태이며, 템플릿 이름, 작업 상태, 작업을 시작한 사용자, 그리고 Semaphore에서 작업을 여는 버튼이 포함됩니다.

Teams 알림을 설정하려면 Semaphore를 채널에 연결하는 webhook URL이 필요합니다. Teams에서는 이 URL을 **Workflows** 앱으로 만듭니다. 이 앱은 Microsoft Power Automate를 기반으로 하며 Semaphore의 워크플로와는 관련이 없습니다.

:::warning
Microsoft는 2026년 5월에 기존 **Incoming Webhook** 커넥터를 포함한 Teams의 Office 365 커넥터를 종료했습니다. `webhook.office.com`의 webhook URL로는 더 이상 메시지가 전달되지 않습니다. 아래 설명에 따라 Workflows 앱으로 새 URL을 만드십시오.
:::

## Teams webhook 만들기 {#creating-teams-webhook}

### 1단계. 채널의 Workflows 열기 {#step-1-open-workflows-for-the-channel}

1. Microsoft Teams에서 알림을 받을 팀과 채널로 이동합니다.
2. 채널 이름 옆의 **More options (…)** 를 클릭합니다.
3. **Workflows**를 선택합니다.

---

### 2단계. 템플릿으로 워크플로 만들기 {#step-2-create-a-workflow-from-the-template}

1. **Send webhook alerts to a channel** 템플릿을 검색하여 선택합니다.
2. 워크플로 매개변수에서 메시지가 게시될 **Team**과 **Channel**을 확인합니다.
3. **Save**를 클릭합니다.

Semaphore는 인증 헤더 없이 요청을 보내므로 이 템플릿을 사용해야 하며, *from specific people* 또는 *from people in an org* 변형은 사용하지 마십시오.

---

### 3단계. webhook URL 복사 {#step-3-copy-the-webhook-url}

1. 워크플로가 만들어지면 Teams에 해당 webhook 링크가 표시됩니다. 이 링크를 복사합니다.
2. URL은 길며 다음과 비슷한 형태입니다:

   ```
   https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
   ```

webhook을 보호하는 수단은 `sig` 매개변수뿐입니다. URL을 가진 사람은 누구나 채널에 게시할 수 있으므로 URL 전체를 비밀 정보로 취급하십시오.

---

### 4단계. webhook 테스트 {#step-4-test-your-webhook}

`curl`을 사용하여 테스트합니다:

```bash
curl -i -X POST -H 'Content-Type: application/json' \
--data '{"type":"message","attachments":[{"contentType":"application/vnd.microsoft.card.adaptive","content":{"$schema":"http://adaptivecards.io/schemas/adaptive-card.json","type":"AdaptiveCard","version":"1.4","body":[{"type":"TextBlock","text":"Hello from Semaphore UI 🚀"}]}}]}' \
'https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx'
```

이 요청 본문은 Semaphore가 보내는 메시지와 구조가 같습니다. 즉, Adaptive Card 하나가 첨부된 메시지입니다. 모든 설정이 올바르다면 응답은 `202 Accepted`이고, 몇 초 안에 선택한 Teams 채널에 카드가 표시됩니다.


## Semaphore 설정 {#semaphore-configuration}

Teams webhook URL을 확보했다면 설정 파일 또는 환경 변수를 사용하여 Teams 알림을 활성화할 수 있습니다. 변경 사항을 적용하려면 Semaphore를 다시 시작하십시오.

### 방법 1: 설정 파일 {#method-1-configuration-file}

Semaphore 설정 파일에 다음 설정을 추가합니다:

- `microsoft_teams_alert`: Teams 알림을 활성화하려면 `true`로 설정합니다
- `microsoft_teams_url`: 이전 단계에서 얻은 webhook URL

`config.json` 예시:

```json
{
    "microsoft_teams_alert": true,
    "microsoft_teams_url": "https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx"
}
```

### 방법 2: 환경 변수 {#method-2-environment-variables}

또는 환경 변수를 사용할 수도 있습니다. 이 방법은 컨테이너 기반 배포 환경이나 webhook URL을 설정 파일에 두고 싶지 않을 때 특히 유용합니다.

```
SEMAPHORE_MICROSOFT_TEAMS_ALERT=True
SEMAPHORE_MICROSOFT_TEAMS_URL=https://xxxxxxxxxxxxxxxx.xx.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/xxxxxxxxxxxxxxxx/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=xxxxxxxxxxxxxxxx
```

:::tip
URL에는 `&`와 `%` 문자가 포함되어 있습니다. 셸에서 변수를 설정할 때는 URL을 작은따옴표로 감싸십시오. systemd 유닛에서는 `%`가 지정자의 시작으로 해석되므로 `Environment=` 줄 대신 `EnvironmentFile`에 넣으십시오.
:::

## 프로젝트에서 알림 활성화 {#enabling-notifications-for-a-project}

위 설정은 서버 전체에서 이 채널을 켜며, 모든 메시지는 webhook이 속한 하나의 채널로 전송됩니다. 프로젝트는 서버 채널을 사용하는 경우에만 메시지를 받으며, 작업 템플릿에서 성공 또는 실패 메시지를 억제할 수 있습니다. 자세한 내용은 [전달 방식](/admin-guide/notifications#how-delivery-works)을 참조하십시오. 작업을 실행하지 않고 테스트 메시지를 보내는 방법도 이 문서에서 설명합니다.

Teams 알림은 작업이 성공하거나 실패하거나 확인을 기다릴 때 전송됩니다.

한 프로젝트의 알림을 다른 Teams 채널로 보내려면 자체 webhook URL을 지정한 Microsoft Teams 유형의 [프로젝트 알림](/user-guide/alerts#project-alerts)을 만드십시오.

## 메시지 내용 {#message-content}

| 카드 요소 | 값 |
|---|---|
| 헤더 | `Ansible Task Template Execution by:`와 작업을 시작한 사용자의 이름. 사용자가 시작한 작업이 아니면 `—`. |
| **Task** | 작업 템플릿의 이름. |
| **Status** | 아이콘이 포함된 작업 상태. 예: `✅ SUCCESS`, `❌ ERROR`, `⚠️ WAITING_CONFIRMATION`. |
| **Task ID** | 작업 번호. |
| **Task URL** 버튼 | Semaphore에서 작업을 엽니다. 링크는 `web_host`를 기반으로 만들어지므로 이 옵션을 사용자가 Semaphore에 접속하는 주소로 설정하십시오. |

## 문제 해결 {#troubleshooting}

요청은 러너가 아니라 Semaphore 서버에서 전송되며, 결과는 작업 로그에 기록됩니다. Semaphore는 각 메시지를 한 번만 보내며 재시도하지 않습니다.

| 작업 로그 | 확인할 사항 |
|---|---|
| Microsoft Teams 관련 줄이 없음 | 메시지 전송이 시도되지 않았습니다. `microsoft_teams_alert`가 `true`인지, 프로젝트가 서버 채널을 사용하는지, 템플릿이 알림을 억제하지 않는지 확인하십시오. |
| `Can't send microsoft teams alert! Error: …` | 서버가 webhook 호스트에 연결하지 못했습니다. 서버에서 URL의 호스트로 나가는 HTTPS 연결을 허용하십시오. 프록시를 사용하는 환경에서는 Semaphore 서버에 `HTTPS_PROXY`를 설정하십시오. [회사 프록시 뒤에서 실행하기](/admin-guide/configuration/env-vars#running-behind-a-corporate-proxy)을 참조하십시오. |
| `Can't send microsoft teams alert! Response code: …` | webhook이 요청을 거부했습니다. `sig` 매개변수를 포함해 URL 전체가 복사되었는지, 워크플로가 켜져 있고 삭제되지 않았는지 확인하십시오. Microsoft는 webhook 하나당 초당 요청 수를 4개로 제한합니다. |
| `Sent successfully microsoft teams alert`이지만 채널에 카드가 없음 | 워크플로가 요청을 수락한 뒤 이후 단계에서 실패했습니다. **Workflows** 앱에서 워크플로를 열고 실행 기록을 확인하십시오. 워크플로는 만든 사용자에게 속하며, 해당 사용자가 조직을 떠나거나 채널에 대한 접근 권한을 잃으면 작동을 멈춥니다. 따라서 워크플로에 공동 소유자를 추가하십시오. |
