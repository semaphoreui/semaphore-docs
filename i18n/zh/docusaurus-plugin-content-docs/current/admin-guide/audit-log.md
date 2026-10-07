---
title: 审计日志
description: 启用审计日志，查看谁在 Semaphore 中做了什么，并将审计事件从 Semaphore Pro 通过 Syslog 或 HEC 发送到 SIEM。
---

# 审计日志

审计日志记录 Semaphore 中的重要操作：谁登录了，谁修改了用户或角色，谁创建了 API 令牌。每个事件都会显示操作者、时间、来源地址以及操作是否成功。你可以用它来了解安装中发生了什么，也可以把事件发送到 SIEM，与其他日志放在一起。

所有版本都提供审计日志。将事件发送到 SIEM 需要 Semaphore Pro。

## 记录的内容 {#recorded-events}

目前 Semaphore 记录登录、账户、项目和任务活动：

- 登录、失败的登录尝试、注销和第二因素验证；
- 被拒绝的 API 令牌、被拒绝的请求和被阻止的跨站请求；
- 用户、密码、双因素认证、外部身份和 API 令牌的更改；
- 项目成员、角色和模板权限的更改；
- 项目、清单、代码仓库、模板、计划任务、集成、主机配置、环境、凭据和机密存储的更改，以及项目备份的导出和还原；
- 系统设置的更改和 Pro 许可证的激活；
- 任务启动及其触发方式(API、计划任务、集成、自动运行、工作流)、审批、停止、完成以及已删除的任务历史；
- 运行器的更改、注册(包括被拒绝的注册令牌)、取消注册，以及状态无效的运行器报告；
- 每次服务器启动。

完整列表请参阅 [审计事件](/reference/audit-events)。

密码、令牌、机密值和任务输出永远不会出现在审计事件中。API 令牌以指纹而不是其值显示。登录失败时会保留输入的登录名，因此其中可能包含电子邮件地址。

在任务的完成事件中，`metadata.result` 显示 Semaphore 给任务的状态，`metadata.end_reason` 说明 Semaphore 结束任务的原因：运行时间过长为 `timeout`，其运行器不再响应为 `runner_lost`。任务参数、变量、运行器标签和令牌不会被记录。

在 HA 集群滚动升级期间，在已升级的节点上启动、在尚未升级的节点上结束的任务没有完成事件。

代码仓库 URL、主机配置 URL 和集成别名同样不会被记录。

有时 Semaphore 已保存或删除某个对象，但同一请求的后续部分失败。此时界面或 API 会显示错误，但对象实际上已创建或已删除。这类事件记为成功，并带有 `metadata.partial=true`，`reason` 说明哪部分未完成：

- `secret_failed`：环境已保存或删除，但其部分机密未能保存或移除；
- `inventory_failed`：模板已创建，但其 Terraform 工作区清单未创建；
- `restore_failed`：项目已从备份还原，但其部分对象未还原；
- `setup_failed`：项目已创建，但未完全设置，例如其创建者未被添加为所有者。

## 启用审计日志 {#enable}

审计日志默认关闭。要启用它，请设置 `audit.enabled`，并在 `audit.instance_id` 中为你的安装命名：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

实例 ID 为 1 到 255 个不含空格的字符。它会添加到每个事件中，这样当多个安装向同一位置发送事件时，你也能区分它们。

重启 Semaphore。记录从重启后开始，之前的操作不会补录。所有选项请参阅 [配置选项](/reference/configuration#audit-log)。

## 在代理后记录客户端地址 {#trusted-proxies}

如果 Semaphore 运行在反向代理之后，事件中显示的是代理的地址而不是用户的地址。要记录真实的客户端地址，请在 `audit.trusted_proxy_cidrs` 中列出代理所在的网络：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

这样 Semaphore 会从 `X-Forwarded-For` 或 `X-Real-IP` 获取客户端地址，但仅限来自这些网络的请求。如果请求经过多个代理，请把它们全部列出。不要列出用户连接所在的网络：这些网络中的任何人都可以在这些请求头中填入任意地址。

## 存储 {#storage}

事件存储在 Semaphore 数据库中，因此常规的数据库备份会包含它们。Semaphore 不会在界面中显示审计事件。默认情况下，它会保留所有事件。若要删除旧事件，请以天为单位设置保留期限：

```json
{
  "audit": {
    "retention_days": 365
  }
}
```

也可以使用环境变量：`SEMAPHORE_AUDIT_RETENTION_DAYS=365`。

Semaphore 每小时删除一次较旧的事件，并记录一条 `audit.retention/delete` 事件，其中包含已删除事件的数量。如果你将事件导出到 SIEM，请选择比你希望扛过的最长 SIEM 中断时间更长的期限：早于该期限的事件即使尚未发送也会被删除。

保留期清理也会在 Semaphore 启动时运行。在 HA 部署中，所有节点请使用相同的 `retention_days`。

审计日志从不妨碍用户的操作。如果某个事件无法保存，Semaphore 会在服务器日志中写入错误，操作照常继续。

## 导出到 SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro 可以通过 TLS 将审计事件发送到 Syslog 接收器，例如 rsyslog 或 Vector，也可以发送到任何支持 Splunk HTTP Event Collector (HEC) 协议的接收器，例如 Splunk、Vector、Fluent Bit、OpenTelemetry Collector 或 Cribl。你可以分别设置一个 Syslog 目标和一个 HEC 目标，也可以同时设置两个。

你需要准备：

- 接收器的主机名和端口；
- 此目标的名称，例如 `security-syslog`；
- 接收器的 CA 证书（如果 Semaphore 主机尚未信任它）。

在 `config.json` 中添加 `audit.syslog`：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` 和 `address` 为必填项。Semaphore 会记住已经向每个目标发送了哪些事件，因此更改地址或证书时请保持相同的 `id`。新的 `id` 会从新事件开始发送。

Semaphore 始终验证接收器的证书，并使用 TLS 1.2 或更高版本。`ca_file` 将你的 CA 添加到受信任的证书中，`server_name` 在证书中要验证的名称与地址不同时指定该名称。

重启 Semaphore。如果设置无效或无法读取 CA 文件，Semaphore 将不会启动。

### 确认事件已送达 {#verify-siem-delivery}

Semaphore 每次启动时都会记录一个事件。重启后，在接收器中查找它：`event_code` 为 `audit.lifecycle`，`action` 为 `start`，`metadata.destinations` 中包含你的目标 ID。

### 通过 HEC 发送事件 {#hec}

你需要 HEC 端点 URL、HEC 令牌、此目标的名称（例如 `security-hec`），以及接收器的 CA 证书（如果 Semaphore 主机尚未信任它）。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "splunk_hec": {
      "id": "security-hec",
      "url": "https://splunk.example.com:8088/services/collector/event",
      "token": "<HEC token>",
      "index": "security",
      "ca_file": "/etc/semaphore/siem-ca.pem"
    }
  }
}
```

或使用环境变量：

```bash
SEMAPHORE_AUDIT_SPLUNK_HEC_ID=security-hec
SEMAPHORE_AUDIT_SPLUNK_HEC_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_SPLUNK_HEC_TOKEN='<HEC token>'
SEMAPHORE_AUDIT_SPLUNK_HEC_INDEX=security
SEMAPHORE_AUDIT_SPLUNK_HEC_CA_FILE=/etc/semaphore/siem-ca.pem
```

`id`、`url` 和 `token` 为必填项，URL 必须以 `https://` 开头。请使用与 Syslog 不同的 `id`。`source` 和 `sourcetype` 默认为 `semaphore` 和 `semaphore:audit`。证书的检查方式与 Syslog 相同，并且标准的 `HTTPS_PROXY` 和 `NO_PROXY` 变量同样适用。

Semaphore 每个请求最多发送 100 个事件。每个 HEC 事件的 `event` 字段包含审计事件 JSON，`time` 是事件时间，`host` 是 HA 节点 ID（单节点时为实例 ID）。

重启 Semaphore，然后按[上文](#verify-siem-delivery)所述确认事件已送达。

### 事件的投递方式 {#delivery}

- 如果接收器不可用，事件会在数据库中等待，待接收器恢复后再发送。用户不会察觉到任何变化。
- 在网络错误、重启或 HA 故障转移之后，部分事件可能会到达两次。使用 `event_id` 去除重复事件，使用 `seq` 排列事件顺序。
- 通过 Syslog 发送时，如果连接在没有报错的情况下中断，当时发送的事件可能会丢失。
- 在 [HA 安装](/admin-guide/ha) 中，同一时间只有一个节点向每个目标发送事件。如果 Redis 不可用，发送会暂停，但事件仍会继续记录。
- 通过 HEC 发送时，只有接收器返回 2xx 状态后，事件才算已发送。任何其他响应（包括 4xx）都会重试。如果接收器在响应后崩溃，尚未存储的事件可能会丢失。

通过 Syslog 发送时，每个事件都以 RFC 5424 Syslog 消息发送，消息正文为事件 JSON。`HOSTNAME` 是 HA 节点 ID（单节点时为实例 ID），`MSGID` 是事件代码。

以下示例是最简配置，仅演示如何接收事件。它们接受任何能访问该端口的客户端的连接。在生产环境中，请保护接收端，确保只有你的 Semaphore 服务器能向其发送事件。

### rsyslog 示例 {#rsyslog}

此 rsyslog 配置接受 TLS 连接，并每行写入一个事件：

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Vector 示例 {#vector}

此 Vector 配置接受 TLS 连接，读取事件 JSON 并写入文件：

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Vector HEC 示例 {#vector-hec}

```toml
[sources.semaphore_audit_hec]
type = "splunk_hec"
address = "0.0.0.0:8088"
valid_tokens = ["<HEC token>"]
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_hec"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Splunk 示例 {#splunk}

在 Splunk 中创建 HEC 令牌（**Settings → Data inputs → HTTP Event Collector**），允许它使用 `security` 索引，并将 `url` 设置为 `https://<splunk>:8088/services/collector/event`。要查找这些事件，请搜索 `index=security sourcetype="semaphore:audit"`。

请对此令牌关闭 **Enable indexer acknowledgement**：Semaphore 不使用它。

### 监控导出 {#monitor-export}

启用[指标](/admin-guide/metrics)后，Semaphore Pro 会为每个目标报告：

| 指标 | 含义 |
| --- | --- |
| `semaphore_audit_export_oldest_pending_seconds` | 尚未发送的最早事件的存在时长，全部发送完毕时为 0 |
| `semaphore_audit_export_pending_events` | 等待发送的事件数量 |
| `semaphore_audit_export_errors_total` | 发送失败的次数 |

`semaphore_audit_export_errors_total` 由发送的节点计数，因此请跨节点求和，例如 `sum by (destination) (increase(semaphore_audit_export_errors_total[15m]))`。

每个指标都带有 `destination` 标签，值为目标的 `id`。若要在 SIEM 停止接收事件时收到告警，请关注最早待发送事件的存在时长：

```yaml
- alert: SemaphoreAuditExportStalled
  expr: max by (destination) (semaphore_audit_export_oldest_pending_seconds) > 900
  for: 5m
```

### 导出故障排除 {#troubleshoot-export}

- **Semaphore 无法启动。** 检查是否同时设置了 `audit.syslog.id` 和 `audit.syslog.address`（使用 HEC 时为 `audit.splunk_hec.id`、`url` 和 `token`），以及 CA 文件是否包含 PEM 证书。
- **TLS 连接失败。** 检查接收器证书是否与 `server_name` 匹配，并由 Semaphore 信任的 CA 签发。
- **事件没有到达。** 检查 Semaphore 服务器日志和接收器日志。失败后，Semaphore 会稍等片刻再重试。
- **部分事件到达两次。** 这可能在重试和故障转移后发生。按 `event_id` 去除重复事件。
- **HEC 返回 400、401 或 403。** 检查令牌、其允许写入的索引，以及该令牌已关闭索引器确认。令牌不会出现在 Semaphore 日志中。

## 不记录的内容 {#not-recorded}

命令行工具 `semaphore` 直接操作数据库，因此 `user add`、`user token` 等命令不会被记录。

界面中的部分操作不会记录：移除许可证、应用设置、清除 HA 任务状态、Terraform 清单别名、删除 Terraform 状态、工作流运行和项目邀请。模板描述、视图、清除项目缓存和计划的机密存储同步同样不会记录。

## 后续步骤 {#whats-next}

- [审计事件](/reference/audit-events) — 事件格式以及所有记录的事件。
- [配置选项](/reference/configuration#audit-log) — 所有 `audit.*` 选项和环境变量。
- [日志](/admin-guide/logs) — 服务器日志、活动日志和任务日志。
