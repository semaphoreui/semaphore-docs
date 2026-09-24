---
title: 알림
description: Semaphore가 작업 알림을 전달하는 방식, 지원하는 채널, 서버 전체 채널과 프로젝트별 알림의 관계.
---

# 알림

Semaphore는 작업 결과를 두 가지 방식으로 채팅과 이메일에 보고합니다.

- **서버 채널**은 서버에서 `config.json` 또는 환경 변수로 한 번 설정되며 모든 프로젝트에서 사용할 수 있습니다. 이 페이지에서 설명합니다.
- **프로젝트 알림**은 프로젝트 구성원이 프로젝트의 [알림](/user-guide/alerts) 탭에서 만드는 이름이 있는 대상으로, 자체 채팅, 웹훅 또는 수신자를 가지며 템플릿과 스케줄에 연결됩니다.

## 전달 방식 {#how-delivery-works}

서버 채널의 경우 세 가지 설정이 메시지 전송 여부를 결정하며, 세 가지 모두 허용해야 합니다.

1. **채널이 서버에 설정되어 있습니다.** 각 제공자는 `config.json`에 고유한 키를 가집니다. 아래 해당 제공자 페이지를 참고하세요.
2. **프로젝트가 서버 채널을 사용합니다.** 프로젝트의 [알림](/user-guide/alerts#server-channels) 탭에 있는 *이 프로젝트의 알림을 서버 채널로 보내기*가 주 스위치입니다. 꺼져 있으면 서버 채널은 해당 프로젝트에 대해 아무것도 보내지 않습니다. 프로젝트 알림은 이 스위치의 영향을 받지 않습니다.
3. **템플릿이 요청합니다.** *프로젝트 기본값*을 사용하는 템플릿은 서버 채널로 보내고, 사용자 지정 알림 목록을 가진 템플릿은 보내지 않습니다. 템플릿은 성공 또는 실패 알림을 억제할 수도 있습니다. [작업 템플릿](/user-guide/task-templates)을 참고하세요.

채팅 채널은 성공, 실패, 확인 대기 중인 작업을 보고하며, 이메일은 실패만 보고합니다. 프로젝트 알림은 대상별로 이벤트를 재정의할 수 있습니다.

알림 탭의 **모두 테스트**를 사용하면 작업을 실행하지 않고 모든 서버 채널과 활성화된 프로젝트 알림으로 테스트 메시지를 보낼 수 있습니다.

## 채널 {#channels}

| 채널 | 페이지 |
|---|---|
| 이메일 (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

여러 채널을 동시에 활성화할 수 있으며, 각 채널은 위의 세 가지 확인을 통과한 모든 알림을 받습니다. 같은 제공자를 프로젝트 알림에도 사용할 수 있습니다. 이메일과 Telegram 프로젝트 알림은 서버 설정의 SMTP 서버와 봇 토큰을 재사용하고, 자체 URL과 토큰이 없는 Gotify 프로젝트 알림은 서버 전체 쌍을 재사용합니다.

## 프로젝트별 재정의 {#per-project-overrides}

Telegram은 프로젝트별 채팅을 지원합니다. 프로젝트의 [알림](/user-guide/alerts#server-channels) 탭에서 **Telegram Chat ID**를 설정하면 해당 프로젝트의 서버 채널 메시지를 서버 전체와 다른 채팅으로 보낼 수 있습니다. 그 외의 프로젝트별 대상은 [프로젝트 알림](/user-guide/alerts#project-alerts)을 만드세요.

## 시작하기 {#where-to-start}

먼저 채널 하나를 설정하고, 프로젝트의 알림 탭을 열어 *이 프로젝트의 알림을 서버 채널로 보내기*를 켠 뒤 **모두 테스트**를 누르세요. 테스트 메시지가 도착하면 필요한 템플릿을 조정합니다.
