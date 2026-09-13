---
title: 通知
description: Semaphore がタスクのアラートをどのように配信するか、対応しているチャンネル、および何かを送信するために必ずオンにする必要がある 2 つのスイッチについて説明します。
---

# 通知

Semaphore はタスクの結果をチャットとメールに通知します。チャンネルはサーバー上で
`config.json` または環境変数を使って一度だけ設定し、以後はすべてのプロジェクトに適用され
ます。どのタスクがアラートを発生させるかは、Web インターフェース上でプロジェクトごと、
テンプレートごとに決まります。

## 配信の仕組み {#how-delivery-works}

メッセージが送信されるかどうかは 3 つの設定で決まり、その 3 つすべてが許可している必要が
あります。

1. **チャンネルがサーバー上で設定されていること。** 各プロバイダーは `config.json` に
   独自のキーを持ちます。以下にある各プロバイダーのページを参照してください。
2. **プロジェクトがアラートを許可していること。**
   [プロジェクト設定](/user-guide/projects/settings)の *Allow alerts for this project* が
   マスタースイッチです。これをオフにすると、そのプロジェクトについてどのチャンネルも
   何も送信しません。
3. **テンプレートがアラートを要求していること。** タスクテンプレートでは、成功時に通知するか、
   エラー時に通知するか、まったく通知しないかを選びます。[タスクテンプレート](/user-guide/task-templates)を参照してください。

プロジェクト設定の **Test alerts** を使うと、タスクを実行せずに、設定済みのすべての
チャンネルへテストメッセージを送信できます。

## チャンネル {#channels}

| チャンネル | ページ |
|---|---|
| メール (SMTP) | [メール](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

複数のチャンネルを同時に有効にできます。上記の 3 つの条件を満たしたアラートは、その
すべてのチャンネルに届きます。

## プロジェクトごとの上書き {#per-project-overrides}

Telegram はプロジェクトごとのチャットに対応しています。
[プロジェクト設定](/user-guide/projects/settings)で **Telegram Chat ID** を設定すると、
そのプロジェクトのアラートを、サーバー全体のチャットとは別のチャットに送れます。他の
チャンネルは、すべてのプロジェクトでサーバーの設定を使用します。

## ここから始める {#where-to-start}

まずチャンネルを 1 つ設定し、*Allow alerts for this project* をオンにして、**Test alerts**
を押してください。テストメッセージが届いたら、重要なテンプレートでアラートを有効にします。
