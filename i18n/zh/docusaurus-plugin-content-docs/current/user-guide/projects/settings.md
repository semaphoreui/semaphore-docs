# 设置

项目仪表盘的 **Settings** 选项卡仅对项目（Project）**所有者（Owner）**可用。它包含项目的常规选项以及破坏性操作。

![项目设置](/assets/project-settings-general.webp)

## 常规 {#general}

| 字段 | 说明 |
|---|---|
| **Project Name** | 在项目切换器和告警中显示的名称。 |
| **Max number of parallel tasks** | 可选。此项目同时可运行的最大任务数。留空表示不限制。超出限制的任务会以 `waiting` 状态留在队列中，直到有空闲名额。 |
| **Telegram Chat ID** | 可选。把此项目的告警发送到与全局配置不同的 Telegram 聊天。请参阅 [Telegram 通知](/admin-guide/notifications/telegram#per-project-chat-ids)。 |
| **Allow alerts for this project** | 通知总开关。关闭后，即使服务器上配置了通知渠道，也不会有任何渠道发送关于此项目任务的告警。 |

**Test alerts** 会通过每个已配置的[通知渠道](/admin-guide/notifications)发送一条测试消息，让你无需运行任务即可验证服务器配置。**Save** 应用更改。

## 危险区域 {#danger-zone}

| 操作 | 效果 |
|---|---|
| **Backup project** | 下载包含项目定义的 JSON 文件：模板、清单、变量组、密钥（不含密钥值）、仓库、计划任务、视图和集成。可通过 **New Project → Restore project** 或 [`semaphore projects import`](/reference/cli/projects) 恢复。 |
| **Clear cache** | 删除服务器上该项目的所有缓存文件，例如已克隆的仓库。下一个任务会重新克隆仓库。此操作不可逆。 |
| **Delete project** | 删除项目及其所有资源和任务历史。无法撤销。 |

## 相关设置 {#related-settings}

- 成员和角色：[团队](../team)
- 附加到项目的运行器和运行器标签：[项目运行器](./runners)
- 通知渠道在服务器上配置：[通知](/admin-guide/notifications)
