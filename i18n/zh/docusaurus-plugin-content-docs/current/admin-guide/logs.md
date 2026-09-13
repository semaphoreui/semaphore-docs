# 日志

Semaphore 将服务器日志写入 **stdout**，并将 **任务**（Task）日志和 **活动**（Activity）日志存储在 **数据库** 中，从而集中管理关键日志信息，无需单独备份日志文件。文件系统上仅存储缓存数据。

---

## 服务器日志 {#server-log}

Semaphore 不会将日志写入文件。所有应用日志都会写入 **stdout**。  
如果 Semaphore 以 systemd 服务的方式运行，您可以使用以下命令查看日志：

```bash
journalctl -u semaphore.service -f
```

如果 Semaphore 运行在 Docker 容器中，您可以使用以下命令查看日志：
```
docker logs -f my-semaphore-container
```

这将以实时（流式）方式显示日志。

---

## 活动日志 {#activity-log}

活动日志记录用户在 Semaphore 中执行的操作，包括：

- 添加或删除资源（例如模板、清单、仓库）。
- 添加或移除团队成员。

### Pro 2.10 及更高版本 {#pro-version-210-and-later}

**Semaphore Pro** 2.10+ 支持将活动日志和任务日志写入文件。要启用此功能，请在 `config.json` 中添加以下配置：

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


或者使用以下环境变量：

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### 活动（事件）日志选项 {#activity-events-logging-options}

活动（事件）日志选项用于配置 Semaphore 如何将用户操作和系统事件记录到文件。这些设置控制事件日志的行为，包括是否启用、日志条目的格式以及具体的日志记录器配置。启用后，创建模板、管理团队等用户操作将按照这些设置写入指定的日志文件。

| 参数                  | 环境变量              | 说明                  |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | 启用事件日志写入文件。 |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | 日志记录格式。留空表示原始格式，或设置为 `json`。 |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [日志记录器选项](#logger-options)。 |

#### 任务日志选项 {#tasks-logging-options}

任务日志选项用于配置 Semaphore 如何将任务执行详情记录到文件。这些设置控制与任务相关事件的日志记录，包括任务的启动、完成及其执行状态。启用后，所有任务操作及其结果将按照这些设置写入指定的日志文件，从而提供详细的任务执行历史审计记录。

| 参数                  | 环境变量              | 说明                  |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | 启用任务日志写入文件。 |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | 日志记录格式。留空表示原始格式，或设置为 `json`。 |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [日志记录器选项](#logger-options)。 |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | 日志记录器选项。 |



#### 日志记录器选项 {#logger-options}

| 参数                  | 类型 | 说明                  |
| --------------------- | ------- | --------------------- |
| `filename`     | 字符串  | 写入日志的文件路径和名称。备份日志文件会保留在同一目录中。若为空，则在临时目录中使用 `processname`-lumberjack.log。 |
| `maxsize`      | 整数 | 日志文件在轮转前的最大大小（MB）。默认为 100 MB。 |
| `maxage`       | 整数 | 根据文件名中编码的时间戳保留旧日志文件的最大天数。注意，一天定义为 24 小时，由于夏令时、闰秒等原因，可能与日历日不完全一致。默认不根据时间删除旧日志文件。 |
| `maxbackups`   | 整数 | 保留的旧日志文件的最大数量。默认保留所有旧日志文件（不过 MaxAge 仍可能导致它们被删除）。 |
| `localtime`    | 布尔值 | 决定备份文件时间戳格式化时使用的时间是否为计算机的本地时间。默认使用 UTC 时间。 |
| `compress`     | 布尔值 | 决定轮转后的日志文件是否使用 gzip 压缩。默认不压缩。 |



文件中的每一行都遵循以下格式：

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## 任务历史 {#task-history}

Semaphore 将任务执行信息存储在数据库中。任务历史提供所有已执行任务的详细视图，包括其状态和日志。您可以通过 Web 界面实时监控任务或查看历史日志。

### 配置任务保留策略 {#configuring-task-retention}

默认情况下，Semaphore 将所有任务存储在数据库中。如果您运行大量任务，它们可能会占用大量磁盘空间。

您可以通过以下任一方式配置每个模板保留的任务数量：

1. **环境变量**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **`config.json` 选项**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

当任务数量超过此限制时，最早的任务日志会被自动删除。

---

## Syslog 协议支持 {#syslog-protocol-support}

Semaphore 可以将活动日志和任务日志条目转发到外部 syslog 收集器，用于长期存储或集中监控。Syslog 转发默认处于禁用状态。

在 `config.json` 中配置 syslog 支持：

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

如果您不想编辑 JSON 文件，也可以通过环境变量设置相同的选项：

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Syslog 选项 {#syslog-options}

| 参数                  | 环境变量              | 说明                  |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | 开启或关闭 syslog 转发。 |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | 连接收集器所用的协议，例如 `udp` 或 `tcp`。 |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | 收集器地址，格式为 `host:port`。 |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | 可选标识符，会添加到每条消息的开头。 |


更改这些值后，请重启 Semaphore 服务，以使新的 syslog 目标生效。

---

## SIEM 集成 {#siem-integration}

Semaphore 2.20+ 会记录适合转发到 SIEM（Splunk、Elastic Security、QRadar、Wazuh 等）的安全审计记录。

每个审计事件除了包含执行操作的用户和受影响的对象外，还包含 **操作**（`create`、`update`、`delete`、`login_success`、`login_fail`、`logout`）、**客户端 IP 地址** 和 **用户代理**。除资源变更外，Semaphore 还会记录：

- 成功登录（密码、LDAP 和 OpenID）、登出、失败的登录尝试以及失败的 MFA 验证。
- 用户账户的创建、更新、删除和密码更改。
- API 令牌的创建和删除（仅记录令牌的短前缀，绝不记录密钥本身）。

有三种方式可将审计事件传送到您的 SIEM：

1. **拉取：** 读取 `/api/events`（参见 [API 文档](/reference/api)）。
2. **文件收集器：** 启用活动日志文件（Pro，见上文），并使用 Filebeat、Fluentd 或 Splunk Universal Forwarder 发送 `events.log`（推荐 JSON 格式）。
3. **审计 Webhook（Pro）：** 通过 HTTPS 实时推送事件——可推送到通用 JSON 端点或 Splunk HTTP Event Collector。

### 审计 Webhook {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### 审计 Webhook 选项 {#audit-webhook-options}

| 参数                  | 环境变量              | 说明                  |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | 开启或关闭审计事件转发。 |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | 接收端的完整端点 URL。 |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | 载荷格式：留空表示纯 JSON，或设置为 `splunk_hec` 以使用 Splunk HEC 封装格式。 |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | 额外的 HTTP 头，例如 HEC 令牌：`{"Authorization": "Splunk <token>"}`。 |

事件传送是异步的：事件会在内存中排队，并以退避策略最多重试三次，因此接收端不可用时绝不会拖慢用户请求或导致其失败。如果接收端持续不可用，排队的事件会被丢弃，并在服务器日志中记录一条警告。

## 小结 {#summary}

- **服务器日志：** 写入 stdout；在 systemd 下运行时可通过 `journalctl` 查看。  
- **活动日志和任务日志：** 跟踪所有用户操作。**Pro 2.10+** 可选择将其写入文件。  
- **任务历史：** 存储实时和历史的任务执行日志。可按模板配置保留策略。

遵循这些指南可以确保您对 Semaphore UI 的运行情况有充分的可见性，同时控制存储使用量和日志保留。
