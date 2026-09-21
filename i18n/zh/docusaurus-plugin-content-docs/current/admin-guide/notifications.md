---
title: 通知
description: Semaphore 如何投递任务告警、支持哪些渠道，以及服务器全局渠道与项目级告警的关系。
---

# 通知

Semaphore 通过两种方式将任务结果报告到聊天工具和邮件：

- **服务器渠道**在服务器上通过 `config.json` 或环境变量配置一次，对所有项目可用。本页介绍这些渠道。
- **项目告警**是项目成员在项目的[告警](/user-guide/projects/alerts)标签页中创建的具名目标，拥有各自的聊天、Webhook 或收件人，并绑定到模板和计划任务。

## 投递如何工作 {#how-delivery-works}

对于服务器渠道，三项设置决定是否发送消息，且三项都必须允许：

1. **渠道已在服务器上配置。** 每个提供方在 `config.json` 中都有自己的键。参见下面对应提供方的页面。
2. **项目使用服务器渠道。** 项目[告警](/user-guide/projects/alerts#server-channels)标签页中的 *将本项目的告警发送到服务器渠道* 是总开关。关闭时，服务器渠道不会为该项目发送任何内容。项目告警不受此开关影响。
3. **模板要求发送。** 使用*项目默认*的模板会发送到服务器渠道；使用自定义告警列表的模板则不会。模板还可以抑制成功或失败通知，参见[任务模板](/user-guide/task-templates)。

聊天渠道报告成功、失败和等待确认的任务；邮件只报告失败。项目告警可以按目标覆盖事件。

在告警标签页使用 **全部测试**，无需运行任务即可通过每个服务器渠道和每个已启用的项目告警发送测试消息。

## 渠道 {#channels}

| 渠道 | 页面 |
|---|---|
| 邮件 (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

可以同时启用多个渠道；每个渠道都会收到通过上述三项检查的所有告警。项目告警可以使用同样的提供方：邮件和 Telegram 项目告警复用服务器配置中的 SMTP 服务器和机器人令牌，没有自己 URL 和令牌的 Gotify 项目告警复用服务器全局的一对。

## 项目级覆盖 {#per-project-overrides}

Telegram 支持每个项目使用单独的聊天：在项目的[告警](/user-guide/projects/alerts#server-channels)标签页设置 **Telegram Chat ID**，即可将该项目的服务器渠道消息发送到与全局不同的聊天。对于其他任何项目级目标，请创建[项目告警](/user-guide/projects/alerts#project-alerts)。

## 从哪里开始 {#where-to-start}

先配置一个渠道，打开项目的告警标签页，开启 *将本项目的告警发送到服务器渠道* 并点击 **全部测试**。收到测试消息后，再调整相关模板。
