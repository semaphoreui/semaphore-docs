# Telegram

### 사전 준비 사항 {#pre-requisites}

Semaphore UI가 Telegram으로 알림을 보내도록 설정하려면 먼저 Telegram 쪽에서 몇 가지 단계를 진행해야 합니다. webhook을 수신할 자체 봇을 만들어야 하고, 메시지를 보낼 채팅의 ID를 알아야 합니다.

#### 봇 설정 {#bot-setup}

자체 봇을 만드는 가장 쉬운 방법은 @BotFather를 사용하는 것입니다.

1. Telegram 클라이언트에서 @BotFather에게 `/start` 메시지를 보냅니다.
1. 안내에 따라 새 봇을 만들고 마지막 단계에서 제공되는 Authorization Token을 기록해 둡니다. 참고: 이 token은 비밀 값이므로 그에 맞게 다루어야 합니다.
1. 새 봇이 메시지를 받을 수 있도록 봇에게 `/start` 메시지를 보내 봇을 시작합니다.

#### 채팅 ID {#chat-id}

1. Telegram 클라이언트에서 @RawDataBot에게 아무 메시지나 보냅니다.
1.  `chat` 맵 안의 `id` 키 값을 복사합니다.

#### 테스트 {#testing}

다음과 같이 cURL을 사용하여 위 설정을 검증할 수 있습니다:

```
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage \
  -d chat_id=YOUR_CHAT_ID \
  -d text="Test message from curl"
```

### 설정 {#configuration}

이전 단계에서 얻은 채팅 ID와 Token을 사용하여 다음과 같이 Semaphore UI가 Telegram 알림을 보내도록 설정할 수 있습니다:

```
telegram_alert: True
telegram_chat: <chat id>
telegram_token: <token>
```

`config.json` 예시:

```json
{
    "telegram_alert": true,
    "telegram_token": "64********:AAG****_rM6obyR********************",
    "telegram_chat":  "",
}
```


### 프로젝트별 채팅 ID {#per-project-chat-ids}

각 프로젝트는 고유한 채팅 ID를 사용할 수 있습니다. 이를 통해 모든 알림을 같은 채팅으로 보내는 대신 프로젝트별로 알림을 분리할 수 있습니다. 이 설정은 위의 전역 채팅 ID를 재정의합니다.
